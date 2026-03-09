"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, PasswordInput, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

import styles from "./signup.module.css";
import { useForm } from "@mantine/form";
import { SignUp } from "./signup-action";

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
		<>
			<div className={styles.form}>
				<TextInput
					label="Username"
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
					required
					placeholder="Select your date of birth"
					maxDate={new Date()}
					valueFormat="DD / MM / YYYY"
					error={form.errors.dateOfBirth}
					id="dateOfBirth"
					name="dateOfBirth"
					key={form.key("dateOfBirth")}
					{...form.getInputProps("dateOfBirth")}
				/>

				<Button className={styles.submit} onClick={handleSubmit} loading={isSubmitting}>
					{isSubmitting ? "Creating account..." : "Create account"}
				</Button>
			</div>

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
				Already have an account? <Link href="/login">Sign in</Link>
			</p>
		</>
	);
}
