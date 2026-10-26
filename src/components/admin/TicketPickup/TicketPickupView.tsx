import type { AdminViewServerProps } from "payload";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { canUseTicketPickup } from "#access/helpers.ts";
import { TicketPickupApp } from "#/components/admin/TicketPickup/TicketPickupApp.tsx";
import { PayloadMantineShell } from "#/components/admin/shared/PayloadMantineShell.tsx";

/** Full screen ticket pickup desk at /admin/ticket-pickup. Deliberately rendered without the admin nav. */
export default async function TicketPickupView({ initPageResult }: AdminViewServerProps) {
	const { req } = initPageResult;
	const { payload, user } = req;
	const { routes, admin, cookiePrefix } = payload.config;

	if (!user) {
		redirect(`${routes.admin}/login?redirect=${encodeURIComponent(`${routes.admin}/ticket-pickup`)}`);
	}

	if (!(await canUseTicketPickup(req))) {
		return (
			<p style={{ padding: 32 }}>You need the ticket pickup role (or user management access) to use this page.</p>
		);
	}

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
		<PayloadMantineShell initialScheme={initialScheme}>
			<TicketPickupApp apiUrl={`${routes.api}/orders/pickup`} exitHref={routes.admin} />
		</PayloadMantineShell>
	);
}
