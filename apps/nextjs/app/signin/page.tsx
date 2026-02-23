import Link from "next/link";
import Script from "next/script";
import { TextField, Button } from "@mui/material";
import styles from "../../styles/SignIn.module.scss";

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
			<div className={styles.form}>
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
					<div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}></div>
					<Button variant="contained" type="submit" size="large" sx={{ mt: 1, borderRadius: 2 }}>
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
			<Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
		</>
	);
}
