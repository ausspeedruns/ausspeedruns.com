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
	// const [{ error, data }, signup] = useMutation(gql`
	// 	mutation ($username: String!, $email: String!, $password: String!, $dob: DateTime!) {
	// 		createUser(data: { username: $username, email: $email, password: $password, dateOfBirth: $dob }) {
	// 			__typename
	// 			id
	// 		}
	// 		authenticateUserWithPassword(email: $email, password: $password) {
	// 			__typename
	// 		}
	// 	}
	// `);

	const maxDate = sub(new Date(), { years: 13 });
	// const [username, setUsername] = useState('');
	// const [email, setEmail] = useState('');
	// const [password, setPassword] = useState('');
	// const [dob, setDob] = useState<Date | undefined>();

	// const cantSignUp = !Boolean(username) || !Boolean(email)|| !Boolean(dob) || password.length < 8 || maxDate < new Date(dob || Date.now()) || !UsernameRegex.test(username);

	return (
		<>
			<div className={styles.background} />
			<div className={`${styles.content} ${styles.form}`}>
				<h1>Join</h1>
				<form
					action={async (formData) => {
						"use server";

						try {
							await signUp(formData);
							return redirect("/user/edit-user");
						} catch (error) {
							if (error instanceof SignUpError) {
								return redirect(`/signup?error=${error.type}`);
							}

							throw error;
						}
					}}
					// onSubmit={(event) => {
					// 	event.preventDefault();
					// 	signup({ username, email: email.toLowerCase(), password, dob }).then((result) => {
					// 		if (result.data?.createUser) {
					// 			// FIXME: there's a cache issue with Urql where it's not reloading the
					// 			// current user properly if we do a client-side redirect here.
					// 			// router.push('/');
					// 			if (top) top.location.href = '/user/edit-user';
					// 		}
					// 	});
					// }}
				>
					{/* {error && <div>{HumanErrorMsg(error.message)}</div>} */}
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
