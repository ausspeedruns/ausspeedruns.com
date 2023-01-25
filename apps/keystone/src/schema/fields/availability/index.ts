import {
	BaseListTypeInfo,
	JSONValue,
	fieldType,
	FieldTypeFunc,
	CommonFieldConfig,
	orderDirectionEnum,
	filters,
	jsonFieldTypePolyfilledForSQLite,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';

export type AvailabilityFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
	CommonFieldConfig<ListTypeInfo> & {
		type?: 'boolean' | 'string';
		db?: { map?: string };
	};

export const availability =
	<ListTypeInfo extends BaseListTypeInfo>({
		type = 'boolean',
		...config
	}: AvailabilityFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> =>
		meta => {
			if ((config as any).isIndexed === 'unique') {
				throw Error("isIndexed: 'unique' is not a supported option for field type availability");
			}

			const resolve = (val: JSONValue | undefined) =>
				val === null && (meta.provider === 'postgresql')
					? 'DbNull'
					: val;

			return jsonFieldTypePolyfilledForSQLite(
				meta.provider,
				{
					...config,
					input: {
						create: {
							arg: graphql.arg({ type: graphql.JSON }),
							resolve(val) {
								return resolve(val === undefined ? [] : val);
							},
						},
						update: { arg: graphql.arg({ type: graphql.JSON }), resolve },
					},
					output: graphql.field({ type: graphql.JSON }),
					views: require.resolve('./views.tsx'),
					getAdminMeta: () => ([]),
				},
				{
					default: {
						kind: 'literal',
						value: JSON.stringify([]),
					},
					map: config.db?.map,
				}
			);
		};