import { cookies } from "next/headers";
import { registerUrql } from "@urql/next/rsc";
import { cacheExchange, createClient, fetchExchange } from "urql/core";

const KeystoneURL = process.env.KEYSTONE_URL!;

function makeCookieClient(keystoneCookie: string) {
	return createClient({
		url: KeystoneURL,
		exchanges: [cacheExchange, fetchExchange],
		fetchOptions: () => {
			return {
				headers: {
					cookie: `keystonejs-session=${keystoneCookie}`,
				},
			};
		},
	});
}

export function getUrqlCookieClient() {
	const cookieStore = cookies();

	const keystoneCookie = cookieStore.get("keystonejs-session");

	if (!keystoneCookie) {
		return null;
	}

	return makeCookieClient(keystoneCookie.value);
}

export function getRegisteredUrqlCookieClient() {
	const cookieStore = cookies();

	const keystoneCookie = cookieStore.get("keystonejs-session");

	if (!keystoneCookie) {
		return null;
	}

	const { getClient } = registerUrql(() => makeCookieClient(keystoneCookie.value));

	return getClient;
}
