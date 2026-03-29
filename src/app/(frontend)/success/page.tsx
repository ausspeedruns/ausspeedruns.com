import type { Metadata } from "next";
import Link from "next/link";

import styles from "./success.module.css";

export const metadata: Metadata = {
	title: "Purchase Received",
	description: "Stripe return page confirming the purchase was received.",
};

type SuccessPageProps = {
	searchParams: Promise<{
		sessionId?: string;
	}>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
	const { sessionId } = await searchParams;

	return (
		<main className={styles.page}>
			<section className={`container ${styles.shell}`}>
				<p className={styles.kicker}>Stripe checkout</p>
				<h1 className={styles.title}>Thanks, your purchase has been received.</h1>
				<p className={styles.subtitle}>
					This confirms Stripe sent you back to the site after payment. Final order confirmation and
					fulfillment are handled asynchronously by webhook.
				</p>

				{sessionId ? (
					<p className={styles.sessionId}>
						Checkout session: <span>{sessionId}</span>
					</p>
				) : (
					<p className={styles.note}>
						No checkout session ID was provided in the URL. If you were charged, your order should still be
						confirmed once the webhook is processed.
					</p>
				)}

				<div className={styles.actions}>
					<Link href="/" className={styles.primaryAction}>
						Back to home
					</Link>
					<Link href="/account/orders" className={styles.secondaryAction}>
						View my orders
					</Link>
				</div>
			</section>
		</main>
	);
}
