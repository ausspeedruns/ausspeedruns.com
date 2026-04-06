import styles from "./date-divider.module.css";

import dayjs from "dayjs";
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

interface DateDividerProps {
	date: Date;
}

export function DateDivider(props: DateDividerProps) {
	const dateString = dayjs(props.date).format("dddd Do, MMMM");
	return (
		<div className={styles.dateDivider} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
			{dateString}
		</div>
	);
};
