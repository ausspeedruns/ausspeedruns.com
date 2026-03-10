"use client";

import { Select } from "@mantine/core";
import { useMantineColorScheme } from "@mantine/core";

export function ThemeSelector() {
	const { colorScheme, setColorScheme } = useMantineColorScheme();

	return (
		<Select
			aria-label="Select a theme"
			data={[
				{ value: "auto", label: "Auto" },
				{ value: "light", label: "Light" },
				{ value: "dark", label: "Dark" },
			]}
			value={colorScheme}
			onChange={(value) => {
				if (value === "light" || value === "dark" || value === "auto") {
					setColorScheme(value);
				}
			}}
			w={100}
			variant="unstyled"
		/>
	);
}
