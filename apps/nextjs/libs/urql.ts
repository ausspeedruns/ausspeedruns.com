import { registerUrql } from "@urql/next/rsc";
import { cacheExchange, createClient, fetchExchange } from "urql/core";

const KeystoneURL = process.env.KEYSTONE_URL!;

function makeClient() {
	return createClient({
		url: "http://localhost:8000/api/graphql",
		exchanges: [cacheExchange, fetchExchange],
	});
}

const normalClient = makeClient();
const { getClient: getRegisteredClient } = registerUrql(makeClient);

export { getRegisteredClient, normalClient };
