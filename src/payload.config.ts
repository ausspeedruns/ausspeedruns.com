// storage-adapter-import-placeholder
import { postgresAdapter } from "@payloadcms/db-postgres";

import sharp from "sharp"; // sharp-import
import path from "node:path";
import { buildConfig, type PayloadRequest } from "payload";
import { fileURLToPath } from "node:url";

import { Categories } from "./collections/Categories.ts";
import { Pages } from "./collections/Pages/Pages.ts";
import { Posts } from "./collections/Posts/Posts.ts";
import { Events } from "./collections/Events.ts";
import { Incentives } from "./collections/Incentives.ts";
import { Media } from "./collections/Media.ts";
import { Orders } from "./collections/Orders.ts";
import { Products } from "./collections/Products.ts";
import { Roles } from "./collections/Roles.ts";
import { Runs } from "./collections/Runs.ts";
import { ScheduleDrafts } from "./collections/ScheduleDrafts.ts";
import { SegmentTypes } from "./collections/SegmentTypes.ts";
import { Submissions } from "./collections/Submissions.ts";
import { Users } from "./collections/Users/Users.ts";
import { Volunteers } from "./collections/Volunteers.ts";

import { Footer } from "./Footer/config.ts";
import { Header } from "./Header/config.ts";
import { PaymentSettings } from "./globals/PaymentSettings.ts";
import { plugins } from "./plugins/plugins.ts";
import { defaultLexical } from "#fields/defaultLexical.ts";
import { getServerSideURL } from "./utilities/getURL.ts";
import { Games } from "#collections/Game.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
	admin: {
		components: {
			// The `BeforeLogin` component renders a message that you see while logging into your admin panel.
			// Feel free to delete this at any time. Simply remove the line below.
			beforeLogin: ["./components/BeforeLogin/BeforeLogin"],
			// The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
			// Feel free to delete this at any time. Simply remove the line below.
			beforeDashboard: ["./components/BeforeDashboard/BeforeDashboard"],
			afterNavLinks: [
				"./components/ScheduleImportView/ScheduleImportLink",
				"./components/TicketPickupView/TicketPickupLink",
			],
			views: {
				// Accessible at /admin/ticket-pickup
				ticketPickup: {
					Component: "./components/TicketPickupView/TicketPickupView",
					path: "/ticket-pickup",
				},
				// Accessible at /admin/schedule-import
				scheduleImport: {
					Component: "./components/ScheduleImportView/ScheduleImportView",
					path: "/schedule-import",
				},
			},
		},
		importMap: {
			baseDir: path.resolve(dirname),
		},
		user: Users.slug,
		livePreview: {
			breakpoints: [
				{
					label: "Mobile",
					name: "mobile",
					width: 375,
					height: 667,
				},
				{
					label: "Tablet",
					name: "tablet",
					width: 768,
					height: 1024,
				},
				{
					label: "Desktop",
					name: "desktop",
					width: 1440,
					height: 900,
				},
			],
		},
	},
	// This config helps us configure global or default features that the other editors can inherit
	editor: defaultLexical,
	db: postgresAdapter({
		pool: {
			connectionString: process.env.DATABASE_URI || "",
		},
	}),
	collections: [
		Pages,
		Posts,
		Media,
		Categories,
		Users,
		Roles,
		Events,
		Incentives,
		Products,
		Orders,
		Runs,
		SegmentTypes,
		Submissions,
		Volunteers,
		Games,
		ScheduleDrafts,
	],
	cors: [getServerSideURL()].filter(Boolean),
	globals: [Header, Footer, PaymentSettings],
	plugins: [
		...plugins,
		// storage-adapter-placeholder
	],
	secret: process.env.PAYLOAD_SECRET,
	sharp,
	typescript: {
		outputFile: path.resolve(dirname, "payload-types.ts"),
	},
	jobs: {
		access: {
			run: ({ req }: { req: PayloadRequest }): boolean => {
				// Allow logged in users to execute this endpoint (default)
				if (req.user) return true;

				// If there is no logged in user, then check
				// for the Vercel Cron secret to be present as an
				// Authorization header:
				const authHeader = req.headers.get("authorization");
				return authHeader === `Bearer ${process.env.CRON_SECRET}`;
			},
		},
		tasks: [],
	},
});
