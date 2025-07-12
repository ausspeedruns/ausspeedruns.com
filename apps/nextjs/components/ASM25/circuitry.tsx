import styles from "./circuitry.module.scss";
import circuitBoardImage from "./circuit-board.png";

function generateBoxShadows(bigShadowAngle: number) {
	const bigAngleX = Math.cos((bigShadowAngle * Math.PI) / 180) * 150;
	const bigAngleY = Math.sin((bigShadowAngle * Math.PI) / 180) * 150;

	return `
		inset 6px 6px 3px rgba(217, 211, 224, 0.34),
		inset -8px -7px 3px rgba(68, 42, 105, 0.77),
		inset ${bigAngleX}px ${bigAngleY}px 150px rgba(71, 31, 97, 0.6)
		`;
}

interface CircuitryProps {
	style?: React.CSSProperties;
	noCircuitBoard?: boolean;
	bigShadowAngle?: number;
}

console.log(circuitBoardImage.src)

export function Circuitry(props: CircuitryProps) {
	const test = generateBoxShadows(props.bigShadowAngle ?? 90);

	return (
		<div
			style={{
				backgroundImage: props.noCircuitBoard ? "none" : `url(${circuitBoardImage.src})`,
				backgroundSize: "100% auto", // cover X axis, repeat Y axis
				backgroundPosition: "center top",
				backgroundRepeat: "repeat-y",
				zIndex: -3,
				...props.style,
			}}>
			<div
				style={{
					backgroundColor: "#C39CE2",
					mixBlendMode: "color",
					height: "100%",
					width: "100%",
					position: "absolute",
					zIndex: -2,
				}}
			/>
			<div
				style={{
					boxShadow: test,
				}}
				className={styles.plastic}
			/>
		</div>
	);
}
