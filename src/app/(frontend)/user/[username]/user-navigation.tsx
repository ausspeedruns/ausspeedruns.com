"use client";

import { SimpleGrid, Button } from "@mantine/core";
import Link from "next/link";
import { Box, MemoryStick, PenSquare } from "pixelarticons/react";

export function UserNavigation() {
	return (
		<SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs" mt="sm">
			<Button component={Link} href="/account/edit" leftSection={<PenSquare />}>
				Edit Profile
			</Button>
			<Button component={Link} href="/account/tickets" leftSection={<MemoryStick />} variant="default">
				Tickets
			</Button>
			<Button component={Link} href="/account/orders" leftSection={<Box />} variant="default">
				Orders
			</Button>
		</SimpleGrid>
	);
}