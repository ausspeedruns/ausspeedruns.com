import type { Block } from "payload";

export const SponsorGridBlockConfig: Block = {
	slug: "sponsorGridBlock",
	imageURL: "/block-thumbnails/sponsorGridBlock.webp",
	imageAltText: "Grid of sponsor logos",
	interfaceName: "SponsorGridBlock",
	fields: [
		{ name: "title", type: "text", label: "Title", defaultValue: "Our Sponsors" },
		{
			name: "sponsors",
			type: "array",
			label: "Sponsors",
			fields: [
				{ name: "name", type: "text", required: true },
				{ name: "logo", type: "upload", relationTo: "media", required: true },
				{ name: "link", type: "text" },
			],
		},
	],
};
