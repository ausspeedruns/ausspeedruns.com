import { TextInput, Input } from "@mantine/core";
// import useFormInput from "../../../../hooks/useFormInput";
import { useEffect } from "react";
import styles from "./DonationIncentive.module.css";
import type { DonationIncentive } from "./submissionTypes";
// import _, { isEqual } from "underscore";

type DonationIncentiveProps = {
	onDonationChange: (donationIncentive: DonationIncentive, index: number) => void;
	index: number;
	value: DonationIncentive;
};

export default function DonationIncentiveInput({ onDonationChange, index, value }: DonationIncentiveProps) {
	// const title = useFormInput(value.title);
	// const time = useFormInput(value.time);
	// const description = useFormInput(value.description);

	// useEffect(() => {
	// 	const data = {
	// 		title: title.elementProps.value,
	// 		time: time.elementProps.value,
	// 		description: description.elementProps.value,
	// 	};

	// 	if (!isEqual(value, data)) {
	// 		onDonationChange(data, index);
	// 	}
	// }, [value, title.elementProps.value, time.elementProps.value, description.elementProps.value, index]);

	return (
		<div className={styles.container}>
			<div className={styles.topRow}>
				{/* <TextInput {...title.elementProps} label="Name" style={{ flex: 1 }} />
				<TextInput {...time.elementProps} label="Extra Time Needed" style={{ flex: 1 }} /> */}
			</div>
			<div className={styles.bottomRow}>
				<div style={{ width: "100%" }}>
					{/* <TextInput {...description.elementProps} label="Details" /> */}
					<Input.Description>
						e.g. Character limits, bid war options, video of extra category
					</Input.Description>
				</div>
			</div>
		</div>
	);
}
