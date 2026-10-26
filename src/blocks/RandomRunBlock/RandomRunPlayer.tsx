"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@mantine/core";
import { Shuffle } from "pixelarticons/react";

import styles from "./RandomRunBlock.module.css";

/** Picks a random embed URL, avoiding `current` when there's more than one option. */
function pickRandom(embedUrls: string[], current: string | null): string | null {
	if (embedUrls.length === 0) return null;
	const options = embedUrls.length > 1 ? embedUrls.filter((url) => url !== current) : embedUrls;
	return options[Math.floor(Math.random() * options.length)] ?? null;
}

export function RandomRunPlayer({ embedUrls }: { embedUrls: string[] }) {
	// The page is statically rendered and cached, so the pick has to happen in the browser.
	const [embedUrl, setEmbedUrl] = useState<string | null>(null);

	useEffect(() => setEmbedUrl(pickRandom(embedUrls, null)), [embedUrls]);

	const reshuffle = useCallback(() => setEmbedUrl((current) => pickRandom(embedUrls, current)), [embedUrls]);

	return (
		<div className={styles.wrapper}>
			<div className={styles.player}>
				{embedUrl ? (
					<iframe
						src={embedUrl}
						title="YouTube video player"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerPolicy="strict-origin-when-cross-origin"
						allowFullScreen
					/>
				) : null}
			</div>
			{embedUrls.length > 1 && (
				<Button variant="default" leftSection={<Shuffle />} onClick={reshuffle}>
					Reshuffle
				</Button>
			)}
		</div>
	);
}
