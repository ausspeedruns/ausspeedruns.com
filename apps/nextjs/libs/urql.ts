import { cookies } from "next/headers";
import { Client, cacheExchange, createClient, fetchExchange } from "urql/core";

let _client: Client | null = null;

export const getUrqlClient = () => {
	if (!_client) {
		_client = createClient({
			url: "http://localhost:8000/api/graphql",
			exchanges: [cacheExchange, fetchExchange],
		});
	}

	return _client;
};

export const getUrqlCookieClient = () => {
	const cookieStore = cookies();

	const keystoneCookie = cookieStore.get("keystonejs-session");

	if (!keystoneCookie) {
		throw new Error("No cookie found");
	}

	const client = createClient({
		url: "http://localhost:8000/api/graphql",
		exchanges: [cacheExchange, fetchExchange],
		fetchOptions: () => {
			return {
				headers: {
					cookie: `keystonejs-session=${keystoneCookie.value}`,
				},
			};
		},
	});

	return client;
};
