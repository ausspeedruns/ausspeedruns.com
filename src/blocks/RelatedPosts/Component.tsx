import clsx from "clsx";
import RichText from "@/components/RichText";

import type { Post } from "@/payload-types";

import { Card } from "../../components/Card";
import { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

export type RelatedPostsProps = {
	className?: string;
	docs?: Post[];
	introContent?: DefaultTypedEditorState;
};

export function RelatedPosts(props: RelatedPostsProps) {
	const { className, docs, introContent } = props;

	return (
		<div className={clsx("lg:container", className)}>
			{introContent && <RichText data={introContent} enableGutter={false} />}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-stretch">
				{docs?.map((doc, index) => {
					if (typeof doc === "string") return null;

					return <Card key={index} doc={doc} relationTo="posts" showCategories />;
				})}
			</div>
		</div>
	);
}
