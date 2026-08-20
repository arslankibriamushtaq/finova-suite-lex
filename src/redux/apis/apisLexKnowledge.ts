import { lexKnowledgeApi } from "../../utils/axiosLexService";
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
 * lex-knowledge-service (:8205) — policy documents, the Approved Employer List,
 * and the governance mirror.
 *
 * Casbin objects: `lex.knowledge.documents`, `lex.knowledge.employers`,
 * `lex.knowledge.governance`.
 *
 * Three things this file deliberately does not contain:
 *
 * - **no endpoint that edits a document's text, and no DELETE anywhere.** A
 *   re-upload is a new version, never an edit: a case flagged in March against
 *   the March text has to still be explainable in December, and a decision
 *   whose justification has been deleted is indistinguishable from an
 *   arbitrary one. Only classification (title, category, summary) can change
 *   in place, because that is not the text.
 * - **no employer create and no employer update.** Employers are listed by the
 *   agent on completion of the Employer Not 'Whitelisted' process, through an
 *   internal route the UI cannot reach. Delisting is the only write a person
 *   gets, and the screen has no Add button.
 * - no governance write beyond `refresh`, which re-projects a mirror.
 */

const DOCUMENTS = "/api/v1/lex/knowledge/documents";
const EMPLOYERS = "/api/v1/lex/knowledge/employers";
const GOVERNANCE = "/api/v1/lex/knowledge/governance";

/* ------------------------------------------------------------------ */
/* Policy documents                                                    */
/* ------------------------------------------------------------------ */

export type LexDocumentCategory = "PRODUCT" | "POLICY" | "SLA" | "COMPLIANCE" | "OTHER";

export const DOCUMENT_CATEGORIES: LexDocumentCategory[] = [
  "PRODUCT",
  "POLICY",
  "SLA",
  "COMPLIANCE",
  "OTHER",
];

/** Exactly one version is ACTIVE at a time; the lineage cannot fork. */
export type LexDocumentLifecycle = "ACTIVE" | "SUPERSEDED" | "RETIRED";

export interface LexPolicyDocument {
  id: string;
  documentKey: string;
  version: number;
  /** Null on v1 — the version this one replaced. */
  supersedesId?: string | null;
  title: string;
  category: LexDocumentCategory | string;
  lifecycle: LexDocumentLifecycle | string;
  summary?: string | null;
  parsedContent?: string;
  revisionNote?: string | null;
  sourceDocumentId?: string | null;
  fileName?: string | null;
  contentType?: string | null;
  byteSize?: number | null;
  uploadedBy?: string;
  createdAt?: string;
  retiredAt?: string | null;
  retiredReason?: string | null;
}

/**
 * The key is the document's identity across versions and is normalized
 * server-side. Mirrored here so the screen can show the normalized value as the
 * user types — otherwise two people create what they think are two documents
 * and get one 422.
 */
export const normalizeDocumentKey = (raw: string): string =>
  raw
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getPolicyDocuments = async (
  query: LexPageQuery & { category?: string } = {}
): Promise<LexPage<LexPolicyDocument>> => {
  const { page = 1, size = 10, ...rest } = query;
  return pageOf(await lexKnowledgeApi.get(DOCUMENTS, {
    params: clean({ page: toServerPage(page), size, ...rest }),
  }), size, page);
};

/**
 * After a retire this answers **422 `LEX.KNOWLEDGE.NO_LIVE_VERSION`, not 404** —
 * the document exists, nothing is in force. Callers render that as such.
 */
export const getPolicyDocument = async (key: string): Promise<LexPolicyDocument> =>
  unwrap(await lexKnowledgeApi.get(`${DOCUMENTS}/${encodeURIComponent(key)}`));

/**
 * Nothing extracts text from a PDF today — `parsedContent` is supplied by the
 * caller. The upload screen takes pasted text and says so; it must not imply
 * that server-side parsing exists.
 */
export const uploadPolicyDocument = async (body: {
  documentKey: string;
  title: string;
  category: string;
  parsedContent: string;
  summary?: string;
  sourceDocumentId?: string;
  fileName?: string;
  contentType?: string;
  byteSize?: number;
}): Promise<LexPolicyDocument> => unwrap(await lexKnowledgeApi.post(DOCUMENTS, body));

/** A new version. The previous text stays, as SUPERSEDED. `revisionNote` is required. */
export const revisePolicyDocument = async (
  key: string,
  body: {
    /** Inherited from the current version when omitted. */
    title?: string;
    category?: string;
    parsedContent: string;
    revisionNote: string;
  }
): Promise<LexPolicyDocument> =>
  unwrap(await lexKnowledgeApi.post(`${DOCUMENTS}/${encodeURIComponent(key)}/revisions`, body));

/** Newest first; SUPERSEDED and RETIRED included. */
export const getPolicyVersions = async (key: string): Promise<LexPolicyDocument[]> => {
  return unwrapList(await lexKnowledgeApi.get(`${DOCUMENTS}/${encodeURIComponent(key)}/versions`));
};

/** Stops being cited going forward; stays readable backwards. Not a delete. */
export const retirePolicyDocument = async (
  key: string,
  reason: string
): Promise<LexPolicyDocument> =>
  unwrap(await lexKnowledgeApi.post(`${DOCUMENTS}/${encodeURIComponent(key)}/retire`, { reason }));

/**
 * Retitling and recategorizing do NOT create a version, because the text has
 * not changed. Only the live version can be reclassified — a superseded one is
 * a historical record.
 */
export const reclassifyPolicyDocument = async (
  key: string,
  body: { title?: string; category?: string; summary?: string }
): Promise<LexPolicyDocument> =>
  unwrap(await lexKnowledgeApi.put(`${DOCUMENTS}/${encodeURIComponent(key)}/classification`, body));

/**
 * Live versions only. The screen says so: surfacing a retired policy would
 * invite someone to cite a rule no longer in force, and a user who cannot find
 * one should understand why rather than assume it was deleted.
 */
export const searchPolicyDocuments = async (
  q: string,
  limit = 10
): Promise<LexPolicyDocument[]> => {
  return unwrapList(await lexKnowledgeApi.get(`${DOCUMENTS}/search`, { params: clean({ q, limit }) }));
};

/* ------------------------------------------------------------------ */
/* Approved Employer List                                              */
/* ------------------------------------------------------------------ */

export interface LexEmployer {
  id: string;
  employerName: string;
  commercialRegistration: string;
  sector: "PRIVATE" | "PUBLIC" | "MILITARY" | string;
  reach: "DOMESTIC" | "MULTINATIONAL" | string;
  /** What pricing and underwriting read off this entry. Free text by design. */
  listingCategory?: string;
  listingScore?: number;
  listedAt?: string;
  active: boolean;
  /** Evidence the process fetched, never editable. */
  crStatus?: string;
  zakatStatus?: string;
  vatStatus?: string;
  incorporatedOn?: string;
  paidUpCapital?: number | string;
  /** The execution that produced this listing — what makes the entry auditable. */
  originApplicationId?: string;
  originCaseId?: string;
  delistedAt?: string | null;
  delistedReason?: string | null;
}

export const getEmployers = async (
  query: LexPageQuery & { active?: boolean } = {}
): Promise<LexPage<LexEmployer>> => {
  const { page = 1, size = 10, ...rest } = query;
  return pageOf(await lexKnowledgeApi.get(EMPLOYERS, {
    params: clean({ page: toServerPage(page), size, ...rest }),
  }), size, page);
};

export const getEmployer = async (id: string): Promise<LexEmployer> =>
  unwrap(await lexKnowledgeApi.get(`${EMPLOYERS}/${id}`));

/** 404 means not currently approved. The server normalizes spaces and dashes. */
export const lookupEmployer = async (commercialRegistration: string): Promise<LexEmployer> =>
  unwrap(await lexKnowledgeApi.get(`${EMPLOYERS}/lookup`, { params: { commercialRegistration } }));

/**
 * The only write a person gets. Approved-segment terms are withdrawn from every
 * employee of this employer on new applications — the confirmation says so.
 */
export const delistEmployer = async (id: string, reason: string): Promise<LexEmployer> =>
  unwrap(await lexKnowledgeApi.post(`${EMPLOYERS}/${id}/delist`, { reason }));

/** Delisted entries live here — nothing is destroyed. */
export const getEmployerHistory = async (
  commercialRegistration: string
): Promise<LexEmployer[]> => {
  return unwrapList(await lexKnowledgeApi.get(`${EMPLOYERS}/history`, {
    params: { commercialRegistration },
  }));
};

/* ------------------------------------------------------------------ */
/* Governance mirror                                                   */
/* ------------------------------------------------------------------ */

export type LexGovernanceRecordType = "DELEGATION_MATRIX" | "SLA_POLICY" | "REASON_CODE_PROCESS";

export const GOVERNANCE_RECORD_TYPES: LexGovernanceRecordType[] = [
  "DELEGATION_MATRIX",
  "SLA_POLICY",
  "REASON_CODE_PROCESS",
];

export interface LexGovernanceRecord {
  sourceId: string;
  recordType: LexGovernanceRecordType | string;
  referenceCode?: string | null;
  title?: string;
  configVersion?: number;
  publishedAt?: string;
  payload?: Record<string, unknown>;
  /**
   * How stale this copy is. Shown on every record — the configurator stays
   * authoritative and nothing in LEX routes off the mirrored copy.
   */
  mirroredAt?: string;
}

export const getGovernanceRecords = async (
  recordType?: string
): Promise<LexGovernanceRecord[]> => {
  const url = recordType ? `${GOVERNANCE}/${recordType}` : GOVERNANCE;
  return unwrapList(await lexKnowledgeApi.get(url));
};

export interface LexGovernanceRefreshResult {
  projected: number;
  /**
   * True when the configurator returned nothing and the existing mirror was
   * left alone. Not a failure — an empty response and an unreachable service
   * look identical, and clearing a good mirror on a transient failure is the
   * worse of the two mistakes. The `note` explains it and must be shown.
   */
  skipped?: boolean;
  note?: string;
}

export const refreshGovernance = async (): Promise<LexGovernanceRefreshResult> =>
  unwrap(await lexKnowledgeApi.post(`${GOVERNANCE}/refresh`, {}));
