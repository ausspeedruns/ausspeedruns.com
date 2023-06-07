import Stripe from 'stripe';
import { buffer } from 'micro';
import Cors from 'micro-cors';
import type { IncomingMessage } from 'http';
import { createClient, gql } from 'urql';

const urqlClient = createClient({
  // url: 'http://localhost:8000/api/graphql',
  url: process.env.KEYSTONE_URL!,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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
    const signature = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        buf.toString(),
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.log(`❌ Error message: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const checkout = event.data.object as Record<string, any>;
        stripe.checkout.sessions.listLineItems(checkout.id, {}).then(data => {
          console.log(JSON.stringify(data))
          // This is mega dumb btw
          if (data.data[0].description === "ASM2023 Shirt") {
            // SHIRT
            fulfilShirtOrder(checkout.id);
          } else if (data.data[0].description === "ASM2023 Bundle") {
            // BUNDLE
            fulfilBundleOrder(checkout.id, data.data[0].quantity!);
          } else {
            // TICKET
            fulfilOrder(checkout.id, data.data[0].quantity!);
          }
        });
        break;
      default: {
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

const fulfilOrder = async (sessionID: any, quantity: number) => {
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

async function fulfilShirtOrder(sessionID: any) {
  // Update shirt information
  const mutRes = await urqlClient.mutation(gql`
    mutation ($sessionID: String!, $apiKey: String!) {
      confirmShirtStripe(stripeID: $sessionID, apiKey: $apiKey, numberOfShirts: 0) {
        __typename
      }
    }
  `, { sessionID, apiKey: process.env.API_KEY }).toPromise();
}

async function fulfilBundleOrder(sessionID: any, quantity: number) {
  // Update shirt information
  const mutRes = await urqlClient.mutation(gql`
    mutation ($sessionID: String!, $apiKey: String!, $quantity: Int!) {
      confirmShirtStripe(stripeID: $sessionID, apiKey: $apiKey, numberOfShirts: $quantity) {
        __typename
      }
      confirmStripe(stripeID: $sessionID, numberOfTickets: $quantity, apiKey: $apiKey) {
        __typename
      }
    }
  `, { sessionID, apiKey: process.env.API_KEY, quantity }).toPromise();
}
