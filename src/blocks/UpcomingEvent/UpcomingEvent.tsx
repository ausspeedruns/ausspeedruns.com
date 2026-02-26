import styles from "./UpcomingEvent.module.css";
// import Button from "../Button/Button";
// import { AusSpeedrunsEvent } from "../../types/types";
import { Countdown } from "./Countdown";
import type { UpcomingEventBlock as UpcomingEventBlockProps } from "#/payload-types";
import RichText from "#/components/RichText/RichText";
import { Media } from "#/components/Media/Media";

export function UpcomingEventBlock(props: UpcomingEventBlockProps) {
	return (
		<section className={styles.heroblock}>
			<div className={styles.mediaContainer}>
				{props.eventBackgroundImage && typeof props.eventBackgroundImage === "object" && (
					<Media fill imgClassName={styles.mediaImage} priority resource={props.eventBackgroundImage} />
				)}
			</div>
			<div className={`${styles.content} content`}>
				<div className={styles.ctaBlock}>
					<h1>{props.eventName}</h1>
					{props.eventDates && <h2>{props.eventDates}</h2>}
					<h3 className={[styles.countdown, styles.monospaced].join(" ")}>
						{/* <Countdown date={eventDate} renderer={countdownRender} zeroPadTime={2} /> */}
						<Countdown eventDate={props.eventStartDate} />
					</h3>
					<br />
					{props.richText && <RichText data={props.richText} enableGutter={false} />}
				</div>
				<div className={styles.logoBlock}>
					<Media resource={props.eventLogo} />
				</div>
			</div>
		</section>
	);
}
