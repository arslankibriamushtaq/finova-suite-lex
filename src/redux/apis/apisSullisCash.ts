import axiosWalletService from "../../utils/axiosWalletService";

/**
 * SullisCash admin — the short-term cash advance product.
 *
 * Service: wallet-service, mounted on the gateway at /wallet-service.
 * `tenant_id` is read from the JWT by the backend — never send it.
 *
 * Terms are held PER CURRENCY — one config row per tenant + currency. 3,000 SAR
 * and 3,000 CAD are not the same offer, so the borrowing limit, the daily profit
 * rate, the tenure window, the quick-pick amounts and the late-penalty settings
 * all belong to one currency. A wallet is always served by the config matching
 * its own currency. Nothing is hardcoded.
 *
 * Casbin objects, deliberately separate so support staff can read the loan book
 * without being able to re-price the product:
 *   `wallet.sullis-cash.admin-config` — read / update
 *   `wallet.sullis-cash.admin-loans`  — read only
 * Both distinct from the customer-facing `wallet.sullis-cash.offer` / `.loans`.
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
  /** ISO code. Immutable — a config's terms are only ever edited in place. */
  currency: string;
  /**
   * Master switch FOR THIS CURRENCY. `false` blocks new borrowing in it;
   * repayment still works.
   */
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

/** The currency lives in the path, not the body. */
export type UpdateSullisCashConfigRequest = Omit<SullisCashConfig, "updatedAt" | "currency">;

export type SullisCashLoanStatus =
  | "ACTIVE"
  | "REPAID"
  | "OVERDUE"
  | "DEFAULTED"
  | "CANCELLED";

/** `ACTIVE` and `OVERDUE` are the ones that count against a wallet's limit. */
export const SULLIS_CASH_LOAN_STATUSES: SullisCashLoanStatus[] = [
  "ACTIVE",
  "REPAID",
  "OVERDUE",
  "DEFAULTED",
  "CANCELLED",
];

/** The borrowing wallet, enough to identify the customer without a second call. */
export interface SullisCashLoanWallet {
  walletId: string;
  /** Null on every field but `walletId` once the wallet has been purged. */
  walletNumber?: string | null;
  customerId?: string | null;
  maskedName?: string | null;
  currency?: string | null;
  status?: string | null;
}

export interface SullisCashLoan {
  id: string;
  loanNumber: string;
  walletId?: string;
  /** The currency the loan was disbursed in. Never inferred from anything else. */
  currency: string;
  principalAmount: number;
  /** The loan's OWN snapshot, taken at disbursement — not today's config. */
  dailyProfitRate: number;
  tenureDays: number;
  profitAmount: number;
  totalDue: number;
  disbursedDate: string;
  dueDate: string;
  status: SullisCashLoanStatus | string;
  /** Computed as of now while the loan is open; settled once `repaidAt` is set. */
  overdueDays?: number;
  penaltyAmount?: number;
  payoffAmount?: number;
  settledAmount?: number | null;
  penaltyDailyRate?: number;
  penaltyGraceDays?: number;
  idempotencyKey?: string;
  createdAt?: string;
  repaidAt?: string | null;
  wallet?: SullisCashLoanWallet | null;
}

export interface SullisCashLoanStats {
  currency: string;
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  /** ACTIVE + OVERDUE only. */
  outstandingPrincipal: number;
  /** Everything ever lent. */
  disbursedPrincipal: number;
}

export interface SullisCashLoanQuery {
  currency?: string;
  status?: string;
  walletId?: string;
  /** Matches the loan number, e.g. "SC1042". */
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * wallet-service returns `{ data: … }` on some routes and the bare object on
 * others. Unwrap once here so no screen has to guess which shape it got.
 */
const unwrap = <T>(body: unknown): T => {
  const envelope = body as { data?: unknown } | null | undefined;
  return (envelope && envelope.data !== undefined ? envelope.data : body) as T;
};

/**
 * Every currency this tenant already has terms for. A brand-new tenant answers
 * `[]` until a currency is fetched or saved.
 */
export async function getSullisCashConfigs(): Promise<SullisCashConfig[]> {
  const res = await axiosWalletService.get(`${BASE}/config`);
  const data = unwrap<SullisCashConfig[]>(res?.data);
  return Array.isArray(data) ? data : [];
}

/**
 * One currency's terms. Seeds the row from platform defaults on the first call,
 * so a currency nobody has touched still answers with a working set of terms —
 * this never 404s.
 */
export async function getSullisCashConfig(currency: string): Promise<SullisCashConfig> {
  const res = await axiosWalletService.get(`${BASE}/config/${encodeURIComponent(currency)}`);
  return unwrap<SullisCashConfig>(res?.data);
}

/** Creates the row if absent. Re-prices FUTURE loans in this currency only. */
export async function updateSullisCashConfig(
  currency: string,
  body: UpdateSullisCashConfigRequest
): Promise<SullisCashConfig> {
  const res = await axiosWalletService.put(
    `${BASE}/config/${encodeURIComponent(currency)}`,
    body
  );
  return unwrap<SullisCashConfig>(res?.data);
}

// ---------------------------------------------------------------------------
// Loan book — `wallet.sullis-cash.admin-loans:read`. Read-only: there is no
// admin write action on a loan, so no settle / waive / cancel exists to call.
// ---------------------------------------------------------------------------

const qs = (params: Record<string, string | number | undefined>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.append(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
};

/** Newest first. Returns the raw axios response — the caller needs `pagination`. */
export const getSullisCashLoans = (params: SullisCashLoanQuery = {}) =>
  axiosWalletService.get(
    `${BASE}/loans${qs(params as Record<string, string | number | undefined>)}`
  );

export async function getSullisCashLoan(loanId: string): Promise<SullisCashLoan> {
  const res = await axiosWalletService.get(`${BASE}/loans/${loanId}`);
  return unwrap<SullisCashLoan>(res?.data);
}

/** One row per currency that has loans. Rows are NEVER summed together. */
export async function getSullisCashLoanStats(): Promise<SullisCashLoanStats[]> {
  const res = await axiosWalletService.get(`${BASE}/loans/stats`);
  const data = unwrap<SullisCashLoanStats[]>(res?.data);
  return Array.isArray(data) ? data : [];
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

/**
 * Amounts are never rendered bare: terms and loans are per currency, so two
 * figures on one screen can belong to different ones.
 */
export const formatSullisAmount = (value: number | null | undefined, currency?: string) => {
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
