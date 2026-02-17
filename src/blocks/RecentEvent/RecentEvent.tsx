import { Media } from "@/components/Media";
import styles from "./RecentEvent.module.css";

import type { RecentEventBlock as RecentEventBlockProps } from "@/payload-types";
import RichText from "@/components/RichText";

export function RecentEventBlock(props: RecentEventBlockProps) {
	return (
		<section className={styles.lasteventblock}>
			<div className={`${styles.content} content`}>
				<div className={styles.ctaBlock}>
					<h1>{props.eventName}</h1>
					<br />
					{props.richText && <RichText data={props.richText} enableGutter={false} />}
				</div>
				<div className={styles.logoBlock}>
					<Media resource={props.eventLogo} alt="Event Logo" />
					<span className={styles.total}>{props.eventRaised}</span>
				</div>
			</div>
		</section>
	);
}
