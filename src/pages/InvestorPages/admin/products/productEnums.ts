/**
 * The portfolio service names its product enums — `productStatus: "ACTIVE"`,
 * `productCategory: "ALTERNATIVE_INVESTMENTS"`, `riskLevel: "LOW"` — where the
 * screens were written against the ordinals they still post back. A page that
 * assumed the number rendered "Unknown", or fell to the first option of a
 * picker, for every record.
 *
 * These maps are the one place that knows both spellings. Read through
 * `enumToNumber` on the way in; keep sending the ordinals on the way out until
 * the write endpoints take names too.
 */

export const PRODUCT_STATUSES: Record<string, number> = {
  ACTIVE: 0,
  INACTIVE: 1,
  CLOSED: 2,
  SUSPENDED: 3,
  LAUNCHING: 4,
};

export const PRODUCT_CATEGORIES: Record<string, number> = {
  EQUITY: 0,
  FIXED_INCOME: 1,
  REAL_ESTATE: 2,
  COMMODITIES: 3,
  MUTUAL_FUNDS: 4,
  ETF: 5,
  CRYPTO: 6,
  CRYPTOCURRENCY: 6,
  ALTERNATIVE_INVESTMENTS: 7,
  CASH: 8,
};

export const PROFIT_FREQUENCIES: Record<string, number> = {
  QUARTERLY: 0,
  SEMI_ANNUALLY: 1,
  SEMIANNUALLY: 1,
  ANNUALLY: 2,
  YEARLY: 2,
  ON_MATURITY: 3,
  MATURITY: 3,
};

export const RISK_LEVELS: Record<string, number> = {
  LOW: 0,
  MEDIUM: 1,
  MODERATE: 1,
  HIGH: 2,
  VERY_HIGH: 3,
  EXTREME: 4,
};

/** The form's tenure-unit picker is keyed by these strings, not by an ordinal. */
export const TENURE_UNITS: Record<string, string> = {
  '1': 'Months',
  '2': 'Years',
  '3': 'Days',
  MONTHS: 'Months',
  YEARS: 'Years',
  DAYS: 'Days',
  MONTH: 'Months',
  YEAR: 'Years',
  DAY: 'Days',
};

/**
 * An enum that may arrive as its ordinal, as a numeric string, or as its name.
 * Anything unrecognised falls back to `fallback` (0 by default, which is the
 * first member of every one of these enums).
 */
export const enumToNumber = (
  value: unknown,
  names: Record<string, number>,
  fallback = 0
): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed !== '' && !Number.isNaN(Number(trimmed))) return Number(trimmed);
    const mapped = names[trimmed.toUpperCase()];
    if (mapped !== undefined) return mapped;
  }
  return fallback;
};

export const tenureUnitOf = (value: unknown): string =>
  TENURE_UNITS[String(value ?? '').toUpperCase()] || TENURE_UNITS[String(value)] || '0';

/**
 * `MEDIUM_TERM` -> `Medium Term`. The duration has no ordinal map to fall back
 * on — a page that printed it raw showed the constant, and one that assumed
 * months printed "MEDIUM_TERM months".
 */
export const humaniseEnum = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '';
  return String(value)
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
