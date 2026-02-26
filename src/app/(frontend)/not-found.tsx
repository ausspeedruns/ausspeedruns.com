import Link from "next/link";

import { Button } from "#/components/ui/button";
import styles from "./not-found.module.css";

export default function NotFound() {
	return (
		<div className={`container ${styles.container}`}>
			<div className={styles.content}>
				<h1 className={styles.title}>404</h1>
				<p className={styles.description}>This page could not be found.</p>
			</div>
			<Button asChild variant="default">
				<Link href="/">Go home</Link>
			</Button>
		</div>
	);
}
