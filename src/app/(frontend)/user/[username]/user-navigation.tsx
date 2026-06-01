"use client";

import { SimpleGrid, Button } from "@mantine/core";
import Link from "next/link";
import styles from "./page.module.css";
import { Box, MemoryStick, PenSquare } from "pixelarticons/react";

export function UserNavigation() {
	return (
		<SimpleGrid className={styles.actionGrid} cols={{ base: 2, sm: 3 }} spacing="xs">
			<Button
				component={Link}
				href="/account/edit"
				className={styles.primaryAction}
				leftSection={<PenSquare />}
			>
				Edit Profile
			</Button>
			<Button
				component={Link}
				href="/account/tickets"
				className={styles.secondaryAction}
				leftSection={<MemoryStick />}
				variant="default"
			>
				Tickets
			</Button>
			<Button
				component={Link}
				href="/account/orders"
				className={styles.secondaryAction}
				leftSection={<Box />}
				variant="default"
			>
				Orders
			</Button>
		</SimpleGrid>
	);
}
