import React from 'react';
import styles from './Heroblock.module.scss';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Countdown, { zeroPad, CountdownRenderProps } from 'react-countdown';
import Button from '../Button/Button';
import TwitchVideoEmbed from '../TwitchVideoEmbed/TwitchVideoEmbed';
import { globals } from '../../pages/globals';
import { AusSpeedrunsEvent } from '../../types/types';

type HeroblockProps = {
	event: AusSpeedrunsEvent;
};

const Heroblock = ({ event }: HeroblockProps) => {
	const showVideoBlock = false;
	const countdownRender = ({ days, hours, minutes, seconds, milliseconds, completed }: CountdownRenderProps) => {
		// if (completed || (days <= 1 && hours < 1  && minutes < 20)) {
		//   setShowVideoBlock(true)
		// }

		if (completed) return <span></span>;
		else if (days > 0)
			return (
				<span>
					<span className="sr-only">
						{days} days, {hours} hours, {minutes} minutes and {seconds} seconds remaining
					</span>
					<span aria-hidden>
						{zeroPad(days)}:{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
					</span>
				</span>
			);
		else if (hours > 0)
			return (
				<span>
					<span className="sr-only">
						{hours} hours, {minutes} minutes and {seconds} seconds remaining
					</span>
					<span aria-hidden>
						{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
					</span>
				</span>
			);
		else
			return (
				<span>
					<span className="sr-only">
						{minutes} minutes and {seconds} seconds remaining
					</span>
					<span aria-hidden>
						{zeroPad(minutes)}:{zeroPad(seconds)}
					</span>
				</span>
			);
	};

	return (
		<div className={styles.heroblock}>
			<div className={`${styles.content} content`}>
				{showVideoBlock && <TwitchVideoEmbed channel="ausspeedruns" parent={window.location.hostname} />}
				<div className={styles.ctaBlock}>
					<h1>{event.fullName}</h1>
					<h2>{event.dates}</h2>
					<br />
					{/* <h2>ASM2021 raised a total of ${ASM_2021_TOTAL_RAISED}</h2> */}
					{/* <h3 className="countdown monospaced">
            <Countdown
              date={Date.parse(globals.events.current.date)}
              renderer={countdownRender}
              zeroPadTime={2}
            />
          </h3> */}
					<p>
						Australian Speedrunners come together to raise money for Beyond Blue at ASM2022! More details about the event to come soon.
					</p>
					<p>
						Not finished watching amazing speedruns? Missed a game you wanted to watch? You can find videos of
						individual runs from {globals.events.previous.shortName} and our previous events on our Youtube channel.
					</p>
					{showVideoBlock && (
						<Button
							actionText="Donate"
							link={globals.donateLink}
							iconRight={faChevronRight}
							colorScheme={'secondary'}
              target={'_blank'}
						/>
					)}
					{!showVideoBlock && (
						<Button
							actionText="Watch again"
							link={globals.socialLinks.youtube}
							iconRight={faChevronRight}
							colorScheme={'secondary'}
              target={'_blank'}
						/>
					)}
				</div>
				<div className={styles.logoBlock}>
					<img src={require(`../../styles/img/${event.logo}`).default.src} />
				</div>
			</div>
		</div>
	);
};

export default Heroblock;
