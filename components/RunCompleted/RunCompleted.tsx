import React from 'react';
import YouTubeVideoEmbed from '../YouTubeVideoEmbed/YouTubeVideoEmbed';
import styles from './RunCompleted.module.scss';

type Run = {
	run: {
		id: string;
		game: string;
		category: string;
		finalTime?: string;
		platform: string;
		twitchVOD?: string;
		youtubeVOD?: string;
		scheduledTime: string;
		event: {
			name: string;
			logo: {
				url: string;
			};
		};
	};
};

const RunCompleted = ({ run }: Run) => {
	return (
		<div className={styles.run}>
			<div key={run.id} className={styles.header}>
				<img src={run.event.logo.url} title={run.event.name} />
				<div className={styles.runInfo}>
					<span>
						<b>{run.game}</b> - {run.category}
					</span>
					<span>{run.finalTime}</span>
				</div>
			</div>
			{run.youtubeVOD ? (
				<YouTubeVideoEmbed videoID={run.youtubeVOD.split('=')[1]} />
			) : (
				<p>YouTube VOD to be uploaded soon!</p>
			)}
			{run.twitchVOD && (
				<a href={run.twitchVOD} target="_blank">
					Twitch VOD
				</a>
			)}
		</div>
	);
};

export default RunCompleted;
