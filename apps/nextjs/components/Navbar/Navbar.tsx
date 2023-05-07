import React, { useEffect, useState } from 'react';
import styles from './Navbar.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faTwitch,
	faTwitter,
	faDiscord,
	faYoutube,
	faInstagram,
	faTiktok,
	// faFacebook,
} from '@fortawesome/free-brands-svg-icons';
import {
	faBars,
	faTimes,
	faCalendar,
} from '@fortawesome/free-solid-svg-icons';
import { globals } from '../../globals';
import Button from '../Button/Button';
import { useAuth } from '../auth';
import Link from 'next/link';

import { useMediaQuery } from '@mui/material';

const asrAusSpeedrunsLogo = {
	prefix: 'asr',
	iconName: 'ausspeedruns-logo',
	icon: [
		163,
		146,
		[],
		null,
		'M114.007 116.716C101.155 106.968 83.7594 93.7742 29.8674 130.619C0.796637 109.645 -6.23907 73.455 5.48198 54.0406C14.2493 49.3395 21.4874 41.2418 28.7426 33.1248C42.5865 17.6368 56.4929 2.07883 81.2052 9.91435C67.0706 30.7493 113.525 52.6958 113.525 0.536621C122.376 16.7961 134.169 27.307 143.92 35.9986C153.64 44.6621 161.332 51.518 162.062 60.4578C164.256 87.3207 155.819 111.347 134.77 121.651C126.105 125.892 120.666 121.767 114.007 116.716ZM125.337 132.415C127.847 132.761 132.871 133.453 138.701 129.752C145.161 125.651 140.224 143.324 130.389 145.205C126.378 145.972 120.564 131.93 124.491 132.309C124.729 132.331 125.012 132.37 125.337 132.415L125.337 132.415ZM134.193 53.7647C134.193 60.026 129.118 65.1018 122.856 65.1018C116.595 65.1018 111.519 60.026 111.519 53.7647C111.519 47.5034 116.595 42.4276 122.856 42.4276C129.118 42.4276 134.193 47.5034 134.193 53.7647ZM114.942 73.0163C114.942 79.2776 109.866 84.3534 103.605 84.3534C97.3433 84.3534 92.2675 79.2776 92.2675 73.0163C92.2675 66.7551 97.3433 61.6793 103.605 61.6793C109.866 61.6793 114.942 66.7551 114.942 73.0163ZM122.856 103.605C129.118 103.605 134.193 98.5293 134.193 92.268C134.193 86.0067 129.118 80.9309 122.856 80.9309C116.595 80.9309 111.519 86.0067 111.519 92.268C111.519 98.5293 116.595 103.605 122.856 103.605ZM153.445 73.0163C153.445 79.2776 148.369 84.3534 142.108 84.3534C135.847 84.3534 130.771 79.2776 130.771 73.0163C130.771 66.7551 135.847 61.6793 142.108 61.6793C148.369 61.6793 153.445 66.7551 153.445 73.0163ZM36.2239 62.963H16.9722V82.6424H36.2239L36.2239 101.894H55.4756V82.6425L74.7272 82.6424V62.963L55.4756 62.9629V43.7113H36.2239L36.2239 62.963Z',
	],
};
type NavbarProps = {
	events: {
		shortname: string;
		endDate?: string;
		published: boolean;
		scheduleReleased: boolean;
	}[];
};

// Define general type for useWindowSize hook, which includes width and height
interface Size {
	width: number | undefined;
	height: number | undefined;
}

const Navbar = ({ events = [] }: NavbarProps) => {
	const auth = useAuth();
	const [isOpen, setIsOpen] = useState<Boolean>(false);
	const mobileWidth = useMediaQuery('(max-width: 992px)');

	const upcomingOrLiveEvents = events
		.filter((event) => (event.endDate ? new Date(event.endDate) > new Date() : true))
		.filter((event) => event.published);

	const schedules = upcomingOrLiveEvents.filter(event => event.scheduleReleased);

	return (
		<header className={`App-header ${styles.navbar}`}>
			<div className={`${styles.content} content`}>
				<div className={styles.title}>
					<Link href="/" passHref>
						<svg
							width="39"
							height="32"
							viewBox="0 0 39 32"
							fill="white"
							xmlns="http://www.w3.org/2000/svg"
							className={styles.logo}
						>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M25.2661 25.6526C22.4959 23.5515 18.7462 20.7075 7.12966 28.6496C0.86341 24.1284 -0.653151 16.3277 1.87334 12.1429C3.76316 11.1295 5.32334 9.38406 6.88723 7.63444C9.8713 4.29597 12.8688 0.942412 18.1956 2.63137C15.1489 7.12238 25.1622 11.853 25.1622 0.609985C27.0701 4.11476 29.612 6.38039 31.714 8.25388C33.8091 10.1213 35.4671 11.5991 35.6245 13.5261C36.0973 19.3165 34.2788 24.4954 29.7415 26.7164C27.8739 27.6306 26.7015 26.7413 25.2661 25.6526ZM27.7084 29.0367C28.2493 29.1112 29.3323 29.2605 30.5889 28.4627C31.9814 27.5787 30.9172 31.3881 28.7974 31.7935C27.9328 31.9588 26.6796 28.9321 27.5261 29.0137C27.5772 29.0186 27.6382 29.027 27.7084 29.0367L27.7084 29.0367ZM29.6173 12.0834C29.6173 13.433 28.5232 14.5271 27.1736 14.5271C25.824 14.5271 24.7299 13.433 24.7299 12.0834C24.7299 10.7338 25.824 9.63968 27.1736 9.63968C28.5232 9.63968 29.6173 10.7338 29.6173 12.0834ZM25.4676 16.2331C25.4676 17.5828 24.3735 18.6769 23.0239 18.6769C21.6742 18.6769 20.5801 17.5828 20.5801 16.2331C20.5801 14.8835 21.6742 13.7894 23.0239 13.7894C24.3735 13.7894 25.4676 14.8835 25.4676 16.2331ZM27.1736 22.8266C28.5232 22.8266 29.6173 21.7325 29.6173 20.3829C29.6173 19.0332 28.5232 17.9392 27.1736 17.9392C25.824 17.9392 24.7299 19.0332 24.7299 20.3829C24.7299 21.7325 25.824 22.8266 27.1736 22.8266ZM33.7671 16.2331C33.7671 17.5828 32.673 18.6769 31.3233 18.6769C29.9737 18.6769 28.8796 17.5828 28.8796 16.2331C28.8796 14.8835 29.9737 13.7894 31.3233 13.7894C32.673 13.7894 33.7671 14.8835 33.7671 16.2331ZM8.49982 14.0661H4.35009V18.308H8.49982L8.49982 22.4578H12.6496V18.3081L16.7993 18.308V14.0661L12.6496 14.0661V9.91635H8.49982L8.49982 14.0661Z"
							/>
						</svg>{' '}
						AusSpeedruns
					</Link>
				</div>
				<button className={styles.menuToggle} onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen.valueOf()}>
					{!isOpen ? <FontAwesomeIcon icon={faBars} /> : <FontAwesomeIcon icon={faTimes} />}
					<span>Menu</span>
				</button>
				{mobileWidth ? <div className={styles.break}></div> : ''}

				<nav className={`${styles.mainmenu} ${isOpen ? styles.menuopen : styles.menuclosed}`} aria-label="Main menu">
					<ul>
						{schedules.map((event) => {
							return (
								<li key={event.shortname}>
									{/* @ts-ignore */}
									{mobileWidth ? <FontAwesomeIcon width={20} className={styles.icon} icon={faCalendar} /> : ''}
									<Link href={`/${event.shortname}/schedule`} passHref className={styles.text}>
										{schedules.length > 1 && `${event.shortname} `}Schedule
									</Link>
								</li>
							);
						})}
						{upcomingOrLiveEvents.map((event) => {
							return (
								<li key={event.shortname}>
									{/* @ts-ignore */}
									{mobileWidth ? <FontAwesomeIcon width={20} className={styles.icon} icon={asrAusSpeedrunsLogo} /> : ''}
									<Link href={`/${event.shortname}`} passHref className={styles.text}>
										{event.shortname}
									</Link>
								</li>
							);
						})}
						<li>
							{/* @ts-ignore */}
							{mobileWidth ? <FontAwesomeIcon width={20} className={styles.icon} icon={asrAusSpeedrunsLogo} /> : ''}
							<Link href={`/about`} passHref className={styles.text}>
								About Us
							</Link>
						</li>
						<li>
							{/* @ts-ignore */}
							{mobileWidth ? <FontAwesomeIcon width={20} className={styles.icon} icon={asrAusSpeedrunsLogo} /> : ''}
							<Link href={`/events`} passHref className={styles.text}>
								Past Events
							</Link>
						</li>
						<li>
							<a href={globals.socialLinks.twitch} target="_blank" rel="noreferrer">
								<FontAwesomeIcon width={20} icon={faTwitch} />
								<span className={`${styles.text} ${mobileWidth ? '' : 'sr-only'}`}>Twitch</span>
							</a>
						</li>
						<li>
							<a href={globals.socialLinks.twitter} target="_blank" rel="noreferrer">
								<FontAwesomeIcon width={20} icon={faTwitter} />
								<span className={`${styles.text} ${mobileWidth ? '' : 'sr-only'}`}>Twitter</span>
							</a>
						</li>
						<li>
							<a href={globals.socialLinks.youtube} target="_blank" rel="noreferrer">
								<FontAwesomeIcon width={20} icon={faYoutube} />
								<span className={`${styles.text} ${mobileWidth ? '' : 'sr-only'}`}>YouTube</span>
							</a>
						</li>
						<li>
							<a href={globals.socialLinks.discord} target="_blank" rel="noreferrer">
								<FontAwesomeIcon width={20} icon={faDiscord} />
								<span className={`${styles.text} ${mobileWidth ? '' : 'sr-only'}`}>Discord</span>
							</a>
						</li>
						<li>
							<a href={globals.socialLinks.instagram} target="_blank" rel="noreferrer">
								<FontAwesomeIcon width={20} icon={faInstagram} />
								<span className={`${styles.text} ${mobileWidth ? '' : 'sr-only'}`}>Instagram</span>
							</a>
						</li>
						<li>
							<a href={globals.socialLinks.tiktok} target="_blank" rel="noreferrer">
								<FontAwesomeIcon width={20} icon={faTiktok} />
								<span className={`${styles.text} ${mobileWidth ? '' : 'sr-only'}`}>Tiktok</span>
							</a>
						</li>
						<li className={styles.auth}>
							{auth.ready && auth.sessionData ? (
								<>
									<Button
										actionText={auth.sessionData.username}
										link={`/user/${auth.sessionData.username}`}
										colorScheme={'secondary inverted'}
									/>
									<a
										className={styles.signout}
										onClick={() => {
											auth.signOut();
											if (top) top.location.href = '/';
										}}
									>
										Sign out
									</a>
								</>
							) : (
								<span className={styles.join}>
									<Link href="/signin">Sign In</Link> | <Link href="/signup">Join</Link>
								</span>
							)}
						</li>
					</ul>
				</nav>
			</div>
		</header>
	);
};

export default Navbar;
