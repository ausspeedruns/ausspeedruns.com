import AusSpeedrunsLogo from "../styles/img/Ausspeedruns-logo-white.png";

type DiscordEmbedProps = {
	title: string;
	description?: string;
	imageSrc?: string;
	pageUrl?: string;
};

const DiscordEmbed = (props: DiscordEmbedProps) => {
	return (
		<>
			<meta content="AusSpeedruns" property="og:site_name" />
			<meta
				content="#CC7722"
				data-react-helmet="true"
				property="theme-color"
			/>
			<meta content={props.title} property="og:title" />
			<meta content={props.description} property="og:description" />
			<meta
				content={props.imageSrc ?? AusSpeedrunsLogo.src}
				property="og:image"
			/>
			{props.imageSrc && (
				<meta name="twitter:card" content="summary_large_image" />
			)}
			{props.pageUrl && (
				<meta
					content={`https://ausspeedruns.com${props.pageUrl}`}
					property="og:url"
				/>
			)}
		</>
	);
};

export default DiscordEmbed;
