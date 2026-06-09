import { store } from "../redux/store";
import { setToken } from "../redux/apis/apisSlice";

/**
 * Decide how to react to a 401 from an API call.
 *
 * Only force a logout + redirect to /login when the user is genuinely
 * unauthenticated (no token in the Redux store or localStorage). A 401 from a
 * single endpoint while a valid session still exists — e.g. a microservice that
 * rejects/denies one request — must NOT destroy the whole session and
 * hard-reload the app to the login page. That aggressive behaviour was causing
 * pages (e.g. Notification Orchestrator) to bounce users to login whenever one
 * of their backend calls returned 401.
 *
 * Returns true if a logout/redirect was triggered.
 */
export function handleUnauthorized(): boolean {
  const hasToken =
    Boolean((store.getState() as any)?.block?.token) ||
    Boolean(localStorage.getItem("token"));

  if (hasToken) {
    // Authenticated session present → let the caller handle the error locally.
    return false;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("userData");
  // Clear persisted redux state so guards don't redirect back in a loop.
  localStorage.removeItem("persist:root");
  store.dispatch(setToken({ token: "" }));
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
  return true;
}
