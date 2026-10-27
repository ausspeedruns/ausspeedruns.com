import type { Metadata } from "next";

import { PayloadRedirects } from "#/components/PayloadRedirects/PayloadRedirects";
import configPromise from "#payload-config";
import { getPayload, type RequiredDataFromCollectionSlug } from "payload";
import { draftMode } from "next/headers";
import { permanentRedirect } from "next/navigation";
import { findCanonicalCase } from "#utilities/caseInsensitive.ts";
import React, { cache } from "react";
import { VisuallyHidden } from "@mantine/core";
import { homeStatic } from "#/collections/Pages/defaults/homeStatic";

import { RenderBlocks } from "#/blocks/RenderBlocks";
import { generateMeta } from "#/utilities/generateMeta";
import PageClient from "./page.client";
import { LivePreviewListener } from "#/components/LivePreviewListener/LivePreviewListener";

// Blocks pull live data (donation totals, product availability, event settings, latest posts) that changes without
// the page being republished, so regenerate the cached page at most a minute after it goes stale
export const revalidate = 60;

export async function generateStaticParams() {
	const payload = await getPayload({ config: configPromise });
	const pages = await payload.find({
		collection: "pages",
		draft: false,
		limit: 1000,
		overrideAccess: false,
		pagination: false,
		select: {
			slug: true,
		},
	});

	const params = pages.docs
		?.filter((doc) => {
			return doc.slug !== "home";
		})
		.map(({ slug }) => {
			return { slug };
		});

	return params;
}

type Args = {
	params: Promise<{
		slug?: string;
	}>;
};

export default async function Page({ params: paramsPromise }: Args) {
	const { isEnabled: draft } = await draftMode();
	const { slug = "home" } = await paramsPromise;
	// Decode to support slugs with special characters
	const decodedSlug = decodeURIComponent(slug);
	const url = "/" + decodedSlug;
	let page: RequiredDataFromCollectionSlug<"pages"> | null;

	page = await queryPageBySlug({
		slug: decodedSlug,
	});

	// Remove this code once your website is seeded
	if (!page && slug === "home") {
		page = homeStatic;
	}

	if (!page) {
		const canonical = await findCanonicalCase({
			payload: await getPayload({ config: configPromise }),
			collection: "pages",
			field: "slug",
			value: decodedSlug,
			draft,
			overrideAccess: draft,
		});
		if (canonical) permanentRedirect(canonical === "home" ? "/" : `/${encodeURIComponent(canonical)}`);

		return <PayloadRedirects url={url} />;
	}

	const { layout } = page;

	// Pages built only from blocks with h2 headings (e.g. the home page) would otherwise have no page-level heading
	const hasHeadingOne =
		layout?.some((block) => block.blockType === "eventHeroBlock") || JSON.stringify(layout).includes('"tag":"h1"');

	return (
		<main>
			<PageClient />
			{/* Allows redirects for valid pages too */}
			<PayloadRedirects disableNotFound url={url} />

			{draft && <LivePreviewListener />}

			{!hasHeadingOne && (
				<VisuallyHidden component="h1">{slug === "home" ? "AusSpeedruns" : page.title}</VisuallyHidden>
			)}

			<RenderBlocks blocks={layout} />
		</main>
	);
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
	const { slug = "home" } = await paramsPromise;
	// Decode to support slugs with special characters
	const decodedSlug = decodeURIComponent(slug);
	const page = await queryPageBySlug({
		slug: decodedSlug,
	});

	return generateMeta({ doc: page });
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
	const { isEnabled: draft } = await draftMode();

	const payload = await getPayload({ config: configPromise });

	const result = await payload.find({
		collection: "pages",
		draft,
		limit: 1,
		pagination: false,
		overrideAccess: draft,
		where: {
			slug: {
				equals: slug,
			},
		},
	});

	return result.docs?.[0] || null;
});
