"use client";

import { Button, type ButtonProps } from "@mantine/core";
import Link from "next/link";

interface ButtonLinkProps {
	children?: React.ReactNode;
	className?: string;
	href: string;
	newTab?: boolean | null;
	size?: ButtonProps["size"];
	variant?: ButtonProps["variant"];
}

// Client component so Mantine's Button can render as a Next.js Link (component props can't cross the server boundary).
export function ButtonLink({ children, className, href, newTab, size, variant }: ButtonLinkProps) {
	const newTabProps = newTab ? { rel: "noopener noreferrer", target: "_blank" } : {};

	return (
		<Button className={className} component={Link} href={href} size={size} variant={variant} {...newTabProps}>
			{children}
		</Button>
	);
}
