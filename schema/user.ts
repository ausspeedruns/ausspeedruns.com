import { list } from '@keystone-6/core';
import { checkbox, password, relationship, select, text, timestamp } from '@keystone-6/core/fields';
import { Lists } from '.keystone/types';
import { permissions } from './access';
import { FieldAccessControl, KeystoneContextFromListTypeInfo } from '@keystone-6/core/types';
import { v4 as uuid } from 'uuid';

import { sendEmailVerification } from '../email/emails';

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

const BANNEDUSERNAMES = ['edit-user', 'verification', 'password-reset'];

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
		dateOfBirth: timestamp({ access: fieldAccess.editSelfOrHidden, ui: { itemView: { fieldMode: fieldModes.editSelfOrHidden } } }),
		pronouns: text({ access: fieldAccess.editSelfOrRead, ui: { itemView: { fieldMode: fieldModes.editSelfOrRead } } }),
		socials: relationship({ ref: 'Social.user', access: fieldAccess.editSelfOrRead, ui: { itemView: { fieldMode: fieldModes.editSelfOrRead } } }),
		submissions: relationship({ ref: 'Submission.runner', many: true, access: fieldAccess.editSelfOrRead, ui: { itemView: { fieldMode: fieldModes.editSelfOrRead } } }),
		roles: relationship({ ref: 'Role.users', many: true }),
		runs: relationship({ ref: 'Run.runners', many: true }),
		verified: checkbox({ defaultValue: false, access: { update: ({ session }) => permissions.canManageUsers({ session }) } }),
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
				{ label: "Tasmania", value: "tas" },
				{ label: "Outside of Australia", value: "outer" },
			]
		}),
		// Hacky way to do a server side function
		sentVerification: timestamp({
			//defaultValue: { kind: 'now' },
			hooks: {
				afterOperation: ({ context, item, operation }) => {
					if (item.verified || operation !== 'update') return;

					SendVerification({ context, item });
				}
			}
		})
	},
	ui: {
		labelField: 'username'
	},
	hooks: {
		validateInput: ({ resolvedData, addValidationError }) => {
			const { username } = resolvedData;
			if (BANNEDUSERNAMES.includes(username)) {
				addValidationError(`Username cannot be ${username}`);
			}
		},
		afterOperation: ({ operation, item, context }) => {
			if (operation === 'create') {
				context.db.Social.createOne({
					data: {
						user: { connect: { id: item.id } }
					}
				});

				SendVerification({ context, item });
			}
		}
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
		twitch: text({
			validation: {
				isRequired: false,
				match: {
					regex: /(^[a-zA-Z0-9][\w]{2,24}$)?/,
					explanation: `Twitch name is invalid.`
				}
			}
		}),
		user: relationship({ ref: 'User.socials' }),
	}
});

async function SendVerification(data: { item: Lists.User.TypeInfo['item'], context: KeystoneContextFromListTypeInfo<Lists.User.TypeInfo> }) {
	const { context, item } = data;

	const sudoContext = context.sudo();
	const verificationID = uuid().replaceAll('-', '');

	const newVerification = await sudoContext.db.Verification.createOne({
		data: {
			account: item.id,
			code: verificationID,
		}
	});

	// console.log(verificationID);

	sendEmailVerification(item.email, newVerification.code);

	sudoContext.exitSudo();
}
