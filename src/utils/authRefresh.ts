import Axios from "axios";

import { store } from "../redux/store";
import { setToken, setRefreshToken } from "../redux/apis/apisSlice";
import { redirectToLogin } from "./redirectToLogin";

/**
 * Exchanging an expired access token for a fresh one.
 *
 * Access tokens live one hour. Before this existed a token that aged out mid-
 * session produced a 401 on every subsequent call, which read as a server fault
 * — the backend traced one such report to the same expired token being replayed
 * for seventeen hours.
 *
 * Contract (identity-service, verified against its OpenAPI document):
 *
 *   POST /identity-service/api/v1/auth/refresh   { refreshToken }
 *     → { data: { accessToken, refreshToken, expiresIn, tokenType } }
 *
 * A plain axios call on purpose: routing this through an instance whose own
 * interceptor refreshes on 401 would recurse the first time the refresh token
 * itself expires.
 */

/**
 * The refresh in flight, if any.
 *
 * A dashboard fires several requests at once, so an expired token yields a
 * burst of simultaneous 401s. Without this they would each start a refresh, and
 * every one after the first would present a refresh token the server had
 * already rotated away — turning a recoverable session into a forced logout.
 */
let inFlight: Promise<string | null> | null = null;

/** Wipes the session and sends the browser to login, unless one is under way. */
export const clearSessionAndRedirect = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("userData");
  store.dispatch(setToken({ token: "" }));
  redirectToLogin();
};

/**
 * Returns a fresh access token, or `null` when the session cannot be saved —
 * no refresh token to present, or one the server has itself rejected. A `null`
 * is the caller's cue to give up and re-authenticate; it is deliberately not an
 * exception, because every caller is already inside a `catch`.
 */
export const refreshAccessToken = (): Promise<string | null> => {
  if (inFlight) return inFlight;

  const refreshToken = store.getState().block.refreshToken;
  if (!refreshToken) return Promise.resolve(null);

  inFlight = Axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/identity-service/api/v1/auth/refresh`,
    { refreshToken }
  )
    .then((res) => {
      const data = res.data?.data;
      if (!data?.accessToken) return null;

      store.dispatch(setToken({ token: data.accessToken }));
      localStorage.setItem("token", data.accessToken);

      // Keycloak rotates the refresh token on every use. Missing this would
      // buy exactly one more hour and then fail for good.
      if (data.refreshToken) {
        store.dispatch(setRefreshToken({ refreshToken: data.refreshToken }));
      }

      return data.accessToken as string;
    })
    .catch(() => null)
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};
