import styles from './Availability.module.scss';
import { useEffect, useMemo, useState } from "react";
import { FormControlLabel, Checkbox } from "@mui/material";
import { addDays, differenceInDays } from "date-fns";

type AvailabilityProps = {
	event: {
		startDate: string;
		endDate: string;
		eventTimezone: string;
	};
	value?: boolean[];
	onAvailabilityUpdate: (dates: boolean[]) => void;
};

export default function Availability(props: AvailabilityProps) {
	console.log(props.value);
	const [dates, setDates] = useState<boolean[]>(props.value ?? []);
	const eventLength = useMemo(
		() =>
			differenceInDays(
				new Date(props.event.endDate),
				new Date(props.event.startDate),
			) + 1,
		[props.event],
	);

	useEffect(() => {
		props.onAvailabilityUpdate(dates);
	}, [dates]);

	let dateCheckboxes = [];
	for (let i = 0; i < eventLength; i++) {
		const date = addDays(new Date(props.event.startDate), i);
		dateCheckboxes.push(
			<FormControlLabel
				key={i}
				control={
					<Checkbox
						onChange={(e) => {
							const newDates = [...dates];
							newDates[i] = e.target.checked;
							setDates(newDates);
						}}
						checked={dates[i] ?? false}
						value={dates[i] ?? false}
					/>
				}
				label={date.toLocaleDateString("en-AU", {
					weekday: "long",
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
					timeZone:
						props.event.eventTimezone || "Australia/Melbourne",
				})}
			/>,
		);
	}

	return <div className={styles.container}>{dateCheckboxes}</div>;
}
