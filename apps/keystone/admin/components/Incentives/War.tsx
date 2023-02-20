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

				{incentiveRawData.options.map((item, i) => {
					return (
						<Inline key={item.name}>
							<TextInput
								placeholder="Name"
								onChange={(e) => {
									const mutableOptions =
										incentiveRawData.options.map((a) => ({
											...a,
										}));
									mutableOptions[i].name = e.target.value;
									setIncentiveRawData({
										...incentiveRawData,
										options: mutableOptions,
									});
								}}
								value={item.name}
							/>
							<TextInput
								placeholder="Amount"
								type="number"
								onChange={(e) => {
									const mutableOptions =
										incentiveRawData.options.map((a) => ({
											...a,
										}));
									mutableOptions[i].total = e.target.valueAsNumber;
									setIncentiveRawData({
										...incentiveRawData,
										options: mutableOptions,
									});
								}}
								value={item.total}
							/>
							<span>${item.total.toLocaleString()}</span>
						</Inline>
					);
				})}
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
				+ Add
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
