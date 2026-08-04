import type { BusinessNextAction } from "../../redux/apis/apisBusinessOnboarding";

/**
 * The single place that maps the server's `nextAction` onto a route.
 *
 * The client never decides what comes next: passport reuse silently skips two
 * steps, and only the server knows whether that applies. Every screen finishes
 * by handing its response to `routeForNextAction`.
 */

export const BUSINESS_ONBOARDING_ROUTES = {
  start: "/business/start",
  otp: "/business/otp",
  resumePin: "/business/resume-pin",
  emailCode: "/business/email-code",
  setPin: "/business/set-pin",
  details: "/business/details",
  address: "/business/address",
  documents: "/business/documents",
  passport: "/business/passport",
  passportReview: "/business/passport-review",
  selfie: "/business/selfie",
  underReview: "/business/under-review",
  pep: "/business/pep",
} as const;

const NEXT_ACTION_ROUTES: Record<BusinessNextAction, string> = {
  VERIFY_OTP: BUSINESS_ONBOARDING_ROUTES.otp,
  VERIFY_EMAIL_MPIN: BUSINESS_ONBOARDING_ROUTES.emailCode,
  VERIFY_RESUME_PIN: BUSINESS_ONBOARDING_ROUTES.resumePin,
  SET_PIN: BUSINESS_ONBOARDING_ROUTES.setPin,
  SUBMIT_BUSINESS_INFO: BUSINESS_ONBOARDING_ROUTES.details,
  SUBMIT_ADDRESS: BUSINESS_ONBOARDING_ROUTES.address,
  UPLOAD_DOCUMENT: BUSINESS_ONBOARDING_ROUTES.documents,
  UPLOAD_PASSPORT: BUSINESS_ONBOARDING_ROUTES.passport,
  CONFIRM_DATA: BUSINESS_ONBOARDING_ROUTES.passportReview,
  UPLOAD_SELFIE: BUSINESS_ONBOARDING_ROUTES.selfie,
  PENDING_REVIEW: BUSINESS_ONBOARDING_ROUTES.underReview,
  RESTART: BUSINESS_ONBOARDING_ROUTES.start,
  // The risk gate decided this applicant belongs somewhere else entirely.
  ROUTE_LOGIN: "/login",
  ROUTE_REONBOARDING: BUSINESS_ONBOARDING_ROUTES.start,
};

/** Unknown or missing actions fall back to the entry point rather than a blank screen. */
export const routeForNextAction = (nextAction?: string | null): string =>
  NEXT_ACTION_ROUTES[nextAction as BusinessNextAction] ??
  BUSINESS_ONBOARDING_ROUTES.start;

// ---------------------------------------------------------------------------
// Going back
// ---------------------------------------------------------------------------

/**
 * Where "Back" goes from each screen — deliberately not every screen.
 *
 * A back link is only honest when the step it returns to can be *re-submitted*:
 * `/submit-business-info`, `/submit-address` and `/confirm-data` overwrite, and
 * `/upload-document` and `/upload-passport` are repeatable, so returning to
 * them costs nothing.
 *
 * The identity steps are excluded on purpose. Once an OTP, an emailed mPIN or a
 * PIN has been accepted the server has moved on, and a back link would promise
 * an undo it cannot deliver — the OTP screen offers "wrong email or number?"
 * instead, which actually re-sends. The entry and terminal screens have nowhere
 * to go.
 */
const PREVIOUS_ROUTES: Record<string, string> = {
  [BUSINESS_ONBOARDING_ROUTES.address]: BUSINESS_ONBOARDING_ROUTES.details,
  [BUSINESS_ONBOARDING_ROUTES.documents]: BUSINESS_ONBOARDING_ROUTES.address,
  [BUSINESS_ONBOARDING_ROUTES.passport]: BUSINESS_ONBOARDING_ROUTES.documents,
  [BUSINESS_ONBOARDING_ROUTES.passportReview]: BUSINESS_ONBOARDING_ROUTES.passport,
  [BUSINESS_ONBOARDING_ROUTES.selfie]: BUSINESS_ONBOARDING_ROUTES.passportReview,
  // The PEP screen is absent on purpose: its own "Skip for now" already leaves
  // for the same place and says more clearly that nothing was recorded.
};

export const previousRoute = (
  pathname: string,
  { passportReused }: { passportReused?: boolean } = {}
): string | null => {
  // On passport reuse the two passport screens never ran, so stepping back off
  // the selfie has to skip them the same way the forward path did.
  if (pathname === BUSINESS_ONBOARDING_ROUTES.selfie && passportReused) {
    return BUSINESS_ONBOARDING_ROUTES.documents;
  }
  return PREVIOUS_ROUTES[pathname] ?? null;
};

// ---------------------------------------------------------------------------
// Progress display
// ---------------------------------------------------------------------------

/**
 * Screens collapse into five user-facing phases. Thirteen dots would read as a
 * chore; five reads as a journey — and the phases stay stable even when the
 * passport screens are skipped.
 */
export type OnboardingPhase = "contact" | "security" | "business" | "documents" | "identity";

export const ONBOARDING_PHASES: OnboardingPhase[] = [
  "contact",
  "security",
  "business",
  "documents",
  "identity",
];

const ROUTE_PHASES: Record<string, OnboardingPhase> = {
  // `/business` renders the entry screen too, so it needs the same phase —
  // otherwise the stepper silently disappears on the un-suffixed URL.
  "/business": "contact",
  [BUSINESS_ONBOARDING_ROUTES.start]: "contact",
  [BUSINESS_ONBOARDING_ROUTES.otp]: "contact",
  [BUSINESS_ONBOARDING_ROUTES.resumePin]: "contact",
  [BUSINESS_ONBOARDING_ROUTES.emailCode]: "security",
  [BUSINESS_ONBOARDING_ROUTES.setPin]: "security",
  [BUSINESS_ONBOARDING_ROUTES.details]: "business",
  [BUSINESS_ONBOARDING_ROUTES.address]: "business",
  [BUSINESS_ONBOARDING_ROUTES.documents]: "documents",
  [BUSINESS_ONBOARDING_ROUTES.passport]: "identity",
  [BUSINESS_ONBOARDING_ROUTES.passportReview]: "identity",
  [BUSINESS_ONBOARDING_ROUTES.selfie]: "identity",
};

export const phaseForRoute = (pathname: string): OnboardingPhase | null =>
  ROUTE_PHASES[pathname] ?? null;
