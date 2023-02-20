import { useEffect, useState } from "react";
import { Inline, Stack } from "@keystone-ui/core";
import { Button } from "@keystone-ui/button";
import {
	Select,
	FieldContainer,
	FieldLabel,
	TextInput,
} from "@keystone-ui/fields";
import { useToasts } from "@keystone-ui/toast";
import { useMutation, useQuery, gql } from "@keystone-6/core/admin-ui/apollo";

import type {
	Goal as GoalData,
	War as WarData,
} from "../../../src/schema/incentives";

const INCENTIVE_TYPES = ["war", "goal"];

const INCENTIVE_OPTIONS = INCENTIVE_TYPES.map((incentive) => ({
	value: incentive,
	label: incentive.toLocaleUpperCase(),
}));

const QUERY_EVENT = gql`
	query ($event: String) {
		event(where: { shortname: $event }) {
			runs {
				id
				game
				category
			}
		}
	}
`;

interface QUERY_INCENTIVES_RESULTS {
	event?: {
		runs: {
			id: string;
			game: string;
			category: string;
		}[];
	};
}

const MUTATION_NEW_INCENTIVE = gql`
	mutation (
		$run: ID
		$runEvent: String
		$title: String
		$notes: String
		$type: String
		$data: JSON
	) {
		createIncentive(
			data: {
				run: { connect: { id: $run } }
				event: { connect: { shortname: $runEvent } }
				title: $title
				notes: $notes
				type: $type
				data: $data
				active: true
			}
		) {
			id
			title
		}
	}
`;

interface MUTATION_NEW_INCENTIVE_RESULTS {
	createIncentive: {
		id: string;
		title: string;
	};
}

type NewIncentiveInputProps = {
	eventId?: string;
};

export function NewIncentiveInput(props: NewIncentiveInputProps) {
	const eventData = useQuery<QUERY_INCENTIVES_RESULTS>(QUERY_EVENT, {
		variables: { event: props.eventId },
	});

	const [addIncentiveMutation, addIncentiveMutationData] = useMutation<MUTATION_NEW_INCENTIVE_RESULTS>(
		MUTATION_NEW_INCENTIVE,
	);

	const [title, setTitle] = useState("");
	const [run, setRun] = useState({ value: "", label: "" });
	const [notes, setNotes] = useState("");
	const [type, setType] = useState(INCENTIVE_OPTIONS[0]);
	const [data, setData] = useState<GoalData['data'] | WarData['data']>(undefined);

	const { addToast } = useToasts();

	// Add Incentive Feedback
	useEffect(() => {
		// console.log(updateRunMutationData);
		if (addIncentiveMutationData.error) {
			console.error(addIncentiveMutationData.error);
			addToast({
				title: "Error updating incentive",
				tone: "negative",
				message: addIncentiveMutationData.error.message,
			});
		} else if (addIncentiveMutationData.data?.createIncentive) {
			setData({ goal: 0, current: 0 });
			setRun({ value: "", label: "" });
			setTitle("");
			setNotes("");
			setType(INCENTIVE_OPTIONS[0]);

			addToast({
				title: `Added ${addIncentiveMutationData.data.createIncentive.title}`,
				id: addIncentiveMutationData.data.createIncentive.id,
				tone: "positive",
				preserve: false,
			});
		}
	}, [addIncentiveMutationData.data, addIncentiveMutationData.error]);

	const runOptions = eventData.data?.event?.runs.map((run) => ({
		value: run.id,
		label: `${run.game} - ${run.category}`,
	}));

	function AddIncentive() {
		if (!title || !run.value || !type.value)
			return;

		switch (type.value) {
			case "goal":
				if (!Object.hasOwn(data, "goal")) return;
				setData({ ...data, current: 0 });
				break;
			case "war":
				if (!Object.hasOwn(data, "options")) return;
				break;
			default:
				return;
		}

		addIncentiveMutation({
			variables: {
				run: run.value,
				runEvent: props.eventId,
				title: title,
				notes: notes,
				type: type.value,
				data: data,
			},
		});
	}

	return (
		<Stack gap="medium">
			<Inline gap="small">
				<FieldContainer>
					<FieldLabel>Incentive Name</FieldLabel>
					<TextInput
						onChange={(e) => setTitle(e.target.value)}
						value={title}
						disabled={!props.eventId}
					/>
				</FieldContainer>
				<FieldContainer>
					<FieldLabel>Run</FieldLabel>
					<Select
						onChange={(e) => setRun(e)}
						value={run}
						options={runOptions}
						isDisabled={!props.eventId}
						width="large"
					/>
				</FieldContainer>
			</Inline>
			<FieldContainer>
				<FieldLabel>Notes/Instructions</FieldLabel>
				<TextInput
					onChange={(e) => setNotes(e.target.value)}
					value={notes}
					disabled={!props.eventId}
				/>
			</FieldContainer>
			<FieldContainer>
				<FieldLabel>Type</FieldLabel>
				<Select
					onChange={(e) => {
						switch (e.value) {
							case "goal":
								setData({
									goal: 0,
									current: 0,
								});
								break;
							case "war":
								setData({
									options: [],
								});
								break;
						}
						setType(e);
					}}
					value={type}
					options={INCENTIVE_OPTIONS}
					isDisabled={!props.eventId}
				/>
			</FieldContainer>
			{type.value === "goal" && (
				<FieldContainer>
					<FieldLabel>
						Goal ${(data as GoalData['data'])?.goal?.toLocaleString() ?? 0}
					</FieldLabel>
					<TextInput
						onChange={(e) =>
							setData({ ...data, goal: parseInt(e.target.value) })
						}
						type="number"
						value={(data as GoalData['data'])?.goal ?? 0}
						disabled={!props.eventId}
					/>
				</FieldContainer>
			)}
			{type.value === "war" && (
				<>
					<FieldContainer>
						<FieldLabel>Options</FieldLabel>
						{(data as WarData['data'])?.options.map((item, i) => {
							return (
								<TextInput
									placeholder="Name"
									onChange={(e) => {
										const mutableOptions = [
											...(data as WarData['data']).options,
										];
										mutableOptions[i].name = e.target.value;
										setData({
											...data,
											options: mutableOptions,
										});
									}}
									value={item.name}
								/>
							);
						})}
					</FieldContainer>
					<Button
						tone="positive"
						weight="bold"
						onClick={() => {
							const mutableOptions = [
								...(data as WarData['data']).options,
							];
							mutableOptions.push({
								name: "",
								total: 0,
							});
							setData({
								...data,
								options: mutableOptions,
							});
						}}>
						+ Add
					</Button>
				</>
			)}
			<p>By default this incentive will start active</p>
			<Button
				onClick={AddIncentive}
				tone="active"
				weight="bold"
				isDisabled={!props.eventId || !title || !run.value}>
				Add new incentive
			</Button>
		</Stack>
	);
}
