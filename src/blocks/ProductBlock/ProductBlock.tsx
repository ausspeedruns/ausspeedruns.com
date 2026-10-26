import Link from "next/link";
import configPromise from "#payload-config";
import { getPayload } from "payload";
import { Card, Text, Title } from "@mantine/core";
import { Media } from "#/components/Media/Media";
import RichText from "#/components/RichText/RichText";
import { ClientCarousel } from "#components/ClientCarousel/ClientCarousel.tsx";
import { AddToCart } from "#components/AddToCart/AddToCart.tsx";
import type { Product, ProductBlock as ProductBlockProps } from "#/payload-types";
import { formatCents } from "#utilities/formatCents.ts";

import styles from "./ProductBlock.module.css";

function priceLabel(variants: Product["variants"]) {
	const prices = variants.map((variant) => variant.priceInCents);
	if (prices.length === 0) return null;
	const lowest = Math.min(...prices);
	return prices.some((price) => price !== lowest) ? `From ${formatCents(lowest)}` : formatCents(lowest);
}

export async function ProductBlock(props: ProductBlockProps) {
	const { title, products, showDescription = true, showVariants = true } = props;

	if (!products?.length) return null;

	const selectedProducts = products.filter(
		(product): product is Product => typeof product === "object" && product !== null,
	);

	const selectedProductIds = products
		.filter((product): product is number => typeof product === "string" || typeof product === "number")
		.map((product) => String(product));

	let fetchedProducts: Product[] = [];

	if (selectedProductIds.length > 0) {
		const payload = await getPayload({ config: configPromise });
		const result = await payload.find({
			collection: "products",
			depth: 1,
			limit: selectedProductIds.length,
			where: {
				id: {
					in: selectedProductIds,
				},
			},
		});

		fetchedProducts = result.docs as Product[];
	}

	const now = Date.now();

	const productsToRender = [...selectedProducts, ...fetchedProducts].filter(
		(product) =>
			(!product.availableFrom || new Date(product.availableFrom).getTime() <= now) &&
			(!product.availableUntil || new Date(product.availableUntil).getTime() > now),
	);

	if (productsToRender.length === 0) return null;

	return (
		<section className="container">
			{title && (
				<Title order={2} mb="lg" ta="center">
					{title}
				</Title>
			)}
			<div className={styles.grid}>
				{productsToRender.map((product) => {
					const variants = showVariants ? product.variants : product.variants.slice(0, 1);
					const href = product.slug ? `/product/${product.slug}` : null;

					return (
						<Card key={product.id} component="article" withBorder padding="lg" className={styles.card}>
							{!!product.images?.length && (
								<div className={styles.media}>
									<ClientCarousel>
										{product.images.map((image, index) => (
											<Media
												key={image.id ?? index}
												resource={image.image}
												imgClassName={styles.image}
												size="(max-width: 768px) 100vw, 33vw"
											/>
										))}
									</ClientCarousel>
								</div>
							)}

							<div className={styles.content}>
								<div>
									<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
										{product.type === "ticket" ? "Ticket" : "Merch"}
									</Text>
									<Title order={3} size="h4">
										{href ? (
											<Link href={href} className={styles.nameLink}>
												{product.name}
											</Link>
										) : (
											product.name
										)}
									</Title>
									<Text fw={600} mt={4}>
										{priceLabel(variants)}
									</Text>
								</div>

								{showDescription && product.description && (
									<RichText
										data={product.description}
										className={styles.description}
										enableGutter={false}
									/>
								)}

								<div className={styles.actions}>
									<AddToCart
										product={{ id: product.id, name: product.name, payment: product.payment }}
										variants={variants}
									/>
								</div>
							</div>
						</Card>
					);
				})}
			</div>
		</section>
	);
}
