"use client";
import { cn } from "#/utilities/ui";
import useClickableCard from "#/utilities/useClickableCard";
import Link from "next/link";
import React, { Fragment } from "react";

import type { Post } from "#/payload-types";

import { Media } from "#/components/Media";
import styles from "./index.module.css";

export type CardPostData = Pick<Post, "slug" | "categories" | "meta" | "title">;

interface CardProps {
	alignItems?: "center";
	className?: string;
	doc?: CardPostData;
	relationTo?: "posts";
	showCategories?: boolean;
	title?: string;
}

export function Card(props: CardProps) {
	const { card, link } = useClickableCard({});
	const { className, doc, relationTo, showCategories, title: titleFromProps } = props;

	const { slug, categories, meta, title } = doc || {};
	const { description, image: metaImage } = meta || {};

	const hasCategories = categories && Array.isArray(categories) && categories.length > 0;
	const titleToUse = titleFromProps || title;
	const sanitizedDescription = description?.replace(/\s/g, " "); // replace non-breaking space with white space
	const href = `/${relationTo}/${slug}`;

	return (
		<article className={cn(styles.card, className)} ref={card.ref}>
			<div className={styles.mediaWrapper}>
				{!metaImage && <div>No image</div>}
				{metaImage && typeof metaImage !== "string" && <Media resource={metaImage} size="33vw" />}
			</div>
			<div className={styles.content}>
				{showCategories && hasCategories && (
					<div className={styles.categories}>
						{showCategories && hasCategories && (
							<div>
								{categories?.map((category, index) => {
									if (typeof category === "object") {
										const { title: titleFromCategory } = category;

										const categoryTitle = titleFromCategory || "Untitled category";

										const isLast = index === categories.length - 1;

										return (
											<Fragment key={index}>
												{categoryTitle}
												{!isLast && <Fragment>, &nbsp;</Fragment>}
											</Fragment>
										);
									}

									return null;
								})}
							</div>
						)}
					</div>
				)}
				{titleToUse && (
					<div className={styles.titleWrapper}>
						<h3>
							<Link className={styles.titleLink} href={href} ref={link.ref}>
								{titleToUse}
							</Link>
						</h3>
					</div>
				)}
				{description && (
					<div className={styles.description}>{description && <p>{sanitizedDescription}</p>}</div>
				)}
			</div>
		</article>
	);
}
