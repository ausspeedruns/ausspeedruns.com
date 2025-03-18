import { registerUrql } from "@urql/next/rsc";
import { cookies } from "next/headers";
import { cacheExchange, createClient, fetchExchange } from "urql/core";

const KeystoneURL = process.env.KEYSTONE_URL!;

function makeClient() {
	return createClient({
		url: KeystoneURL,
		exchanges: [cacheExchange, fetchExchange],
	});
}

const normalClient = makeClient();
const { getClient: getRegisteredClient } = registerUrql(makeClient);

export { getRegisteredClient, normalClient };

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
};
