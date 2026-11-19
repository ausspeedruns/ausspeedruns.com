import type { Block } from "payload";

export const MediaBlock: Block = {
	slug: "mediaBlock",
	imageURL: "/block-thumbnails/mediaBlock.webp",
	imageAltText: "Full-width image",
	interfaceName: "MediaBlock",
	fields: [
		{
			name: "media",
			type: "upload",
			relationTo: "media",
			required: true,
		},
	],
};
