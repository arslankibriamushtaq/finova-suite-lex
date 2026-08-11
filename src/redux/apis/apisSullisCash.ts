import axiosWalletService from "../../utils/axiosWalletService";

/**
 * SullisCash admin — the short-term cash advance product.
 *
 * Service: wallet-service, mounted on the gateway at /wallet-service.
 * `tenant_id` is read from the JWT by the backend — never send it.
 *
 * ONE config row per tenant holds every term the product runs on: the borrowing
 * limit, the daily profit rate, the tenure window, the quick-pick amounts the
 * app shows, and the late-penalty settings. Nothing is hardcoded.
 *
 * Casbin object `wallet.sullis-cash.admin-config` (read / update) — separate
 * from the customer-facing `wallet.sullis-cash.offer` / `.loans`.
 *
 * How the money works:
 *   Disbursement  wallet is CREDITED with the principal
 *   Profit        principal × dailyProfitRate% × tenureDays — fixed at disbursement
 *   Repayment     wallet is DEBITED for principal + profit + penalty, in ONE lump sum
 *   Late penalty  principal × penaltyDailyRate% × (overdueDays − penaltyGraceDays)
 *
 * Terms are SNAPSHOTTED onto each loan at disbursement, so editing this config
 * re-prices future loans only — never one a customer has already taken.
 */

const BASE = "/api/v1/sullis-cash/admin";

export interface SullisCashConfig {
  /** Master switch. `false` blocks new borrowing; repayment still works. */
  enabled: boolean;
  minLoanAmount: number;
  /**
   * The borrowing limit. Enforced on TOTAL outstanding principal across a
   * wallet's open loans, not per loan.
   */
  maxLoanAmount: number;
  /** The chips the app offers. Each must sit inside [min, max] loan amount. */
  quickAmounts: number[];
  /** Whole-number percent PER DAY, e.g. 0.0833 ≈ 5% over 60 days. */
  dailyProfitRate: number;
  minTenureDays: number;
  maxTenureDays: number;
  /** Used when the app omits a tenure; must sit inside the tenure window. */
  defaultTenureDays: number;
  /** Whole-number percent of principal per overdue day. */
  penaltyDailyRate: number;
  /** Free days after the due date before the penalty starts accruing. */
  penaltyGraceDays: number;
  updatedAt?: string;
}

export type UpdateSullisCashConfigRequest = Omit<SullisCashConfig, "updatedAt">;

/**
 * wallet-service returns `{ data: … }` on some routes and the bare object on
 * others. Unwrap once here so no screen has to guess which shape it got.
 */
const unwrap = <T>(body: unknown): T => {
  const envelope = body as { data?: unknown } | null | undefined;
  return (envelope && envelope.data !== undefined ? envelope.data : body) as T;
};

/** The tenant's config, seeded from platform defaults on the first call. */
export async function getSullisCashConfig(): Promise<SullisCashConfig> {
  const res = await axiosWalletService.get(`${BASE}/config`);
  return unwrap<SullisCashConfig>(res?.data);
}

export async function updateSullisCashConfig(
  body: UpdateSullisCashConfigRequest
): Promise<SullisCashConfig> {
  const res = await axiosWalletService.put(`${BASE}/config`, body);
  return unwrap<SullisCashConfig>(res?.data);
}

// ---------------------------------------------------------------------------
// Helpers shared by the SullisCash screens
// ---------------------------------------------------------------------------

/** As much of an axios failure as these screens actually read. */
interface ApiFailure {
  response?: { status?: number; data?: { message?: string } };
}

/** The API's own message when it sent one, else the caller's translated text. */
export const sullisCashErrorMessage = (error: unknown, fallback: string): string =>
  (error as ApiFailure)?.response?.data?.message || fallback;

/** SullisCash is a SAR product, so the currency code is fixed. */
export const formatSullisAmount = (value: number | null | undefined, currency = "SAR") => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  const amount = Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${amount}` : amount;
};

/**
 * Rates arrive over-padded (`0.083300`). Trim to what was actually set rather
 * than rendering trailing zeros that imply precision nobody entered.
 */
export const formatRatePercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  // Up to 6dp covers the daily rates in play without going exponential.
  return `${Number(Number(value).toFixed(6))}%`;
};

/** Round the way the backend does — 2dp, half up — so no preview can disagree. */
const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** principal × dailyProfitRate% × tenureDays — fixed at disbursement. */
export const sullisCashProfit = (
  principal: number,
  dailyProfitRate: number,
  tenureDays: number
): number => {
  if (![principal, dailyProfitRate, tenureDays].every(Number.isFinite)) return 0;
  return round2((principal * dailyProfitRate * tenureDays) / 100);
};

/** What the customer repays in one lump sum, before any late penalty. */
export const sullisCashTotalDue = (
  principal: number,
  dailyProfitRate: number,
  tenureDays: number
): number => round2(principal + sullisCashProfit(principal, dailyProfitRate, tenureDays));

/** The effective rate over the whole tenure — the number a customer compares. */
export const sullisCashTotalRate = (dailyProfitRate: number, tenureDays: number): number => {
  if (![dailyProfitRate, tenureDays].every(Number.isFinite)) return 0;
  return Number((dailyProfitRate * tenureDays).toFixed(4));
};

/** principal × penaltyDailyRate% — what one overdue day past grace costs. */
export const sullisCashPenaltyPerDay = (principal: number, penaltyDailyRate: number): number => {
  if (![principal, penaltyDailyRate].every(Number.isFinite)) return 0;
  return round2((principal * penaltyDailyRate) / 100);
};

/** principal × penaltyDailyRate% × (overdueDays − graceDays), never negative. */
export const sullisCashPenalty = (
  principal: number,
  penaltyDailyRate: number,
  overdueDays: number,
  penaltyGraceDays: number
): number => {
  const chargeableDays = Math.max(0, (overdueDays || 0) - (penaltyGraceDays || 0));
  return round2(sullisCashPenaltyPerDay(principal, penaltyDailyRate) * chargeableDays);
};
