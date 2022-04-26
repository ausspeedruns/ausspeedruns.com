import Stripe from 'stripe';
import { buffer } from 'micro';
import Cors from 'micro-cors';
import type { IncomingMessage } from 'http';
import { createClient, gql } from 'urql';

const urqlClient = createClient({
  // url: 'http://localhost:8000/api/graphql',
  url: process.env.KEYSTONE_URL,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' });

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false,
  },
};

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
});

// I want to set the req and res to the correct types but Cors anger.
const webhookHandler = async (req: IncomingMessage, res: any) => {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const signature = req.headers['stripe-signature'];

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        buf.toString(),
        signature,
        webhookSecret
      );
    } catch (err) {
      // On error, log and return the error message.
      console.log(`❌ Error message: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Successfully constructed event.
    console.log('✅ Success:', event.id);

    switch (event.type) {
      // case 'payment_intent.succeeded': {
      //   const paymentIntent = event.data.object as Record<string, any>;
      //   console.log(`PaymentIntent status: ${paymentIntent.status}`);
      //   break;
      // }
      // case 'payment_intent.payment_failed': {
      //   const paymentIntent = event.data.object as Record<string, any>;
      //   console.log(
      //     `❌ Payment failed: ${paymentIntent.last_payment_error?.message}`
      //   );
      //   break;
      // }
      // case 'charge.succeeded': {
      //   const charge = event.data.object as Record<string, any>;
      //   console.log(`Charge id: ${charge.id}`);
      //   break;
      // }
      case 'checkout.session.completed':
        const checkout = event.data.object as Record<string, any>;
        stripe.checkout.sessions.listLineItems(checkout.id, {}).then(data => {
          fulfillOrder(checkout.id, data.data[0].quantity);
        });
        break;
      default: {
        // console.warn(`Unhandled event type: ${event.type}`);
        break;
      }
    }

    // Return a response to acknowledge receipt of the event.
    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

const fulfillOrder = async (sessionID: any, quantity: number) => {
  // Update ticket information
  const mutRes = await urqlClient.mutation(gql`
    mutation ($sessionID: String!, $quantity: Int!, $apiKey: String!) {
      confirmStripe(stripeID: $sessionID, numberOfTickets: $quantity, apiKey: $apiKey) {
        __typename
      }
    }
  `, { sessionID, quantity, apiKey: process.env.API_KEY }).toPromise();
}

export default cors(webhookHandler);