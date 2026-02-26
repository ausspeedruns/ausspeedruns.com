"use client";

import { cn } from "#/utilities/ui";
import * as LabelPrimitive from "@radix-ui/react-label";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import styles from "./label.module.css";

const labelVariants = cva(styles.label);

interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
	ref?: React.Ref<HTMLLabelElement>;
}

function Label({ className, ref, ...props }: LabelProps) {
	return <LabelPrimitive.Root className={cn(labelVariants(), className)} ref={ref} {...props} />;
}

export { Label };
