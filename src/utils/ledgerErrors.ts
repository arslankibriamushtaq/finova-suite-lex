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

export type LedgerErrorCode = (typeof LEDGER_ERROR_CODES)[keyof typeof LEDGER_ERROR_CODES];

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

/**
 * The rows out of a ledger report response.
 *
 * `data` is sometimes the array itself and sometimes an envelope that carries
 * it under a report-specific key (`accounts`, `installments`, `vouchers`, …)
 * alongside summary totals. Callers that assumed a bare array crashed with
 * "x.map is not a function" the moment they hit an enveloped report, so pick
 * the first array-valued property rather than guessing the key per endpoint.
 */
/** Keys the ledger has used for the row list, checked before anything else. */
const ROW_KEYS = [
  "content",
  "items",
  "rows",
  "records",
  "accounts",
  "vouchers",
  "entries",
  "installments",
  "dueInstallments",
  "collections",
  "loans",
  "customers",
  "products",
];

export const extractReportRows = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const envelope = data as Record<string, unknown>;

  for (const key of ROW_KEYS) {
    if (Array.isArray(envelope[key])) return envelope[key] as unknown[];
  }

  // Unknown envelope: take an array of objects over one of scalars, so a
  // `currencies: ["SAR"]` style field can't be mistaken for the rows.
  const arrays = Object.values(envelope).filter(Array.isArray) as unknown[][];
  return arrays.find((list) => typeof list[0] === "object" && list[0] !== null) ?? arrays[0] ?? [];
};

interface ReportPagination {
  pagination?: { totalElements?: number };
  pageInfo?: { totalItems?: number };
  data?: { totalCount?: number };
}

/** Total row count, whichever pagination envelope the endpoint uses. */
export const extractReportTotal = (body: unknown, rows: unknown[]): number => {
  const envelope = body as ReportPagination | null | undefined;
  return (
    envelope?.pagination?.totalElements ??
    envelope?.pageInfo?.totalItems ??
    envelope?.data?.totalCount ??
    rows.length
  );
};
