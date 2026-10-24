import type { EmailField } from "@payloadcms/plugin-form-builder/types";
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from "react-hook-form";

import { TextInput } from "@mantine/core";

import { getFieldError } from "../Error/Error";
import { Width } from "../Width/Width";

interface EmailFieldProps extends EmailField {
	errors: Partial<FieldErrorsImpl>;
	register: UseFormRegister<FieldValues>;
}

export function Email({ name, defaultValue, errors, label, register, required, width }: EmailFieldProps) {
	return (
		<Width width={width}>
			<TextInput
				aria-required={required}
				defaultValue={defaultValue}
				error={getFieldError(errors, name)}
				id={name}
				label={label}
				type="text"
				withAsterisk={required}
				{...register(name, { pattern: /^\S[^\s@]*@\S+$/, required })}
			/>
		</Width>
	);
}
