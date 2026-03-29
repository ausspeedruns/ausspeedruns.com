"use client";

import type { Header as HeaderType } from "#/payload-types";

import { CMSLink } from "#/components/Link/CMSLink";
import Link from "next/link";
import { Button } from "#/components/ui/button";
import type { AuthResult } from "node_modules/payload/dist/auth/operations/auth";
import styles from "./Navigation.module.css";
import { useCartStore } from "#stores/useCartStore.ts";
import { ShoppingCart } from "pixelarticons/react";
// import { SearchIcon } from "lucide-react";

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
				return <CMSLink key={i} {...link} appearance="link" />;
			})}
			{auth?.permissions.canAccessAdmin && (
				<Button asChild size="clear" variant="link">
					<Link href="/admin" rel="noopener noreferrer" target="_blank">
						Dashboard
					</Link>
				</Button>
			)}
			{/* <Link href="/search">
				<span className={styles.srOnly}>Search</span>
				<SearchIcon className={styles.searchIcon} />
			</Link> */}
			{cart.length > 0 && (
				<Button asChild size="clear" variant="link">
					<Link href="/cart" className={styles.authLink}>
						<ShoppingCart />({cart.reduce((sum, item) => sum + item.quantity, 0)})
					</Link>
				</Button>
			)}

			{auth?.user ? (
				<Button asChild size="clear" variant="link">
					<Link href={`/user/${auth.user.username}`} rel="noopener noreferrer" target="_blank">
						{auth.user.username}
					</Link>
				</Button>
			) : (
				<>
					<Button asChild size="clear" variant="link">
						<Link href="/login" className={styles.authLink}>
							Log in
						</Link>
					</Button>
					<Button asChild size="clear" variant="link">
						<Link href="/signup" className={styles.authLink}>
							Sign up
						</Link>
					</Button>
				</>
			)}
		</nav>
	);
}
