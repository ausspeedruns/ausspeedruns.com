import { list } from '@keystone-6/core';
import { checkbox, relationship, select, text, json } from '@keystone-6/core/fields';
import { operations } from './access';
import { Lists } from '.keystone/types';

export const Incentive: Lists.Incentive = list({
	access: {
		operation: {
			create: operations.canManageContent,
			update: operations.canManageContent,
		}
	},
	fields: {
		run: relationship({ ref: 'Run.donationIncentiveObject', ui: { hideCreate: true, labelField: 'game' } }),
		event: relationship({ ref: 'Event.donationIncentives', ui: { hideCreate: true, labelField: 'shortname' } }),
		title: text({ validation: { isRequired: true } }),
		notes: text(),
		type: text({ validation: { isRequired: true } }),
		data: json(),
		active: checkbox(),
	},
	ui: {
		labelField: 'title'
	}
});

export interface Goal {
	goal: number;
	current: number;
}

export interface War {
	options: {
		name: string;
		total: number;
	}[]
}
