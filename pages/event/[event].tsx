import React from 'react';
import { GetStaticPathsResult, GetStaticPropsContext } from 'next';
import { query } from '.keystone/api';
import Head from 'next/head';
import Navbar from '../../components/Navbar/Navbar';

type Event = {
	name: string;
	shortname: string;
};

export default function EventPage({ event }: { event: Event }) {
	return (
		<div className="App">
			<Head>
				<title>{event.shortname} - AusSpeedruns</title>
			</Head>
			<Navbar />
		</div>
	);
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
	const event = (await query.Event.findMany({
		query: `shortname`,
	})) as { shortname: string }[];

	const paths = event.filter(({ shortname }) => !!shortname).map(({ shortname }) => `/event/${shortname}`);

	return {
		paths,
		fallback: false,
	};
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
	const event = (await query.Event.findOne({
		where: { shortname: params!.event as string },
		query: 'id name shortname',
	})) as Event | null;
	if (!event) {
		return { notFound: true };
	}
	return { props: { event } };
}
