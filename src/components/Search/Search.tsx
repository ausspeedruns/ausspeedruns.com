"use client";
import { TextInput } from "@mantine/core";
import React, { useState, useEffect } from "react";
import { useDebounce } from "#/utilities/react/useDebounce";
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
				<TextInput
					id="search"
					label="Search"
					labelProps={{ className: styles.srOnly }}
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
