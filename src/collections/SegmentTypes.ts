import type { CollectionConfig } from "payload";

import { anyone } from "#access/anyone.ts";
import { manageContent } from "#access/manageContent.ts";
import { validateColour, validateUrlSafe } from "#fields/validators.ts";

/** Kinds of non-run schedule segments (speeches, news, ceremonies…). Add new ones here without code changes. */
export const SegmentTypes: CollectionConfig<"segment-types"> = {
	slug: "segment-types",
	labels: { singular: "Segment Type", plural: "Segment Types" },
	admin: {
		useAsTitle: "name",
		defaultColumns: ["name", "slug", "colour"],
		group: "Event Management",
	},
	access: {
		create: manageContent,
		delete: manageContent,
		read: anyone,
		update: manageContent,
	},
	defaultPopulate: {
		name: true,
		slug: true,
		colour: true,
		textColour: true,
	},
	fields: [
		{
			type: "row",
			fields: [
				{
					name: "name",
					type: "text",
					required: true,
					unique: true,
				},
				{
					name: "slug",
					type: "text",
					required: true,
					unique: true,
					index: true,
					validate: validateUrlSafe,
					admin: { description: "Stable identifier for graphics/tech, e.g. 'news'." },
				},
			],
		},
		{
			type: "row",
			fields: [
				{
					name: "colour",
					type: "text",
					validate: validateColour,
					admin: { description: "Background colour on the schedule, e.g. #CC7722." },
				},
				{
					name: "textColour",
					type: "text",
					validate: validateColour,
				},
			],
		},
		{
			name: "description",
			type: "textarea",
		},
	],
};
