const withNx = require("@nrwl/next/plugins/with-nx");
const path = require("path");
require("dotenv").config();

const socialMedias = [
	{
		name: "twitch",
		link: "https://www.twitch.tv/ausspeedruns",
	},
	{
		name: "instagram",
		link: "https://www.instagram.com/ausspeedruns",
	},
	{
		name: "discord",
		link: "https://discord.com/invite/2xFkJta",
	},
	{
		name: "twitter",
		link: "https://twitter.com/AusSpeedruns",
	},
	{
		name: "youtube",
		link: "https://www.youtube.com/ausspeedruns",
	},
];

const nextConfig = {
	reactStrictMode: true,
	sassOptions: {
		includePaths: [path.join(__dirname, "styles")],
	},
	async rewrites() {
		return [
			{
				source: "/api/graphql",
				destination:
					process.env.NODE_ENV === "production"
						? "https://keystone.ausspeedruns.com/api/graphql"
						: "http://localhost:8000/api/graphql",
			},
		];
	},
	images: {
		domains: [
			"localhost",
			"127.0.0.1",
			"ausspeedruns.com",
			"beta.ausspeedruns.com",
			"ausrunsstoragebeta.blob.core.windows.net",
			"ausrunsstorage.blob.core.windows.net",
			"ausspeedruns.sharepoint.com",
		],
	},
	nx: {
		svgr: false,
	},
	async redirects() {
		return [
			...socialMedias.map((social) => {
				return {
					source: `/${social.name}`,
					destination: social.link,
					permanent: true,
					basePath: false,
				};
			}),
			{
				source: "/schedule/:slug",
				destination: "/:slug/schedule",
				permanent: true,
			},
		];
	},
};

module.exports = withNx(nextConfig);
