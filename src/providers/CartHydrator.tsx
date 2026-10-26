"use client";

import { useEffect } from "react";
import { CART_STORAGE_KEY, useCartStore } from "#stores/useCartStore.ts";

/** Loads the saved cart after the first render and keeps it in sync with other open tabs. */
export function CartHydrator() {
	useEffect(() => {
		void useCartStore.persist.rehydrate();

		function handleStorage(event: StorageEvent) {
			if (event.key === CART_STORAGE_KEY || event.key === null) {
				void useCartStore.persist.rehydrate();
			}
		}

		window.addEventListener("storage", handleStorage);
		return () => window.removeEventListener("storage", handleStorage);
	}, []);

	return null;
}
