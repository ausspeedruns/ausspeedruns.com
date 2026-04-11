"use client";

import { SimpleGrid, Button } from "@mantine/core";
import { Edit3, Timer, Ticket, Package } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

export function UserNavigation() {
	return (
		<SimpleGrid className={styles.actionGrid} cols={{ base: 2, sm: 4 }} spacing="xs">
			<Button component={Link} href="/account/edit" className={styles.primaryAction} leftSection={<Edit3 size={14} />}>
				Edit Profile
			</Button>
			<Button component={Link} href="/account/runs" className={styles.secondaryAction} leftSection={<Timer size={14} />} variant="default">
				My Runs
			</Button>
			<Button component={Link} href="/account/tickets" className={styles.secondaryAction} leftSection={<Ticket size={14} />} variant="default">
				Tickets
			</Button>
			<Button
				component={Link}
				href="/account/orders"
				className={styles.secondaryAction}
				leftSection={<Package size={14} />}
				variant="default"
			>
				Orders
			</Button>
		</SimpleGrid>
	);
}
