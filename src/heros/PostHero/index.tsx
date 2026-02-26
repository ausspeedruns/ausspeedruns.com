import { formatDateTime } from "src/utilities/formatDateTime";

import type { Post } from "#/payload-types";

import { Media } from "#/components/Media";
import { formatAuthors } from "#/utilities/formatAuthors";
import { Fragment } from "react";

import styles from "./index.module.css";

export function PostHero({ post }: { post: Post }) {
	const { categories, heroImage, populatedAuthors, publishedAt, title } = post;

	const hasAuthors = populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== "";

	return (
		<div className={styles.hero}>
			<div className={`container ${styles.container}`}>
				<div className={styles.content}>
					<div className={styles.categories}>
						{categories?.map((category, index) => {
							if (typeof category === "object" && category !== null) {
								const { title: categoryTitle } = category;

								const titleToUse = categoryTitle || "Untitled category";

								const isLast = index === categories.length - 1;

								return (
									<Fragment key={index}>
										{titleToUse}
										{!isLast && <>, &nbsp;</>}
									</Fragment>
								);
							}
							return null;
						})}
					</div>

					<div>
						<h1 className={styles.title}>{title}</h1>
					</div>

					<div className={styles.meta}>
						{hasAuthors && (
							<div className={styles.metaItem}>
								<div className={styles.metaLabel}>
									<p className={styles.metaLabelText}>Author</p>

									<p>{formatAuthors(populatedAuthors)}</p>
								</div>
							</div>
						)}
						{publishedAt && (
							<div className={styles.metaLabel}>
								<p className={styles.metaLabelText}>Date Published</p>

								<time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
							</div>
						)}
					</div>
				</div>
			</div>
			<div className={styles.mediaContainer}>
				{heroImage && typeof heroImage !== "string" && (
					<Media fill priority imgClassName={styles.mediaImage} resource={heroImage} />
				)}
				<div className={styles.gradient} />
			</div>
		</div>
	);
}
