import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient, gql } from 'urql';

const urqlClient = createClient({
	// url: 'http://localhost:8000/api/graphql',
	url: process.env.KEYSTONE_URL!,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'POST') {
		try {
			if (!req.query.account || Array.isArray(req.query.account)) {
				throw new Error('No account ID');
			}

			if (!req.query.username || Array.isArray(req.query.username)) {
				throw new Error('No username');
			}

			// Create Checkout Sessions from body params.
			const session = await stripe.checkout.sessions.create({
				line_items: [
					{
						// Provide the exact Price ID (for example, pr_1234) of the product you want to sell
						price: 'ASM2023BUNDLE',
						adjustable_quantity: {
							enabled: true,
							minimum: 1,
						},
						quantity: 1,
					},
				],
				mode: 'payment',
				success_url: `${req.headers.origin}/user/${req.query.username}#tickets`,
				cancel_url: `${req.headers.origin}/store`,
			});

			// Generate ticket and shirt code
			const returnData = await urqlClient.mutation(gql`
				mutation ($userID: ID!, $stripeID: String, $apiKey: String!) {
					generateShirt(
						userID: $userID
						method: stripe
						stripeID: $stripeID
						apiKey: $apiKey
					) {
						__typename
					}
					generateTicket(
						userID: $userID
						event: "ASM2023"
						numberOfTickets: 1
						method: stripe
						stripeID: $stripeID
						apiKey: $apiKey
					) {
						__typename
					}
				}
			`, { userID: req.query.account, stripeID: session.id, event: req.query.event, apiKey: process.env.API_KEY }).toPromise();

			if (returnData.error) {
				throw new Error(JSON.stringify(returnData.error));
			}

			res.redirect(303, session.url!);
		} catch (err: any) {
			res.status(err.statusCode || 500).json(err.message);
		}
	} else {
		res.setHeader('Allow', 'POST');
		res.status(405).end('Method Not Allowed');
	}
}