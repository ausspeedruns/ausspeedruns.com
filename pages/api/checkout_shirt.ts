import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient, gql } from 'urql';

const urqlClient = createClient({
	// url: 'http://localhost:8000/api/graphql',
	url: process.env.KEYSTONE_URL,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'POST') {
		try {
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

			if (!req.query.username || Array.isArray(req.query.username)) {
				throw new Error('No username');
			}

			// Create Checkout Sessions from body params.
			const session = await stripe.checkout.sessions.create({
				line_items: [
					{
						// Provide the exact Price ID (for example, pr_1234) of the product you want to sell
						price: 'ASM2022SHIRTTEST',
						quantity: 1,
					},
				],
				mode: 'payment',
				success_url: `${req.headers.origin}/user/${req.query.username}#tickets`,
				cancel_url: `${req.headers.origin}/store`,
			});

			// Generate shirt code
			const returnData = await urqlClient.mutation(gql`
				mutation ($userID: ID!, $stripeID: String, $size: ShirtOrderSizeType!, $colour: ShirtOrderColourType!, $apiKey: String!) {
					generateShirt(
						userID: $userID
						method: stripe
						size: $size
						colour: $colour
						stripeID: $stripeID
						apiKey: $apiKey
					) {
						__typename
					}
				}
			`, { userID: req.query.account, size: req.query.size, colour: req.query.colour, stripeID: session.id, event: req.query.event, apiKey: process.env.API_KEY }).toPromise();

			if (returnData.error) {
				throw new Error(JSON.stringify(returnData.error));
			}

			res.redirect(303, session.url);
		} catch (err) {
			res.status(err.statusCode || 500).json(err.message);
		}
	} else {
		res.setHeader('Allow', 'POST');
		res.status(405).end('Method Not Allowed');
	}
}