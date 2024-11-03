import Link from "next/link";
import { TextField, Button } from "@mui/material";
import styles from "./SignIn.module.scss";

import { signIn } from "../../auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import SignInError from "./signin-error";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Sign In",
	description: "Sign In to AusSpeedruns",
}

export default function SignInPage() {
	return (
		<div>
			<div className={styles.background} />
			<div className={`${styles.content} ${styles.form}`}>
				<h1>Sign In</h1>
				<form
					action={async (formData) => {
						"use server";
						try {
							console.log("c");
							// await signIn("credentials", { email: formData.email, password: formData.password });
							await signIn("credentials", formData);
						} catch (error) {
							if (error instanceof AuthError) {
								return redirect(`/signin?error=${error.type}`);
							}
							throw error;
						}
					}}>
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
		</div>
	);
}
