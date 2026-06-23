import "server-only";
import { getPayload } from "payload";
import config from "#payload-config";
import type { Product } from "#payload-types.ts";
import type { CheckoutResult } from "#actions/checkout.ts";

export async function bankCheckout(
	userId: string,
	items: { priceId: string; quantity: number; product: Product; variant: Product["variants"][number] }[],
): Promise<CheckoutResult> {
	const payload = await getPayload({ config });

	if (items.some((item) => !item.variant.bankTransferDetails?.allowBankTransfer)) {
		return { success: false, error: "Some products in your cart cannot be purchased via bank transfer." };
	}

	try {
		const order = await payload.create({
			collection: "orders",
			data: {
				user: userId,
				items: items.map((item) => ({
					product: item.product.id,
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

		return { success: true, type: "bank", reference: order.reference };
	} catch (error) {
		payload.logger.error({ err: error, message: "Error creating order for bank transfer checkout" });
		return { success: false, error: "An error occurred creating your order. Please try again." };
	}
}
