import type { ReactNode } from "react";

import { AccountSideNav } from "./AccountSideNav.tsx";
import classes from "./account-layout.module.css";
import { headers } from "next/headers";
import { getPayload } from "payload";
import { redirect } from "next/navigation";
import config from "#payload-config";

export default async function AccountLayout({ children }: { children: ReactNode }) {
	const payload = await getPayload({ config: config });
	const requestHeaders = await headers();

	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		redirect(`/login?redirect=${encodeURIComponent(`/account/edit`)}`);
	}

	return (
		<section className={classes.shell}>
			<AccountSideNav username={user.username} />
			<div className={classes.content}>{children}</div>
		</section>
	);
}
