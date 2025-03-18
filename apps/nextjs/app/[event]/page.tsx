import Head from "next/head";
import { DocumentRenderer } from "@keystone-6/document-renderer";

import { EventComponentRenderers } from "../../components/ComponentBlocks/event-page";
import { PostEventComponentRenderers } from "../../components/ComponentBlocks/post-event";

import styles from "../../styles/Event.module.scss";
import { customDocumentRenderer } from "../../components/ComponentBlocks/custom-renders";
import { gql } from "@urql/core";
import { notFound } from "next/navigation";
import { getRegisteredClient } from "@libs/urql";

const QUERY_EVENT = gql`
	query ($event: String!) {
		event(where: { shortname: $event }) {
			id
			shortname
			endDate
			eventPage {
				document(hydrateRelationships: true)
			}
		}
	}
`;

const QUERY_LIVE_EVENT = gql`
	query ($event: String!) {
		event(where: { shortname: $event }) {
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

	if (mutableDocument[0].type === "paragraph" && mutableDocument[0].children[0]?.text === "") {
		mutableDocument.shift();
	}

	if (
		mutableDocument.length > 0 &&
		mutableDocument[mutableDocument.length - 1].type === "paragraph" &&
		mutableDocument[mutableDocument.length - 1].children[0]?.text === ""
	) {
		mutableDocument.pop();
	}

	return mutableDocument;
}

export default async function EventPage({ params }: { params: { event: string } }) {
	const client = getRegisteredClient();
	const data = await client.query<QUERY_EVENT_RESULTS>(QUERY_EVENT, { event: params.event });

	if (!data?.data || data?.error || !data.data.event) {
		return notFound();
	}

	let eventData: LivePageData | PastPageData;

	// If still live
	if (data.data.event.endDate && new Date(data.data.event?.endDate) > new Date()) {
		const liveData = await client
			.query<QUERY_LIVE_EVENT_RESULTS>(QUERY_LIVE_EVENT, { event: params.event })
			.toPromise();

		if (!liveData?.data || liveData?.error || !liveData.data.event) {
			return notFound();
		}

		// console.log(liveData.data.event.eventPage)

		eventData = {
			event: liveData.data.event,
			past: false,
		};
	} else {
		const pastData = await client
			.query<QUERY_PAST_EVENT_RESULTS>(QUERY_PAST_EVENT, { event: params.event })
			.toPromise();

		if (!pastData?.data || pastData?.error || !pastData.data.event) {
			return notFound();
		}

		eventData = {
			event: pastData.data.event,
			past: true,
		};
	}

	const trimmedDocument = documentTrim(
		eventData.past ? eventData.event.postEventPage.document : eventData.event.eventPage.document,
	);

			/* <Head>
				<title>{`${eventData.event.shortname} - AusSpeedruns`}</title>
				<DiscordEmbed
					title={`${eventData.event.shortname} - AusSpeedruns`}
					pageUrl={`/event/${eventData.event.shortname}`}
					imageSrc={eventData.event.ogImage?.url}
				/>
			</Head> */


	return (
		<div
			className={eventData.past ? styles.postEvent : ""}
			style={{ backgroundImage: eventData.past ? `url('${eventData.event.postEventBackground?.url}')` : "" }}>
			<div className={styles.document}>
				<DocumentRenderer
					document={trimmedDocument}
					componentBlocks={{ ...EventComponentRenderers, ...PostEventComponentRenderers }}
					renderers={customDocumentRenderer}
				/>
			</div>
		</div>
	);
}

interface LivePageData {
	event: QUERY_LIVE_EVENT_RESULTS["event"];
	past: false;
}

interface PastPageData {
	event: QUERY_PAST_EVENT_RESULTS["event"];
	past: true;
}
