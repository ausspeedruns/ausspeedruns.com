"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button, Group } from "@mantine/core";
import { User, ArrowLeft, Box, MemoryStick, Joystick, HumanArmsUp } from "pixelarticons/react";

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
		</nav>
	);
}
