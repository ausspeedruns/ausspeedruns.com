import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient, gql, cacheExchange, fetchExchange } from 'urql';

const urqlClient = createClient({
	// url: 'http://localhost:8000/api/graphql',
	url: process.env.KEYSTONE_URL!,
	exchanges: [cacheExchange, fetchExchange],
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	return new Promise<void>(async resolve => {
		if (req.method === 'GET') {
			try {
				// Check all data is here
				if (!req.query.account || Array.isArray(req.query.account)) {
					throw new Error('No account ID');
				}

				// Check valid shirt size
				if (!req.query.size || Array.isArray(req.query.size) || !['m', 'l', 'xl', 'xl2', 'xl3', 'xl4'].includes(req.query.size)) {
					throw new Error('Invalid Size');
				}

				const data = await urqlClient.mutation(gql`
					mutation ($userID: ID!, $size: ShirtOrderSizeType!, $apiKey: String!) {
						generateTicket(
							userID: $userID
							numberOfTickets: 1
							method: bank
							event: "ASM2023"
							apiKey: $apiKey
						) {
							ticketID
							totalCost
							numberOfTickets
						}
						generateShirt(
							userID: $userID
							method: bank
							apiKey: $apiKey
							size: $size
						) {
							shirtID
						}
					}
				`, { userID: req.query.account, size: req.query.size, apiKey: process.env.API_KEY }).toPromise();

				res.setHeader('Content-Type', 'application/json');
				res.status(200).json(data);
				return resolve();
			} catch (err: any) {
				res.status(err.statusCode || 500).json(err.message);
				return resolve();
			}
		} else {
			res.status(405).end();
			return resolve();
		}
	})
}