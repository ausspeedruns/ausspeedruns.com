import { RefObject, useEffect, useRef, useState } from "react";
import styles from "./schedule-block.module.scss";
import type { Block } from "apps/nextjs/pages/[event]/schedule";
import useMediaQuery from "@mui/material/useMediaQuery";

type ScheduleBlockProps = {
	block: Block;
	children: React.ReactNode;
};

export function ScheduleBlock(props: ScheduleBlockProps) {
	const [runFirst, setRunFirst] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const blockLabelRef = useRef<HTMLDivElement>(null);
	const runsRef = useRef<HTMLDivElement>(null);
	const smZero = useMediaQuery("(max-width: 991px)");

	useEffect(() => {
		refreshBlockHeight(runsRef, smZero, blockLabelRef, runFirst);
		setRunFirst(true);
	}, [blockLabelRef, runsRef, smZero, props.children]);

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

function refreshBlockHeight(
	runsRef: RefObject<HTMLDivElement>,
	smZero: boolean,
	blockLabelRef: RefObject<HTMLDivElement>,
	checkOverflow: boolean,
) {
	if (!blockLabelRef.current || !runsRef.current) return;
	const runsHeight = Array.from(runsRef.current.children).reduce((prev, el) => el.clientHeight + prev, 0);

	if (smZero) {
		blockLabelRef.current.style.height = "auto";
		blockLabelRef.current.style.paddingBottom = "4px";
	} else {
		const correctedHeight = runsHeight + (runsRef.current.childElementCount - 1) * 2;
		blockLabelRef.current.style.height = `${correctedHeight < blockLabelRef.current.scrollHeight && checkOverflow ? blockLabelRef.current.scrollHeight : correctedHeight}px`;
	}

}

function transparentColour(hex: string) {
	return hex + "26";
}
