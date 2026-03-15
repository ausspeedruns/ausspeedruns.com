"use client";

import { useState, useTransition } from "react";
import { Alert, Button, Paper, PasswordInput, Stack, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";

import { updatePassword, type ResetPasswordFormValues } from "./reset-password-action";
import styles from "./page.module.css";
import { redirect } from "next/navigation";

type FormStatus = {
	message: string;
	type: "error" | "success";
} | null;

export function ResetPasswordForm() {
	const [isPending, startTransition] = useTransition();
	const [status, setStatus] = useState<FormStatus>(null);

	const form = useForm<ResetPasswordFormValues>({
		mode: "uncontrolled",
		initialValues: {
			password: "",
			confirmPassword: "",
		},
		validate: {
			password: (value) => (value.length >= 8 ? null : "Password must be at least 8 characters."),
			confirmPassword: (value, values) => (value === values.password ? null : "Passwords do not match."),
		},
	});

	const handleSubmit = form.onSubmit((values) => {
		setStatus(null);

		startTransition(async () => {
			const result = await updatePassword(values);

			setStatus({
				message: result.message,
				type: result.success ? "success" : "error",
			});

			if (result.success) {
				redirect("/login");
			}
		});
	});

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<Paper p="xl" withBorder>
				<Stack gap="lg">
					<div>
						<Title order={3}>Change Password</Title>
						<Text c="dimmed" mt={4} size="sm">
							Enter a new password for your account. It must be at least 8 characters long.
						</Text>
					</div>

					<PasswordInput
						id="password"
						key={form.key("password")}
						label="New password"
						placeholder="New password"
						{...form.getInputProps("password")}
					/>

					<PasswordInput
						id="confirmPassword"
						key={form.key("confirmPassword")}
						label="Confirm new password"
						placeholder="Confirm new password"
						{...form.getInputProps("confirmPassword")}
					/>

					{status && (
						<Alert color={status.type === "success" ? "green" : "red"} variant="light">
							{status.message}
						</Alert>
					)}

					<Button type="submit" loading={isPending}>
						Update password
					</Button>
				</Stack>
			</Paper>
		</form>
	);
}
