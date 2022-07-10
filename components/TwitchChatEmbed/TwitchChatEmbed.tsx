import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import styles from './TwitchChatEmbed.module.scss';

type TwitchProps = {
	channel: string;
	parent: string;
	alwaysShow?: boolean;
	darkMode?: boolean;
};

const TwitchChatEmbed = ({ channel, parent, alwaysShow, darkMode = false }: TwitchProps) => {
	const [showChat, setShowChat] = useState<boolean>(false);
	return (
		<div className={styles.twitchChat}>
			<div className={styles.content}>
				{!alwaysShow && (
					<button onClick={() => setShowChat(!showChat)} className={styles.toggleChat}>
						<span>{showChat ? 'Hide' : 'Show'} chat </span>
						<FontAwesomeIcon icon={showChat ? faChevronUp : faChevronDown} />
					</button>
				)}
				{(showChat || alwaysShow) && (
					// <div className={styles.twitchChatEmbed}>
					<iframe
						className={styles.chatIframe}
						title="Ausspeedruns twitch chat embed"
						src={`https://www.twitch.tv/embed/${channel}/chat?parent=${parent}${darkMode ? '&darkpopout' : ''}`}
						// height="<height>"
						// width="<width>"
					></iframe>
					// </div>
				)}
			</div>
		</div>
	);
};

export default TwitchChatEmbed;
