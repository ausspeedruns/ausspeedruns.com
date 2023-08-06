import React from "react";
import styles from "./TwitchVideoEmbed.module.scss";

type TwitchProps = {
	channel: string;
	parent: string;
	muted?: boolean;
	video?: string;
};

const TwitchVideoEmbed = ({ channel, parent, muted = true, video }: TwitchProps) => {
	let url = `https://player.twitch.tv/?channel=${channel}&parent=${parent}&muted=${muted}`;

	if (video)
	{
		url = `https://player.twitch.tv/?video=${video}&parent=${parent}&muted=${muted}&autoplay=false`;
	}

	return (
		<div className={styles.twitchEmbed}>
			<iframe
				title="Ausspeedruns twitch player"
				src={url}
				allowFullScreen></iframe>
		</div>
	);
};

export default TwitchVideoEmbed;
