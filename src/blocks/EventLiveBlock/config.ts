import type { Block, Field } from "payload";

import { validateUrl } from "#fields/validators.ts";
import { toSafeRelativePath } from "#utilities/safeRedirect.ts";

/** Accepts an http(s) URL or a site-relative path such as /donate. */
const validateLink = (value: unknown): true | string => {
	if (typeof value === "string" && toSafeRelativePath(value)) return true;
	return validateUrl(value);
};

const sponsorTier = (name: string, label: string, description: string): Field => ({
	name,
	type: "array",
	label,
	labels: { singular: "Sponsor", plural: "Sponsors" },
	admin: { description },
	fields: [
		{
			type: "row",
			fields: [
				{ name: "logo", type: "upload", relationTo: "media", required: true },
				{ name: "name", type: "text", admin: { description: "Used as alt text. Defaults to the image alt." } },
				{ name: "url", type: "text", label: "Link", validate: validateLink },
			],
		},
	],
});

export const EventLiveBlockConfig: Block = {
	slug: "eventLiveBlock",
	imageURL: "/block-thumbnails/eventLiveBlock.webp",
	imageAltText: "Live event view with stream, chat and schedule",
	interfaceName: "EventLiveBlock",
	labels: {
		singular: "Event Live",
		plural: "Event Live",
	},
	fields: [
		{
			name: "event",
			type: "relationship",
			relationTo: "events",
			required: true,
			admin: { description: "Logo, dates, hero image, schedule and incentives are taken from this event." },
		},
		{
			type: "row",
			fields: [
				{
					name: "location",
					type: "text",
					admin: { description: "Shown next to the dates, e.g. 'Melbourne'." },
				},
				{
					name: "donateUrl",
					type: "text",
					label: "Donate URL",
					validate: validateLink,
					admin: { description: "Link for the Donate button. The button is hidden if empty." },
				},
			],
		},
		{
			name: "background",
			type: "group",
			admin: {
				description:
					"Runs behind the whole block. Falls back to the event's hero image, then to a patterned brand-colour background.",
			},
			fields: [
				{
					type: "row",
					fields: [
						{ name: "image", type: "upload", relationTo: "media" },
						{
							name: "mode",
							type: "select",
							defaultValue: "cover",
							options: [
								{ label: "Cover (one large image)", value: "cover" },
								{ label: "Tile (repeating pattern)", value: "tile" },
							],
						},
						{
							name: "tileSize",
							type: "number",
							min: 16,
							admin: {
								description: "Tile width in px. Leave blank to use the image's own size.",
								condition: (_, siblingData) => siblingData?.mode === "tile",
							},
						},
					],
				},
			],
		},
		sponsorTier("majorSponsors", "Major sponsors", "Shown large in the header, next to the event info."),
		sponsorTier("minorSponsors", "Minor sponsors", "Shown in a sponsor strip at the bottom of the block."),
	],
};
