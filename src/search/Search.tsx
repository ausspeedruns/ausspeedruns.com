"use client";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import React, { useState, useEffect } from "react";
import { useDebounce } from "#/utilities/useDebounce";
import { useRouter } from "next/navigation";

import styles from "./Search.module.css";

export function Search() {
	const [value, setValue] = useState("");
	const router = useRouter();

	const debouncedValue = useDebounce(value);

	useEffect(() => {
		router.push(`/search${debouncedValue ? `?q=${debouncedValue}` : ""}`);
	}, [debouncedValue, router]);

	return (
		<div>
			<form
				onSubmit={(e) => {
					e.preventDefault();
				}}
			>
				<Label htmlFor="search" className={styles.srOnly}>
					Search
				</Label>
				<Input
					id="search"
					onChange={(event) => {
						setValue(event.target.value);
					}}
					placeholder="Search"
				/>
				<button type="submit" className={styles.srOnly}>
					submit
				</button>
			</form>
		</div>
	);
}
