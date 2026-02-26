import type { SelectField } from "@payloadcms/plugin-form-builder/types";
import type { Control, FieldErrorsImpl } from "react-hook-form";

import { Label } from "#/components/ui/label";
import {
	Select as SelectComponent,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Controller } from "react-hook-form";

import { Error } from "../Error";
import { Width } from "../Width";
import styles from "./index.module.css";

interface SelectProps extends SelectField {
	control: Control;
	errors: Partial<FieldErrorsImpl>;
}

export function Select({ name, control, errors, label, options, required, width, defaultValue }: SelectProps) {
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
			<Controller
				control={control}
				defaultValue={defaultValue}
				name={name}
				render={({ field: { onChange, value } }) => {
					const controlledValue = options.find((t) => t.value === value);

					return (
						<SelectComponent onValueChange={(val) => onChange(val)} value={controlledValue?.value}>
							<SelectTrigger className={styles.trigger} id={name}>
								<SelectValue placeholder={label} />
							</SelectTrigger>
							<SelectContent>
								{options.map(({ label, value }) => {
									return (
										<SelectItem key={value} value={value}>
											{label}
										</SelectItem>
									);
								})}
							</SelectContent>
						</SelectComponent>
					);
				}}
				rules={{ required }}
			/>
			{errors[name] && <Error name={name} />}
		</Width>
	);
}
