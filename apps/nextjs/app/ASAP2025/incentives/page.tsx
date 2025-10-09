
import { getRegisteredClient } from "@libs/urql";
import { gql } from "urql";
import { IncentivesClient } from "./incentives.client";

const EVENT = "ASAP2025";

const INCENTIVES_QUERY = gql`
	query {
		event(where: { shortname: "${EVENT}" }) {
			donationIncentives {
				id
				title
				notes
				type
				run {
					id
					game
					category
					scheduledTime
				}
				data
				active
			}
		}
	}
`;

export type QUERY_INCENTIVES_RESULTS = {
	event: {
		donationIncentives: {
			id: string;
			title: string;
			notes: string;
			type: string;
			run: {
				id: string;
				game: string;
				category: string;
				scheduledTime: string;
			};
			data: string;
			active: string;
		}[];
	};
};

export const metadata = {
	title: "ASAP2025 Incentives",
	description: "View all donation incentives for ASAP2025.",
};

export const revalidate = 0;

export default async function ASAP2025Incentives() {
	const { data } = await getRegisteredClient()
		.query<QUERY_INCENTIVES_RESULTS>(INCENTIVES_QUERY, { event: EVENT })
		.toPromise();

	if (!data?.event) {
		return <div>Error loading incentives.</div>;
	}

	return (
		<IncentivesClient incentivesData={data} />
	)
}