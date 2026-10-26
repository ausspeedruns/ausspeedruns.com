"use client";
import { useHeaderTheme } from "#/providers/HeaderTheme/HeaderThemeProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

import type { Header } from "#/payload-types";

import { Logo } from "#/components/Logo/Logo";
import styles from "./Header.module.css";
import { HeaderNav } from "./Nav/Navigation";

interface HeaderClientProps {
	data: Header;
}

export function HeaderClient({ data }: HeaderClientProps) {
	/* Storing the value in a useState to avoid hydration errors */
	const [theme, setTheme] = useState<string | null>(null);
	const { headerTheme, setHeaderTheme } = useHeaderTheme();
	const pathname = usePathname();

	useEffect(() => {
		setHeaderTheme(null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	useEffect(() => {
		if (headerTheme && headerTheme !== theme) setTheme(headerTheme);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [headerTheme]);

	return (
		<header className={styles.header} {...(theme ? { "data-mantine-color-scheme": theme } : {})}>
			<div className={styles.headerContent}>
				<Link href="/">
					<Logo className={styles.logo} />
				</Link>
				<HeaderNav data={data} />
			</div>
		</header>
	);
}
