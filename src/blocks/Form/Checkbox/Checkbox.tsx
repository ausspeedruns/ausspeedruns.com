import type { CheckboxField } from "@payloadcms/plugin-form-builder/types";
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from "react-hook-form";

import { Checkbox as MantineCheckbox } from "@mantine/core";

import { getFieldError } from "../Error/Error";
import { Width } from "../Width/Width";

import styles from "./Checkbox.module.css";

interface CheckboxProps extends CheckboxField {
	errors: Partial<FieldErrorsImpl>;
	register: UseFormRegister<FieldValues>;
}

export function Checkbox({ name, defaultValue, errors, label, register, required, width }: CheckboxProps) {
	return (
		<Width width={width}>
			<MantineCheckbox
				aria-required={required}
				defaultChecked={defaultValue}
				error={getFieldError(errors, name)}
				id={name}
				label={
					<>
						{required && (
							<span className={styles.required}>
								* <span className={styles.srOnly}>(required)</span>
							</span>
						)}
						{label}
					</>
				}
				{...register(name, { required })}
			/>
		</Width>
	);
}
