import type { Goal, War } from "#utilities/schedule/incentives.ts";

interface BaseIncentive {
	id: number;
	title: string;
	description: string | null;
	isActive: boolean;
	run: {
		name: string;
		category: string;
		scheduledTime: string | null;
	} | null;
}

export type GoalIncentive = BaseIncentive & { type: "goal"; data: Goal };
export type WarIncentive = BaseIncentive & { type: "war"; data: War };
export type IncentiveItem = GoalIncentive | WarIncentive;

const currencyOptions = { style: "currency", currency: "AUD", currencyDisplay: "narrowSymbol" } as const;
const wholeDollarFormatter = new Intl.NumberFormat("en-AU", { ...currencyOptions, maximumFractionDigits: 0 });
const centsFormatter = new Intl.NumberFormat("en-AU", { ...currencyOptions, minimumFractionDigits: 2 });

export function formatMoney(value: number): string {
	return (Number.isInteger(value) ? wholeDollarFormatter : centsFormatter).format(value);
}
