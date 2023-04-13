import {
	BaseListTypeInfo,
	fieldType,
	FieldTypeFunc,
	CommonFieldConfig,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';

export type IncentivesFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
	CommonFieldConfig<ListTypeInfo> & {
		isIndexed?: boolean | 'unique';
	};

export const scheduleBlocks = <ListTypeInfo extends BaseListTypeInfo>({ isIndexed, ...config }: IncentivesFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> => meta => fieldType({
	kind: 'scalar',
	mode: 'optional',
	scalar: 'Json',
	index: isIndexed === true ? 'index' : isIndexed || undefined,
})({
	...config,
	hooks: {
		...config.hooks,
	},
	input: {
		create: { arg: graphql.arg({ type: graphql.JSON }) },
		update: { arg: graphql.arg({ type: graphql.JSON }) },
	},
	output: graphql.field({ type: graphql.JSON }),
	views: './admin/fields/schedule-block/views',
});
