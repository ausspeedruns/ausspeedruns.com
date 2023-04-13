import { FieldContainer, FieldDescription, FieldLabel } from "@keystone-ui/fields";
import { CellLink, CellContainer } from "@keystone-6/core/admin-ui/components";
import { Box, Stack } from "@keystone-ui/core";
import { Button } from "@keystone-ui/button";
import { useQuery, gql, useLazyQuery, ApolloClient, InMemoryCache } from "@keystone-6/core/admin-ui/apollo";

// import { CellLink, CellContainer } from "@keystone-6/";
import type { Block as BlockType } from "./block-schema";

import {
	CardValueComponent,
	CellComponent,
	FieldController,
	FieldControllerConfig,
	FieldProps,
} from "@keystone-6/core/types";
import { Block } from "./block";
import { useEffect } from "react";

// this is the component shown in the create modal and item page
export const Field = ({ field, value, onChange }: FieldProps<typeof controller>) => {
	const {
		data: runsData,
		loading: runsLoading,
		error: runsError,
	} = useQuery<RUNS_QUERY_RESULT>(RUNS_QUERY, { variables: { eventID: value?.eventID } });

	useEffect(() => {
		if (runsError) {
			console.error("[Schedule Block Field]", runsError);
		}
	}, [runsError]);

	const disabled = onChange === undefined;
	const data = value?.blocks;

	function addNewBlock() {
		if (!data) {
			const newData = [{ name: "", colour: "#cc7722", textColour: "#ffffff", startRunId: "" }];
			if (value?.eventID) onChange?.({ ...value, blocks: newData });
		} else {
			data.push({ name: "", colour: "#cc7722", textColour: "#ffffff", startRunId: "" });
			onChange?.({ ...value, blocks: data });
		}
	}

	function onChangeBlock(id: number, changedBlock: BlockType) {
		if (!data) return;
		data[id] = changedBlock;
		onChange?.({ ...value, blocks: data });
	}

	function onDeleteBlock(id: number) {
		if (!data) return;
		const newData = data.filter((block, idx) => idx !== id);
		onChange?.({ ...value, blocks: newData });
	}

	const runOptions =
		runsData?.event.runs.map((run) => {
			return { label: run.label, value: run.id };
		}) ?? [];

	console.log(value);

	return (
		<FieldContainer as="fieldset">
			<FieldLabel as="legend">{field.label}</FieldLabel>
			<FieldDescription id={`${field.path}-description`}>{field.description}</FieldDescription>
			<Box padding="medium" rounding="medium" style={{ borderWidth: "1px", maxHeight: 400, overflowY: "scroll" }}>
				<Stack gap="medium">
					{data ? (
						data.map((block, index) => {
							return (
								<Block
									disabled={disabled}
									value={block}
									id={index}
									onChange={onChangeBlock}
									onDelete={onDeleteBlock}
									runs={runOptions}
									runsLoading={runsLoading}
								/>
							);
						})
					) : (
						<p>No data</p>
					)}
				</Stack>
			</Box>
			<Button onClick={addNewBlock} tone="positive">
				Add Block
			</Button>
		</FieldContainer>
	);
};

// this is shown on the list view in the table
export const Cell: CellComponent = ({ item, field, linkTo }) => {
	let value = item[field.path] + "";
	return linkTo ? <CellLink {...linkTo}>{value}</CellLink> : <CellContainer>{value}</CellContainer>;
};
// setting supportsLinksTo means the cell component allows containing a link to the item
// for example, text fields support it but relationship fields don't because
// their cell component links to the related item so it can't link to the item that the relationship is on
Cell.supportsLinkTo = true;

// this is shown on the item page in relationship fields with `displayMode: 'cards'`
export const CardValue: CardValueComponent = ({ item, field }) => {
	return (
		<FieldContainer>
			<FieldLabel>{field.label}</FieldLabel>
			{item[field.path]}
		</FieldContainer>
	);
};

export const controller = (
	config: FieldControllerConfig<{}>,
): FieldController<{ eventID: string; blocks: BlockType[] } | null, string> => {
	return {
		path: config.path,
		label: config.label,
		description: config.description,
		graphqlSelection: config.path,
		defaultValue: { eventID: "", blocks: [] },
		deserialize: (data) => {
			const value = data[config.path];
			try {
				return { eventID: data.id, blocks: JSON.parse(value) };
			} catch (error) {
				console.error("[Schedule Block]", error);
				return null;
			}
		},
		serialize: (value) => ({ [config.path]: value?.blocks ? JSON.stringify(value?.blocks) : null }),
	};
};

type RUNS_QUERY_RESULT = {
	event: {
		runs: {
			id: string;
			label: string;
		}[];
	};
};

const RUNS_QUERY = gql`
	query ($eventID: ID!) {
		event(where: { id: $eventID }) {
			runs {
				id
				label
			}
		}
	}
`;
