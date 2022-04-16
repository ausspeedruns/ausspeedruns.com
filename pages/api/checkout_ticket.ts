import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient, gql } from 'urql';

const urqlClient = createClient({
	url: 'http://localhost:8000/api/graphql',
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'POST') {
		try {
			if (!req.query.account) {
				throw new Error('No account ID');
			}

			// Create Checkout Sessions from body params.
			const session = await stripe.checkout.sessions.create({
				line_items: [
					{
						// Provide the exact Price ID (for example, pr_1234) of the product you want to sell
						price: 'ASM2202TICKET',
						adjustable_quantity: {
							enabled: true,
							minimum: 1,
						},
						quantity: 1,
					},
				],
				mode: 'payment',
				success_url: `${req.headers.origin}/ASM2022/tickets?success=true`,
				cancel_url: `${req.headers.origin}/ASM2022/tickets?cancelled=true&session_id={CHECKOUT_SESSION_ID}`,
			});

			// Generate ticket code
			urqlClient.mutation(gql`
				mutation ($userID: ID, $stripeID: String) {
					createTicket(data: { user: { connect: { id: $userID } }, numberOfTickets: 1, method: stripe, stripeID: $stripeID }) {
						ticketID
					}
				}
			`, { userID: req.query.account, stripeID: session.id }).toPromise().then(result => {
				console.log(result);
			});

			res.redirect(303, session.url);
		} catch (err) {
			res.status(err.statusCode || 500).json(err.message);
		}
	} else {
		res.setHeader('Allow', 'POST');
		res.status(405).end('Method Not Allowed');
	}
}