import { withPayload } from "@payloadcms/next/withPayload";

import redirects from "./redirects.js";

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

// Media is served directly from Azure Blob Storage (or a CDN in front of it) when configured
const MEDIA_BASE_URL = process.env.AZURE_STORAGE_ACCOUNT_BASEURL;

const securityHeaders = [
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{ key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), browsing-topics=()" },
	...(NEXT_PUBLIC_SERVER_URL.startsWith("https://")
		? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }]
		: []),
];

// Public pages stay embeddable for community projects; pages with logins, payments or account actions
// can only be framed by the site itself (e.g. Payload live preview) to prevent clickjacking
const noFramingHeaders = [
	{ key: "X-Frame-Options", value: "SAMEORIGIN" },
	{ key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
];

const noFramingRoutes = [
	"/admin",
	"/account",
	"/login",
	"/signup",
	"/forgot-password",
	"/reset-password",
	"/verify",
	"/cart",
	"/success",
	"/cancel",
	"/submit-game",
	"/volunteer",
].flatMap((route) => [route, `${route}/:path*`]);

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	poweredByHeader: false,
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
	async headers() {
		return [
			{ source: "/:path*", headers: securityHeaders },
			...noFramingRoutes.map((source) => ({ source, headers: noFramingHeaders })),
		];
	},
	experimental: {
		optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
	},
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
