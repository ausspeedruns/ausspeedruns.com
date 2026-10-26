"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { DraftResponse, DraftState } from "#/utilities/schedule/types.ts";
import { ApiError, type ScheduleApi } from "./api.ts";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error" | "conflict";

const AUTOSAVE_DELAY_MS = 800;

/** Loads the event's draft and autosaves local edits, detecting edits made by other staff. */
export function useScheduleDraft(api: ScheduleApi | null) {
	const [data, setData] = useState<DraftResponse | null>(null);
	const [state, setState] = useState<DraftState | null>(null);
	const [loading, setLoading] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
	const [saveError, setSaveError] = useState<string | null>(null);
	const [users, setUsers] = useState<Map<string, string>>(new Map());

	const stateRef = useRef<DraftState | null>(null);
	const updatedAtRef = useRef<string | null>(null);
	const versionRef = useRef(0);
	const savedVersionRef = useRef(0);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const savingRef = useRef<Promise<void> | null>(null);

	const reload = useCallback(async () => {
		if (!api) return;
		if (timerRef.current) clearTimeout(timerRef.current);
		setLoading(true);
		setLoadError(null);
		try {
			const response = await api.load();
			const nextState: DraftState = {
				defaultSetupMinutes: response.draft.defaultSetupMinutes,
				rows: response.draft.rows,
				incentives: response.draft.incentives,
				blocks: response.draft.blocks ?? [],
			};
			setData(response);
			setState(nextState);
			stateRef.current = nextState;
			updatedAtRef.current = response.draft.updatedAt;
			versionRef.current = 0;
			savedVersionRef.current = 0;
			setSaveStatus("idle");
			setSaveError(null);
			setUsers(new Map(response.users.map((user) => [user.id, user.username])));
		} catch (error) {
			setLoadError(error instanceof Error ? error.message : "Failed to load the schedule.");
			setData(null);
			setState(null);
		} finally {
			setLoading(false);
		}
	}, [api]);

	useEffect(() => {
		setData(null);
		setState(null);
		void reload();
	}, [reload]);

	const save = useCallback(async (): Promise<boolean> => {
		if (!api || !stateRef.current) return false;
		const version = versionRef.current;
		setSaveStatus("saving");
		try {
			const result = await api.save(stateRef.current, updatedAtRef.current);
			updatedAtRef.current = result.updatedAt;
			savedVersionRef.current = version;
			setSaveStatus(versionRef.current === version ? "saved" : "dirty");
			setSaveError(null);
			return true;
		} catch (error) {
			if (error instanceof ApiError && error.status === 409) {
				setSaveStatus("conflict");
			} else {
				setSaveStatus("error");
			}
			setSaveError(error instanceof Error ? error.message : "Failed to save.");
			return false;
		}
	}, [api]);

	const scheduleSave = useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			timerRef.current = null;
			// Wait for any in-flight save so requests never race each other
			const previous = savingRef.current ?? Promise.resolve();
			savingRef.current = previous
				.then(() => (versionRef.current !== savedVersionRef.current ? save() : true))
				.then((ok) => {
					savingRef.current = null;
					if (ok && versionRef.current !== savedVersionRef.current) scheduleSave();
				});
		}, AUTOSAVE_DELAY_MS);
	}, [save]);

	const update = useCallback(
		(updater: (previous: DraftState) => DraftState) => {
			setState((previous) => {
				if (!previous) return previous;
				const next = updater(previous);
				stateRef.current = next;
				return next;
			});
			versionRef.current++;
			setSaveStatus((status) => (status === "conflict" ? status : "dirty"));
			scheduleSave();
		},
		[scheduleSave],
	);

	/** Saves any pending edits immediately. Call before server actions that read the draft. */
	const flush = useCallback(async () => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		if (savingRef.current) await savingRef.current;
		if (versionRef.current !== savedVersionRef.current && !(await save())) {
			throw new Error("Your latest changes could not be saved. Fix the save error first.");
		}
	}, [save]);

	const rememberUsers = useCallback((list: { id: string; username: string }[]) => {
		setUsers((previous) => {
			if (list.every((user) => previous.get(user.id) === user.username)) return previous;
			const next = new Map(previous);
			for (const user of list) next.set(user.id, user.username);
			return next;
		});
	}, []);

	useEffect(() => {
		const warn = (event: BeforeUnloadEvent) => {
			if (versionRef.current !== savedVersionRef.current) event.preventDefault();
		};
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, []);

	return {
		data,
		state,
		loading,
		loadError,
		saveStatus,
		saveError,
		users,
		reload,
		update,
		flush,
		rememberUsers,
	};
}

export type ScheduleDraftHook = ReturnType<typeof useScheduleDraft>;
