"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Navbar.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import Button from "../Button/Button";
import { cookies } from "next/headers";
import { signOut } from "../../auth";
import { signUserOut } from "./sign-out";

type NavbarProps = {
	events: {
		shortname: string;
		endDate?: string;
		published: boolean;
		scheduleReleased: boolean;
	}[];
	live?: string;
	noPrizes?: boolean;
	session: {
		user: {
			username: string;
		};
	} | null;
};

export function NavbarContent({ events = [], live, noPrizes, session }: NavbarProps) {
	const [isOpen, setIsOpen] = useState<Boolean>(false);

	return (
		<>
			<button className={styles.menuToggle} onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen.valueOf()}>
				{!isOpen ? <FontAwesomeIcon size="xl" icon={faBars} /> : <FontAwesomeIcon size="xl" icon={faTimes} />}
			</button>
			<nav
				className={`${styles.mainmenu} ${isOpen ? styles.menuopen : styles.menuclosed}`}
				aria-label="Main menu">
				<ul className={styles.links}>
					{events.map((event) => {
						if (!event.published || !event.scheduleReleased) return null;

						return (
							<li key={event.shortname}>
								<Link href={`/${event.shortname}/schedule`} passHref className={styles.text}>
									{events.length > 1 && `${event.shortname} `}Schedule
								</Link>
							</li>
						);
					})}

					{live && (
						<>
							<li>
								<Link href={`/${live}/incentives`} className={styles.text}>
									Incentives
								</Link>
							</li>
							{!noPrizes && (
								<li>
									<Link href={`/${live}/prizes`} className={styles.text}>
										Prizes
									</Link>
								</li>
							)}
							<li>
								<Button actionText="Donate" link="/donate" colorScheme="orange" />
							</li>
						</>
					)}

					{events.map((event) => {
						return (
							<li key={event.shortname}>
								<Link href={`/${event.shortname}`} className={styles.text}>
									{event.shortname}
								</Link>
							</li>
						);
					})}

					<li>
						<Link href="/about" className={styles.text}>
							About Us
						</Link>
					</li>
					<li>
						<Link href="/events" className={styles.text}>
							Events
						</Link>
					</li>
					<li>
						<Link href="http://ausspeedruns.theprintbar.com/" className={styles.text}>
							Merch
						</Link>
					</li>
				</ul>
			</nav>
			<div className={`${styles.auth} ${isOpen ? styles.menuopen : styles.menuclosed}`}>
				{session?.user ? (
					<>
						<Button
							actionText={session.user?.username}
							link={`/user/${session.user?.username}`}
							colorScheme={"secondary inverted"}
						/>
						<form action={signUserOut}>
							<button style={{ display: "block" }} type="submit">
								Sign Out
							</button>
						</form>
					</>
				) : (
					<span className={styles.join}>
						<Link href="/signin">Sign In</Link> | <Link href="/signup">Join</Link>
					</span>
				)}
			</div>
		</>
	);
}
