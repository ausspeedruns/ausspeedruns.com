import type { TextField } from "@payloadcms/plugin-form-builder/types";
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from "react-hook-form";

import { TextInput } from "@mantine/core";

import { getFieldError } from "../Error/Error";
import { Width } from "../Width/Width";

interface NumberProps extends TextField {
	errors: Partial<FieldErrorsImpl>;
	register: UseFormRegister<FieldValues>;
}

export function Number({ name, defaultValue, errors, label, register, required, width }: NumberProps) {
	return (
		<Width width={width}>
			<TextInput
				aria-required={required}
				defaultValue={defaultValue}
				error={getFieldError(errors, name)}
				id={name}
				label={label}
				type="number"
				withAsterisk={required}
				{...register(name, { required })}
			/>
		</Width>
	);
}
