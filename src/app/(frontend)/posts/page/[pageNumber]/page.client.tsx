"use client";
import { useHeaderTheme } from "#/providers/HeaderTheme/HeaderThemeProvider";
import React, { useEffect } from "react";

export default function PageClient() {
	/* Force the header to be dark mode while we have an image behind it */
	const { setHeaderTheme } = useHeaderTheme();

	useEffect(() => {
		setHeaderTheme("light");
	}, [setHeaderTheme]);
	return <React.Fragment />;
}
