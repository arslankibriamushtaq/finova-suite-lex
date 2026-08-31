/**
 * Session store for the public tenant signup flow.
 *
 * Lives in `sessionStorage`, not Redux: the redux store is persisted for the
 * back-office admin session, and a buyer's in-flight signup has nothing to do
 * with it. Session (not local) storage because a signup is scoped to the tab
 * that started it — two tabs buying two workspaces must not overwrite one
 * another's reference number.
 *
 * What has to survive a refresh, and why:
 *   - `signupId`    — needed to open a checkout
 *   - `referenceNo` — needed to poll status, and the buyer quotes it to support
 *   - `orderId`     — BurqPay sends the customer back with nothing identifying
 *                     the payment, and it is what support asks for
 *   - idempotency key — reused across retries of the same form render
 */

const KEYS = {
  signupId: "tenantSignup.signupId",
  referenceNo: "tenantSignup.referenceNo",
  orderId: "tenantSignup.orderId",
  idempotencyKey: "tenantSignup.idempotencyKey",
  summary: "tenantSignup.summary",
  selection: "tenantSignup.selection",
} as const;

/** The frozen quote, as the server returned it — never recomputed locally. */
export interface StoredSignupSummary {
  referenceNo: string;
  companyName: string;
  adminEmail: string;
  billingCycle: string;
  packageCodes: string[];
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  expiresAt: string | null;
}

const read = (key: string): string | null => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    // Private-mode Safari and locked-down enterprise browsers throw here.
    return null;
  }
};

const write = (key: string, value: string): void => {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    /* Storage unavailable — the flow still works within a single page life. */
  }
};

const remove = (key: string): void => {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

export const getSignupId = (): string | null => read(KEYS.signupId);
export const setSignupId = (id: string): void => write(KEYS.signupId, id);

export const getReferenceNo = (): string | null => read(KEYS.referenceNo);
export const setReferenceNo = (ref: string): void => write(KEYS.referenceNo, ref);

export const getOrderId = (): string | null => read(KEYS.orderId);
export const setOrderId = (id: string): void => write(KEYS.orderId, id);

/** What the buyer picked on the pricing screen, so a refresh mid-form keeps it. */
export interface StoredSelection {
  packageCodes: string[];
  billingCycle: string;
}

export const getSelection = (): StoredSelection | null => {
  const raw = read(KEYS.selection);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredSelection;
    return Array.isArray(parsed?.packageCodes) ? parsed : null;
  } catch {
    return null;
  }
};

export const setSelection = (selection: StoredSelection): void =>
  write(KEYS.selection, JSON.stringify(selection));

export const getSummary = (): StoredSignupSummary | null => {
  const raw = read(KEYS.summary);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSignupSummary;
  } catch {
    return null;
  }
};

export const setSummary = (summary: StoredSignupSummary): void =>
  write(KEYS.summary, JSON.stringify(summary));

/**
 * The idempotency key for `POST /public/signups`.
 *
 * Generated ONCE per form render and reused on every retry, so a double-click
 * or a flaky network returns the original signup rather than a second quote the
 * buyer could pay for twice. `resetIdempotencyKey` is called when the form is
 * mounted fresh — a genuinely new signup deserves a new key.
 */
export const getIdempotencyKey = (): string => {
  const existing = read(KEYS.idempotencyKey);
  if (existing) return existing;

  const key = newUuid();
  write(KEYS.idempotencyKey, key);
  return key;
};

export const resetIdempotencyKey = (): string => {
  const key = newUuid();
  write(KEYS.idempotencyKey, key);
  return key;
};

/** Clears everything — used when a signup reaches a terminal dead end. */
export const clearTenantSignupSession = (): void => {
  Object.values(KEYS).forEach(remove);
};

function newUuid(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();

  // randomUUID needs a secure context; plain-http dev servers do not have one.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
