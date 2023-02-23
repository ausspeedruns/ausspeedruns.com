import { useState } from "react";
import { Stack, Inline } from "@keystone-ui/core";
import {
	FieldContainer,
	FieldLabel,
	TextInput,
	Checkbox,
} from "@keystone-ui/fields";
import { Button } from "@keystone-ui/button";

import type { War as WarData } from "../../../src/schema/incentives";
import {
	MutationTuple,
	OperationVariables,
} from "@keystone-6/core/admin-ui/apollo";
import { MUTATION_UPDATE_INCENTIVE_RESULTS } from "../../pages/incentives-dashboard";
// import { clone } from "underscore";

type WarProps = {
	incentive: WarData;
	incentiveUpdate: MutationTuple<
		MUTATION_UPDATE_INCENTIVE_RESULTS,
		OperationVariables
	>[0];
};

export function War({ incentive, incentiveUpdate }: WarProps) {
	const [incentiveRawData, setIncentiveRawData] = useState<WarData["data"]>(
		incentive.data,
	);
	const [active, setActive] = useState(incentive.active);
	const [increments, setIncrements] = useState<number[]>(
		new Array(incentive.data.options.length).fill(0),
	);

	function UpdateIncentive() {
		if (!incentive.id) return;

		if (
			incentiveRawData.options.some(
				(option) => !option.name || isNaN(option.total),
			)
		)
			return;

		incentiveUpdate({
			variables: {
				incentive: incentive.id,
				data: incentiveRawData,
				active: active,
			},
		});
	}

	const invalidData =
		incentiveRawData.options.some(
			(option) => !option.name || isNaN(option.total),
		) || !incentive.id;

	function handleNameChange(newName: string, oldName: string) {
		const mutableOptions = [...incentiveRawData.options];

		const optionIndex = mutableOptions.findIndex(
			(option) => option.name === oldName,
		);

		let mutableOption = { ...mutableOptions[optionIndex] };
		if (optionIndex > -1) {
			mutableOption.name = newName;
		}

		mutableOptions[optionIndex] = mutableOption;

		setIncentiveRawData({
			...incentiveRawData,
			options: mutableOptions,
		});
	}

	// function handleManualAmountChange(amount: number, name: string) {
	// 	const mutableOptions = [...incentiveRawData.options];

	// 	const optionIndex = mutableOptions.findIndex(
	// 		(option) => option.name === name,
	// 	);
	// 	if (optionIndex > -1) {
	// 		mutableOptions[optionIndex].total = amount;
	// 	}

	// 	setIncentiveRawData({
	// 		...incentiveRawData,
	// 		options: mutableOptions,
	// 	});
	// }

	function handleIncrementChange(increment: number, index: number) {
		const mutableIncrements = [...increments];
		mutableIncrements[index] = increment;

		setIncrements(mutableIncrements);
	}

	function handleIncrement(index: number) {
		const mutableOption = { ...incentiveRawData.options[index] };
		mutableOption.total += increments[index];

		const mutableOptions = [...incentiveRawData.options];
		mutableOptions[index] = mutableOption;

		setIncentiveRawData({
			...incentiveRawData,
			options: mutableOptions,
		});

		handleIncrementChange(0, index);
	}

	function handleRemove(index: number) {
		const mutableOptions = incentiveRawData.options.filter(
			(_, i) => i !== index,
		);

		setIncentiveRawData({
			...incentiveRawData,
			options: mutableOptions,
		});
	}

	const highestNumber = incentiveRawData.options.reduce(
		(highest, opt) => (highest < opt.total ? opt.total : highest),
		-1,
	);

	return (
		<Stack gap="medium">
			<FieldContainer>
				{incentive.data.options.length > 0 ? (
					<p>
						Currently{" "}
						<b>
							{
								[...incentive.data.options].sort(
									(a, b) => b.total - a.total,
								)[0].name
							}
						</b>
					</p>
				) : (
					<p>No options submitted</p>
				)}
			</FieldContainer>
			<FieldContainer>
				<FieldLabel>Options</FieldLabel>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "2fr 1fr 0.5fr 2fr 0.5fr",
						gap: "0.5rem 1rem",
						alignItems: "center",
					}}>
					<span>Name</span>
					<span>Change by</span>
					<span></span>
					<span>Total</span>
					<span></span>
					{incentiveRawData.options.map((item, i) => {
						return (
							<>
								<TextInput
									placeholder="Name"
									onChange={(e) => {
										handleNameChange(
											e.target.value,
											item.name,
										);
									}}
									value={item.name}
								/>
								<TextInput
									placeholder="Increment"
									type="number"
									value={increments[i]}
									onChange={(e) => {
										handleIncrementChange(
											e.target.valueAsNumber,
											i,
										);
									}}
								/>
								<Button
									onClick={() => handleIncrement(i)}
									isDisabled={increments[i] === 0}
									tone="positive"
									weight={
										increments[i] === 0 ? "light" : "bold"
									}>
									Add
								</Button>
								<span
									style={{
										fontWeight:
											highestNumber === item.total
												? "bold"
												: "normal",
										fontSize: "1.5rem",
									}}>
									${item.total.toLocaleString()}
								</span>
								{item.name === "" ? (
									<Button
										onClick={() => handleRemove(i)}
										tone="negative"
										weight="light">
										Remove
									</Button>
								) : (
									<span></span>
								)}
							</>
						);
					})}
				</div>
			</FieldContainer>
			<Button
				style={{ marginTop: 8 }}
				tone="positive"
				weight="bold"
				onClick={() => {
					const mutableOptions = [...incentive.data.options];
					mutableOptions.push({
						name: "",
						total: 0,
					});
					setIncentiveRawData({
						...incentiveRawData,
						options: mutableOptions,
					});
				}}>
				+ Add New Option
			</Button>

			<FieldContainer>
				<Checkbox
					size="large"
					checked={active}
					style={{ marginRight: 16 }}
					onChange={(e) => {
						setActive(e.target.checked);
					}}>
					Active
				</Checkbox>
			</FieldContainer>
			<br />
			<Button
				tone="active"
				weight="bold"
				onClick={UpdateIncentive}
				isDisabled={invalidData}>
				Update
			</Button>
		</Stack>
	);
}
