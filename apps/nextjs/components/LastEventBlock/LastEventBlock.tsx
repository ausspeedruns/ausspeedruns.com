import React from "react";
import Image from "next/image";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import styles from "./LastEventBlock.module.scss";
import { AusSpeedrunsEvent } from "../../types/types";

import Button from "../Button/Button";

type LastEventBlockProps = {
	event: AusSpeedrunsEvent;
	backgroundPos?: string;
	tagLine: string;
	overrideHeight?: string;
};

const Heroblock = ({ event, backgroundPos, tagLine, overrideHeight }: LastEventBlockProps) => {
	return (
		<section
			className={styles.lasteventblock}
			style={{
				backgroundImage: `url("${
					require(`../../styles/img/${event.heroImage}`).default.src
				}")`,
				backgroundPosition: backgroundPos,
				height: overrideHeight
			}}>
			<div className={`${styles.content} content`}>
				<div className={styles.ctaBlock}>
					<h1>{event.preferredName}</h1>
					<br />
					<p>{tagLine}</p>
					<Button
						actionText={event.preferredName}
						link={`/${event.shortName}`}
						iconRight={faChevronRight}
						colorScheme={"secondary"}
						target={"_blank"}
					/>
				</div>
				<div className={styles.logoBlock}>
					<Image
						src={require(`../../styles/img/${event.logo}`)}
						alt="Event Logo"
						style={{
							maxWidth: "100%",
							height: "auto",
						}}
					/>
					<span className={styles.total}>${event.total}</span>
				</div>
			</div>
		</section>
	);
};

export default Heroblock;
