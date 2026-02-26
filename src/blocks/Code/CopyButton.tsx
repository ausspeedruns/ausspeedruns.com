"use client";
import { Button } from "#/components/ui/button";
import { CopyIcon } from "@payloadcms/ui/icons/Copy";
import { useState } from "react";

import styles from "./CopyButton.module.css";

export function CopyButton({ code }: { code: string }) {
	const [text, setText] = useState("Copy");

	function updateCopyStatus() {
		if (text === "Copy") {
			setText(() => "Copied!");
			setTimeout(() => {
				setText(() => "Copy");
			}, 1000);
		}
	}

	return (
		<div className={styles.container}>
			<Button
				className={styles.button}
				variant={"secondary"}
				onClick={async () => {
					await navigator.clipboard.writeText(code);
					updateCopyStatus();
				}}
			>
				<p>{text}</p>
				<CopyIcon />
			</Button>
		</div>
	);
}
