import React from 'react';
import { GetStaticPathsResult } from 'next';
import { query } from '.keystone/api';

export default function EventPage() {
	return <div>Test</div>;
};

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
	const posts = (await query.Event.findMany({
		query: `shortname`,
	})) as { shortname: string }[];

	const paths = posts.filter(({ shortname }) => !!shortname).map(({ shortname }) => `/event/${shortname}`);

	return {
		paths,
		fallback: false,
	};
}

