"use client";

import { useState } from "react";
import { Button, TextField } from "@mui/material";
import { resetPassword } from "./reset-password-action";
import { useSearchParams } from "next/navigation";
import { signInAction } from "../../signin/signin-action";

export async function PasswordResetForm() {
	const searchParams = useSearchParams();

	const [password, setPassword] = useState("");
	const [passwordConfirm, setPasswordConfirm] = useState("");
	const [passwordsMatch, setPasswordsMatch] = useState(true);

	function checkPasswordsMatch() {
		setPasswordsMatch(password === passwordConfirm);
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();

				if (!passwordsMatch) {
					return;
				}

				const email = searchParams.get("email");
				const code = searchParams.get("code");

				if (!email || !code) {
					console.error("Email or code missing");
					return;
				}

				resetPassword({
					email,
					password,
					token: code,
				}).then((result) => {
					// console.log('Reset result', result)

					const formdata = new FormData();
					formdata.append("email", email);
					formdata.append("password", password);

					if (!result.error && !["TOKEN_REDEEMED", "TOKEN_EXPIRED", "FAILURE"].includes(result.data.code)) {
						signInAction(formdata);
					} else {
						console.error(result.error);
						console.error(result.data);
					}
				});
			}}>
			<TextField
				value={password}
				type="password"
				onChange={(e) => setPassword(e.target.value)}
				label="Password"
				required
			/>
			<TextField
				value={passwordConfirm}
				type="password"
				onChange={(e) => setPasswordConfirm(e.target.value)}
				onBlur={() => checkPasswordsMatch()}
				label="Confirm Password"
				required
				error={!passwordsMatch}
			/>
			<Button variant="contained" type="submit">
				Submit
			</Button>
		</form>
	);
}
