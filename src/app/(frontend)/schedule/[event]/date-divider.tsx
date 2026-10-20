import styles from "./date-divider.module.css";

import { format } from "date-fns";

interface DateDividerProps {
	date: Date;
}

export function DateDivider(props: DateDividerProps) {
	const dateString = format(props.date, "EEEE do, MMMM");
	return (
		<div className={styles.dateDivider} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
			{dateString}
		</div>
	);
};
