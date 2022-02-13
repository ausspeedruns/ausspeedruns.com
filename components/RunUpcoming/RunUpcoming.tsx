import React from 'react';
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
			};
		};
	};
};

const RunUpcoming = ({run}: Run) => {
	return (
		<div className={styles.run}>
			<div key={run.id} className={styles.header}>
				<img src={run.event.logo.url} title={run.event.name} />
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
