import type { ServerProps } from "payload";

import { ScheduleImportNavLink } from "./ScheduleImportNavLink.tsx";

/** Sidebar link to the Schedule Import view, only shown to users who can manage content. */
export default function ScheduleImportLink({ payload, permissions }: ServerProps) {
	if (!permissions?.collections?.["schedule-drafts"]?.read) return null;

	return <ScheduleImportNavLink href={`${payload.config.routes.admin}/schedule-import`} />;
}
