
import { list } from '@keystone-6/core';
import { Lists } from '.keystone/types';
import { text } from '@keystone-6/core/fields';

// const filterVerification: ListFilterAccessControl<"query", Lists.Verification.TypeInfo> = ({ session }: SessionContext) => {
// 	// if (!session?.data) return false;
// 	// if (session.data.roles?.some(role => role.admin)) return true;
// 	// return { account: { equals: session?.data.id } };
// 	return true;
// }

export const Verification: Lists.Verification = list({
	access: {
		operation: {
			query: () => true,
			create: ({ session }) => { return session.data.roles?.some(role => role.admin) },
			update: ({ session }) => { return session.data.roles?.some(role => role.admin) },
			delete: () => true,
		},
		// filter: {
		// 	query: filterVerification
		// }
	},
	fields: {
		code: text({ isIndexed: 'unique' }),
		account: text(),
	},
	hooks: {
		afterOperation: ({ context, operation, originalItem }) => {
			if (operation === 'delete') {
				const sudoContext = context.sudo();
				sudoContext.db.User.updateOne({ where: { id: (originalItem.account as string) }, data: { verified: true } });
			}
		}
	},
	graphql: {
		omit: {
			query: true
		}
	}
});
