import { gql, ApolloClient, InMemoryCache } from '@keystone-6/core/admin-ui/apollo';

const QUERY_EVENT_RUNS_SUBMISSIONS = gql`
	query ($eventShortname: String) {
		event(where: { shortname: $eventShortname }) {
			runs {
				originalSubmission {
					id
				}
			}
			submissions {
				id
				willingBackup
			}
		}
	}
`;

interface QueryEventRunsSubmissions {
	event: {
		runs: {
			originalSubmission: {
				id: string;
			};
		}[];
		submissions: {
			id: string;
			willingBackup: boolean;
		}[];
	};
}

const UPDATE_SUBMISSIONS = gql`
	mutation SubmissionsAccept($submissions: [SubmissionUpdateArgs!]!) {
		updateSubmissions(data: $submissions) {
			id
		}
	}
`;

interface UpdateSubmissions {
	updateSubmissions: {
		id: string;
	}[];
}

export async function updateSubmissionResults(eventShortname: string) {
	const client = new ApolloClient({
		uri: "/api/graphql",
		cache: new InMemoryCache(),
	});

	// Get all runs & submissions
	const eventData = await client.query<QueryEventRunsSubmissions>({
		query: QUERY_EVENT_RUNS_SUBMISSIONS,
		variables: { eventShortname },
	});

	const submissionData = eventData.data.event.submissions.map(
		(submission) => {
			// Set the rest as rejected
			let result = "rejected";

			if (
				eventData.data.event.runs.find(
					(run) => run.originalSubmission.id === submission.id,
				)
			) {
				// Set the scheduled runs as accepted
				result = "accepted";
			} else if (submission.willingBackup) {
				// Set the remaining willing backup runs as backup
				result = "backup";
			}

			return { where: { id: submission.id }, data: { status: result } };
		},
	);

	const result = await client.mutate<UpdateSubmissions>({
		mutation: UPDATE_SUBMISSIONS,
		variables: { submissions: submissionData },
	});

	if (result?.errors && result?.errors?.length > 0) {
		console.error(result.errors);
		return { success: false, submissions: 0 };
	} else {
		return {
			success: true,
			submissions: result?.data?.updateSubmissions.length,
		};
	}
}