import type { AxiosInstance } from "axios";
import i18n, { SUPPORTED_LANGUAGES } from "../components/i18n";

/**
 * Resolve the currently selected app language as a base code (en | ar | fr).
 *
 * Reads i18n first (kept in sync with the language switcher in
 * `src/hooks/use-language.tsx`), then localStorage, then falls back to "en".
 * Region variants like "en-US" are normalised to their base code.
 */
export const getCurrentLanguage = (): string => {
  const lang =
    i18n.language ||
    (typeof window !== "undefined" && window.localStorage.getItem("language")) ||
    "en";
  const base = String(lang).split("-")[0];
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(base) ? base : "en";
};

/**
 * Attach a request interceptor that stamps every outgoing request with the
 * `Accept-Language` header set to the currently selected language. Resolved per
 * request, so switching language takes effect on the next API call with no reload.
 */
export const attachAcceptLanguage = (instance: AxiosInstance): void => {
  instance.interceptors.request.use((config) => {
    config.headers["Accept-Language"] = getCurrentLanguage();
    return config;
  });
};
