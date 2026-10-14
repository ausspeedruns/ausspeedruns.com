import { formBuilderPlugin } from "@payloadcms/plugin-form-builder";
import { nestedDocsPlugin } from "@payloadcms/plugin-nested-docs";
import { redirectsPlugin } from "@payloadcms/plugin-redirects";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { searchPlugin } from "@payloadcms/plugin-search";
import type { Plugin } from "payload";
import { revalidateRedirects } from "#hooks/revalidateRedirects.ts";
import type { GenerateTitle, GenerateURL } from "@payloadcms/plugin-seo/types";
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from "@payloadcms/richtext-lexical";
import { searchFields } from "#search/fieldOverrides.ts";
import { beforeSyncWithSearch } from "#search/beforeSync.ts";

import type { Access } from "payload";

import { manageContent } from "#access/manageContent.ts";
import type { Page, Post } from "#payload-types.ts";
import { getServerSideURL } from "#utilities/getURL.ts";

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
	return doc?.title ? `${doc.title} | AusSpeedruns` : "AusSpeedruns";
};

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
	const url = getServerSideURL();

	return doc?.slug ? `${url}/${doc.slug}` : url;
};

/** Plugin collections default to allowing any logged-in user; lock them to content managers. */
const contentManagedAccess: { create: Access; read: Access; update: Access; delete: Access } = {
	create: manageContent,
	read: () => true,
	update: manageContent,
	delete: manageContent,
};

export const plugins: Plugin[] = [
	redirectsPlugin({
		collections: ["pages", "posts"],
		overrides: {
			access: contentManagedAccess,
			admin: { group: "Content" },
			// @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
			fields: ({ defaultFields }) => {
				return defaultFields.map((field) => {
					if ("name" in field && field.name === "from") {
						return {
							...field,
							admin: {
								description: "You will need to rebuild the website when changing this field.",
							},
						};
					}
					return field;
				});
			},
			hooks: {
				afterChange: [revalidateRedirects],
			},
		},
	}),
	nestedDocsPlugin({
		collections: ["categories"],
		generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ""),
	}),
	seoPlugin({
		generateTitle,
		generateURL,
	}),
	formBuilderPlugin({
		fields: {
			payment: false,
		},
		formSubmissionOverrides: {
			access: {
				...contentManagedAccess,
				// Anyone can submit a public form, but only staff can read the responses
				create: () => true,
				read: manageContent,
			},
			admin: { group: "Content" },
		},
		formOverrides: {
			access: contentManagedAccess,
			admin: { group: "Content" },
			fields: ({ defaultFields }) => {
				return defaultFields.map((field) => {
					if ("name" in field && field.name === "confirmationMessage") {
						return {
							...field,
							editor: lexicalEditor({
								features: ({ rootFeatures }) => {
									return [
										...rootFeatures,
										FixedToolbarFeature(),
										HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
									];
								},
							}),
						};
					}
					return field;
				});
			},
		},
	}),
	searchPlugin({
		collections: ["posts"],
		beforeSync: beforeSyncWithSearch,
		searchOverrides: {
			access: contentManagedAccess,
			admin: { group: "Content" },
			fields: ({ defaultFields }) => {
				return [...defaultFields, ...searchFields];
			},
		},
	}),
];
