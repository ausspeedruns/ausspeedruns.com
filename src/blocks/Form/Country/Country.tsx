import type { CountryField } from "@payloadcms/plugin-form-builder/types";
import type { Control, FieldErrorsImpl } from "react-hook-form";

import { Select as MantineSelect } from "@mantine/core";
import { Controller } from "react-hook-form";

import { getFieldError } from "../Error/Error";
import { Width } from "../Width/Width";
import { countryOptions } from "./options";

interface CountryFieldProps extends CountryField {
	control: Control;
	errors: Partial<FieldErrorsImpl>;
}

export function Country({ name, control, errors, label, required, width }: CountryFieldProps) {
	return (
		<Width width={width}>
			<Controller
				control={control}
				defaultValue={""}
				name={name}
				render={({ field: { onBlur, onChange, value } }) => (
					<MantineSelect
						aria-required={required}
						data={countryOptions}
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
