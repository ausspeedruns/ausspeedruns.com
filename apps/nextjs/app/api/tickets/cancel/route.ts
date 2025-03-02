import { getUrqlCookieClient } from "@libs/urql";
import { redirect } from "next/navigation";
import { gql } from "urql";

const DELETE_TICKET_MUTATION = gql`
	mutation ($sessionID: String) {
		deleteTicket(where: { stripeID: $sessionID }) {
			__typename
		}
	}
`;

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);

	const session_id = searchParams.get("session_id");

	if (session_id) {
		const client = getUrqlCookieClient();
		const result = await client.mutation(DELETE_TICKET_MUTATION, { sessionID: session_id });

		console.log(result);
	}

	redirect("/tickets");
}
