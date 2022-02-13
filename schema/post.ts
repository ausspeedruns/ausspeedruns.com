import { list } from '@keystone-6/core';
import { checkbox, relationship, select, text, timestamp } from '@keystone-6/core/fields';
import { document } from '@keystone-6/fields-document';
import { Lists } from '.keystone/types';
import { permissions, SessionContext } from './access';
import { ListFilterAccessControl } from '@keystone-6/core/types';

const filterPosts: ListFilterAccessControl<"query", Lists.Post.TypeInfo> = ({ session }: SessionContext ) => {
	if (session?.data.roles?.some(role => role.canManageContent)) return true;
	return { published: { equals: true } };
}

export const Post: Lists.Post = list({
	access: {
		operation: {
			create: permissions.canManageContent,
			delete: permissions.canManageContent,
			update: permissions.canManageContent,
		},
		filter: {
			query: filterPosts
		}
	},
	fields: {
		title: text({ validation: { isRequired: true } }),
		slug: text({ isIndexed: 'unique', isFilterable: true }),
		author: relationship({ ref: 'User', many: true }),
		published: checkbox(),
		publishDate: timestamp(),
		editedDate: timestamp(),
		role: select({
			type: 'enum',
			options: [
				{ label: "Public", value: "public" },
				{ label: "Runners", value: "runner" },
				{ label: "Tech", value: "tech" },
				{ label: "Runner Management", value: "runnermanagement" }
			]
		}),
		content: document({
			formatting: true,
			links: true,
			layouts: [
				[1, 1],
				[1, 1, 1],
				[2, 1],
				[1, 2],
				[1, 2, 1]
			],
			dividers: true
		}),
	},
});
