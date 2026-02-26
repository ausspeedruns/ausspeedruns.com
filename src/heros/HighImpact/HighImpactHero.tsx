"use client";
import { useHeaderTheme } from "#/providers/HeaderTheme/HeaderThemeProvider";
import React, { useEffect } from "react";

import type { Page } from "#/payload-types";

import { CMSLink } from "#/components/Link/CMSLink";
import { Media } from "#/components/Media/Media";
import RichText from "#/components/RichText/RichText";

import styles from "./HighImpactHero.module.css";

export function HighImpactHero({ links, media, richText }: Page["hero"]) {
	const { setHeaderTheme } = useHeaderTheme();

	useEffect(() => {
		setHeaderTheme("dark");
	});

	return (
		<div className={styles.hero} data-theme="dark">
			<div className={styles.container}>
				<div className={styles.content}>
					{richText && <RichText className={styles.richText} data={richText} enableGutter={false} />}
					{Array.isArray(links) && links.length > 0 && (
						<ul className={styles.links}>
							{links.map(({ link }, i) => {
								return (
									<li key={i}>
										<CMSLink {...link} />
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</div>
			<div className={styles.mediaContainer}>
				{media && typeof media === "object" && (
					<Media fill imgClassName={styles.mediaImage} priority resource={media} />
				)}
			</div>
		</div>
	);
}
