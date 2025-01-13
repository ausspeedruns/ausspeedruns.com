import Link from "next/link";
import { TextField, Button } from "@mui/material";
import styles from "./SignIn.module.scss";

import SignInError from "./signin-error";
import { Metadata } from "next";
import { signInAction } from "./signin-action";

export const metadata: Metadata = {
	title: "Sign In",
	description: "Sign In to AusSpeedruns",
};

export default function SignInPage() {
	return (
		<>
			<div className={styles.background} />
			<div className={`${styles.content} ${styles.form}`}>
				<h1>Sign In</h1>
				<form action={signInAction}>
					<TextField
						label="Email"
						type="email"
						variant="outlined"
						autoComplete="email"
						fullWidth
						name="email"
					/>

					<TextField
						label="Password"
						type="password"
						autoComplete="current-password"
						variant="outlined"
						fullWidth
						name="password"
					/>
					<Button variant="contained" type="submit">
						Sign In
					</Button>
				</form>
				<SignInError />
				<hr />
				<Link className={styles.links} href="/signup">
					Want to join instead?
				</Link>
				<Link className={styles.links} href="/reset-password">
					Forgot password?
				</Link>
			</div>
		</>
	);
}
