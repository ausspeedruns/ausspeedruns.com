import type { Metadata } from "next/types";

import { CollectionArchive } from "#/components/CollectionArchive/CollectionArchive";
import { PageRange } from "#/components/PageRange/PageRange";
import { Pagination } from "#/components/Pagination/Pagination";
import configPromise from "#payload-config";
import { getPayload } from "payload";
import PageClient from "./page.client";
import { notFound } from "next/navigation";
import styles from "./page.module.css";

export const revalidate = 600;

type Args = {
	params: Promise<{
		pageNumber: string;
	}>;
};

export default async function Page({ params: paramsPromise }: Args) {
	const { pageNumber } = await paramsPromise;
	const payload = await getPayload({ config: configPromise });

	const sanitizedPageNumber = Number(pageNumber);

	if (!Number.isInteger(sanitizedPageNumber)) notFound();

	const posts = await payload.find({
		collection: "posts",
		depth: 1,
		limit: 12,
		page: sanitizedPageNumber,
		overrideAccess: false,
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
				{posts?.page && posts?.totalPages > 1 && <Pagination page={posts.page} totalPages={posts.totalPages} />}
			</div>
		</div>
	);
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
	const { pageNumber } = await paramsPromise;
	return {
		title: `Posts - Page ${pageNumber || ""} | AusSpeedruns`,
	};
}

export async function generateStaticParams() {
	const payload = await getPayload({ config: configPromise });
	const { totalDocs } = await payload.count({
		collection: "posts",
		overrideAccess: false,
	});

	const totalPages = Math.ceil(totalDocs / 10);

	const pages: { pageNumber: string }[] = [];

	for (let i = 1; i <= totalPages; i++) {
		pages.push({ pageNumber: String(i) });
	}

	return pages;
}
