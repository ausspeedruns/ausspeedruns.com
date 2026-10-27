import { Button, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import styles from "./DonationIncentive.module.css";
import type { GameSubmissionResults } from "../submissionTypes";

type DonationIncentiveProps = {
	form: UseFormReturnType<GameSubmissionResults>;
	index: number;
	onRemove: () => void;
};

export default function DonationIncentiveInput({ form, index, onRemove }: DonationIncentiveProps) {
	// Optional fields start undefined; keep the inputs controlled from the start
	const inputProps = (field: "title" | "time" | "description") => {
		const props = form.getInputProps(`donationIncentives.${index}.${field}`);
		return { ...props, value: props.value ?? "" };
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<span className={styles.title}>Incentive {index + 1}</span>
				<Button variant="subtle" color="red" size="compact-sm" onClick={onRemove}>
					Remove
				</Button>
			</div>
			<div className={styles.topRow}>
				<TextInput {...inputProps("title")} label="Name" placeholder="e.g. Name the file" required />
				<TextInput {...inputProps("time")} label="Extra time needed" placeholder="e.g. 5 mins" />
			</div>
			<TextInput
				{...inputProps("description")}
				label="Details"
				description="e.g. Character limits, bid war options, video of extra category"
			/>
		</div>
	);
}
