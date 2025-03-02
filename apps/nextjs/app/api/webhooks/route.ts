import { StripeHandler } from "./stripe";

export async function POST(request: Request) {
	if (request.headers.get("stripe-signature")) {
		return StripeHandler(request);
	}

	return new Response("Internal Server Error", { status: 500 });
}
