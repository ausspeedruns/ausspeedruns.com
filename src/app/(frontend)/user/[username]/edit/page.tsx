import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import configPromise from "#payload-config";

import { UserEditForm } from "./UserEditForm";
import styles from "./page.module.css";
import { resendVerificationEmail } from "./user-edit-action";

export const metadata: Metadata = {
	title: "Edit Profile",
	description: "Update your AusSpeedruns public profile.",
};

type EditUserPageProps = {
	params: Promise<{
		username: string;
	}>;
};

export default async function EditUserPage({ params }: EditUserPageProps) {
	const { username } = await params;
	const decodedUsername = decodeURIComponent(username);
	const payload = await getPayload({ config: configPromise });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		redirect(`/login?redirect=${encodeURIComponent(`/user/${decodedUsername}/edit`)}`);
	}

	if (user.username !== decodedUsername) {
		redirect(`/user/${user.username}/edit`);
	}

	return (
		<main className={styles.page}>
			<section className={styles.shell}>
				<div className={styles.header}>
					<p className={styles.kicker}>Profile settings</p>
					<h1 className={styles.title}>Edit your profile</h1>
					<p className={styles.subtitle}>
						These details appear on your public profile and help other runners find you.
					</p>
				</div>

				<UserEditForm
					initialValues={{
						name: user.name ?? "",
						email: user.email ?? "",
						pronouns: user.pronouns ?? "",
						dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
						state: user.state ?? "",
						discord: user.socials?.Discord ?? "",
						twitch: user.socials?.Twitch ?? "",
						bluesky: user.socials?.Bluesky ?? "",
					}}
					isEmailVerified={Boolean(user._verified)}
					username={user.username}
					onResendVerification={resendVerificationEmail}
				/>
			</section>
		</main>
	);
}
