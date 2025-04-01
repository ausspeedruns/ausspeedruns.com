import { getUrqlCookieClient } from "@libs/urql-cookie";
import { NextResponse } from "next/server";
import { gql } from "urql";

const API_KEY = process.env.API_KEY as string;

const CREATE_TICKET_MUTATION = gql`
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
`;

export async function POST(request: Request) {
	const { searchParams } = new URL(request.url);

	const userId = searchParams.get("userId");
	if (!userId) {
		return new Response("Missing userId", { status: 400 });
	}

	const event = searchParams.get("event");
	if (!event) {
		return new Response("Missing event", { status: 400 });
	}

	const client = getUrqlCookieClient();

	if (!client) {
		return new Response("Unauthorized", { status: 401 });
	}

	const result = await client
		.mutation(CREATE_TICKET_MUTATION, { userID: userId, numberOfTickets: 1, event: "ASM2025", apiKey: API_KEY })
		.toPromise();

	return NextResponse.json(result);
}
