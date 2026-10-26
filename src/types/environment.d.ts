declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PAYLOAD_SECRET: string;
			DATABASE_URI: string;
			DATABASE_POOL_MAX?: string;
			NEXT_PUBLIC_SERVER_URL: string;
			CRON_SECRET?: string;
			PREVIEW_SECRET?: string;
			DISABLE_JOBS_AUTORUN?: string;
			DISABLE_PROD_MIGRATIONS?: string;
			STRIPE_SECRET_KEY: string;
			STRIPE_WEBHOOK_SECRET: string;
			NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
			NEXT_PUBLIC_URL: string;
			SMTP_HOST?: string;
			SMTP_PORT?: string;
			SMTP_SECURE?: string;
			SMTP_USER?: string;
			SMTP_PASS?: string;
			EMAIL_FROM_ADDRESS?: string;
			EMAIL_FROM_NAME?: string;
			AZURE_STORAGE_CONNECTION_STRING?: string;
			AZURE_STORAGE_CONTAINER_NAME?: string;
			AZURE_STORAGE_ACCOUNT_BASEURL?: string;
			AZURE_STORAGE_ALLOW_CONTAINER_CREATE?: string;
		}
	}
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
