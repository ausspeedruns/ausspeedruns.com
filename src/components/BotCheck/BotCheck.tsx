"use client";

import type { Ref } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Alert, useComputedColorScheme } from "@mantine/core";

import { HONEYPOT_FIELD, type TurnstileAction } from "#utilities/botCheck/shared.ts";

import styles from "./BotCheck.module.css";

export type { TurnstileInstance };

type TurnstileFieldProps = {
	/** Null when Turnstile isn't configured in production; the form can't be submitted then. */
	siteKey: string | null;
	action: TurnstileAction;
	onTokenChange: (token: string | null) => void;
	ref?: Ref<TurnstileInstance | undefined>;
};

/** Cloudflare Turnstile challenge. Most visitors pass it automatically without clicking anything. */
export function TurnstileField({ siteKey, action, onTokenChange, ref }: TurnstileFieldProps) {
	const colorScheme = useComputedColorScheme("light");

	if (!siteKey) {
		return (
			<Alert color="yellow" variant="light">
				The verification check isn&apos;t available right now, so this form can&apos;t be submitted. Please try
				again later.
			</Alert>
		);
	}

	return (
		<Turnstile
			ref={ref}
			siteKey={siteKey}
			options={{ action, theme: colorScheme, size: "flexible" }}
			onSuccess={onTokenChange}
			onExpire={() => onTokenChange(null)}
			onError={() => onTokenChange(null)}
		/>
	);
}

/** Hidden field that only bots fill in. Kept out of the tab order and accessibility tree. */
export function HoneypotField() {
	return (
		<div className={styles.honeypot} aria-hidden="true">
			<label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
			<input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
		</div>
	);
}
