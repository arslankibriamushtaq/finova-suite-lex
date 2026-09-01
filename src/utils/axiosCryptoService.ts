import Axios from "axios";
import { attachAcceptLanguage } from "./acceptLanguage";
import { store } from "../redux/store";
import { setToken } from "../redux/apis/apisSlice";
import { redirectToLogin } from "./redirectToLogin";

/**
 * crypto-service (port 8102, `crypto_db`), mounted on the gateway at
 * /crypto-service.
 *
 * `tenant_id` comes from the JWT — never sent by this client, and a token
 * without the claim is an error on the server rather than a default tenant.
 */
const axiosCryptoService = Axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/crypto-service`,
});

axiosCryptoService.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  // `store.getState()` is already typed as RootState — the older service
  // clients cast it to `any`, which is the one lint error each of them carries.
  const token = store.getState().block.token;

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

axiosCryptoService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      store.dispatch(setToken({ token: "" }));
      redirectToLogin();
    }

    // Deliberately no toast on 500, unlike the older service clients. Every
    // crypto call site already renders the failure through
    // `cryptoErrorMessage`, which is localised and knows the error codes — a
    // toast here as well means two toasts for one failure, and the raw one wins
    // the stack and hides the useful one.
    return Promise.reject(error);
  }
);

attachAcceptLanguage(axiosCryptoService);

export default axiosCryptoService;
