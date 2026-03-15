import type { Metadata } from "next";

import { ForgotPasswordForm } from "./ForgotPasswordForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "Forgot Password",
	description: "Request a password reset email for your AusSpeedruns account.",
};

export default function ForgotPasswordPage() {
	return (
		<main className={styles.page}>
			<section className={styles.shell}>
				<div className={styles.header}>
					<h1 className={styles.title}>Forgot your password</h1>
					<p className={styles.subtitle}>Enter your email to receive a password reset link.</p>
				</div>

				<ForgotPasswordForm />
			</section>
		</main>
	);
}
