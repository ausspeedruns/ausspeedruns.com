const path = require('path');
require('dotenv').config();

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
				destination:
					process.env.NODE_ENV === 'production'
						? `https://keystone.ausspeedruns.com/api/graphql`
						: `http://localhost:8000/api/graphql`,
			},
		];
	},
	images: {
		domains: [
			'localhost',
			'ausspeedruns.com',
			'beta.ausspeedruns.com',
			'ausrunsstoragebeta.blob.core.windows.net',
			'ausrunsstoragebeta.blob.core.windows.net',
			'ausrunsstorage.blob.core.windows.net',
		],
	},
	output: 'standalone',
};
