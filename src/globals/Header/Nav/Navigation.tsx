"use client";

import type { Header as HeaderType } from "#/payload-types";

import { CMSLink } from "#/components/Link/CMSLink";
import Link from "next/link";
import styles from "./Navigation.module.css";
import { useCartStore } from "#stores/useCartStore.ts";
import { ShoppingCart, Smile } from "pixelarticons/react";
import { useSessionStore } from "#stores/useSessionStore.ts";
import clsx from "clsx";
import { useEffect } from "react";

interface HeaderNavProps {
	data: HeaderType;
}

export function HeaderNav({ data }: HeaderNavProps) {
	const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
	const user = useSessionStore((state) => state.user);
	const canAccessAdmin = useSessionStore((state) => state.canAccessAdmin);
	const sessionLoaded = useSessionStore((state) => state.loaded);
	const refreshSession = useSessionStore((state) => state.refresh);
	const navItems = data?.navItems ?? [];

	useEffect(() => {
		void refreshSession();
	}, [refreshSession]);

	return (
		<nav className={styles.nav}>
			{navItems.map(({ link }, i) => {
				return <CMSLink key={i} {...link} appearance="link" className={styles.link} />;
			})}

			{canAccessAdmin && (
				<Link
					href="/admin"
					rel="noopener noreferrer"
					target="_blank"
					className={clsx(styles.link, styles.admin)}
				>
					Admin Dashboard
				</Link>
			)}

			{cartCount > 0 && (
				<Link
					href="/cart"
					className={styles.link}
					aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
				>
					<ShoppingCart aria-hidden />({cartCount})
				</Link>
			)}

			{user ? (
				<Link href={`/user/${user.username}`} className={styles.link}>
					<Smile /> {user.username}
				</Link>
			) : (
				// Hidden (but still taking up space) until we know whether the visitor is logged in
				<>
					<Link href="/login" className={clsx(styles.link, !sessionLoaded && styles.pending)}>
						Log in
					</Link>
					<Link href="/signup" className={clsx(styles.link, !sessionLoaded && styles.pending)}>
						Sign up
					</Link>
				</>
			)}
		</nav>
	);
}
