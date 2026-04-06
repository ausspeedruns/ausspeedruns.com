import "server-only";
import Stripe from "stripe";
import { getPayload } from "payload";
import config from "#payload-config";
import type { Product } from "#payload-types.ts";
import type { CheckoutResult } from "#actions/checkout.ts";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" });

export async function stripeCheckout(
	user: { id: string; email: string; stripeCustomerId?: string | null },
	items: { priceId: string; quantity: number; product: Product; variant: Product["variants"][number] }[],
): Promise<CheckoutResult> {
	const payload = await getPayload({ config });

	// Create line items
	const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
	const orderItems: any[] = [];

	for (const item of items) {
		lineItems.push({
			price_data: {
				currency: "aud",
				product_data: { name: `${item.product.name} — ${item.variant.label}` },
				unit_amount: item.variant.priceInCents,
			},
			quantity: item.quantity,
		});

		orderItems.push({
			product: item.product.id,
			variantLabel: item.variant.label,
			quantity: item.quantity,
			unitPriceInCents: item.variant.priceInCents,
		});
	}

	try {
		// Create order first (pending)
		const order = await payload.create({
			collection: "orders",
			data: {
				user: user.id,
				items: orderItems,
				purchaseType: "stripe",
				totalInCents: -1, // Will be updated by webhook
				status: "pending",
			},
		});

		if (!order.reference) {
			payload.logger.error({ orderId: order.id, message: "Order created without reference" });
			return { success: false, error: "Error creating order. Please try again." };
		}

		// Get stripe customer ID, create if doesn't exist
		let stripeCustomerId = user.stripeCustomerId;
		if (!stripeCustomerId) {
			const customer = await stripe.customers.create({
				email: user.email,
			});
			stripeCustomerId = customer.id;

			// Update user with stripe customer ID
			await payload.update({
				collection: "users",
				id: user.id,
				data: { stripeCustomerId },
			});
		}

		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			line_items: lineItems,
			client_reference_id: order.reference,
			success_url: `${process.env.NEXT_PUBLIC_URL}/success?sessionId={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel?sessionId={CHECKOUT_SESSION_ID}`,
			metadata: { orderId: order.id, reference: order.reference },
			customer: stripeCustomerId,
		});

		// Store session ID
		await payload.update({
			collection: "orders",
			id: order.id,
			data: { stripe: { sessionId: session.id, paymentIntentId: session.payment_intent?.toString() } },
		});

		if (!session.url) {
			return { success: false, error: "Failed to create payment session. Please try again." };
		}

		return { success: true, type: "stripe", url: session.url };
	} catch (error) {
		payload.logger.error({ err: error, message: "Error during Stripe checkout" });
		return { success: false, error: "An error occurred during checkout. Please try again." };
	}
}
