"use client";

import { Select } from "@mantine/core";
import { useMantineColorScheme } from "@mantine/core";
import { Monitor, Moon, Sun } from "pixelarticons/react";

const icons = {
	auto: Monitor,
	light: Sun,
	dark: Moon,
};

export function ThemeSelector() {
	const { colorScheme, setColorScheme } = useMantineColorScheme();
	const Icon = icons[colorScheme] ?? Monitor;

	return (
		<Select
			aria-label="Colour scheme"
			title="Colour scheme"
			data={[
				{ value: "auto", label: "Auto theme" },
				{ value: "light", label: "Light theme" },
				{ value: "dark", label: "Dark theme" },
			]}
			value={colorScheme}
			onChange={(value) => {
				if (value === "light" || value === "dark" || value === "auto") {
					setColorScheme(value);
				}
			}}
			allowDeselect={false}
			leftSection={<Icon width={18} height={18} aria-hidden="true" />}
			leftSectionPointerEvents="none"
			w={170}
			variant="unstyled"
			styles={{ section: { color: "inherit" } }}
		/>
	);
}
