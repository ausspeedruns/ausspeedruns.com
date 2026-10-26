import { headers } from "next/headers";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import configPromise from "#payload-config";

import { SignUpForm } from "./SignUpForm.tsx";
import styles from "./page.module.css";
import { Card, Stack, Title } from "@mantine/core";

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
			<Card p="xl" w="100%" maw={420}>
				<Stack gap="lg">
					<Title order={1} ta="center">
						Sign Up
					</Title>
					<SignUpForm />
				</Stack>
			</Card>
		</main>
	);
}