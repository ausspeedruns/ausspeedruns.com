const { withKeystone } = require('@keystone-6/core/next');
const path = require('path');

// module.exports = withKeystone({
//   reactStrictMode: true,
//   sassOptions: {
//     includePaths: [path.join(__dirname, 'styles')],
//   },
//   async rewrites() {
//     return [
//       {
//         source: '/api/graphql',
//         destination: `http://${process.env.KEYSTONE_URL}:8000/api/graphql`,
//       },
//     ];
//   },
// });

module.exports = {
	reactStrictMode: true,
	sassOptions: {
		includePaths: [path.join(__dirname, 'styles')],
	},
	async rewrites() {
		return [
			{
				source: '/api/graphql',
       destination: `http://${process.env.KEYSTONE_URL}:8000/api/graphql`,
			},
		];
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
