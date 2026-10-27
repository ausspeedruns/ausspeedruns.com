"use client";

import { useRef, useState, useTransition } from "react";
import { Alert, Button, Paper, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

import { requestPasswordReset, type ForgotPasswordFormValues } from "./forgotPasswordAction";
import styles from "./page.module.css";
import { HoneypotField, TurnstileField, type TurnstileInstance } from "#components/BotCheck/BotCheck.tsx";
import { readHoneypot, TURNSTILE_ACTIONS } from "#utilities/botCheck/shared.ts";

type FormStatus = {
	message: string;
	type: "error" | "success";
} | null;

export function ForgotPasswordForm({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
	const [isPending, startTransition] = useTransition();
	const [status, setStatus] = useState<FormStatus>(null);
	const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
	const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);

	const form = useForm<ForgotPasswordFormValues>({
		mode: "uncontrolled",
		initialValues: {
			email: "",
		},
		validate: {
			email: (value) => (/^\S+@\S+$/.test(value) ? null : "Please enter a valid email address."),
		},
	});

	const handleSubmit = form.onSubmit((values, event) => {
		setStatus(null);

		if (!turnstileToken) {
			setStatus({ message: "Please complete the verification check.", type: "error" });
			return;
		}

		const honeypot = readHoneypot(event?.currentTarget);

		startTransition(async () => {
			const result = await requestPasswordReset(values, { turnstileToken, honeypot }).catch(() => ({
				success: false,
				message: "Unable to send reset email right now. Please try again.",
			}));

			setStatus({
				message: result.message,
				type: result.success ? "success" : "error",
			});

			if (result.success) {
				form.reset();
			}

			// Turnstile tokens can only be used once
			setTurnstileToken(null);
			turnstileRef.current?.reset();
		});
	});

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<Paper p="xl" withBorder>
				<Stack gap="lg">
					<TextInput
						id="email"
						name="email"
						type="email"
						key={form.key("email")}
						label="Email address"
						placeholder="you@example.com"
						autoComplete="username"
						{...form.getInputProps("email")}
					/>

					<HoneypotField />

					<TurnstileField
						ref={turnstileRef}
						siteKey={turnstileSiteKey}
						action={TURNSTILE_ACTIONS.forgotPassword}
						onTokenChange={setTurnstileToken}
					/>

					{status && (
						<Alert color={status.type === "success" ? "green" : "red"} variant="light">
							{status.message}
						</Alert>
					)}

					<Button type="submit" loading={isPending}>
						Send reset email
					</Button>
				</Stack>
			</Paper>
		</form>
	);
}
