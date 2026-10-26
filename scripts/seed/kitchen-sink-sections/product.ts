import { createLorem } from "../lorem.ts";
import { buildPlaceholder } from "./placeholder.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

export function buildKitchenSinkProductSections({ productIds }: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	if (productIds.length === 0) return [buildPlaceholder("Product Block", "products", "productBlock")];

	const lorem = createLorem(2001);

	return [
		{
			blockName: "Product Block: All Products, Description + Variants",
			demo: "Up to 6 products with descriptions, variant options and a custom purchase button label.",
			blockType: "productBlock",
			title: lorem.title(2),
			products: productIds.slice(0, 6),
			showDescription: true,
			showVariants: true,
			ctaLabel: lorem.title(3),
		},
		{
			blockName: "Product Block: Single Product, Minimal, Custom Button",
			demo: "One product with the description and variants hidden, and a custom purchase button label.",
			blockType: "productBlock",
			title: lorem.title(3),
			products: productIds.slice(0, 1),
			showDescription: false,
			showVariants: false,
			ctaLabel: lorem.title(2),
		},
	];
}
