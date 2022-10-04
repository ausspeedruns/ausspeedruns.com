import styles from './EventLive.module.scss';
import Image from 'next/image';
import useInterval from '../useInterval';
import { gql, useQuery } from 'urql';
import { format } from 'date-fns';

import TwitchChatEmbed from '../TwitchChatEmbed/TwitchChatEmbed';
import TwitchVideoEmbed from '../TwitchVideoEmbed/TwitchVideoEmbed';

import ASM2022Logo from '../../styles/img/PAX2022 Logo White.png';
import { useEffect, useState } from 'react';
import { Incentive } from '../Incentives/Incentive';
import Button from '../Button/Button';

import GameOnCancer from '../../styles/img/sponsors/GameOnCancer/GoCCCWhite.svg';
import Link from 'next/link';

const aspectRatio = ASM2022Logo.height / ASM2022Logo.width;
const gocAspectRatio = GameOnCancer.height / GameOnCancer.width;

const EVENT_QUERY = gql`
	query ($event: String!) {
		event(where: { shortname: $event }) {
			runs(orderBy: { scheduledTime: asc }) {
				game
				runners {
					username
				}
				category
				scheduledTime
			}
			donationIncentives(take: 1, where: { active: { equals: true } }) {
				title
				type
				run {
					id
					game
					category
					scheduledTime
				}
				data
			}
		}
	}
`;

interface EventProps {
	event: string;
}

export const EventLive = (props: EventProps) => {
	const [currentTime, setCurrentTime] = useState(new Date());
	const [eventQuery, eventRequery] = useQuery({
		query: EVENT_QUERY,
		variables: { event: props.event },
	});

	useInterval(() => {
		setCurrentTime(new Date());
	}, 10 * 1000);

	const incentiveData = {
		title: eventQuery.data?.event.donationIncentives?.[0]?.title ?? '',
		run: eventQuery.data?.event.donationIncentives?.[0]?.run ?? '',
		active: true,
		notes: eventQuery.data?.event.donationIncentives?.[0]?.notes ?? '',
		type: eventQuery.data?.event.donationIncentives?.[0]?.type ?? '',
		...eventQuery.data?.event.donationIncentives?.[0]?.data,
	};

	let nextRunIndex = -1;
	for (let index = 0; index < eventQuery.data?.event.runs.length; index++) {
		const run = eventQuery.data.event.runs[index];
		if (new Date(run.scheduledTime).getTime() > currentTime.getTime()) {
			// Next run
			nextRunIndex = index;
			break;
		}
	}

	console.log(eventQuery.data);

	const currentRunIndex = nextRunIndex - 1;

	return (
		<div className={styles.eventLive}>
			<div className={styles.logo}>
				<Link href="/ASM2022" passHref>
					<Image src={ASM2022Logo} width={600} height={aspectRatio * 600} alt="ASM2022 Logo" />
				</Link>
			</div>
			<div className={styles.eventInfo}>
				<h2>October 7 - 9 | Melbourne</h2>
				<div className={styles.link}>
					<Button actionText="Donate!" link="/donate" colorScheme="primary" />
				</div>
				<Image src={GameOnCancer} width={200} height={gocAspectRatio * 200} alt="Game on Cancer Logo" />
			</div>

			<div className={styles.onDeck}>
				<div className={styles.columnLeft}>
					<h4>Game</h4>
					<h3>{eventQuery.data?.event.runs?.[currentRunIndex]?.game ?? 'Loading'}</h3>
				</div>
				<div className={styles.columnMiddle}>
					<h4>Category</h4>
					<h3>{eventQuery.data?.event.runs?.[currentRunIndex]?.category ?? 'Loading'}</h3>
				</div>
				<div className={styles.columnRight}>
					<h4>Runners</h4>
					<h3>
						{eventQuery.data?.event.runs?.[currentRunIndex]?.runners.map((runner) => runner.username).join(', ') ??
							'Loading'}
					</h3>
				</div>
			</div>
			<div className={styles.twitch}>
				<div className={styles.twitchVideo}>
					{typeof window !== 'undefined' && (
						<TwitchVideoEmbed muted={false} channel="ausspeedruns" parent={window.location.hostname} />
					)}
				</div>
				<div className={styles.twitchChat}>
					{typeof window !== 'undefined' && (
						<TwitchChatEmbed darkMode alwaysShow channel="ausspeedruns" parent={window.location.hostname} />
					)}
				</div>
			</div>

			{eventQuery.data?.event.donationIncentives.length > 0 && (
				<section className={styles.incentive}>
					<div className={styles.liveContent}>
						<h2>Donation Challenge</h2>
						<h3>Make a donation and write that you want to put the money towards this or another challenge</h3>
						<div className={styles.divider} />
						{incentiveData.title !== '' ? <Incentive incentive={incentiveData} /> : <h4>Loading</h4>}
						<div className={styles.link}>
							<Button
								actionText="Check out more challenges!"
								link="/ASAP2022/challenges"
								colorScheme="secondary inverted"
							/>
						</div>
					</div>
				</section>
			)}

			{nextRunIndex != -1 && (
				<section className={styles.upcoming}>
					<div className={styles.liveContent}>
						<h2>Upcoming Run</h2>
						<div className={styles.info}>
							<span className={styles.subtitle}>Time</span>
							<span>
								{eventQuery.data?.event.runs?.[nextRunIndex]?.scheduledTime
									? format(new Date(eventQuery.data?.event.runs[nextRunIndex]?.scheduledTime), 'H:mm a')
									: 'Loading'}
							</span>
							<span className={styles.subtitle}>Game</span>
							<span>{eventQuery.data?.event.runs?.[nextRunIndex]?.game ?? 'Loading'}</span>
							<span className={styles.subtitle}>Category</span>
							<span>{eventQuery.data?.event.runs?.[nextRunIndex]?.category ?? 'Loading'}</span>
							<span className={styles.subtitle}>
								{eventQuery.data?.event.runs?.[nextRunIndex]?.runners.length > nextRunIndex ? 'Runners' : 'Runner'}
							</span>
							<span>
								{eventQuery.data?.event.runs?.[nextRunIndex]?.runners.map((runner) => runner.username).join(', ') ??
									'Loading'}
							</span>
						</div>
						<div className={styles.link}>
							<Button actionText="Check out the schedule!" link="/schedule" colorScheme="secondary inverted" />
						</div>
					</div>
				</section>
			)}
		</div>
	);
};
