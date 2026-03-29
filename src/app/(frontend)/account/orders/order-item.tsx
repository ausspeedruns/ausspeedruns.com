import type { Order } from "#payload-types.ts";
import { Group, Paper, Text, ThemeIcon } from "@mantine/core";
import { Boxes, ReceiptText, Tag } from "lucide-react";
import { Media } from "#components/Media/Media.tsx";
import styles from "./order-item.module.css";

interface OrderItemProps {
	item: NonNullable<Order["items"]>[number];
}

const currencyFormatter = new Intl.NumberFormat("en-AU", {
	style: "currency",
	currency: "AUD",
});

function resolveProductName(item: NonNullable<Order["items"]>[number]) {
	if (!item.product) return "Unknown product";
	if (typeof item.product === "number") return `Product #${item.product}`;
	return item.product.name;
}

function resolveProductImage(item: NonNullable<Order["items"]>[number]) {
	if (!item.product || typeof item.product === "number") return null;
	return item.product.image ?? null;
}

export function OrderItem(props: OrderItemProps) {
	const { item } = props;
	const lineTotalInCents = item.quantity * item.unitPriceInCents;
	const unitPriceText = currencyFormatter.format(item.unitPriceInCents / 100);
	const lineTotalText = currencyFormatter.format(lineTotalInCents / 100);
	const productName = resolveProductName(item);
	const productImage = resolveProductImage(item);

	return (
		<Paper withBorder radius="md" p="sm" className={styles.item}>
			<Group justify="space-between" align="center" wrap="wrap">
				<Group gap="sm" align="center" className={styles.leading}>
					<div className={styles.imageWrap}>
						{productImage ? (
							<Media
								resource={productImage}
								alt={`${productName} image`}
								imgClassName={styles.image}
								fill
							/>
						) : (
							<div className={styles.imageFallback}>
								<Boxes size={16} />
							</div>
						)}
					</div>
					<div>
						<Group gap={6}>
							<ThemeIcon color="blue" size="sm" variant="light">
								<Boxes size={14} />
							</ThemeIcon>
							<Text fw={600}>{productName}</Text>
						</Group>
						{item.variantLabel ? (
							<Group gap={6} mt={4}>
								<ThemeIcon color="grape" size="sm" variant="light">
									<Tag size={12} />
								</ThemeIcon>
								<Text size="sm" c="dimmed">
									{item.variantLabel}
								</Text>
							</Group>
						) : null}
					</div>
				</Group>

				<div className={styles.pricingBlock}>
					<Group gap={6} justify="flex-end">
						<ThemeIcon color="teal" size="sm" variant="light">
							<ReceiptText size={12} />
						</ThemeIcon>
						<Text size="sm" c="dimmed">
							{item.quantity} x {unitPriceText}
						</Text>
					</Group>
					<Text fw={700} ta="right">
						{lineTotalText}
					</Text>
				</div>
			</Group>
		</Paper>
	);
}
