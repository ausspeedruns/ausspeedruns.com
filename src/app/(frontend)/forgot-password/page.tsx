import type { Metadata } from "next";
import { connection } from "next/server";

import { getTurnstileSiteKey } from "#utilities/botCheck/server.ts";

import { ForgotPasswordForm } from "./ForgotPasswordForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "Forgot Password",
	description: "Request a password reset email for your AusSpeedruns account.",
};

export default async function ForgotPasswordPage() {
	// Render per request so the Turnstile site key comes from the runtime environment, not the build
	await connection();

	return (
		<main className={styles.page}>
			<section className={styles.shell}>
				<div className={styles.header}>
					<h1 className={styles.title}>Forgot your password</h1>
					<p className={styles.subtitle}>Enter your email to receive a password reset link.</p>
				</div>

				<ForgotPasswordForm turnstileSiteKey={getTurnstileSiteKey()} />
			</section>
		</main>
	);
}
