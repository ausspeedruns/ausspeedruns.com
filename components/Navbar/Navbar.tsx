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
import { faBars, faCalendarAlt, faTimes, faUsers, faChevronRight, faCoins, faBook } from '@fortawesome/free-solid-svg-icons';
import { globals } from '../../pages/globals';
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
					<a href="/">
						<span className={styles.logo}></span>
						<h1>AusSpeedruns</h1>
					</a>
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
							<a href="/event/ASM2022">
								<span className={styles.text}>ASM2022</span>
							</a>
						</li>
						<li>
							<a href="/blog">
								{isMobile ? <FontAwesomeIcon icon={faBook} /> : ''}
								<span className={styles.text}>Blog</span>
							</a>
						</li>
						<li>
							<a href="/#participate">
								{isMobile ? <FontAwesomeIcon icon={faUsers} /> : ''}
								<span className={styles.text}>Get Involved</span>
							</a>
						</li>
						<li className="social">
							<a href={globals.socialLinks.twitch}>
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
							<a href={globals.socialLinks.twitter}>
								<FontAwesomeIcon icon={faTwitter} />
								<span className={`${styles.text} ${isMobile ? '' : 'sr-only'}`}>Follow us on Twitter</span>
							</a>
						</li>
						<li className="social">
							<a href={globals.socialLinks.youtube}>
								<FontAwesomeIcon icon={faYoutube} />
								<span className={`${styles.text} ${isMobile ? '' : 'sr-only'}`}>
									Subscribe to AusSpeedruns on Youtube
								</span>
							</a>
						</li>
						<li className="social">
							<a href={globals.socialLinks.discord}>
								<FontAwesomeIcon icon={faDiscord} />
								<span className={`${styles.text} ${isMobile ? '' : 'sr-only'}`}>Join us on Discord</span>
							</a>
						</li>
						<li className="social">
							<a href={globals.socialLinks.instagram}>
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
									<a className={styles.signout} onClick={() => auth.signOut()}>Sign out</a>
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
