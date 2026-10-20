"use client";

import Link from "next/link";
import { Button } from "@mantine/core";
import { CalendarDays, HeartHandshake } from "lucide-react";
import styles from "./EventLiveBlock.module.css";

interface HeroActionsProps {
	donateUrl?: string | null;
	scheduleHref: string;
}

// Client component so Mantine's Button can render as a Next.js Link.
export function HeroActions({ donateUrl, scheduleHref }: HeroActionsProps) {
	const isExternal = donateUrl ? /^https?:\/\//.test(donateUrl) : false;

	return (
		<div className={styles.heroActions}>
			{donateUrl ? (
				<Button
					component={Link}
					href={donateUrl}
					{...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
					size="xl"
					className={styles.donateButton}
					leftSection={<HeartHandshake size={26} />}
				>
					Donate
				</Button>
			) : null}
			<Button
				component={Link}
				href={scheduleHref}
				size="lg"
				variant="white"
				color="dark"
				className={styles.scheduleButton}
				leftSection={<CalendarDays size={20} />}
			>
				Schedule
			</Button>
		</div>
	);
}
