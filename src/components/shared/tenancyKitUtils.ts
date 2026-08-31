/**
 * Formatters and tone maps for the tenant console and portal.
 *
 * Split from `tenancyKit.tsx` for the same reason `detailKitUtils` is split
 * from `detailKit`: that file must export only components so React Fast Refresh
 * can treat it as a refresh boundary.
 */

/**
 * Amounts arrive at 4 decimal places (`33000.0000`). Formatted to 2 for
 * display; never re-derived — VAT is rounded per line server-side precisely so
 * the lines sum to the total exactly.
 */
export const money = (value?: number | null, currency?: string | null) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  const formatted = Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${formatted} ${currency}` : formatted;
};

export const TENANCY_TONES: Record<string, string> = {
  ACTIVE: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  PAID: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  PROVISIONING: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  ISSUED: "border-sky-500/40 bg-sky-500/10 text-sky-600",
  DRAFT: "border-slate-500/40 bg-slate-500/10 text-slate-600",
  SUSPENDED: "border-orange-500/40 bg-orange-500/10 text-orange-600",
  CANCELLED: "border-rose-500/40 bg-rose-500/10 text-rose-600",
  FAILED: "border-rose-500/40 bg-rose-500/10 text-rose-600",
  VOID: "border-slate-500/40 bg-slate-500/10 text-slate-600",
  REFUNDED: "border-violet-500/40 bg-violet-500/10 text-violet-600",
};

