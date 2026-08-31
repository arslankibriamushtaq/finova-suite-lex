/**
 * Routes and step order for the public tenant signup flow.
 *
 * Unlike the applicant journey next door, this flow's order IS fixed and known
 * client-side — pick, describe, pay, wait — so the stepper can be derived from
 * the path. Activation is deliberately not in this list: the buyer reaches it
 * from their inbox days later, on its own route, with no signup in session.
 */
export const TENANT_SIGNUP_ROUTES = {
  pricing: "/tenant",
  details: "/tenant/details",
  payment: "/tenant/payment",
  /**
   * Where BurqPay sends the customer back to. Configured server-side as the
   * checkout's return URL — if this moves, that config must move with it.
   */
  paymentReturn: "/tenant/payment/return",
  provisioning: "/tenant/provisioning",
} as const;

/** The activation screen. Configured server-side as PLATFORM_SET_PASSWORD_PATH —
 * if that value changes, this must change with it. */
export const TENANT_ACTIVATION_ROUTE = "/activate";

export type TenantSignupStep = "pricing" | "details" | "payment" | "setup";

export const TENANT_SIGNUP_STEPS: TenantSignupStep[] = [
  "pricing",
  "details",
  "payment",
  "setup",
];

/** Which step to light up in the stepper for a given path. */
export const stepForRoute = (pathname: string): TenantSignupStep | null => {
  const path = pathname.replace(/\/+$/, "") || "/tenant";

  if (path === TENANT_SIGNUP_ROUTES.pricing) return "pricing";
  if (path === TENANT_SIGNUP_ROUTES.details) return "details";
  if (path === TENANT_SIGNUP_ROUTES.payment) return "payment";
  if (path === TENANT_SIGNUP_ROUTES.paymentReturn) return "payment";
  if (path === TENANT_SIGNUP_ROUTES.provisioning) return "setup";

  return null;
};
