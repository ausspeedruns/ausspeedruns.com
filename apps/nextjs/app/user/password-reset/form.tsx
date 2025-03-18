"use client";

import { useState } from "react";
import { Button, TextField } from "@mui/material";
import { resetPassword } from "./reset-password-action";
import { useSearchParams } from "next/navigation";

export function PasswordResetForm() {
	const searchParams = useSearchParams();

	const [password, setPassword] = useState("");
	const [passwordConfirm, setPasswordConfirm] = useState("");
	const [passwordsMatch, setPasswordsMatch] = useState(true);

	function checkPasswordsMatch() {
		setPasswordsMatch(password === passwordConfirm);
	}

	return (
		<form action={resetPassword}>
			<input type="hidden" name="email" value={searchParams.get("email") ?? ""} />
			<input type="hidden" name="token" value={searchParams.get("code") ?? ""} />
			<TextField
				value={password}
				type="password"
				onChange={(e) => setPassword(e.target.value)}
				label="Password"
				name="password"
				required
			/>
			<TextField
				value={passwordConfirm}
				type="password"
				onChange={(e) => setPasswordConfirm(e.target.value)}
				onBlur={() => checkPasswordsMatch()}
				label="Confirm Password"
				name="passwordConfirm"
				required
				error={!passwordsMatch}
			/>
			<Button variant="contained" type="submit">
				Submit
			</Button>
		</form>
	);
}
