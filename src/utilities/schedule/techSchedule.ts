import type { PayloadRequest } from "payload";

import type { Event, Game, Incentive, Run, SegmentType, User } from "#/payload-types";
import { relationId } from "#access/helpers.ts";
import { sortChildren } from "#utilities/runs/medley.ts";
import { estimateToMs } from "./timing.ts";

/** Bump when making breaking changes to the response shape; graphics bundles should check it. */
export const TECH_SCHEDULE_VERSION = 1;

export interface TechRunner {
	id: string;
	username: string;
	name: string | null;
	pronouns: string | null;
	socials: User["socials"] | null;
}

export interface TechIncentive {
	id: number;
	title: string;
	type: Incentive["type"];
	isActive: boolean;
	description: string | null;
	data: Incentive["data"];
}

export interface TechItem {
	id: number;
	type: NonNullable<Run["type"]>;
	/** Display title: the game name for runs, the medley name for medleys, the label for everything else */
	title: string;
	segmentType: { id: number; name: string; slug: string } | null;
	game: {
		id: number;
		name: string;
		year: number | null;
		/** Stream layout name, if different (may contain line breaks) */
		displayName: string | null;
		aspectRatio: string | null;
	} | null;
	category: string | null;
	platform: string | null;
	techPlatform: string | null;
	/** HH:MM:SS. For medley games this is informational; they share the medley's slot. */
	estimate: string;
	estimateSeconds: number | null;
	/** ISO time. For medley games this is the expected start within the medley. */
	scheduledTime: string | null;
	isRace: boolean;
	isCoop: boolean;
	/** Runners, or presenters for segments. For medleys this is every runner across its games. */
	runners: TechRunner[];
	otherRunners: string[];
	specialRequirements: string | null;
	incentives: TechIncentive[];
	/** Position within the parent medley (medley games only) */
	order: number | null;
	/** Games in the medley, in order (medleys only; empty otherwise) */
	children: TechItem[];
}

export interface TechSchedule {
	version: typeof TECH_SCHEDULE_VERSION;
	generatedAt: string;
	event: {
		id: number;
		name: string;
		shortName: string;
		timezone: string;
		startTime: string | null;
		endTime: string | null;
		published: boolean;
	};
	items: TechItem[];
}

function toRunner(user: User): TechRunner {
	return {
		id: user.id,
		username: user.username,
		name: user.name ?? null,
		pronouns: user.pronouns ?? null,
		socials: user.socials ?? null,
	};
}

function toGame(game: Run["game"]): TechItem["game"] {
	if (!game || typeof game !== "object") return null;
	const value = game as Game;
	return {
		id: value.id,
		name: value.name,
		year: value.year ?? null,
		displayName: value.stream?.displayName ?? null,
		aspectRatio: value.stream?.aspectRatio ?? null,
	};
}

function title(run: Run): string {
	const type = run.type ?? "run";
	if (type === "run") return toGame(run.game)?.name ?? run.title ?? "";
	if (type === "medley") return run.category || run.title || "Medley";
	return run.title || run.category || "";
}

function toItem(run: Run, children: Run[], incentivesByRun: Map<number, Incentive[]>): TechItem {
	const segmentType = run.segmentType && typeof run.segmentType === "object" ? (run.segmentType as SegmentType) : null;

	return {
		id: run.id,
		type: run.type ?? "run",
		title: title(run),
		segmentType: segmentType ? { id: segmentType.id, name: segmentType.name, slug: segmentType.slug } : null,
		game: toGame(run.game),
		category: run.category ?? null,
		platform: run.platform ?? null,
		techPlatform: run.techPlatform ?? null,
		estimate: run.estimate,
		estimateSeconds: (() => {
			const ms = estimateToMs(run.estimate);
			return ms === null ? null : Math.round(ms / 1000);
		})(),
		scheduledTime: run.scheduledTime ?? null,
		isRace: Boolean(run.isRace),
		isCoop: Boolean(run.isCoop),
		runners: (run.runners ?? []).filter((runner): runner is User => typeof runner === "object").map(toRunner),
		otherRunners: (run.otherRunners ?? "")
			.split(",")
			.map((name) => name.trim())
			.filter(Boolean),
		specialRequirements: run.specialRequirements ?? null,
		incentives: (incentivesByRun.get(run.id) ?? []).map((incentive) => ({
			id: incentive.id,
			title: incentive.title,
			type: incentive.type,
			isActive: Boolean(incentive.isActive),
			description: incentive.description ?? null,
			data: incentive.data,
		})),
		order: run.parent ? (run.order ?? null) : null,
		children: children.map((child) => toItem(child, [], incentivesByRun)),
	};
}

/** Nests medley games under their medley and sorts the main schedule by time. */
export function buildTechSchedule(event: Event, runs: Run[], incentives: Incentive[], now = new Date()): TechSchedule {
	const incentivesByRun = new Map<number, Incentive[]>();
	for (const incentive of incentives) {
		const runId = relationId(incentive.run);
		if (runId !== null) incentivesByRun.set(runId, [...(incentivesByRun.get(runId) ?? []), incentive]);
	}

	const childrenByParent = new Map<number, Run[]>();
	for (const run of runs) {
		const parentId = relationId(run.parent);
		if (parentId !== null) childrenByParent.set(parentId, [...(childrenByParent.get(parentId) ?? []), run]);
	}

	const time = (run: Run) => (run.scheduledTime ? new Date(run.scheduledTime).getTime() : Number.POSITIVE_INFINITY);
	const items = runs
		.filter((run) => relationId(run.parent) === null)
		.sort((a, b) => time(a) - time(b))
		.map((run) => toItem(run, sortChildren(childrenByParent.get(run.id) ?? []), incentivesByRun));

	return {
		version: TECH_SCHEDULE_VERSION,
		generatedAt: now.toISOString(),
		event: {
			id: event.id,
			name: event.name,
			shortName: event.shortName,
			timezone: event.timeSettings?.timezone ?? "Australia/Melbourne",
			startTime: event.timeSettings?.startTime ?? null,
			endTime: event.timeSettings?.endTime ?? null,
			published: Boolean(event.scheduleMetadata?.published),
		},
		items,
	};
}

export async function loadTechSchedule(req: PayloadRequest, shortName: string): Promise<TechSchedule | null> {
	const event = (
		await req.payload.find({
			collection: "events",
			where: { shortName: { equals: shortName } },
			limit: 1,
			depth: 0,
			draft: true,
			overrideAccess: true,
			req,
		})
	).docs[0];
	if (!event) return null;

	const runs = await req.payload.find({
			collection: "runs",
			where: { event: { equals: event.id } },
			sort: "scheduledTime",
			depth: 1,
			pagination: false,
			overrideAccess: true,
			joins: false,
			populate: {
				games: { name: true, year: true, stream: true },
				users: { username: true, name: true, pronouns: true, socials: true },
				"segment-types": { name: true, slug: true },
				runs: { type: true },
			},
			req,
		});

	const incentives =
		runs.docs.length > 0
			? await req.payload.find({
					collection: "incentives",
					where: { run: { in: runs.docs.map((run) => run.id) } },
					depth: 0,
					pagination: false,
					overrideAccess: true,
					req,
				})
			: { docs: [] as Incentive[] };

	return buildTechSchedule(event, runs.docs, incentives.docs);
}
