import React from 'react';
import Image from 'next/image';
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
				width: number;
				height: number;
			};
		};
	};
};

const LOGO_HEIGHT = 70;

const RunCompleted = ({ run }: Run) => {
	if (!run.event) return <></>;
	const aspectRatio = run.event.logo.width / run.event.logo.height;

	return (
		<div className={styles.run}>
			<div key={run.id} className={styles.header}>
				<div className={styles.logo}>
					<Image
						src={run.event.logo.url}
						title={run.event.name}
						width={LOGO_HEIGHT * aspectRatio}
						height={LOGO_HEIGHT}
						alt={`${run.event.name} logo`}
					/>
				</div>
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
				<a href={run.twitchVOD} target="_blank" rel="noreferrer">
					Twitch VOD
				</a>
			)}
		</div>
	);
};

export default RunCompleted;
