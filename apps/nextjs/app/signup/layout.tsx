"use client";

import { useMemo } from "react";
import { UrqlProvider, ssrExchange, cacheExchange, fetchExchange, createClient } from "@urql/next";

export default function Layout({ children }: React.PropsWithChildren) {
	const [client, ssr] = useMemo(() => {
		const ssr = ssrExchange({
			isClient: typeof window !== "undefined",
		});
		const client = createClient({
			// url: "http://localhost:8000/api/graphql",
			url: "https://keystone.ausspeedruns.com/api/graphql",
			exchanges: [cacheExchange, ssr, fetchExchange],
			suspense: true,
		});

		return [client, ssr];
	}, []);

	return (
		<UrqlProvider client={client} ssr={ssr}>
			{children}
		</UrqlProvider>
	);
}
