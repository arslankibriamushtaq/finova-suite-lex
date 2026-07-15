/**
 * Shape every per-module locale file must export as its default.
 *
 * One file per namespace lives in `src/i18n/locales/`. Because each module
 * owns its own file, many contributors (or parallel agents) can localize
 * different modules without ever editing the same file — the only shared
 * touch-point is the registration list in `src/i18n/index.ts`.
 *
 * Keys are FLAT dotted strings (the i18next instance runs with
 * keySeparator:false), e.g. "table.name", "modal.confirmDelete.title".
 */
export interface ModuleLocale {
  namespace: string;
  en: Record<string, string>;
  fr: Record<string, string>;
  ar: Record<string, string>;
}
