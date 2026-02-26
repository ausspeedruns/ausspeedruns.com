import { MediaBlock } from "#/blocks/MediaBlock/MediaBlock";
import type {
	DefaultNodeTypes,
	SerializedBlockNode,
	SerializedLinkNode,
	DefaultTypedEditorState,
} from "@payloadcms/richtext-lexical";
import {
	type JSXConvertersFunction,
	LinkJSXConverter,
	RichText as ConvertRichText,
} from "@payloadcms/richtext-lexical/react";

import { CodeBlock, type CodeBlockProps } from "#/blocks/Code/CodeBlock";

import type {
	BannerBlock as BannerBlockProps,
	CallToActionBlock as CTABlockProps,
	MediaBlock as MediaBlockProps,
} from "#/payload-types";
import { BannerBlock } from "#/blocks/Banner/BannerBlock";
import { CallToActionBlock } from "#/blocks/CallToAction/CallToActionBlock";
import { cn } from "#/utilities/ui";

import styles from "./RichText.module.css";

type NodeTypes =
	| DefaultNodeTypes
	| SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps>;

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
	const { value, relationTo } = linkNode.fields.doc!;
	if (typeof value !== "object") {
		throw new Error("Expected value to be an object");
	}
	const slug = value.slug;
	return relationTo === "posts" ? `/posts/${slug}` : `/${slug}`;
};

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
	...defaultConverters,
	...LinkJSXConverter({ internalDocToHref }),
	blocks: {
		banner: ({ node }) => <BannerBlock className={styles.banner} {...node.fields} />,
		mediaBlock: ({ node }) => (
			<MediaBlock
				className={styles.mediaBlock}
				imgClassName={styles.mediaBlockImg}
				{...node.fields}
				captionClassName={styles.mediaBlockCaption}
				enableGutter={false}
				disableInnerContainer={true}
			/>
		),
		code: ({ node }) => <CodeBlock className={styles.code} {...node.fields} />,
		cta: ({ node }) => <CallToActionBlock {...node.fields} />,
	},
});

type Props = {
	data: DefaultTypedEditorState;
	enableGutter?: boolean;
	enableProse?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function RichText(props: Props) {
	const { className, enableProse = true, enableGutter = true, ...rest } = props;
	return (
		<ConvertRichText
			converters={jsxConverters}
			className={cn(
				{
					[styles.container]: enableGutter,
					[styles.maxWNone]: !enableGutter,
					[styles.prose]: enableProse,
				},
				className,
			)}
			{...rest}
		/>
	);
}
