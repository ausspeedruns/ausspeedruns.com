import { HeaderThemeProvider } from "./HeaderTheme";
import { ThemeProvider } from "./Theme";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<HeaderThemeProvider>{children}</HeaderThemeProvider>
		</ThemeProvider>
	);
}
