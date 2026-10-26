import type { FieldErrorsImpl } from "react-hook-form";

export function getFieldError(errors: Partial<FieldErrorsImpl>, name: string): string | undefined {
	if (!errors[name]) return undefined;
	return (errors[name]?.message as string) || "This field is required";
}
