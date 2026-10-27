"use client";

import type { Header as HeaderType } from "#/payload-types";

import { CMSLink } from "#/components/Link/CMSLink";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navigation.module.css";
import { useCartStore } from "#stores/useCartStore.ts";
import { ShoppingCart, Smile } from "pixelarticons/react";
import { useSessionStore } from "#stores/useSessionStore.ts";
import clsx from "clsx";
import { useEffect } from "react";
import { Burger, Button, Drawer } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

interface HeaderNavProps {
	data: HeaderType;
}

const DRAWER_ID = "mobile-nav-drawer";

export function HeaderNav({ data }: HeaderNavProps) {
	const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
	const user = useSessionStore((state) => state.user);
	const canAccessAdmin = useSessionStore((state) => state.canAccessAdmin);
	const sessionLoaded = useSessionStore((state) => state.loaded);
	const refreshSession = useSessionStore((state) => state.refresh);
	const navItems = data?.navItems ?? [];
	const pathname = usePathname();
	const [drawerOpened, drawer] = useDisclosure(false);
	const isDesktop = useMediaQuery("(min-width: 48em)");

	useEffect(() => {
		void refreshSession();
	}, [refreshSession]);

	useEffect(() => {
		drawer.close();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname, isDesktop]);

	const cartLink =
		cartCount > 0 ? (
			<Link
				href="/cart"
				className={styles.link}
				aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
			>
				<ShoppingCart aria-hidden />({cartCount})
			</Link>
		) : null;

	const authPendingClass = !sessionLoaded && styles.pending;

	const renderSiteLinks = (linkClassName: string) =>
		navItems.map(({ link }, i) => <CMSLink key={i} {...link} appearance="link" className={linkClassName} />);

	const adminLink = (linkClassName: string) =>
		canAccessAdmin && (
			<Link href="/admin" rel="noopener noreferrer" target="_blank" className={clsx(linkClassName, styles.admin)}>
				Admin Dashboard
			</Link>
		);

	const profileLink = (linkClassName: string) =>
		user && (
			<Link href={`/user/${user.username}`} className={linkClassName}>
				<Smile aria-hidden /> {user.username}
			</Link>
		);
	return (
		<>
			<nav className={clsx(styles.nav, styles.desktopNav)} aria-label="Main">
				{renderSiteLinks(styles.link)}
				{navItems.length > 0 && <span className={styles.divider} aria-hidden />}
				<div className={styles.accountGroup}>
					{adminLink(styles.link)}
					{cartLink}
					{user ? (
						profileLink(styles.link)
					) : (
						// Hidden (but still taking up space) until we know whether the visitor is logged in
						<>
							<Button
								component={Link}
								href="/login"
								variant="outline"
								color="white"
								size="xs"
								className={clsx(authPendingClass)}
							>
								Log in
							</Button>
							<Button
								component={Link}
								href="/signup"
								variant="white"
								size="xs"
								className={clsx(authPendingClass)}
							>
								Sign up
							</Button>
						</>
					)}
				</div>
			</nav>

			<div className={styles.mobileControls}>
				{cartLink}
				<Burger
					opened={drawerOpened}
					onClick={drawer.toggle}
					color="white"
					size="md"
					aria-label={drawerOpened ? "Close navigation menu" : "Open navigation menu"}
					aria-expanded={drawerOpened}
					aria-controls={DRAWER_ID}
				/>
			</div>

			<Drawer
				id={DRAWER_ID}
				opened={drawerOpened}
				onClose={drawer.close}
				position="right"
				size="80%"
				title="Menu"
				closeButtonProps={{ "aria-label": "Close navigation menu" }}
			>
				{/* Clicking any link closes the drawer, including links to the current page */}
				<nav
					className={styles.drawerNav}
					aria-label="Main"
					onClick={(e) => {
						if ((e.target as HTMLElement).closest("a")) drawer.close();
					}}
				>
					{renderSiteLinks(styles.drawerLink)}

					<div className={styles.drawerAccount}>
						{adminLink(styles.drawerLink)}
						{user ? (
							profileLink(styles.drawerLink)
						) : (
							<>
								<Button
									component={Link}
									href="/login"
									variant="outline"
									size="md"
									fullWidth
									className={clsx(authPendingClass)}
								>
									Log in
								</Button>
								<Button
									component={Link}
									href="/signup"
									variant="filled"
									size="md"
									fullWidth
									className={clsx(authPendingClass)}
								>
									Sign up
								</Button>
							</>
						)}
					</div>
				</nav>
			</Drawer>
		</>
	);
}
