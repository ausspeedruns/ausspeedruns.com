import Head from 'next/head';
import { gql, ssrExchange, cacheExchange, dedupExchange, fetchExchange, useQuery } from 'urql';
import { DocumentRenderer } from '@keystone-6/document-renderer';

import DiscordEmbed from '../components/DiscordEmbed';
import { initUrqlClient } from 'next-urql';
import { GetServerSideProps } from 'next';
import { EventComponentRenderers } from '../components/ComponentBlocks/event-page';
import { PostEventComponentRenderers } from '../components/ComponentBlocks/post-event';

import styles from '../styles/Event.module.scss';
import { ThemeProvider } from '@mui/material';
import { theme } from '../components/mui-theme';
import { customDocumentRenderer } from '../components/ComponentBlocks/custom-renders';

const QUERY_EVENT = gql`
	query ($event: String!) {
		event(where: { shortname: $event }) {
			id
			shortname
			endDate
		}
	}
`;

const QUERY_LIVE_EVENT = gql`
	query ($event: String!) {
		event(where: { shortname: $event }) {
			id
			shortname
			eventPage {
				document(hydrateRelationships: true)
			}
			ogImage {
				url
			}
		}
	}
`;

const QUERY_PAST_EVENT = gql`
	query ($event: String!) {
		event(where: { shortname: $event }) {
			shortname
			raised
			postEventPage {
				document(hydrateRelationships: true)
			}
			postEventBackground {
				url
			}
			ogImage {
				url
			}
		}
	}
`;

interface QUERY_EVENT_RESULTS {
	event: {
		id: string;
		shortname: string;
		endDate?: string;
	};
}

interface QUERY_LIVE_EVENT_RESULTS {
	event: {
		id: string;
		shortname: string;
		eventPage: {
			document: any;
		};
		ogImage?: {
			url: string;
		};
	};
}

interface QUERY_PAST_EVENT_RESULTS {
	event: {
		raised: number;
		shortname: string;
		postEventPage: {
			document: any;
		};
		postEventBackground: {
			url: string;
		};
		ogImage?: {
			url: string;
		};
	};
}

function documentTrim(document: any[]) {
	const mutableDocument = [...document];

	if (mutableDocument[0].type === 'paragraph' && mutableDocument[0].children[0]?.text === '') {
		mutableDocument.shift();
	}

	if (
		mutableDocument.length > 0 &&
		mutableDocument[mutableDocument.length - 1].type === 'paragraph' &&
		mutableDocument[mutableDocument.length - 1].children[0]?.text === ''
	) {
		mutableDocument.pop();
	}

	return mutableDocument;
}

export default function EventPage(eventData: LivePageData | PastPageData) {
	const trimmedDocument = documentTrim(
		eventData.past === true ? eventData.event.postEventPage.document : eventData.event.eventPage.document
	);

	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>{`${eventData.event.shortname} - AusSpeedruns`}</title>
				<DiscordEmbed
					title={`${eventData.event.shortname} - AusSpeedruns`}
					pageUrl={`/event/${eventData.event.shortname}`}
					imageSrc={eventData.event.ogImage?.url}
				/>
			</Head>
			<main
				className={eventData.past === true ? styles.postEvent : ''}
				style={{ backgroundImage: eventData.past ? `url('${eventData.event.postEventBackground?.url}')` : '' }}
			>
				<div className={styles.document}>
					<DocumentRenderer
						document={trimmedDocument}
						componentBlocks={{ ...EventComponentRenderers, ...PostEventComponentRenderers }}
						renderers={customDocumentRenderer}
					/>
				</div>
			</main>
		</ThemeProvider>
	);
}

interface LivePageData {
	event: QUERY_LIVE_EVENT_RESULTS['event'];
	past: false;
}

interface PastPageData {
	event: QUERY_PAST_EVENT_RESULTS['event'];
	past: true;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const ssrCache = ssrExchange({ isClient: false });
	const client = initUrqlClient(
		{
			url:
				process.env.NODE_ENV === 'production'
					? 'https://keystone.ausspeedruns.com/api/graphql'
					: 'http://localhost:8000/api/graphql',
			exchanges: [dedupExchange, cacheExchange, ssrCache, fetchExchange],
		},
		false
	);

	if (!client) {
		return {
			notFound: true,
		}
	}

	const data = await client.query<QUERY_EVENT_RESULTS>(QUERY_EVENT, ctx.params).toPromise();

	if (!data?.data || data?.error || !data.data.event) {
		return {
			notFound: true,
		};
	}

	let pageData: LivePageData | PastPageData;

	// If still live
	if (data.data.event.endDate && new Date(data.data.event?.endDate) > new Date()) {
		const liveData = await client.query<QUERY_LIVE_EVENT_RESULTS>(QUERY_LIVE_EVENT, ctx.params).toPromise();

		if (!liveData?.data || liveData?.error || !liveData.data.event) {
			return {
				notFound: true,
			};
		}

		pageData = {
			event: liveData.data.event,
			past: false,
		};
	} else {
		const pastData = await client.query<QUERY_PAST_EVENT_RESULTS>(QUERY_PAST_EVENT, ctx.params).toPromise();

		if (!pastData?.data || pastData?.error || !pastData.data.event) {
			return {
				notFound: true,
			};
		}

		pageData = {
			event: pastData.data.event,
			past: true,
		};
	}

	return {
		props: pageData,
	};
};
