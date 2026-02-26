import { HeaderThemeProvider } from "./HeaderTheme/HeaderThemeProvider";
import { ThemeProvider } from "./Theme/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<HeaderThemeProvider>{children}</HeaderThemeProvider>
		</ThemeProvider>
	);
}
