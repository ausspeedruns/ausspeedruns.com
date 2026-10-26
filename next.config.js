import { withPayload } from "@payloadcms/next/withPayload";

import redirects from "./redirects.js";

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

// Media is served directly from Azure Blob Storage (or a CDN in front of it) when configured
const MEDIA_BASE_URL = process.env.AZURE_STORAGE_ACCOUNT_BASEURL;

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	images: {
		remotePatterns: [NEXT_PUBLIC_SERVER_URL, MEDIA_BASE_URL].filter(Boolean).map((item) => {
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
