import styles from './EventLive.module.scss';
import Image from 'next/image';
import useInterval from '../useInterval';
import { gql, useQuery } from 'urql';
import { format } from 'date-fns';

import TwitchChatEmbed from '../TwitchChatEmbed/TwitchChatEmbed';
import TwitchVideoEmbed from '../TwitchVideoEmbed/TwitchVideoEmbed';

import ASM2022Logo from '../../styles/img/ASM2022-Logo.svg';
import { useEffect, useState } from 'react';
import { Incentive } from '../Incentives/Incentive';
import Button from '../Button/Button';

const aspectRatio = ASM2022Logo.height / ASM2022Logo.width;

const EVENT_QUERY = gql`
	query ($event: String!, $currentTime: DateTime!) {
		event(where: { shortname: $event }) {
			runs(where: { scheduledTime: { gte: $currentTime } }, orderBy: { scheduledTime: asc }, take: 2) {
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
		variables: { event: props.event, currentTime: currentTime.toISOString() },
	});

	useInterval(() => {
		setCurrentTime(new Date());
	}, 10 * 1000);

	const incentiveData = {
		title: eventQuery.data?.event.donationIncentives?.[0].title ?? '',
		run: eventQuery.data?.event.donationIncentives?.[0].run ?? '',
		active: eventQuery.data?.event.donationIncentives?.[0].active ?? false,
		notes: eventQuery.data?.event.donationIncentives?.[0].notes ?? '',
		type: eventQuery.data?.event.donationIncentives?.[0].type ?? '',
		...eventQuery.data?.event.donationIncentives?.[0].data,
	};

	return (
		<div className={styles.eventLive}>
			<div className={styles.logo}>
				<Image src={ASM2022Logo} width={600} height={aspectRatio * 600} />
			</div>
			<div className={styles.eventInfo}>
				<h2>July 13 - 17 | Adelaide</h2>
				<div className={styles.link}>
					<Button actionText="Donate!" link="/donate" colorScheme="primary" />
				</div>
			</div>

			<div className={styles.onDeck}>
				<div className={styles.columnLeft}>
					<h4>Game</h4>
					<h3>{eventQuery.data?.event.runs[0].game ?? 'Loading'}</h3>
				</div>
				<div className={styles.columnMiddle}>
					<h4>Category</h4>
					<h3>{eventQuery.data?.event.runs[0].category ?? 'Loading'}</h3>
				</div>
				<div className={styles.columnRight}>
					<h4>Runners</h4>
					<h3>{eventQuery.data?.event.runs[0].runners.map((runner) => runner.username).join(', ') ?? 'Loading'}</h3>
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

			<div className={styles.incentive}>
				<div className={styles.edgeImageStart} />
				<div className={styles.liveContent}>
					<h2>Donation Challenge</h2>
					<h3>Make a donation and write that you want to put the money towards this or another challenge</h3>
					<div className={styles.divider} />
					{incentiveData.title !== '' ? <Incentive incentive={incentiveData} /> : <h4>Loading</h4>}
					<div className={styles.link}>
						<Button
							actionText="Check out more challenges!"
							link="/ASM2022/challenges"
							colorScheme="secondary inverted"
						/>
					</div>
				</div>
				<div className={styles.edgeImageEnd} />
			</div>

			<div className={styles.upcoming}>
				<div className={styles.edgeImageStart} />
				<div className={styles.liveContent}>
					<h2>Upcoming Run</h2>
					<div className={styles.info}>
						<span className={styles.subtitle}>Time</span>
						<span>
							{eventQuery.data?.event.runs[1].scheduledTime
								? format(new Date(eventQuery.data?.event.runs[1].scheduledTime), 'H:mm a')
								: 'Loading'}
						</span>
						<span className={styles.subtitle}>Game</span>
						<span>{eventQuery.data?.event.runs[1].game ?? 'Loading'}</span>
						<span className={styles.subtitle}>Category</span>
						<span>{eventQuery.data?.event.runs[1].category ?? 'Loading'}</span>
						<span className={styles.subtitle}>{eventQuery.data?.event.runs[1].runners.length > 1 ? 'Runners' : 'Runner'}</span>
						<span>
							{eventQuery.data?.event.runs[1].runners.map((runner) => runner.username).join(', ') ?? 'Loading'}
						</span>
					</div>
					<div className={styles.link}>
						<Button actionText="Check out the schedule!" link="/ASM2022/schedule" colorScheme="secondary inverted" />
					</div>
				</div>
				<div className={styles.edgeImageEnd} />
			</div>
		</div>
	);
};
