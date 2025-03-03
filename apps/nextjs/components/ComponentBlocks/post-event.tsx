import Image from "next/image";
import styles from "./post-event.module.scss";
// import { PostEventRenderers } from "@ausspeedruns/component-blocks";

type PostEventRenderers = any;

import { AllRuns } from "./all-runs";

export const PostEventComponentRenderers: PostEventRenderers = {
	eventLogo: (props: any) => {
		return (
			<div className={styles.eventLogo}>
				<Image
					src={props?.eventLogo?.data.logo.url}
					fill
					alt={`${props?.eventLogo?.data.name} Logo`}
				/>
			</div>
		);
	},
	raisedAmount: (props: any) => {
		return (
			<div className={styles.raisedAmount}>
				<span className={styles.amount}>{props.amount}</span>
				raised for
				<div className={styles.charityImage}>
					<Image
						src={props.charityImage}
						alt={props.charityName}
						fill
					/>
				</div>
			</div>
		);
	},
	AllRuns: (props: any) => <AllRuns event={props.event} />,
	image: (props: any) => {
		return (
			<figure className={styles.image}>
				<div className={styles.image}>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={props.imgUrl} alt={props.caption} />
				</div>
				<figcaption>{props.caption}</figcaption>
			</figure>
		);
	},
};
