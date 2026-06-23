import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@mantine/core";

import configPromise from "#payload-config";
import { getPayload } from "payload";
import type { Media, Product } from "#/payload-types";
import { getMediaUrl } from "#/utilities/getMediaUrl";
import RichText from "#/components/RichText/RichText";
import ProductActions from "./ProductActions";

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

	const image = product.images ? (product.images[0].image as Media) : null;
	const imageUrl = getMediaUrl(image?.url);

	const now = new Date();
	const isAvailable =
		(!product.availableFrom || new Date(product.availableFrom) <= now) &&
		(!product.availableUntil || new Date(product.availableUntil) >= now);

	const lowestPrice = Math.min(...product.variants.map((v) => v.priceInCents));

	return (
		<main className={`container ${styles.page}`}>
			<div className={styles.grid}>
				{imageUrl && (
					<div className={styles.imageWrapper}>
						<Image
							src={imageUrl}
							alt={product.name}
							fill
							sizes="(max-width: 768px) 100vw, 50vw"
							className={styles.image}
							priority
						/>
					</div>
				)}
				<div className={styles.details}>
					<div>
						<h1 className={styles.name}>{product.name}</h1>
						<Badge variant="light" mt="xs">
							{product.type}
						</Badge>
					</div>
					<p className={styles.price}>
						{product.variants.length > 1 ? "From " : ""}${(lowestPrice / 100).toFixed(2)}
					</p>
					{product.description && (
						<div className={styles.description}>
							<RichText data={product.description} enableGutter={false} />
						</div>
					)}
					<ProductActions product={product} available={isAvailable} />
				</div>
			</div>
		</main>
	);
}
