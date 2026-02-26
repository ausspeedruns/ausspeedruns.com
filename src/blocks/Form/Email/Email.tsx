import type { EmailField } from "@payloadcms/plugin-form-builder/types";
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from "react-hook-form";

import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

import { Error } from "../Error/Error";
import { Width } from "../Width/Width";

import styles from "./Email.module.css";

interface EmailFieldProps extends EmailField {
	errors: Partial<FieldErrorsImpl>;
	register: UseFormRegister<FieldValues>;
}

export function Email({ name, defaultValue, errors, label, register, required, width }: EmailFieldProps) {
	return (
		<Width width={width}>
			<Label htmlFor={name}>
				{label}

				{required && (
					<span className={styles.required}>
						* <span className={styles.srOnly}>(required)</span>
					</span>
				)}
			</Label>
			<Input
				defaultValue={defaultValue}
				id={name}
				type="text"
				{...register(name, { pattern: /^\S[^\s@]*@\S+$/, required })}
			/>

			{errors[name] && <Error name={name} />}
		</Width>
	);
}
