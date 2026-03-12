import Link from "next/link";
import { Button, TextField } from "@mui/material";

import styles from "../../styles/SignIn.module.scss";
import { Turnstile } from "@marsidev/react-turnstile";
import { sub } from "date-fns";
import { Metadata } from "next";
import LocalisedDatePicker from "./localised-date-picker";
import { signUp, SignUpError } from "apps/nextjs/auth";
import { redirect } from "next/navigation";
import { signUpAction } from "./signup-action";
import SignUpErrorComponent from "./signup-error";

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
			<div className={styles.form}>
				<h1>Join</h1>
				<form action={signUpAction}>
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
					<Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} />
					<Button type="submit" variant="contained" size="large" sx={{ mt: 1, borderRadius: 2 }}>
						Sign Up
					</Button>
				</form>
				<SignUpErrorComponent />
				<hr />
				<Link className={styles.links} href="/signin">
					Already have an account? Sign in
				</Link>
			</div>
		</>
	);
}
