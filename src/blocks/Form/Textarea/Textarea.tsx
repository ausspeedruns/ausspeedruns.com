import type { TextField } from "@payloadcms/plugin-form-builder/types";
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from "react-hook-form";

import { Label } from "#/components/ui/label";
import { Textarea as TextAreaComponent } from "#/components/ui/textarea";

import { Error } from "../Error/Error";
import { Width } from "../Width/Width";
import styles from "./Textarea.module.css";

interface TextareaProps extends TextField {
	errors: Partial<FieldErrorsImpl>;
	register: UseFormRegister<FieldValues>;
	rows?: number;
}

export function Textarea({ name, defaultValue, errors, label, register, required, rows = 3, width }: TextareaProps) {
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

			<TextAreaComponent
				defaultValue={defaultValue}
				id={name}
				rows={rows}
				{...register(name, { required: required })}
			/>

			{errors[name] && <Error name={name} />}
		</Width>
	);
}
