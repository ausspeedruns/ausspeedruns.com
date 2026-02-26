"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";

import styles from "./Error.module.css";

interface ErrorProps {
	name: string;
}

export function Error({ name }: ErrorProps) {
	const {
		formState: { errors },
	} = useFormContext();
	return <div className={styles.error}>{(errors[name]?.message as string) || "This field is required"}</div>;
}
