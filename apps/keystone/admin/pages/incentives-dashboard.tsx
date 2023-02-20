import { Heading, useTheme } from "@keystone-ui/core";
import React, { useEffect, useState } from "react";
import { Link } from "@keystone-6/core/admin-ui/router";
import {
	useMutation,
	useQuery,
	gql,
	useLazyQuery,
} from "@keystone-6/core/admin-ui/apollo";
import { Button } from "@keystone-ui/button";
import { Select, FieldContainer, FieldLabel } from "@keystone-ui/fields";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	ListItem,
	ListItemButton,
	ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { VariableSizeList, ListChildComponentProps } from "react-window";
import { useToasts } from "@keystone-ui/toast";
import { War } from "../components/Incentives/War";
import { Goal } from "../components/Incentives/Goal";
import type {
	Goal as GoalData,
	War as WarData,
} from "../../src/schema/incentives";
import { NewIncentiveInput } from "../components/Incentives/NewIncentiveInput";

const QUERY_EVENTS = gql`
	query {
		events {
			shortname
		}
	}
`;

interface QUERY_EVENTS_RESULTS {
	events: {
		shortname: string;
	}[];
}

const QUERY_INCENTIVES = gql`
	query ($event: String) {
		event(where: { shortname: $event }) {
			runs {
				id
				game
				category
				event {
					shortname
				}
			}
			donationIncentivesCount
			donationIncentives(orderBy: { id: asc }) {
				id
				title
				notes
				type
				run {
					id
					game
					category
					scheduledTime
				}
				data
				active
			}
		}
	}
`;

interface QUERY_INCENTIVES_RESULTS {
	event?: {
		runs: {
			id: string;
			game: string;
			category: string;
			event: {
				shortname: string;
			};
		}[];
		donationIncentivesCount: number;
		donationIncentives: {
			id: string;
			title: string;
			notes: string;
			type: string;
			run: {
				id: string;
				game: string;
				category: string;
				scheduledTime: string;
			};
			data: any; // use `any` if data type is unknown
			active: boolean;
		}[];
	};
}

const MUTATION_UPDATE_INCENTIVE = gql`
	mutation ($incentive: ID, $active: Boolean, $data: JSON) {
		updateIncentive(
			where: { id: $incentive }
			data: { data: $data, active: $active }
		) {
			id
			title
		}
	}
`;

export interface MUTATION_UPDATE_INCENTIVE_RESULTS {
	updateIncentive: {
		id: string;
		title: string;
	};
}

const incentiveTypes = [
	{ label: "Goal", value: "goal" },
	{ label: "War", value: "war" },
];

export default function RunsManager() {
	const [selectedEvent, setSelectedEvent] = useState({
		label: "ASGX2023",
		value: "ASGX2023",
	});
	const [selectedIncentiveIndex, setSelectedIncentiveIndex] = useState(0);

	const { addToast } = useToasts();

	const eventsList = useQuery<QUERY_EVENTS_RESULTS>(QUERY_EVENTS);
	const eventData = useQuery<QUERY_INCENTIVES_RESULTS>(QUERY_INCENTIVES, {
		variables: { event: selectedEvent.value },
	});

	const [updateIncentiveMutation, updateIncentiveMutationData] =
		useMutation<MUTATION_UPDATE_INCENTIVE_RESULTS>(
			MUTATION_UPDATE_INCENTIVE,
		);

	const eventsOptions = eventsList.data?.events.map((event) => ({
		value: event.shortname,
		label: event.shortname,
	}));

	const sortedIncentives =
		eventData.data?.event?.donationIncentives.map((a) => ({ ...a })) ?? [];
	sortedIncentives.sort(
		(a, b) =>
			new Date(a.run?.scheduledTime ?? 0).getTime() -
			new Date(b.run?.scheduledTime ?? 0).getTime(),
	);
	const incentiveData = sortedIncentives[selectedIncentiveIndex];

	// Update Incentive Feedback
	useEffect(() => {
		// console.log(updateRunMutationData);
		if (updateIncentiveMutationData.error) {
			console.error(updateIncentiveMutationData.error);
			addToast({
				title: "Error updating incentive",
				tone: "negative",
				message: updateIncentiveMutationData.error.message,
			});
		} else if (updateIncentiveMutationData.data?.updateIncentive) {
			addToast({
				title: `Updated ${updateIncentiveMutationData.data.updateIncentive.title}`,
				id: updateIncentiveMutationData.data.updateIncentive.id,
				tone: "positive",
				preserve: false,
			});
		}
	}, [updateIncentiveMutationData.data, updateIncentiveMutationData.error]);

	function renderIncentive(
		incentive: QUERY_INCENTIVES_RESULTS["event"]["donationIncentives"][0],
	) {
		switch (incentive.type) {
			case "war":
				return (
					<War
						incentive={incentive}
						incentiveUpdate={updateIncentiveMutation}
					/>
				);
			case "goal":
				return (
					<Goal
						incentive={incentive}
						incentiveUpdate={updateIncentiveMutation}
					/>
				);
			default:
				console.error("Unknown incentive type", incentive);
				break;
		}
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}>
			<Heading type="h3">Incentives</Heading>
			<div style={{ marginTop: 24 }} />
			<FieldContainer>
				<FieldLabel>Event</FieldLabel>
				<Select
					onChange={(e) => setSelectedEvent(e)}
					value={selectedEvent}
					options={eventsOptions}
				/>
			</FieldContainer>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel1a-content"
					id="panel1a-header">
					<b>Add incentive</b>
				</AccordionSummary>
				<AccordionDetails>
					<NewIncentiveInput />
				</AccordionDetails>
			</Accordion>

			{eventData?.data?.event && (
				<>
					<div
						style={{
							border: "1px solid #e1e5e9",
							borderRadius: 6,
							display: "flex",
							marginTop: 16,
						}}>
						<VariableSizeList
							height={650}
							width={400}
							estimatedItemSize={65}
							itemSize={(index) => {
								return (
									65 +
									(sortedIncentives[index].title.length +
										sortedIncentives[index].run.game
											.length >
									50
										? 65
										: 0)
								);
							}}
							itemCount={
								eventData.data.event.donationIncentivesCount
							}
							overscanCount={5}
							itemData={sortedIncentives.map((incentive) => ({
								...incentive,
								setSelectedIncentiveIndex,
							}))}
							style={{
								borderRight: "1px solid #e1e5e9",
								background: "#fafbfc",
							}}>
							{renderRunRow}
						</VariableSizeList>
						{incentiveData && (
							<div
								style={{
									flexGrow: 1,
									padding: "0 16px",
									minWidth: 800,
								}}>
								<h1>{incentiveData.title}</h1>
								<Button
									size="small"
									weight="link"
									tone="active"
									as={Link}
									href={`/runs/${incentiveData.run.id}`}>
									View Run details
								</Button>
								<p>
									Game <b>{incentiveData.run.game}</b>
									<br />
									Type{" "}
									<b style={{ textTransform: "capitalize" }}>
										{incentiveData.type}
									</b>
									<br />
									Notes <b>{incentiveData.notes}</b>
								</p>
								{renderIncentive(incentiveData)}
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}

function renderRunRow(props: ListChildComponentProps) {
	const { index, style } = props;
	const data = props.data[index];

	// console.log(data);

	return (
		<ListItem
			style={{
				...style,
				background: data.active ? undefined : "#e46060",
			}}
			key={data.id}
			component="div"
			disablePadding>
			<ListItemButton
				onClick={() => data.setSelectedIncentiveIndex(index)}>
				<ListItemText
					primary={`${data.title} - ${data.run.game}`}
					secondary={data.active ? "Active" : "Closed"}
				/>
			</ListItemButton>
		</ListItem>
	);
}
