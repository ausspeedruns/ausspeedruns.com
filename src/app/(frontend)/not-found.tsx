import { ButtonLink } from "#/components/Link/ButtonLink";
import styles from "./not-found.module.css";

const responses = [
	<h2>Seems like you clipped out of bounds.</h2>,
	<h2>Seems you have become QPU mis-aligned.</h2>,
	<h2>You are at the same place that the ASM2015 videos are - lost.</h2>,
];

export default function NotFound() {
	return (
		<main className={`container ${styles.container}`}>
			<div className={styles.content}>
				<h1 className={styles.title}>404</h1>
				{responses[Math.floor(Math.random() * responses.length)]}
				<p className={styles.description}>This page could not be found.</p>
			</div>
			<ButtonLink href="/">Go home</ButtonLink>
		</main>
	);
}
