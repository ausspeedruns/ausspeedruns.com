import styles from "../../../../styles/User.PasswordReset.code.module.scss";
import { Metadata } from "next";
import { PasswordResetForm } from "./form";
import { auth } from "../../../auth";

export const metadata: Metadata = {
	title: "Password Reset",
};

export default async function PasswordResetPage() {
	const session = await auth();

	return (
		<main className={styles.content}>
			<h1>Password Reset</h1>
			<PasswordResetForm />
		</main>
	);
}
