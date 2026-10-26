import type { AdminViewServerProps } from "payload";

import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { isContentManager } from "#access/helpers.ts";
import { ScheduleImportApp } from "#/components/admin/ScheduleImport/ScheduleImportApp.tsx";
import { PayloadMantineShell } from "../shared/PayloadMantineShell.tsx";

/**
 * Payload adapter for the schedule importer. Everything Payload-specific (auth, admin chrome, theme,
 * CMS routes) lives here; the app itself in `#/components/ScheduleImport` only uses Mantine and fetch.
 */
export default async function ScheduleImportView({ initPageResult, params, searchParams }: AdminViewServerProps) {
	const { req, visibleEntities } = initPageResult;
	const { payload, user } = req;
	const { routes, admin, cookiePrefix } = payload.config;

	if (!user) {
		redirect(`${routes.admin}/login`);
	}

	const canManage = await isContentManager(req);

	const events = canManage
		? (
				await payload.find({
					collection: "events",
					depth: 0,
					draft: true,
					pagination: false,
					sort: "-timeSettings.startTime",
					select: { name: true, shortName: true },
					overrideAccess: true,
					req,
				})
			).docs.map((event) => ({ id: event.id, name: event.name, shortName: event.shortName }))
		: [];

	const requestedEvent = Number(Array.isArray(searchParams?.event) ? searchParams.event[0] : searchParams?.event);
	const initialEventId = events.some((event) => event.id === requestedEvent) ? requestedEvent : null;

	// Same resolution order Payload uses for the admin's data-theme, so the first render matches
	const themeCookie = (await cookies()).get(`${cookiePrefix || "payload"}-theme`)?.value;
	const themeHeader = (await headers()).get("Sec-CH-Prefers-Color-Scheme");
	const initialScheme =
		admin.theme === "dark" || admin.theme === "light"
			? admin.theme
			: themeCookie === "dark" || themeCookie === "light"
				? themeCookie
				: themeHeader === "dark"
					? "dark"
					: "light";

	return (
		<DefaultTemplate
			i18n={req.i18n}
			locale={initPageResult.locale}
			params={params}
			payload={payload}
			permissions={initPageResult.permissions}
			searchParams={searchParams}
			user={user}
			visibleEntities={visibleEntities}
		>
			<Gutter>
				<h1>Schedule Import</h1>

				{canManage ? (
					<PayloadMantineShell initialScheme={initialScheme}>
						<ScheduleImportApp
							events={events}
							initialEventId={initialEventId}
							apiBase={`${routes.api}/schedule-drafts`}
							links={{
								user: `${routes.admin}/collections/users/{id}`,
								event: `${routes.admin}/collections/events/{id}`,
								runs: `${routes.admin}/collections/runs?where[event][equals]={eventId}&sort=scheduledTime`,
								incentives: `${routes.admin}/collections/incentives?where[event][equals]={eventId}`,
							}}
						/>
					</PayloadMantineShell>
				) : (
					<p>You need content management access to build event schedules.</p>
				)}
			</Gutter>
		</DefaultTemplate>
	);
}
