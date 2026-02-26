"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import React, { useState } from "react";

import type { Theme } from "./types";

import { useTheme } from "..";
import { themeLocalStorageKey } from "./types";

import styles from "./index.module.css";

export function ThemeSelector() {
	const { setTheme } = useTheme();
	const [value, setValue] = useState("");

	const onThemeChange = (themeToSet: Theme & "auto") => {
		if (themeToSet === "auto") {
			setTheme(null);
			setValue("auto");
		} else {
			setTheme(themeToSet);
			setValue(themeToSet);
		}
	};

	React.useEffect(() => {
		const preference = window.localStorage.getItem(themeLocalStorageKey);
		setValue(preference ?? "auto");
	}, []);

	return (
		<Select onValueChange={onThemeChange} value={value}>
			<SelectTrigger aria-label="Select a theme" className={styles.trigger}>
				<SelectValue placeholder="Theme" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="auto">Auto</SelectItem>
				<SelectItem value="light">Light</SelectItem>
				<SelectItem value="dark">Dark</SelectItem>
			</SelectContent>
		</Select>
	);
}
