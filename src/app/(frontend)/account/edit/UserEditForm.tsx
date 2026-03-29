"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, Group, Paper, Select, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";

import { updateUserProfile, type UserEditFormValues } from "./user-edit-action";
import styles from "./page.module.css";
import { DatePickerInput } from "@mantine/dates";

type UserEditFormProps = {
	initialValues: UserEditFormValues;
	username: string;
	isEmailVerified: boolean;
	onResendVerification?: () => void;
};

type FormStatus = {
	message: string;
	type: "error" | "success";
} | null;

export function UserEditForm({ initialValues, username, isEmailVerified, onResendVerification }: UserEditFormProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [status, setStatus] = useState<FormStatus>(null);
	const form = useForm<UserEditFormValues>({
		mode: "uncontrolled",
		initialValues,
		validate: {
			name: (value) => (value.trim().length <= 100 ? null : "Display name must be 100 characters or fewer."),
			pronouns: (value) => (value.trim().length <= 128 ? null : "Pronouns must be 128 characters or fewer."),
		},
	});

	const handleSubmit = form.onSubmit((submittedValues) => {
		setStatus(null);

		startTransition(async () => {
			const result = await updateUserProfile(submittedValues);

			setStatus({
				message: result.message,
				type: result.success ? "success" : "error",
			});

			if (result.success) {
				router.refresh();
			}
		});
	});

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<Paper p="xl" withBorder>
				<Stack gap="lg">
					<div>
						<Title order={3}>Public details</Title>
						<Text c="dimmed" mt={4} size="sm">
							The fields below are the profile basics shown on your public page.
						</Text>
					</div>

					<div className={styles.formGrid}>
						<TextInput
							id="pronouns"
							key={form.key("pronouns")}
							label="Pronouns"
							maxLength={128}
							placeholder="He/Him, She/Her, They/Them, etc."
							{...form.getInputProps("pronouns")}
						/>
					</div>
				</Stack>
			</Paper>

			<Paper p="xl" withBorder>
				<Stack gap="lg">
					<div>
						<Title order={3}>Account Information</Title>
						<Text c="dimmed" mt={4} size="sm">
							Not shown publicly. Used in case we need to get in touch about your account, or for
							demographic purposes.
						</Text>
					</div>

					<div className={styles.formGrid}>
						<Group align="flex-end" gap="sm" wrap="nowrap">
							<TextInput
								id="email"
								key={form.key("email")}
								label="Email address"
								placeholder="you@example.com"
								style={{ flex: 1 }}
								{...form.getInputProps("email")}
							/>

							{isEmailVerified ? (
								<Badge color="green" mb={8} variant="light">
									Verified
								</Badge>
							) : (
								<Button mb={4} onClick={onResendVerification} type="button" variant="light">
									Resend verification
								</Button>
							)}
						</Group>

						<TextInput
							id="name"
							key={form.key("name")}
							label="Name"
							maxLength={100}
							placeholder="Jane Doe"
							{...form.getInputProps("name")}
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

						<Select
							clearable
							data={[
								{ label: "Victoria", value: "vic" },
								{ label: "New South Wales", value: "nsw" },
								{ label: "Queensland", value: "qld" },
								{ label: "Western Australia", value: "wa" },
								{ label: "South Australia", value: "sa" },
								{ label: "Tasmania", value: "tas" },
								{ label: "Northern Territory", value: "nt" },
								{ label: "Australian Capital Territory", value: "act" },
								{ label: "New Zealand", value: "nz" },
								{ label: "International", value: "international" },
							]}
							id="state"
							key={form.key("state")}
							label="Location"
							placeholder="Prefer not to say"
							{...form.getInputProps("state")}
						/>
					</div>
				</Stack>
			</Paper>

			<Paper p="xl" withBorder>
				<Stack gap="lg">
					<div>
						<Title order={3}>Social links</Title>
						<Text c="dimmed" mt={4} size="sm">
							Add the handles you want shown on your public profile.
						</Text>
					</div>

					<div className={styles.formGrid}>
						<TextInput
							id="discord"
							key={form.key("discord")}
							label="Discord"
							placeholder="runnername"
							{...form.getInputProps("discord")}
						/>

						<TextInput
							id="twitch"
							key={form.key("twitch")}
							label="Twitch"
							placeholder="channelname"
							{...form.getInputProps("twitch")}
						/>

						<TextInput
							id="bluesky"
							key={form.key("bluesky")}
							label="Bluesky"
							placeholder="handle.bsky.social"
							{...form.getInputProps("bluesky")}
						/>
					</div>

					{status && (
						<Alert color={status.type === "error" ? "red" : "green"} radius="md" role="status">
							{status.message}
						</Alert>
					)}
				</Stack>
			</Paper>

			<Group justify="space-between" wrap="wrap">
				<Button component={Link} href={`/user/${username}`} type="button" variant="default">
					View profile
				</Button>
				<Button loading={isPending} type="submit">
					Save changes
				</Button>
			</Group>

			<Paper p="xl" withBorder>
				<Stack gap="lg">
					<Button component={Link} href="/user/reset-password" color="red" variant="outline">
						Reset Password
					</Button>
				</Stack>
			</Paper>
		</form>
	);
}
