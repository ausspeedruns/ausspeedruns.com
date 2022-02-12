import { list } from '@keystone-6/core';
import { checkbox, password, relationship, select, text, timestamp } from '@keystone-6/core/fields';
import { Lists } from '.keystone/types';
import { permissions } from './access';
import { FieldAccessControl } from '@keystone-6/core/types';

const fieldModes = {
	editSelfOrRead: ({ session, item }: any) =>
		permissions.canManageUsers({ session }) || session.itemId === item.id
			? 'edit'
			: 'read',
	editSelfOrHidden: ({ session, item }: any) =>
		permissions.canManageUsers({ session }) || session.itemId === item.id
			? 'edit'
			: 'hidden',
};

const fieldAccess = {
	editSelfOrRead: <FieldAccessControl<Lists.User.TypeInfo>>{
		update: ({ session, item }: any) => permissions.canManageUsers({ session }) || session.itemId === item.id
	},
	editSelfOrHidden: <FieldAccessControl<Lists.User.TypeInfo>>{
		update: ({ session, item }: any) => permissions.canManageUsers({ session }) || session.itemId === item.id,
		read: ({ session, item }: any) => permissions.canManageUsers({ session }) || session.itemId === item.id,
	},
	readSelfOrHidden: <FieldAccessControl<Lists.User.TypeInfo>>{
		update: permissions.canManageUsers,
		read: ({ session, item }: any) => permissions.canManageUsers({ session }) || session.itemId === item.id,
	},
}

export const User: Lists.User = list({
	access: {
		filter: {
			query: () => true
		}
	},
	fields: {
		name: text({ access: fieldAccess.editSelfOrHidden, ui: { itemView: { fieldMode: fieldModes.editSelfOrHidden } } }),
		username: text({ isIndexed: 'unique', validation: { isRequired: true }, access: fieldAccess.editSelfOrRead, ui: { itemView: { fieldMode: fieldModes.editSelfOrRead } } }),
		email: text({ isIndexed: 'unique', validation: { isRequired: true }, access: fieldAccess.editSelfOrHidden, ui: { itemView: { fieldMode: fieldModes.editSelfOrHidden } } }),
		password: password({ validation: { isRequired: true } }),
		accountCreated: timestamp({ defaultValue: { kind: 'now' }, access: fieldAccess.readSelfOrHidden }),
		dateOfBirth: timestamp({ validation: { isRequired: true }, access: fieldAccess.editSelfOrHidden, ui: { itemView: { fieldMode: fieldModes.editSelfOrHidden } } }),
		pronouns: text({ access: fieldAccess.editSelfOrRead, ui: { itemView: { fieldMode: fieldModes.editSelfOrRead } } }),
		socials: relationship({ ref: 'Social.user', access: fieldAccess.editSelfOrRead, ui: { itemView: { fieldMode: fieldModes.editSelfOrRead } } }),
		submissions: relationship({ ref: 'Submission.runner', many: true, access: fieldAccess.editSelfOrRead, ui: { itemView: { fieldMode: fieldModes.editSelfOrRead } } }),
		roles: relationship({ ref: 'Role.users', many: true }),
		runs: relationship({ ref: 'Run.runners', many: true }),
		state: select({
			type: 'enum',
			options: [
				{ label: "Victoria", value: "vic" },
				{ label: "New South Wales", value: "nsw" },
				{ label: "Queensland", value: "qld" },
				{ label: "South Australia", value: "sa" },
				{ label: "Western Australia", value: "wa" },
				{ label: "ACT", value: "act" },
				{ label: "Northern Territory", value: "nt" },
				{ label: "Outside of Australia", value: "outer" },
			]
		}),
	},
	ui: {
		labelField: 'username'
	}
});

export const Role = list({
	access: {
		filter: {
			delete: permissions.canManageUsers,
			// query: permissions.canManageUsers,
			update: permissions.canManageUsers,
		}
	},
	ui: {
		isHidden: context => !permissions.canManageUsers(context),
	},
	fields: {
		name: text(),
		admin: checkbox({ defaultValue: false }),
		canManageContent: checkbox({ defaultValue: false }),
		canManageUsers: checkbox({ defaultValue: false }),
		canReadTech: checkbox({ defaultValue: false }),
		canReadRunnerInfo: checkbox({ defaultValue: false }),
		canReadRunnerMgmt: checkbox({ defaultValue: false }),
		users: relationship({ ref: 'User.roles', many: true }),
		event: relationship({ ref: 'Event' }),
		show: checkbox({ defaultValue: false }),
		colour: text({ defaultValue: '#ffffff', validation: { match: { regex: /#([a-fA-F0-9]{3}){1,2}\b/ } } }),
		textColour: select({
			type: 'enum',
			options: [
				{ label: "Light", value: "white" },
				{ label: "Dark", value: "black" },
			]
		})
	},
});

export const Social = list({
	fields: {
		discord: text({
			validation: {
				isRequired: false,
				match: {
					regex: /(^.{3,32}#[0-9]{4}$)?/,
					explanation: `Discord user ID is invalid. Make sure its like "Clubwho#1337".`
				}
			}
		}),
		twitter: text({
			validation: {
				isRequired: false,
				match: {
					regex: /(^@(\w){1,15}$)?/,
					explanation: `Twitter handle is invalid. Make sure its like "@Clubwhom".`
				}
			}
		}),
		user: relationship({ ref: 'User.socials' }),
	}
});
