import { list } from '@keystone-6/core';
import { checkbox, float, relationship, text } from '@keystone-6/core/fields';
import { operationsAdmin } from './access';
import { Lists } from '.keystone/types';

export const Event: Lists.Event = list({
	access: {
		operation: {
			create: operationsAdmin,
			delete: operationsAdmin,
			update: operationsAdmin,
		}
	},
	fields: {
		name: text(),
		shortname: text(),
		raised: float(),
		submissions: relationship({ ref: 'Submission.event', many: true, access: operationsAdmin }),
		acceptingSubmissions: checkbox(),
	}
});
