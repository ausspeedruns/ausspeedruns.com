import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Text } from "@mantine/core";

import configPromise from "#payload-config";
import { getPayload } from "payload";
import type { Media, Product } from "#/payload-types";
import { getMediaUrl } from "#/utilities/getMediaUrl";
import RichText from "#/components/RichText/RichText";
import { AddToCart } from "#components/AddToCart/AddToCart.tsx";
import { formatCents } from "#utilities/formatCents.ts";

import styles from "./page.module.css";

interface Props {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const payload = await getPayload({ config: configPromise });
	const result = await payload.find({
		collection: "products",
		where: { slug: { equals: slug } },
		limit: 1,
		overrideAccess: false,
		select: { name: true },
	});

	const product = result.docs[0];
	if (!product) return {};

	return { title: product.name };
}

export default async function ProductPage({ params }: Props) {
	const { slug } = await params;
	const payload = await getPayload({ config: configPromise });

	const result = await payload.find({
		collection: "products",
		where: { slug: { equals: slug } },
		depth: 1,
		limit: 1,
		overrideAccess: false,
	});

	const product = result.docs[0] as Product | undefined;
	if (!product) notFound();

	const firstImage = product.images?.[0]?.image;
	const image = firstImage && typeof firstImage === "object" ? (firstImage as Media) : null;
	const imageUrl = image?.url ? getMediaUrl(image.url) : null;

	const now = new Date();
	const isAvailable =
		(!product.availableFrom || new Date(product.availableFrom) <= now) &&
		(!product.availableUntil || new Date(product.availableUntil) >= now);

	const prices = product.variants.map((variant) => variant.priceInCents);
	const lowestPrice = Math.min(...prices);
	const hasPriceRange = prices.some((price) => price !== lowestPrice);

	return (
		<main className={`container ${styles.page}`}>
			<div className={styles.grid}>
				{imageUrl && (
					<div className={styles.imageWrapper}>
						<Image
							src={imageUrl}
							alt={image?.alt || product.name}
							fill
							sizes="(max-width: 768px) 100vw, 50vw"
							className={styles.image}
							priority
						/>
					</div>
				)}
				<div className={styles.details}>
					<div>
						<Text size="sm" c="dimmed" tt="uppercase" fw={600}>
							{product.type === "ticket" ? "Ticket" : "Merch"}
						</Text>
						<h1 className={styles.name}>{product.name}</h1>
						<p className={styles.price}>
							{hasPriceRange ? "From " : ""}
							{formatCents(lowestPrice)}
						</p>
					</div>
					{product.description && (
						<div className={styles.description}>
							<RichText data={product.description} enableGutter={false} />
						</div>
					)}
					<AddToCart
						product={{ id: product.id, name: product.name, payment: product.payment }}
						variants={product.variants}
						available={isAvailable}
					/>
				</div>
			</div>
		</main>
	);
}
