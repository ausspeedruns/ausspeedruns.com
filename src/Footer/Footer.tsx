import { getCachedGlobal } from "#/utilities/getGlobals";
import Link from "next/link";

import type { Footer } from "#/payload-types";

import styles from "./Footer.module.css";
import { ThemeSelector } from "#/providers/Theme/ThemeSelector";
import { CMSLink } from "#/components/Link";
import { Logo } from "#/components/Logo/Logo";

export async function Footer() {
	const footerData: Footer = await getCachedGlobal("footer", 1)();

	const navItems = footerData?.navItems || [];

	return (
		<footer className={styles.footer}>
			<div className={`container ${styles.innerContainer}`}>
				<Link href="/">
					<Logo className={styles.logo} />
				</Link>

				<div className={styles.navWrapper}>
					<ThemeSelector />
					<nav className={styles.nav}>
						{navItems.map(({ link }, i) => {
							return <CMSLink className={styles.link} key={i} {...link} />;
						})}
					</nav>
				</div>
			</div>
		</footer>
	);
}
