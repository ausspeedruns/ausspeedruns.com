import styles from "./Availability.module.css";
import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@mantine/core";
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
	const [dates, setDates] = useState<boolean[]>(props.value ?? []);
	const eventLength = useMemo(() => differenceInDays(props.event.endDate, props.event.startDate) + 1, [props.event]);

	useEffect(() => {
		props.onAvailabilityUpdate(dates);
	}, [dates]);

	let dateCheckboxes = [];
	for (let i = 0; i < eventLength; i++) {
		const date = addDays(props.event.startDate, i);
		dateCheckboxes.push(
			<Checkbox
				key={i}
				onChange={(e) => {
					const newDates = [...dates];
					newDates[i] = e.currentTarget.checked;
					setDates(newDates);
				}}
				checked={dates[i] ?? false}
				label={date.toLocaleDateString("en-AU", {
					weekday: "long",
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
					timeZone: props.event.eventTimezone || "Australia/Melbourne",
				})}
			/>,
		);
	}

	return <div className={styles.container}>{dateCheckboxes}</div>;
}
