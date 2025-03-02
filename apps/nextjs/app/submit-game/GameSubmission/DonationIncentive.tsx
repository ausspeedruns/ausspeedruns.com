import { FormControl, FormHelperText, TextField } from "@mui/material";
import useFormInput from "apps/nextjs/hooks/useFormInput";
import { useEffect } from "react";
import styles from "./DonationIncentive.module.scss";
import type { DonationIncentive } from "./submissionTypes";
import _, { isEqual } from "underscore";

type DonationIncentiveProps = {
	onDonationChange: (donationIncentive: DonationIncentive, index: number) => void;
	index: number;
	value: DonationIncentive;
};

export default function DonationIncentiveInput({ onDonationChange, index, value }: DonationIncentiveProps) {
	const title = useFormInput(value.title);
	const time = useFormInput(value.time);
	const description = useFormInput(value.description);

	useEffect(() => {
		const data = {
			title: title.elementProps.value,
			time: time.elementProps.value,
			description: description.elementProps.value,
		};

		if (!isEqual(value, data)) {
			onDonationChange(data, index);
		}
	}, [value, title.elementProps.value, time.elementProps.value, description.elementProps.value, index]);

	return (
		<div className={styles.container}>
			<div className={styles.topRow}>
				<TextField fullWidth {...title.elementProps} label="Name" />
				<TextField fullWidth {...time.elementProps} label="Extra Time Needed" />
			</div>
			<div className={styles.bottomRow}>
				<FormControl fullWidth>
					<TextField {...description.elementProps} label="Details" />
					<FormHelperText>e.g. Character limits, bid war options, video of extra category</FormHelperText>
				</FormControl>
			</div>
		</div>
	);
}
