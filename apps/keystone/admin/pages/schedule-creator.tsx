/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, Inline, Stack, Heading } from '@keystone-ui/core';
import React, { useEffect, useState } from 'react';
import { PageContainer } from '@keystone-6/core/admin-ui/components';
import { Link } from '@keystone-6/core/admin-ui/router';
import { useMutation, useQuery, gql, useLazyQuery } from '@keystone-6/core/admin-ui/apollo';
import { Button } from '@keystone-ui/button';
import { Select, FieldContainer, FieldLabel, TextInput, DatePicker } from '@keystone-ui/fields';
import { ListItem, ListItemButton, ListItemText, Paper } from '@mui/material';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { format, parse, parseISO } from 'date-fns';
import { useToasts } from '@keystone-ui/toast';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import { Lists } from '.keystone/types';

const EventTitle = styled.h1`
	text-align: center;
`;

const RunsBox = styled.div`
	background: #ffffff;
	width: 100%;
	height: 42%;
`;

const SubmissionBox = styled(Paper)`
	background: #a4d2e2;
	width: 100%;
	height: 39%;
`;

const EVENTS_LIST_QUERY = gql`
	query {
		events {
			shortname
		}
	}
`;

const EVENT_QUERY = gql`
	query ($event: String) {
		event(where: { shortname: $event }) {
			submissionsCount(where: { status: { equals: accepted } })
			runsCount
			runs {
				id
				runners {
					id
					username
				}
				game
				category
				platform
				estimate
				finalTime
				donationIncentive
				race
				coop
				twitchVOD
				youtubeVOD
				scheduledTime
				originalSubmission {
					id
				}
			}
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
				donationIncentive
				ageRating
				specialReqs
				race
				racer
				coop
				video
				availability
				willingBackup
			}
		}
	}
`;

interface EventsListQuery {
	events: {
		shortname: string;
	}[];
}

interface EventQuery {
	event: {
		submissionsCount: number;
		runsCount: number;
		runs: {
			id: string;
			runner: {
				id: string;
				username: string;
			};
			game: string;
			category: string;
			platform: string;
			estimate: string;
			finalTime?: string;
			donationIncentive?: string;
			race: Lists.Run.Item['race'];
			coop: boolean;
			twitchVOD?: string;
			youtubeVOD?: string;
			scheduledTime?: Date;
			originalSubmission?: {
				id: string;
			};
		}[];
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
			donationIncentive?: string;
			ageRating: Lists.Submission.Item['ageRating'];
			race: Lists.Submission.Item['race'];
			racer?: string;
			coop: boolean;
			specialReqs?: string;
			video: string;
			availability: boolean[];
			willingBackup: boolean;
		}[];
	};
}

export default function ScheduleCreator() {
	const [selectedEvent, setSelectedEvent] = useState({ label: '', value: '' });

	const { data: eventsList } = useQuery<EventsListQuery>(EVENTS_LIST_QUERY);
	const { data: eventData } = useQuery<EventQuery>(EVENT_QUERY, { variables: { event: selectedEvent.value } });

	const eventsOptions = eventsList?.events
		.map((event) => ({ value: event.shortname, label: event.shortname }))
		.reverse();

	function onDragEnd(result) {}

	console.log(eventData);

	return (
		<PageContainer header={<Heading type="h3">Schedule Creator</Heading>}>
			<div css={{ marginTop: 24 }} />
			<FieldContainer style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
				<FieldLabel style={{ minWidth: '', marginRight: 8 }}>Event</FieldLabel>
				<Select
					css={css`
						min-width: 200px;
					`}
					onChange={(e) => setSelectedEvent(e)}
					value={selectedEvent}
					options={eventsOptions}
				/>
			</FieldContainer>
			<EventTitle>{selectedEvent.label}</EventTitle>

			<DragDropContext onDragEnd={onDragEnd}>
				<RunsBox>
					<Droppable droppableId="runList">
						{(provided) => (
							<div ref={provided.innerRef} {...provided.droppableProps}>
								{eventData.event?.runs.map((run, index) => (
									<RunItem run={run} index={index} />
								))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</RunsBox>
				<SubmissionBox elevation={4}>
					<Droppable droppableId="submissionList">
						{(provided) => (
							<div ref={provided.innerRef} {...provided.droppableProps}>
								{eventData.event?.submissions.map((submission, index) => (
									<SubmissionItem submission={submission} index={index} />
								))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</SubmissionBox>
			</DragDropContext>
		</PageContainer>
	);
}

interface RunItemProps {
	run: EventQuery['event']['runs'][0];
	index: number;
}

function RunItem({ run, index }: RunItemProps) {
	return (
		<Draggable draggableId={run.id} index={index}>
			{(provided) => <div>{run.game}</div>}
		</Draggable>
	);
}

interface SubmissionItemProps {
	submission: EventQuery['event']['submissions'][0];
	index: number;
}

function SubmissionItem({ submission, index }: SubmissionItemProps) {
	return (
		<Draggable draggableId={submission.id} index={index}>
			{(provided) => <div>{submission.game}</div>}
		</Draggable>
	);
}
