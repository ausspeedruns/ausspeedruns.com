import "server-only";
import type Stripe from "stripe";
import type { Payload } from "payload";
import type { CheckoutResult } from "#actions/checkout.ts";
import { createReservedOrder, type ReservationItem } from "#utilities/payments/reservations.ts";
import { getStripe, STRIPE_CURRENCY, STRIPE_SESSION_TTL_SECONDS } from "#utilities/payments/stripe.ts";
import { getServerSideURL } from "#utilities/getURL.ts";

export async function stripeCheckout(
	payload: Payload,
	user: { id: string; email: string; stripeCustomerId?: string | null },
	items: ReservationItem[],
): Promise<CheckoutResult> {
	const stripe = getStripe();

	const reservation = await createReservedOrder(payload, { userId: user.id, purchaseType: "stripe", items }).catch(
		(error: unknown) => {
			payload.logger.error({ err: error, message: "Error creating order for Stripe checkout" });
			return { success: false as const, error: "Error creating order. Please try again." };
		},
	);
	if (!reservation.success) return reservation;

	const { order } = reservation;
	let session: Stripe.Checkout.Session | null = null;

	try {
		// Get stripe customer ID, create if doesn't exist
		let stripeCustomerId = user.stripeCustomerId;
		if (!stripeCustomerId) {
			const customer = await stripe.customers.create(
				{ email: user.email, metadata: { userId: user.id } },
				{ idempotencyKey: `customer-${user.id}-${user.email}` },
			);
			stripeCustomerId = customer.id;

			await payload.update({
				collection: "users",
				id: user.id,
				overrideAccess: true,
				data: { stripeCustomerId },
			});
		}

		// Line items come from the order snapshot so the Stripe total always matches the order total.
		const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = (order.items ?? []).map((item) => ({
			price_data: {
				currency: STRIPE_CURRENCY,
				product_data: { name: `${item.productName} — ${item.variantLabel}` },
				unit_amount: item.unitPriceInCents ?? 0,
			},
			quantity: item.quantity,
		}));

		const metadata = { orderId: String(order.id), reference: order.reference! };
		session = await stripe.checkout.sessions.create(
			{
				mode: "payment",
				line_items: lineItems,
				client_reference_id: order.reference!,
				success_url: `${getServerSideURL()}/success?sessionId={CHECKOUT_SESSION_ID}`,
				cancel_url: `${getServerSideURL()}/cancel?sessionId={CHECKOUT_SESSION_ID}`,
				expires_at: Math.floor(Date.now() / 1000) + STRIPE_SESSION_TTL_SECONDS,
				metadata,
				payment_intent_data: { metadata },
				customer: stripeCustomerId,
			},
			{ idempotencyKey: `checkout-session-${order.id}` },
		);

		if (!session.url) {
			throw new Error(`Stripe session ${session.id} has no URL`);
		}

		await payload.update({
			collection: "orders",
			id: order.id,
			overrideAccess: true,
			data: { stripe: { sessionId: session.id } },
		});

		return { success: true, type: "stripe", url: session.url };
	} catch (error) {
		payload.logger.error({ err: error, orderId: order.id, message: "Error during Stripe checkout" });

		// Don't leave a payable session or an unpayable "Awaiting payment" order behind.
		if (session?.status === "open") {
			await stripe.checkout.sessions.expire(session.id).catch((expireError: unknown) => {
				payload.logger.error({
					err: expireError,
					sessionId: session?.id,
					message: "Could not expire Stripe session",
				});
			});
		}
		await payload
			.delete({ collection: "orders", id: order.id, overrideAccess: true })
			.catch((deleteError: unknown) => {
				payload.logger.error({
					err: deleteError,
					orderId: order.id,
					message: "Could not remove failed Stripe order",
				});
			});

		return { success: false, error: "An error occurred during checkout. Please try again." };
	}
}
