"use client";

import { useEffect, useState } from "react";
import { Button, useComputedColorScheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Comment } from "pixelarticons/react";
import styles from "./EventLiveBlock.module.css";

export const TWITCH_CHANNEL = "ausspeedruns";

/** Twitch embeds must list the embedding hostname as `parent`, which is only known in the browser. */
function useHostname(): string | null {
	const [hostname, setHostname] = useState<string | null>(null);
	useEffect(() => setHostname(window.location.hostname), []);
	return hostname;
}

export function TwitchEmbed() {
	const hostname = useHostname();
	const colorScheme = useComputedColorScheme("dark");
	const [chatOpen, setChatOpen] = useState(false);
	// Keep in sync with the chat breakpoint in EventLiveBlock.module.css. On mobile, chat only loads once opened.
	const isDesktop = useMediaQuery("(min-width: 62em)");
	const showChat = chatOpen || Boolean(isDesktop);

	const playerSrc = hostname
		? `https://player.twitch.tv/?${new URLSearchParams({ channel: TWITCH_CHANNEL, parent: hostname, autoplay: "true", muted: "false" })}`
		: null;
	const chatSrc =
		hostname && showChat
			? `https://www.twitch.tv/embed/${TWITCH_CHANNEL}/chat?${new URLSearchParams({ parent: hostname, ...(colorScheme === "dark" ? { darkpopout: "" } : {}) })}`
			: null;

	return (
		<div className={styles.stream} data-chat-open={chatOpen ? "true" : undefined}>
			<div className={styles.player}>
				{playerSrc ? (
					<iframe
						src={playerSrc}
						title={`${TWITCH_CHANNEL} live stream on Twitch`}
						allow="autoplay; fullscreen; picture-in-picture"
						allowFullScreen
					/>
				) : null}
			</div>

			<Button
				className={styles.chatToggle}
				variant="default"
				fullWidth
				leftSection={<Comment />}
				onClick={() => setChatOpen((open) => !open)}
				aria-expanded={chatOpen}
			>
				{chatOpen ? "Hide chat" : "Show chat"}
			</Button>

			<div className={styles.chat}>
				{chatSrc ? <iframe src={chatSrc} title={`${TWITCH_CHANNEL} Twitch chat`} /> : null}
			</div>
		</div>
	);
}
