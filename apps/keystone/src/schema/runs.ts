import { graphql, list } from '@keystone-6/core';
import { checkbox, relationship, text, timestamp, virtual } from '@keystone-6/core/fields';
import { operations } from './access';
import { Lists } from '.keystone/types';
import type { Context } from '.keystone/types';

export const Run: Lists.Run = list({
	access: {
		operation: {
			query: () => true,
			create: operations.canManageContent,
			update: operations.canManageContent,
			delete: operations.canManageContent,
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
		donationIncentiveObject: relationship({ ref: 'Incentive.run', many: true }),
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
		techPlatform: text(),
		specialRequirements: text({ ui: { displayMode: "textarea" } }),
		label: virtual({
			field: graphql.field({
				type: graphql.String,
				async resolve(item, _args, context: Context) {
					const data = await context.query.Run.findOne({
						where: {id: item.id.toString() },
						query: 'game category runners { username } event { shortname }'
					});

					console.log(JSON.stringify(data))
					return `${data.game} - ${data.category} | ${data.runners.username.join(', ')} - ${data.event.shortname}`;
				}
			})
		})
	},
	ui: {
		labelField: 'label'
	}
});
