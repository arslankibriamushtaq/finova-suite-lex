import { useEffect, useState } from "react";

import i18n from "../i18n";

/**
 * Non-component half of the detail kit — formatters, tone maps and hooks.
 *
 * Kept out of `detailKit.tsx` on purpose: React Fast Refresh can only establish
 * a refresh boundary for a module whose exports are *all* components. Mixing
 * helpers in there made every edit to the kit invalidate the boundary, which
 * could leave consumers bound to a stale copy of the module ("X is not defined"
 * at render). Components live in `detailKit.tsx`; everything else lives here.
 */

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

/**
 * Intl locale for the active app language. English intentionally resolves to
 * `undefined` (browser default) so existing EN screens render exactly as before;
 * FR/AR get a real locale, with AR pinned to Gregorian + Latin digits so dates
 * stay comparable to the rest of the admin UI.
 */
const intlLocale = (): string | undefined => {
  switch ((i18n.language || "en").split("-")[0]) {
    case "fr":
      return "fr-FR";
    case "ar":
      return "ar-u-ca-gregory-nu-latn";
    default:
      return undefined;
  }
};

export const formatMoney = (value: any, currency?: string) => {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return `${currency ? currency + " " : ""}0.00`;
  const formatted = num.toLocaleString(intlLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${formatted} ${currency}` : formatted;
};

export const formatDate = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(intlLocale(), { year: "numeric", month: "short", day: "numeric" });
};

export const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(intlLocale(), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Turn a backend enum into readable text: `OTHER_BUSINESS_DOC` → `Other
 * Business Doc`. Raw SCREAMING_SNAKE codes should never reach the UI.
 *
 * Short all-caps runs that are genuine acronyms (`ID`, `KYC`, `PEP`, `CIF`,
 * `SME`, `NID`) are preserved rather than title-cased into `Id` / `Kyc`.
 */
const ACRONYMS = new Set(["ID", "KYC", "PEP", "CIF", "SME", "NID", "IBAN", "TIN", "VAT", "PDF"]);

export const humanizeCode = (code?: string): string => {
  if (!code) return "";
  const raw = String(code).trim();
  if (!raw) return "";
  // Already human (has lowercase and spaces)? Leave it alone.
  if (/[a-z]/.test(raw) && raw.includes(" ")) return raw;
  return raw
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const upper = word.toUpperCase();
      if (ACRONYMS.has(upper)) return upper;
      return upper.charAt(0) + upper.slice(1).toLowerCase();
    })
    .join(" ");
};

/* ------------------------------------------------------------------ */
/* Tone / status helpers                                               */
/* ------------------------------------------------------------------ */

export const TONES: Record<string, string> = {
  emerald:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  amber:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  sky: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
  orange:
    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30",
  red: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  slate:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
};

export const TONE_HEX: Record<string, string> = {
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  sky: "#0ea5e9",
  slate: "#94a3b8",
};

export const statusTone = (status?: string): string => {
  switch ((status || "").toUpperCase()) {
    case "ACTIVE":
    case "COMPLETED":
    case "APPROVED":
    case "VERIFIED":
    case "SUCCESS":
      return "emerald";
    case "PENDING":
    case "PENDING_ACTIVATION":
    case "PENDING_REVIEW":
    case "IN_PROGRESS":
      return "amber";
    case "FROZEN":
      return "sky";
    case "SUSPENDED":
      return "orange";
    case "FAILED":
    case "REJECTED":
    case "CLOSED":
    case "BLOCKED":
      return "red";
    default:
      return "slate";
  }
};

export const riskTone = (level?: string): string => {
  switch ((level || "").toUpperCase()) {
    case "LOW":
      return "emerald";
    case "MEDIUM":
      return "amber";
    case "HIGH":
    case "CRITICAL":
      return "red";
    default:
      return "slate";
  }
};

/**
 * Numeric risk score, wherever this backend version put it. Several payload
 * shapes are in play (`riskInfo.riskScore`, a bare `riskScore`, and
 * `riskCalculation.totalScore`), and some records carry only a level with no
 * score at all — hence `null` rather than a 0 default, so callers can tell
 * "no score" apart from "scored zero".
 */
export const resolveRiskScore = (risk: any): number | null => {
  const candidates = [
    risk?.riskInfo?.riskScore,
    risk?.riskScore,
    risk?.riskCalculation?.totalScore,
    risk?.riskCalculation?.score,
    risk?.riskInfo?.score,
  ];
  for (const c of candidates) {
    if (c != null && c !== "" && !Number.isNaN(Number(c))) return Number(c);
  }
  return null;
};

/** Risk level, tolerant of the same nesting variance as the score. */
export const resolveRiskLevel = (risk: any): string | undefined =>
  risk?.riskInfo?.riskLevel ||
  risk?.riskLevel ||
  risk?.riskCalculation?.riskLevel ||
  risk?.riskInfo?.riskGrade ||
  undefined;

export const chartTooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--foreground)",
  fontSize: 12,
  boxShadow: "var(--surface-elevation-2, 0 4px 12px rgba(0,0,0,0.12))",
};

/* ------------------------------------------------------------------ */
/* Tab transition                                                      */
/* ------------------------------------------------------------------ */

/** How long the placeholder stays up after a tab switch, in ms. */
export const TAB_SWITCH_MS = 320;

/**
 * Tab state plus a short `switching` window after every change. Radix only
 * mounts the active panel, so rendering a skeleton while `switching` is true
 * swaps out the tab body alone — the header band and tab bar never flicker.
 */
export const useTabTransition = (initial: string) => {
  const [activeTab, setTab] = useState(initial);
  const [switching, setSwitching] = useState(false);

  const setActiveTab = (next: string) => {
    if (!next || next === activeTab) return;
    setTab(next);
    setSwitching(true);
  };

  useEffect(() => {
    if (!switching) return;
    const id = setTimeout(() => setSwitching(false), TAB_SWITCH_MS);
    return () => clearTimeout(id);
  }, [switching, activeTab]);

  return { activeTab, setActiveTab, switching };
};
