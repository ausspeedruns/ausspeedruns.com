const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://example.com";

/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: SITE_URL,
	generateRobotsTxt: true,
	exclude: ["/posts-sitemap.xml", "/pages-sitemap.xml", "/*", "/posts/*"],
	robotsTxtOptions: {
		policies: [
			{
				userAgent: "*",
				// Media is served from /api/media when Azure Blob isn't configured; keep it crawlable for link previews
				allow: "/api/media/",
				disallow: ["/admin", "/api/", "/next/", "/account", "/cart", "/success", "/cancel"],
			},
		],
		additionalSitemaps: [`${SITE_URL}/pages-sitemap.xml`, `${SITE_URL}/posts-sitemap.xml`],
	},
};
