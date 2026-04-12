import configPromise from "#payload-config";
import { Media } from "#/components/Media/Media";
import RichText from "#/components/RichText/RichText";
import type { Media as MediaType } from "#/payload-types";
import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";
import { getPayload } from "payload";
import { ProductVariantActions } from "./ProductVariantActions.tsx";

import styles from "./ProductBlock.module.css";

type ProductVariant = {
	id?: string;
	label?: string | null;
	priceInCents?: number | null;
	stock?: number | null;
	stripePriceId?: string | null;
	bankTransferDetails?: {
		allowBankTransfer?: boolean | null;
	} | null;
};

type ProductItem = {
	id: string | number;
	name?: string | null;
	slug?: string | null;
	type?: "ticket" | "merchandise" | null;
	description?: DefaultTypedEditorState | null;
	image?: MediaType | string | number | null;
	variants?: ProductVariant[] | null;
	active?: boolean | null;
};

type ProductReference = string | number | ProductItem;

type ProductBlockProps = {
	title?: string | null;
	products?: ProductReference[] | null;
	showDescription?: boolean | null;
	showVariants?: boolean | null;
	ctaLabel?: string | null;
};

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
		(product): product is ProductItem => typeof product === "object" && product !== null,
	);

	const selectedProductIds = products
		.filter((product): product is string | number => typeof product === "string" || typeof product === "number")
		.map((product) => String(product));

	let fetchedProducts: ProductItem[] = [];

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

		fetchedProducts = result.docs as ProductItem[];
	}

	const productsToRender = [...selectedProducts, ...fetchedProducts].filter((product) => product.active !== false);

	if (productsToRender.length === 0) return null;

	return (
		<section className={styles.container}>
			{title && <h2 className={styles.title}>{title}</h2>}
			<div className={styles.grid}>
				{productsToRender.map((product) => (
					<article key={product.id} className={styles.card}>
						{product.image && (
							<Media
								resource={product.image}
								className={styles.media}
								imgClassName={styles.image}
								size="(max-width: 768px) 100vw, 50vw"
							/>
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
