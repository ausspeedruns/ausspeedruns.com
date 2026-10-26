"use client";

import { TextInput, useField } from "@payloadcms/ui";
import type { TextFieldClientComponent, Validate } from "payload";
import { useCallback } from "react";

import styles from "./ColourField.module.css";

const SHORT_HEX = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const LONG_HEX = /^#[0-9a-f]{6}/i;

/** `<input type="color">` only understands #rrggbb */
function toSwatchValue(value: string | null | undefined): string | null {
	if (!value) return null;
	const trimmed = value.trim();
	const short = SHORT_HEX.exec(trimmed);
	if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toLowerCase();
	return LONG_HEX.test(trimmed) ? trimmed.slice(0, 7).toLowerCase() : null;
}

/** Text field for CSS colours with a clickable swatch that opens the native colour picker. */
export const ColourField: TextFieldClientComponent = ({ field, path: pathFromProps, readOnly, validate }) => {
	const { label, required, localized, admin } = field;

	const memoizedValidate: Validate = useCallback(
		(value, options) =>
			typeof validate === "function" ? validate(value, { ...options, required } as never) : true,
		[validate, required],
	);

	const {
		customComponents: { AfterInput, BeforeInput, Description, Error, Label } = {},
		disabled,
		path,
		setValue,
		showError,
		value,
	} = useField<string>({ potentiallyStalePath: pathFromProps, validate: memoizedValidate });

	const swatch = toSwatchValue(value);
	const isReadOnly = Boolean(readOnly || disabled);

	return (
		<TextInput
			path={path}
			label={label}
			Label={Label}
			required={required}
			localized={localized}
			description={admin?.description}
			Description={Description}
			Error={Error}
			AfterInput={AfterInput}
			BeforeInput={
				<>
					{BeforeInput}
					<label
						className={styles.swatch}
						style={{ background: value || undefined }}
						data-empty={!value}
						title={isReadOnly ? value : "Pick a colour"}
					>
						<input
							type="color"
							className={styles.picker}
							value={swatch ?? "#000000"}
							disabled={isReadOnly}
							onChange={(e) => setValue(e.target.value)}
						/>
					</label>
				</>
			}
			className={styles.field}
			placeholder={admin?.placeholder ?? "#cc7722"}
			readOnly={isReadOnly}
			showError={showError}
			value={value ?? ""}
			onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
			// Same as Payload's own fields so widths inside rows line up
			style={
				{
					...admin?.style,
					...(admin?.width ? { "--field-width": admin.width } : { flex: "1 1 auto" }),
				} as React.CSSProperties
			}
		/>
	);
};

export default ColourField;
