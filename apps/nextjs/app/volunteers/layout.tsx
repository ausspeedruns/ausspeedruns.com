"use client";

import { useMemo } from "react";
import { UrqlProvider, ssrExchange, cacheExchange, fetchExchange, createClient } from "@urql/next";
import { AuthProvider } from "apps/nextjs/components/auth";

export default function Layout({ children }: React.PropsWithChildren) {
	const [client, ssr] = useMemo(() => {
		const ssr = ssrExchange({
			isClient: typeof window !== "undefined",
		});
		const client = createClient({
			url: "http://localhost:8000/api/graphql",
			exchanges: [cacheExchange, ssr, fetchExchange],
			suspense: true,
		});

		return [client, ssr];
	}, []);

	return (
		<UrqlProvider client={client} ssr={ssr}>
			<AuthProvider>
				{children}
			</AuthProvider>
		</UrqlProvider>
	);
}
