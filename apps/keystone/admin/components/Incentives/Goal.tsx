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
				<FieldLabel>Current</FieldLabel>
				<TextInput
					onChange={(e) => 
						setIncentiveRawData({
							...incentiveRawData,
							current: e.target.valueAsNumber,
						})
					}
					type="number"
					value={incentiveRawData.current ?? 0}
				/>
			</FieldContainer>
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
