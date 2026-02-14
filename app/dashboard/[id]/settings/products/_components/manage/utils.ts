export function centsToMoney(cents: number, currency: string = "USD") {
  const amt = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amt);
  } catch {
    return `$${amt.toFixed(2)}`;
  }
}

export function moneyToCents(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: { code: "NON_JSON_RESPONSE", message: text.slice(0, 300) } };
  }
}

export function fileExt(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "jpg";
}

export function randId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}