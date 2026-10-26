import type { Block } from "payload";

export const ProductBlockConfig: Block = {
	slug: "productBlock",
	interfaceName: "ProductBlock",
	fields: [
		{
			name: "title",
			type: "text",
			label: "Title",
			defaultValue: "Products",
		},
		{
			name: "products",
			type: "relationship",
			relationTo: "products",
			hasMany: true,
			required: true,
			label: "Products",
		},
		{
			name: "showDescription",
			type: "checkbox",
			label: "Show Description",
			defaultValue: true,
		},
		{
			name: "showVariants",
			type: "checkbox",
			label: "Show Variants",
			defaultValue: true,
		},
		{
			name: "ctaLabel",
			type: "text",
			label: "Purchase Button Label",
			defaultValue: "Buy with Stripe",
		},
	],
};
