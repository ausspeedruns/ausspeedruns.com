import { slugField } from "payload";
import type { CollectionConfig } from "payload";

import { manageContent } from "#access/manageContent.ts";
import { manageContentOrPublished } from "#access/manageContentOrPublished.ts";
import { Archive } from "#blocks/ArchiveBlock/config.ts";
import { CallToAction } from "#blocks/CallToAction/config.ts";
import { Content } from "#blocks/Content/config.ts";
import { FormBlock } from "#blocks/Form/config.ts";
import { MediaBlock } from "#blocks/MediaBlock/config.ts";
import { ImageCarousel } from "#blocks/ImageCarousel/ImageCarousel-config.ts";
import { EventImagesBlockConfig } from "#blocks/EventImagesBlock/config.ts";

import { EventHeroBlockConfig } from "#blocks/EventHeroBlock/config.ts";
import { LiveStreamBlockConfig } from "#blocks/LiveStreamBlock/config.ts";
import { DonationTrackerBlockConfig } from "#blocks/DonationTrackerBlock/config.ts";
import { SponsorGridBlockConfig } from "#blocks/SponsorGridBlock/config.ts";
import { CountdownBlockConfig } from "#blocks/CountdownBlock/config.ts";
import { FAQBlockConfig } from "#blocks/FAQBlock/config.ts";
import { ProductBlockConfig } from "#blocks/ProductBlock/product-block-config.ts";
import { PostEventStatsBlockConfig } from "#blocks/PostEventStatsBlock/config.ts";

import { populatePublishedAt } from "#hooks/populatePublishedAt.ts";
import { generatePreviewPath } from "#utilities/generatePreviewPath.ts";
import { revalidateDelete } from "./hooks/revalidatePage.ts";

import {
	MetaDescriptionField,
	MetaImageField,
	MetaTitleField,
	OverviewField,
	PreviewField,
} from "@payloadcms/plugin-seo/fields";
import { RandomRunBlockConfig } from "#blocks/RandomRunBlock/random-run-block-config.ts";
import { VodHighlightsBlockConfig } from "#blocks/VodHighlightsBlock/config.ts";

export const Pages: CollectionConfig<"pages"> = {
	slug: "pages",
	access: {
		create: manageContent,
		delete: manageContent,
		read: manageContentOrPublished,
		update: manageContent,
	},
	// This config controls what's populated by default when a page is referenced
	// https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
	// Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
	defaultPopulate: {
		title: true,
		slug: true,
	},
	admin: {
		defaultColumns: ["title", "slug", "updatedAt"],
		livePreview: {
			url: ({ data, req }) =>
				generatePreviewPath({
					slug: data?.slug,
					collection: "pages",
					req,
				}),
		},
		preview: (data, { req }) =>
			generatePreviewPath({
				slug: data?.slug as string,
				collection: "pages",
				req,
			}),
		useAsTitle: "title",
		group: "Content",
	},
	fields: [
		{
			name: "title",
			type: "text",
			required: true,
		},
		{
			type: "tabs",
			tabs: [
				{
					fields: [
						{
							name: "layout",
							type: "blocks",
							blocks: [
								CallToAction,
								Content,
								MediaBlock,
								Archive,
								FormBlock,
								ImageCarousel,
								EventImagesBlockConfig,
								EventHeroBlockConfig,
								LiveStreamBlockConfig,
								DonationTrackerBlockConfig,
								SponsorGridBlockConfig,
								CountdownBlockConfig,
								FAQBlockConfig,
								ProductBlockConfig,
								PostEventStatsBlockConfig,
								RandomRunBlockConfig,
								VodHighlightsBlockConfig,
							],
							required: true,
							admin: {
								initCollapsed: true,
							},
						},
					],
					label: "Content",
				},
				{
					name: "meta",
					label: "SEO",
					fields: [
						OverviewField({
							titlePath: "meta.title",
							descriptionPath: "meta.description",
							imagePath: "meta.image",
						}),
						MetaTitleField({
							hasGenerateFn: true,
						}),
						MetaImageField({
							relationTo: "media",
						}),

						MetaDescriptionField({}),
						PreviewField({
							// if the `generateUrl` function is configured
							hasGenerateFn: true,

							// field paths to match the target field for data
							titlePath: "meta.title",
							descriptionPath: "meta.description",
						}),
					],
				},
			],
		},
		{
			name: "publishedAt",
			type: "date",
			admin: {
				position: "sidebar",
			},
		},
		slugField(),
	],
	hooks: {
		// afterChange: [revalidatePage],
		beforeChange: [populatePublishedAt],
		afterDelete: [revalidateDelete],
	},
	versions: {
		drafts: {
			autosave: {
				interval: 100, // We set this interval for optimal live preview
			},
			schedulePublish: true,
		},
		maxPerDoc: 50,
	},
};
