import React from "react";
import styles from "../../styles/BasicPage.module.scss";

import Head from "next/head";
import DiscordEmbed from "../../components/DiscordEmbed";

const ContactPage: React.FC = () => {
	return (
		<div>
			<Head>
				<title>Contact - AusSpeedruns</title>
				<DiscordEmbed title="Contact - AusSpeedruns" pageUrl="/contact" />
			</Head>
			<div className={styles.background} />
			<div className={styles.content}>
				<h1>Contact Us</h1>
				<section>
					<h2>Email</h2>
					<a href="mailto:ausspeedruns@ausspeedruns.com">
						ausspeedruns@ausspeedruns.com
					</a>
				</section>
				<section>
					<h2>Twitter / X</h2>
					<a href="https://twitter.com/AusSpeedruns" target="_blank" rel="noopener noreferrer">
						@AusSpeedruns
					</a>
				</section>
				<section>
					<h2>Discord</h2>
					<a href="https://discord.ausspeedruns.com/" target="_blank" rel="noopener noreferrer">
						Link to Server
					</a>
				</section>
				<section>
					<h2>YouTube</h2>
					<a href="https://www.youtube.com/ausspeedruns" target="_blank" rel="noopener noreferrer">
						@AusSpeedruns
					</a>
				</section>
				<section>
					<h2>Instagram</h2>
					<a href="https://www.instagram.com/ausspeedruns/" target="_blank" rel="noopener noreferrer">
						@AusSpeedruns
					</a>
				</section>
				<section>
					<h2>Twitch</h2>
					<a href="http://twitch.tv/ausspeedruns" target="_blank" rel="noopener noreferrer">
						AusSpeedruns
					</a>
				</section>
				<section>
					<h2>Tiktok</h2>
					<a href="http://tiktok.com/@ausspeedruns" target="_blank" rel="noopener noreferrer">
						@AusSpeedruns
					</a>
				</section>
			</div>
		</div>
	);
};

export default ContactPage;
