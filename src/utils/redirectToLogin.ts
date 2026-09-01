import { isSsoLoginStarted } from "../auth/startSsoLogin";

/** Login screens, which must never be redirected away from. */
const LOGIN_PATHS = /^\/(tenant\/)?login\/?$/;

/**
 * Sends the browser to the customer login screen after a session ends.
 *
 * Does nothing when a login is already under way. `/tenant/login` asks for a
 * PlatformRealm sign-in URL and then navigates to Keycloak; a stray 401 landing
 * in that window would send the browser to `/login`, which starts a second,
 * context-less `login-url` call whose redirect wins — putting a workspace
 * administrator on CompanyRealm, where their account does not exist. The same
 * guard also stops a burst of simultaneous 401s from re-entering `/login`.
 */
export const redirectToLogin = (): void => {
  if (isSsoLoginStarted() || LOGIN_PATHS.test(window.location.pathname)) return;
  window.location.href = "/login";
};
