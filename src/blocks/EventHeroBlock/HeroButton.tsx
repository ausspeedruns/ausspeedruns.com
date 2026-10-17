"use client";

import Link from "next/link";
import { Button } from "@mantine/core";

interface HeroButtonProps {
	label: string;
	url: string;
	primary?: boolean;
}

// Client component so Mantine's Button can render as a Next.js Link (component props can't cross the server boundary).
export function HeroButton({ label, url, primary }: HeroButtonProps) {
	const variant = primary ? "filled" : "default";

	if (/^https?:\/\//.test(url)) {
		return (
			<Button component="a" href={url} target="_blank" rel="noopener noreferrer" variant={variant} size="md">
				{label}
			</Button>
		);
	}

	return (
		<Button component={Link} href={url} variant={variant} size="md">
			{label}
		</Button>
	);
}
