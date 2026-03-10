import { MantineProvider } from "@mantine/core";
import { HeaderThemeProvider } from "./HeaderTheme/HeaderThemeProvider";
import { theme } from "./MantineTheme";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<MantineProvider theme={theme} defaultColorScheme="auto">
			<HeaderThemeProvider>{children}</HeaderThemeProvider>
		</MantineProvider>
	);
}
