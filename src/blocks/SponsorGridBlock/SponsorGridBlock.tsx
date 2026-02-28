import React from "react";
import type { SponsorGridBlock as SponsorGridBlockProps, Media } from "#/payload-types";
import Image from "next/image";
import styles from "./SponsorGridBlock.module.css";

export function SponsorGridBlock(props: SponsorGridBlockProps) {
	const { title, sponsors } = props;

	return (
		<div className={styles.container}>
			{title && <h2 className={styles.title}>{title}</h2>}
			{sponsors && sponsors.length > 0 ? (
				<div className={styles.grid}>
					{sponsors.map((sponsor, i) => {
						const logo = sponsor.logo as Media;
						return (
							<a
								key={sponsor.id || i}
								href={sponsor.link || undefined}
								target="_blank"
								rel="noopener noreferrer"
								className={styles.sponsorLink}
							>
								{logo?.url && (
									<Image
										src={logo.url}
										alt={sponsor.name || "Sponsor Logo"}
										width={200}
										height={100}
										className={styles.sponsorImage}
									/>
								)}
								{!logo?.url && <span>{sponsor.name}</span>}
							</a>
						);
					})}
				</div>
			) : (
				<p className={styles.noSponsors}>No sponsors added.</p>
			)}
		</div>
	);
}
