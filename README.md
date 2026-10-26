# Payload Website Template

This is the official [Payload Website Template](https://github.com/payloadcms/payload/blob/main/templates/website). Use it to power websites, blogs, or portfolios from small to enterprise. This repo includes a fully-working backend, enterprise-grade admin panel, and a beautifully designed, production-ready website.

This template is right for you if you are working on:

- A personal or enterprise-grade website, blog, or portfolio
- A content publishing platform with a fully featured publication workflow
- Exploring the capabilities of Payload

Core features:

- [Pre-configured Payload Config](#how-it-works)
- [Authentication](#users-authentication)
- [Access Control](#access-control)
- [Layout Builder](#layout-builder)
- [Draft Preview](#draft-preview)
- [Live Preview](#live-preview)
- [On-demand Revalidation](#on-demand-revalidation)
- [SEO](#seo)
- [Search](#search)
- [Redirects](#redirects)
- [Jobs and Scheduled Publishing](#jobs-and-scheduled-publish)
- [Website](#website)

## Quick Start

To spin up this example locally, follow these steps:

### Clone

If you have not done so already, you need to have standalone copy of this repo on your machine. If you've already cloned this repo, skip to [Development](#development).

Use the `create-payload-app` CLI to clone this template directly to your machine:

```bash
pnpx create-payload-app my-project -t website
```

### Development

1. First [clone the repo](#clone) if you have not done so already
1. `cd my-project && cp .env.example .env` to copy the example environment variables
1. `pnpm install && pnpm dev` to install dependencies and start the dev server
1. open `http://localhost:3000` to open the app in your browser

That's it! Changes made in `./src` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

    Users are auth-enabled collections that have access to the admin panel and unpublished content. See [Access Control](#access-control) for more details.

    For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/main/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Posts

    Posts are used to generate blog posts, news articles, or any other type of content that is published over time. All posts are layout builder enabled so you can generate unique layouts for each post using layout-building blocks, see [Layout Builder](#layout-builder) for more details. Posts are also draft-enabled so you can preview them before publishing them to your website, see [Draft Preview](#draft-preview) for more details.

- #### Pages

    All pages are layout builder enabled so you can generate unique layouts for each page using layout-building blocks, see [Layout Builder](#layout-builder) for more details. Pages are also draft-enabled so you can preview them before publishing them to your website, see [Draft Preview](#draft-preview) for more details.

- #### Media

    This is the uploads enabled collection used by pages, posts, and projects to contain media like images, videos, downloads, and other assets. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

- #### Categories

    A taxonomy used to group posts together. Categories can be nested inside of one another, for example "News > Technology". See the official [Payload Nested Docs Plugin](https://payloadcms.com/docs/plugins/nested-docs) for more details.

### Globals

See the [Globals](https://payloadcms.com/docs/configuration/globals) docs for details on how to extend this functionality.

- `Header`

    The data required by the header on your front-end like nav links.

- `Footer`

    Same as above but for the footer of your site.

## Access control

Basic access control is setup to limit access to various content based based on publishing status.

- `users`: Users can access the admin panel and create or edit content.
- `posts`: Everyone can access published posts, but only users can create, update, or delete them.
- `pages`: Everyone can access published pages, but only users can create, update, or delete them.

For more details on how to extend this functionality, see the [Payload Access Control](https://payloadcms.com/docs/access-control/overview#access-control) docs.

## Layout Builder

Create unique page layouts for any type of content using a powerful layout builder. This template comes pre-configured with the following layout building blocks:

- Hero
- Content
- Media
- Call To Action
- Archive

Each block is fully designed and built into the front-end website that comes with this template. See [Website](#website) for more details.

## Lexical editor

A deep editorial experience that allows complete freedom to focus just on writing content without breaking out of the flow with support for Payload blocks, media, links and other features provided out of the box. See [Lexical](https://payloadcms.com/docs/rich-text/overview) docs.

## Draft Preview

All posts and pages are draft-enabled so you can preview them before publishing them to your website. To do this, these collections use [Versions](https://payloadcms.com/docs/configuration/collections#versions) with `drafts` set to `true`. This means that when you create a new post, project, or page, it will be saved as a draft and will not be visible on your website until you publish it. This also means that you can preview your draft before publishing it to your website. To do this, we automatically format a custom URL which redirects to your front-end to securely fetch the draft version of your content.

Since the front-end of this template is statically generated, this also means that pages, posts, and projects will need to be regenerated as changes are made to published documents. To do this, we use an `afterChange` hook to regenerate the front-end when a document has changed and its `_status` is `published`.

For more details on how to extend this functionality, see the official [Draft Preview Example](https://github.com/payloadcms/payload/tree/examples/draft-preview).

## Live preview

In addition to draft previews you can also enable live preview to view your end resulting page as you're editing content with full support for SSR rendering. See [Live preview docs](https://payloadcms.com/docs/live-preview/overview) for more details.

## On-demand Revalidation

We've added hooks to collections and globals so that all of your pages, posts, footer, or header changes will automatically be updated in the frontend via on-demand revalidation supported by Nextjs.

> Note: if an image has been changed, for example it's been cropped, you will need to republish the page it's used on in order to be able to revalidate the Nextjs image cache.

## SEO

This template comes pre-configured with the official [Payload SEO Plugin](https://payloadcms.com/docs/plugins/seo) for complete SEO control from the admin panel. All SEO data is fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.

## Search

This template also pre-configured with the official [Payload Search Plugin](https://payloadcms.com/docs/plugins/search) to showcase how SSR search features can easily be implemented into Next.js with Payload. See [Website](#website) for more details.

## Redirects

If you are migrating an existing site or moving content to a new URL, you can use the `redirects` collection to create a proper redirect from old URLs to new ones. This will ensure that proper request status codes are returned to search engines and that your users are not left with a broken link. This template comes pre-configured with the official [Payload Redirects Plugin](https://payloadcms.com/docs/plugins/redirects) for complete redirect control from the admin panel. All redirects are fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.

## Jobs and Scheduled Publish

We have configured [Scheduled Publish](https://payloadcms.com/docs/versions/drafts#scheduled-publish) which uses the [jobs queue](https://payloadcms.com/docs/jobs-queue/jobs) in order to publish or unpublish your content on a scheduled time. The tasks are run on a cron schedule and can also be run as a separate instance if needed.

Queued jobs are processed in-process every minute via `jobs.autoRun` in `src/payload.config.ts`, since the site runs on a long-lived server. Set `DISABLE_JOBS_AUTORUN=true` to turn this off, e.g. for one-off scripts or a dedicated worker. An external scheduler can instead call `/api/payload-jobs/run` with `Authorization: Bearer <CRON_SECRET>`.

## Website

This template includes a beautifully designed, production-ready front-end built with the [Next.js App Router](https://nextjs.org), served right alongside your Payload app in a instance. This makes it so that you can deploy both your backend and website where you need it.

Core features:

- [Next.js App Router](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)
- [React Hook Form](https://react-hook-form.com)
- [Payload Admin Bar](https://github.com/payloadcms/payload/tree/main/packages/admin-bar)
- [TailwindCSS styling](https://tailwindcss.com/)
- [shadcn/ui components](https://ui.shadcn.com/)
- User Accounts and Authentication
- Fully featured blog
- Publication workflow
- Dark mode
- Pre-made layout building blocks
- SEO
- Search
- Redirects
- Live preview

### Cache

Public pages (`/`, `/[slug]`, `/posts`, `/events`) are statically rendered and cached. The logged-in user is loaded in the browser from `/next/me`, so no personal data ends up in cached HTML.

- Pages and posts are revalidated on publish by their `afterChange` hooks.
- Header, footer and redirects are revalidated by cache tag.
- `/`, `/[slug]` and `/events` also regenerate at most 60 seconds after going stale (`export const revalidate = 60`). Blocks such as the donation tracker, products and event hero read live data that changes without the page being republished.

If you add a page or block that reads data from another collection, give it a `revalidate` too, or it will show whatever data existed when it was last rendered. See the [Next.js Caching Docs](https://nextjs.org/docs/app/building-your-application/caching) for details.

## Development

To spin up this example locally, follow the [Quick Start](#quick-start). Then [Seed](#seed) the database with a few pages, posts, and projects.

### Working with Postgres

Postgres and other SQL-based databases follow a strict schema for managing your data. In comparison to our MongoDB adapter, this means that there's a few extra steps to working with Postgres.

Note that often times when making big schema changes you can run the risk of losing data if you're not manually migrating it.

#### Local development

Ideally we recommend running a local copy of your database so that schema updates are as fast as possible. By default the Postgres adapter has `push: true` for development environments. This will let you add, modify and remove fields and collections without needing to run any data migrations.

If your database is pointed to production you will want to set `push: false` otherwise you will risk losing data or having your migrations out of sync.

#### Migrations

[Migrations](https://payloadcms.com/docs/database/migrations) are SQL versions of the schema, stored in `src/migrations`. Production never uses `push`, so **every schema change (collections, fields, plugins) needs a migration** committed alongside it.

Create a migration locally after changing the schema:

```bash
pnpm payload migrate:create <name>
```

Then fix up the generated file so it works with Node's type stripping:

- Change its import to `import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'`.
- Add the `.ts` extension to its import in `src/migrations/index.ts`.

Migrations are passed to the Postgres adapter as `prodMigrations`. Pending migrations therefore run automatically when the production server starts, since the standalone Docker image doesn't include the Payload CLI. You can also run them manually with `pnpm payload migrate`.

Migrations are skipped during `next build`. If the database was ever dev-pushed (for example, running `pnpm dev:prod` against your local dev database), Payload will prompt on startup and wait for an answer. Set `DISABLE_PROD_MIGRATIONS=true` to skip migrations in that case.

> Don't point a dev (`push: true`) server at the production database. A pushed schema isn't recorded as a migration, so the startup migrations would then fail. The Keystone import (`scripts/migrate-keystonedb.ts --production`) runs with `NODE_ENV=production`, so it builds the schema from the migrations.

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development), the docker-compose file will automatically use the `.env` file in your project root
1. Next run `docker-compose up`
1. Follow [steps 4 and 5 from above](#development) to login and create your first admin user

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

### Seed

To seed the database with a few pages, posts, and projects you can click the 'seed database' link from the admin panel. Seeding is disabled when `NODE_ENV=production`.

The seed script will also create a demo user for demonstration purposes only:

- Demo Author
    - Email: `demo-author@payloadcms.com`
    - Password: `password`

> NOTICE: seeding the database is destructive because it drops your current database to populate a fresh one from the seed template. Only run this command if you are starting a new project or can afford to lose your current data.

## Production

To run Payload in production, you need to build and start the Admin panel. To do so, follow these steps:

1. Invoke the `next build` script by running `pnpm build` or `npm run build` in your project root. This creates a `.next` directory with a production-ready admin bundle.
1. Finally run `pnpm start` or `npm run start` to run Node in production and serve Payload from the `.build` directory.
1. When you're ready to go live, see Deployment below for more details.

### Deploying to Azure

Production runs as a Docker container on an Azure VM, with Azure Database for PostgreSQL and Azure Blob Storage for media. The setup follows Payload's [deployment](https://payloadcms.com/docs/production/deployment), [preventing abuse](https://payloadcms.com/docs/production/preventing-abuse) and [performance](https://payloadcms.com/docs/performance/overview) guides.

#### Azure resources

- **PostgreSQL** (Azure Database for PostgreSQL flexible server)
  - Put it in the same region as the VM (e.g. Australia East) to keep latency low.
  - TLS is required, so add `?sslmode=require` to `DATABASE_URI`.
  - Let the VM through the server firewall, or use private networking.
  - `DATABASE_POOL_MAX` (default 10) sets the size of the connection pool.
- **Blob Storage**
  - Create a container (default name `media`) with **anonymous read access for blobs**. Media is public, so it's served straight from Blob (`disablePayloadAccessControl`) rather than proxied through Node.
  - Set `AZURE_STORAGE_ACCOUNT_BASEURL` to the account URL (`https://<account>.blob.core.windows.net`), or to a CDN / Front Door endpoint in front of it.
  - If `AZURE_STORAGE_CONNECTION_STRING` isn't set, uploads fall back to `public/media` on local disk.
- **Email**
  - Any SMTP provider works via `SMTP_*`, e.g. Azure Communication Services (`smtp.azurecomm.net:587`).
  - Without `SMTP_HOST`, verification and password reset emails are only logged, so users can't verify their accounts.

To move existing uploads, copy the contents of `public/media` into the container, e.g. `azcopy copy "public/media/*" "https://<account>.blob.core.windows.net/media?<SAS>"`.

#### Build

`NEXT_PUBLIC_*` variables and the media origin are inlined at build time. The build also reads the database for `generateStaticParams`, so pass `DATABASE_URI` as a build secret; it's never stored in an image layer:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SERVER_URL=https://ausspeedruns.com \
  --build-arg AZURE_STORAGE_ACCOUNT_BASEURL=https://<account>.blob.core.windows.net \
  --secret id=DATABASE_URI,env=DATABASE_URI \
  -t ausspeedruns-web .
```

#### Run

Pass the runtime environment with an env file (see `.env.example`):

```bash
docker run -d --restart unless-stopped --env-file /etc/ausspeedruns/web.env -p 127.0.0.1:3000:3000 ausspeedruns-web
```

At minimum, set:

- `DATABASE_URI`
- `PAYLOAD_SECRET` (a long random string, e.g. `openssl rand -hex 32`)
- `NEXT_PUBLIC_SERVER_URL`
- `PREVIEW_SECRET` and `CRON_SECRET`
- The Stripe keys
- `SMTP_*` and `EMAIL_FROM_*`
- `AZURE_STORAGE_*`

Pending migrations run on startup.

#### Reverse proxy, TLS and rate limiting

Bind the container to localhost and put a reverse proxy (Caddy or nginx) in front of it, or put Azure Front Door / Application Gateway in front of the VM. The proxy should:

- Terminate HTTPS and redirect HTTP to HTTPS. Auth cookies are marked `Secure` whenever `NEXT_PUBLIC_SERVER_URL` starts with `https://`.
- Redirect the alternate hostname (e.g. `www.`) to the one in `NEXT_PUBLIC_SERVER_URL`, so everyone shares one cookie and one set of absolute URLs.
- Forward `Host`, `X-Forwarded-For` and `X-Forwarded-Proto`.
- Rate limit the endpoints that are open to abuse:
  - `/api/users/login`
  - `/api/users/forgot-password`
  - `/api/users` (sign up)
  - `/api/form-submissions`
  - The `/signup`, `/volunteer` and `/submit-game` server actions
- Keep per-IP limits generous. Everyone on the venue Wi-Fi at an event, and many mobile users (carrier-grade NAT), share one IP address. Ticket pickup staff and attendees shouldn't trip a limit meant for bots.
- Cache `/_next/static/*` (immutable) at the proxy or CDN.

#### Built-in protections

- **CSRF:** the auth cookie is `SameSite=Lax`, so browsers don't send it with cross-site POST/fetch requests. Next.js also checks the origin of server actions, and CORS is limited to the same origin.
  - Payload's own CSRF check (enabled by setting `serverURL` or `csrf`) is deliberately left off. It ignores the cookie whenever a visit starts on another site, which logs people out when they return from Stripe or follow an email or Discord link. It also affects every page on Safari before 16.4.
- **Logins:** accounts lock for 10 minutes after 5 failed logins, and email verification is required. Resetting the password unlocks the account straight away.
- **GraphQL:** disabled. Integrations such as the stream graphics use REST with API keys.
- **Query depth:** `maxDepth` is 3.
- **Uploads:** only content managers can upload media.

### Self-hosting elsewhere

Payload can be deployed anywhere Next.js runs. See the [deployment documentation](https://payloadcms.com/docs/production/deployment) for details.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
