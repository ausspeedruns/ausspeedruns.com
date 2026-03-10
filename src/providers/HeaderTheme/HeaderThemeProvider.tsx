"use client";

import React, { createContext, useCallback, use, useState } from "react";

type HeaderTheme = "dark" | "light";

export interface ContextType {
	headerTheme?: HeaderTheme | null;
	setHeaderTheme: (theme: HeaderTheme | null) => void;
}

const initialContext: ContextType = {
	headerTheme: undefined,
	setHeaderTheme: () => null,
};

const HeaderThemeContext = createContext(initialContext);

export function HeaderThemeProvider({ children }: { children: React.ReactNode }) {
	const [headerTheme, setThemeState] = useState<HeaderTheme | undefined | null>(undefined);

	const setHeaderTheme = useCallback((themeToSet: HeaderTheme | null) => {
		setThemeState(themeToSet);
	}, []);

	return <HeaderThemeContext value={{ headerTheme, setHeaderTheme }}>{children}</HeaderThemeContext>;
}

export const useHeaderTheme = (): ContextType => use(HeaderThemeContext);
