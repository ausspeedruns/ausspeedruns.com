import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "#payload-config";
import { CartPageClient } from "./CartPageClient";

export const metadata: Metadata = {
	title: "Cart",
	description: "Review the items in your cart before checkout.",
};

export default async function CartPage() {
	const payload = await getPayload({ config });
	const { user } = await payload.auth({ headers: await headers() });

	return <CartPageClient isLoggedIn={!!user} />;
}
