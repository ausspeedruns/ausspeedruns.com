import configPromise from "#payload-config";
import { Media } from "#/components/Media/Media";
import RichText from "#/components/RichText/RichText";
import type { Product, ProductBlock as ProductBlockProps } from "#/payload-types";
import { getPayload } from "payload";
import { ProductVariantActions } from "./ProductVariantActions.tsx";

import styles from "./ProductBlock.module.css";
import { ClientCarousel } from "#components/ClientCarousel/ClientCarousel.tsx";

function formatCents(priceInCents?: number | null): string {
	if (typeof priceInCents !== "number") return "$0.00";
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: "AUD",
	}).format(priceInCents / 100);
}

export async function ProductBlock(props: ProductBlockProps) {
	const { title, products, showDescription = true, showVariants = true, ctaLabel = "Buy with Stripe" } = props;
	const stripeLabel = ctaLabel ?? "Buy with Stripe";

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

	const currentTime = new Date().getTime();

	const productsToRender = [...selectedProducts, ...fetchedProducts].filter((product) =>
		product.availableUntil ? new Date(product.availableUntil).getTime() > currentTime : true,
	);

	if (productsToRender.length === 0) return null;

	return (
		<section className={styles.container}>
			{title && <h2 className={styles.title}>{title}</h2>}
			<div className={styles.grid}>
				{productsToRender.map((product) => (
					<article key={product.id} className={styles.card}>
						{product.images && (
							<ClientCarousel>
								{product.images.map((image, index) => (
									<Media
										key={index}
										resource={image.image}
										className={styles.media}
										imgClassName={styles.image}
										size="(max-width: 768px) 100vw, 50vw"
									/>
								))}
							</ClientCarousel>
						)}
						<div className={styles.content}>
							<div className={styles.headerRow}>
								<h3 className={styles.productName}>{product.name}</h3>
								{product.type && <span className={styles.typeTag}>{product.type}</span>}
							</div>

							{showDescription && product.description && (
								<RichText
									data={product.description}
									className={styles.description}
									enableGutter={false}
								/>
							)}

							{showVariants && !!product.variants?.length && (
								<ul className={styles.variantList}>
									{product.variants.map((variant, index) => (
										<li key={variant.id ?? `${product.id}-${index}`} className={styles.variantRow}>
											<div className={styles.variantMeta}>
												<span>{variant.label || "Default"}</span>
												<span>{formatCents(variant.priceInCents)}</span>
											</div>
											<ProductVariantActions
												productName={product.name || "Product"}
												variant={variant}
												ctaLabel={stripeLabel}
											/>
										</li>
									))}
								</ul>
							)}

							{!showVariants && !!product.variants?.[0] && (
								<ProductVariantActions
									productName={product.name || "Product"}
									variant={product.variants[0]}
									ctaLabel={stripeLabel}
								/>
							)}
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
