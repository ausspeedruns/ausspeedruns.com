import { list } from '@keystone-6/core';
import { checkbox, integer, relationship, select, text, timestamp, virtual } from '@keystone-6/core/fields';
import { operations, permissions, SessionContext } from './access';
import { Lists } from '.keystone/types';
import { customAlphabet } from 'nanoid';
import { v4 as uuid } from 'uuid';
import { ListFilterAccessControl } from '@keystone-6/core/types';

// Shirt ID Alphabet
// Has IOZ removed to reduce chance of people getting confused
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXY', 9);

const filterShirts = {
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

export const ShirtOrder: Lists.ShirtOrder = list({
	access: {
		operation: {
			query: () => true,
			create: operations.canManageContent,
			update: operations.canManageContent,
			delete: () => true,
		},
		filter: filterShirts,
	},
	fields: {
		user: relationship({ ref: 'User.shirts', ui: { hideCreate: true, labelField: 'username' } }),
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
		shirtID: text({ isIndexed: 'unique' }),
		paid: checkbox({ defaultValue: false }),
		notes: text({ access: { update: permissions.canManageUsers, read: permissions.canManageUsers } }),
		size: select({
			type: 'enum',
			options: [
				{ label: "Xtra Small", value: "xs" },
				{ label: "Small", value: "s" },
				{ label: "Medium", value: "m" },
				{ label: "Large", value: "l" },
				{ label: "Xtra Large", value: "xl" },
				{ label: "2 Xtra Large", value: "xl2" },
				{ label: "3 Xtra Large", value: "xl3" },
			],
			validation: {
				isRequired: true
			}
		}),
		colour: select({
			type: 'enum',
			options: [
				{ label: "Blue", value: "blue" },
				{ label: "Purple", value: "purple" },
			],
			validation: {
				isRequired: true
			}
		}),
		stripeID: text({ isIndexed: 'unique' }),
		created: timestamp({ defaultValue: { kind: 'now' } }),
	},
	hooks: {
		resolveInput: ({ operation, resolvedData }) => {
			const mutableData = { ...resolvedData };

			if (operation === 'create') {
				// Set TicketID
				mutableData.shirtID = `S-${nanoid()}`;

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
