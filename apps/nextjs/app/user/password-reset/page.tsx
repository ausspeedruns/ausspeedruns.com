import styles from "./User.PasswordReset.code.module.scss";
import { Metadata } from "next";
import { PasswordResetForm } from "./form";

export const metadata: Metadata = {
	title: "Password Reset",
};

export default async function PasswordResetPage() {
	return (
		<>
			<div className={styles.background}>what</div>
			<div className={`${styles.content} ${styles.form}`}>
				<h1>Password Reset</h1>
				<PasswordResetForm />
			</div>
		</>
	);
}
