import { graphql, list } from '@keystone-6/core';
import { checkbox, integer, relationship, select, text, timestamp, virtual } from '@keystone-6/core/fields';
import { operations } from './access';
import { Lists } from '.keystone/types';
import { customAlphabet } from 'nanoid';

// Ticket ID Alphabet
// Has IOZ removed to reduce chance of people getting confused
const nanoid = customAlphabet('0123456789ABCDEFGHJKLMNPQRSTUVWXY', 9);

export const Ticket: Lists.Ticket = list({
	access: {
		// operation: {
		// 	create: operations.admin,
		// 	update: operations.runnerMgmt,
		// 	query: operations.runnerMgmt,
		// }
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
		notes: text(),
		numberOfTickets: integer(),
		totalCost: virtual({
			field: graphql.field({
				type: graphql.Float,
				resolve: async (item, args, context) => {
					const { numberOfTickets } = await context.query.Ticket.findOne({
						where: { id: item.id },
						query: 'numberOfTickets'
					});
					return 35 * numberOfTickets;
				}
			})
		}),
		stripeID: text({ isIndexed: true }),
	},
	hooks: {
		resolveInput: ({ operation, resolvedData }) => {
			if (operation === 'create') {
				// Set TicketID
				resolvedData.ticketID = `T-${nanoid()}`;
			}

			return resolvedData;
		}
	}
});
