import styles from "../Schedule.event.module.scss";
import RunnerIcon from "../icons/runner.svg";
import { styled, Tooltip, tooltipClasses, TooltipProps } from "@mui/material";
import { Runners } from "../runners";

import type { Run, Block } from "../schedule-types";

const RunHover = styled(({ className, odd, block, ...props }: TooltipProps & { odd: boolean; block?: Block }) => (
	<Tooltip {...props} classes={{ popper: className }} />
))(({ odd, block }) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: block?.colour ? `${block.colour}a6` : odd ? "#cc7722a6" : "#437c90a6",
		color: block?.textColour ? block.textColour : "#fff",
		border: `1px solid ${block?.colour ? block.colour : odd ? "#cc7722" : "#437c90"}`,
		backdropFilter: "blur(10px)",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		maxWidth: 500,
	},
}));

type RunProps = {
	run: Run;
	proportion: number;
	block?: Block;
};

export const RunVisualBlock = ({ run, proportion, block }: RunProps) => {
	const oddRun = run.order === undefined ? false : run.order % 2 != 0;

	return (
		<RunHover
			title={
				<div className={styles.visualiserTooltip}>
					{block && <h3>{block.name}</h3>}
					<h1>{run.game}</h1>
					<h2>{run.category}</h2>
					<h3>
						<img src={RunnerIcon.src} />
						{run.runners.length > 0 ? <Runners runners={run.runners} /> : run.racer}
					</h3>
				</div>
			}
			run-odd={oddRun.toString()}
			odd={oddRun}
			block={block}>
			<div
				className={styles.visualiserRun}
				style={{
					width: `calc(${proportion}% - 1px)`,
					background: block && block.colour,
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
