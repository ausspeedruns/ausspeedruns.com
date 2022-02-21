import React from 'react';

import AusSpeedrunsLogo from '../styles/img/FullLogo-White.png';

type DiscordEmbedProps = {
	title: string;
	description?: string;
	imageSrc?: string;
};

const DiscordEmbed = (props: DiscordEmbedProps) => {
	return (
		<>
			<meta content={props.title} property="og:title" />
			<meta content={props.description} property="og:description" />
			<meta content={props.imageSrc ?? AusSpeedrunsLogo.src} property="og:image" />
			<meta content="#CC7722" data-react-helmet="true" property="theme-color" />
		</>
	);
};

export default DiscordEmbed;
