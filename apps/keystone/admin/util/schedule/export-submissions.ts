import Papa from 'papaparse';
import { gql, ApolloClient, InMemoryCache } from '@keystone-6/core/admin-ui/apollo';
import { differenceInDays, addDays, format } from 'date-fns';

const EVENT_SUBMISSIONS_QUERY = gql`
	query ($event: String) {
		event(where: { shortname: $event }) {
			id
			shortname
			startDate
			endDate
			eventTimezone
			submissions {
				id
				runner {
					id
					username
				}
				game
				category
				platform
				estimate
				ageRating
				specialReqs
				race
				racer
				coop
				video
				availability
				willingBackup
				possibleEstimate
				possibleEstimateReason
				newDonationIncentives
			}
		}
	}
`;

interface EventSubmissions {
	event: {
		id: string;
		shortname: string;
		startDate: string;
		endDate: string;
		eventTimezone: string;
		submissions: {
			id: string;
			runner: {
				id: string;
				username: string;
			};
			game: string;
			category: string;
			platform: string;
			estimate: string;
			ageRating: 'm_or_lower' | 'ma15' | 'ra18';
			specialReqs: string;
			race: 'no' | 'solo' | 'only';
			racer: string;
			coop: boolean;
			video: string;
			availability: boolean[];
			willingBackup: boolean;
			possibleEstimate: string;
			possibleEstimateReason: string;
			newDonationIncentives: string;
		}[];
	};
}

const client = new ApolloClient({ uri: '/api/graphql', cache: new InMemoryCache() });

export async function downloadSubmissions(eventId: string) {
	const eventSubmissions = await client.query<EventSubmissions>({ query: EVENT_SUBMISSIONS_QUERY, variables: { event: eventId } });

	const csvBlob = parseSubmissionsToCSV(eventSubmissions.data);

	const csvURL = window.URL.createObjectURL(csvBlob);
	const tempLink = document.createElement('a');
	tempLink.href = csvURL;
	tempLink.setAttribute('download', `${eventSubmissions.data.event.shortname}-submissions.csv`);
	tempLink.click();
}

// Converts all keystone submissions to a CSV to download.
function parseSubmissionsToCSV(submissionData: EventSubmissions) {
	const csvData = submissionData.event.submissions.map((submission) => {
		let newDonationIncentives: string | undefined = undefined;
		if (submission.newDonationIncentives) {
			newDonationIncentives = JSON.stringify(submission.newDonationIncentives);
		}

		const eventLength = differenceInDays(
			new Date(submissionData.event.endDate),
			new Date(submissionData.event.startDate),
		) + 1;

		let dates: Record<string, boolean> = {};

		for (let i = 0; i < eventLength; i++) {
			const date = addDays(new Date(submissionData.event.startDate), i);
			dates[format(date, 'E-ii')] = submission.availability[i] ?? 'FALSE';
		}

		const flattenedSubmission = {
			game: submission.game,
			category: submission.category,
			estimate: submission.estimate,
			possibleEstimate: submission.possibleEstimate,
			possibleEstimateReason: submission.possibleEstimateReason,
			runner: submission.runner.username,
			platform: submission.platform,
			ageRating: submission.ageRating,
			donationIncentives: newDonationIncentives,
			specialRequirements: submission.specialReqs,
			video: submission.video,
			racer: submission.racer,
			race: submission.race,
			coop: submission.coop,
			willingBackup: submission.willingBackup,
			id: submission.id,
			runnerId: submission.runner.id,
			...dates,
		};

		return flattenedSubmission;
	});

	const papaCSV = Papa.unparse(csvData);
	return new Blob([papaCSV], { type: 'text/csv;charset=utf-8;' });
}
