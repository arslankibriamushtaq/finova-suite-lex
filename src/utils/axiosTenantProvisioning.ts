import Axios from "axios";
import { attachAcceptLanguage } from "./acceptLanguage";

/**
 * Axios instance for the PUBLIC tenant self-signup flow.
 *
 * Contract: `tenant-provisioning-service`, reached through Kong on the
 * `/tenant-provisioning-service` prefix.
 *
 * Every endpoint behind this instance is public by design: at this point in the
 * journey there is no tenant, no user and no token. So, unlike every other
 * instance in `src/utils`, this one deliberately sends:
 *
 *   - no `Authorization` header (a back-office admin browsing the pricing page
 *     must not have their token leak into a signup), and
 *   - no `X-Tenant-Id` (the tenant is what this flow creates).
 *
 * A 401/403 here is a server misconfiguration, not an expired session, so there
 * is no redirect interceptor either — the calling screen renders the error.
 */
const axiosTenantProvisioning = Axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/tenant-provisioning-service/api/v1`,
});

axiosTenantProvisioning.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  config.headers["Content-Type"] = "application/json";
  return config;
});

// Error `message`s come back localized; `code` does not. Screens switch on the
// code and render the message.
attachAcceptLanguage(axiosTenantProvisioning);

export default axiosTenantProvisioning;
