import {
	faTwitch,
	faTwitter,
	faYoutube,
	faDiscord,
	faInstagram,
	faTiktok,
	// faFacebook,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Footer.module.scss";
import { globals } from "../../globals";
import Link from "next/link";

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
							In the spirit of reconciliation, AusSpeedruns acknowledges the Traditional Custodians of
							country throughout Australia and their connections to land, sea and community. We pay our
							respect to their elders past and present and extend that respect to all Aboriginal and
							Torres Strait Islander peoples today.
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
								<span className={styles.text}>Twitch</span>
							</a>
						</li>
						<li className="social">
							<a href={globals.socialLinks.twitter} target="_blank" rel="noreferrer">
								<FontAwesomeIcon icon={faTwitter} />
								<span className={styles.text}>Twitter</span>
							</a>
						</li>
						<li className="social">
							<a href={globals.socialLinks.youtube} target="_blank" rel="noreferrer">
								<FontAwesomeIcon icon={faYoutube} />
								<span className={styles.text}>Youtube</span>
							</a>
						</li>
						<li className="social">
							<a href={globals.socialLinks.discord} target="_blank" rel="noreferrer">
								<FontAwesomeIcon icon={faDiscord} />
								<span className={styles.text}>Discord</span>
							</a>
						</li>
						<li className="social">
							<a href={globals.socialLinks.instagram} target="_blank" rel="noreferrer">
								<FontAwesomeIcon icon={faInstagram} />
								<span className={styles.text}>Instagram</span>
							</a>
						</li>
						<li className="social">
							<a href={globals.socialLinks.tiktok} target="_blank" rel="noreferrer">
								<FontAwesomeIcon icon={faTiktok} />
								<span className={styles.text}>Tiktok</span>
							</a>
						</li>
					</ul>
					<div className={styles.miscLinks}>
						<Link href="/policies">Policies</Link>
						{/* <Link href="/prize-terms">Prize Terms</Link> */}
						<Link href="/press-kit">Press Kit</Link>
						<Link href="https://photos.ausspeedruns.com/" passHref className={styles.text} target="_blank">
							Photos
						</Link>
						<Link href="/contact">Contact</Link>
						<a className={styles.email} href="mailto:ausspeedruns@ausspeedruns.com">
							ausspeedruns@ausspeedruns.com
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Footer;
