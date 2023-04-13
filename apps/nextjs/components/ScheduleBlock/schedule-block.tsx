import { useEffect, useRef } from "react";
import styles from "./schedule-block.module.scss";
import type { Block } from "apps/nextjs/pages/[event]/schedule";
import useMediaQuery from '@mui/material/useMediaQuery';

type ScheduleBlockProps = {
	block: Block;
	children: React.ReactNode;
};

export function ScheduleBlock(props: ScheduleBlockProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const blockLabelRef = useRef<HTMLDivElement>(null);
	const runsRef = useRef<HTMLDivElement>(null);
	const smZero = useMediaQuery("(max-width: 991px)");

	useEffect(() => {
		if (!blockLabelRef.current || !runsRef.current || !containerRef.current) return;

		// const labelWidth = blockLabelRef.current.clientWidth;
		const runsHeight = Array.from(runsRef.current.children).reduce((prev, el) => el.clientHeight + prev, 0);

		// blockLabelRef.current.style.marginRight = `-${labelWidth}px`;
		// blockLabelRef.current.style.left = `-${labelWidth}px`;
		if (smZero) {
			blockLabelRef.current.style.height = "auto";
			blockLabelRef.current.style.paddingBottom = "4px";
		} else {
			blockLabelRef.current.style.height = `${runsHeight + (runsRef.current.childElementCount * 5 + 5)}px`;
		}
		// containerRef.current.style.height = `${runsHeight - 2}px`;
	}, [blockLabelRef, runsRef, containerRef, smZero]);

	return (
		<div
			className={styles.blockContainer}
			ref={containerRef}
			style={{ backgroundColor: transparentColour(props.block.colour), borderColor: props.block.colour }}>
			<div
				ref={blockLabelRef}
				className={styles.block}
				style={{ backgroundColor: props.block.colour, color: props.block.textColour }}>
				{props.block.name}
			</div>
			<div
				ref={runsRef}
				className={styles.runs}
				style={{ backgroundColor: transparentColour(props.block.colour), borderColor: props.block.colour }}>
				{props.children}
			</div>
		</div>
	);
}

function transparentColour(hex: string) {
	return hex + "26";
}
