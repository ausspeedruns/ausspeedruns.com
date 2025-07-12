"use client";

import { format } from "date-fns";
import styles from "../../styles/Event.incentives.module.scss";
import { BaseIncentiveData } from "./IncentiveType";

export interface WarProps extends BaseIncentiveData {
	type: "war";
	options: {
		name: string;
		total: number;
	}[];
}

function isColor(strColor: string) {
	if (typeof window === "undefined") {
		return false;
	}

	const s = new Option().style;
	s.color = strColor;
	return s.color !== "";
}

export function War(props: WarProps) {
	const time = new Date(props.run.scheduledTime);
	const sortedOptions = props.options.sort((a, b) => b.total - a.total);

	return (
		<div className={styles.war} style={{ color: props.active ? undefined : "#b7b7b7" }}>
			<div className={styles.gameinfo}>
				<span className={styles.game}>{props.run.game}</span>
				{" - "}
				<span className={styles.category}>{props.run.category}</span>
				{" - "}
				<span className={styles.category}>{format(time, "EEEE h:mm a")}</span>
			</div>
			<span className={styles.title}>{props.title}</span>
			<span className={styles.category}>{props.notes}</span>
			{sortedOptions.length > 0 ? (
				<div className={styles.options}>
					{sortedOptions.map((option, i) => {
						const progress = (option.total / sortedOptions[0].total) * 100;
						return (
							<div key={option.name} className={styles.option}>
								<div className={styles.vertical}>
									<span className={styles.name}>{option.name}</span>
									<span className={styles.total}>${option?.total?.toLocaleString() ?? "Error"}</span>
								</div>
								<div className={styles.progress}>
									<div
										className={styles.bar}
										style={{
											height: `${progress}%`,
											width: `${progress}%`,
											backgroundColor: isColor(option.name) ? option.name : undefined,
										}}
									/>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<span className={styles.noOptions}>
					{props.active
						? "None submitted. Donate and include one in your donation message!"
						: "None submitted. Runner's choice."}
				</span>
			)}
		</div>
	);
};
