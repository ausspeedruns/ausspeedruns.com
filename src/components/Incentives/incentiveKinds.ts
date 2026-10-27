import type { IncentiveResult } from "#/utilities/events/incentiveResults";
import { GoalProgress, GoalStatus } from "./Goal";
import type { IncentiveKind } from "./types";
import { WarProgress } from "./War";

/** Every incentive type must be registered here; TypeScript errors if one is missing. */
export const incentiveKinds: { [K in IncentiveResult["kind"]]: IncentiveKind<Extract<IncentiveResult, { kind: K }>> } =
	{
		goal: { label: "Goal", Status: GoalStatus, Body: GoalProgress },
		war: { label: "Bid War", Body: WarProgress },
	};

export function getIncentiveKind(result: IncentiveResult): IncentiveKind {
	return incentiveKinds[result.kind] as IncentiveKind;
}
