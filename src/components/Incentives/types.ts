import type { ComponentType } from "react";
import type { IncentiveResult } from "#/utilities/events/incentiveResults";

export type IncentiveCardSize = "sm" | "md";

export interface IncentiveKindProps<R extends IncentiveResult = IncentiveResult> {
	result: R;
	title: string;
	isActive: boolean;
	size: IncentiveCardSize;
}

export interface IncentiveKind<R extends IncentiveResult = IncentiveResult> {
	/** Shown as a badge in the card header. */
	label: string;
	/** Optional extra badge next to the label, e.g. "Met". */
	Status?: ComponentType<IncentiveKindProps<R>>;
	/** Type-specific content at the bottom of the card. */
	Body: ComponentType<IncentiveKindProps<R>>;
}
