/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, Inline, Stack, Heading, useTheme } from '@keystone-ui/core';
import React, { useEffect } from 'react';
import { Link } from '@keystone-6/core/admin-ui/router';
import { useMutation, useQuery, gql, useLazyQuery } from '@keystone-6/core/admin-ui/apollo';
import { Button } from '@keystone-ui/button';
import { Select, FieldContainer, FieldLabel, TextInput, Checkbox } from '@keystone-ui/fields';
import { Accordion, AccordionDetails, AccordionSummary, ListItem, ListItemButton, ListItemText } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { useToasts } from '@keystone-ui/toast';
import { Goal, War } from '../../schema/incentives';

const EVENTS_LIST_QUERY = gql`
	query {
		events {
			shortname
		}
	}
`;

const INCENTIVES_QUERY = gql`
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

const NEW_INCENTIVE_MUTATION = gql`
	mutation ($run: ID, $runEvent: String, $title: String, $type: String, $data: JSON) {
		createIncentive(
			data: {
				run: { connect: { id: $run } }
				event: { connect: { shortname: $runEvent } }
				title: $title
				type: $type
				data: $data
				active: true
			}
		) {
			id
			title
		}
	}
`;

const UPDATE_INCENTIVE_MUTATION = gql`
	mutation ($incentive: ID, $active: Boolean, $data: JSON) {
		updateIncentive(where: { id: $incentive }, data: { data: $data, active: $active }) {
			id
			title
		}
	}
`;

const incentiveTypes = [
	{ label: 'Goal', value: 'goal' },
	{ label: 'War', value: 'war' },
];

export default function RunsManager() {
	const { palette, spacing } = useTheme();
	const [selectedEvent, setSelectedEvent] = React.useState({ label: '', value: 'ASM2022' });
	const [selectedIncentiveIndex, setSelectedIncentiveIndex] = React.useState(0);

	const [incentiveActive, setIncentiveActive] = React.useState(false);
	const [incentiveRawData, setIncentiveRawData] = React.useState<Goal | War | undefined>(undefined);

	const [newIncentiveTitle, setNewIncentiveTitle] = React.useState('');
	const [newIncentiveRun, setNewIncentiveRun] = React.useState({ label: '', value: '' });
	const [newIncentiveType, setNewIncentiveType] = React.useState(incentiveTypes[0]);
	const [newIncentiveData, setNewIncentiveData] = React.useState<Goal | War | undefined>(undefined);

	const { addToast } = useToasts();

	const eventsList = useQuery(EVENTS_LIST_QUERY);
	const eventData = useQuery(INCENTIVES_QUERY, { variables: { event: selectedEvent.value } });

	const [updateIncentiveMutation, updateIncentiveMutationData] = useMutation(UPDATE_INCENTIVE_MUTATION);
	const [addIncentiveMutation, addIncentiveMutationData] = useMutation(NEW_INCENTIVE_MUTATION);

	const eventsOptions = eventsList.data?.events.map((event) => ({ value: event.shortname, label: event.shortname }));
	const runOptions = eventData.data?.event?.runs?.map((run) => ({
		value: run.id,
		label: `${run.game} - ${run.category}`,
	}));

	const sortedIncentives = structuredClone(eventData.data?.event.donationIncentives) ?? [];
	sortedIncentives.sort(
		(a, b) => new Date(a.run?.scheduledTime ?? 0).getTime() - new Date(b.run?.scheduledTime ?? 0).getTime()
	);
	const incentiveData = sortedIncentives[selectedIncentiveIndex];

	useEffect(() => {
		if (!eventData.data || !incentiveData) return;

		setIncentiveActive(incentiveData.active);
		setIncentiveRawData(incentiveData.data);
	}, [selectedIncentiveIndex]);

	// Add Incentive Feedback
	useEffect(() => {
		// console.log(updateRunMutationData);
		if (addIncentiveMutationData.error) {
			console.error(addIncentiveMutationData.error);
			addToast({
				title: 'Error updating incentive',
				tone: 'negative',
				message: addIncentiveMutationData.error.message,
			});
		} else if (addIncentiveMutationData.data?.createIncentive) {
			setNewIncentiveData({ goal: 0, current: 0 });
			setNewIncentiveRun({ value: '', label: '' });
			setNewIncentiveTitle('');
			setNewIncentiveType(incentiveTypes[0]);

			addToast({
				title: `Added ${addIncentiveMutationData.data.createIncentive.title}`,
				id: addIncentiveMutationData.data.createIncentive.id,
				tone: 'positive',
				preserve: false,
			});
		}
	}, [addIncentiveMutationData.data, addIncentiveMutationData.error]);

	// Update Incentive Feedback
	useEffect(() => {
		// console.log(updateRunMutationData);
		if (updateIncentiveMutationData.error) {
			console.error(updateIncentiveMutationData.error);
			addToast({
				title: 'Error updating incentive',
				tone: 'negative',
				message: updateIncentiveMutationData.error.message,
			});
		} else if (updateIncentiveMutationData.data?.updateIncentive) {
			addToast({
				title: `Updated ${updateIncentiveMutationData.data.updateIncentive.title}`,
				id: updateIncentiveMutationData.data.updateIncentive.id,
				tone: 'positive',
				preserve: false,
			});
		}
	}, [updateIncentiveMutationData.data, updateIncentiveMutationData.error]);

	function UpdateIncentive() {
		if (!incentiveData.id) return;
		// console.log(incentiveRawData);
		// console.log(!Object.hasOwn(incentiveRawData, 'goal'), !Object.hasOwn(incentiveRawData, 'current'))
		// console.log(isNaN((incentiveRawData as Goal).current))
		switch (incentiveData.type) {
			case 'goal':
				if (!Object.hasOwn(incentiveRawData, 'goal') || !Object.hasOwn(incentiveRawData, 'current')) return;
				if (isNaN((incentiveRawData as Goal).current)) return;
				break;
			case 'war':
				if (!Object.hasOwn(incentiveRawData, 'options')) return;
				break;
			default:
				return;
		}

		updateIncentiveMutation({
			variables: {
				incentive: incentiveData.id,
				data: incentiveRawData,
				active: incentiveActive,
			},
		});

		eventData.refetch();
	}

	function AddIncentive() {
		if (!newIncentiveTitle || !newIncentiveRun || !newIncentiveType.value) return;

		switch (newIncentiveType.value) {
			case 'goal':
				if (!Object.hasOwn(newIncentiveData, 'goal')) return;
				setNewIncentiveData({ ...newIncentiveData, current: 0 });
				break;
			case 'war':
				if (!Object.hasOwn(newIncentiveData, 'options')) return;
				break;
			default:
				return;
		}

		const runEvent = eventData.data?.event?.runs.find((run) => run.id === newIncentiveRun.value)?.event.shortname;
		if (!runEvent) return;

		addIncentiveMutation({
			variables: {
				run: newIncentiveRun.value,
				runEvent,
				title: newIncentiveTitle,
				type: newIncentiveType.value,
				data: newIncentiveData,
			},
		});

		eventData.refetch();
	}

	// console.log();
	console.log(sortedIncentives, eventData.data?.event.donationIncentives);

	return (
		<div css={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
			<Heading type="h3">Incentives</Heading>
			<div css={{ marginTop: 24 }} />
			<FieldContainer>
				<FieldLabel>Event</FieldLabel>
				<Select onChange={(e) => setSelectedEvent(e)} value={selectedEvent} options={eventsOptions} />
			</FieldContainer>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
					<b>Add incentive</b>
				</AccordionSummary>
				<AccordionDetails>
					<Stack gap="medium">
						<Inline gap="small">
							<FieldContainer>
								<FieldLabel>Incentive Name</FieldLabel>
								<TextInput
									onChange={(e) => setNewIncentiveTitle(e.target.value)}
									value={newIncentiveTitle}
									disabled={!selectedEvent.value}
								/>
							</FieldContainer>
							<FieldContainer>
								<FieldLabel>Run</FieldLabel>
								<Select
									onChange={(e) => setNewIncentiveRun(e)}
									value={newIncentiveRun}
									options={runOptions}
									isDisabled={!selectedEvent.value}
									width="large"
								/>
							</FieldContainer>
						</Inline>
						<FieldContainer>
							<FieldLabel>Type</FieldLabel>
							<Select
								onChange={(e) => {
									switch (e.value) {
										case 'goal':
											setNewIncentiveData({ goal: 0, current: 0 });
											break;
										case 'war':
											setNewIncentiveData({ options: [] });
											break;
									}
									setNewIncentiveType(e);
								}}
								value={newIncentiveType}
								options={incentiveTypes}
								isDisabled={!selectedEvent.value}
							/>
						</FieldContainer>
						{newIncentiveType.value === 'goal' && (
							<>
								<FieldContainer>
									<FieldLabel>Goal ${(newIncentiveData as Goal)?.goal?.toLocaleString() ?? 0}</FieldLabel>
									<TextInput
										onChange={(e) => setNewIncentiveData({ ...newIncentiveData, goal: parseInt(e.target.value) })}
										type="number"
										value={(newIncentiveData as Goal)?.goal ?? 0}
										disabled={!selectedEvent.value}
									/>
								</FieldContainer>
							</>
						)}
						{newIncentiveType.value === 'war' && (
							<>
								<FieldContainer>
									<FieldLabel>Options</FieldLabel>
									{(newIncentiveData as War)?.options.map((item, i) => {
										return (
											<TextInput
												placeholder="Name"
												onChange={(e) => {
													const mutableOptions = [...(newIncentiveData as War).options];
													mutableOptions[i].name = e.target.value;
													setNewIncentiveData({ ...newIncentiveData, options: mutableOptions });
												}}
												value={item.name}
											/>
										);
									})}
								</FieldContainer>
								<Button
									tone="positive"
									weight="bold"
									onClick={() => {
										const mutableOptions = [...(newIncentiveData as War).options];
										mutableOptions.push({ name: '', total: 0 });
										setNewIncentiveData({
											...newIncentiveData,
											options: mutableOptions,
										});
									}}
								>
									+ Add
								</Button>
							</>
						)}
						<p>By default this incentive will start active</p>
						<Button
							onClick={AddIncentive}
							tone="active"
							weight="bold"
							isDisabled={!selectedEvent.value || !newIncentiveTitle}
						>
							Add new incentive
						</Button>
					</Stack>
				</AccordionDetails>
			</Accordion>

			{eventData?.data?.event && (
				<>
					<div css={{ border: '1px solid #e1e5e9', borderRadius: 6, display: 'flex', marginTop: 16 }}>
						<FixedSizeList
							height={650}
							width={400}
							itemSize={46}
							itemCount={eventData.data.event.donationIncentivesCount}
							overscanCount={5}
							itemData={sortedIncentives.map((incentive) => ({
								...incentive,
								setSelectedIncentiveIndex,
							}))}
							css={{ borderRight: '1px solid #e1e5e9', background: '#fafbfc' }}
						>
							{renderRunRow}
						</FixedSizeList>
						{incentiveData && (
							<div css={{ flexGrow: 1, padding: '0 16px', minWidth: 800 }}>
								<h1>{incentiveData.title}</h1>
								<Button size="small" weight="link" tone="active" as={Link} href={`/runs/${incentiveData.run.id}`}>
									View Run details
								</Button>
								<p>
									Game <b>{incentiveData.run.game}</b>
									<br />
									Type <b css={{ textTransform: 'capitalize' }}>{incentiveData.type}</b>
								</p>
								<Stack gap="medium">
									{incentiveData.type === 'goal' && (
										<>
											<FieldContainer>
												<FieldLabel>Goal ${incentiveData.data.goal}</FieldLabel>
											</FieldContainer>
											<FieldContainer>
												<p>
													Needs ${incentiveData.data.goal - incentiveData.data.current} more dollars.{' '}
													{Math.round((incentiveData.data.current / incentiveData.data.goal) * 100)}% of the way there.
												</p>
											</FieldContainer>
											<FieldContainer>
												<FieldLabel>Current</FieldLabel>
												<TextInput
													onChange={(e) =>
														setIncentiveRawData({ ...incentiveRawData, current: parseInt(e.target.value) })
													}
													type="number"
													value={(incentiveRawData as Goal)?.current ?? 0}
												/>
											</FieldContainer>
										</>
									)}
									{incentiveData.type === 'war' && (incentiveRawData as War)?.options && (
										<>
											<FieldContainer>
												{(incentiveRawData as War).options.length > 0 ? (
													<p>
														Currently{' '}
														<b>{[...(incentiveRawData as War).options].sort((a, b) => b.total - a.total)[0].name}</b>
													</p>
												) : (
													<p>No options submitted</p>
												)}
											</FieldContainer>
											<FieldContainer>
												<FieldLabel>Options</FieldLabel>

												{(incentiveRawData as War).options.map((item, i) => {
													return (
														<Inline>
															<TextInput
																placeholder="Name"
																onChange={(e) => {
																	const mutableOptions = structuredClone((incentiveRawData as War).options);
																	mutableOptions[i].name = e.target.value;
																	setIncentiveRawData({ ...incentiveRawData, options: mutableOptions });
																}}
																value={item.name}
															/>
															<TextInput
																placeholder="Amount"
																type="number"
																onChange={(e) => {
																	const mutableOptions = structuredClone((incentiveRawData as War).options);
																	mutableOptions[i].total = parseFloat(e.target.value);
																	setIncentiveRawData({ ...incentiveRawData, options: mutableOptions });
																}}
																value={item.total}
															/>
															<span>${item.total.toLocaleString()}</span>
														</Inline>
													);
												})}
											</FieldContainer>
											<Button
												css={{ marginTop: 8 }}
												tone="positive"
												weight="bold"
												onClick={() => {
													const mutableOptions = [...(incentiveRawData as War).options];
													mutableOptions.push({ name: '', total: 0 });
													setIncentiveRawData({
														...incentiveRawData,
														options: mutableOptions,
													});
												}}
											>
												+ Add
											</Button>
										</>
									)}
									<FieldContainer>
										<Checkbox
											size="large"
											checked={incentiveActive}
											css={{ marginRight: spacing.medium }}
											onChange={(e) => {
												setIncentiveActive(e.target.checked);
											}}
										>
											Active
										</Checkbox>
									</FieldContainer>
								</Stack>
								<br />
								<Button tone="active" weight="bold" onClick={UpdateIncentive} isDisabled={!incentiveData.id}>
									Update
								</Button>
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
		<ListItem style={style} key={data.id} component="div" disablePadding>
			<ListItemButton onClick={() => data.setSelectedIncentiveIndex(index)}>
				<ListItemText primary={`${data.title} - ${data.run.game}`} />
			</ListItemButton>
		</ListItem>
	);
}
