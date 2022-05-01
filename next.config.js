const path = require('path');
require("dotenv").config();

module.exports = {
	reactStrictMode: true,
	sassOptions: {
		includePaths: [path.join(__dirname, 'styles')],
	},
	async rewrites() {
		return [
			{
				source: '/api/graphql',
				// destination: `http://localhost:8000/api/graphql`,
       			destination: process.env.NODE_ENV === 'production' ? `https://keystone.ausspeedruns.com/api/graphql` : `http://localhost:8000/api/graphql`,
			},
		];
	},
	images: {
		domains: ['localhost', 'ausspeedruns.com', 'beta.ausspeedruns.com', 'ausrunsstoragebeta.blob.core.windows.net', 'ausrunsstoragebeta.blob.core.windows.net', 'ausrunsstorage.blob.core.windows.net']
	},
	experimental: {
		outputStandalone: true,
	},
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (isServer) {
      config.externals = [
        ...config.externals,
        '@keystone-6/core/___internal-do-not-use-will-break-in-patch/api',
        '@keystone-6/core/___internal-do-not-use-will-break-in-patch/next-graphql',
        '@keystone-6/core/next',
        '@keystone-6/core/system',
        '.prisma/client',
      ];
    }
    return config;
  },
};
