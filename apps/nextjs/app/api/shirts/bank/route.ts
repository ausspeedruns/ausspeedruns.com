import { getUrqlCookieClient } from "@libs/urql-cookie";
import { NextResponse } from "next/server";
import { gql } from "urql";

const API_KEY = process.env.API_KEY as string;

const CREATE_SHIRT_MUTATION = gql`
	mutation ($userID: ID!, $size: ShirtOrderSizeType!, $apiKey: String!) {
		generateShirt(
			userID: $userID
			method: bank
			size: $size
			apiKey: $apiKey
		) {
			shirtID
			size
		}
	}
`;

export async function POST(request: Request) {
	const { searchParams } = new URL(request.url);

	const userId = searchParams.get("userId");
	if (!userId) {
		return new Response("Missing userId", { status: 400 });
	}

	const size = searchParams.get("size");
	if (!size) {
		return new Response("Missing size", { status: 400 });
	}

	const client = getUrqlCookieClient();

	if (!client) {
		return new Response("Unauthorized", { status: 401 });
	}

	const result = await client
		.mutation(CREATE_SHIRT_MUTATION, { userID: userId, size, apiKey: API_KEY })
		.toPromise();

	return NextResponse.json(result);
}
