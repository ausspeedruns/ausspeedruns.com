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
	params: Promise<{
		token: string;
	}>;
};

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
	const { token } = await params;

	if (!token) {
		return (
			<main className={styles.page}>
				<section className={styles.shell}>
					<div className={styles.header}>
						<p className={styles.kicker}>Account Security</p>
						<h1 className={styles.title}>No token provided</h1>
					</div>
				</section>
			</main>
		);
	}

	const payload = await getPayload({ config: configPromise });

	let result = false;
	let error = null;
	try {
		result = await payload.verifyEmail({
			collection: "users",
			token,
		});
	} catch (err) {
		error = err;
	}

	if (!result || error) {
		if (error) {
			console.error("Error verifying token:", error);
		}

		return (
			<main className={styles.page}>
				<section className={styles.shell}>
					<div className={styles.header}>
						<p className={styles.kicker}>Account Security</p>
						<h1 className={styles.title}>Invalid or expired token</h1>
						<p className={styles.subtitle}>
							The password reset link you used is invalid or has expired. Please request a new one.
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

				<ResetPasswordForm />
			</section>
		</main>
	);
}
