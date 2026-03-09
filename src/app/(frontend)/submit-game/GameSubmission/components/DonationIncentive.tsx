import { Input, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import styles from "./DonationIncentive.module.css";
import type { GameSubmissionResults } from "../submissionTypes";

type DonationIncentiveProps = {
	form: UseFormReturnType<GameSubmissionResults>;
	index: number;
};

export default function DonationIncentiveInput({ form, index }: DonationIncentiveProps) {
	return (
		<div className={styles.container}>
			<div className={styles.topRow}>
				<TextInput
					{...form.getInputProps(`donationIncentives.${index}.title`)}
					label="Name"
					style={{ flex: 1 }}
				/>
				<TextInput
					{...form.getInputProps(`donationIncentives.${index}.time`)}
					label="Extra Time Needed"
					style={{ flex: 1 }}
				/>
			</div>
			<div className={styles.bottomRow}>
				<div style={{ width: "100%" }}>
					<TextInput {...form.getInputProps(`donationIncentives.${index}.description`)} label="Details" />
					<Input.Description>
						e.g. Character limits, bid war options, video of extra category
					</Input.Description>
				</div>
			</div>
		</div>
	);
}
