import { list } from '@keystone-6/core';
import { checkbox, json, relationship, select, text, timestamp } from '@keystone-6/core/fields';
import { ItemContext, operations, permissions, SessionContext } from './access';
import { Lists } from '.keystone/types';
import { FieldAccessControl } from '@keystone-6/core/types';

function roundUpToNearest5(value: number) {
	const remainder = value % 5;
	let round = value;

	if (remainder !== 0) {
		round += 5 - remainder
	}

	return round;
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
		}
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

					let mutableEstimate = resolvedData.estimate.split(':');
					// Hours
					if (mutableEstimate[0].length === 1) {
						mutableEstimate[0] = '0' + mutableEstimate[0];
					}

					// Remove seconds
					mutableEstimate[2] = '00';

					// Round up mins
					mutableEstimate[1] = roundUpToNearest5(parseInt(mutableEstimate[1])).toString();

					if (mutableEstimate[1].length === 1) {
						mutableEstimate[1] = '0' + mutableEstimate[1];
					}

					return mutableEstimate.join(':');
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
		donationIncentive: text({ validation: { length: { max: 100 } } }),
		specialReqs: text({ validation: { length: { max: 100 } } }),
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
