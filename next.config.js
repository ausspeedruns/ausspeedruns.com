const { withKeystone } = require("@keystone-6/core/next");
const path = require('path');

module.exports = withKeystone({
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  async rewrites() {
    return [
      {
        source: '/api/graphql',
        destination: 'http://localhost:8000/api/graphql',
      },
    ];
  },
});
