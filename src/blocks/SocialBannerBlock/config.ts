import type { Block } from "payload";

export const SocialBannerBlockConfig: Block = {
	slug: "socialBannerBlock",
	imageURL: "/block-thumbnails/socialBannerBlock.webp",
	imageAltText: "Social channel call-out banner",
	interfaceName: "SocialBannerBlock",
	labels: {
		singular: "Social Banner",
		plural: "Social Banners",
	},
	fields: [
		{ name: "heading", type: "text", required: true, defaultValue: "Missed a run?" },
		{ name: "text", type: "textarea" },
		{
			type: "row",
			fields: [
				{ name: "buttonLabel", type: "text", required: true, defaultValue: "Watch on YouTube" },
				{ name: "url", type: "text", required: true },
			],
		},
		{
			name: "platform",
			type: "select",
			defaultValue: "youtube",
			options: [
				{ label: "YouTube", value: "youtube" },
				{ label: "Twitch", value: "twitch" },
				{ label: "Other", value: "other" },
			],
			admin: { description: "Sets the banner accent colour." },
		},
		{ name: "backgroundImage", type: "upload", relationTo: "media" },
	],
};
