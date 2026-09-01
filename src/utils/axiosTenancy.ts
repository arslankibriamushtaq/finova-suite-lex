import Axios from "axios";

import { attachAcceptLanguage } from "./acceptLanguage";
import { store } from "../redux/store";
import { clearSessionAndRedirect, refreshAccessToken } from "./authRefresh";

/**
 * Authenticated client for `tenant-provisioning-service`.
 *
 * Separate instance from `axiosTenantProvisioning` on purpose: that one serves
 * the PUBLIC signup funnel and deliberately sends no `Authorization` header.
 * This one is the opposite — every call under `/platform/**` and
 * `/tenant-portal/**` is bearer-authenticated.
 *
 * **No tenant id is ever sent.** `/platform/**` reads across every tenant and
 * takes the tenant from a path variable the caller chose; `/tenant-portal/**`
 * takes it from the token's `tenant_id` claim. A header here would be either
 * ignored or wrong.
 */
const axiosTenancy = Axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/tenant-provisioning-service/api/v1`,
});

axiosTenancy.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = store.getState().block.token;
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  config.headers["Content-Type"] = "application/json";
  return config;
});

axiosTenancy.interceptors.response.use(
  (response) => response,
  async (error) => {
    // A 403 is a missing Casbin policy and is the screen's to render — the menu
    // row should already have been hidden. Only a 401 is ours to act on.
    if (error?.response?.status !== 401) return Promise.reject(error);

    const original = error.config;

    // Access tokens last an hour, so the common 401 is simply an aged-out
    // token: refresh once and replay. `_retry` bounds that to a single attempt,
    // so a token the server keeps refusing ends in logout rather than a loop.
    if (original && !original._retry) {
      original._retry = true;

      const token = await refreshAccessToken();
      if (token) {
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return axiosTenancy(original);
      }
    }

    // The refresh failed or was already spent: the session is genuinely over.
    clearSessionAndRedirect();
    return Promise.reject(error);
  }
);

attachAcceptLanguage(axiosTenancy);

export default axiosTenancy;
