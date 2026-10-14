import "server-only";
import { getPayload } from "payload";
import config from "#payload-config";
import type { Product } from "#payload-types.ts";
import type { CheckoutResult } from "#actions/checkout.ts";

export async function bankCheckout(
	userId: string,
	items: { quantity: number; product: Product; variant: Product["variants"][number] }[],
): Promise<CheckoutResult> {
	const payload = await getPayload({ config });

	if (items.some((item) => !item.product.payment?.allowBankTransfer)) {
		return { success: false, error: "Some products in your cart cannot be purchased via bank transfer." };
	}

	try {
		const { bankTransfer } = await payload.findGlobal({ slug: "paymentSettings", depth: 0 });

		const order = await payload.create({
			collection: "orders",
			overrideAccess: true,
			data: {
				user: userId,
				items: items.map((item) => ({
					product: item.product.id,
					productName: item.product.name,
					variantId: item.variant.id,
					variantLabel: item.variant.label,
					quantity: item.quantity,
					unitPriceInCents: item.variant.priceInCents,
				})),
				purchaseType: "bankTransfer",
				totalInCents: -1, // Will be calculated by hook
				status: "pending",
			},
		});

		if (!order.reference) {
			payload.logger.error({ orderId: order.id, message: "Order created without reference" });
			return { success: false, error: "Error creating order. Please try again." };
		}

		return {
			success: true,
			type: "bank",
			reference: order.reference,
			totalInCents: order.totalInCents,
			bankDetails: {
				accountName: bankTransfer?.accountName ?? "",
				bsb: bankTransfer?.bsb ?? "",
				accountNumber: bankTransfer?.accountNumber ?? "",
				instructions: bankTransfer?.instructions ?? null,
			},
		};
	} catch (error) {
		payload.logger.error({ err: error, message: "Error creating order for bank transfer checkout" });
		return { success: false, error: "An error occurred creating your order. Please try again." };
	}
}