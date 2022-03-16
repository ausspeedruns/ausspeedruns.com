import { list } from '@keystone-6/core';
import { checkbox, float, relationship, text, timestamp } from '@keystone-6/core/fields';
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
		raised: float(),
		submissions: relationship({ ref: 'Submission.event', many: true, access: operations.admin }),
		runs: relationship({ ref: 'Run.event', many: true }),
		acceptingSubmissions: checkbox(),
		logo: image<Lists.Event.TypeInfo>(),
		pressKit: file<Lists.Event.TypeInfo>(),
		submissionInstructions: text(),
	}
});
