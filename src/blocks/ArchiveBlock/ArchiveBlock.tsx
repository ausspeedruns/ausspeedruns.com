import type { Post, ArchiveBlock as ArchiveBlockProps } from "#/payload-types";

import configPromise from "#payload-config";
import { getPayload } from "payload";
import RichText from "#/components/RichText/RichText";

import { CollectionArchive } from "#/components/CollectionArchive/CollectionArchive";

import styles from "./ArchiveBlock.module.css";

export async function ArchiveBlock(props: ArchiveBlockProps & { id?: string }) {
	const { id, categories, introContent, limit: limitFromProps, populateBy, selectedDocs } = props;

	const limit = limitFromProps || 3;

	let posts: Post[] = [];

	if (populateBy === "collection") {
		const payload = await getPayload({ config: configPromise });

		const flattenedCategories = categories?.map((category) => {
			if (typeof category === "object") return category.id;
			else return category;
		});

		const fetchedPosts = await payload.find({
			collection: "posts",
			depth: 1,
			limit,
			...(flattenedCategories && flattenedCategories.length > 0
				? {
						where: {
							categories: {
								in: flattenedCategories,
							},
						},
					}
				: {}),
		});

		posts = fetchedPosts.docs;
	} else {
		if (selectedDocs?.length) {
			const filteredSelectedPosts = selectedDocs.map((post) => {
				if (typeof post.value === "object") return post.value;
			}) as Post[];

			posts = filteredSelectedPosts;
		}
	}

	return (
		<div className={styles.archiveBlock} id={`block-${id}`}>
			{introContent && (
				<div className={`container ${styles.introContainer}`}>
					<RichText className={styles.introContent} data={introContent} enableGutter={false} />
				</div>
			)}
			<CollectionArchive posts={posts} />
		</div>
	);
}
