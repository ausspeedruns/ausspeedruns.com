"use client";

import { cn } from "#/utilities/ui";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import * as React from "react";
import styles from "./checkbox.module.css";

interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
	ref?: React.Ref<HTMLButtonElement>;
}

function Checkbox({ className, ref, ...props }: CheckboxProps) {
	return (
		<CheckboxPrimitive.Root className={cn(styles.checkbox, className)} ref={ref} {...props}>
			<CheckboxPrimitive.Indicator className={cn(styles.indicator)}>
				<Check className={styles.icon} />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
