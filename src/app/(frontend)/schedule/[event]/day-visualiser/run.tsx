import styles from "./run.module.css";
import RunnerIcon from "../icons/runner.svg";
import { Tooltip } from "@mantine/core";
import { Runners } from "../runners";

import type { Run, Block } from "../schedule-types";

type RunHoverProps = {
	label: React.ReactNode;
	children: React.ReactNode;
	odd: boolean;
	block?: Block;
	"run-odd"?: string;
};

const RunHover = ({ label, children, odd, block, ...props }: RunHoverProps) => {
	const backgroundColor = block?.colour ? `${block.colour}a6` : odd ? "#cc7722a6" : "#437c90a6";
	const color = block?.textColour ? block.textColour : "#fff";
	const borderColor = block?.colour ? block.colour : odd ? "#cc7722" : "#437c90";

	return (
		<Tooltip
			label={label}
			{...props}
			style={{
				backgroundColor,
				color,
				border: `1px solid ${borderColor}`,
				backdropFilter: "blur(10px)",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				maxWidth: 500,
			}}
		>
			{children}
		</Tooltip>
	);
};

type RunProps = {
	run: Run;
	proportion: number;
	block?: Block;
};

export const RunVisualBlock = ({ run, proportion, block }: RunProps) => {
	const oddRun = run.displayIndex % 2 != 0;

	return (
		<RunHover
			label={
				<div className={styles.visualiserTooltip}>
					{block && <h3>{block.name}</h3>}
					<h1>{run.game}</h1>
					<h2>{run.category}</h2>
					<h3>
						<RunnerIcon />
						<Runners runners={run.runners} />
					</h3>
				</div>
			}
			run-odd={oddRun.toString()}
			odd={oddRun}
			block={block}
		>
			<div
				className={styles.visualiserRun}
				run-odd={oddRun.toString()}
				style={{
					width: `calc(${proportion}% - 1px)`,
					background: (block && block.colour) || undefined,
				}}
				onClick={() => {
					const runElement = document.querySelector(`#${run.id}`);
					if (runElement != null) {
						runElement.scrollIntoView({ behavior: "smooth", block: "center" });
					}
				}}
			/>
		</RunHover>
	);
};
