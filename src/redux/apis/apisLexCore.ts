/**
 * The pieces every LEX api module shares: the error envelope, paging, and the
 * vocabulary the screens are required to use consistently.
 */

/** The platform error envelope. `code` is stable; `error` and `message` are localized. */
export interface LexErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  code?: string;
  message?: string;
  path?: string;
  traceId?: string;
}

export interface LexFailure {
  response?: { status?: number; data?: LexErrorBody };
}

export interface LexPagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface LexPage<T> {
  content: T[];
  pagination: LexPagination;
}

export interface LexPageQuery {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}

/** Empty page — what a screen renders when a list call fails, rather than stale rows. */
export const emptyPage = <T>(size = 10): LexPage<T> => ({
  content: [],
  pagination: { page: 0, size, totalElements: 0, totalPages: 0 },
});

/**
 * The platform response envelope. **Every** LEX response is wrapped in it —
 * success and failure, `/api/v1` and `/internal` alike.
 *
 * ```
 * { "data": { … } | [ … ], "message": "success", "timestamp": "…",
 *   "pagination": { … } }   ← sibling of data on paged endpoints, NOT inside it
 * ```
 *
 * On an error there is no `data` key at all, which is why nothing in this file
 * reaches for `.data.data` unconditionally: that returns `undefined` on every
 * failure and gets reported as "the API returns null".
 */
interface LexEnvelope<T> {
  data?: T;
  message?: string;
  timestamp?: string;
  pagination?: Partial<LexPagination>;
}

/** An axios response, narrowed to the part this module reads. */
interface LexResponse<T> {
  data?: LexEnvelope<T> | T;
}

const isEnvelope = <T>(body: unknown): body is LexEnvelope<T> =>
  !!body && typeof body === "object" && !Array.isArray(body) && "data" in body;

/**
 * The payload, unwrapped.
 *
 * Reading the payload shape straight off `response.data` gives an object whose
 * every field is `undefined` — indistinguishable from "the server returned
 * nothing", and the single most expensive mistake to make against this API. The
 * unwrap tolerates a bare (unwrapped) body too, so a service that has not been
 * put behind the response advice yet still works.
 */
export const unwrap = <T>(res: LexResponse<T>): T => {
  const body = res?.data;
  return (isEnvelope<T>(body) ? body.data : (body as T)) as T;
};

/** A bounded list endpoint: `data` is a plain array, with no `pagination` key. */
export const unwrapList = <T>(res: LexResponse<T[]>): T[] => {
  const payload = unwrap<T[] | { content?: T[] }>(res as LexResponse<T[] | { content?: T[] }>);
  if (Array.isArray(payload)) return payload;
  return Array.isArray((payload as { content?: T[] })?.content)
    ? ((payload as { content?: T[] }).content as T[])
    : [];
};

/**
 * A paged list endpoint, normalised into `LexPage`.
 *
 * `pagination` sits beside `data`, so it is read from the envelope rather than
 * from the payload. A bounded endpoint that returns no `pagination` at all is
 * handled by deriving one from the row count — otherwise every screen would
 * need to know which of its endpoints paginate.
 */
export const pageOf = <T>(res: LexResponse<T[]>, size = 10, uiPage = 1): LexPage<T> => {
  const body = res?.data;
  const rows = unwrapList<T>(res);
  const pagination = (isEnvelope(body) ? body.pagination : undefined) || {};
  const totalElements = pagination.totalElements ?? rows.length;
  const pageSize = pagination.size ?? size;

  return {
    content: rows,
    pagination: {
      page: pagination.page ?? toServerPage(uiPage),
      size: pageSize,
      totalElements,
      totalPages: pagination.totalPages ?? Math.max(1, Math.ceil(totalElements / (pageSize || 1))),
    },
  };
};

/**
 * Server pages are zero-based; `TableView` counts from one. Converted here so
 * no screen has to remember which side of the wire it is on.
 */
export const toServerPage = (uiPage: number) => Math.max(0, uiPage - 1);

export const lexErrorCode = (error: unknown): string | undefined =>
  (error as LexFailure)?.response?.data?.code;

export const lexErrorStatus = (error: unknown): number | undefined =>
  (error as LexFailure)?.response?.status;

/**
 * Resolve a failure to something worth showing.
 *
 * Switches on `code` and falls back to the server's `message` — never to a
 * generic "Operation failed". The 422 messages across LEX are written to be
 * read by a person and are the main way users learn the rules; replacing them
 * with our own wording throws away the explanation.
 */
export const lexErrorMessage = (
  error: unknown,
  fallback: string,
  byCode: Record<string, string> = {}
): string => {
  const code = lexErrorCode(error);
  if (code && byCode[code]) return byCode[code];

  const status = lexErrorStatus(error);
  // A 502/504 is Kong's own body, not JSON from LEX. It is an infrastructure
  // failure, and rendering it as an empty result would say the tenant has no
  // data when in fact nobody asked the service.
  if (status === 502 || status === 504) return `${fallback} (the service could not be reached)`;

  return (error as LexFailure)?.response?.data?.message || fallback;
};

/** A 403 means we offered an action Casbin refuses — a UI defect, so it is logged. */
export const logForbidden = (error: unknown, where: string) => {
  if (lexErrorStatus(error) === 403) {
    console.error(
      `[LEX] 403 on ${where} — the UI offered an action the policy refuses. ` +
        `Gate it on the matching permission instead of letting the call fail.`,
      lexErrorCode(error)
    );
  }
};

/** Strip undefined so an untouched filter never becomes `?productId=undefined`. */
export const clean = <T extends object>(params: T): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );

/**
 * Config lifecycle, shared by processes, delegation matrices and SLA policies.
 * A published record is immutable: editing means cloning it into a new draft.
 */
export type LexConfigStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

/**
 * Whether the form may be enabled.
 *
 * **Trust the server's `editable` flag.** It already encodes the whole
 * lifecycle rule; re-deriving it from `status` means two places to keep in step
 * and they will drift. The status fallback exists only for a record that
 * predates the flag.
 */
export const isEditable = (record?: { editable?: boolean; status?: string }): boolean =>
  record?.editable ?? record?.status === "DRAFT";
