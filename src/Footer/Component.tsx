import { getCachedGlobal } from "@/utilities/getGlobals";
import Link from "next/link";

import type { Footer } from "@/payload-types";

import styles from "./Footer.module.css";
import { ThemeSelector } from "@/providers/Theme/ThemeSelector";
import { CMSLink } from "@/components/Link";
import { Logo } from "@/components/Logo/Logo";

export async function Footer() {
	const footerData: Footer = await getCachedGlobal("footer", 1)();

	const navItems = footerData?.navItems || [];

	return (
		<footer className={`mt-auto border-t border-border ${styles.container} text-white`}>
			<div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
				<Link className="flex items-center" href="/">
					<Logo />
				</Link>

				<div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
					<ThemeSelector />
					<nav className="flex flex-col md:flex-row gap-4">
						{navItems.map(({ link }, i) => {
							return <CMSLink className="text-white" key={i} {...link} />;
						})}
					</nav>
				</div>
			</div>
		</footer>
	);
}
