import type { Metadata } from "next";

import { cn } from "#/utilities/ui";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { ColorSchemeScript } from "@mantine/core";
import { AdminBar } from "#/components/AdminBar/AdminBar";
import { Footer } from "#Footer/Footer.tsx";
import { Header } from "#Header/Header.tsx";
import { Providers } from "#/providers/Providers";
import { mergeOpenGraph } from "#/utilities/mergeOpenGraph";
import { draftMode } from "next/headers";

import "./globals.css";
import { getServerSideURL } from "#/utilities/getURL";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const { isEnabled } = await draftMode();

	return (
		<html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
			<head>
				<ColorSchemeScript defaultColorScheme="auto" />
				<link href="/favicon.ico" rel="icon" sizes="32x32" />
				<link href="/favicon.svg" rel="icon" type="image/svg+xml" />
				<link href="/fonts/Jersey10/Jersey10.css" rel="stylesheet" />
			</head>
			<body>
				<Providers>
					<AdminBar
						adminBarProps={{
							preview: isEnabled,
						}}
					/>

					<Header />
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
