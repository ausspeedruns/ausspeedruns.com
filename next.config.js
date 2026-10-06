import { withPayload } from "@payloadcms/next/withPayload";

import redirects from "./redirects.js";

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
	? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
	: process.env.__NEXT_PRIVATE_ORIGIN || "http://localhost:3000";

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	images: {
		remotePatterns: [NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
			const url = new URL(item);

			return {
				hostname: url.hostname,
				protocol: url.protocol.replace(":", ""),
			};
		}),
		localPatterns: [
			{
				pathname: "/api/media/**",
			},
		],
	},
	turbopack: {
		rules: {
			"*.svg": [
				{
					condition: {
						all: [{ not: "foreign" }, { query: /url/ }],
					},
					type: "asset",
				},
				{
					condition: {
						all: [{ not: "foreign" }, { not: { query: /url/ } }],
					},
					loaders: ["@svgr/webpack"],
					as: "*.js",
				},
			],
		},
	},
	reactStrictMode: true,
	redirects,
	experimental: {
		optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
	},
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
