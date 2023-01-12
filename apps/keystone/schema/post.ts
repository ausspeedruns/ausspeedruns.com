import { list } from '@keystone-6/core';
import { checkbox, relationship, select, text, timestamp } from '@keystone-6/core/fields';
import { document } from '@keystone-6/fields-document';
import { Lists, PostRoleType } from '.keystone/types';
import { permissions, SessionContext } from './access';
import { ListFilterAccessControl } from '@keystone-6/core/types';

const filterPosts: ListFilterAccessControl<"query", Lists.Post.TypeInfo> = ({ session }: SessionContext) => {
	if (!session?.data) return { AND: [{ published: { equals: true } }, { role: { equals: 'public' } }] };
	if (session.data.roles.some(role => role.canManageContent)) return true;

	const allowedRunner: string[] = [];
	const allowedStaff: string[] = [];
	session.data.roles.some(role => {
		if (role.runner) allowedRunner.push(role.event.shortname);
		if (role.volunteer) {
			allowedStaff.push(role.event.shortname);
			allowedRunner.push(role.event.shortname);
		};
	});

	return {
		OR: [
			{ AND: [{ published: { equals: true } }, { role: { equals: 'public' } }] },
			{ AND: [{ published: { equals: true } }, { role: { equals: 'runner' } }, { event: { shortname: { in: allowedRunner } } }] },
			{ AND: [{ published: { equals: true } }, { role: { equals: 'staff' } }, { event: { shortname: { in: allowedStaff } } }] },
		]
	}
}

function defaultTimestamp() {
	return new Date().toISOString();
}

export const Post: Lists.Post = list({
	access: {
		operation: {
			query: () => true,
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
				resolveInput: ({ inputData }) => {
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
				{ label: "Staff", value: "staff" },
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
		event: relationship({ ref: 'Event', ui: { hideCreate: true, labelField: 'shortname' }, isFilterable: true }),
	},
});
