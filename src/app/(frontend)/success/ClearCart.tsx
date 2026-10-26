"use client";

import { useEffect } from "react";
import { useCartStore } from "#stores/useCartStore.ts";

export function ClearCart() {
	useEffect(() => {
		useCartStore.getState().clearCart();
	}, []);

	return null;
}
