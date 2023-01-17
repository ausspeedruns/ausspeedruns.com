const withNx = require("@nrwl/next/plugins/with-nx");
const path = require("path");
require("dotenv").config();

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
};

module.exports = withNx(nextConfig);
