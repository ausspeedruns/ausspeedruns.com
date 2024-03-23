import { graphql, list } from '@keystone-6/core';
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
		if (session.data.roles?.some(role => role.canManageContent)) return true;
		return { user: { id: { equals: session.data.id } } };
	},
	update: ({ session }: SessionContext) => {
		if (!session?.data) return false;
		if (session.data.roles?.some(role => role.canManageContent)) return true;
		return { user: { id: { equals: session.data.id } } };
	},
	delete: ({ session }: SessionContext) => {
		if (!session?.data) return false;
		if (session.data.roles?.some(role => role.canManageContent)) return true;
		return { user: { id: { equals: session.data.id } } };
	},
}

export const Ticket: Lists.Ticket = list({
	access: {
		operation: {
			query: () => true,
			create: operations.canManageContent,
			update: operations.canManageContent,
			delete: operations.canManageContent,
		},
		filter: filterTickets,
	},
	fields: {
		user: relationship({ ref: 'User.tickets', ui: { hideCreate: true, labelField: 'username' } }),
		event: relationship({ ref: 'Event.tickets' }),
		taken: checkbox({ defaultValue: false, ui: { itemView: { fieldPosition: 'sidebar' } } }),
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
		paid: checkbox({ defaultValue: false, ui: { itemView: { fieldPosition: 'sidebar' } } }),
		notes: text({ access: { update: permissions.canManageUsers, read: permissions.canManageUsers }, ui: { displayMode: 'textarea' } }),
		numberOfTickets: integer(),
		totalCost: virtual({
			field: graphql.field({
				type: graphql.Float,
				async resolve(item, args, context) {
					const result = await context.query.Ticket.findOne({
						where: { id: item.id },
						query: 'numberOfTickets'
					});
					if (result) {
						return 30 * result.numberOfTickets;
					}

					return 30 * item.numberOfTickets;
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
