import { graphql, list } from '@keystone-6/core';
import { checkbox, relationship, select, text, timestamp, virtual } from '@keystone-6/core/fields';
import { operations } from './access';
import { Lists } from '.keystone/types';

export const Run: Lists.Run = list({
	access: {
		operation: {
			create: operations.admin,
			update: operations.runnerMgmt,
		}
	},
	fields: {
		runners: relationship({ ref: 'User.runs', ui: { hideCreate: true, labelField: 'username' }, many: true }),
		originalSubmission: relationship({ ref: 'Submission' }),
		game: text({ validation: { isRequired: true } }),
		category: text({ validation: { isRequired: true } }),
		platform: text({ validation: { isRequired: true } }), // Potentially an enum with "other"?
		estimate: text({ validation: { isRequired: true } }),
		finalTime: text(),
		donationIncentive: text(),
		race: checkbox(),
		racer: text(),
		coop: checkbox(),
		twitchVOD: text(),
		youtubeVOD: text(),
		event: relationship({ ref: 'Event.runs', ui: { hideCreate: true, labelField: 'shortname' } }),
		// runLabel: virtual({
		// 	field: graphql.field({
		// 		type: graphql.String,
		// 		resolve: (item, _args, context) => {
		// 			const { runners } = context.query.User.findMany({
		// 				where: { id: item.id.toString() },
		// 				query: 'runners { username }',
		// 			});
		// 			return `${item.game}: ${item.category} by ${item.join(',')}`
		// 		}
		// 	})
		// })
		scheduledTime: timestamp(),
	},
	ui: {
		labelField: 'game'
	}
});
