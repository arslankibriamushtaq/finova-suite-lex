/**
 * Normalises a typed or pasted number to plain ASCII digits.
 *
 * Two things this defends against, both of which the server rejects with
 * `COMMON.VALIDATION.FAILED` and neither of which is the buyer's mistake:
 *
 *  1. **Formatting.** A CR or VAT number copied off a certificate or an email
 *     arrives as "1010-101010" or "1010 101010". Rejecting that and asking
 *     someone to retype what they just pasted is a bad trade when we can
 *     simply drop the separators.
 *  2. **Arabic-Indic numerals.** On an Arabic keyboard, ١٠١٠١٠١٠١٠ is what
 *     typing the digits produces. JavaScript's `\d` matches ASCII only, so
 *     those fail every check in the flow despite being the right number —
 *     an Arabic-first product cannot ship that.
 */

/** U+0660–0669 (Arabic-Indic) and U+06F0–06F9 (Extended, used in Persian/Urdu). */
const EASTERN_DIGITS = /[٠-٩۰-۹]/g;

const toAscii = (char: string): string => {
  const code = char.codePointAt(0) ?? 0;
  const base = code >= 0x06f0 ? 0x06f0 : 0x0660;
  return String((code - base) % 10);
};

export const normalizeDigits = (value: string): string =>
  value.replace(EASTERN_DIGITS, toAscii).replace(/\D/g, "");
