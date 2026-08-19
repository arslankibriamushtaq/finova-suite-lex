/**
 * Teardown for the back-office (admin) session held in Redux `block`.
 *
 * Logout handlers used to each remove their own guessed set of localStorage
 * keys — `awn-token` in one place, `token`/`userData`/`permissions` in another
 * — and none of them touched the Redux store or its persisted copy. The result
 * was that tokens, refresh tokens, permissions and applicant PII (`nid`, `dob`,
 * `crNumber`, `businessDetails`) survived logout and stayed readable to the
 * next person using the browser.
 *
 * Every logout and every terminal 401 should call this instead.
 *
 * Not to be confused with `clearSession()` in ./businessOnboardingSession,
 * which tears down the *applicant's* public onboarding session.
 */
import { store, persistor } from "../redux/store";
import { resetSession } from "../redux/apis/apisSlice";

/**
 * Keys written directly to web storage by assorted axios instances and header
 * components, outside Redux. Listed explicitly rather than clearing all of
 * localStorage so unrelated, non-sensitive keys (`tenantId`, the onboarding
 * device id) survive.
 */
const LEGACY_KEYS = [
  "token",
  "userData",
  "permissions",
  "awn-token",
  "awn-los-data",
  "awn-role-permissions",
  // Written by builds that persisted the whole store to localStorage.
  "persist:root",
];

export const clearAdminSession = async (): Promise<void> => {
  store.dispatch(resetSession());

  for (const key of LEGACY_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* storage unavailable — nothing to clear */
    }
  }

  try {
    // Drops the persisted `persist:auth` blob (token, refreshToken, cached
    // reference data) rather than leaving it for the next tab to rehydrate.
    await persistor.purge();
  } catch {
    /* best effort — never block the redirect that follows */
  }
};
