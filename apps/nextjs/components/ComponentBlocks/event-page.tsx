import React from "react";
import { EventPageRenderers } from "@ausspeedruns/component-blocks";

import Image from "next/image";
import Button from "../Button/Button";
import {
	faArrowRight,
	faTicket,
	faCalendar,
	faPerson,
	faShirt,
} from "@fortawesome/free-solid-svg-icons";
import { Theme } from "../../styles/colors";
import styles from "./event-page.module.scss";

export const EventComponentRenderers: EventPageRenderers = {
	header: (props) => {
		if (!props.event) return <p>Missing Event Data</p>;
		return (
			<div
				className={styles.header}
				contentEditable={false}
				style={{
					backgroundImage: `url("${props.backgroundImage}")`,
					backgroundPosition: props.backgroundSettings.position,
					backgroundSize: props.backgroundSettings.cover
						? "cover"
						: "contain",
					backgroundRepeat: props.backgroundSettings.repeat,
				}}>
				<div className={styles.logo}>
					<Image
						src={
							props.event.data.logo?.url
						}
						alt={`${props.event.data.shortname} Logo`}
						style={{ objectFit: "contain" }}
						fill
					/>
				</div>
				<div className={styles.buttons}>
					{props.donateLink && (
						<Button
							actionText="Donate"
							link={props.donateLink}
							openInNewTab
						/>
					)}

					{props.event?.data?.acceptingSubmissions && (
						<Button
							actionText="Submissions are open!"
							link="/submit-game"
							iconRight={faArrowRight}
						/>
					)}

					{props.event?.data?.acceptingBackups &&
						!props.event?.data?.acceptingSubmissions && (
							<Button
								actionText="Backup submissions are open!"
								link="/submit-game"
								iconRight={faArrowRight}
							/>
						)}

					{props.ticketLink && (
						<Button
							actionText="Purchase tickets"
							link={props.ticketLink}
							iconRight={faTicket}
						/>
					)}

					{props.event?.data?.scheduleReleased && (
						<Button
							actionText="Schedule"
							link={`/${props.event.data?.shortname}/schedule`}
							iconRight={faCalendar}
						/>
					)}

					{props.event?.data?.acceptingVolunteers && (
						<Button
							actionText="Be a volunteer!"
							link="/volunteers"
							iconRight={faPerson}
						/>
					)}
				</div>
			</div>
		);
	},
	imageParagraph: (props) => {
		return (
			<div
				className={styles.imageParagraph}
				contentEditable={false}
				style={{
					color: props.textDark ? Theme.darkText : Theme.lightText,
					background: props.colour,
					flexDirection: props.swapSides ? "row-reverse" : "row",
				}}>
				<div className={styles.image}>
					<Image
						src={props.imageUrl}
						alt={props.imageAlt}
						fill
						style={{ objectFit: "cover" }}
					/>
				</div>
				<div
					className={styles.content}
					style={{ background: `${props.colour}d9` }}>
					<p>{props.content}</p>
				</div>
			</div>
		);
	},
	infoTable: (props) => {
		return (
			<section className={styles.informationSection}>
				<h3>Information</h3>
				<table className={styles.information}>
					<tbody>
						{props.info.map((info) => {
							return (
								<tr key={info.info}>
									<td>{info.label}</td>
									<td>{info.info}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</section>
		);
	},
	fullWidthImage: (props) => {
		return (
			<Image
				className={styles.footerImage}
				src={props.url}
				style={{ height: props.height, objectFit: "cover" }}
				fill
				alt=""
			/>
		);
	},
};
