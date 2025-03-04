import Link from "next/link";
import { Button, TextField } from "@mui/material";

import styles from "../../styles/SignIn.module.scss";
import { sub } from "date-fns";
import { Metadata } from "next";
import LocalisedDatePicker from "./localised-date-picker";
import { signUp, SignUpError } from "apps/nextjs/auth";
import { redirect } from "next/navigation";

function HumanErrorMsg(error: string) {
	switch (error) {
		case "[GraphQL] Prisma error: Unique constraint failed on the fields: (`email`)":
			return "Error: Email already in use";
		case "[GraphQL] Prisma error: Unique constraint failed on the fields: (`username`)":
			return "Error: Username already in use";

		default:
			return error;
	}
}

const UsernameRegex = /^[a-zA-Z0-9_-~][\w-]{2,24}$/;

export const metadata: Metadata = {
	title: "Sign Up",
	description: "Sign Up to AusSpeedruns",
};

export default function SignUpPage() {
	const maxDate = sub(new Date(), { years: 13 });

	return (
		<>
			<div className={styles.background} />
			<div className={`${styles.content} ${styles.form}`}>
				<h1>Join</h1>
				<form
					action={async (formData) => {
						"use server";

						let redirectUrl = "/user/edit-user";

						try {
							await signUp(formData);
						} catch (error) {
							console.error(error);
							if (error instanceof SignUpError) {
								redirectUrl = `/signup?error=${error.type}`;
							} else {
								redirectUrl = `/signup?error=unknown`;
							}

							throw error;
						} finally {
							redirect(redirectUrl);
						}
					}}
				>
					{/* {error && <div>{HumanErrorMsg(error)}</div>} */}
					<TextField name="email" variant="outlined" label="Email" type="email" autoComplete="email" />
					<TextField
						name="password"
						variant="outlined"
						label="Password"
						type="password"
						helperText="Minimum 8 characters"
						autoComplete="new-password"
					/>
					<TextField
						name="username"
						variant="outlined"
						label="Username"
						// error={!UsernameRegex.test(username) && username.length !== 0}
						helperText="Letters, numbers, underscores and hyphens allowed. 3-25 Characters."
						slotProps={{ htmlInput: { maxLength: 25 } }}
					/>
					<LocalisedDatePicker maxDate={maxDate} />
					<Button type="submit" variant="contained">
						Sign Up
					</Button>
				</form>
				<hr className="my-4" />
				<Link className={styles.links} href="/signin">
					Already have an account? Sign in
				</Link>
			</div>
		</>
	);
}
