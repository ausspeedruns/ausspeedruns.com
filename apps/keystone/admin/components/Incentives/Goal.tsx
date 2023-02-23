import { useState } from "react";
import { Stack } from "@keystone-ui/core";
import {
	FieldContainer,
	FieldLabel,
	TextInput,
	Checkbox,
} from "@keystone-ui/fields";
import { Button } from "@keystone-ui/button";

import type { Goal as GoalData } from "../../../src/schema/incentives";
import {
	MutationTuple,
	OperationVariables,
} from "@keystone-6/core/admin-ui/apollo";
import { MUTATION_UPDATE_INCENTIVE_RESULTS } from "../../pages/incentives-dashboard";

type GoalProps = {
	incentive: GoalData;
	incentiveUpdate: MutationTuple<
		MUTATION_UPDATE_INCENTIVE_RESULTS,
		OperationVariables
	>[0];
};

export function Goal({ incentive, incentiveUpdate }: GoalProps) {
	const [incentiveRawData, setIncentiveRawData] = useState<GoalData["data"]>(
		incentive.data,
	);

	const [active, setActive] = useState(incentive.active);
	const [add, setAdd] = useState(0);

	function UpdateIncentive() {
		if (!incentive.id) return;

		if (isNaN(incentiveRawData.current) || isNaN(incentiveRawData.goal))
			return;

		incentiveUpdate({
			variables: {
				incentive: incentive.id,
				data: incentiveRawData,
				active: active,
			},
		});
	}

	function handleAdd() {
		setIncentiveRawData({
			...incentiveRawData,
			current: incentiveRawData.current + add,
		});

		setAdd(0);
	}

	const invalidData =
		isNaN(incentiveRawData.current) ||
		isNaN(incentiveRawData.goal) ||
		!incentive.id;

	return (
		<Stack gap="medium">
			<FieldContainer>
				<FieldLabel>Goal ${incentive.data.goal}</FieldLabel>
			</FieldContainer>
			<FieldContainer>
				<p>
					Needs ${incentive.data.goal - incentive.data.current} more
					dollars.{" "}
					{Math.round(
						(incentive.data.current / incentive.data.goal) * 100,
					)}
					% of the way there.
				</p>
			</FieldContainer>
			<FieldContainer>
				<FieldLabel>Currently</FieldLabel>
				<span style={{ fontSize: "2rem", fontWeight: "bold" }}>
					${incentiveRawData.current.toLocaleString() ?? 0}
				</span>
			</FieldContainer>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "2fr 1fr",
					width: "50%",
					gap: "1rem",
				}}>
				<TextInput
					onChange={(e) => setAdd(e.target.valueAsNumber)}
					type="number"
					value={add}
				/>
				<Button
					isDisabled={add === 0}
					tone="positive"
					weight={add === 0 ? "light" : "bold"}
					onClick={handleAdd}>
					Add
				</Button>
			</div>

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
