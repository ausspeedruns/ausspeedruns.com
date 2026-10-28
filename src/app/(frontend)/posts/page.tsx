import type { Metadata } from "next/types";

import { CollectionArchive } from "#/components/CollectionArchive/CollectionArchive";
import { PageRange } from "#/components/PageRange/PageRange";
import { Pagination } from "#/components/Pagination/Pagination";
import configPromise from "#payload-config";
import { getPayload } from "payload";
import PageClient from "./page.client";

import styles from "./page.module.css";

export const dynamic = "force-static";
export const revalidate = 600;

export default async function Page() {
	const payload = await getPayload({ config: configPromise });

	const posts = await payload.find({
		collection: "posts",
		depth: 1,
		limit: 12,
		overrideAccess: false,
		select: {
			title: true,
			slug: true,
			categories: true,
			meta: true,
		},
	});

	return (
		<div className={styles.page}>
			<PageClient />
			<div className={`container ${styles.headerContainer}`}>
				<div className={styles.prose}>
					<h1>Posts</h1>
				</div>
			</div>

			<div className={`container ${styles.rangeContainer}`}>
				<PageRange collection="posts" currentPage={posts.page} limit={12} totalDocs={posts.totalDocs} />
			</div>

			<CollectionArchive posts={posts.docs} />

			<div className={`container ${styles.paginationContainer}`}>
				{posts.totalPages > 1 && posts.page && <Pagination page={posts.page} totalPages={posts.totalPages} />}
			</div>
		</div>
	);
}

export function generateMetadata(): Metadata {
	return {
		title: "Posts | AusSpeedruns",
	};
}
