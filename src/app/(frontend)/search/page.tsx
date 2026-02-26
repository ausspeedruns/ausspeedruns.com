import type { Metadata } from "next/types";

import { CollectionArchive } from "#/components/CollectionArchive/CollectionArchive";
import configPromise from "#payload-config";
import { getPayload } from "payload";
import { Search } from "#/search/Search";
import PageClient from "./page.client";
import type { CardPostData } from "#/components/Card/Card";

import styles from "./page.module.css";

type Args = {
	searchParams: Promise<{
		q: string;
	}>;
};
export default async function Page({ searchParams: searchParamsPromise }: Args) {
	const { q: query } = await searchParamsPromise;
	const payload = await getPayload({ config: configPromise });

	const posts = await payload.find({
		collection: "search",
		depth: 1,
		limit: 12,
		select: {
			title: true,
			slug: true,
			categories: true,
			meta: true,
		},
		// pagination: false reduces overhead if you don't need totalDocs
		pagination: false,
		...(query
			? {
					where: {
						or: [
							{
								title: {
									like: query,
								},
							},
							{
								"meta.description": {
									like: query,
								},
							},
							{
								"meta.title": {
									like: query,
								},
							},
							{
								slug: {
									like: query,
								},
							},
						],
					},
				}
			: {}),
	});

	return (
		<div className={styles.page}>
			<PageClient />
			<div className={`container ${styles.headerContainer}`}>
				<div className={styles.prose}>
					<h1 className={styles.title}>Search</h1>

					<div className={styles.searchContainer}>
						<Search />
					</div>
				</div>
			</div>

			{posts.totalDocs > 0 ? (
				<CollectionArchive posts={posts.docs as CardPostData[]} />
			) : (
				<div className={`container ${styles.noResults}`}>No results found.</div>
			)}
		</div>
	);
}

export function generateMetadata(): Metadata {
	return {
		title: `Payload Website Template Search`,
	};
}
