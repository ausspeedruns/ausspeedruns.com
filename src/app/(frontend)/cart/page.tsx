import type { Metadata } from "next";
import { CartPageClient } from "./CartPageClient";

export const metadata: Metadata = {
	title: "Cart",
	description: "Review the items in your cart before checkout.",
};

export default function CartPage() {
	return <CartPageClient />;
}
