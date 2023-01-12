import React from 'react';

import AusSpeedrunsLogo from '../styles/img/Ausspeedruns-logo-white.png';

type DiscordEmbedProps = {
	title: string;
	description?: string;
	imageSrc?: string;
	pageUrl?: string;
};

const DiscordEmbed = (props: DiscordEmbedProps) => {
	return (
		<>
			<meta content={props.title} property="og:title" />
			<meta content={props.description} property="og:description" />
			<meta content={props.imageSrc ?? AusSpeedrunsLogo.src} property="og:image" />
			{props.pageUrl && <meta content={`https://ausspeedruns.com${props.pageUrl}`} property="og:url" />}
			<meta content="#CC7722" data-react-helmet="true" property="theme-color" />
		</>
	);
};

export default DiscordEmbed;
