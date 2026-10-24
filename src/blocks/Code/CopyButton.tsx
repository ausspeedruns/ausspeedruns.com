"use client";
import { Button } from "@mantine/core";
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
				variant="default"
				rightSection={<CopyIcon />}
				onClick={async () => {
					await navigator.clipboard.writeText(code);
					updateCopyStatus();
				}}
			>
				{text}
			</Button>
		</div>
	);
}
