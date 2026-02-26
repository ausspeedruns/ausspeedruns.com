import type { StateField } from "@payloadcms/plugin-form-builder/types";
import type { Control, FieldErrorsImpl } from "react-hook-form";

import { Label } from "#/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { Controller } from "react-hook-form";

import { Error } from "../Error/Error";
import { Width } from "../Width/Width";
import { stateOptions } from "./options";
import styles from "./State.module.css";

interface StateFieldProps extends StateField {
	control: Control;
	errors: Partial<FieldErrorsImpl>;
}

export function State({ name, control, errors, label, required, width }: StateFieldProps) {
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
				defaultValue=""
				name={name}
				render={({ field: { onChange, value } }) => {
					const controlledValue = stateOptions.find((t) => t.value === value);

					return (
						<Select onValueChange={(val) => onChange(val)} value={controlledValue?.value}>
							<SelectTrigger className={styles.trigger} id={name}>
								<SelectValue placeholder={label} />
							</SelectTrigger>
							<SelectContent>
								{stateOptions.map(({ label, value }) => {
									return (
										<SelectItem key={value} value={value}>
											{label}
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
					);
				}}
				rules={{ required }}
			/>
			{errors[name] && <Error name={name} />}
		</Width>
	);
}
