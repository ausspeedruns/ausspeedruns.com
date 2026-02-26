import clsx from "clsx";
import RichText from "#/components/RichText";

import type { Post } from "#/payload-types";

import { Card } from "../../components/Card";
import { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

import styles from "./Component.module.css";

export type RelatedPostsProps = {
	className?: string;
	docs?: Post[];
	introContent?: DefaultTypedEditorState;
};

export function RelatedPosts(props: RelatedPostsProps) {
	const { className, docs, introContent } = props;

	return (
		<div className={clsx(styles.container, className)}>
			{introContent && <RichText data={introContent} enableGutter={false} />}

			<div className={styles.grid}>
				{docs?.map((doc, index) => {
					if (typeof doc === "string") return null;

					return <Card key={index} doc={doc} relationTo="posts" showCategories />;
				})}
			</div>
		</div>
	);
}
