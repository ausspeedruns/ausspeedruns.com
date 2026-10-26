import "server-only";
import type { Payload } from "payload";
import type { CheckoutResult } from "#actions/checkout.ts";
import { createReservedOrder, type ReservationItem } from "#utilities/payments/reservations.ts";

export async function bankCheckout(
	payload: Payload,
	userId: string,
	items: ReservationItem[],
): Promise<CheckoutResult> {
	try {
		// Load the bank details first so a failure here doesn't leave an order behind.
		const { bankTransfer } = await payload.findGlobal({ slug: "paymentSettings", depth: 0 });

		const result = await createReservedOrder(payload, { userId, purchaseType: "bankTransfer", items });
		if (!result.success) return result;

		const { order } = result;
		return {
			success: true,
			type: "bank",
			reference: order.reference!,
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
