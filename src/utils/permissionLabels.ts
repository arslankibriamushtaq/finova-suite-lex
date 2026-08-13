import type { TFunction } from "i18next";

/**
 * Localized labels for permission-catalog data.
 *
 * The catalog is served, not authored here, so its module and permission names
 * arrive in one language. These helpers translate them from the STABLE code
 * (`CUSTOMER_READ`) rather than the display name, which the backend may reword
 * at any time. See `src/i18n/locales/permissions.ts` for the vocabulary.
 */

/**
 * Action suffixes, longest first: `USER_BLOCK_REMOVE` must match `REMOVE`
 * before a shorter suffix can claim part of the resource.
 */
const ACTIONS = [
  "DEACTIVATE",
  "AUTHORIZE",
  "DOWNLOAD",
  "ACTIVATE",
  "DISBURSE",
  "APPROVE",
  "REFUND",
  "RESEND",
  "REVERSE",
  "SUSPEND",
  "ASSIGN",
  "CANCEL",
  "CREATE",
  "DELETE",
  "EXPORT",
  "FREEZE",
  "IMPORT",
  "MANAGE",
  "REJECT",
  "REMOVE",
  "REVIEW",
  "REVOKE",
  "SEARCH",
  "SETTLE",
  "UPDATE",
  "UPLOAD",
  "VERIFY",
  "APPLY",
  "BLOCK",
  "CHECK",
  "CLOSE",
  "PRINT",
  "RETRY",
  "WRITE",
  "LIST",
  "READ",
  "SEND",
  "SYNC",
  "VIEW",
  "PAY",
].sort((a, b) => b.length - a.length);

/**
 * Codes already reported this session, so a 200-row catalog warns once per
 * missing word instead of once per render.
 */
const reported = new Set<string>();

/**
 * In dev, name the vocabulary gaps out loud. The catalog is served, so the only
 * way to find an untranslated code is to meet one — this turns "some rows are
 * still English" into an exact list to paste into `permissions.ts`.
 */
const reportMissing = (kind: "resource" | "action", key: string) => {
  if (!import.meta.env?.DEV) return;
  const id = `${kind}.${key}`;
  if (reported.has(id)) return;
  reported.add(id);
  console.warn(`[i18n] permissions: no translation for "${id}" — add it to src/i18n/locales/permissions.ts`);
};

/** Title-cased fallback for anything the vocabulary does not cover. */
export const prettifyCode = (raw: string): string =>
  (raw || "")
    .replace(/[_.]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** Split `CUSTOMER_READ` into its resource and action halves. */
export const splitPermissionCode = (
  code: string
): { resource: string; action: string | null } => {
  const upper = (code || "").toUpperCase();
  for (const action of ACTIONS) {
    if (upper.endsWith(`_${action}`)) {
      return { resource: upper.slice(0, -(action.length + 1)), action };
    }
  }
  return { resource: upper, action: null };
};

/**
 * A module's display name.
 * @param t     a `t` bound to (or able to reach) the `permissions` namespace
 * @param code  the module code, e.g. "SULLIS_CASH"
 * @param fallback the server's own name, used when the code is unknown
 */
export const moduleLabel = (t: TFunction, code: string, fallback?: string): string => {
  const upper = (code || "").toUpperCase();
  const hit = t(`permissions:module.${upper}`, { defaultValue: "" }) as string;
  if (!hit) reportMissing("resource", `module.${upper}`);
  return hit || prettifyCode(fallback || code);
};

/**
 * A permission's display name, composed from its two halves so a code the
 * backend adds later is localized without touching this file.
 *
 * Falls back to the server's name — then to the prettified code — whenever
 * either half is missing from the vocabulary, so a row is never blank and
 * never shows a raw i18n key.
 */
export const permissionLabel = (t: TFunction, code: string, fallback?: string): string => {
  const { resource, action } = splitPermissionCode(code);
  const resourceText = t(`permissions:resource.${resource}`, { defaultValue: "" }) as string;
  const actionText = action
    ? (t(`permissions:action.${action}`, { defaultValue: "" }) as string)
    : "";
  if (!resourceText) reportMissing("resource", resource);
  if (action && !actionText) reportMissing("action", action);

  // A resource with no action suffix is a whole-module grant — name it alone.
  if (resourceText && !action) return resourceText;
  if (actionText) {
    // The verb is always translated. When the noun is not in the vocabulary yet
    // it degrades to the prettified code rather than dropping the whole label
    // back to English — the action is the part that differs row to row, so
    // keeping it localized is what makes the list readable.
    return t("permissions:format", {
      action: actionText,
      resource: resourceText || prettifyCode(resource),
      defaultValue: `${actionText} ${resourceText || prettifyCode(resource)}`,
    }) as string;
  }
  return prettifyCode(fallback || code);
};
