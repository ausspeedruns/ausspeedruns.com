import React from 'react';
import Image from "next/image";
import YouTubeVideoEmbed from '../YouTubeVideoEmbed/YouTubeVideoEmbed';
import styles from './RunCompleted.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';

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

	const aspectRatio = run.event.logo ? run.event.logo.width / run.event.logo.height : 0;

	return (
        <div className={styles.run}>
			<div key={run.id} className={styles.header}>
				{run.event.logo && (
					<div className={styles.logo}>
						<Image
                            src={run.event.logo.url}
                            title={run.event.name}
                            width={LOGO_HEIGHT * aspectRatio}
                            height={LOGO_HEIGHT}
                            alt={`${run.event.name} logo`}
                            style={{
                                maxWidth: "100%",
                                height: "auto"
                            }} />
					</div>
				)}
				<div className={styles.runInfo}>
					<div className={styles.column}>
						<span>
							<b>{run.game}</b> - {run.category}
						</span>
						<span>{run.finalTime}</span>
					</div>

					{run.twitchVOD && (
						<a className={styles.twitch} href={run.twitchVOD} target="_blank" rel="noreferrer">
							<FontAwesomeIcon icon={faTwitch} />
							Twitch VOD
						</a>
					)}
				</div>
			</div>
			{run.youtubeVOD ? (
				<YouTubeVideoEmbed videoID={run.youtubeVOD.split('=')[1]} />
			) : (
				<p>YouTube VOD to be uploaded soon!</p>
			)}
		</div>
    );
};

export default RunCompleted;
