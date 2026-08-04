import axiosBusinessOnboarding, {
  axiosPublicReferenceData,
} from "../../utils/axiosBusinessOnboarding";

/**
 * Business (SME / KYB) onboarding — public applicant journey.
 *
 * Contract: `onboarding-workflow-service`, base path
 * `/api/v1/onboarding/business` (see BUSINESS_ONBOARDING_WEB_INTEGRATION).
 *
 * Unlike the other api modules here, every function returns the **unwrapped
 * `data` payload** rather than the axios response. The envelope
 * (`{ data, message, timestamp }`) carries nothing a screen needs, and thirteen
 * screens each writing `res.data.data` is thirteen chances to get it wrong.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Server-driven navigation. Never infer the next screen from step order. */
export type BusinessNextAction =
  | "VERIFY_OTP"
  | "VERIFY_EMAIL_MPIN"
  | "VERIFY_RESUME_PIN"
  | "SET_PIN"
  | "SUBMIT_BUSINESS_INFO"
  | "SUBMIT_ADDRESS"
  | "UPLOAD_DOCUMENT"
  | "UPLOAD_PASSPORT"
  | "CONFIRM_DATA"
  | "UPLOAD_SELFIE"
  | "PENDING_REVIEW"
  | "RESTART"
  | "ROUTE_LOGIN"
  | "ROUTE_REONBOARDING";

export type ResumeMpinKind = "APP_PIN" | "EMAIL_MPIN";

export type BusinessDocumentKind =
  | "BUSINESS_REGISTRATION_CERT"
  | "BUSINESS_LICENSE"
  | "VAT_CERTIFICATE"
  | "OTHER_BUSINESS_DOC";

/** OCR output — snake_case keys, distinct from the camelCase confirm payload. */
export interface PassportExtractedData {
  surname?: string;
  first_name?: string;
  nationality?: string;
  dob?: string;
  document_number?: string;
  date_of_issue?: string;
  expiry_date?: string;
  [key: string]: unknown;
}

export interface UploadedDocumentResult {
  documentKind?: string;
  documentId?: string;
  message?: string;
  failureReason?: string | null;
}

/**
 * One shape for every step response. The contract returns a common core
 * (`currentStep` / `nextAction` / `failureReason`) plus step-specific extras,
 * all optional — so a single interface beats thirteen near-duplicates.
 */
export interface BusinessStepResponse {
  workflowId?: string;
  sessionId?: string;
  status?: string;
  currentStep?: string;
  nextAction?: BusinessNextAction;
  failureReason?: string | null;
  message?: string;
  timestamp?: string;

  // /initiate
  resumeMpinKind?: ResumeMpinKind | null;
  maskedMobile?: string | null;
  maskedEmail?: string | null;
  passportReused?: boolean;

  // /verify-otp, /verify-resume-pin
  keycloakUserId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;

  // /submit-business-info, /submit-address, /upload-document
  requiredDocuments?: string[];
  pendingDocuments?: string[];
  documentId?: string;
  documents?: UploadedDocumentResult[];

  // /upload-passport, /upload-selfie
  sullisReferenceId?: string;
  extractedData?: PassportExtractedData;
  maxAttemptsReached?: boolean;
  faceMatchScore?: number;
  customerId?: string;
  walletId?: string;
}

/** `GET /status` — everything captured so far, for rehydration after a reload. */
export interface BusinessOnboardingStatus extends BusinessStepResponse {
  email?: string;
  mobileNumber?: string;
  countryCode?: string;
  businessTypeCode?: string;
  businessName?: string;
  registrationNumber?: string;
  businessEmail?: string;
  website?: string;
  description?: string;
  city?: string;
  businessAddress?: string;
  postalCode?: string;
  businessDocuments?: Record<string, string>;
  globalUid?: string | null;
  pinSet?: boolean;
  mpinVerified?: boolean;
  confirmedData?: Record<string, unknown>;
  startedAt?: string;
  lastUpdatedAt?: string;
}

export interface CountryConfig {
  countryCode: string;
  countryName: string;
  countryNameAr?: string;
  currencyCode?: string;
  flagEmoji?: string;
  dialCode?: string;
  nationalityEn?: string;
  nationalityAr?: string;
  active?: boolean;
}

export interface BusinessType {
  typeCode: string;
  labelEn?: string;
  labelAr?: string;
  requiredDocuments?: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Read the payload out of a response, tolerating both shapes.
 *
 * The contract documents a `{ data, message, timestamp }` envelope, but this
 * service does not apply it uniformly — `OnboardingUsers.tsx` already guards
 * with `res?.data?.data ?? res?.data`. Assuming the envelope means an unwrapped
 * response silently yields `{}`: no `sessionId`, no `nextAction`, so the step
 * "succeeds" and navigates nowhere.
 */
const unwrap = <T>(res: unknown): T => {
  const body = (res as { data?: unknown })?.data;

  if (body && typeof body === "object" && !Array.isArray(body) && "data" in body) {
    const inner = (body as { data?: unknown }).data;
    if (inner && typeof inner === "object") return inner as T;
  }

  return (body ?? {}) as T;
};

/**
 * Upload steps run OCR / face-match server-side and are documented as taking
 * up to ~6 minutes. Axios' default (no timeout) would hang forever on a dropped
 * connection, so cap it just above the documented ceiling.
 */
const UPLOAD_TIMEOUT_MS = 7 * 60 * 1000;

export interface BusinessOnboardingError {
  /** Stable, switchable error code, e.g. `ONBOARDING.BUSINESS.ALREADY_REGISTERED`. */
  code?: string;
  /** Localized, display-ready text. */
  message: string;
  status?: number;
  /** Set when the server reports a retryable step failure rather than a fault. */
  failureReason?: string | null;
  /** `true` → the session was torn down; restart from `/initiate`. */
  maxAttemptsReached?: boolean;
}

/** The bits of an axios rejection this module actually reads. */
interface RejectedRequest {
  response?: {
    status?: number;
    data?: {
      code?: string;
      message?: string;
      failureReason?: string | null;
      maxAttemptsReached?: boolean;
    };
  };
}

/**
 * Normalize anything axios throws into one shape.
 *
 * Note the ordering: a retryable step failure (wrong OTP, blurry scan) arrives
 * as a 400 whose body carries `failureReason`, and that text is the one the
 * user should see — the generic `message` is not.
 */
export const toBusinessOnboardingError = (
  err: unknown,
  fallbackMessage: string
): BusinessOnboardingError => {
  const response = (err as RejectedRequest)?.response;

  // No response at all — offline, DNS failure, or a timeout on a long upload.
  if (!response) {
    return { message: fallbackMessage, code: "NETWORK" };
  }

  const data = response.data;

  return {
    code: data?.code,
    message: data?.failureReason || data?.message || fallbackMessage,
    status: response.status,
    failureReason: data?.failureReason ?? null,
    maxAttemptsReached: data?.maxAttemptsReached === true,
  };
};

// ---------------------------------------------------------------------------
// Step 1 — contact details, OTP dispatch, resume detection
// ---------------------------------------------------------------------------

export function initiateBusinessOnboarding(payload: {
  email: string;
  mobileNumber: string;
}): Promise<BusinessStepResponse> {
  return axiosBusinessOnboarding
    .post("/initiate", payload)
    .then(unwrap<BusinessStepResponse>);
}

/** Correct a mistyped email/mobile — only valid before the OTP is verified. */
export function submitBusinessContact(payload: {
  sessionId: string;
  email: string;
  mobileNumber: string;
}): Promise<BusinessStepResponse> {
  return axiosBusinessOnboarding
    .post("/submit-contact", payload)
    .then(unwrap<BusinessStepResponse>);
}

/** Omit `mobileNumber` to resend to the number already on file. */
export function resendBusinessOtp(payload: {
  sessionId: string;
  mobileNumber?: string;
}): Promise<BusinessStepResponse> {
  return axiosBusinessOnboarding
    .post("/resend-otp", payload)
    .then(unwrap<BusinessStepResponse>);
}

// ---------------------------------------------------------------------------
// Steps 2–4 — identity proof
// ---------------------------------------------------------------------------

export function verifyBusinessOtp(payload: {
  sessionId: string;
  mobileOtp: string;
}): Promise<BusinessStepResponse> {
  return axiosBusinessOnboarding
    .post("/verify-otp", payload)
    .then(unwrap<BusinessStepResponse>);
}

export function verifyBusinessEmailMpin(payload: {
  sessionId: string;
  emailMpinCode: string;
}): Promise<BusinessStepResponse> {
  return axiosBusinessOnboarding
    .post("/verify-email-mpin", payload)
    .then(unwrap<BusinessStepResponse>);
}

/** Resume path — issues a FRESH token pair that replaces the stored one. */
export function verifyBusinessResumePin(payload: {
  sessionId: string;
  pin: string;
}): Promise<BusinessStepResponse> {
  return axiosBusinessOnboarding
    .post("/verify-resume-pin", payload)
    .then(unwrap<BusinessStepResponse>);
}

export function setBusinessPin(payload: {
  sessionId: string;
  pin: string;
  confirmPin: string;
}): Promise<BusinessStepResponse> {
  return axiosBusinessOnboarding
    .post("/set-pin", payload)
    .then(unwrap<BusinessStepResponse>);
}

// ---------------------------------------------------------------------------
// Steps 5–6 — business profile
// ---------------------------------------------------------------------------

export interface BusinessInfoPayload {
  sessionId: string;
  countryCode: string;
  businessTypeCode: string;
  registrationNumber: string;
  businessName: string;
  businessEmail?: string;
  website?: string;
  description?: string;
}

/** Re-submittable — sending it again overwrites the previous values. */
export function submitBusinessInfo(
  payload: BusinessInfoPayload
): Promise<BusinessStepResponse> {
  return axiosBusinessOnboarding
    .post("/submit-business-info", payload)
    .then(unwrap<BusinessStepResponse>);
}

export function submitBusinessAddress(payload: {
  sessionId: string;
  city: string;
  businessAddress: string;
  postalCode?: string;
}): Promise<BusinessStepResponse> {
  return axiosBusinessOnboarding
    .post("/submit-address", payload)
    .then(unwrap<BusinessStepResponse>);
}

// ---------------------------------------------------------------------------
// Steps 7–9 — documents and biometrics
// ---------------------------------------------------------------------------

/**
 * Batch upload. Repeatable — call again to add more; progress never regresses.
 * The `files` and `documentKinds` arrays are positional and must stay aligned,
 * which is why this takes pairs rather than two loose arrays.
 */
export function uploadBusinessDocuments(
  sessionId: string,
  entries: Array<{ file: File; documentKind: BusinessDocumentKind }>
): Promise<BusinessStepResponse> {
  const form = new FormData();
  form.append("sessionId", sessionId);
  entries.forEach((entry) => {
    form.append("files", entry.file);
    form.append("documentKinds", entry.documentKind);
  });

  return axiosBusinessOnboarding
    .post("/upload-document", form, { timeout: UPLOAD_TIMEOUT_MS })
    .then(unwrap<BusinessStepResponse>);
}

export function uploadBusinessPassport(
  sessionId: string,
  file: File
): Promise<BusinessStepResponse> {
  const form = new FormData();
  form.append("sessionId", sessionId);
  form.append("file", file);

  return axiosBusinessOnboarding
    .post("/upload-passport", form, { timeout: UPLOAD_TIMEOUT_MS })
    .then(unwrap<BusinessStepResponse>);
}

export interface ConfirmPassportDataPayload {
  sessionId: string;
  surname?: string;
  givenName?: string;
  nationality?: string;
  dateOfBirth?: string;
  passportNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  /** The OWNER's personal address — not the business address from step 6. */
  homeAddress?: string;
  countryOfOrigin?: string;
  residentialCountry?: string;
}

/** Omitted/blank fields fall back to the OCR values — nothing is ever wiped. */
export function confirmBusinessPassportData(
  payload: ConfirmPassportDataPayload
): Promise<BusinessStepResponse> {
  return axiosBusinessOnboarding
    .post("/confirm-data", payload)
    .then(unwrap<BusinessStepResponse>);
}

/** Terminal step — creates the SME customer and wallet. */
export function uploadBusinessSelfie(
  sessionId: string,
  file: File
): Promise<BusinessStepResponse> {
  const form = new FormData();
  form.append("sessionId", sessionId);
  form.append("file", file);

  return axiosBusinessOnboarding
    .post("/upload-selfie", form, { timeout: UPLOAD_TIMEOUT_MS })
    .then(unwrap<BusinessStepResponse>);
}

// ---------------------------------------------------------------------------
// Step 10 — PEP / EDD declaration (optional, post-completion)
// ---------------------------------------------------------------------------

export interface PepRelatedPerson {
  name: string;
  relationship: string;
  position: string;
}

export interface PepDeclarationPayload {
  sessionId: string;
  isPep: boolean;
  primarySourceOfWealth?: string;
  estimatedNetWorth?: string;
  sourceOfFunds?: string;
  occupation?: string;
  relatedPersons?: PepRelatedPerson[];
  additionalNotes?: string | null;
  politicalPosition?: string;
  governmentBody?: string;
  countryOfInfluence?: string;
  positionStartDate?: string;
  positionEndDate?: string;
}

export function submitBusinessPep(
  payload: PepDeclarationPayload
): Promise<BusinessStepResponse> {
  return axiosBusinessOnboarding
    .post("/submit-pep", payload)
    .then(unwrap<BusinessStepResponse>);
}

// ---------------------------------------------------------------------------
// Status — no auth required
// ---------------------------------------------------------------------------

export function getBusinessOnboardingStatus(
  sessionId: string
): Promise<BusinessOnboardingStatus> {
  return axiosBusinessOnboarding
    .get("/status", { params: { sessionId } })
    .then(unwrap<BusinessOnboardingStatus>);
}

// ---------------------------------------------------------------------------
// Reference data (customer-service, public)
// ---------------------------------------------------------------------------

export function getOnboardingCountries(): Promise<CountryConfig[]> {
  return axiosPublicReferenceData
    .get("/api/v1/country-config/countries")
    .then((res) => (res?.data?.data ?? []) as CountryConfig[]);
}

export function getOnboardingBusinessTypes(
  countryCode: string
): Promise<BusinessType[]> {
  return axiosPublicReferenceData
    .get(`/api/v1/country-config/${countryCode}/business-types`)
    .then((res) => (res?.data?.data ?? []) as BusinessType[]);
}
