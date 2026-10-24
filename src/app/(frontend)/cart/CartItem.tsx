"use client";

import type { Media as MediaType, Product } from "#/payload-types";
import type { CartItem as CartItemType } from "#stores/useCartStore.ts";
import { Media } from "#components/Media/Media.tsx";
import { ActionIcon, Badge, Card, Divider, Group, Paper, Skeleton, Stack, Text } from "@mantine/core";
import { Minus, Package, Plus, MemoryStick, Trash } from "pixelarticons/react";
import { useEffect, useState } from "react";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
	style: "currency",
	currency: "AUD",
});

function formatCurrency(amountInCents: number) {
	return currencyFormatter.format(amountInCents / 100);
}

interface CartItemProps {
	item: CartItemType;
	onRemove: (id: string) => void;
	onUpdateQuantity: (id: string, quantity: number) => void;
}

export function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch(`/api/products/${item.productId}?depth=1`)
			.then((res) => (res.ok ? res.json() : null))
			.then((data: Product | null) => setProduct(data))
			.catch(() => {})
			.finally(() => setLoading(false));
	}, [item.productId]);

	const lineTotalInCents = item.priceInCents * item.quantity;
	const productImage =
		product?.images && typeof product.images[0] === "object" ? (product.images[0].image as MediaType) : null;
	const productType = product?.type;

	return (
		<Card padding="lg" radius="lg" shadow="xs" withBorder>
			<Stack gap="md">
				<Group justify="space-between" align="flex-start" wrap="nowrap">
					<Group gap="sm" align="flex-start" style={{ flex: 1 }}>
						{loading ? (
							<Skeleton radius="md" style={{ width: 72, height: 72, flexShrink: 0 }} />
						) : productImage ? (
							<div
								style={{
									position: "relative",
									width: 72,
									height: 72,
									borderRadius: 8,
									overflow: "hidden",
									flexShrink: 0,
								}}
							>
								<Media fill resource={productImage} imgClassName="object-cover" />
							</div>
						) : null}

						<Stack gap={4} style={{ flex: 1 }}>
							{loading ? (
								<>
									<Skeleton height={16} width={64} radius="sm" />
									<Skeleton height={20} width={140} radius="sm" />
								</>
							) : (
								<>
									{productType && (
										<Badge
											size="sm"
											variant="light"
											leftSection={
												productType === "ticket" ? (
													<MemoryStick width={10} height={10} />
												) : (
													<Package width={10} height={10} />
												)
											}
										>
											{productType === "ticket" ? "Ticket" : "Merchandise"}
										</Badge>
									)}
									<Text fw={600}>{item.name}</Text>
								</>
							)}
						</Stack>
					</Group>

					<ActionIcon
						aria-label={`Remove ${item.name} from cart`}
						color="red"
						variant="subtle"
						onClick={() => onRemove(item.id)}
					>
						<Trash width={16} height={16} />
					</ActionIcon>
				</Group>

				<Divider />

				<Group justify="space-between" align="end" wrap="wrap">
					<Stack gap={6}>
						<Text c="dimmed" size="sm">
							Unit price
						</Text>
						<Text fw={700}>{formatCurrency(item.priceInCents)}</Text>
					</Stack>

					<Group gap="sm">
						<ActionIcon
							aria-label={`Decrease quantity for ${item.name}`}
							disabled={item.quantity <= 1}
							variant="default"
							onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
						>
							<Minus width={16} height={16} />
						</ActionIcon>
						<Paper px="md" py="xs" radius="md" withBorder>
							<Text fw={600} ta="center">
								{item.quantity}
							</Text>
						</Paper>
						<ActionIcon
							aria-label={`Increase quantity for ${item.name}`}
							variant="default"
							onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
						>
							<Plus width={16} height={16} />
						</ActionIcon>
					</Group>

					<Stack gap={6} align="flex-end">
						<Text c="dimmed" size="sm">
							Line total
						</Text>
						<Text fw={700}>{formatCurrency(lineTotalInCents)}</Text>
					</Stack>
				</Group>
			</Stack>
		</Card>
	);
}
