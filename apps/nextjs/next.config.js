const withNx = require("@nx/next/plugins/with-nx");
const path = require("path");
require("dotenv").config();

const currentEventData = {
	id: "ASAP2024",
	donateLink: "https://donate.tiltify.com/74b40ff7-f234-4bce-8c35-c1ae5862f5c9/details",
}

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
	{
		name: "tiktok",
		link: "https://tiktok.com/@ausspeedruns",
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
				destination: "https://keystone.ausspeedruns.com/api/graphql",
				// destination: "http://localhost:8000/api/graphql",
				// destination:
				// 	process.env.NODE_ENV === "production"
				// 		? "https://keystone.ausspeedruns.com/api/graphql"
				// 		: "http://localhost:8000/api/graphql",
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: "http",
				hostname: "localhost",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "http",
				hostname: "127.0.0.1",
				port: "9999",
				pathname: "/devstoreaccount1/keystone-uploads/**",
			},
			{
				protocol: "https",
				hostname: "ausspeedruns.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "beta.ausspeedruns.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "ausrunsstoragebeta.blob.core.windows.net",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "ausrunsstorage.blob.core.windows.net",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "ausspeedruns.sharepoint.com",
				port: "",
				pathname: "/**",
			},
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
			{
				source: "/schedule",
				destination: `/${currentEventData}/schedule`,
				permanent: false,
			},
			{
				source: "/merch",
				destination: "http://ausspeedruns.theprintbar.com/",
				permanent: true,
			},
			{
				source: "/donate",
				destination: currentEventData.donateLink,
				permanent: false,
			},
			{
				source: "/incentives",
				destination: `/${currentEventData.id}/incentives`,
				permanent: false,
			},
		];
	},
	webpack(config, options) {
		config.module.rules.push({
			test: /\.(glb|gltf)$/,
			use: {
				loader: "file-loader",
			},
		});

		return config;
	},
};

module.exports = withNx(nextConfig);
