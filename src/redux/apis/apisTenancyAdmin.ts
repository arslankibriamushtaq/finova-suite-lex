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

export type TenantStatus = "PROVISIONING" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "FAILED";

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

export const INVOICE_STATUSES: InvoiceStatus[] = ["DRAFT", "ISSUED", "PAID", "VOID", "REFUNDED"];

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

const unwrap = <T>(res: AxiosResponse<{ data: T }>): T => res.data?.data;

export function getTenantStats(): Promise<TenantStats> {
  return axiosTenancy.get("/platform/tenants/stats").then(unwrap<TenantStats>);
}

// ---------------------------------------------------------------------------
// Superadmin dashboard
// ---------------------------------------------------------------------------

/**
 * A fixed window, not a trailing one.
 *
 * LAST_WEEK is the previous Monday-to-Sunday rather than "the last 7 days", so
 * two operators opening the console on different days of the same week read the
 * same numbers off it.
 */
export type DashboardPeriod = "TODAY" | "LAST_WEEK" | "LAST_MONTH" | "THIS_YEAR";

export interface DashboardProduct {
  packageCode: string;
  nameEn: string;
  nameAr: string;
  bundle: boolean;
  /**
   * Tenants on an ACTIVE subscription that includes this package.
   *
   * A tenant on the everything-tier is on every module, so BUNDLE_ALL's tenants
   * are ALREADY counted in each module's figure. Adding them again double-counts
   * the same companies. Its money is not folded in the same way — the bundle
   * keeps its own slice of the pie and its own key in byPackage.
   */
  activeTenants: number;
  /** Paid invoice revenue on this package's lines, inside the window. */
  sales: number;
}

export interface DashboardRevenueMonth {
  /** "YYYY-MM". */
  month: string;
  total: number;
  /** Only the packages that sold that month; a missing key is zero. */
  byPackage: Record<string, number>;
}

export interface PlatformDashboard {
  range: { from: string; to: string; preset: DashboardPeriod | null };
  currency: string;

  tenants: {
    total: number;
    active: number;
    suspended: number;
    provisioning: number;
    cancelled: number;
    failed: number;
    onboardedInRange: number;
  };

  funnel: {
    leads: number;
    opportunities: number;
    inProgress: number;
    won: number;
    lost: number;
    byStatus: Record<string, number>;
  };

  products: DashboardProduct[];
  totalSales: number;
  /** All-time, annual plans already divided by 12. Do NOT divide again. */
  monthlyRecurringRevenue: number;
  /** Zero-filled and chronological, so every bar can be drawn as it comes. */
  revenue: DashboardRevenueMonth[];
}

/**
 * One call draws the whole page.
 *
 * `from`/`to` win over `period` server-side, so the two are mutually
 * exclusive here as well — sending both is a request whose meaning depends on
 * a precedence rule the reader of this code should not have to know.
 *
 * Dates are plain YYYY-MM-DD. Days are cut in the platform's reporting zone,
 * not the browser's, so a timestamp would be answering a question nobody asked.
 */
export function getPlatformDashboard(params: {
  period?: DashboardPeriod;
  from?: string;
  to?: string;
}): Promise<PlatformDashboard> {
  const query =
    params.from && params.to
      ? { from: params.from, to: params.to }
      : params.period
        ? { period: params.period }
        : {};

  return axiosTenancy.get("/platform/dashboard", { params: query }).then(unwrap<PlatformDashboard>);
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
export function setPackageActive(packageCode: string, active: boolean): Promise<PlatformPackage> {
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

// ---------------------------------------------------------------------------
// Tenant portal — API documentation
// ---------------------------------------------------------------------------

export interface ApiDocService {
  serviceCode: string;
  nameEn: string;
  nameAr: string;
  /** Kong's route prefix for the service. */
  gatewayPath: string;
  /** Where the tenant's own developers call it. */
  publicBaseUrl: string;
  /** Relative to this service's base — prefixed like every other call here. */
  specUrl: string;
  /** identity-service module codes the service belongs to. Informational. */
  modules: string[];
}

export interface ApiDocProduct {
  packageCode: string;
  nameEn: string;
  nameAr: string;
  bundle: boolean;
  services: ApiDocService[];
}

export interface ApiDocsIndex {
  gatewayPublicUrl: string;
  products: ApiDocProduct[];
}

/**
 * What this tenant is entitled to read.
 *
 * One product per package on the active subscription, in catalog order, with
 * Core last. A service can legitimately appear under more than one product —
 * PRODUCT belongs to both LOS and LMS — and that is not a duplicate to clean
 * up: it is the same document reachable from either place the buyer thinks of
 * it.
 *
 * An empty list is a real answer (no active subscription, Core hidden by
 * config), not an error.
 */
export function getApiDocsIndex(): Promise<ApiDocsIndex> {
  return axiosTenancy.get("/tenant-portal/api-docs").then(unwrap<ApiDocsIndex>);
}

/**
 * One service's OpenAPI 3 document.
 *
 * Returned RAW — no platform envelope — so this deliberately does not unwrap.
 * A failure still arrives enveloped with a `code`, which is why the caller
 * must branch on that rather than on the shape of what came back.
 *
 * Entitlement is re-checked here, not only on the index: a stale specUrl for a
 * package the tenant has since dropped answers SERVICE_NOT_ENTITLED.
 */
export function getOpenApiDocument(specUrl: string): Promise<OpenApiDocument> {
  // The index gives an absolute path under this service's own API root, and
  // the axios instance is already based there — so the shared prefix is
  // stripped rather than concatenated into a doubled path.
  const path = specUrl.replace(/^\/api\/v1/, "");
  return axiosTenancy.get(path).then((res) => res.data as OpenApiDocument);
}

// --- Just enough of OpenAPI to render it ------------------------------------
//
// Not a full OpenAPI 3 type: the page lists operations and their parameters and
// responses, and typing the whole specification to do that would be a schema
// nobody reads kept in step with a document nobody validates against.

export interface OpenApiParameter {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema?: { type?: string; format?: string };
}

export interface OpenApiOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OpenApiParameter[];
  requestBody?: { required?: boolean; content?: Record<string, unknown> };
  responses?: Record<string, { description?: string }>;
  deprecated?: boolean;
}

export interface OpenApiDocument {
  openapi?: string;
  info?: { title?: string; version?: string; description?: string };
  servers?: { url?: string; description?: string }[];
  tags?: { name: string; description?: string }[];
  paths?: Record<string, Record<string, OpenApiOperation>>;
}
