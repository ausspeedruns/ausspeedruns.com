import { headers } from "next/headers";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import configPromise from "#payload-config";

import { LoginForm } from "./LoginForm.tsx";
import styles from "./login.module.css";

export const metadata: Metadata = {
	title: "Login",
	description: "Login with your email and password.",
};

type LoginPageProps = {
	searchParams: Promise<{
		redirect?: string;
	}>;
};

function getSafeRedirectPath(value?: string): string {
	if (!value) return "/";
	if (!value.startsWith("/") || value.startsWith("//")) return "/";
	return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const params = await searchParams;
	const redirectPath = getSafeRedirectPath(params.redirect);

	const payload = await getPayload({ config: configPromise });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (user) {
		redirect(redirectPath);
	}

	return (
		<main className={styles.page}>
			<section className={styles.card}>
				<p className={styles.kicker}>AusSpeedruns</p>
				<LoginForm redirectPath={redirectPath} />
			</section>
		</main>
	);
}
