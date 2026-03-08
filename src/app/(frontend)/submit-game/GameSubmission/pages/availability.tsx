import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { Checkbox } from "@mantine/core";
import dayjs from "dayjs";
import { GameSubmitPage } from "../components/GameSubmitPage";
import { SubmissionPageRef } from "../submissionTypes";

type AvailabilityProps = {
	event: {
		startDate: string;
		endDate: string;
		eventTimezone: string;
	};
	show: boolean;
	onComplete: (isComplete: boolean) => void;
};

function datesToString(dates: boolean[]) {
	return JSON.stringify([...dates].map((date) => (date ? "true" : "false")));
}

export const Availability = forwardRef<SubmissionPageRef, AvailabilityProps>((props, ref) => {
	const [dates, setDates] = useState<boolean[]>([true]);

	const eventLength = useMemo(
		() => dayjs(props.event.endDate).diff(dayjs(props.event.startDate), "day") + 1,
		[props.event],
	);

	useImperativeHandle(ref, () => ({
		reset: () => setDates([]),
	}));

	useEffect(() => {
		props.onComplete(dates.some((date) => date));
	}, [dates]);

	let dateCheckboxes = [];
	for (let i = 0; i < eventLength; i++) {
		const date = dayjs(props.event.startDate).add(i, "day").toDate();
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

	return (
		<GameSubmitPage title="Availability" show={props.show}>
			<input type="hidden" name="availability" value={datesToString(dates)} />
			<div style={{ display: "flex", flexDirection: "column" }}>{dateCheckboxes}</div>
		</GameSubmitPage>
	);
});
