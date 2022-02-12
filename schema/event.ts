import { list } from '@keystone-6/core';
import { checkbox, float, image, relationship, text } from '@keystone-6/core/fields';
import { operations } from './access';
import { Lists } from '.keystone/types';

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
		shortname: text(),
		raised: float(),
		submissions: relationship({ ref: 'Submission.event', many: true, access: operations.admin }),
		runs: relationship({ ref: 'Run.event', many: true }),
		acceptingSubmissions: checkbox(),
		logo: image(),
	}
});
