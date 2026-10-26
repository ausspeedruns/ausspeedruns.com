"use client";

import { createContext, useContext } from "react";

import type { TimedRow } from "#/utilities/schedule/timing.ts";
import type { DraftResponse, DraftRow, DraftState, SubmissionSummary } from "#/utilities/schedule/types.ts";
import type { ScheduleIssue } from "#/utilities/schedule/validation.ts";
import type { ScheduleApi } from "./api.ts";
import type { ScheduleDraftHook } from "./useScheduleDraft.ts";

/**
 * URL templates for links into the host CMS, so the app doesn't depend on any CMS's routes.
 * `{id}` and `{eventId}` are replaced. Omit a template to hide that link.
 */
export interface ScheduleLinks {
	user?: string;
	event?: string;
	runs?: string;
	incentives?: string;
}

export function fillLink(template: string | undefined, params: Record<string, string | number>): string | null {
	if (!template) return null;
	return template.replace(/\{(\w+)\}/g, (_, key: string) => encodeURIComponent(String(params[key] ?? "")));
}

export type StepId = "export" | "import" | "timing" | "incentives" | "blocks" | "pairing" | "apply";

export interface ScheduleContextValue {
	api: ScheduleApi;
	links: ScheduleLinks;
	data: DraftResponse;
	state: DraftState;
	update: ScheduleDraftHook["update"];
	flush: ScheduleDraftHook["flush"];
	reload: ScheduleDraftHook["reload"];
	users: Map<string, string>;
	rememberUsers: ScheduleDraftHook["rememberUsers"];
	timed: TimedRow<DraftRow>[];
	issues: ScheduleIssue[];
	submissionsById: Map<number, SubmissionSummary>;
	goToStep: (step: StepId) => void;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export const ScheduleProvider = ScheduleContext.Provider;

export function useSchedule(): ScheduleContextValue {
	const value = useContext(ScheduleContext);
	if (!value) throw new Error("useSchedule must be used inside ScheduleProvider");
	return value;
}

export function runnerNames(row: Pick<DraftRow, "runnerIds" | "otherRunners">, users: Map<string, string>): string[] {
	return [
		...row.runnerIds.map((id) => users.get(id) ?? "Unknown user"),
		...row.otherRunners
			.split(",")
			.map((name) => name.trim())
			.filter(Boolean),
	];
}
