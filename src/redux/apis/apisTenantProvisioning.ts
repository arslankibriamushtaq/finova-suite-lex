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
  "OWNER" | "DIRECTOR" | "AUTHORIZED_SIGNATORY" | "EMPLOYEE" | "CONSULTANT" | "OTHER";

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

/**
 * What every wizard call answers with.
 *
 * Two fields drive routing on a resume — `emailVerified` and `adminProvided`
 * say which step the buyer is actually up to, which is more trustworthy than a
 * counter this app kept.
 *
 * The stored form fields come back only once `emailVerified` is true; before
 * that they are null. A company email is guessable, so an unverified read is
 * deliberately answered with step-1 fields only. That is a disclosure rule, not
 * a bug: keep what the buyer typed in local state for the session, and treat
 * the server copy as what a *verified* resume gets back.
 */
export interface SignupDraft {
  signupId: string;
  referenceNo: string;
  status: SignupStatus | "DRAFT";

  emailVerified: boolean;
  adminProvided: boolean;

  billingCycle: BillingCycle;
  packageCodes: string[];
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  expiresAt: string | null;

  companyName: string | null;
  companyEmail: string | null;
  crNumber: string | null;
  companyNameAr: string | null;
  vatNumber: string | null;
  countryCode: string | null;
  city: string | null;
  addressLine: string | null;
  postalCode: string | null;
  companyPhone: string | null;
  website: string | null;

  adminFirstName: string | null;
  adminLastName: string | null;
  adminEmail: string | null;
  adminMobile: string | null;
  adminJobTitle: string | null;
  adminRelationship: AdminRelationship | null;
}

/** Step 1 — the company, and the plan chosen on the pricing page. */
export interface DraftRequest {
  companyName: string;
  companyEmail: string;
  crNumber?: string;
  billingCycle: BillingCycle;
  packageCodes: string[];
  locale: string;
}

/** Step 3 — everything about the company that is not its identity. */
export interface CompanyPatch {
  countryCode: string;
  vatNumber?: string;
  companyNameAr?: string;
  companyPhone?: string;
  website?: string;
  city?: string;
  addressLine?: string;
  postalCode?: string;
}

/** Step 4 — the person filling the form, who becomes the first administrator. */
export interface AdminPatch {
  adminFirstName: string;
  adminLastName?: string;
  adminEmail: string;
  adminMobile?: string;
  adminJobTitle?: string;
  adminRelationship: AdminRelationship;
}

/**
 * An emailed verification code.
 *
 * `resendsRemaining` and the 60-second cooldown drive the resend button: a
 * button that can be pressed into a throttle is a button that collects errors.
 */
export interface OtpChallenge {
  challengeId: string;
  maskedEmail: string;
  expiresInSeconds: number;
  resendsRemaining: number;
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
  | "TENANCY.SIGNUP.NOT_DRAFT"
  | "TENANCY.SIGNUP.EMAIL_NOT_VERIFIED"
  | "TENANCY.SIGNUP.EMAIL_ALREADY_VERIFIED"
  | "TENANCY.SIGNUP.INCOMPLETE"
  | "TENANCY.SIGNUP.NOT_REOPENABLE"
  | "TENANCY.OTP.INVALID"
  | "TENANCY.OTP.EXPIRED"
  | "TENANCY.OTP.MISMATCHED_CHALLENGE"
  | "TENANCY.OTP.RESEND_THROTTLED"
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

export const toTenantSignupError = (err: unknown, fallbackMessage: string): TenantSignupError => {
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

const unwrap = <T>(res: AxiosResponse<{ data: T }>): T => res.data?.data;

/** Screen 1 — what is on sale. CORE is deliberately absent; it ships free. */
export function getCatalogPackages(): Promise<CatalogPackage[]> {
  return axiosTenantProvisioning.get("/public/catalog/packages").then(unwrap<CatalogPackage[]>);
}

/**
 * Prices a selection live. Creates nothing, so it is safe to call on every
 * checkbox change and on the billing-cycle toggle.
 */
export function getQuote(payload: {
  packageCodes: string[];
  billingCycle: BillingCycle;
}): Promise<Quote> {
  return axiosTenantProvisioning.post("/public/catalog/quote", payload).then(unwrap<Quote>);
}

// ---------------------------------------------------------------------------
// The wizard — four steps over one server-side draft
// ---------------------------------------------------------------------------

/**
 * Step 1 — open a signup, or resume the one this company email already has.
 *
 * Called again with the same company email this RESUMES rather than creating a
 * second draft: same signupId, same reference. It also clears the email
 * verification on the way, because a company address is guessable and a
 * verified tick must not be inheritable by whoever retypes it.
 *
 * The idempotency key is generated once when the wizard opens and reused on
 * retry, so a double-click or a flaky network returns the original draft.
 */
export function createDraft(payload: DraftRequest, idempotencyKey: string): Promise<SignupDraft> {
  return axiosTenantProvisioning
    .post("/public/signups/draft", payload, {
      headers: { "X-Idempotency-Key": idempotencyKey },
    })
    .then(unwrap<SignupDraft>);
}

/**
 * Reads a draft back after a refresh.
 *
 * Before the company address is proven this answers with step-1 fields only,
 * so a caller must not treat missing fields as "the buyer left them blank".
 */
export function getDraft(signupId: string): Promise<SignupDraft> {
  return axiosTenantProvisioning.get(`/public/signups/draft/${signupId}`).then(unwrap<SignupDraft>);
}

/** Step 2a — email a six-digit code to the company address. */
export function sendEmailOtp(signupId: string): Promise<OtpChallenge> {
  return axiosTenantProvisioning
    .post(`/public/signups/${signupId}/email-otp`)
    .then(unwrap<OtpChallenge>);
}

/**
 * Step 2b — prove the company address.
 *
 * `challengeId` is bound to this signup and this address; a code issued for
 * another draft is refused with TENANCY.OTP.MISMATCHED_CHALLENGE.
 */
export function verifyEmailOtp(
  signupId: string,
  payload: { challengeId: string; code: string }
): Promise<SignupDraft> {
  return axiosTenantProvisioning
    .post(`/public/signups/${signupId}/email-otp/verify`, payload)
    .then(unwrap<SignupDraft>);
}

/** Step 3 — the rest of the company. No email here; it is verified by now. */
export function patchCompany(signupId: string, payload: CompanyPatch): Promise<SignupDraft> {
  return axiosTenantProvisioning
    .patch(`/public/signups/${signupId}/company`, payload)
    .then(unwrap<SignupDraft>);
}

/** Step 4 — you. Refused with EMAIL_NOT_VERIFIED if step 2 was skipped. */
export function patchAdmin(signupId: string, payload: AdminPatch): Promise<SignupDraft> {
  return axiosTenantProvisioning
    .patch(`/public/signups/${signupId}/admin`, payload)
    .then(unwrap<SignupDraft>);
}

/** Re-prices the draft after a trip back to the pricing page. */
export function patchSelection(
  signupId: string,
  payload: { packageCodes: string[]; billingCycle: BillingCycle }
): Promise<SignupDraft> {
  return axiosTenantProvisioning
    .patch(`/public/signups/${signupId}/selection`, payload)
    .then(unwrap<SignupDraft>);
}

/**
 * Leaves the wizard: the draft becomes payable and the 72-hour quote window
 * restarts here. The returned amount is what will be charged — render that,
 * never a recalculated total.
 */
export function submitSignup(signupId: string): Promise<Signup> {
  return axiosTenantProvisioning.post(`/public/signups/${signupId}/submit`).then(unwrap<Signup>);
}

/** Back into the wizard to fix a typo, while no checkout has been opened. */
export function reopenSignup(signupId: string): Promise<SignupDraft> {
  return axiosTenantProvisioning
    .post(`/public/signups/${signupId}/reopen`)
    .then(unwrap<SignupDraft>);
}

/**
 * Screen 2 — submits the form and FREEZES the quote for 72 hours. The returned
 * amount is what will be charged; render that, never a recalculated total.
 *
 * `idempotencyKey` is generated once per form render and reused on retry, so a
 * double-click cannot produce two payable signups.
 *
 * @deprecated The one-shot endpoint. It cannot verify a company email, so
 * the signups it creates are unpayable wherever
 * platform.signup.require-verified-email is on. Use the draft wizard above.
 */
export function createSignup(payload: SignupRequest, idempotencyKey: string): Promise<Signup> {
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
  return axiosTenantProvisioning.post("/activation", payload).then(unwrap<ActivationResult>);
}
