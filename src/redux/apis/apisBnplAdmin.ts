import axiosWalletService from "../../utils/axiosWalletService";

/**
 * BNPL admin — the per-currency borrowing limits and the dynamic
 * Buy-Now-Pay-Later category catalog.
 *
 * Service: wallet-service, mounted on the gateway at /wallet-service.
 * `tenant_id` is read from the JWT by the backend — never send it.
 *
 * Everything here is per currency. A currency limit says how much a wallet in
 * that currency may owe across all its open purchases; a currency with no row,
 * or a disabled row, does not offer BNPL at all — there is no global fallback.
 * Every category belongs to one currency, so its min/max are denominated in
 * something real, and a customer only ever sees the categories matching their
 * own wallet's currency.
 *
 * Categories (Easyload, Mobile Package, Utility Bill, …) are plain data rows,
 * nothing is hardcoded: an admin creates them and controls the purchase band,
 * the service fee and the repayment window.
 *
 * Casbin objects `wallet.bnpl.admin-currency-limits` (read / update) and
 * `wallet.bnpl.admin-categories` (create / update / delete / read) — both
 * deliberately separate from the customer-facing `wallet.bnpl.categories`, so
 * browse-only access can never see admin fields or inactive rows.
 */

const BASE = "/api/v1/bnpl/admin/categories";
const LIMITS_BASE = "/api/v1/bnpl/admin/currency-limits";

/** FLAT = a flat amount in the category's currency; PERCENT = whole-number percent (2 = 2%). */
export type BnplFeeType = "FLAT" | "PERCENT";

export type BnplCategoryStatus = "ACTIVE" | "INACTIVE";

/** Only these three exist today — a dropdown type is a backend ask, not a client-side list. */
export type BnplFieldType = "TEXT" | "NUMBER" | "MOBILE";

/**
 * One input the customer must fill in when buying from this category — a mobile
 * number for an Easyload, a bill reference for a utility payment. The app builds
 * its form from these, so nothing about the form is hardcoded.
 *
 * Values are validated server-side against this definition at purchase time and
 * snapshotted onto the transaction, so editing a field never rewrites what a
 * customer already entered.
 */
export interface BnplCategoryField {
  /** Key the value is submitted under. Lower-cased server-side, unique per category. */
  fieldKey: string;
  label: string;
  fieldType: BnplFieldType;
  required: boolean;
  placeholder?: string | null;
  /** Regex the value must match in full. Rejected at save time if it does not compile. */
  pattern?: string | null;
  minLength?: number | null;
  maxLength?: number | null;
  /** NUMBER only — inclusive value bounds. */
  minValue?: number | null;
  maxValue?: number | null;
  sortOrder?: number | null;
}

export interface BnplCategory {
  id: string;
  /** Unique per tenant + currency, upper-cased server-side. Immutable once created. */
  code: string;
  nameEn: string;
  /** ISO code the band and any flat fee are denominated in. Immutable once created. */
  currency: string;
  minAmount: number;
  maxAmount: number;
  feeType: BnplFeeType;
  feeValue: number;
  /** Days from purchase to the single repayment due date. */
  repaymentDueDays: number;
  status: BnplCategoryStatus;
  sortOrder: number;
  /** The customer's form for this category, in `sortOrder`. */
  fields?: BnplCategoryField[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBnplCategoryRequest {
  code: string;
  nameEn: string;
  currency: string;
  minAmount: number;
  maxAmount: number;
  feeType: BnplFeeType;
  feeValue: number;
  repaymentDueDays: number;
  sortOrder?: number;
  /**
   * Replace-all: the array sent becomes the complete set, so omitting a field
   * deletes it. Open transactions keep their own snapshot either way.
   */
  fields?: BnplCategoryField[];
}

/** Both `code` and `currency` are immutable, so neither is on the update body. */
export type UpdateBnplCategoryRequest = Omit<CreateBnplCategoryRequest, "code" | "currency">;

/**
 * How much a wallet in this currency may owe across all its open BNPL
 * purchases. No row, or `enabled: false`, means the currency does not offer
 * BNPL at all — existing purchases stay repayable either way.
 */
export interface BnplCurrencyLimit {
  currency: string;
  totalLimit: number;
  enabled: boolean;
  updatedAt?: string;
}

export interface SetBnplCurrencyLimitRequest {
  totalLimit: number;
  enabled: boolean;
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
 * Every category, any status, sorted by `sortOrder` — the admin view. Pass a
 * currency to narrow to one; omitted returns all currencies.
 */
export async function listBnplCategories(currency?: string): Promise<BnplCategory[]> {
  const res = await axiosWalletService.get(BASE, currency ? { params: { currency } } : undefined);
  const inner = unwrap<unknown>(res?.data);
  // Tolerate a paged envelope too, in case the endpoint gains pagination.
  const rows = Array.isArray(inner) ? inner : ((inner as { content?: unknown })?.content ?? []);
  return Array.isArray(rows) ? rows : [];
}

export async function getBnplCategory(categoryId: string): Promise<BnplCategory> {
  const res = await axiosWalletService.get(`${BASE}/${categoryId}`);
  return unwrap<BnplCategory>(res?.data);
}

export async function createBnplCategory(body: CreateBnplCategoryRequest): Promise<BnplCategory> {
  const res = await axiosWalletService.post(BASE, body);
  return unwrap<BnplCategory>(res?.data);
}

export async function updateBnplCategory(
  categoryId: string,
  body: UpdateBnplCategoryRequest
): Promise<BnplCategory> {
  const res = await axiosWalletService.put(`${BASE}/${categoryId}`, body);
  return unwrap<BnplCategory>(res?.data);
}

/** Makes the category visible to customers again. */
export async function activateBnplCategory(categoryId: string): Promise<BnplCategory> {
  const res = await axiosWalletService.post(`${BASE}/${categoryId}/activate`);
  return unwrap<BnplCategory>(res?.data);
}

/** Hides it from browse/purchase; open transactions are unaffected. */
export async function deactivateBnplCategory(categoryId: string): Promise<BnplCategory> {
  const res = await axiosWalletService.post(`${BASE}/${categoryId}/deactivate`);
  return unwrap<BnplCategory>(res?.data);
}

/**
 * Soft delete — the row is set INACTIVE, never physically removed, so historical
 * `BnplTransaction` rows keep a valid reference (financial audit requirement).
 */
export function deleteBnplCategory(categoryId: string) {
  return axiosWalletService.delete(`${BASE}/${categoryId}`);
}

// ---------------------------------------------------------------------------
// Currency limits
// ---------------------------------------------------------------------------

/** Every configured currency, enabled or not. */
export async function listBnplCurrencyLimits(): Promise<BnplCurrencyLimit[]> {
  const res = await axiosWalletService.get(LIMITS_BASE);
  const inner = unwrap<unknown>(res?.data);
  const rows = Array.isArray(inner) ? inner : ((inner as { content?: unknown })?.content ?? []);
  return Array.isArray(rows) ? rows : [];
}

export async function getBnplCurrencyLimit(currency: string): Promise<BnplCurrencyLimit> {
  const res = await axiosWalletService.get(`${LIMITS_BASE}/${currency}`);
  return unwrap<BnplCurrencyLimit>(res?.data);
}

/** Upsert — the row is created when the currency has none yet. */
export async function setBnplCurrencyLimit(
  currency: string,
  body: SetBnplCurrencyLimitRequest
): Promise<BnplCurrencyLimit> {
  const res = await axiosWalletService.put(`${LIMITS_BASE}/${currency}`, body);
  return unwrap<BnplCurrencyLimit>(res?.data);
}

// ---------------------------------------------------------------------------
// Helpers shared by the BNPL screens
// ---------------------------------------------------------------------------

/** Error code the API returns when `code` is already taken in this currency. */
export const BNPL_DUPLICATE_CODE = "WALLET.BNPL_CATEGORY.DUPLICATE_CODE";

/** As much of an axios failure as these screens actually read. */
interface ApiFailure {
  response?: {
    status?: number;
    data?: {
      code?: string;
      errorCode?: string;
      error?: string;
      message?: string;
    };
  };
}

/**
 * Did this failure come back as a duplicate code? The API puts the code in
 * different places depending on which layer rejected it, hence the sweep.
 */
export const isDuplicateCodeError = (error: unknown): boolean => {
  const data = (error as ApiFailure)?.response?.data;
  const haystack = [data?.code, data?.errorCode, data?.error, data?.message]
    .filter(Boolean)
    .join(" ");
  return haystack.includes(BNPL_DUPLICATE_CODE) || haystack.includes("DUPLICATE_CODE");
};

/** The API's own message when it sent one, else the caller's translated text. */
export const bnplErrorMessage = (error: unknown, fallback: string): string =>
  (error as ApiFailure)?.response?.data?.message || fallback;

/**
 * Amounts are always 2dp. The currency is never assumed — pass the one the row
 * is denominated in, since the catalog spans currencies.
 */
export const formatBnplAmount = (value: number | null | undefined, currency?: string) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  const amount = Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${amount}` : amount;
};

/** "2" + PERCENT → "2%"; "15" + FLAT + SAR → "SAR 15.00". */
export const formatBnplFee = (feeType?: BnplFeeType, feeValue?: number, currency?: string) => {
  if (feeValue === null || feeValue === undefined || Number.isNaN(Number(feeValue))) return "-";
  if (feeType === "PERCENT") {
    // Whole-number percent per the API, but trim a trailing .00 either way.
    const pct = Number(feeValue);
    return `${Number.isInteger(pct) ? pct : pct.toFixed(2)}%`;
  }
  return formatBnplAmount(feeValue, currency);
};

/**
 * What a customer actually pays in fees at a given purchase amount — used for
 * the live preview in the form, so an admin sees the effect of a percent fee
 * before saving it.
 */
export const previewBnplFee = (
  feeType: BnplFeeType,
  feeValue: number,
  purchaseAmount: number
): number => {
  if (!Number.isFinite(feeValue) || !Number.isFinite(purchaseAmount)) return 0;
  const raw = feeType === "PERCENT" ? (purchaseAmount * feeValue) / 100 : feeValue;
  // The backend stores 2dp HALF_UP; mirror that so the preview cannot disagree.
  return Math.round((raw + Number.EPSILON) * 100) / 100;
};
