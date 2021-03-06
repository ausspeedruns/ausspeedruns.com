import React from 'react';
import Image from 'next/image';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

import styles from './LastEventBlock.module.scss';
import { AusSpeedrunsEvent } from '../../types/types';

import Button from '../Button/Button';

type LastEventBlockProps = {
	event: AusSpeedrunsEvent;
};

const Heroblock = ({ event }: LastEventBlockProps) => {
	return (
		<div
			className={styles.lasteventblock}
			style={{ backgroundImage: `url(${require(`../../styles/img/${event.heroImage}`).default.src}` }}
		>
			<div className={`${styles.content} content`}>
				<div className={styles.ctaBlock}>
					<h1>{event.preferredName}</h1>
					<h2>
						{event.preferredName} raised a total of ${event.total}
					</h2>
					<br />
					<p>
						Australian Speedrunners came together to raise money for Cure Cancer Australia at {event.preferredName}!
					</p>
					<p>Replays of the event are live on our YouTube!</p>
					<Button
						actionText={event.preferredName}
						link="//youtube.com/ausspeedruns"
						iconRight={faChevronRight}
						colorScheme={'secondary'}
						target={'_blank'}
					/>
				</div>
				<div className={styles.logoBlock}>
					<Image src={require(`../../styles/img/${event.logo}`).default} alt="Event Logo" />
					<span className={styles.total}>${event.total}</span>
				</div>
			</div>
		</div>
	);
};

export default Heroblock;
