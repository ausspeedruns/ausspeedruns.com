import type { Metadata } from "next";
import { getPayload } from "payload";
import { headers } from "next/headers";

import configPromise from "#payload-config";

import styles from "./page.module.css";
import { Button } from "@mantine/core";

export const metadata: Metadata = {
	title: "Email Verification",
	description: "Verify your AusSpeedruns account email address.",
};

type VerifyPageProps = {
	searchParams: Promise<{
		token?: string;
	}>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
	const { token } = await searchParams;

	if (!token) {
		return (
			<main className={styles.page}>
				<section className={styles.shell}>
					<div className={styles.header}>
						<p className={styles.kicker}>Account Setup</p>
						<h1 className={styles.title}>No token provided</h1>
						<p className={styles.subtitle}>
							The verification link you used is missing a token. Please check your email and try again.
						</p>
					</div>
				</section>
			</main>
		);
	}

	const payload = await getPayload({ config: configPromise });

	let verified = false;
	let error: unknown = null;
	try {
		verified = await payload.verifyEmail({
			collection: "users",
			token,
		});
	} catch (err) {
		error = err;
	}

	if (!verified || error) {
		if (error) {
			console.error("Error verifying email token:", error);
		}

		return (
			<main className={styles.page}>
				<section className={styles.shell}>
					<div className={styles.header}>
						<p className={styles.kicker}>Account Setup</p>
						<h1 className={styles.title}>Invalid or expired link</h1>
						<p className={styles.subtitle}>
							The verification link you used is invalid or has already expired. Please sign in and request
							a new verification email from your account settings.
						</p>
					</div>
					<div className={styles.actions}>
						<Button component="a" href="/login">
							Sign in
						</Button>
					</div>
				</section>
			</main>
		);
	}

	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	return (
		<main className={styles.page}>
			<section className={styles.shell}>
				<div className={styles.header}>
					<p className={styles.kicker}>Account Setup</p>
					<h1 className={styles.title}>Email verified!</h1>
					<p className={styles.subtitle}>
						Your email address has been successfully verified. Your account is now fully set up.
					</p>
				</div>
				<div className={styles.actions}>
					<Button component="a" href="/">
						Go to home
					</Button>
					{user?.username ? (
						<Button component="a" href={`/user/${user.username}/edit`} variant="outline">
							Edit your profile
						</Button>
					) : (
						<Button component="a" href="/login" variant="outline">
							Sign in
						</Button>
					)}
				</div>
			</section>
		</main>
	);
}
