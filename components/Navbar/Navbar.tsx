import React, { useEffect, useState } from 'react';
import styles from './Navbar.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faTwitch,
	faTwitter,
	faDiscord,
	faYoutube,
	faInstagram,
	// faFacebook,
} from '@fortawesome/free-brands-svg-icons';
import {
	faBars,
	faCalendarAlt,
	faTimes,
	faUsers,
	faChevronRight,
	faCoins,
	faBook,
} from '@fortawesome/free-solid-svg-icons';
import { globals } from '../../globals';
import Button from '../Button/Button';
import { useAuth } from '../auth';
import Link from 'next/link';

type NavbarProps = {
	isLive?: boolean;
};

// Define general type for useWindowSize hook, which includes width and height
interface Size {
	width: number | undefined;
	height: number | undefined;
}

const Navbar = ({ isLive }: NavbarProps) => {
	const auth = useAuth();
	const [isOpen, setIsOpen] = useState<Boolean>(false);
	const [isMobile, setIsMobile] = useState<Boolean>(true);
	const windowSize: Size = useWindowSize();

	useEffect(() => {
		if (windowSize.width) setIsMobile(windowSize.width < 768);
	}, [windowSize]);

	return (
		<header className={`App-header ${styles.navbar}`}>
			<div className={`${styles.content} content`}>
				<div className={styles.title}>
					<Link href="/" passHref>
						<a>
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
						</a>
					</Link>
				</div>
				<button className="menu-toggle" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen.valueOf()}>
					{!isOpen ? <FontAwesomeIcon icon={faBars} /> : <FontAwesomeIcon icon={faTimes} />}
					<span className="sr-only">Menu</span>
				</button>
				{isMobile ? <div className={styles.break}></div> : ''}

				<nav className={`${styles.mainmenu} ${isOpen ? styles.menuopen : styles.menuclosed}`} aria-label="Main menu">
					<ul>
						{/* <li>
              <a href={globals.scheduleLink}>
                { isMobile ? (<FontAwesomeIcon icon={faCalendarAlt} />) : '' }
                <span className={styles.text}>Schedule</span>
              </a>
            </li> */}
						{isLive && (
							<li>
								<a href={globals.incentivesLink}>
									{isMobile ? <FontAwesomeIcon icon={faCoins} /> : ''}
									<span className={styles.text}>Incentives</span>
								</a>
							</li>
						)}
						<li>
							<Link href="/ASM2022" passHref>
								<a className={styles.text}>ASM2022</a>
							</Link>
						</li>
						<li>
							{isMobile ? <FontAwesomeIcon icon={faBook} /> : ''}
							<Link href="/blog" passHref>
								<a className={styles.text}>Blog</a>
							</Link>
						</li>
						<li>
							{isMobile ? <FontAwesomeIcon icon={faUsers} /> : ''}
							<Link href="/#participate" passHref>
								<a className={styles.text}>Get Involved</a>
							</Link>
						</li>
						<li className="social">
							<a href={globals.socialLinks.twitch} target="_blank" rel="noreferrer">
								<FontAwesomeIcon icon={faTwitch} />
								<span className={`${styles.text} ${isMobile ? '' : 'sr-only'}`}>Follow us on Twitch</span>
							</a>
						</li>
						{/* <li className="social">
              <a href={globals.socialLinks.facebook}>
                <FontAwesomeIcon icon={faFacebook} />
                <span className={`${styles.text} ${isMobile ? '' : 'sr-only'}`}>Like us on Facebook</span>
              </a>
            </li> */}
						<li className="social">
							<a href={globals.socialLinks.twitter} target="_blank" rel="noreferrer">
								<FontAwesomeIcon icon={faTwitter} />
								<span className={`${styles.text} ${isMobile ? '' : 'sr-only'}`}>Follow us on Twitter</span>
							</a>
						</li>
						<li className="social">
							<a href={globals.socialLinks.youtube} target="_blank" rel="noreferrer">
								<FontAwesomeIcon icon={faYoutube} />
								<span className={`${styles.text} ${isMobile ? '' : 'sr-only'}`}>Subscribe to AusSpeedruns</span>
							</a>
						</li>
						<li className="social">
							<a href={globals.socialLinks.discord} target="_blank" rel="noreferrer">
								<FontAwesomeIcon icon={faDiscord} />
								<span className={`${styles.text} ${isMobile ? '' : 'sr-only'}`}>Join us on Discord</span>
							</a>
						</li>
						<li className="social">
							<a href={globals.socialLinks.instagram} target="_blank" rel="noreferrer">
								<FontAwesomeIcon icon={faInstagram} />
								<span className={`${styles.text} ${isMobile ? '' : 'sr-only'}`}>Follow us on Instagram</span>
							</a>
						</li>
						{isLive && (
							<li className={styles.cta}>
								<Button
									actionText="Donate"
									link={globals.donateLink}
									iconRight={faChevronRight}
									colorScheme={'secondary inverted'}
								/>
							</li>
						)}
						<li>
							{auth.ready && auth.sessionData ? (
								<>
									<Button
										actionText={auth.sessionData.username}
										link={`/user/${auth.sessionData.username}`}
										colorScheme={'orange'}
									/>
									<a
										className={styles.signout}
										onClick={() => {
											auth.signOut();
											top.location.href = '/';
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

// Hook
function useWindowSize(): Size {
	// Initialize state with undefined width/height so server and client renders match
	// Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
	const [windowSize, setWindowSize] = useState<Size>({
		width: undefined,
		height: undefined,
	});
	useEffect(() => {
		// Handler to call on window resize
		function handleResize() {
			// Set window width/height to state
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}
		// Add event listener
		window.addEventListener('resize', handleResize);
		// Call handler right away so state gets updated with initial window size
		handleResize();
		// Remove event listener on cleanup
		return () => window.removeEventListener('resize', handleResize);
	}, []); // Empty array ensures that effect is only run on mount
	return windowSize;
}

export default Navbar;
