import type { CollectionBeforeValidateHook, CollectionConfig } from "payload";

import type { Incentive } from "#/payload-types";
import { anyone } from "#access/anyone.ts";
import { relationId } from "#access/helpers.ts";
import { manageContent } from "#access/manageContent.ts";
import { validateIncentiveData } from "#utilities/schedule/incentives.ts";

export { validateIncentiveData, type Goal, type War } from "#utilities/schedule/incentives.ts";

const prepareIncentive: CollectionBeforeValidateHook<Incentive> = async ({ data, req, originalDoc }) => {
	if (!data) return data;

	const type = data.type ?? originalDoc?.type;
	const currentData = data.data === undefined ? originalDoc?.data : data.data;
	if ((currentData === null || currentData === undefined) && type) {
		data.data = type === "goal" ? { goal: 0, current: 0 } : { options: [] };
	}

	// Derive the event from the run so incentives always show up on the event
	const runId = relationId(data.run ?? originalDoc?.run);
	const eventId = relationId(data.event ?? originalDoc?.event);
	if (runId !== null && eventId === null) {
		const run = await req.payload
			.findByID({ collection: "runs", id: runId, depth: 0, overrideAccess: true, req, select: { event: true } })
			.catch(() => null);
		const runEvent = relationId(run?.event);
		if (runEvent !== null) data.event = runEvent;
	}

	return data;
};

export const Incentives: CollectionConfig<"incentives"> = {
	slug: "incentives",
	admin: {
		useAsTitle: "title",
		defaultColumns: ["title", "type", "run", "event", "isActive"],
		group: "Event Management",
	},
	access: {
		create: manageContent,
		delete: manageContent,
		read: anyone,
		update: manageContent,
	},
	hooks: {
		beforeValidate: [prepareIncentive],
	},
	fields: [
		{
			name: "title",
			type: "text",
			required: true,
		},
		{
			type: "row",
			fields: [
				{
					name: "run",
					type: "relationship",
					relationTo: "runs",
					index: true,
				},
				{
					name: "event",
					type: "relationship",
					relationTo: "events",
					index: true,
					admin: { description: "Filled in from the run if left blank." },
				},
			],
		},
		{
			name: "type",
			type: "select",
			options: [
				{ label: "Goal", value: "goal" },
				{ label: "War", value: "war" },
			],
			required: true,
		},
		{
			name: "description",
			type: "textarea",
		},
		{
			name: "notes",
			type: "textarea",
			admin: { description: "Internal notes (public via the API — do not store anything sensitive)." },
		},
		{
			name: "isActive",
			type: "checkbox",
			defaultValue: true,
			index: true,
		},
		{
			name: "data",
			type: "json",
			validate: (value: unknown, { siblingData }: { siblingData: Partial<Incentive> }) =>
				validateIncentiveData(value, siblingData?.type),
			admin: {
				description: 'Goal: {"goal": 500, "current": 0}. War: {"options": [{"name": "Option A", "total": 0}]}',
			},
		},
	],
};
