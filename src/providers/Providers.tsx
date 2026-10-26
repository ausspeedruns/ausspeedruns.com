import { MantineProvider } from "@mantine/core";
import { HeaderThemeProvider } from "./HeaderTheme/HeaderThemeProvider";
import { theme } from "./MantineTheme";
import { CartHydrator } from "./CartHydrator";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<MantineProvider theme={theme} defaultColorScheme="auto">
			<CartHydrator />
			<HeaderThemeProvider>{children}</HeaderThemeProvider>
		</MantineProvider>
	);
}
