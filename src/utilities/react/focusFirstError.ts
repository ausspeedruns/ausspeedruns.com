import type { FormErrors, LooseKeys, UseFormReturnType } from "@mantine/form";

/**
 * Moves focus to the first field with a validation error so keyboard and screen reader users land on it (and hear
 * its error message) instead of staying on the submit button. Returns false if no matching input was found.
 */
export function focusFirstError<Values>(form: UseFormReturnType<Values>, errors: FormErrors): boolean {
	for (const path of Object.keys(errors)) {
		if (!errors[path]) continue;
		const node = form.getInputNode(path as LooseKeys<Values>);
		if (node) {
			node.focus();
			return true;
		}
	}
	return false;
}
