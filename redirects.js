const redirects = async () => {
	const internetExplorerRedirect = {
		destination: "/ie-incompatible.html",
		has: [
			{
				type: "header",
				key: "user-agent",
				value: "(.*Trident.*)", // all ie browsers
			},
		],
		permanent: false,
		source: "/:path((?!ie-incompatible.html$).*)", // all pages except the incompatibility page
	};

	// Password resets can only be requested from the bot-checked website page (see Users/hooks/botProtection.ts)
	const adminForgotPasswordRedirect = {
		source: "/admin/forgot",
		destination: "/forgot-password",
		permanent: false,
	};

	const redirects = [internetExplorerRedirect, adminForgotPasswordRedirect];

	return redirects;
};

export default redirects;
