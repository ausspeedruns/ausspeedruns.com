"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, PasswordInput, TextInput } from "@mantine/core";

import styles from "./login.module.css";

type LoginFormProps = {
	redirectPath: string;
};

type FormStatus = {
	type: "error" | "success";
	message: string;
} | null;

function getSafeRedirectPath(value: string | null | undefined): string {
	if (!value) return "/";
	if (!value.startsWith("/") || value.startsWith("//")) return "/";
	return value;
}

export function LoginForm({ redirectPath }: LoginFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [status, setStatus] = useState<FormStatus>(null);

	const router = useRouter();
	const searchParams = useSearchParams();

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSubmitting(true);
		setStatus(null);

		const formData = new FormData(event.currentTarget);
		const email = formData.get("email");
		const password = formData.get("password");

		if (typeof email !== "string" || typeof password !== "string") {
			setStatus({
				type: "error",
				message: "Please enter both your email and password.",
			});
			setIsSubmitting(false);
			return;
		}

		try {
			const response = await fetch("/api/users/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ email, password }),
			});

			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as {
					errors?: Array<{ message?: string }>;
					message?: string;
				} | null;

				const errorMessage =
					payload?.errors?.[0]?.message ??
					payload?.message ??
					"That email/password combination was not accepted.";

				setStatus({
					type: "error",
					message: errorMessage,
				});
				return;
			}

			setStatus({
				type: "success",
				message: "Signed in successfully. Redirecting...",
			});

			const nextFromQuery = getSafeRedirectPath(searchParams.get("redirect") ?? searchParams.get("next"));
			router.push(nextFromQuery || redirectPath);
			router.refresh();
		} catch {
			setStatus({
				type: "error",
				message: "Unable to sign in right now. Please try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<>
			<form className={styles.form} onSubmit={handleSubmit}>
				<TextInput
					label="Email"
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					required
					placeholder="you@example.com"
				/>

				<PasswordInput
					label="Password"
					id="password"
					name="password"
					autoComplete="current-password"
					required
					placeholder="Enter your password"
				/>

				<Button className={styles.submit} type="submit" loading={isSubmitting}>
					{isSubmitting ? "Signing in..." : "Sign in"}
				</Button>
			</form>

			{status && (
				<Alert
					className={status.type === "error" ? styles.error : styles.success}
					radius={0}
					role="status"
					aria-live="polite"
				>
					{status.message}
				</Alert>
			)}

			<p className={styles.footerText}>
				Need to create an account? <Link href="/contact">Contact the team</Link>
			</p>
		</>
	);
}
