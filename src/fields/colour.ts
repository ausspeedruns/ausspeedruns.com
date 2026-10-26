import type { TextField } from "payload";

import { validateColour } from "./validators.ts";

type ColourFieldOptions = Omit<Partial<TextField>, "type" | "hasMany" | "name"> & { name: string };

/** Text field holding a CSS colour, edited with a swatch + hex input in the admin. */
export function colourField({ admin, ...options }: ColourFieldOptions): TextField {
	return {
		type: "text",
		validate: (value: unknown, args: { required?: boolean }) =>
			args?.required && !value ? "This field is required." : validateColour(value),
		...options,
		admin: {
			...admin,
			components: {
				...admin?.components,
				Field: "./components/ColourField/ColourField#ColourField",
			},
		},
	} as TextField;
}
