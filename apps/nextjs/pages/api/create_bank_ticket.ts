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
				if (!req.query.account) {
					throw new Error('No account ID');
				}

				if (!req.query.tickets) {
					throw new Error('Missing number of tickets');
				}

				if (Number.isNaN(parseInt(req.query.tickets.toString()))) {
					throw new Error('Tickets is not a number');
				}

				if (!req.query.event) {
					throw new Error('Missing event');
				}

				const data = await urqlClient.mutation(gql`
					mutation ($userID: ID!, $numberOfTickets: Int!, $event: String!, $apiKey: String!) {
						generateTicket(
							userID: $userID
							numberOfTickets: $numberOfTickets
							method: bank
							event: $event
							apiKey: $apiKey
						) {
							ticketID
							totalCost
							numberOfTickets
						}
					}
				`, { userID: req.query.account, numberOfTickets: parseInt(req.query.tickets.toString()), event: req.query.event, apiKey: process.env.API_KEY }).toPromise();

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