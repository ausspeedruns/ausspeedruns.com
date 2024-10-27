import "../styles/global.scss";
import "../styles/App.scss";

import { cacheExchange, createClient, fetchExchange, gql } from "@urql/core";
import { registerUrql } from "@urql/next/rsc";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";

import CookieConsent from "react-cookie-consent";

import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../mui-theme";

const makeClient = () => {
	return createClient({
		url: "http://localhost:8000/api/graphql",
		exchanges: [cacheExchange, fetchExchange],
	});
};

const { getClient } = registerUrql(makeClient);

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
	const result = await getClient().query<Query_Events>(QUERY_EVENTS, { currentTime: new Date().toISOString() });
	return (
		<html lang="en">
			<body>
				<AppRouterCacheProvider>
					<Navbar events={result.data?.events ?? []} />
					<ThemeProvider theme={theme}>
						<main>{children}</main>
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
