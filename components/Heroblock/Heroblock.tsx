import React from 'react';
import styles from './Heroblock.module.scss';
import Image from "next/image";
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
        <section className={styles.heroblock} style={{backgroundImage: `url(${require(`../../styles/img/${event.heroImage}`).default.src}`}}>
			<div className={`${styles.content} content`}>
				{showVideoBlock && <TwitchVideoEmbed channel="ausspeedruns" parent={window.location.hostname} />}
				<div className={styles.ctaBlock}>
					<h1>{event.preferredName}</h1>
					<h2>{event.dates}</h2>
					<h3 className="countdown monospaced">
						<Countdown date={Date.UTC(2022, 9, 7, 0, 0, 0, 0)} renderer={countdownRender} zeroPadTime={2} />
					</h3>
					<br />
					{/* <h2>ASM2021 raised a total of ${ASM_2021_TOTAL_RAISED}</h2> */}
					<p>We will be at PAX Aus! Schedule has been released.</p>
					<p></p>
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
							<Button actionText={event.preferredName} link={'/ASAP2022'} iconRight={faChevronRight} colorScheme={'secondary'} />
							<Button
								actionText="Purchase Tickets"
								link={event.website}
								iconRight={faTicket}
								colorScheme={'secondary'}
							/>
							{/* <Button actionText="Submit your run!" link={'/submit-game'} iconRight={faChevronRight} colorScheme={'secondary'} /> */}
							<Button actionText="Schedule" link={'/schedule'} iconRight={faCalendar} colorScheme={'secondary'} />
						</>
					)}
				</div>
				<div className={styles.logoBlock}>
					<Image
                        src={require(`../../styles/img/${event.logo}`).default}
                        alt="Event Logo"
                        style={{
                            maxWidth: "100%",
                            height: "auto"
                        }} />
					<Image
                        src={require(`../../styles/img/sponsors/GameOnCancer/GoCCCWhite.svg`).default}
                        alt="Game on Cancer Logo"
                        style={{
                            maxWidth: "100%",
                            height: "auto"
                        }} />
				</div>
			</div>
		</section>
    );
};

export default Heroblock;
