import { lexDocumentApi } from "../../utils/axiosLexService";
import {
  clean,
  pageOf,
  toServerPage,
  unwrap,
  unwrapList,
  type LexPage,
  type LexPageQuery,
} from "./apisLexCore";

/**
 * lex-document-service (:8204) — the verification sequence and what it produced.
 *
 * Casbin objects: `lex.documents.checks` (the sequence, writable),
 * `lex.documents.analyses` (the results, read-only).
 *
 * Checks are retired by `active: false`, never deleted: past analyses keep
 * their recorded rows, so the sequence a document was judged against stays
 * readable long after the sequence itself has moved on.
 */

const CHECKS = "/api/v1/lex/documents/checks";
const ANALYSES = "/api/v1/lex/documents/analyses";

export type LexCheckGroup = "AUTHENTICITY" | "FINANCIAL" | "FORENSIC" | "SCORING";

export const CHECK_GROUPS: LexCheckGroup[] = [
  "AUTHENTICITY",
  "FINANCIAL",
  "FORENSIC",
  "SCORING",
];

export interface LexCheck {
  id: string;
  ordinal: number;
  checkCode: string;
  displayName: string;
  group: LexCheckGroup | string;
  /** A failure here halts the sequence; everything after it is recorded NOT_RUN. */
  blocking: boolean;
  /** Required. A failure with no code reaches a human as an unexplained flag. */
  reasonCode: string;
  active: boolean;
  description?: string;
}

/** In ordinal order — the order the runner executes them. */
export const getChecks = async (): Promise<LexCheck[]> => {
  return unwrapList(await lexDocumentApi.get(CHECKS));
};

export interface LexSeedResult {
  /** Named `created` on the wire; `seeded` is tolerated for older builds. */
  created?: number;
  seeded?: number;
  alreadyPresent: number;
}

/**
 * Copies the 15 shipped checks into this tenant. Idempotent, so it is safe to
 * offer even when the admin is unsure whether it has been run — the response
 * says which of the two happened.
 *
 * The shipped set groups as AUTHENTICITY 1–5, FINANCIAL 6–10, FORENSIC 11–13,
 * SCORING 14–15, with exactly one blocking check: intake classification.
 */
export const seedChecks = async (): Promise<LexSeedResult> =>
  unwrap(await lexDocumentApi.post(`${CHECKS}/seed`, {}));

export const createCheck = async (body: Partial<LexCheck>): Promise<LexCheck> =>
  unwrap(await lexDocumentApi.post(CHECKS, body));

export const updateCheck = async (id: string, body: Partial<LexCheck>): Promise<LexCheck> =>
  unwrap(await lexDocumentApi.put(`${CHECKS}/${id}`, body));

/** Retire. There is no delete — see the note at the top of this file. */
export const setCheckActive = async (id: string, active: boolean): Promise<LexCheck> =>
  unwrap(await lexDocumentApi.put(`${CHECKS}/${id}`, { active }));

/**
 * There is no bulk reorder endpoint: position is the `ordinal` field, and it is
 * unique per tenant. Moving a check is a PUT on that check, which is why the
 * sequence editor swaps two ordinals and saves both rather than sending a list.
 */
export const setCheckOrdinal = async (id: string, ordinal: number): Promise<LexCheck> =>
  unwrap(await lexDocumentApi.put(`${CHECKS}/${id}`, { ordinal }));

/* ------------------------------------------------------------------ */
/* Document types, and the sequence each one runs                      */
/* ------------------------------------------------------------------ */

/**
 * `lex.documents.types` — the document types a company verifies, and for each,
 * which of the library's checks run on it.
 *
 * **The library is referenced, never copied.** One `checkCode` means one thing
 * whatever document it was pointed at, so this module offers no way to author a
 * check from a type: that stays on the checks screen. Editing a check's display
 * name there changes it everywhere it is sequenced, and retiring a check drops
 * it out of every type's sequence with no edit here — both of which are the
 * point of referencing rather than copying.
 */
const TYPES = "/api/v1/lex/documents/types";

export interface LexDocumentType {
  id: string;
  /** Identity. Stored upper-cased, matched case-insensitively, never editable. */
  typeCode: string;
  displayName: string;
  description?: string | null;
  active: boolean;
}

/**
 * One step of a type's sequence, **as configured** — deactivated steps
 * included, because this is the editor's view.
 *
 * It carries ids and codes only: no display name, no group, no reason code.
 * Join against `getChecks()` to render a row, or ask for the resolved sequence
 * when the decoration matters more than the deactivated rows.
 */
export interface LexTypeCheckStep {
  id?: string;
  /** Position in **this type's** sequence — unrelated to the check's own ordinal. */
  ordinal: number;
  checkId?: string;
  checkCode: string;
  /**
   * **Tri-state, not a checkbox.** Null inherits the library check's own
   * setting; true and false override it for this type only. A checkbox cannot
   * express null, and defaulting to false silently strips halting behaviour off
   * checks that were meant to have it.
   */
  blocking?: boolean | null;
  /** Omitted means true. False keeps the row but skips it at run time. */
  active?: boolean;
}

/** A step as it will actually run: overrides applied, decoration joined in. */
export interface LexResolvedCheck {
  id: string;
  ordinal: number;
  checkCode: string;
  displayName?: string;
  description?: string;
  group?: LexCheckGroup | string;
  reasonCode?: string;
  blocking: boolean;
  active: boolean;
}

/**
 * What would actually run on a document of this type.
 *
 * **`source` is the field that earns this endpoint.** `TENANT_DEFAULT` means
 * the type has nothing assigned — or is deactivated, or does not exist — and
 * the company-wide sequence runs instead. Fifteen checks look identical either
 * way, so an unbannered screen shows an admin a configured-looking sequence
 * they never configured.
 */
export interface LexResolvedSequence {
  typeCode: string;
  source: "TYPE" | "TENANT_DEFAULT" | string;
  checks: LexResolvedCheck[];
}

/** Ascending by `typeCode`, unpaged. */
export const getDocumentTypes = async (activeOnly?: boolean): Promise<LexDocumentType[]> =>
  unwrapList(await lexDocumentApi.get(TYPES, { params: clean({ activeOnly }) }));

/**
 * The picker's catalogue: active types only, cached for the session.
 *
 * It changes when an admin edits the catalogue, not per case, so re-fetching it
 * every time a dialog opens is a round trip for an answer that has not moved.
 * `force` is for the one moment it may have: a `LEX.CASE.UNKNOWN_DOCUMENT_TYPE`
 * means a type was deactivated while the dialog was open.
 *
 * `activeOnly` matters — a retired type must not be offered on a **new**
 * request, though it still reads back on hand-backs that already asked for it.
 */
let catalogueCache: Promise<LexDocumentType[]> | null = null;

export const getDocumentTypeCatalogue = (force = false): Promise<LexDocumentType[]> => {
  if (force || !catalogueCache) {
    catalogueCache = getDocumentTypes(true).catch((error) => {
      // Never cache a failure: the next open should try again rather than
      // inherit an empty catalogue, which the picker renders as "ask an
      // administrator" — a wrong answer to give because of one bad response.
      catalogueCache = null;
      throw error;
    });
  }
  return catalogueCache;
};

export const getDocumentType = async (id: string): Promise<LexDocumentType> =>
  unwrap(await lexDocumentApi.get(`${TYPES}/${id}`));

export const createDocumentType = async (
  body: Pick<LexDocumentType, "typeCode" | "displayName"> & Partial<LexDocumentType>
): Promise<LexDocumentType> =>
  unwrap(await lexDocumentApi.post(TYPES, { ...body, typeCode: body.typeCode.toUpperCase() }));

/**
 * Amend or retire. **`typeCode` is not sent**: the server ignores it, and
 * analyses are already filed under it — renaming would orphan them.
 */
export const updateDocumentType = async (
  id: string,
  body: Partial<Omit<LexDocumentType, "id" | "typeCode">>
): Promise<LexDocumentType> => unwrap(await lexDocumentApi.put(`${TYPES}/${id}`, body));

/** Keyed by **id** — this is a configuration screen editing a row it has loaded. */
export const getTypeChecks = async (documentTypeId: string): Promise<LexTypeCheckStep[]> => {
  const rows = unwrapList<LexTypeCheckStep>(
    await lexDocumentApi.get(`${TYPES}/${documentTypeId}/checks`)
  );
  return [...rows].sort((a, b) => a.ordinal - b.ordinal);
};

/**
 * Replace the whole sequence. There is no add-one / remove-one / reorder call,
 * deliberately: a partial edit leaves the order ambiguous mid-write, and an
 * ambiguous order makes the analysis non-reproducible.
 *
 * Ordinals are re-indexed 1..n here rather than trusted from the caller —
 * gaps are accepted by the server and read back exactly as sent, which leaves
 * the next person wondering what happened to 4.
 *
 * An empty list is a real save: it clears the sequence and the type falls back
 * to the company-wide one. Confirm that with the user before calling.
 */
export const putTypeChecks = async (
  documentTypeId: string,
  steps: LexTypeCheckStep[]
): Promise<LexTypeCheckStep[]> => {
  const checks = steps.map((step, index) => ({
    ordinal: index + 1,
    checkCode: step.checkCode,
    // Sent as given: null is "inherit", and omitting it would mean the same
    // thing but reads here as a field someone forgot.
    blocking: step.blocking ?? null,
    active: step.active !== false,
  }));
  return unwrapList(await lexDocumentApi.put(`${TYPES}/${documentTypeId}/checks`, { checks }));
};

/**
 * Keyed by **code**, because that is what a caller has in hand — the same
 * string the application put in `expectedKind`.
 *
 * An unknown code answers `200` with `TENANT_DEFAULT`, not `404`. That is the
 * same answer the analyser gets and must not be rendered as an error.
 */
export const getResolvedSequence = async (typeCode: string): Promise<LexResolvedSequence> => {
  const payload = unwrap<LexResolvedSequence>(
    await lexDocumentApi.get(`${TYPES}/${encodeURIComponent(typeCode)}/sequence`)
  );
  return { ...payload, checks: payload?.checks || [] };
};

/**
 * Authenticity checks are meant to gate the financial ones — reading salary
 * figures off a document that failed tampering detection produces numbers that
 * look authoritative and are worthless. The server does not enforce the order,
 * because a business may have a reason, so this is a soft warning: the index of
 * the first FINANCIAL step that sits above an AUTHENTICITY one, or -1.
 */
export const misorderedFinancialStep = (groups: (string | undefined)[]): number => {
  const lastAuthenticity = groups.lastIndexOf("AUTHENTICITY");
  if (lastAuthenticity < 0) return -1;
  return groups.findIndex((group, index) => group === "FINANCIAL" && index < lastAuthenticity);
};

/* ------------------------------------------------------------------ */
/* Reason code checklists                                              */
/* ------------------------------------------------------------------ */

/**
 * `lex.documents.reason-codes` — which documents a finding asks for.
 *
 * The link that was missing in the chain: the types and their sequences already
 * said *what runs on a document*, but nothing said *when to ask for one*. Before
 * this the answer lived in an underwriter's head, so two people looking at the
 * same finding asked for different things and neither decision was reviewable.
 *
 * The two references are deliberately asymmetric:
 *
 * - `typeCode` is **hard**: a checklist may only name a type the company has
 *   defined, because a request for a document nobody defined is one the
 *   applicant cannot satisfy and the reader cannot match.
 * - `reasonCode` is **not**: a plain string, and mapping documents to a code the
 *   Agent Configurator has not published yet is allowed on purpose. A company
 *   should be able to decide what a finding needs before it writes the process
 *   for handling it.
 */
const REASON_CODES = "/api/v1/lex/documents/reason-codes";

export interface LexReasonCodeSummary {
  reasonCode: string;
  /** Every row, deactivated ones included. */
  documentCount: number;
  /** Active mandatory rows only — the number that actually gates a case coming back. */
  mandatoryCount: number;
}

/** One line of a checklist, **as configured** — deactivated rows included. */
export interface LexReasonCodeDocument {
  id?: string;
  reasonCode?: string;
  /** Position in the checklist the applicant sees, 1-based. */
  ordinal: number;
  documentTypeId?: string;
  typeCode: string;
  /**
   * **Omitted means true**, unlike most flags in this codebase. Getting it
   * backwards means a case comes back without a document the underwriter was
   * waiting for, and the only symptom is a case sitting for days.
   */
  mandatory?: boolean;
  /**
   * What to tell the applicant *on this finding* — per code, not per type. The
   * catalogue's `description` says what a bank statement generally is; this says
   * what this finding needs from it. Six months for a DBR breach; the page
   * showing the IBAN for a mismatch.
   */
  note?: string | null;
  active?: boolean;
}

/** One line of the folded checklist an application actually gets. */
export interface LexResolvedDocument {
  documentTypeId: string;
  typeCode: string;
  /** From the **type**, not the mapping — one place to rename a document. */
  displayName?: string;
  description?: string;
  /** A sort key, not a display number: the output is not contiguous. */
  ordinal: number;
  mandatory: boolean;
  note?: string | null;
  /** Every code that asked for this document, ascending. */
  requiredBy?: string[];
}

/**
 * Only the codes this company has actually mapped.
 *
 * **A code absent from this list asks for nothing** — not an error, just the
 * behaviour from before checklists existed. Which is why the screen joins it
 * against the Agent Configurator's vocabulary: a list of only the mapped codes
 * hides exactly the thing that needs attention.
 */
export const getReasonCodeSummaries = async (): Promise<LexReasonCodeSummary[]> => {
  const rows = unwrapList<LexReasonCodeSummary>(await lexDocumentApi.get(REASON_CODES));
  return [...rows].sort((a, b) => a.reasonCode.localeCompare(b.reasonCode));
};

/** One code's checklist as configured, ascending by ordinal. */
export const getReasonCodeDocuments = async (
  reasonCode: string
): Promise<LexReasonCodeDocument[]> => {
  const rows = unwrapList<LexReasonCodeDocument>(
    await lexDocumentApi.get(`${REASON_CODES}/${encodeURIComponent(reasonCode)}/documents`)
  );
  return [...rows].sort((a, b) => a.ordinal - b.ordinal);
};

/**
 * Replace the whole checklist. Same contract as the type sequence editor, and
 * for the same reason: there is no add-one or reorder call.
 *
 * Ordinals are re-indexed 1..n here so a drag never sends a gap. `mandatory`
 * is sent explicitly rather than relying on the server's default — a field the
 * caller left undefined would silently become "required", which is the one
 * direction this flag must never move by accident.
 *
 * An empty list is a real save: it clears the checklist and the finding stops
 * asking for anything. Confirm that with the user before calling.
 */
export const putReasonCodeDocuments = async (
  reasonCode: string,
  rows: LexReasonCodeDocument[]
): Promise<LexReasonCodeDocument[]> => {
  const documents = rows.map((row, index) => ({
    ordinal: index + 1,
    typeCode: row.typeCode,
    mandatory: row.mandatory !== false,
    note: row.note?.trim() || undefined,
    active: row.active !== false,
  }));
  return unwrapList(
    await lexDocumentApi.put(`${REASON_CODES}/${encodeURIComponent(reasonCode)}/documents`, {
      documents,
    })
  );
};

/**
 * **The endpoint that does the work.** An application almost never arrives with
 * one finding, and the applicant uploads a bank statement once however many
 * findings wanted it — so this folds every code the case carries into one list.
 *
 * The merge is not a union of rows: `mandatory` is true if **any** contributing
 * code says so (relaxing a requirement silently is the failure that costs a
 * rejected file), the **earliest** ordinal wins, and the note is the **first
 * non-empty** one in position order rather than a concatenation, which would put
 * two codes' contradictory instructions on the applicant's screen.
 *
 * An empty result is not an error — the company has mapped none of these codes.
 * Fall back to free choice from the type catalogue; never block a hand-back over
 * a configuration gap.
 */
export const resolveReasonCodeDocuments = async (
  reasonCodes: string[]
): Promise<LexResolvedDocument[]> => {
  const codes = [...new Set(reasonCodes.map((code) => code.trim()).filter(Boolean))];
  if (codes.length === 0) return [];
  const rows = unwrapList<LexResolvedDocument>(
    await lexDocumentApi.get(`${REASON_CODES}/resolve`, {
      // Repeated `reasonCode=A&reasonCode=B`, which is what the endpoint reads —
      // axios' default would send `reasonCode[]=A`.
      params: { reasonCode: codes },
      paramsSerializer: {
        indexes: null,
      },
    })
  );
  return [...rows].sort((a, b) => a.ordinal - b.ordinal);
};

/* ------------------------------------------------------------------ */
/* Analyses                                                            */
/* ------------------------------------------------------------------ */

/**
 * `NOT_RUN` is the outcome that matters most: the sequence stopped before
 * reaching this check. It is never a pass and is never omitted from the list.
 */
export type LexCheckOutcome = "PASS" | "FAIL" | "FLAGGED" | "NOT_RUN";

export type LexAnalysisState =
  | "VERIFIED"
  | "ADVERSE_FINDINGS"
  | "UNREADABLE"
  | "WRONG_TYPE"
  | "ANALYSIS_UNAVAILABLE";

export interface LexAnalysisRow {
  ordinal: number;
  checkCode: string;
  displayName?: string;
  group?: string;
  outcome: LexCheckOutcome | string;
  detail?: string | null;
  confidence?: number | null;
  /**
   * Present only on FAIL and FLAGGED — a database constraint makes a passing
   * row with a code impossible, so the UI need not handle that case.
   */
  reasonCode?: string | null;
}

/**
 * The application the analysis belongs to, denormalised onto each row by the
 * list endpoint so the table can name the applicant without a second call.
 * Every field is nullable: a stub reader, or an application still being keyed,
 * leaves the numeric fields (installment, credit score) empty.
 */
export interface LexAnalysisApplication {
  applicationNumber?: string | null;
  customerId?: string | null;
  applicantName?: string | null;
  productId?: string | null;
  productName?: string | null;
  sectorName?: string | null;
  salesId?: string | null;
  sourceChannel?: string | null;
  requestedAmount?: number | null;
  requestedTenureMonths?: number | null;
  monthlyInstallment?: number | null;
  creditScore?: number | null;
}

export interface LexAnalysis {
  id: string;
  applicationId: string;
  application?: LexAnalysisApplication | null;
  documentId?: string;
  documentKind?: string;
  expectedKind?: string;
  state: LexAnalysisState | string;
  /**
   * True on UNREADABLE, WRONG_TYPE and ANALYSIS_UNAVAILABLE: the submission is
   * the problem and nothing about the applicant has been assessed. This is the
   * flag that keeps a scanning failure from being read as an adverse finding.
   */
  dataProblem: boolean;
  confidenceScore?: number | null;
  /** What could not be read. Populated when `dataProblem` is true. */
  analysisNote?: string | null;
  checks?: LexAnalysisRow[];
  /** Per-outcome tallies from the list endpoint, present without the full `checks` array. */
  checksTotal?: number;
  checksPassed?: number;
  checksFailed?: number;
  checksFlagged?: number;
  checksNotRun?: number;
  reasonCodes?: string[];
  /**
   * A hint only. The Agent Configurator entry for each reason code decides the
   * actual routing, so this is labelled as a hint rather than as the outcome.
   */
  routingHint?: string | null;
  readerName?: string;
  readerVersion?: string;
  analysedAt?: string;
}

export const getAnalyses = async (
  query: LexPageQuery & { applicationId?: string; state?: string } = {}
): Promise<LexPage<LexAnalysis>> => {
  const { page = 1, size = 10, ...rest } = query;
  return pageOf(await lexDocumentApi.get(ANALYSES, {
    params: clean({ page: toServerPage(page), size, ...rest }),
  }), size, page);
};

export const getAnalysis = async (id: string): Promise<LexAnalysis> =>
  unwrap(await lexDocumentApi.get(`${ANALYSES}/${id}`));

/**
 * The reader is a deterministic stub on this build: its findings derive from
 * the document id and say nothing about the actual file. The screen says so
 * visibly — a demo that looks like real forensics is how a stub ends up quoted
 * in a credit committee.
 */
export const isStubReader = (analysis?: Pick<LexAnalysis, "readerName">) =>
  !!analysis?.readerName && analysis.readerName.toLowerCase().startsWith("stub");

/** True when the header describes a submission problem rather than the applicant. */
export const isDataProblem = (analysis?: Pick<LexAnalysis, "state" | "dataProblem">) =>
  !!analysis &&
  (analysis.dataProblem === true ||
    ["UNREADABLE", "WRONG_TYPE", "ANALYSIS_UNAVAILABLE"].includes(String(analysis.state)));
