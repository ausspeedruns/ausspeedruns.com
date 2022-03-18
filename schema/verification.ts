
import { list } from '@keystone-6/core';
import { Lists } from '.keystone/types';
import { text } from '@keystone-6/core/fields';
import { ListFilterAccessControl } from '@keystone-6/core/types';
import { SessionContext } from './access';

const filterVerification: ListFilterAccessControl<"query", Lists.Verification.TypeInfo> = ({ session }: SessionContext) => {
	if (!session?.data) return false;
	if (session.data.roles?.some(role => role.admin)) return true;
	return { account: { equals: session?.data.id } };
}

export const Verification: Lists.Verification = list({
	access: {
		operation: {
			create: ({session}) => {return session.data.roles?.some(role => role.admin)},
			update: ({session}) => {return session.data.roles?.some(role => role.admin)},
			// delete: () => {return false},
		},
		filter: {
			query: filterVerification
		}
	},
	fields: {
		code: text({isIndexed: 'unique'}),
		account: text(),
	},
	hooks: {
		afterOperation: ({ context, operation, originalItem }) => {
			if (operation === 'delete') {
				const sudoContext = context.sudo();
				sudoContext.db.User.updateOne({ where: { id: originalItem.account }, data: { verified: true } });
				sudoContext.exitSudo();
			}
		}
	},
	// graphql: {
	// 	omit: ['query']
	// }
});
