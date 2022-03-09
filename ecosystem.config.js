module.exports = {
	apps: [
		{
			name: "ausruns-website",
			script: './node_modules/next/dist/bin/next',
			args: 'start -p ' + (process.env.PORT || 3000),
            watch: false,
            autorestart: true,
		},
		{
			name: "ausruns-keystone",
			script: './node_modules/@keystone-6/core/bin/cli.js',
			args: 'start',
            watch: false,
            autorestart: true,
		}
	]
}