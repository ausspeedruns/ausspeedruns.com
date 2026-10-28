"use client";

import { Button, Group } from "@mantine/core";
import { useEffect } from "react";

import { ButtonLink } from "#/components/Link/ButtonLink";
import styles from "./not-found.module.css";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;

	return (
		<main className={`container ${styles.container}`}>
			<div className={styles.content}>
				<h1 className={styles.title}>Something went wrong</h1>
				<h2>Looks like that run hit a softlock.</h2>
				<p className={styles.description}>
					An unexpected error occurred. Please try again, and contact us if it keeps happening.
					{digest && <> (Error reference: {digest})</>}
				</p>
			</div>
			<Group>
				<Button onClick={() => retry()}>Try again</Button>
				<ButtonLink href="/" variant="outline">
					Go home
				</ButtonLink>
			</Group>
		</main>
	);
}
