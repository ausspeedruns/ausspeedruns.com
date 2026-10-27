import type { Metadata } from "next";
import { getPayload } from "payload";

import configPromise from "#payload-config";

import { ResetPasswordForm } from "./ResetPasswordForm";
import styles from "./page.module.css";
import { Button } from "@mantine/core";

export const metadata: Metadata = {
	title: "Reset Password",
	description: "Change your AusSpeedruns account password.",
};

type ResetPasswordPageProps = {
	// The reset email links to /reset-password?token=<token>
	searchParams: Promise<{
		token?: string;
	}>;
};

/** Email of the account a reset token belongs to, so password managers know which saved login to update. */
async function findEmailForResetToken(token: string): Promise<string | null> {
	try {
		const payload = await getPayload({ config: configPromise });
		// Same lookup Payload's resetPassword operation uses
		const user = await payload.db.findOne<{ id: string; email?: string }>({
			collection: "users",
			where: {
				resetPasswordExpiration: { greater_than: new Date().toISOString() },
				resetPasswordToken: { equals: token },
			},
		});
		return typeof user?.email === "string" ? user.email : null;
	} catch {
		return null;
	}
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
	const { token } = await searchParams;

	// The token is checked (and used up) when the new password is submitted; an invalid or expired token is reported then
	if (!token) {
		return (
			<main className={styles.page}>
				<section className={styles.shell}>
					<div className={styles.header}>
						<p className={styles.kicker}>Account Security</p>
						<h1 className={styles.title}>Invalid password reset link</h1>
						<p className={styles.subtitle}>
							This link is missing its reset code. Please use the link from your most recent password
							reset email, or request a new one.
						</p>
						<Button component="a" href="/forgot-password" mt="md">
							Request new password reset link
						</Button>
					</div>
				</section>
			</main>
		);
	}

	return (
		<main className={styles.page}>
			<section className={styles.shell}>
				<div className={styles.header}>
					<p className={styles.kicker}>Account Security</p>
					<h1 className={styles.title}>Reset your password</h1>
					<p className={styles.subtitle}>Choose a new password for your account.</p>
				</div>

				<ResetPasswordForm token={token} email={await findEmailForResetToken(token)} />
			</section>
		</main>
	);
}
