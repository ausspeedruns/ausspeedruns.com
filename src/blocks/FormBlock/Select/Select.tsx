import type { SelectField } from "@payloadcms/plugin-form-builder/types";
import type { Control, FieldErrorsImpl } from "react-hook-form";

import { Select as MantineSelect } from "@mantine/core";
import { Controller } from "react-hook-form";

import { getFieldError } from "../Error/Error";
import { Width } from "../Width/Width";

interface SelectProps extends SelectField {
	control: Control;
	errors: Partial<FieldErrorsImpl>;
}

export function Select({ name, control, errors, label, required, width, options, defaultValue }: SelectProps) {
	return (
		<Width width={width}>
			<Controller
				control={control}
				defaultValue={defaultValue}
				name={name}
				render={({ field: { onBlur, onChange, value } }) => (
					<MantineSelect
						aria-required={required}
						data={options.map(({ label, value }) => ({ label, value }))}
						error={getFieldError(errors, name)}
						id={name}
						label={label}
						onBlur={onBlur}
						onChange={(val) => onChange(val ?? "")}
						placeholder={label}
						value={value || null}
						withAsterisk={required}
					/>
				)}
				rules={{ required }}
			/>
		</Width>
	);
}
