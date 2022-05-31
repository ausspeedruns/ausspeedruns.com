import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient, gql } from 'urql';

const urqlClient = createClient({
	// url: 'http://localhost:8000/api/graphql',
	url: process.env.KEYSTONE_URL,
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
				if (!req.query.size || Array.isArray(req.query.size) || !['xs', 's', 'm', 'l', 'xl', 'xl2', 'xl3'].includes(req.query.size)) {
					throw new Error('Invalid Size');
				}

				// Check valid colour
				if (!req.query.colour || Array.isArray(req.query.colour) || !['blue', 'purple'].includes(req.query.colour)) {
					throw new Error('Invalid colour');
				}

				const data = await urqlClient.mutation(gql`
					mutation ($userID: ID!, $size: ShirtOrderSizeType!, $colour: ShirtOrderColourType!, $apiKey: String!) {
						generateShirt(
							userID: $userID
							method: bank
							size: $size
							colour: $colour
							apiKey: $apiKey
						) {
							shirtID
							size
							colour
						}
					}
				`, { userID: req.query.account, size: req.query.size, colour: req.query.colour, apiKey: process.env.API_KEY }).toPromise();

				res.setHeader('Content-Type', 'application/json');
				res.status(200).json(data);
				return resolve();
			} catch (err) {
				res.status(err.statusCode || 500).json(err.message);
				return resolve();
			}
		} else {
			res.status(405).end();
			return resolve();
		}
	})
}