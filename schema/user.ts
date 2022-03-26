import { list } from '@keystone-6/core';
import { checkbox, password, relationship, select, text, timestamp } from '@keystone-6/core/fields';
import { Lists } from '.keystone/types';
import { permissions } from './access';
import { FieldAccessControl, KeystoneContextFromListTypeInfo } from '@keystone-6/core/types';
import { v4 as uuid } from 'uuid';
import { differenceInMinutes } from 'date-fns';

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
		name: text({ access: fieldAccess.editSelfOrHidden, validation: { length: { max: 100 } }, ui: { itemView: { fieldMode: fieldModes.editSelfOrHidden } } }),
		username: text({ isIndexed: 'unique', validation: { isRequired: true, match: { regex: /^[a-zA-Z0-9_][\w]{2,24}$/, explanation: 'Username must be 3-25 characters long and can only have: letters, numbers and underscore' } }, access: fieldAccess.editSelfOrRead, ui: { itemView: { fieldMode: fieldModes.editSelfOrRead } } }),
		email: text({ isIndexed: 'unique', validation: { isRequired: true }, access: fieldAccess.editSelfOrHidden, ui: { itemView: { fieldMode: fieldModes.editSelfOrHidden } } }),
		password: password({ validation: { isRequired: true } }),
		accountCreated: timestamp({ defaultValue: { kind: 'now' }, access: fieldAccess.readSelfOrHidden }),
		dateOfBirth: timestamp({ access: fieldAccess.editSelfOrHidden, ui: { itemView: { fieldMode: fieldModes.editSelfOrHidden } } }),
		pronouns: text({ access: fieldAccess.editSelfOrRead, validation: { length: { max: 100 } }, ui: { itemView: { fieldMode: fieldModes.editSelfOrRead } } }),
		submissions: relationship({ ref: 'Submission.runner', many: true, access: fieldAccess.editSelfOrRead, ui: { itemView: { fieldMode: fieldModes.editSelfOrRead } } }),
		roles: relationship({ ref: 'Role.users', many: true, access: { update: ({ session }) => permissions.canManageUsers({ session }) } }),
		runs: relationship({ ref: 'Run.runners', many: true, access: { update: ({ session }) => permissions.canManageUsers({ session }) } }),
		verified: checkbox({ defaultValue: false, access: { update: ({ session }) => permissions.canManageUsers({ session }) } }),
		state: select({
			type: 'enum',
			options: [
				{ label: "", value: "none" },
				{ label: "Victoria", value: "vic" },
				{ label: "New South Wales", value: "nsw" },
				{ label: "Queensland", value: "qld" },
				{ label: "South Australia", value: "sa" },
				{ label: "Western Australia", value: "wa" },
				{ label: "ACT", value: "act" },
				{ label: "Northern Territory", value: "nt" },
				{ label: "Tasmania", value: "tas" },
				{ label: "Outside of Australia", value: "outer" },
			],
			defaultValue: "none",
			db: {
				isNullable: true
			}
		}),
		// Hacky way to do a server side function
		sentVerification: timestamp({
			defaultValue: { kind: 'now' },
			hooks: {
				validateInput: ({ resolvedData, addValidationError, item, operation }) => {
					if (operation === 'create') return;

					const { sentVerification } = resolvedData;
					if (item?.sentVerification && differenceInMinutes(new Date(sentVerification), new Date(item.sentVerification)) < 15) {
						addValidationError(`Sending new verification too soon.`);
					}
				},
				afterOperation: ({ context, item, operation }) => {
					if (item.verified || operation !== 'update') return;

					SendVerification({ context, item });
				}
			}
		}),
		// SOCIALS
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
		afterOperation: ({ operation, item, context, originalItem }) => {
			if (operation === 'create') {
				SendVerification({ context, item });
			}

			if (operation === 'update') {
				// New email
				if (item.email !== originalItem.email) {
					context.sudo().db.User.updateOne({ where: { id: item.id }, data: { verified: false } });
					SendVerification({ context, item });
				}
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

	console.log(`${item.email} | ${item.id} | ${verificationID}`);

	// console.log(await sudoContext.db.Verification.findMany());

	sendEmailVerification(item.email, newVerification.code);

	sudoContext.exitSudo();
}
