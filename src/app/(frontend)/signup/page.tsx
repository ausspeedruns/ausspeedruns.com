import { headers } from "next/headers";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import configPromise from "#payload-config";

import { SignUpForm } from "./SignUpForm.tsx";
import styles from "./signup.module.css";

export const metadata: Metadata = {
	title: "Sign Up",
	description: "Create a new AusSpeedruns account.",
};

export default async function SignUpPage() {
	const payload = await getPayload({ config: configPromise });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (user) {
		redirect("/");
	}

	return (
		<main className={styles.page}>
			<section className={styles.card}>
				<p className={styles.kicker}>AusSpeedruns</p>
				<h1 className={styles.title}>Create an account</h1>
				<p className={styles.subtitle}>Join AusSpeedruns and be part of our speedrunning community.</p>
				<SignUpForm />
			</section>
		</main>
	);
}
