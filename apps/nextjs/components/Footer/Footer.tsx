import {
	faTwitch,
	faTwitter,
	faYoutube,
	faDiscord,
	faInstagram,
	// faFacebook,
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './Footer.module.scss';
import { globals } from '../../globals';
import Link from 'next/link';

interface FooterProps {
	className?: string;
	hideAcknowledgement?: boolean;
	style?: React.CSSProperties;
}

const Footer = (props: FooterProps) => {
	return (
		<div className={props.className} style={props.style}>
			{!props.hideAcknowledgement && (
				<div className={styles.acknowledgement}>
					<div className="content">
						<p>
							In the spirit of reconciliation, AusSpeedruns acknowledges the Traditional Custodians of country
							throughout Australia and their connections to land, sea and community. We pay our respect to their elders
							past and present and extend that respect to all Aboriginal and Torres Strait Islander peoples today.
						</p>
					</div>
				</div>
			)}
			<div className={styles.footer}>
				<div className={`content ${styles.content}`}>
					<ul>
						<li className="social">
							<a href={globals.socialLinks.twitch} target="_blank" rel="noreferrer">
								<FontAwesomeIcon icon={faTwitch} />
								<span className={styles.text}>Follow us on Twitch</span>
							</a>
						</li>
						{/* <li className="social">
              <a href={globals.socialLinks.facebook}>
                <FontAwesomeIcon icon={faFacebook} />
                <span className={styles.text}>Like us on Facebook</span>
              </a>
            </li> */}
						<li className="social">
							<a href={globals.socialLinks.twitter} target="_blank" rel="noreferrer">
								<FontAwesomeIcon icon={faTwitter} />
								<span className={styles.text}>Follow us on Twitter</span>
							</a>
						</li>
						<li className="social">
							<a href={globals.socialLinks.youtube} target="_blank" rel="noreferrer">
								<FontAwesomeIcon icon={faYoutube} />
								<span className={styles.text}>Subscribe on Youtube</span>
							</a>
						</li>
						<li className="social">
							<a href={globals.socialLinks.discord} target="_blank" rel="noreferrer">
								<FontAwesomeIcon icon={faDiscord} />
								<span className={styles.text}>Join us on Discord</span>
							</a>
						</li>
						<li className="social">
							<a href={globals.socialLinks.instagram} target="_blank" rel="noreferrer">
								<FontAwesomeIcon icon={faInstagram} />
								<span className={styles.text}>Follow us on Instagram</span>
							</a>
						</li>
					</ul>
					<div className={styles.miscLinks}>
						<Link href="/policies">Policies</Link>
						{/* <Link href="/prize-terms">Prize Terms</Link> */}
						<Link href="/press-kit">Press Kit</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Footer;
