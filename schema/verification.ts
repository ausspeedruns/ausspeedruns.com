
import { list } from '@keystone-6/core';
import { Lists } from '.keystone/types';
import { relationship, text } from '@keystone-6/core/fields';
import { ListFilterAccessControl } from '@keystone-6/core/types';
import { SessionContext } from './access';

const filterVerification: ListFilterAccessControl<"query", Lists.Verification.TypeInfo> = ({ session }: SessionContext) => {
	return { account: { equals: session?.data.id } };
}

export const Verification: Lists.Verification = list({
	access: {
		operation: {
			create: () => {return false},
			update: () => {return false},
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
	}
});
