import React from "react";
import { TextField, Button } from "@mui/material";
import styles from "../../styles/SignIn.module.scss";
import { Metadata } from "next";
import { resetPassword } from "./reset-password-action";
import ResetPasswordStatus from "./reset-password-status";
import { Turnstile } from "@marsidev/react-turnstile";

export const metadata: Metadata = {
	title: "Reset Password",
	description: "Reset Password to AusSpeedruns",
};

export default function ResetPasswordPage() {
	return (
		<>
			<div className={styles.background} />
			<div className={styles.form}>
				<h1>Reset Password</h1>
				<form action={resetPassword}>
					<TextField label="Email" variant="outlined" fullWidth name="email" />
					<Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} />
					<Button type="submit" variant="contained" size="large" sx={{ mt: 1, borderRadius: 2 }}>
						Reset password
					</Button>
				</form>
				<ResetPasswordStatus />
			</div>
		</>
	);
}
