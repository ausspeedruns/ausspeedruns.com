import React from "react";
import type { LiveStreamBlock as LiveStreamBlockProps } from "#/payload-types";
import styles from "./LiveStreamBlock.module.css";

export function LiveStreamBlock(props: LiveStreamBlockProps) {
	const { title, twitchChannel } = props;
	return (
		<div className={styles.container}>
			{title && <h2>{title}</h2>}
			{twitchChannel ? (
				<div className={styles.embedWrapper}>
					<iframe
						src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=localhost`}
						height="480"
						width="854"
						allowFullScreen
					/>
					<iframe
						src={`https://www.twitch.tv/embed/${twitchChannel}/chat?parent=localhost`}
						height="480"
						width="350"
					/>
				</div>
			) : (
				<p>Please configure a Twitch channel.</p>
			)}
		</div>
	);
}
