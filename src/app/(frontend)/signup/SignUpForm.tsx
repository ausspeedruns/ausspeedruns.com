"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Anchor, Button, PasswordInput, Stack, Text, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

import styles from "./page.module.css";
import { useForm } from "@mantine/form";
import { SignUp } from "./signupAction";
import { Check, SquareAlert } from "pixelarticons/react";
import { focusFirstError } from "#utilities/react/focusFirstError.ts";

export interface SignUpFormData {
	username: string;
	email: string;
	password: string;
	dateOfBirth: string;
}

const usernameRegex = /^[a-zA-Z0-9_-~][\w-]{2,24}$/;

type FormStatus = {
	type: "error" | "success";
	message: string;
} | null;

export function SignUpForm() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [status, setStatus] = useState<FormStatus>(null);

	const form = useForm<SignUpFormData>({
		mode: "uncontrolled",
		initialValues: {
			username: "",
			email: "",
			password: "",
			dateOfBirth: "",
		},
		validate: {
			username: (value) =>
				usernameRegex.test(value)
					? null
					: "Username must be 3-25 characters long and can only contain letters, numbers, underscores, tildes, and hyphens.",
			email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
			password: (value) => (value.length >= 8 ? null : "Password must be at least 8 characters"),
			dateOfBirth: (value) => {
				if (!value) return "Date of birth is required";
				const today = new Date();
				const dob = new Date(value);
				const age = today.getFullYear() - dob.getFullYear();
				const monthDiff = today.getMonth() - dob.getMonth();
				const dayDiff = today.getDate() - dob.getDate();
				if (age < 13 || (age === 13 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
					return "You must be at least 13 years old";
				}
				return null;
			},
		},
	});

	const router = useRouter();

	async function handleSubmit() {
		setIsSubmitting(true);
		setStatus(null);

		if (form.validate().hasErrors) {
			setStatus({
				type: "error",
				message: "Please fix the errors in the form.",
			});
			setIsSubmitting(false);
			return;
		}

		try {
			const response = await SignUp(form.values);

			if (!response.success) {
				const errorMessage = response.message ?? "Something went wrong. Please try again.";

				setStatus({ type: "error", message: errorMessage });
				return;
			}

			setStatus({
				type: "success",
				message: "Account created! Redirecting...",
			});

			router.push("/login");
			router.refresh();
		} catch {
			setStatus({
				type: "error",
				message: "Unable to create your account right now. Please try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<Stack gap="md">
			<form
				className={styles.form}
				onSubmit={form.onSubmit(handleSubmit, (errors) => focusFirstError(form, errors))}
			>
				<TextInput
					label="Username"
					description="3-25 characters: letters, numbers, underscores, tildes and hyphens."
					id="username"
					name="username"
					autoComplete="username"
					required
					key={form.key("username")}
					{...form.getInputProps("username")}
				/>

				<TextInput
					label="Email"
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					required
					placeholder="you@example.com"
					key={form.key("email")}
					{...form.getInputProps("email")}
				/>

				<PasswordInput
					label="Password"
					description="At least 8 characters."
					id="password"
					name="password"
					autoComplete="new-password"
					required
					placeholder="Create a password"
					key={form.key("password")}
					{...form.getInputProps("password")}
				/>

				<DatePickerInput
					label="Date of Birth"
					// Shown as text (rather than a hover-only tooltip) so keyboard and screen reader users get it too
					description="Used to check you meet the minimum age for our events and events we partner with."
					required
					placeholder="Select your date of birth"
					maxDate={new Date()}
					valueFormat="DD / MM / YYYY"
					error={form.errors.dateOfBirth}
					id="dateOfBirth"
					name="dateOfBirth"
					key={form.key("dateOfBirth")}
					{...form.getInputProps("dateOfBirth")}
					// An empty string renders as "Invalid Date" instead of the placeholder
					defaultValue={form.getValues().dateOfBirth || null}
				/>

				<Button className={styles.submit} type="submit" loading={isSubmitting} size="md" fullWidth>
					{isSubmitting ? "Creating account..." : "Create account"}
				</Button>
			</form>

			{status && (
				<Alert
					variant="light"
					icon={status.type === "error" ? <SquareAlert /> : <Check />}
					color={status.type === "error" ? "red" : "green"}
					// role="alert" is announced as soon as it appears; a freshly mounted role="status" often isn't
					role={status.type === "error" ? "alert" : "status"}
				>
					{status.message}
				</Alert>
			)}

			<Text c="dimmed" size="sm" ta="center">
				Already have an account?{" "}
				<Anchor component={Link} href="/login" fw={600}>
					Log in
				</Anchor>
			</Text>
		</Stack>
	);
}
