import { Heading } from "@keystone-ui/core";
import { useEffect, useState } from "react";
import { Link } from "@keystone-6/core/admin-ui/router";
import {
	useMutation,
	useQuery,
	gql,
	OperationVariables,
	useLazyQuery,
	ApolloCache,
	DefaultContext,
	MutationFunctionOptions,
} from "@keystone-6/core/admin-ui/apollo";
import { Button } from "@keystone-ui/button";
import { Select, FieldContainer, FieldLabel } from "@keystone-ui/fields";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useToasts } from "@keystone-ui/toast";
import { War } from "../components/Incentives/War";
import { Goal } from "../components/Incentives/Goal";
import { NewIncentiveInput } from "../components/Incentives/NewIncentiveInput";
import { Flag, PieChart } from "@mui/icons-material";
import Head from "next/head";

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

interface IncentiveData {
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
}

const MUTATION_UPDATE_INCENTIVE = gql`
	mutation ($incentive: ID, $active: Boolean, $data: JSON) {
		updateIncentive(where: { id: $incentive }, data: { data: $data, active: $active }) {
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

function renderIncentive(
	// @ts-ignore
	incentive: QUERY_INCENTIVES_RESULTS["event"]["donationIncentives"][0],
	updateIncentiveMutation: (
		mutationData: MutationFunctionOptions<
			MUTATION_UPDATE_INCENTIVE_RESULTS,
			OperationVariables,
			DefaultContext,
			ApolloCache<any>
		>,
	) => void,
) {
	switch (incentive?.type) {
		case "war":
			return <War key={incentive.id} incentive={incentive} incentiveUpdate={updateIncentiveMutation} />;
		case "goal":
			return <Goal key={incentive.id} incentive={incentive} incentiveUpdate={updateIncentiveMutation} />;
		case undefined:
			return <></>;
		default:
			console.error("Unknown incentive type", incentive);
			break;
	}
}

type SelectOption = {
	label: string;
	value: string;
} | null;

export default function RunsManager() {
	const [selectedEvent, setSelectedEvent] = useState<SelectOption>(getEventInURLQuery());
	const [selectedIncentiveIndex, setSelectedIncentiveIndex] = useState(0);
	const [sortedIncentives, setSortedIncentiveData] = useState<IncentiveData[]>([]);
	const [incentiveData, setIncentiveData] = useState<IncentiveData | undefined>(undefined);
	const [actualEventData, setActualEventData] = useState<QUERY_INCENTIVES_RESULTS | undefined>(undefined);

	const { addToast } = useToasts();

	const eventsList = useQuery<QUERY_EVENTS_RESULTS>(QUERY_EVENTS);
	const [refetchEventData, { data: eventData }] = useLazyQuery<QUERY_INCENTIVES_RESULTS>(QUERY_INCENTIVES, {
		fetchPolicy: "no-cache",
	});

	const [updateIncentiveMutation, updateIncentiveMutationData] =
		useMutation<MUTATION_UPDATE_INCENTIVE_RESULTS>(MUTATION_UPDATE_INCENTIVE);

	const eventsOptions = eventsList.data?.events.map((event) => ({
		value: event.shortname,
		label: event.shortname,
	}));

	useEffect(() => {
		setActualEventData(eventData);
	}, [eventData]);

	useEffect(() => {
		const mutableSortedIncentives = actualEventData?.event?.donationIncentives.map((a) => ({ ...a })) ?? [];
		mutableSortedIncentives.sort(
			(a, b) => new Date(a.run?.scheduledTime ?? 0).getTime() - new Date(b.run?.scheduledTime ?? 0).getTime(),
		);

		setSortedIncentiveData(mutableSortedIncentives);
	}, [actualEventData]);

	useEffect(() => {
		setIncentiveData(sortedIncentives[selectedIncentiveIndex]);
	}, [sortedIncentives, selectedIncentiveIndex]);

	function handleEventSelection(option: { label: string; value: string } | null) {
		const urlParams = new URLSearchParams(window.location.search);

		if (option) {
			urlParams.set("event", option.value);
		} else {
			urlParams.delete("event");
		}

		if (urlParams.size > 0) {
			const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
			window.history.pushState({ path: newUrl }, "", newUrl);
		} else {
			window.history.pushState({}, "", window.location.pathname);
		}

		setSelectedEvent(option);
	}

	function getEventInURLQuery(): SelectOption {
		const eventName = new URLSearchParams(window.location.search).get("event");

		if (!eventName) {
			return null;
		}

		return {
			label: eventName,
			value: eventName,
		};
	}

	useEffect(() => {
		refetchCurrentEvent();
	}, [selectedEvent]);

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

	function refetchCurrentEvent() {
		if (selectedEvent?.value) {
			refetchEventData({ variables: { event: selectedEvent.value } }).then((data) => {
				setActualEventData(data.data);
				console.log("New data", data.data);
			});
		}
	}

	function mutateDataAndThenRefetch(
		mutationData: MutationFunctionOptions<
			MUTATION_UPDATE_INCENTIVE_RESULTS,
			OperationVariables,
			DefaultContext,
			ApolloCache<any>
		>,
	) {
		updateIncentiveMutation(mutationData).then(() => {
			refetchCurrentEvent();
		});
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}>
			<Head>
				<title>Incentives</title>
			</Head>
			<Heading type="h3">Incentives</Heading>
			<div style={{ marginTop: 24 }} />
			<FieldContainer>
				<FieldLabel>Event</FieldLabel>
				<Select onChange={(e) => handleEventSelection(e)} value={selectedEvent} options={eventsOptions} />
			</FieldContainer>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
					<b>Add incentive</b>
				</AccordionSummary>
				<AccordionDetails>
					<NewIncentiveInput eventId={selectedEvent?.value} newSubmissionAdded={refetchCurrentEvent} />
				</AccordionDetails>
			</Accordion>

			{actualEventData?.event && (
				<>
					<div
						style={{
							border: "1px solid #e1e5e9",
							borderRadius: 6,
							display: "flex",
							marginTop: 16,
							minHeight: 600,
						}}>
						<List
							style={{
								borderRight: "1px solid #e1e5e9",
								background: "#fafbfc",
								minWidth: 250,
								maxWidth: 400,
								maxHeight: 800,
								overflowY: "scroll",
							}}>
							{sortedIncentives.map((incentive, i) => (
								<ListItem key={incentive.id} disablePadding>
									<ListItemButton
										selected={selectedIncentiveIndex === i}
										onClick={() => {
											setSelectedIncentiveIndex(i);
										}}>
										<ListItemIcon>
											{incentive.type === "goal" ? <Flag /> : <PieChart />}
										</ListItemIcon>
										<ListItemText
											primary={`${incentive.run.game} – ${incentive.title}`}
											secondary={incentive.active ? "Active" : "Inactive"}
										/>
									</ListItemButton>
								</ListItem>
							))}
						</List>
						<div
							style={{
								flexGrow: 1,
								padding: "0 16px 16px 16px",
								minWidth: 800,
								maxWidth: 800,
							}}>
							<h1>{incentiveData?.title}</h1>
							<Button
								size="small"
								weight="link"
								tone="active"
								as={Link}
								isDisabled={!incentiveData?.run}
								href={`/runs/${incentiveData?.run.id}`}>
								View Run details
							</Button>
							<p>
								Game <b>{incentiveData?.run.game}</b>
								<br />
								Type <b style={{ textTransform: "capitalize" }}>{incentiveData?.type}</b>
								<br />
								Notes <b>{incentiveData?.notes}</b>
							</p>
							{renderIncentive(incentiveData, mutateDataAndThenRefetch)}
						</div>
					</div>
				</>
			)}
		</div>
	);
}
