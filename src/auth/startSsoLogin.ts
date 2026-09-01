import axios from "axios";

/**
 * Every caller signs into the same realm: `login-url` is asked without a
 * `context`, which keeps CompanyRealm/react-frontend. The callback needs no
 * matching change — the server remembers the realm against the `state` it
 * issues here.
 *
 * A stray second call is expensive: the later `window.location.href` wins and
 * overwrites the pending navigation. Hence a single entry point, and the guard
 * below.
 */

/**
 * Set once the browser is committed to leaving for Keycloak. A second call —
 * a re-mount, a StrictMode double-invoke, or a 401 interceptor redirecting
 * mid-flight — must not issue its own `login-url` and overwrite the pending
 * navigation with a different realm's.
 */
let navigating = false;

export const isSsoLoginStarted = (): boolean => navigating;

export async function startSsoLogin(): Promise<void> {
  if (navigating) return;
  navigating = true;

  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/identity-service/api/v1/auth/sso/login-url`,
      {
        params: {
          redirect_uri: `${window.location.origin}/callback`,
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
