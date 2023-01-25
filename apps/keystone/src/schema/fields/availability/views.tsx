/** @jsxRuntime classic */
/** @jsx jsx */

import React from 'react';
import { jsx, Stack, Text } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';
import {
	CardValueComponent,
	CellComponent,
	FieldController,
	JSONValue,
	FieldControllerConfig,
	FieldProps,
} from '@keystone-6/core/types';
import { CellContainer, CellLink } from '@keystone-6/core/admin-ui/components';
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo';
import { addDays, differenceInDays } from 'date-fns';

export const Field = ({ field, forceValidation, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
	const queryEventLength = useQuery(gql`
		query {
			${value['listKey']} (where: {id: "${value['id']}"}) {
			  event {
				startDate
				endDate
				eventTimezone
			  }
			}
		  }
	`);


	let currentEvent = queryEventLength?.data?.[value['listKey']]?.event ?? undefined;

	let eventLength = 0;
	if (currentEvent) {
		eventLength = differenceInDays(new Date(currentEvent.endDate), new Date(currentEvent.startDate)) + 1;
	}

	let hostDates = [];
	for (let i = 0; i < eventLength; i++) {
		const date = addDays(new Date(currentEvent.startDate), i);
		hostDates.push(
			<>
				<span key={i + "label"}>
					{date.toLocaleDateString('en-AU', {
						weekday: 'long',
						day: '2-digit',
						month: '2-digit',
						year: 'numeric',
						timeZone: currentEvent.eventTimezone || undefined,
					})}
				</span>
				<TextInput
					key={i}
					// label={date.toLocaleDateString('en-AU', {
					// 	weekday: 'long',
					// 	day: '2-digit',
					// 	month: '2-digit',
					// 	year: 'numeric',
					// 	timeZone: currentEvent.eventTimezone || undefined,
					// })}
					// onChange={(e) => {
					// 	const newDates = dayTimes;
					// 	newDates[i] = e.target.value;
					// 	setDayTimes(newDates);
					// }}
					value={value[field.path][i] ?? ''}
				/>
			</>
		);
	}

	return (
		<FieldContainer>
			<FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
			<Stack>
				{/* <TextArea
					id={field.path}
					readOnly={onChange === undefined}
					css={{
						fontFamily: 'monospace',
						...(!onChange && {
							backgroundColor: '#eff3f6',
							border: '1px solid transparent',
							'&:focus-visible': {
								outline: 0,
								backgroundColor: '#eff3f6',
								boxShadow: '0 0 0 2px #e1e5e9',
								border: '1px solid #b1b5b9',
							},
						}),
					}}
					autoFocus={autoFocus}
					onChange={(event) => onChange?.(event.target.value)}
					value={JSON.stringify(value[field.path], null, 2) ?? ''}
				/>
				{forceValidation && (
					<Text color="red600" size="small">
						{'Invalid JSON'}
					</Text>
				)} */}
				{hostDates}
			</Stack>
		</FieldContainer>
	);
};

export const Cell: CellComponent = ({ item, field, linkTo }) => {
	let value = item[field.path] + '';
	return linkTo ? <CellLink {...linkTo}>{value}</CellLink> : <CellContainer>{value}</CellContainer>;
};
Cell.supportsLinkTo = true;

export const CardValue: CardValueComponent = ({ item, field }) => {
	return (
		<FieldContainer>
			<FieldLabel>{field.label}</FieldLabel>
			{item[field.path]}
		</FieldContainer>
	);
};

type Config = FieldControllerConfig<{ defaultValue: [] }>;

export const controller = (config: Config): FieldController<string, string> => {
	return {
		path: config.path,
		label: config.label,
		graphqlSelection: config.path,
		defaultValue: config.fieldMeta.defaultValue === null ? '' : JSON.stringify(config.fieldMeta.defaultValue, null, 2),
		validate: (value) => {
			if (!value) return true;
			try {
				JSON.parse(value);
				return true;
			} catch (e) {
				return false;
			}
		},
		deserialize: (data) => {
			return { ...data, listKey: config.listKey.toLowerCase() };
		},
		serialize: (value) => {
			let parsedValue;
			if (!value) {
				return { [config.path]: null };
			}
			try {
				parsedValue = JSON.parse(value);
			} catch (e) {}
			return { [config.path]: parsedValue };
		},
	};
};
