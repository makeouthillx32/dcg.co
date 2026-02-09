export function formatMoney(cents: number, currency: string = "USD") {
  const amount = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    // fallback if currency is weird
    return `$${amount.toFixed(2)}`;
  }
}
