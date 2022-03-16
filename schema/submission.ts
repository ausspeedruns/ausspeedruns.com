import { list } from '@keystone-6/core';
import { checkbox, relationship, select, text, timestamp } from '@keystone-6/core/fields';
import { ItemContext, operations, permissions, SessionContext } from './access';
import { Lists } from '.keystone/types';
import { FieldAccessControl } from '@keystone-6/core/types';

export const Submission: Lists.Submission = list({
	access: {
		filter: {
			query: ({ session }: SessionContext) => {
				if (!session?.data) return false;
				if (session.data.roles?.some(role => role.canManageContent)) return true;
				return { runner: { username: { equals: session.data.username } } }
			},
			update: ({ session }: SessionContext) => {
				if (!session?.data) return false;
				if (session.data.roles?.some(role => role.canManageContent)) return true;
				return { runner: { username: { equals: session.data.username } }, status: { equals: "submitted" } }
			},
			delete: ({ session }: SessionContext) => {
				if (!session?.data) return false;
				if (session.data.roles?.some(role => role.canManageContent)) return true;
				return { runner: { username: { equals: session.data.username } }, status: { equals: "submitted" } }
			},
		}
	},
	fields: {
		runner: relationship({ ref: 'User.submissions', ui: { hideCreate: true, labelField: 'username' } }),
		created: timestamp({ defaultValue: { kind: 'now' } }),
		game: text({ validation: { isRequired: true } }),
		category: text({ validation: { isRequired: true } }),
		platform: text({ validation: { isRequired: true } }), // Potentially an enum with "other"?
		estimate: text({ validation: { isRequired: true, match: { regex: /^\d{2}:\d{2}:\d{2}$/, explanation: 'Estimate invalid. Make sure its like 01:30:00.' } } }),
		ageRating: select({
			type: 'enum',
			options: [
				{ label: "M or Lower", value: "m_or_lower" },
				{ label: "MA15+", value: "ma15" },
				{ label: "RA18+", value: "ra18" }
			],
			defaultValue: "m_or_lower"
		}),
		donationIncentive: text(),
		specialReqs: text(),
		race: select({
			type: 'enum',
			options: [
				{ label: "No", value: "no" },
				{ label: "Yes - Possible Solo", value: "solo" },
				{ label: "Yes - Only Race/Coop", value: "only" }
			],
			defaultValue: "no"
		}),
		racer: text(),
		coop: checkbox(),
		video: text({ validation: { isRequired: true } }),
		status: select({
			type: 'enum',
			options: [
				{ label: "Submitted", value: "submitted" },
				{ label: "Accepted", value: "accepted" },
				{ label: "Backup", value: "backup" },
				{ label: "Rejected", value: "rejected" }
			],
			defaultValue: "submitted"
		}),
		event: relationship({ ref: 'Event.submissions', ui: { hideCreate: true, labelField: 'shortname' } }),
	},
	ui: {
		labelField: 'game'
	}
});
