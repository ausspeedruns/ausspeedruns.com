"use client";

import React, { useCallback, useMemo, useState } from "react";
import { toast, useDocumentInfo } from "@payloadcms/ui";

import styles from "./GeneratePostEventPageButton.module.css";

interface GenerateResult {
	action: "created" | "updated";
	adminPath: string;
	pageID: number | string;
	success: boolean;
}

export default function GeneratePostEventPageButton() {
	const { id } = useDocumentInfo();
	const [isLoading, setIsLoading] = useState(false);

	const hasEventID = useMemo(() => id !== undefined && id !== null && String(id).length > 0, [id]);

	const generatePage = useCallback(async () => {
		if (!hasEventID || isLoading) {
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch("/next/events/generate-post-event-page", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ eventId: id }),
			});

			if (!response.ok) {
				throw new Error("Failed to generate the post-event page.");
			}

			const result = (await response.json()) as GenerateResult;
			const actionLabel = result.action === "created" ? "created" : "updated";
			toast.success(`Post-event page ${actionLabel}.`);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to generate the post-event page.";
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	}, [hasEventID, id, isLoading]);

	if (!hasEventID) {
		return <p className={styles.helpText}>Save this event first, then generate a post-event page.</p>;
	}

	return (
		<div className={styles.wrapper}>
			<button className={styles.button} disabled={isLoading} onClick={generatePage} type="button">
				{isLoading ? "Generating..." : "Generate Post-Event Page"}
			</button>
			<p className={styles.helpText}>Creates or updates one linked page with recap blocks and quick stats.</p>
		</div>
	);
}
