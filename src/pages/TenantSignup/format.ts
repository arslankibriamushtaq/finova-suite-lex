import { getCurrentLanguage } from "../../utils/acceptLanguage";

/**
 * Money and date formatting for the buyer-facing screens.
 *
 * Every amount rendered in this flow comes from the server — the catalog, the
 * quote or the frozen signup. Nothing here computes a total; these helpers only
 * decide how a number the server already decided is printed.
 */

/**
 * `Intl` wants a BCP-47 tag, and the app's language codes are close enough
 * except for Arabic, where the plain "ar" locale renders Eastern Arabic
 * numerals (٣٧٬٩٥٠). Prices next to Latin-digit reference numbers read badly
 * that way, so Arabic is pinned to the Latin-digit variant.
 */
const intlLocale = (): string => {
  const lang = getCurrentLanguage();
  return lang === "ar" ? "ar-SA-u-nu-latn" : lang;
};

/** e.g. "SAR 37,950.00" — currency comes from the server, never hardcoded. */
export const formatMoney = (amount: number, currency: string): string => {
  if (!Number.isFinite(amount)) return "—";

  try {
    return new Intl.NumberFormat(intlLocale(), {
      style: "currency",
      currency: currency || "SAR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // An unknown currency code throws rather than falling back.
    return `${amount.toFixed(2)} ${currency}`;
  }
};

/** The 72-hour quote expiry, shown so a bookmarked payment page makes sense. */
export const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) return "";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  try {
    return new Intl.DateTimeFormat(intlLocale(), {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return date.toISOString();
  }
};

/** VAT rate arrives as a fraction (0.15) and is shown as a percentage. */
export const formatVatRate = (rate: number): string => {
  if (!Number.isFinite(rate)) return "";
  return String(Math.round(rate * 10000) / 100);
};
