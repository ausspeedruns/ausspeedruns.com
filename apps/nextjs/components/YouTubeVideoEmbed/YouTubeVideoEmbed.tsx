import React from 'react';
import styles from './YouTubeVideoEmbed.module.scss';

type YouTubeProps = {
	videoID: string;
};

const YouTubeVideoEmbed = ({ videoID }: YouTubeProps) => {
	return (
		<div className={styles.youtubeEmbed}>
			<iframe
				title="AusSpeedruns YouTube Player"
				src={`https://www.youtube.com/embed/${videoID}`}
				allowFullScreen
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			></iframe>
		</div>
	);
};

export default YouTubeVideoEmbed;
