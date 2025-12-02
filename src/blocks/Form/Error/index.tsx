"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";

interface ErrorProps {
	name: string;
}

export function Error({ name }: ErrorProps) {
	const {
		formState: { errors },
	} = useFormContext();
	return (
		<div className="mt-2 text-red-500 text-sm">{(errors[name]?.message as string) || "This field is required"}</div>
	);
}
