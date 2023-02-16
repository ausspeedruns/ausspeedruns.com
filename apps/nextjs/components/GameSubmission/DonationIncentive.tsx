import { FormControl, FormHelperText, TextField } from "@mui/material";
import useFormInput from "apps/nextjs/hooks/useFormInput";
import { useEffect } from "react";
import styles from "./DonationIncentive.module.scss";
import type { DonationIncentive } from "./submissionTypes";
import _, { isEqual } from "underscore";

type DonationIncentiveProps = {
	onDonationChange: (
		donationIncentive: DonationIncentive,
		index: number,
	) => void;
	index: number;
	value: DonationIncentive;
};

export default function DonationIncentiveInput(props: DonationIncentiveProps) {
	const title = useFormInput(props.value.title);
	const time = useFormInput(props.value.time);
	const description = useFormInput(props.value.description);

	useEffect(() => {
		title.setValue(props.value.title);
		time.setValue(props.value.time);
		description.setValue(props.value.description);
	}, [props.value]);

	useEffect(() => {
		const data = {
			title: title.value,
			time: time.value,
			description: description.value,
		};
		if (!isEqual(props.value, data))
			props.onDonationChange(data, props.index);
	}, [title.value, time.value, description.value, props.index]);

	return (
		<div className={styles.container}>
			<div className={styles.topRow}>
				<TextField fullWidth {...title} label="Name" />
				<TextField fullWidth {...time} label="Extra Time Needed" />
			</div>
			<div className={styles.bottomRow}>
				<FormControl fullWidth>
					<TextField {...description} label="Details" />
					<FormHelperText>
						e.g. Character limits, bid war options, video of extra
						category
					</FormHelperText>
				</FormControl>
			</div>
		</div>
	);
}
