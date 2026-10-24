import { cn } from "#/utilities/ui";
import Link from "next/link";
import type { ButtonProps } from "@mantine/core";

import type { Page, Post } from "#/payload-types";
import { ButtonLink } from "./ButtonLink";

type CMSLinkType = {
	appearance?: "inline" | "link" | "default" | "outline" | null;
	children?: React.ReactNode;
	className?: string;
	label?: string | null;
	newTab?: boolean | null;
	reference?: {
		relationTo: "pages" | "posts";
		value: Page | Post | string | number;
	} | null;
	size?: ButtonProps["size"] | null;
	type?: "custom" | "reference" | null;
	url?: string | null;
};

export function CMSLink(props: CMSLinkType) {
	const { type, appearance = "inline", children, className, label, newTab, reference, size, url } = props;

	const href =
		type === "reference" && typeof reference?.value === "object" && reference.value.slug
			? `${reference?.relationTo !== "pages" ? `/${reference?.relationTo}` : ""}/${reference.value.slug}`
			: url;

	if (!href) return null;

	const newTabProps = newTab ? { rel: "noopener noreferrer", target: "_blank" } : {};

	/* Ensure we don't break any styles set by richText */
	if (appearance === "inline" || appearance === "link") {
		return (
			<Link className={cn(className)} href={href} {...newTabProps}>
				{label}
				{children}
			</Link>
		);
	}

	return (
		<ButtonLink
			className={className}
			href={href}
			newTab={newTab}
			size={size ?? undefined}
			variant={appearance === "outline" ? "outline" : "filled"}
		>
			{label}
			{children}
		</ButtonLink>
	);
}
