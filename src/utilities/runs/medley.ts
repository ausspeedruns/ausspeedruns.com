import type { PayloadRequest } from "payload";

import type { Run } from "#/payload-types";
import { relationId } from "#access/helpers.ts";
import { estimateToMs } from "#utilities/schedule/timing.ts";

/** Set on `req.context` while syncing so the resulting updates don't trigger another sync. */
export const SKIP_MEDLEY_SYNC = "__skipMedleySync";

type ChildTiming = Pick<Run, "id" | "estimate" | "order">;

export function sortChildren<T extends Pick<Run, "id" | "order">>(children: T[]): T[] {
	return [...children].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id);
}

/** Expected start time of each child: parent start + estimates of the children before it. */
export function childStartTimes(parentStart: string | null | undefined, children: ChildTiming[]): Map<number, string | null> {
	const times = new Map<number, string | null>();
	let cursor = parentStart ? new Date(parentStart).getTime() : null;
	for (const child of sortChildren(children)) {
		times.set(child.id, cursor === null ? null : new Date(cursor).toISOString());
		if (cursor !== null) cursor += estimateToMs(child.estimate) ?? 0;
	}
	return times;
}

/** Union of the children's runners, in child order. */
export function unionRunners(children: Pick<Run, "runners" | "otherRunners">[]) {
	const runnerIds: string[] = [];
	const others: string[] = [];
	for (const child of children) {
		for (const runner of child.runners ?? []) {
			const id = relationId(runner);
			if (id && !runnerIds.includes(id)) runnerIds.push(id);
		}
		for (const name of (child.otherRunners ?? "").split(",").map((value) => value.trim())) {
			if (name && !others.some((other) => other.toLowerCase() === name.toLowerCase())) others.push(name);
		}
	}
	return { runnerIds, otherRunners: others.join(", ") };
}

const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every((id, i) => id === b[i]);

const sameTime = (a: string | null | undefined, b: string | null | undefined) =>
	(!a && !b) || (Boolean(a) && Boolean(b) && new Date(a as string).getTime() === new Date(b as string).getTime());

/**
 * Keeps a medley's children consistent with it: children inherit the event, get derived scheduled times,
 * and the medley's runners become the union of its children's runners (if it has any children).
 */
export async function syncMedley(req: PayloadRequest, parentId: number): Promise<void> {
	const parent = await req.payload
		.findByID({ collection: "runs", id: parentId, depth: 0, overrideAccess: true, req, joins: false })
		.catch(() => null);
	if (!parent || parent.type !== "medley") return;

	const children = (
		await req.payload.find({
			collection: "runs",
			where: { parent: { equals: parentId } },
			depth: 0,
			pagination: false,
			overrideAccess: true,
			select: { estimate: true, order: true, scheduledTime: true, event: true, runners: true, otherRunners: true },
			req,
		})
	).docs as Run[];

	const context = { ...req.context, [SKIP_MEDLEY_SYNC]: true };
	const starts = childStartTimes(parent.scheduledTime, children);
	const parentEvent = relationId(parent.event);

	for (const child of children) {
		const scheduledTime = starts.get(child.id) ?? null;
		if (sameTime(scheduledTime, child.scheduledTime) && relationId(child.event) === parentEvent) continue;

		await req.payload.update({
			collection: "runs",
			id: child.id,
			data: {
				scheduledTime,
				...(parent.scheduledTime_tz ? { scheduledTime_tz: parent.scheduledTime_tz } : {}),
				event: parentEvent,
			},
			depth: 0,
			overrideAccess: true,
			context,
			req,
		});
	}

	if (children.length === 0) return;

	const { runnerIds, otherRunners } = unionRunners(sortChildren(children));
	const currentIds = (parent.runners ?? []).map((runner) => relationId(runner) as string);
	if (sameIds(currentIds, runnerIds) && (parent.otherRunners ?? "") === otherRunners) return;

	await req.payload.update({
		collection: "runs",
		id: parent.id,
		data: { runners: runnerIds, otherRunners: otherRunners || null },
		depth: 0,
		overrideAccess: true,
		context,
		req,
	});
}
