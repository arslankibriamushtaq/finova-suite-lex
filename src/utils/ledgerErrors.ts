/**
 * Ledger error handling.
 *
 * The ledger returns 422 with a machine-readable `code` and a `message` already
 * translated into the language we sent in `Accept-Language`. Branch on `code` —
 * never on `message` or `error`, which change with the user's language.
 */

export const LEDGER_ERROR_CODES = {
  CURRENCY_REQUIRED: "LEDGER.CURRENCY.REQUIRED",
  CURRENCY_UNSUPPORTED: "LEDGER.CURRENCY.UNSUPPORTED",
  ACCOUNT_NOT_FOUND: "LEDGER.ACCOUNT.NOT_FOUND",
  ACCOUNT_WRONG_TENANT: "LEDGER.ACCOUNT.WRONG_TENANT",
  ACCOUNT_IS_HEADER: "LEDGER.ACCOUNT.IS_HEADER",
  ACCOUNT_NOT_POSTABLE: "LEDGER.ACCOUNT.NOT_POSTABLE",
} as const;

export type LedgerErrorCode =
  (typeof LEDGER_ERROR_CODES)[keyof typeof LEDGER_ERROR_CODES];

export interface LedgerError {
  /** e.g. "LEDGER.ACCOUNT.IS_HEADER" — the only field safe to branch on. */
  code?: string;
  /** Server-translated, ready to show. */
  message?: string;
  status?: number;
  traceId?: string;
}

/** Pull the ledger's error envelope out of an axios error, if it is one. */
export const getLedgerError = (error: any): LedgerError | null => {
  const body = error?.response?.data;
  if (!body) return null;
  const payload = body.data && typeof body.data === "object" ? body.data : body;
  if (!payload.code && !payload.message) return null;
  return {
    code: payload.code,
    message: payload.message,
    status: payload.status ?? error?.response?.status,
    traceId: payload.traceId,
  };
};

export const isLedgerErrorCode = (error: any, code: LedgerErrorCode): boolean =>
  getLedgerError(error)?.code === code;

/**
 * The message to show the user. The server already localised it, so prefer it
 * over anything we could write; `fallback` covers a network failure or any
 * response that isn't a ledger error envelope.
 */
export const ledgerErrorMessage = (error: any, fallback: string): string =>
  getLedgerError(error)?.message || error?.message || fallback;
