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
