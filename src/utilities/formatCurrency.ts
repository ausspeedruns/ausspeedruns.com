export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: "AUD",
		maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
	}).format(amount);
}
