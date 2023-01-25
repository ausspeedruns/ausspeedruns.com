import { list } from '@keystone-6/core';
import { checkbox, json, relationship, select, text, timestamp } from '@keystone-6/core/fields';
import { ItemContext, operations, permissions, SessionContext } from './access';
import { Lists } from '.keystone/types';
import { FieldAccessControl } from '@keystone-6/core/types';
import { allowAll } from '@keystone-6/core/access';

function roundUpToNearest5(num: number) {
	return Math.ceil(num / 5) * 5;
}

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
				return { runner: { username: { equals: session.data.username } }, status: { in: ['submitted', 'rejected'] } }
			},
			delete: ({ session }: SessionContext) => {
				if (!session?.data) return false;
				if (session.data.roles?.some(role => role.canManageContent)) return true;
				return { runner: { username: { equals: session.data.username } }, status: { equals: "submitted" } }
			},
		},
		operation: allowAll
	},
	fields: {
		runner: relationship({ ref: 'User.submissions', ui: { hideCreate: true, labelField: 'username' } }),
		created: timestamp({ defaultValue: { kind: 'now' } }),
		game: text({ validation: { isRequired: true, length: { min: 1, max: 100 } } }),
		category: text({ validation: { isRequired: true, length: { min: 1, max: 100 } } }),
		platform: text({ validation: { isRequired: true, length: { min: 1, max: 100 } } }), // Potentially an enum with "other"?
		estimate: text({
			validation: { isRequired: true, match: { regex: /^\d{1,2}:\d{2}:\d{2}$/, explanation: 'Estimate invalid. Make sure its like 01:30:00.' } }, hooks: {
				resolveInput: ({ resolvedData }) => {
					if (!resolvedData.estimate) return;

					const [hours, minutes] = resolvedData.estimate.toString().split(':').map(Number);
					const newMinutes = Math.ceil(minutes / 5) * 5;
					const newHours = hours + Math.floor(newMinutes / 60);
					return `${newHours.toString().padStart(2, '0')}:${(newMinutes % 60).toString().padStart(2, "0")}:00`;
				}
			}
		}),
		ageRating: select({
			type: 'enum',
			options: [
				{ label: "M or Lower", value: "m_or_lower" },
				{ label: "MA15+", value: "ma15" },
				{ label: "RA18+", value: "ra18" }
			],
			defaultValue: "m_or_lower"
		}),
		donationIncentive: text({ validation: { length: { max: 300 } } }),
		specialReqs: text({ validation: { length: { max: 300 } } }),
		availability: json({ db: { map: 'availability_json' } }),
		race: select({
			type: 'enum',
			options: [
				{ label: "No", value: "no" },
				{ label: "Yes - Possible Solo", value: "solo" },
				{ label: "Yes - Only Race/Coop", value: "only" }
			],
			defaultValue: "no"
		}),
		racer: text({ validation: { length: { max: 100 } } }),
		coop: checkbox(),
		video: text({ validation: { isRequired: true, length: { max: 100 } } }),
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
		willingBackup: checkbox({ defaultValue: false }),
	},
	ui: {
		labelField: 'game'
	}
});
