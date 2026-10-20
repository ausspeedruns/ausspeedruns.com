"use client";

import { MantineProvider, mergeThemeOverrides } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useSyncExternalStore, type ReactNode } from "react";

import { theme } from "#/providers/MantineTheme";
import "./mantineStyles.ts";

type ColorScheme = "light" | "dark";

// Use the admin panel's font so Mantine blends in
const adminTheme = mergeThemeOverrides(theme, {
	fontFamily: "var(--font-body, inherit)",
	headings: { fontFamily: "var(--font-body, inherit)" },
});

/** Payload sets `data-theme` on <html>; follow it so Mantine matches the admin's light/dark mode. */
function subscribe(callback: () => void) {
	const observer = new MutationObserver(callback);
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
	return () => observer.disconnect();
}

function getAdminScheme(): ColorScheme {
	return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function PayloadMantineShell({ initialScheme, children }: { initialScheme: ColorScheme; children: ReactNode }) {
	const scheme = useSyncExternalStore(subscribe, getAdminScheme, () => initialScheme);

	return (
		<MantineProvider theme={adminTheme} forceColorScheme={scheme}>
			<Notifications position="bottom-right" zIndex={10000} />
			{children}
		</MantineProvider>
	);
}
