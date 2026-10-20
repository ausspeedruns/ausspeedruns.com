import type { ServerProps } from "payload";

import type { Role, User } from "#/payload-types";
import { roleCanUseTicketPickup } from "#access/helpers.ts";
import { ScheduleImportNavLink } from "#/components/ScheduleImportView/ScheduleImportNavLink.tsx";

/** Sidebar link to the ticket pickup desk, only shown to users who can use it. */
export default async function TicketPickupLink({ payload, user }: ServerProps) {
	const roleValues = (user as User | undefined)?.roles ?? [];
	if (roleValues.length === 0) return null;

	const populated = roleValues.filter((role): role is Role => typeof role === "object" && role !== null);
	const ids = roleValues.filter((role): role is number => typeof role === "number");
	const fetched =
		ids.length > 0
			? (await payload.find({ collection: "roles", where: { id: { in: ids } }, depth: 0, pagination: false }))
					.docs
			: [];

	if (![...populated, ...fetched].some(roleCanUseTicketPickup)) return null;

	return <ScheduleImportNavLink href={`${payload.config.routes.admin}/ticket-pickup`} label="Ticket Pickup" />;
}
