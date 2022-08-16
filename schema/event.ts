import { list } from '@keystone-6/core';
import { checkbox, float, relationship, text, timestamp } from '@keystone-6/core/fields';
import { document } from '@keystone-6/fields-document';
import { operations } from './access';
import { Lists } from '.keystone/types';

import { file, image } from './util';

export const Event: Lists.Event = list({
	access: {
		operation: {
			create: operations.admin,
			delete: operations.admin,
			update: operations.admin,
		}
	},
	fields: {
		name: text(),
		shortname: text({ isIndexed: 'unique' }),
		startDate: timestamp(),
		endDate: timestamp(),
		eventTimezone: text({ label: 'Timezones in format of TZ database name: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones' }),
		raised: float(),
		submissions: relationship({ ref: 'Submission.event', many: true, access: operations.admin }),
		runs: relationship({ ref: 'Run.event', many: true }),
		acceptingSubmissions: checkbox(),
		logo: image<Lists.Event.TypeInfo>(),
		pressKit: file<Lists.Event.TypeInfo>(),
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
		tickets: relationship({ ref: 'Ticket.event', many: true }),
		acceptingTickets: checkbox(),
		scheduleReleased: checkbox(),
		acceptingVolunteers: checkbox(),
		acceptingBackups: checkbox(),
		acceptingShirts: checkbox(),
		volunteer: relationship({ ref: 'Volunteer.event', ui: { hideCreate: true }, many: true, access: operations.admin }),
		donationIncentives: relationship({ ref: 'Incentive.event', many: true }),
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
			dividers: true
		}),
	}
});
