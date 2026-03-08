import { MantineProvider } from "@mantine/core";
import { HeaderThemeProvider } from "./HeaderTheme/HeaderThemeProvider";
import { ThemeProvider } from "./Theme/ThemeProvider";
import { theme } from "./MantineTheme";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<MantineProvider theme={theme}>
				<HeaderThemeProvider>{children}</HeaderThemeProvider>
			</MantineProvider>
		</ThemeProvider>
	);
}
