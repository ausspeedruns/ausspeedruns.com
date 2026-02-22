import type { Metadata } from "next";

import configPromise from "#payload-config";
import { getPayload } from "payload";
import { notFound } from "next/navigation";
import { cache } from "react";

import styles from "./page.module.css";

type Args = {
	params: Promise<{
		username: string;
	}>;
};

const stateLabels: Record<string, string> = {
	vic: "Victoria",
	nsw: "New South Wales",
	qld: "Queensland",
	wa: "Western Australia",
	sa: "South Australia",
	tas: "Tasmania",
	nt: "Northern Territory",
	act: "Australian Capital Territory",
	nz: "New Zealand",
	international: "International",
};

export default async function UserPage({ params: paramsPromise }: Args) {
	const { username } = await paramsPromise;
	const decodedUsername = decodeURIComponent(username);
	const user = await queryUserByUsername(decodedUsername);

	if (!user) {
		notFound();
	}

	const displayName = user.name || user.username;

	return (
		<article className={styles.page}>
			<div className={styles.content}>
				{/* Header */}
				<div className={styles.header}>
					<h1 className={styles.displayName}>{displayName}</h1>
					{user.name && <p className={styles.username}>@{user.username}</p>}
					{user.pronouns && <p className={styles.pronouns}>{user.pronouns}</p>}
				</div>

				{/* Info */}
				<div className={styles.sections}>
					{user.state && (
						<div>
							<h2 className={styles.sectionHeading}>Location</h2>
							<p>{stateLabels[user.state] ?? user.state}</p>
						</div>
					)}

					{/* Socials */}
					{user.socials && (user.socials.Discord || user.socials.Twitch || user.socials.Bluesky) && (
						<div>
							<h2 className={styles.sectionHeading}>Socials</h2>
							<ul className={styles.socialList}>
								{user.socials.Discord && (
									<li>
										<span className={styles.socialLabel}>Discord:</span> {user.socials.Discord}
									</li>
								)}
								{user.socials.Twitch && (
									<li>
										<span className={styles.socialLabel}>Twitch:</span>{" "}
										<a
											href={`https://twitch.tv/${user.socials.Twitch}`}
											target="_blank"
											rel="noopener noreferrer"
											className={styles.link}
										>
											{user.socials.Twitch}
										</a>
									</li>
								)}
								{user.socials.Bluesky && (
									<li>
										<span className={styles.socialLabel}>Bluesky:</span>{" "}
										<a
											href={`https://bsky.app/profile/${user.socials.Bluesky}`}
											target="_blank"
											rel="noopener noreferrer"
											className={styles.link}
										>
											{user.socials.Bluesky}
										</a>
									</li>
								)}
							</ul>
						</div>
					)}

					{/* Runs */}
					{user.speedrunData?.runs?.docs && user.speedrunData.runs.docs.length > 0 && (
						<div>
							<h2 className={styles.sectionHeading}>Runs</h2>
							<ul className={styles.runList}>
								{user.speedrunData.runs.docs.map((run) => {
									if (typeof run === "number") return null;
									return (
										<li key={run.id} className={styles.runCard}>
											<p className={styles.runGame}>{run.game}</p>
											<p className={styles.runDetails}>
												{run.category} &middot; {run.platform}
											</p>
											{run.estimate && (
												<p className={styles.runDetails}>Estimate: {run.estimate}</p>
											)}
										</li>
									);
								})}
							</ul>
						</div>
					)}
				</div>
			</div>
		</article>
	);
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
	const { username } = await paramsPromise;
	const decodedUsername = decodeURIComponent(username);
	const user = await queryUserByUsername(decodedUsername);

	if (!user) {
		return {
			title: "User Not Found",
		};
	}

	const displayName = user.name || user.username;

	return {
		title: `${displayName} | AusSpeedruns`,
		description: `${displayName}'s profile on AusSpeedruns`,
	};
}

const queryUserByUsername = cache(async (username: string) => {
	const payload = await getPayload({ config: configPromise });

	const result = await payload.find({
		collection: "users",
		limit: 1,
		pagination: false,
		overrideAccess: true,
		where: {
			username: {
				equals: username,
			},
		},
		select: {
			username: true,
			name: true,
			pronouns: true,
			state: true,
			socials: true,
			speedrunData: true,
		},
	});

	return result.docs?.[0] || null;
});
