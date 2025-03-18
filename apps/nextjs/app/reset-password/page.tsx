import React from "react";
import { TextField, Button } from "@mui/material";
import styles from "../../styles/SignIn.module.scss";
import { Metadata } from "next";
import { resetPassword } from "./reset-password-action";

export const metadata: Metadata = {
	title: "Reset Password",
	description: "Reset Password to AusSpeedruns",
};

export default function ResetPasswordPage() {
	return (
		<>
			<div className={styles.background} />
			<div className={`${styles.content} ${styles.form}`}>
				<h1>Reset Password</h1>
				<form action={resetPassword}>
					<TextField label="Email" variant="outlined" fullWidth name="email" />
					<Button type="submit" variant="contained">
						Reset password
					</Button>
				</form>
			</div>
		</>
	);
}
