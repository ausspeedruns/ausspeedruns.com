import React from 'react';
import { NotEditable, component, fields, InferRenderersForComponentBlocks } from '@keystone-6/fields-document/component-blocks';

import styled from '@emotion/styled';

interface HeaderProps {
	image: string;
	position: string;
	cover: boolean;
	repeat: string;
}

const EventLogo = styled.img`
	max-width: 50%;
	max-height: 5rem;
	object-fit: contain;
`;

const AmountRaisedContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const AmountRaisedValue = styled.span`
	font-weight: bold;
	font-size: 2rem;
`;

const AmountRaisedImage = styled.img`
	max-height: 100%;
	max-width: 30%;
	object-fit: contain;
`;

// naming the export componentBlocks is important because the Admin UI
// expects to find the components like on the componentBlocks export
export const PostEventComponentBlocks = {
	eventLogo: component({
		preview(props) {
			return <EventLogo src={props.fields.eventLogo.value?.data.logo.url} alt={`${props.fields.eventLogo.value?.data.name} Logo`} />;
		},
		label: 'Event Logo',
		schema: {
			eventLogo: fields.relationship({
				label: 'Event',
				listKey: 'Event',
				selection:
					'name logo { url }',
			}),
		},
	}),
	raisedAmount: component({
		preview(props) {
			return (
				<AmountRaisedContainer>
					<AmountRaisedValue>{props.fields.amount.value}</AmountRaisedValue>
					<span> raised for </span>
					<AmountRaisedImage src={props.fields.charityImage.value} alt={props.fields.charityName.value} />
				</AmountRaisedContainer>
			);
		},
		label: 'Raised Amount',
		schema: {
			charityName: fields.text({ label: 'Charity Name ' }),
			charityImage: fields.url({ label: 'Charity URL' }),
			amount: fields.text({ label: 'Amount Raised' }),
		},
	}),
	AllRuns: component({
		preview(props) {
			return <NotEditable>Big ol block here lol</NotEditable>;
		},
		label: 'All runs list',
		schema: {
			event: fields.relationship({
				label: 'Event',
				listKey: 'Event',
				selection:
					'id startDate shortname runs(orderBy: { scheduledTime: asc }) { id game category runners { id username } finalTime platform youtubeVOD twitchVOD racer race coop }',
			}),
		},
	}),
	image: component({
		preview(props) {
			return (
				<div>
					<img src={props.fields.imgUrl.value} alt={props.fields.caption.value} />
					<caption>{props.fields.caption.value}</caption>
				</div>
			);
		},
		label: 'Image',
		schema: {
			imgUrl: fields.url({ label: 'Image URL' }),
			caption: fields.text({ label: '' }),
		},
	}),
};

export interface AllRunsEvent {
	id: string;
	startDate: string;
	shortname: string;
	runs: {
		id: string;
		game: string;
		category: string;
		runners: {
			id: string;
			username: string;
		}[];
		finalTime: string;
		platform: string;
		youtubeVOD: string;
		twitchVOD: string;
		race: boolean;
		coop: boolean;
		donationIncentiveObject: {
			title: string;
		}[];
		racer: string;
	}[];
}

export type PostEventRenderers = InferRenderersForComponentBlocks<typeof PostEventComponentBlocks>;
