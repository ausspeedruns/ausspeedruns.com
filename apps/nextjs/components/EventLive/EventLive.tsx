import { gql } from "urql";
import { EventLiveClient } from "./EventLive.client";
import { getRegisteredClient } from "@libs/urql";

const QUERY_EVENT = gql`
	query ($event: String!) {
		event(where: { shortname: $event }) {
			shortname
			runs(orderBy: { scheduledTime: asc }) {
				game
				runners {
					username
				}
				category
				scheduledTime
			}
			donationIncentives(where: { active: { equals: true } }) {
				title
				type
				run {
					id
					game
					category
					scheduledTime
				}
				data
				notes
				active
			}
		}
	}
`;

export interface QUERY_EVENT_RESULTS {
	event: {
		shortname: string;
		runs: {
			game: string;
			runners: {
				username: string;
			}[];
			category: string;
			scheduledTime: string;
		}[];
		donationIncentives: {
			title: string;
			type: string;
			run: {
				id: string;
				game: string;
				category: string;
				scheduledTime: string;
			};
			data: object;
			notes: string;
		}[];
	};
}

interface EventProps {
	event: string;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function EventLive(props: EventProps) {
	const { data } = await getRegisteredClient()
		.query<QUERY_EVENT_RESULTS>(QUERY_EVENT, { event: props.event })
		.toPromise();

	if (!data || !data.event) {
		return null;
	}

	return <EventLiveClient eventData={data} />;
}
