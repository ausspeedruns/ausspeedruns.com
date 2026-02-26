import { cn } from "#/utilities/ui";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import styles from "./button.module.css";

const buttonVariants = cva(styles.button, {
	defaultVariants: {
		size: "default",
		variant: "default",
	},
	variants: {
		size: {
			clear: styles.sizeClear,
			default: styles.sizeDefault,
			icon: styles.sizeIcon,
			lg: styles.sizeLg,
			sm: styles.sizeSm,
		},
		variant: {
			default: styles.variantDefault,
			destructive: styles.variantDestructive,
			ghost: styles.variantGhost,
			link: styles.variantLink,
			outline: styles.variantOutline,
			secondary: styles.variantSecondary,
		},
	},
});

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	ref?: React.Ref<HTMLButtonElement>;
}

function Button({ asChild = false, className, size, variant, ref, ...props }: ButtonProps) {
	const Comp = asChild ? Slot : "button";
	return <Comp className={cn(buttonVariants({ className, size, variant }))} ref={ref} {...props} />;
}

export { Button, buttonVariants };
