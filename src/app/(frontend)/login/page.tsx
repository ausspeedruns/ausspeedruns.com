import { headers } from "next/headers";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import configPromise from "#payload-config";

import { LoginForm } from "./LoginForm.tsx";
import styles from "./page.module.css";
import { Card, Stack, Title } from "@mantine/core";

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
			<Card p="xl" w="100%" maw={420}>
				<Stack gap="lg">
					<Title order={1} ta="center">
						Log In
					</Title>
					<LoginForm redirectPath={redirectPath} />
				</Stack>
			</Card>
		</main>
	);
}
