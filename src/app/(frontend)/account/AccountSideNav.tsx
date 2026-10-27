"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button, Group, Text } from "@mantine/core";
import { User, ArrowLeft, Box, MemoryStick, Joystick, HumanArmsUp, Logout } from "pixelarticons/react";

import { useSessionStore } from "#stores/useSessionStore.ts";
import classes from "./AccountSideNav.module.css";

const navItems = [
	{ label: "Edit", href: "/account/edit", icon: User },
	{ label: "Tickets", href: "/account/tickets", icon: MemoryStick },
	{ label: "Run Submissions", href: "/account/submissions", icon: Joystick },
	{ label: "Volunteer Applications", href: "/account/volunteer", icon: HumanArmsUp },
	{ label: "Orders", href: "/account/orders", icon: Box },
];

interface AccountSideNavProps {
	username: string;
}

export function AccountSideNav(props: AccountSideNavProps) {
	const pathname = usePathname();
	const router = useRouter();
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [logoutError, setLogoutError] = useState<string | null>(null);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		setLogoutError(null);

		try {
			const response = await fetch("/api/users/logout", { method: "POST", credentials: "include" });
			if (!response.ok) throw new Error(`Logout failed with status ${response.status}`);

			// Update the header and admin bar, which load the session client-side
			await useSessionStore.getState().refresh();
			router.push("/");
			router.refresh();
		} catch {
			setLogoutError("Unable to log out right now. Please try again.");
			setIsLoggingOut(false);
		}
	};

	return (
		<nav className={classes.navbar} aria-label="Account navigation">
			<div className={classes.navbarMain}>
				<Group className={classes.header} justify="space-between">
					<div>{props.username}</div>
					<Button href={`/user/${props.username}`} className={classes.link} component="a">
						<ArrowLeft className={classes.linkIcon} strokeWidth={1.5} />
						<span>Back</span>
					</Button>
				</Group>

				{navItems.map((item) => (
					<Link
						className={classes.link}
						data-active={pathname.startsWith(item.href) || undefined}
						key={item.label}
						href={item.href}
					>
						<item.icon className={classes.linkIcon} strokeWidth={1.5} />
						<span>{item.label}</span>
					</Link>
				))}
			</div>

			<div className={classes.footer}>
				<button type="button" className={classes.link} onClick={handleLogout} disabled={isLoggingOut}>
					<Logout className={classes.linkIcon} strokeWidth={1.5} aria-hidden />
					<span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
				</button>
				{logoutError && (
					<Text c="red" size="sm" role="alert">
						{logoutError}
					</Text>
				)}
			</div>
		</nav>
	);
}
