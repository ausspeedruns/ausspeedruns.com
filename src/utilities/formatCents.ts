const currencyFormatter = new Intl.NumberFormat("en-AU", {
	style: "currency",
	currency: "AUD",
});

export function formatCents(amountInCents?: number | null): string {
	return currencyFormatter.format((typeof amountInCents === "number" ? amountInCents : 0) / 100);
}
