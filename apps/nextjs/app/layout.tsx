import "./global.scss";

import { gql } from "@urql/core";
import { getRegisteredClient } from "@libs/urql";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";

import CookieConsent from "react-cookie-consent";

import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../mui-theme";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

const QUERY_EVENTS = gql`
	query LiveOrUpcomingEvents($currentTime: DateTime) {
		events(
			where: { AND: [{ published: { equals: true } }, { endDate: { gt: $currentTime } }] }
			orderBy: { startDate: asc }
		) {
			shortname
			scheduleReleased
		}
	}
`;

type Query_Events = {
	events: {
		shortname: string;
		endDate?: string;
		published: boolean;
		scheduleReleased: boolean;
	}[];
};

export const metadata: Metadata = {
	title: {
		template: "%s | AusSpeedruns",
		default: "AusSpeedruns",
	},
	metadataBase: new URL("https://ausspeedruns.com"),
};

export const viewport: Viewport = {
	themeColor: "#C72",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const result = await getRegisteredClient().query<Query_Events>(QUERY_EVENTS, { currentTime: new Date().toISOString() });
	return (
		<html lang="en">
			<body>
				<AppRouterCacheProvider>
					<Navbar events={result.data?.events ?? []} />
					<ThemeProvider theme={theme}>
						<main style={{ display: "flex", flexDirection: "column" }}>{children}</main>
					</ThemeProvider>
					<Footer />
					{/* <CookieConsent
						style={{ fontSize: "1.5rem" }}
						buttonStyle={{ background: "#CC7722", color: "#FFFFFF", fontSize: "1.5rem" }}>
						This website uses cookies to function.
					</CookieConsent> */}
				</AppRouterCacheProvider>
			</body>
		</html>
	);
}
