"use client";

import { useState, useTransition } from "react";
import { Alert, Button, Paper, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

import { requestPasswordReset, type ForgotPasswordFormValues } from "./forgot-password-action";
import styles from "./page.module.css";

type FormStatus = {
	message: string;
	type: "error" | "success";
} | null;

export function ForgotPasswordForm() {
	const [isPending, startTransition] = useTransition();
	const [status, setStatus] = useState<FormStatus>(null);

	const form = useForm<ForgotPasswordFormValues>({
		mode: "uncontrolled",
		initialValues: {
			email: "",
		},
		validate: {
			email: (value) => (/^\S+@\S+$/.test(value) ? null : "Please enter a valid email address."),
		},
	});

	const handleSubmit = form.onSubmit((values) => {
		setStatus(null);

		startTransition(async () => {
			const result = await requestPasswordReset(values);

			setStatus({
				message: result.message,
				type: result.success ? "success" : "error",
			});

			if (result.success) {
				form.reset();
			}
		});
	});

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<Paper p="xl" withBorder>
				<Stack gap="lg">
					<TextInput
						id="email"
						key={form.key("email")}
						label="Email address"
						placeholder="you@example.com"
						autoComplete="email"
						{...form.getInputProps("email")}
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
