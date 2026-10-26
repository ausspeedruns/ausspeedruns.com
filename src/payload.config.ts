import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { azureStorage } from "@payloadcms/storage-azure";

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
import { migrations } from "./migrations/index.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const serverURL = getServerSideURL();

// `next build` also runs with NODE_ENV=production; migrations must only run when the server starts,
// not once per build worker (same check as Payload's internal isNextBuild)
const isNextBuild = process.env.NEXT_PHASE === "phase-production-build" || process.env.npm_lifecycle_event === "build";
const runProdMigrations = !isNextBuild && process.env.DISABLE_PROD_MIGRATIONS !== "true";

// Without SMTP settings Payload falls back to logging emails to the console (fine for local dev only)
const email = process.env.SMTP_HOST
	? nodemailerAdapter({
			defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || "noreply@ausspeedruns.com",
			defaultFromName: process.env.EMAIL_FROM_NAME || "AusSpeedruns",
			transportOptions: {
				host: process.env.SMTP_HOST,
				port: Number(process.env.SMTP_PORT || 587),
				// `true` for implicit TLS (port 465); otherwise STARTTLS is negotiated
				secure: process.env.SMTP_SECURE === "true",
				auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
			},
		})
	: undefined;

export default buildConfig({
	// `serverURL` is deliberately not set: it would enable Payload's CSRF check, which rejects the auth cookie on
	// any visit that starts on another site (Stripe redirects, email/Discord links) and on Safari < 16.4.
	// The auth cookie is `SameSite=Lax`, so browsers already refuse to send it with cross-site POST/fetch requests.
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
			// Azure Database for PostgreSQL requires TLS: append `?sslmode=require` to the connection string
			connectionString: process.env.DATABASE_URI || "",
			max: Number(process.env.DATABASE_POOL_MAX || 10),
		},
		migrationDir: path.resolve(dirname, "migrations"),
		// Pending migrations run automatically on startup when NODE_ENV=production (the standalone image has no Payload CLI)
		prodMigrations: runProdMigrations ? migrations : undefined,
	}),
	email,
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
	cors: [serverURL].filter(Boolean),
	// Nothing uses GraphQL (integrations use REST + API keys), so don't expose it
	graphQL: {
		disable: true,
	},
	// The deepest populate used by the site is 2
	maxDepth: 3,
	globals: [Header, Footer, PaymentSettings],
	plugins: [
		...plugins,
		azureStorage({
			// Uploads stay on local disk (public/media) unless Azure Blob is configured
			enabled: Boolean(process.env.AZURE_STORAGE_CONNECTION_STRING),
			collections: {
				// Media is public, so serve files straight from Blob/CDN instead of proxying through Node
				media: { disablePayloadAccessControl: true },
			},
			allowContainerCreate: process.env.AZURE_STORAGE_ALLOW_CONTAINER_CREATE === "true",
			containerAccess: "blob",
			baseURL: process.env.AZURE_STORAGE_ACCOUNT_BASEURL || "",
			connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || "",
			containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || "media",
		}),
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

				// Otherwise allow external schedulers that send the CRON_SECRET
				// as an Authorization header:
				const authHeader = req.headers.get("authorization");
				return authHeader === `Bearer ${process.env.CRON_SECRET}`;
			},
		},
		// The site runs on a long-lived server, so process queued jobs (e.g. scheduled publish) in-process every minute
		autoRun: [{ cron: "* * * * *", queue: "default", limit: 10 }],
		shouldAutoRun: () => process.env.DISABLE_JOBS_AUTORUN !== "true",
		tasks: [],
	},
});
