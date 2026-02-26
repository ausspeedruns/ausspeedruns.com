import { cn } from "#/utilities/ui";
import * as React from "react";
import styles from "./textarea.module.css";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	ref?: React.Ref<HTMLTextAreaElement>;
}

function Textarea({ className, ref, ...props }: TextareaProps) {
	return <textarea className={cn(styles.textarea, className)} ref={ref} {...props} />;
}

export { Textarea };
