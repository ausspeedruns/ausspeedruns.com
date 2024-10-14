import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import Image from "next/image";
import JSBarcode from "jsbarcode";

import styles from "./ShirtOrder.module.scss";
import ShirtImage from "../../styles/img/events/asm24/asm24-shirt.png";

interface ASMShirtProps {
	shirtData: {
		shirtID: string;
		size: string;
		colour: "blue" | "purple";
		paid: boolean;
		notes?: string;
	};
}

const ASMShirt: React.FC<ASMShirtProps> = (props: ASMShirtProps) => {
	const { shirtID, paid, notes, size } = props.shirtData;
	const barcodeRef = useRef<SVGSVGElement>(null);

	let shirtPrice = 30;

	useEffect(() => {
		if (barcodeRef.current && paid) {
			JSBarcode(barcodeRef.current, shirtID, { displayValue: false });
		}
	}, [shirtID, paid, barcodeRef]);

	let noOfShirts = parseInt(notes?.match(/#(\d+)/)?.[1] ?? "") ?? 1;
	const hasSelectedSize = notes?.[0] !== "#";
	if (!hasSelectedSize) {
		shirtPrice = 25;
	} else {
		noOfShirts = 1;
	}

	return (
		<Box className={styles.generatedShirts} sx={{ boxShadow: 8 }}>
			<div className={styles.image}>
				<Image
					src={ShirtImage}
					alt="Shirt"
					sizes="100vw"
					style={{
						width: "100%",
						height: "auto",
						objectFit: "contain",
					}}
				/>
			</div>
			<div className={styles.basicInfo}>
				<span className={styles.label}>{shirtID}</span>
				{paid && <svg ref={barcodeRef} className={styles.barcode}></svg>}
				<div className={styles.informationGrid}>
					{notes?.[0] != "#" && (
						<>
							<span>Size</span>
							<span>{sizeToName(size)}</span>
						</>
					)}
					{/* <span>Size</span>
					<span>{sizeToName(size)}</span>
					<span>Colour</span>
					<span>{colour.charAt(0).toUpperCase() + colour.slice(1)}</span> */}
					<span>Status</span>
					<span>{paid ? "Paid" : "Unpaid"}</span>
				</div>
			</div>
			{!paid && (
				<div className={styles.unpaid}>
					<p>
						You <b>MUST</b> send the Shirt ID as the &quot;reference&quot;. Failure to do so will result in
						your shirt marked as not being paid and will not be ordered. The shirt will take up to 7 days to
						update.
					</p>
					<div className={styles.informationGrid}>
						<span>BSB</span>
						<span>085-005</span>
						<span>Account #</span>
						<span>30-192-8208</span>
						{~~noOfShirts > 1 && (
							<>
								<span>Num of Shirts</span>
								<span>{noOfShirts}</span>
							</>
						)}
						<span>Amount</span>
						<span>${noOfShirts * shirtPrice} AUD</span>
					</div>
				</div>
			)}
		</Box>
	);
};

function sizeToName(size: string) {
	switch (size) {
		case "xs":
			return "Extra Small";
		case "s":
			return "Small";
		case "m":
			return "Medium";
		case "l":
			return "Large";
		case "xl":
			return "Extra Large";
		case "xl2":
			return "2 Extra Large";
		case "xl3":
			return "3 Extra Large";
		case "xl4":
			return "4 Extra Large";
		default:
			return size;
	}
}

export default ASMShirt;
