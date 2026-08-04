import Axios from "axios";
import { attachAcceptLanguage } from "./acceptLanguage";
import { getAccessToken, getDeviceId } from "./businessOnboardingSession";

/**
 * Axios instance for the PUBLIC business onboarding journey.
 *
 * Two things make it different from every other instance in `src/utils`:
 *
 *  1. It reads its bearer token from the onboarding session store, never from
 *     Redux — the applicant's token and the back-office admin's token must not
 *     mix (see `businessOnboardingSession.ts`).
 *  2. A 401 does NOT bounce to `/login`. These routes are public; an expired
 *     onboarding token means "re-verify your PIN", which the calling screen
 *     handles by routing back to `/business/start`.
 *
 * Gateway path confirmed against the Kong route: `/onboarding-service` is the
 * upstream prefix for `onboarding-workflow-service`.
 */
const axiosBusinessOnboarding = Axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/onboarding-service/api/v1/onboarding/business`,
});

axiosBusinessOnboarding.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = getAccessToken();

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  // Feeds the risk gate — stable per browser install.
  config.headers["X-Device-Id"] = getDeviceId();

  const tenantId = localStorage.getItem("tenantId");
  if (tenantId) {
    config.headers["X-Tenant-Id"] = tenantId;
  }

  // Let axios set the multipart boundary itself on FormData bodies.
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

attachAcceptLanguage(axiosBusinessOnboarding);

export default axiosBusinessOnboarding;

/**
 * Reference data (countries, business types) is served by customer-service and
 * needs no auth, so it gets its own bare instance rather than reusing
 * `axiosCustomerService` (which stamps the admin token and redirects on 401).
 */
export const axiosPublicReferenceData = Axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/customer-service`,
});

attachAcceptLanguage(axiosPublicReferenceData);
