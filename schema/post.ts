import { list } from '@keystone-6/core';
import { checkbox, relationship, select, text, timestamp } from '@keystone-6/core/fields';
import { document } from '@keystone-6/fields-document';
import { Lists } from '.keystone/types';
import { permissions, SessionContext } from './access';
import { ListFilterAccessControl } from '@keystone-6/core/types';

const filterPosts: ListFilterAccessControl<"query", Lists.Post.TypeInfo> = ({ session }: SessionContext) => {
	if (session?.data.roles?.some(role => role.canManageContent)) return true;
	return { published: { equals: true } };
}

function defaultTimestamp() {
	return new Date().toISOString();
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
		publishedDate: timestamp({
			hooks: {
				resolveInput: ({ operation, inputData }) => {
					if (inputData.published) {
						return defaultTimestamp();
					}

					// Specific false check as inputData only returns what has actually changed.
					// If the content is edited the published property will not be in the object meaning
					// that if a falsey check is used then the published date will change.
					if (inputData.published === false) {
						return null;
					}
				}
			}
		}),
		editedDate: timestamp({
			hooks: {
				resolveInput: ({ operation, inputData, item }) => {
					if (operation === 'update' && inputData.content && item.publishedDate) {
						return defaultTimestamp();
					}

					// Same reason as above
					if (inputData.published === false) {
						return null;
					}
				}
			}
		}),
		role: select({
			type: 'enum',
			options: [
				{ label: "Public", value: "public" },
				{ label: "Runners", value: "runner" },
				{ label: "Tech", value: "tech" },
				{ label: "Runner Management", value: "runner_management" },
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
		intro: text(),
	},
});
