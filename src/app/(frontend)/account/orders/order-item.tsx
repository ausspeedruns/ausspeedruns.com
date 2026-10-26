import type { Order } from "#payload-types.ts";
import { Text } from "@mantine/core";
import { Media } from "#components/Media/Media.tsx";
import { formatCents } from "#utilities/formatCents.ts";
import styles from "./order-item.module.css";

type OrderLine = NonNullable<Order["items"]>[number];

interface OrderItemProps {
	item: OrderLine;
}

function resolveProductName(item: OrderLine) {
	if (item.productName) return item.productName;
	if (item.product && typeof item.product === "object") return item.product.name;
	return "Unknown product";
}

function resolveProductImage(item: OrderLine) {
	if (!item.product || typeof item.product !== "object") return null;
	return item.product.images?.[0]?.image ?? null;
}

export function OrderItem({ item }: OrderItemProps) {
	const unitPriceInCents = item.unitPriceInCents ?? 0;
	const productName = resolveProductName(item);
	const productImage = resolveProductImage(item);

	return (
		<div className={styles.item}>
			<div className={styles.thumb}>
				{productImage && <Media resource={productImage} alt="" fill size="48px" />}
			</div>
			<div className={styles.details}>
				<Text fw={600}>{productName}</Text>
				{item.variantLabel && (
					<Text size="sm" c="dimmed">
						{item.variantLabel}
					</Text>
				)}
			</div>
			<div className={styles.pricing}>
				<Text size="sm" c="dimmed">
					{item.quantity} × {formatCents(unitPriceInCents)}
				</Text>
				<Text fw={600}>{formatCents(item.quantity * unitPriceInCents)}</Text>
			</div>
		</div>
	);
}
