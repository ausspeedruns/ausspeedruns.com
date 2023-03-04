import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient, gql } from 'urql';

const urqlClient = createClient({
	// url: 'http://localhost:8000/api/graphql',
	url: process.env.KEYSTONE_URL!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	return new Promise<void>(async resolve => {
		if (req.method === 'GET') {
			try {
				// Check all data is here
				if (!req.query.account || Array.isArray(req.query.account)) {
					throw new Error('No account ID');
				}

				if (!req.query.bundles) {
					throw new Error('Missing number of bundles');
				}

				if (isNaN(parseInt(req.query.bundles.toString()))) {
					throw new Error('bundles is not a number');
				}

				const data = await urqlClient.mutation(gql`
					mutation ($userID: ID!, $numberOfBundles: Int!, $apiKey: String!) {
						generateTicket(
							userID: $userID
							numberOfTickets: $numberOfBundles
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
							notes: "#${req.query.bundles.toString()}"
						) {
							shirtID
						}
					}
				`, { userID: req.query.account, apiKey: process.env.API_KEY, numberOfBundles: parseInt(req.query.bundles.toString()) }).toPromise();

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