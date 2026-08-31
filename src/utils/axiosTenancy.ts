import Axios from "axios";

import { attachAcceptLanguage } from "./acceptLanguage";
import { store } from "../redux/store";
import { setToken } from "../redux/apis/apisSlice";

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
  (error) => {
    // 401 here means no readable `tenant_id` claim or a dead token: re-login,
    // never retry. A 403 is a missing Casbin policy and is the screen's to
    // render — the menu row should already have been hidden.
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      store.dispatch(setToken({ token: "" }));
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

attachAcceptLanguage(axiosTenancy);

export default axiosTenancy;
