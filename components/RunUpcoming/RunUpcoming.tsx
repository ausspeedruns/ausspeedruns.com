import React from 'react';
import Image from 'next/image';
import styles from './RunUpcoming.module.scss';

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

const LOGO_HEIGHT = 50;

const RunUpcoming = ({ run }: Run) => {
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
					<span>
						<b>
							{new Date(run.scheduledTime).toLocaleString('en-AU', {
								day: '2-digit',
								month: 'short',
								hour12: true,
								hour: 'numeric',
								minute: '2-digit',
								weekday: 'long',
							})}
						</b>
					</span>
				</div>
			</div>
		</div>
	);
};

export default RunUpcoming;
