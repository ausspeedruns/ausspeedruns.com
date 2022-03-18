const path = require('path');

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
       			destination: `https://keystone.ausspeedruns.com/api/graphql`,
			},
		];
	},
	images: {
		domains: ['localhost']
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
