import type { ServerProps } from "payload";

import { AdminNavLink } from "../shared/AdminNavLink.tsx";

/** Sidebar link to the Schedule Import view, only shown to users who can manage content. */
export default function ScheduleImportLink({ payload, permissions }: ServerProps) {
	if (!permissions?.collections?.["schedule-drafts"]?.read) return null;

	return <AdminNavLink href={`${payload.config.routes.admin}/schedule-import`} label="Schedule Import" />;
}
