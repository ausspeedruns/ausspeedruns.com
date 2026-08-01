"use client";

import type { Header as HeaderType } from "#/payload-types";

import { CMSLink } from "#/components/Link/CMSLink";
import Link from "next/link";
import styles from "./Navigation.module.css";
import { useCartStore } from "#stores/useCartStore.ts";
import { ShoppingCart, Smile } from "pixelarticons/react";
import type { AuthResult } from "#utilities/authResult.ts";
import clsx from "clsx";

interface HeaderNavProps {
	data: HeaderType;
	auth?: AuthResult;
}

export function HeaderNav({ data, auth }: HeaderNavProps) {
	const cart = useCartStore((state) => state.items);
	const navItems = data?.navItems || [];

	return (
		<nav className={styles.nav}>
			{navItems.map(({ link }, i) => {
				return <CMSLink key={i} {...link} appearance="link" className={styles.link} />;
			})}

			{auth?.permissions.canAccessAdmin && (
				<Link
					href="/admin"
					rel="noopener noreferrer"
					target="_blank"
					className={clsx(styles.link, styles.admin)}
				>
					Admin Dashboard
				</Link>
			)}

			{cart.length > 0 && (
				<Link href="/cart" className={styles.link}>
					<ShoppingCart />({cart.reduce((sum, item) => sum + item.quantity, 0)})
				</Link>
			)}

			{auth?.user ? (
				<Link href={`/user/${auth.user.username}`} className={styles.link}>
					<Smile /> {auth.user.username}
				</Link>
			) : (
				<>
					<Link href="/login" className={styles.link}>
						Log in
					</Link>
					<Link href="/signup" className={styles.link}>
						Sign up
					</Link>
				</>
			)}
		</nav>
	);
}
