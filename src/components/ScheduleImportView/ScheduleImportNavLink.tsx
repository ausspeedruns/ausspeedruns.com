"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ScheduleImportNavLink({ href }: { href: string }) {
	const pathname = usePathname();
	const active = pathname === href;

	return (
		<Link className="nav__link" href={href} prefetch={false}>
			{active && <div className="nav__link-indicator" />}
			<span className="nav__link-label">Schedule Import</span>
		</Link>
	);
}
