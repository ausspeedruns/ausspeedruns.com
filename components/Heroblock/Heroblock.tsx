import React from 'react';
import styles from './Heroblock.module.scss';
import Image from 'next/image';
import { faCalendar, faChevronRight, faTicket } from '@fortawesome/free-solid-svg-icons';
import Countdown, { zeroPad, CountdownRenderProps } from 'react-countdown';
import Button from '../Button/Button';
import TwitchVideoEmbed from '../TwitchVideoEmbed/TwitchVideoEmbed';
import { globals } from '../../globals';
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

		if (completed) return <></>;
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
					<h1>{event.preferredName}</h1>
					<h2>{event.dates}</h2>
					<h3 className="countdown monospaced">
						<Countdown date={Date.UTC(2022, 6, 13, 0, 30, 0, 0)} renderer={countdownRender} zeroPadTime={2} />
					</h3>
					<br />
					{/* <h2>ASM2021 raised a total of ${ASM_2021_TOTAL_RAISED}</h2> */}
					<p>Australian Speedrunners come together to raise money for Cure Cancer Australia at ASM2022!</p>
					<p>Tickets and the schedule are now available!</p>
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
						<>
							<Button actionText="ASM2022" link={'/ASM2022'} iconRight={faChevronRight} colorScheme={'secondary'} />
							<Button
								actionText="Purchase Tickets"
								link={'/ASM2022/tickets'}
								iconRight={faTicket}
								colorScheme={'secondary'}
							/>
							<Button actionText="Schedule" link={'/schedule'} iconRight={faCalendar} colorScheme={'secondary'} />
						</>
					)}
				</div>
				<div className={styles.logoBlock}>
					<Image src={require(`../../styles/img/${event.logo}`).default} alt="Event Logo" />
					<Image src={require(`../../styles/img/GoCCCWhite.svg`).default} alt="Game on Cancer Logo" />
				</div>
			</div>
		</div>
	);
};

export default Heroblock;
