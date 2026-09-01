import axios from "axios";

/**
 * Which realm Keycloak signs the user into is decided by this one parameter and
 * nowhere else: `context=TENANT` yields a PlatformRealm/tenant-portal URL, where
 * workspace administrators live, and omitting it keeps CompanyRealm/react-frontend
 * for customers and the superadmin. The callback needs no matching change — the
 * server remembers the realm against the `state` it issues here.
 *
 * A workspace administrator sent to the context-less URL gets Keycloak's
 * `user_not_found`, however correct their password: their account is simply in
 * the other realm. That makes a stray second call expensive — the later
 * `window.location.href` wins, so one context-less caller silently undoes a
 * correct one. Hence a single entry point, and the guard below.
 */
export type SsoContext = "TENANT";

/**
 * Set once the browser is committed to leaving for Keycloak. A second call —
 * a re-mount, a StrictMode double-invoke, or a 401 interceptor redirecting
 * mid-flight — must not issue its own `login-url` and overwrite the pending
 * navigation with a different realm's.
 */
let navigating = false;

export const isSsoLoginStarted = (): boolean => navigating;

export async function startSsoLogin(context?: SsoContext): Promise<void> {
  if (navigating) return;
  navigating = true;

  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/identity-service/api/v1/auth/sso/login-url`,
      {
        params: {
          redirect_uri: `${window.location.origin}/callback`,
          ...(context ? { context } : {}),
        },
      }
    );
    const { authUrl, state } = res.data.data;
    sessionStorage.setItem("sso_state", state);
    window.location.href = authUrl;
  } catch (err) {
    // Nothing was navigated to, so let the caller retry.
    navigating = false;
    throw err;
  }
}
