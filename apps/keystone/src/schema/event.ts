import { list, group } from '@keystone-6/core';
import { checkbox, float, relationship, text, timestamp } from '@keystone-6/core/fields';
import { document } from '@keystone-6/fields-document';
import { operations, SessionContext } from './access';
import { Lists } from '.keystone/types';

import { file, image } from './util';

import { componentBlocks as liveEventComponentBlocks } from '../../admin/components/component-blocks/event-page';
import { componentBlocks as postEventComponentBlocks } from '../../admin/components/component-blocks/post-event';

export const Event: Lists.Event = list({
	access: {
		filter: {
			query: ({ session }: SessionContext) => session?.data.roles?.some(role => role.admin) ? true : { published: { equals: true } }
		},
		operation: {
			query: () => true,
			create: operations.admin,
			delete: operations.admin,
			update: operations.admin,
		}
	},
	fields: {
		name: text(),
		shortname: text({ isIndexed: 'unique' }),
		...group({
			label: "Settings",
			fields: {
				published: checkbox(),
				acceptingSubmissions: checkbox(),
				acceptingTickets: checkbox(),
				scheduleReleased: checkbox(),
				acceptingVolunteers: checkbox(),
				acceptingBackups: checkbox(),
				acceptingShirts: checkbox(),
			}
		}),
		...group({
			label: "Time Settings",
			fields: {
				eventTimezone: text({ ui: { description: 'Timezones in format of TZ database name: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones' } }),
				startDate: timestamp(),
				endDate: timestamp(),
			},
		}),
		...group({
			label: "Post event data",
			fields: {
				raised: float(),
				postEventPage: document({
					formatting: true,
					links: true,
					layouts: [
						[1, 1],
						[1, 1, 1],
						[2, 1],
						[1, 2],
						[1, 2, 1]
					],
					dividers: true,
					ui: {
						views: './admin/components/component-blocks/post-event.tsx',
					},
					componentBlocks: postEventComponentBlocks,
				}),
			}
		}),
		...group({
			label: "Submitted Items",
			description: "Anything that there is a relationship with really",
			fields: {
				submissions: relationship({ ref: 'Submission.event', many: true, access: operations.admin }),
				runs: relationship({ ref: 'Run.event', many: true }),
				tickets: relationship({ ref: 'Ticket.event', many: true }),
				volunteer: relationship({ ref: 'Volunteer.event', ui: { hideCreate: true }, many: true, access: operations.admin }),
				donationIncentives: relationship({ ref: 'Incentive.event', many: true }),
			}
		}),
		...group({
			label: "Media",
			fields: {
				logo: image<Lists.Event.TypeInfo>(),
				darkModeLogo: image<Lists.Event.TypeInfo>(),
				heroImage: image<Lists.Event.TypeInfo>({
					ui: { description: "Image that will be used as the background for the homepage and events list." },
					storage: ''
				}),
				ogImage: image<Lists.Event.TypeInfo>({
					ui: { description: "Open Graph Image that will be embedded when linked. 1200x630" },
					storage: ''
				}),
				postEventBackground: image<Lists.Event.TypeInfo>({
					ui: { description: "Background for the post event page. It will be centered, repeated on the y axis and set to cover." },
					storage: ''
				}),
				pressKit: file<Lists.Event.TypeInfo>(),
			}
		}),
		submissionInstructions: document({
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
		eventPage: document({
			formatting: true,
			links: true,
			layouts: [
				[1, 1],
				[1, 1, 1],
				[2, 1],
				[1, 2],
				[1, 2, 1]
			],
			dividers: true,
			ui: {
				views: './admin/components/component-blocks/event-page.tsx',
			},
			componentBlocks: liveEventComponentBlocks,
		}),
	}
});
