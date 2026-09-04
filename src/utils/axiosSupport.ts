import Axios from "axios";

import { attachAcceptLanguage } from "./acceptLanguage";
import { store } from "../redux/store";
import { clearSessionAndRedirect, refreshAccessToken } from "./authRefresh";

/**
 * Authenticated client for `support-service` — the complaints register.
 *
 * Everything here is bearer-authenticated and Casbin decides which of the two
 * queues the caller gets: `/tenant/support/**` is pinned to the token's
 * `tenant_id` claim, `/platform/support/**` is super-admin only. No tenant id
 * is ever sent as a header or a path variable — sending one would be either
 * ignored or wrong.
 */
const axiosSupport = Axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/support-service/api/v1`,
});

axiosSupport.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = store.getState().block.token;
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  config.headers["Content-Type"] = "application/json";
  return config;
});

axiosSupport.interceptors.response.use(
  (response) => response,
  async (error) => {
    // A 403 is a missing Casbin policy and is the screen's to render — the menu
    // row should already have been hidden. Only a 401 is ours to act on.
    if (error?.response?.status !== 401) return Promise.reject(error);

    const original = error.config;

    if (original && !original._retry) {
      original._retry = true;

      const token = await refreshAccessToken();
      if (token) {
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return axiosSupport(original);
      }
    }

    clearSessionAndRedirect();
    return Promise.reject(error);
  }
);

attachAcceptLanguage(axiosSupport);

export default axiosSupport;
