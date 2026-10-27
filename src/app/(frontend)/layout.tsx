import "./globals.css";
import type { Metadata } from "next";

import { ColorSchemeScript } from "@mantine/core";
import { AdminBar } from "#/components/AdminBar/AdminBar";
import { Footer } from "#globals/Footer/Footer.tsx";
import { Header } from "#globals/Header/Header.tsx";
import { Providers } from "#/providers/Providers";
import { mergeOpenGraph } from "#/utilities/mergeOpenGraph";
import { draftMode } from "next/headers";

import { getServerSideURL } from "#/utilities/getURL";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const { isEnabled } = await draftMode();

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<ColorSchemeScript defaultColorScheme="auto" />
				<link href="/favicon.ico" rel="icon" sizes="32x32" />
				<link href="/favicon.svg" rel="icon" type="image/svg+xml" />
				<link href="/fonts/Jersey10/Jersey10.css" rel="stylesheet" />
				<link href="/fonts/Poppins/Poppins.css" rel="stylesheet" />
			</head>
			<body>
				<a href="#main-content" className="skip-link">
					Skip to main content
				</a>
				<Providers>
					<AdminBar
						adminBarProps={{
							preview: isEnabled,
						}}
					/>

					<Header />
					{/* Skip link target; pages render their own <main> landmark */}
					<div id="main-content" tabIndex={-1} />
					{children}
					<Footer />
				</Providers>
			</body>
		</html>
	);
}

export const metadata: Metadata = {
	metadataBase: new URL(getServerSideURL()),
	openGraph: mergeOpenGraph(),
	twitter: {
		card: "summary_large_image",
		creator: "@AusSpeedruns",
	},
};
