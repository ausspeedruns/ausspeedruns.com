import { cn } from "#/utilities/ui";
import * as React from "react";
import styles from "./input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	ref?: React.Ref<HTMLInputElement>;
}

function Input({ type, className, ref, ...props }: InputProps) {
	return <input className={cn(styles.input, className)} ref={ref} type={type} {...props} />;
}

export { Input };
