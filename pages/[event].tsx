import Head from 'next/head';
import { gql, ssrExchange, cacheExchange, dedupExchange, fetchExchange, useQuery } from 'urql';
import { InferRenderersForComponentBlocks } from '@keystone-6/fields-document/component-blocks';
import { DocumentRenderer } from '@keystone-6/document-renderer';

import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import DiscordEmbed from '../components/DiscordEmbed';
import { initUrqlClient } from 'next-urql';
import { GetServerSideProps } from 'next';
import { componentBlocks } from '../components/BlogComponents/event-page';

const QUERY_EVENT = gql`
	query ($event: String!) {
		event(where: { shortname: $event }) {
			id
			shortname
			acceptingSubmissions
			acceptingTickets
			scheduleReleased
			acceptingVolunteers
			acceptingBackups
			acceptingShirts
			eventPage {
				document(hydrateRelationships: true)
			}
		}
	}
`;

interface QUERY_EVENT_RESULTS {
	event: {
		id: string;
		shortname: string;
		acceptingSubmissions: boolean;
		acceptingTickets: boolean;
		scheduleReleased: boolean;
		acceptingVolunteers: boolean;
		acceptingBackups: boolean;
		acceptingShirts: boolean;
		eventPage: {
			document: any;
		};
	};
}

function convertPropsToComponentData(props: object) {
	let componentData: Record<string, any> = {};

	for (const [key, value] of Object.entries(props)) {
		if (typeof value === 'object' && !Array.isArray(value)) {
			// Check if relationship or not
			if (Object.hasOwn(value, 'id') && Object.hasOwn(value, 'label') && Object.hasOwn(value, 'data')) {
				componentData[key] = { value: { data: value.data } };
			} else {
				let valueObject: Record<string, any> = {};
				for (const [internalKey, internalValue] of Object.entries(value)) {
					valueObject[internalKey] = { value: internalValue };
				}
				componentData[key] = { fields: valueObject };
			}
		} else if (Array.isArray(value)) {
			componentData[key] = {
				elements: value.map((internalValue) => {
					let item: Record<string, any> = {};
					item.fields = {};
					for (const [itemKey, itemValue] of Object.entries(internalValue)) {
						item.fields[itemKey] = { value: itemValue };
					}
					return item;
				}),
			};
		} else {
			componentData[key] = { value };
		}
	}

	return componentData;
}

const componentBlockRenderers: InferRenderersForComponentBlocks<typeof componentBlocks> = {
	header: (props) => {
		console.log(props, convertPropsToComponentData(props));
		return <componentBlocks.header.preview fields={convertPropsToComponentData(props)} />;
	},
	imageParagraph: (props) => {
		return <componentBlocks.imageParagraph.preview fields={convertPropsToComponentData(props)} />;
	},
	infoTable: (props) => {
		return <componentBlocks.infoTable.preview fields={convertPropsToComponentData(props)} />;
	},
	fullWidthImage: (props) => {
		return <componentBlocks.fullWidthImage.preview fields={convertPropsToComponentData(props)} />;
	},
};

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

export default function EventPage({ event }: QUERY_EVENT_RESULTS) {
	const trimmedDocument = documentTrim(event?.eventPage.document);

	return (
		<div>
			<Head>
				<title>{event.shortname} - AusSpeedruns</title>
				<DiscordEmbed title={`${event.shortname} - AusSpeedruns`} pageUrl={`/event/${event.shortname}`} />
			</Head>
			<main>
				<DocumentRenderer document={trimmedDocument} componentBlocks={componentBlockRenderers} />
			</main>
		</div>
	);
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

	const data = await client.query<QUERY_EVENT_RESULTS>(QUERY_EVENT, ctx.params).toPromise();

	if (!data?.data || !data.data.event) {
		return {
			notFound: true,
		};
	}

	if (data?.error) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			event: data.data.event,
		},
	};
};
