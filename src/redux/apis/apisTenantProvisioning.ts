import type { AxiosResponse } from "axios";

import axiosTenantProvisioning from "../../utils/axiosTenantProvisioning";

/**
 * Tenant self-signup — the public purchase journey at `/tenant/*`.
 *
 * Contract: `tenant-provisioning-service` (see TENANT_SELF_SIGNUP_FRONTEND_GUIDE).
 * Every endpoint is public: no `Authorization`, no `tenant_id`.
 *
 * As with `apisBusinessOnboarding`, each function returns the **unwrapped
 * `data`** rather than the axios response. Errors do NOT use that envelope —
 * see `toTenantSignupError`.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BillingCycle = "MONTHLY" | "ANNUAL";

export type AdminRelationship =
  | "OWNER"
  | "DIRECTOR"
  | "AUTHORIZED_SIGNATORY"
  | "EMPLOYEE"
  | "CONSULTANT"
  | "OTHER";

export const ADMIN_RELATIONSHIPS: AdminRelationship[] = [
  "OWNER",
  "DIRECTOR",
  "AUTHORIZED_SIGNATORY",
  "EMPLOYEE",
  "CONSULTANT",
  "OTHER",
];

export interface CatalogPackage {
  id: string;
  packageCode: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  moduleCodes: string[];
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  bundle: boolean;
  active: boolean;
  displayOrder: number;
}

export interface QuoteLine {
  packageCode: string;
  descriptionEn: string;
  descriptionAr: string;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
  lineVatAmount: number;
  lineTotal: number;
}

export interface Quote {
  lines: QuoteLine[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  billingCycle: BillingCycle;
}

export type SignupStatus =
  | "PENDING_PAYMENT"
  /** Undocumented but real: set once a checkout is open, before BurqPay confirms. */
  | "PAYMENT_IN_PROGRESS"
  | "PAID"
  | "PROVISIONING"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED";

export interface Signup {
  signupId: string;
  referenceNo: string;
  companyName: string;
  adminEmail: string;
  billingCycle: BillingCycle;
  packageCodes: string[];
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  status: SignupStatus;
  failureReason: string | null;
  tenantId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface SignupRequest {
  companyName: string;
  companyNameAr?: string;
  crNumber?: string;
  vatNumber?: string;
  countryCode: string;
  city?: string;
  addressLine?: string;
  postalCode?: string;
  companyEmail: string;
  companyPhone?: string;
  website?: string;

  adminFirstName: string;
  adminLastName?: string;
  adminEmail: string;
  adminMobile?: string;
  adminJobTitle?: string;
  adminRelationship?: AdminRelationship;

  billingCycle: BillingCycle;
  packageCodes: string[];
  locale: string;
}

export interface CheckoutSession {
  paymentId: string;
  /** Shown on the return page; it is what support will ask for. */
  orderId: string;
  /** BurqPay's own hosted page. The browser is sent here. */
  checkoutUrl: string;
  amount: number;
  currency: string;
}

export interface PaymentStatus {
  paid: boolean;
  signupStatus: SignupStatus;
  referenceNo: string;
  /** Localized. "Waiting for the payment gateway to confirm" is normal. */
  message: string;
  paymentNo: string | null;
  amount: number;
  currency: string;
}

export interface ActivationPreview {
  valid: boolean;
  email: string | null;
  companyName: string | null;
  reason: string | null;
}

export interface ActivationResult {
  tenantId: string;
  tenantCode: string;
  email: string;
  loginUrl: string;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/**
 * The error codes this flow branches on. `message` and `error` are localized by
 * `Accept-Language`; the code is not, so it is the only safe thing to switch on.
 */
export type TenantSignupErrorCode =
  | "COMMON.VALIDATION.FAILED"
  | "TENANCY.PACKAGE.NOT_FOUND"
  | "TENANCY.PACKAGE.INACTIVE"
  | "TENANCY.SIGNUP.DUPLICATE"
  | "TENANCY.TENANT.DUPLICATE_EMAIL"
  | "TENANCY.SIGNUP.QUOTE_EXPIRED"
  | "TENANCY.SIGNUP.INVALID_STATE"
  | "TENANCY.PAYMENT.CHECKOUT_FAILED"
  | "TENANCY.PAYMENT.AMOUNT_ABOVE_GATEWAY_LIMIT"
  | "TENANCY.ACTIVATION.TOKEN_INVALID"
  | "TENANCY.ACTIVATION.TOKEN_EXPIRED"
  | "TENANCY.ACTIVATION.TOKEN_USED"
  | "TENANCY.PASSWORD.POLICY_VIOLATION"
  | "NETWORK";

export interface TenantSignupError {
  code?: TenantSignupErrorCode | string;
  message: string;
  status?: number;
  traceId?: string;
  /**
   * Field-level errors, keyed by request field name, e.g.
   * `{ countryCode: "Country must be a 2-letter ISO code" }`. Sent with
   * `COMMON.VALIDATION.FAILED`, where `message` is only "Validation failed" —
   * so without these the screen has nothing useful to show the buyer.
   */
  details?: Record<string, string>;
}

interface RejectedRequest {
  response?: {
    status: number;
    data?: {
      code?: string;
      message?: string;
      error?: string;
      traceId?: string;
      details?: Record<string, string>;
    };
  };
}

export const toTenantSignupError = (
  err: unknown,
  fallbackMessage: string
): TenantSignupError => {
  const response = (err as RejectedRequest)?.response;

  // No response at all — offline, DNS failure, or the gateway is down.
  if (!response) {
    return { message: fallbackMessage, code: "NETWORK" };
  }

  const data = response.data;

  return {
    code: data?.code,
    message: data?.message || fallbackMessage,
    status: response.status,
    traceId: data?.traceId,
    details: data?.details,
  };
};

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

const unwrap = <T,>(res: AxiosResponse<{ data: T }>): T => res.data?.data;

/** Screen 1 — what is on sale. CORE is deliberately absent; it ships free. */
export function getCatalogPackages(): Promise<CatalogPackage[]> {
  return axiosTenantProvisioning
    .get("/public/catalog/packages")
    .then(unwrap<CatalogPackage[]>);
}

/**
 * Prices a selection live. Creates nothing, so it is safe to call on every
 * checkbox change and on the billing-cycle toggle.
 */
export function getQuote(payload: {
  packageCodes: string[];
  billingCycle: BillingCycle;
}): Promise<Quote> {
  return axiosTenantProvisioning
    .post("/public/catalog/quote", payload)
    .then(unwrap<Quote>);
}

/**
 * Screen 2 — submits the form and FREEZES the quote for 72 hours. The returned
 * amount is what will be charged; render that, never a recalculated total.
 *
 * `idempotencyKey` is generated once per form render and reused on retry, so a
 * double-click cannot produce two payable signups.
 */
export function createSignup(
  payload: SignupRequest,
  idempotencyKey: string
): Promise<Signup> {
  return axiosTenantProvisioning
    .post("/public/signups", payload, {
      headers: { "X-Idempotency-Key": idempotencyKey },
    })
    .then(unwrap<Signup>);
}

/** Status poll, by reference number. Drives screen 4. */
export function getSignupStatus(referenceNo: string): Promise<Signup> {
  return axiosTenantProvisioning
    .get(`/public/signups/${encodeURIComponent(referenceNo)}`)
    .then(unwrap<Signup>);
}

/**
 * Opens a BurqPay hosted checkout and returns the URL to send the browser to.
 *
 * There is no widget and no card field anywhere in this app — the customer
 * leaves for BurqPay's own page and BurqPay reports the outcome to the backend.
 *
 * `idempotencyKey` defaults to one derived from the signup, so a back button or
 * a refresh re-enters the checkout already open rather than stranding it. A
 * retry after a failed payment passes a NEW key deliberately: that customer
 * needs a fresh BurqPay page, not the spent one.
 */
export function createCheckout(
  signupId: string,
  idempotencyKey: string = `checkout-${signupId}`
): Promise<CheckoutSession> {
  return axiosTenantProvisioning
    .post(`/public/signups/${encodeURIComponent(signupId)}/checkout`, undefined, {
      headers: { "X-Idempotency-Key": idempotencyKey },
    })
    .then(unwrap<CheckoutSession>);
}

/**
 * What the return page shows.
 *
 * The browser coming back from BurqPay is NOT evidence of payment — anyone can
 * navigate to a success URL, and BurqPay has no verify API the frontend could
 * call on the customer's behalf. The real confirmation is a POST from BurqPay
 * to the backend, which lands independently of the redirect and routinely a
 * moment after it. So this is polled, and `paid: false` early on means "not yet",
 * not "declined".
 */
export function getPaymentStatus(referenceNo: string): Promise<PaymentStatus> {
  return axiosTenantProvisioning
    .get(`/public/signups/${encodeURIComponent(referenceNo)}/payment`)
    .then(unwrap<PaymentStatus>);
}

/**
 * Screen 5 — is this activation link still good? Checked BEFORE the password
 * form is rendered: asking someone to type a password into a form that will be
 * rejected is the worst version of that screen.
 */
export function previewActivation(token: string): Promise<ActivationPreview> {
  return axiosTenantProvisioning
    .get("/activation/preview", { params: { token } })
    .then(unwrap<ActivationPreview>);
}

/**
 * Sets the password and activates the tenant. Single use.
 *
 * A server-rejected password burns one of five attempts against the token, so
 * the caller validates the policy client-side first — one of the rare cases
 * where duplicated validation protects the user rather than just saving a trip.
 */
export function activateTenant(payload: {
  token: string;
  password: string;
}): Promise<ActivationResult> {
  return axiosTenantProvisioning
    .post("/activation", payload)
    .then(unwrap<ActivationResult>);
}
