import { gql, ApolloClient, InMemoryCache } from '@keystone-6/core/admin-ui/apollo';

const QUERY_EVENT_RUNS_SUBMISSIONS = gql`
	query ($eventShortname: String) {
		event(where: { shortname: $eventShortname }) {
			runs {
				id
				originalSubmission {
					id
					specialReqs
					techPlatform
				}
			}
		}
	}
`;

interface QueryEventRunsSubmissions {
	event: {
		runs: {
			id: string;
			originalSubmission?: {
				id: string;
				specialReqs: string;
				techPlatform: string;
			};
		}[];
	};
}

const UPDATE_SUBMISSIONS = gql`
	mutation SubmissionsAccept($submissions: [RunUpdateArgs!]!) {
		updateRuns(data: $submissions) {
			id
		}
	}
`;

interface UpdateSubmissions {
	updateRuns: {
		id: string;
	}[];
}

export async function updateTech(eventShortname: string) {
	const client = new ApolloClient({
		uri: "/api/graphql",
		cache: new InMemoryCache(),
	});

	// Get all runs & submissions
	const eventData = await client.query<QueryEventRunsSubmissions>({
		query: QUERY_EVENT_RUNS_SUBMISSIONS,
		variables: { eventShortname },
	});

	const runData = eventData.data.event.runs.map(
		(run) => {
			return { where: { id: run.id }, data: { specialRequirements: run.originalSubmission?.specialReqs, techPlatform: run.originalSubmission?.techPlatform } };
		},
	);

	const result = await client.mutate<UpdateSubmissions>({
		mutation: UPDATE_SUBMISSIONS,
		variables: { submissions: runData },
	});

	if (result?.errors && result?.errors?.length > 0) {
		console.error(result.errors);
		return { success: false, submissions: 0 };
	} else {
		console.log('Yay!')
	}
}