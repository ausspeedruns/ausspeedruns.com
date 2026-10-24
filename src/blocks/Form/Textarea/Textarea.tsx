import type { TextField } from "@payloadcms/plugin-form-builder/types";
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from "react-hook-form";

import { Textarea as MantineTextarea } from "@mantine/core";

import { getFieldError } from "../Error/Error";
import { Width } from "../Width/Width";

interface TextareaProps extends TextField {
	errors: Partial<FieldErrorsImpl>;
	register: UseFormRegister<FieldValues>;
	rows?: number;
}

export function Textarea({ name, defaultValue, errors, label, register, required, rows = 3, width }: TextareaProps) {
	return (
		<Width width={width}>
			<MantineTextarea
				aria-required={required}
				defaultValue={defaultValue}
				error={getFieldError(errors, name)}
				id={name}
				label={label}
				rows={rows}
				withAsterisk={required}
				{...register(name, { required })}
			/>
		</Width>
	);
}
