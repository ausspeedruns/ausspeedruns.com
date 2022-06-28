/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, useTheme, Box, Heading } from '@keystone-ui/core';
import React, { useEffect } from 'react';
import { Button } from '@keystone-ui/button';
import { Tooltip } from '@keystone-ui/tooltip';
import { TextArea, FieldContainer, FieldLabel, Checkbox } from '@keystone-ui/fields';
import { InputAdornment, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLazyQuery, gql, useQuery, useMutation } from '@keystone-6/core/admin-ui/apollo';

const BigSearch = styled(TextField)(({ theme }) => ({
	'& .MuiOutlinedInput-input': {
		height: '5rem',
		fontSize: '4rem',
		textAlign: 'center',
		textTransform: 'uppercase',
		marginLeft: -50.75,
	},
	'& .MuiTypography-root': {
		fontSize: '4rem',
	},
}));

function shirtSizeToHuman(size: string) {
	switch (size) {
		case 'xl2':
			return '2XL';
		case 'xl3':
			return '3XL';
		default:
			return size;
			break;
	}
}

export default function RunsManager() {
	const { palette, spacing } = useTheme();

	const [ticketCode, setTicketCode] = React.useState('');
	const [ticketNotes, setTicketNotes] = React.useState('');

	const ticketQuery = useQuery(
		gql`
			query ($ticketID: String) {
				ticket(where: { ticketID: $ticketID }) {
					taken
					numberOfTickets
					notes
					paid
					created
					user {
						username
						shirts(orderBy: { created: asc }) {
							id
							size
							colour
							paid
							taken
						}
					}
				}
			}
		`,
		{
			variables: {
				ticketID: 'T-' + ticketCode.toUpperCase(),
			},
		}
	);

	const [shirtMutation, shirtMutationData] = useMutation(gql`
		mutation ($shirtID: ID, $taken: Boolean) {
			updateShirtOrder(where: { id: $shirtID }, data: { taken: $taken }) {
				id
			}
		}
	`);

	const [notesMutation, notesMutationData] = useMutation(gql`
		mutation ($ticketID: String, $notes: String) {
			updateTicket(where: { ticketID: $ticketID }, data: { notes: $notes }) {
				id
			}
		}
	`);

	const [ticketTakenMutation, ticketTakenMutationData] = useMutation(gql`
		mutation ($ticketID: String) {
			updateTicket(where: { ticketID: $ticketID }, data: { taken: true }) {
				id
			}
		}
	`);

	// const [sendTicketQuery, ticketQuery] = useLazyQuery(
	// 	gql`
	// 		query ($ticketID: String) {
	// 			ticket(where: { ticketID: $ticketID }) {
	// 				taken
	// 				method
	// 				numberOfTickets
	// 				notes
	// 				paid
	// 				totalCost
	// 			}
	// 		}
	// 	`
	// );

	useEffect(() => {
		if (ticketCode.length === 9) {
			// sendTicketQuery({ variables: { ticketID: 'T-' + ticketCode.toUpperCase() } });
			ticketQuery.refetch({ ticketID: 'T-' + ticketCode.toUpperCase() });
		}
	}, [ticketCode]);

	useEffect(() => {
		if (!ticketQuery.data?.ticket) return;
		setTicketNotes(ticketQuery.data?.ticket.notes);
	}, [ticketQuery]);

	// console.log(ticketQuery);
	// console.log(ticketQuery.data?.ticket);

	const invalidTicket = ticketQuery.data?.ticket?.taken || !ticketQuery.data?.ticket?.paid;

	return (
		<div css={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
			<Heading>Podium</Heading>
			<div css={{ marginTop: 24 }} />
			<BigSearch
				onChange={(e) => setTicketCode(e.target.value)}
				value={ticketCode}
				InputProps={{
					startAdornment: <InputAdornment position="start">T-</InputAdornment>,
				}}
			/>
			<div css={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
				<p>{ticketCode.length}/9</p>
				<Button
					size="large"
					tone="positive"
					weight="bold"
					onClick={() => {
						// sendTicketQuery({ variables: { ticketID: 'T-' + ticketCode.toUpperCase() } });
						ticketQuery.refetch({ ticketID: 'T-' + ticketCode.toUpperCase() });
					}}
				>
					Search
				</Button>
			</div>
			{ticketQuery.data?.ticket && (
				<Box
					margin="medium"
					padding="medium"
					rounding="medium"
					background={invalidTicket ? 'red200' : 'orange100'}
					css={{ borderWidth: '1px', borderColor: invalidTicket ? palette.red600 : palette.orange400 }}
				>
					{console.log(ticketQuery.data?.ticket)}
					<p>
						<span css={{ fontSize: '4rem', fontWeight: 'bold', display: 'block', textAlign: 'center' }}>
							{ticketQuery.data.ticket.user.username}
						</span>
					</p>
					{!ticketQuery.data.ticket.paid && (
						<p>
							<span css={{ fontSize: '6rem', fontWeight: 'bold', display: 'block', textAlign: 'center' }}>UNPAID</span>
						</p>
					)}
					{ticketQuery.data.ticket.taken && (
						<p>
							<span css={{ fontSize: '6rem', fontWeight: 'bold', display: 'block', textAlign: 'center' }}>TAKEN</span>
						</p>
					)}
					<p css={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '1.5rem' }}>
						Number of Tickets
						<span css={{ fontSize: '5rem', fontWeight: 'bold' }}>{ticketQuery.data.ticket.numberOfTickets}</span>
					</p>
					<p>
						<span css={{ fontSize: '2rem', display: 'block', textAlign: 'center' }}>
							{new Date(ticketQuery.data.ticket.created) < new Date(2022, 6, 20) ? 'Custom' : 'Standard'}
						</span>
					</p>

					<FieldContainer>
						<FieldLabel>Notes</FieldLabel>
						<TextArea value={ticketNotes} onChange={(e) => setTicketNotes(e.target.value)} />
					</FieldContainer>
					{/* <p css={{ display: 'flex', justifyContent: 'space-between' }}>
						Purchase method
						<span css={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{ticketQuery.data.ticket.method}</span>
					</p> */}
					{ticketNotes !== ticketQuery.data.ticket.notes && (
						<Button
							tone="active"
							weight="bold"
							onClick={() => {
								notesMutation({ variables: { notes: ticketNotes, ticketID: 'T-' + ticketCode.toUpperCase() } });
								ticketQuery.refetch({ ticketID: 'T-' + ticketCode.toUpperCase() });
							}}
						>
							Update
						</Button>
					)}
					{ticketQuery.data.ticket.user.shirts.length > 0 ? (
						<p>
							Shirts to pickup
							{ticketQuery.data.ticket.user.shirts.map((shirt) => {
								if (!shirt.paid) return <></>;
								return (
									<div key={shirt.id} css={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
										<span
											css={{ fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-block', width: '2rem' }}
										>
											{shirtSizeToHuman(shirt.size)}
										</span>
										<span css={{ textTransform: 'capitalize', display: 'inline-block' }}>{shirt.colour}</span>

										<Checkbox
											size="large"
											checked={shirt.taken}
											css={{ marginRight: spacing.medium }}
											onChange={(e) => {
												shirtMutation({ variables: { shirtID: shirt.id, taken: e.target.checked } });
												ticketQuery.refetch({ ticketID: 'T-' + ticketCode.toUpperCase() });
											}}
										>
											Taken?
										</Checkbox>
									</div>
								);
							})}
						</p>
					) : (
						<p>No shirts ordered</p>
					)}
					<div css={{ display: 'flex', justifyContent: 'center' }}>
						{ticketQuery.data.ticket.taken ? (
							<Tooltip content="You have to unmark a ticket as taken from the main dashboard.">
								{(props) => (
									<Button size="large" tone="active" weight="bold" css={{textDecoration: "line-through"}} {...props}>
										Mark as Taken
									</Button>
								)}
							</Tooltip>
						) : (
							<Button
								size="large"
								tone="active"
								weight="bold"
								onClick={() => {
									// sendTicketQuery({ variables: { ticketID: 'T-' + ticketCode.toUpperCase() } });
									ticketTakenMutation({ variables: { ticketID: 'T-' + ticketCode.toUpperCase() } });
									ticketQuery.refetch({ ticketID: 'T-' + ticketCode.toUpperCase() });
								}}
							>
								Mark as Taken
							</Button>
						)}
					</div>
				</Box>
			)}
			<div></div>
		</div>
	);
}
