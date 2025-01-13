"use client";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { enAU } from "date-fns/locale";

export default function LocalisedDatePicker({ maxDate }: { maxDate: Date }) {
	return (
		<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enAU}>
			<DatePicker
				name="dob"
				openTo={"year"}
				maxDate={maxDate}
				views={["year", "month", "day"]}
				label="Date of Birth"
			/>
		</LocalizationProvider>
	);
}
