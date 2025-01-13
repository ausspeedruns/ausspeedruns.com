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
