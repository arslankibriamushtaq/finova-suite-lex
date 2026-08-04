/**
 * Client-side session store for the public business (SME/KYB) onboarding flow.
 *
 * Deliberately separate from the admin session in Redux (`block.token`):
 *  - the token minted by `/verify-otp` belongs to the *applicant*, not the
 *    logged-in back-office user, so writing it into Redux/localStorage would
 *    hijack an admin's session in the same browser tab.
 *  - onboarding state lives in `sessionStorage` (per tab, cleared on close) —
 *    the server is the source of truth and `/status` rehydrates after a reload.
 *
 * The device id is the one exception: it must stay stable per browser install
 * (the risk gate keys off it), so it lives in `localStorage`.
 */

const SESSION_ID_KEY = "bizOnb.sessionId";
const ACCESS_TOKEN_KEY = "bizOnb.accessToken";
const REFRESH_TOKEN_KEY = "bizOnb.refreshToken";
const DEVICE_ID_KEY = "bizOnb.deviceId";

const safeGet = (storage: Storage, key: string): string | null => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (storage: Storage, key: string, value: string): void => {
  try {
    storage.setItem(key, value);
  } catch {
    /* private-mode / quota — the flow still works, it just cannot resume */
  }
};

const safeRemove = (storage: Storage, key: string): void => {
  try {
    storage.removeItem(key);
  } catch {
    /* ignore */
  }
};

export const getSessionId = (): string | null =>
  safeGet(sessionStorage, SESSION_ID_KEY);

export const setSessionId = (sessionId: string): void =>
  safeSet(sessionStorage, SESSION_ID_KEY, sessionId);

export const getAccessToken = (): string | null =>
  safeGet(sessionStorage, ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null =>
  safeGet(sessionStorage, REFRESH_TOKEN_KEY);

/**
 * Store the token pair minted by `/verify-otp` — or the *fresh* pair issued by
 * `/verify-resume-pin`, which replaces it.
 */
export const setTokens = (accessToken?: string | null, refreshToken?: string | null): void => {
  if (accessToken) safeSet(sessionStorage, ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) safeSet(sessionStorage, REFRESH_TOKEN_KEY, refreshToken);
};

/** Wipe everything except the device id (which is intentionally long-lived). */
export const clearSession = (): void => {
  safeRemove(sessionStorage, SESSION_ID_KEY);
  safeRemove(sessionStorage, ACCESS_TOKEN_KEY);
  safeRemove(sessionStorage, REFRESH_TOKEN_KEY);
};

/** Stable per browser install; minted on first use. */
export const getDeviceId = (): string => {
  const existing = safeGet(localStorage, DEVICE_ID_KEY);
  if (existing) return existing;

  const generated =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `web-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

  safeSet(localStorage, DEVICE_ID_KEY, generated);
  return generated;
};
