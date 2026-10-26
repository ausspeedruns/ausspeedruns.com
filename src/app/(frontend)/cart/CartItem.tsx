"use client";

import Link from "next/link";
import { ActionIcon, Button, Skeleton, Text } from "@mantine/core";
import { Minus, Plus } from "pixelarticons/react";
import { Media } from "#components/Media/Media.tsx";
import { formatCents } from "#utilities/formatCents.ts";
import type { CartLine } from "./cartLines";

import styles from "./CartItem.module.css";

interface CartItemProps {
	line: CartLine;
	loading: boolean;
	onRemove: (id: string) => void;
	onUpdateQuantity: (id: string, quantity: number) => void;
}

export function CartItem({ line, loading, onRemove, onUpdateQuantity }: CartItemProps) {
	const { item, product, variantLabel, priceInCents, maxQuantity, missing, problem } = line;
	const href = product?.slug ? `/product/${product.slug}` : null;

	return (
		<li className={styles.row} data-problem={problem ? true : undefined}>
			<div className={styles.thumb}>
				{loading ? (
					<Skeleton width="100%" height="100%" radius={0} />
				) : product?.image ? (
					<Media fill resource={product.image} size="72px" />
				) : null}
			</div>

			<div className={styles.details}>
				{href ? (
					<Link href={href} className={styles.name}>
						{line.name}
					</Link>
				) : (
					<span className={styles.name}>{line.name}</span>
				)}
				{!missing && (
					<Text size="sm" c="dimmed">
						{variantLabel ? `${variantLabel} · ` : ""}
						{formatCents(priceInCents)} each
					</Text>
				)}
				{problem && (
					<Text size="sm" c="red">
						{problem}
					</Text>
				)}
				<Button
					variant="subtle"
					color="gray"
					size="compact-xs"
					ml={-8}
					onClick={() => onRemove(item.id)}
					aria-label={`Remove ${line.name} from cart`}
				>
					Remove
				</Button>
			</div>

			{!missing && (
				<>
					<div className={styles.stepper}>
						<ActionIcon
							aria-label={`Decrease quantity of ${line.name}`}
							disabled={item.quantity <= 1}
							variant="default"
							onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
						>
							<Minus width={14} height={14} />
						</ActionIcon>
						<span className={styles.quantity} aria-live="polite">
							{item.quantity}
						</span>
						<ActionIcon
							aria-label={`Increase quantity of ${line.name}`}
							disabled={item.quantity >= maxQuantity}
							variant="default"
							onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
						>
							<Plus width={14} height={14} />
						</ActionIcon>
					</div>

					<div className={styles.total}>{formatCents(priceInCents * item.quantity)}</div>
				</>
			)}
		</li>
	);
}
