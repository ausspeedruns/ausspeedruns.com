export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: "AUD",
		maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
	}).format(amount);
}

/** Rounds down to 2 significant figures and formats compactly, e.g. 1,234,567 → "$1.2M+". */
export function formatCurrencyRoundedDown(amount: number): string {
	if (amount < 1000) return formatCurrency(Math.floor(amount));

	const magnitude = 10 ** (Math.floor(Math.log10(amount)) - 1);
	const rounded = Math.floor(amount / magnitude) * magnitude;
	const formatted = new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: "AUD",
		notation: "compact",
		maximumSignificantDigits: 2,
	}).format(rounded);

	return rounded < amount ? `${formatted}+` : formatted;
}
