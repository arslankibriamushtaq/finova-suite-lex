import type { AxiosResponse } from "axios";

import axiosTenancy from "../../utils/axiosTenancy";
import type { BillingCycle, CatalogPackage } from "./apisTenantProvisioning";

/**
 * Superadmin console (`/platform/**`) and tenant billing portal
 * (`/tenant-portal/**`) — one service, two audiences.
 *
 * They are kept in one module because the response shapes are shared; they are
 * kept as two clearly-labelled sections because nothing else about them is.
 * `/platform/**` crosses the tenant boundary by design and is gated on
 * `platform.*` Casbin objects no tenant role is ever granted. `/tenant-portal/**`
 * scopes to the caller's own `tenant_id` claim — there is no path variable to
 * point at another company, and none should ever be added.
 *
 * As elsewhere, each call returns the unwrapped `data` from the
 * `{ data, message, timestamp }` envelope. Errors do NOT use that envelope —
 * see `toTenancyError`.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TenantStatus =
  | "PROVISIONING"
  | "ACTIVE"
  | "SUSPENDED"
  | "CANCELLED"
  | "FAILED";

export const TENANT_STATUSES: TenantStatus[] = [
  "PROVISIONING",
  "ACTIVE",
  "SUSPENDED",
  "CANCELLED",
  "FAILED",
];

export interface TenantResponse {
  tenantId: string;
  tenantCode: string;
  companyName: string;
  companyNameAr: string | null;
  crNumber: string | null;
  vatNumber: string | null;
  countryCode: string | null;
  city: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  website: string | null;
  status: TenantStatus;
  adminEmail: string | null;
  locale: string | null;
  activatedAt: string | null;
  suspendedAt: string | null;
  suspensionReason: string | null;
  createdAt: string;
}

export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  provisioningTenants: number;
  pendingSignups: number;
  failedSignups: number;
  monthlyRecurringRevenue: number;
  currency: string;
}

export interface SubscriptionItem {
  packageCode: string;
  unitPrice: number;
  quantity: number;
}

export interface SubscriptionResponse {
  subscriptionId: string;
  subscriptionNo: string;
  billingCycle: BillingCycle;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  recurringAmount: number;
  currency: string;
  autoRenew: boolean;
  items: SubscriptionItem[];
}

export interface TenantOverview {
  tenant: TenantResponse;
  entitledModules: string[];
  subscriptionNo: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  recurringAmount: number | null;
  currency: string | null;
  invoiceCount: number;
  lifetimeBilled: number;
}

/**
 * The result of a package change, on either side of the service.
 *
 * `chargedNow` and `invoiceId` are what separate an upgrade from a downgrade:
 * an upgrade charges the difference now and raises an invoice, a downgrade is
 * credited at renewal and returns `0` / `null`. Say which happened.
 */
export interface PackageChangeResult {
  subscription: SubscriptionResponse;
  entitledModules: string[];
  invoiceId: string | null;
  chargedNow: number;
  currency: string;
}

export type InvoiceStatus = "DRAFT" | "ISSUED" | "PAID" | "VOID" | "REFUNDED";

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "DRAFT",
  "ISSUED",
  "PAID",
  "VOID",
  "REFUNDED",
];

export type InvoiceType = "SUBSCRIPTION" | "RENEWAL" | "UPGRADE" | "CREDIT_NOTE";

export interface InvoiceLine {
  lineNo: number;
  packageCode: string;
  descriptionEn: string;
  descriptionAr: string;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
  lineVatAmount: number;
  lineTotal: number;
}

export interface Invoice {
  invoiceId: string;
  tenantId: string;
  invoiceNo: string;
  invoiceType: InvoiceType;
  issueDate: string;
  dueDate: string;
  sellerName: string;
  sellerVatNumber: string;
  buyerName: string;
  buyerVatNumber: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  /** Base64 TLV, NOT an image. Render as a QR from this exact string. */
  zatcaQr: string | null;
  zatcaUuid: string | null;
  lines: InvoiceLine[];
}

export type PlatformPackage = CatalogPackage;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export interface TenancyError {
  code?: string;
  message: string;
  status?: number;
  traceId?: string;
}

interface RejectedRequest {
  response?: {
    status: number;
    data?: { code?: string; message?: string; traceId?: string };
  };
}

/** `message` is localized by `Accept-Language`; `code` is not — switch on code. */
export const toTenancyError = (err: unknown, fallbackMessage: string): TenancyError => {
  const response = (err as RejectedRequest)?.response;
  if (!response) return { message: fallbackMessage, code: "NETWORK" };
  return {
    code: response.data?.code,
    message: response.data?.message || fallbackMessage,
    status: response.status,
    traceId: response.data?.traceId,
  };
};

export const isForbidden = (err: unknown): boolean =>
  (err as RejectedRequest)?.response?.status === 403;

// ---------------------------------------------------------------------------
// Calls — console (`platform.*`)
// ---------------------------------------------------------------------------

const unwrap = <T,>(res: AxiosResponse<{ data: T }>): T => res.data?.data;

export function getTenantStats(): Promise<TenantStats> {
  return axiosTenancy.get("/platform/tenants/stats").then(unwrap<TenantStats>);
}

/**
 * The register. Page/size with **no total count in the response**, so the
 * caller pages with next/prev that stops on a short page, never a numbered
 * pager that needs a total it will not get.
 */
export function getTenants(params: {
  query?: string;
  status?: TenantStatus | "";
  page?: number;
  size?: number;
}): Promise<TenantResponse[]> {
  return axiosTenancy
    .get("/platform/tenants", {
      params: {
        query: params.query || undefined,
        status: params.status || undefined,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })
    .then(unwrap<TenantResponse[]>);
}

export function getTenantOverview(tenantId: string): Promise<TenantOverview> {
  return axiosTenancy
    .get(`/platform/tenants/${encodeURIComponent(tenantId)}/overview`)
    .then(unwrap<TenantOverview>);
}

/** 204 No Content — refetch the overview afterwards rather than assuming. */
export function suspendTenant(tenantId: string, reason: string): Promise<void> {
  return axiosTenancy
    .post(`/platform/tenants/${encodeURIComponent(tenantId)}/suspend`, { reason })
    .then(() => undefined);
}

export function reactivateTenant(tenantId: string): Promise<void> {
  return axiosTenancy
    .post(`/platform/tenants/${encodeURIComponent(tenantId)}/reactivate`)
    .then(() => undefined);
}

/** Irreversible. No endpoint here undoes it; recovery is a database job. */
export function cancelTenant(tenantId: string, reason: string): Promise<void> {
  return axiosTenancy
    .post(`/platform/tenants/${encodeURIComponent(tenantId)}/cancel`, { reason })
    .then(() => undefined);
}

/**
 * FULL REPLACEMENT, not a delta: send the complete list the tenant should end
 * up with. Entitlements are recomputed and pushed to identity-service in the
 * same call; the renewal date does not move.
 */
export function setTenantPackages(
  tenantId: string,
  packageCodes: string[]
): Promise<PackageChangeResult> {
  return axiosTenancy
    .put(`/platform/tenants/${encodeURIComponent(tenantId)}/packages`, { packageCodes })
    .then(unwrap<PackageChangeResult>);
}

/** Everything, withdrawn packages included — unlike the public catalog. */
export function getPlatformPackages(): Promise<PlatformPackage[]> {
  return axiosTenancy.get("/platform/packages").then(unwrap<PlatformPackage[]>);
}

export interface CreatePackageRequest {
  packageCode: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  moduleCodes: string[];
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  bundle: boolean;
  displayOrder: number;
}

export function createPackage(payload: CreatePackageRequest): Promise<PlatformPackage> {
  return axiosTenancy.post("/platform/packages", payload).then(unwrap<PlatformPackage>);
}

/** Every field optional — omit what is unchanged. */
export function updatePackage(
  packageCode: string,
  payload: Partial<Omit<CreatePackageRequest, "packageCode">>
): Promise<PlatformPackage> {
  return axiosTenancy
    .put(`/platform/packages/${encodeURIComponent(packageCode)}`, payload)
    .then(unwrap<PlatformPackage>);
}

/**
 * Affects NEW QUOTES ONLY. Every existing subscription stores the unit prices
 * it was sold at, so no customer's bill moves. `reason` lands in
 * `module_package_price_history` beside the old and new prices.
 */
export function updatePackagePricing(
  packageCode: string,
  payload: { monthlyPrice: number; annualPrice: number; currency: string; reason: string }
): Promise<PlatformPackage> {
  return axiosTenancy
    .put(`/platform/packages/${encodeURIComponent(packageCode)}/pricing`, payload)
    .then(unwrap<PlatformPackage>);
}

/** Hides it from the public catalog; existing subscribers keep it. */
export function setPackageActive(
  packageCode: string,
  active: boolean
): Promise<PlatformPackage> {
  return axiosTenancy
    .post(
      `/platform/packages/${encodeURIComponent(packageCode)}/${active ? "activate" : "deactivate"}`
    )
    .then(unwrap<PlatformPackage>);
}

export function getPlatformInvoices(params: {
  status?: InvoiceStatus | "";
  page?: number;
  size?: number;
}): Promise<Invoice[]> {
  return axiosTenancy
    .get("/platform/invoices", {
      params: {
        status: params.status || undefined,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })
    .then(unwrap<Invoice[]>);
}

export function getPlatformInvoice(invoiceId: string): Promise<Invoice> {
  return axiosTenancy
    .get(`/platform/invoices/${encodeURIComponent(invoiceId)}`)
    .then(unwrap<Invoice>);
}

// ---------------------------------------------------------------------------
// Calls — tenant portal (`tenant-portal.*`, tenant from the token)
// ---------------------------------------------------------------------------

export function getMyProfile(): Promise<TenantResponse> {
  return axiosTenancy.get("/tenant-portal/profile").then(unwrap<TenantResponse>);
}

export function getMySubscription(): Promise<SubscriptionResponse> {
  return axiosTenancy.get("/tenant-portal/subscription").then(unwrap<SubscriptionResponse>);
}

export function getMySubscriptionHistory(): Promise<SubscriptionResponse[]> {
  return axiosTenancy
    .get("/tenant-portal/subscription/history")
    .then(unwrap<SubscriptionResponse[]>);
}

/** Same full-replacement semantics as the console's — real billing. */
export function setMyPackages(packageCodes: string[]): Promise<PackageChangeResult> {
  return axiosTenancy
    .put("/tenant-portal/subscription/packages", { packageCodes })
    .then(unwrap<PackageChangeResult>);
}

export function setMyAutoRenew(enabled: boolean): Promise<SubscriptionResponse> {
  return axiosTenancy
    .put("/tenant-portal/subscription/auto-renew", null, { params: { enabled } })
    .then(unwrap<SubscriptionResponse>);
}

export function getMyEntitlements(): Promise<string[]> {
  return axiosTenancy.get("/tenant-portal/entitlements").then(unwrap<string[]>);
}

export function getMyInvoices(params: { page?: number; size?: number }): Promise<Invoice[]> {
  return axiosTenancy
    .get("/tenant-portal/invoices", {
      params: { page: params.page ?? 0, size: params.size ?? 20 },
    })
    .then(unwrap<Invoice[]>);
}

/** Another tenant's invoice id is a 404 here, never a 403. */
export function getMyInvoice(invoiceId: string): Promise<Invoice> {
  return axiosTenancy
    .get(`/tenant-portal/invoices/${encodeURIComponent(invoiceId)}`)
    .then(unwrap<Invoice>);
}
