"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Anchor, Button, PasswordInput, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

import styles from "./page.module.css";
import { Check, SquareAlert } from "pixelarticons/react";
import { useSessionStore } from "#stores/useSessionStore.ts";

type LoginFormProps = {
	redirectPath: string;
};

type FormStatus = {
	type: "error" | "success";
	message: string;
} | null;

type LoginFormValues = {
	email: string;
	password: string;
};

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
	const form = useForm<LoginFormValues>({
		mode: "uncontrolled",
		initialValues: {
			email: "",
			password: "",
		},
		validate: {
			email: (value) => {
				const trimmedValue = value.trim();
				if (!trimmedValue) return "Please enter your email.";
				return /^\S+@\S+$/.test(trimmedValue) ? null : "Please enter a valid email address.";
			},
			password: (value) => (value ? null : "Please enter your password."),
		},
	});

	const handleSubmit = form.onSubmit(async (values) => {
		setIsSubmitting(true);
		setStatus(null);

		try {
			const response = await fetch("/api/users/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					email: values.email.trim(),
					password: values.password,
				}),
			});

			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as {
					errors?: Array<{ message?: string }>;
					message?: string;
				} | null;

				const rawMessage =
					payload?.errors?.[0]?.message ??
					payload?.message ??
					"That email/password combination was not accepted.";
				// Payload's lockout message doesn't say how to recover (see auth.lockTime in the Users collection)
				const errorMessage = /locked/i.test(rawMessage)
					? "Too many failed login attempts. Try again in 10 minutes, or reset your password to unlock your account now."
					: rawMessage;

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

			// Update the header, which loads the session client-side
			void useSessionStore.getState().refresh();

			const nextFromQuery = getSafeRedirectPath(searchParams.get("redirect") ?? searchParams.get("next"));
			router.push(nextFromQuery ?? redirectPath);
			router.refresh();
		} catch {
			setStatus({
				type: "error",
				message: "Unable to sign in right now. Please try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	});

	return (
		<Stack gap="md">
			<form className={styles.form} onSubmit={handleSubmit}>
				<TextInput
					label="Email"
					id="email"
					key={form.key("email")}
					type="email"
					autoComplete="email"
					placeholder="you@example.com"
					size="md"
					{...form.getInputProps("email")}
				/>

				<PasswordInput
					label="Password"
					id="password"
					key={form.key("password")}
					autoComplete="current-password"
					placeholder="Enter your password"
					size="md"
					{...form.getInputProps("password")}
				/>

				<Button className={styles.submit} type="submit" loading={isSubmitting} size="md" fullWidth>
					{isSubmitting ? "Logging in..." : "Log in"}
				</Button>
			</form>

			{status && (
				<Alert
					variant="light"
					icon={status.type === "error" ? <SquareAlert /> : <Check />}
					color={status.type === "error" ? "red" : "green"}
					role="status"
					aria-live={status.type === "error" ? "assertive" : "polite"}
				>
					{status.message}
				</Alert>
			)}

			<Text c="dimmed" size="sm" ta="center">
				<Anchor component={Link} href="/forgot-password" fw={600}>
					Forgot your password?
				</Anchor>
			</Text>

			<Text c="dimmed" size="sm" ta="center">
				Need to create an account?{" "}
				<Anchor component={Link} href="/signup" fw={600}>
					Sign up
				</Anchor>
			</Text>
		</Stack>
	);
}