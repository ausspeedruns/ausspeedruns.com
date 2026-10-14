import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import config from "#payload-config";

import { UserEditForm } from "./UserEditForm";
import styles from "./page.module.css";
import { resendVerificationEmail } from "./user-edit-action";

export const metadata: Metadata = {
	title: "Edit Profile",
	description: "Update your AusSpeedruns public profile.",
};

export default async function EditUserPage() {
	const payload = await getPayload({ config: config });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		redirect(`/login?redirect=${encodeURIComponent(`/account/edit`)}`);
	}

	return (
		<section className={styles.shell}>
			<div className={styles.header}>
				<h1 className={styles.title}>Edit your profile</h1>
			</div>

			<UserEditForm
				initialValues={{
					name: user.name ?? "",
					email: user.email ?? "",
					pronouns: user.pronouns ?? "",
					dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
					state: user.state ?? "",
					discord: user.socials?.discord ?? "",
					twitch: user.socials?.twitch ?? "",
					bluesky: user.socials?.bluesky ?? "",
				}}
				isEmailVerified={Boolean(user._verified)}
				username={user.username}
				onResendVerification={resendVerificationEmail}
			/>
		</section>
	);
}
