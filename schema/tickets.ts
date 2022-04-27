import { graphql, graphQLSchemaExtension, list } from '@keystone-6/core';
import { checkbox, integer, relationship, select, text, timestamp, virtual } from '@keystone-6/core/fields';
import { operations, permissions, SessionContext } from './access';
import { Lists } from '.keystone/types';
import { customAlphabet } from 'nanoid';
import { v4 as uuid } from 'uuid';
import { ListFilterAccessControl } from '@keystone-6/core/types';

// Ticket ID Alphabet
// Has IOZ removed to reduce chance of people getting confused
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXY', 9);

const filterTickets = {
	query: ({ session }: SessionContext) => {
		if (!session?.data) return false;
		if (session.data.roles?.some(role => role.canReadRunnerMgmt)) return true;
		return { user: { id: { equals: session.data.id } } };
	},
	update: ({ session }: SessionContext) => {
		if (!session?.data) return false;
		if (session.data.roles?.some(role => role.canReadRunnerMgmt)) return true;
		return { user: { id: { equals: session.data.id } } };
	},
	delete: ({ session }: SessionContext) => {
		if (!session?.data) return false;
		if (session.data.roles?.some(role => role.canReadRunnerMgmt)) return true;
		return { user: { id: { equals: session.data.id } } };
	},
}

export const Ticket: Lists.Ticket = list({
	access: {
		operation: {
			create: operations.runnerMgmt,
			update: operations.runnerMgmt,
		},
		filter: filterTickets,
	},
	fields: {
		user: relationship({ ref: 'User.tickets', ui: { hideCreate: true, labelField: 'username' } }),
		event: relationship({ ref: 'Event.tickets' }),
		taken: checkbox({ defaultValue: false }),
		method: select({
			type: 'enum',
			options: [
				{ label: "Bank Transfer", value: "bank" },
				{ label: "Stripe", value: "stripe" },
			],
			validation: {
				isRequired: true
			}
		}),
		ticketID: text({ isIndexed: 'unique' }),
		paid: checkbox({ defaultValue: false }),
		notes: text({ access: { update: permissions.canManageUsers, read: permissions.canManageUsers } }),
		numberOfTickets: integer(),
		totalCost: virtual({
			field: graphql.field({
				type: graphql.Float,
				resolve: async (item, args, context) => {
					const result = await context.query.Ticket.findOne({
						where: { id: item.id },
						query: 'numberOfTickets'
					});
					if (result) {
						return 35 * result.numberOfTickets;
					}

					return 35 * item.numberOfTickets;
				}
			})
		}),
		stripeID: text({ isIndexed: 'unique' }),
		created: timestamp({ defaultValue: { kind: 'now' } }),
	},
	hooks: {
		resolveInput: ({ operation, resolvedData }) => {
			const mutableData = { ...resolvedData };

			if (operation === 'create') {
				// Set TicketID
				mutableData.ticketID = `T-${nanoid()}`;

				// Set the stripe ID to just be something random since it has to be unique
				// When the method is bank the stripe id SHOULD NEVER BE USED!!!!
				if (resolvedData.method === 'bank') {
					mutableData.stripeID = uuid();
				}
			}

			return mutableData;
		}
	}
});

// Extended schema for NextJS API

// Tickets must be private to all except user and runner managers
// Tickets cannot be edited by anyone except runner managers
// Tickets cannot be deleted by anyone except admins

// API Requests
// mutation ($userID: ID, $stripeID: String) {
// 	createTicket(data: { user: { connect: { id: $userID } }, event: { connect: { shortname:"ASM2022" } }, numberOfTickets: 1, method: stripe, stripeID: $stripeID }) {
// 		ticketID
// 	}
// }
