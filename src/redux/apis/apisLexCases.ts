import { lexCaseApi } from "../../utils/axiosLexService";
import {
  clean,
  pageOf,
  toServerPage,
  unwrap,
  unwrapList,
  type LexPage,
  type LexPageQuery,
} from "./apisLexCore";
import type { LexAnalysis } from "./apisLexDocuments";

/**
 * lex-case-service (:8203), review cases — `lex.cases`.
 *
 * **Messages and decisions are separate Casbin objects**, not actions on
 * `lex.cases`: `lex.cases.messages` (create) and `lex.cases.decision` (create).
 * A policy set that grants only `lex.cases` produces a screen where everything
 * loads and the decide button 403s, which is why the two are gated apart here.
 */

const CASES = "/api/v1/lex/cases";

/** Derived from the token's `azp` claim. Null when the client is unrecognised. */
export type LexSourceChannel = "MOBILE_APP" | "WEB" | "PARTNER" | "BRANCH";

/**
 * The Approved Employer List verdict, resolved by LEX when the case opens —
 * never taken from the application, because lending does not hold the list and
 * an employer is delisted without any application changing.
 *
 * **`UNKNOWN` and `NOT_WHITELISTED` are different claims and must never look
 * alike on screen.** One says the employer failed a check; the other says no
 * check happened — no employer name, or the list was unreachable. Only the
 * first is grounds for declining, so rendering `UNKNOWN` as "Non-Whitelisted"
 * manufactures an adverse finding out of a lookup that never ran.
 */
export type LexEmployerCategory = "WHITELISTED" | "NOT_WHITELISTED" | "UNKNOWN";

/**
 * How to render an employer verdict: a tone, and the i18n key for its wording.
 * Centralised so the three values cannot drift apart on one screen and merge on
 * another.
 *
 * The lookup behind them is an **exact** name match, case- and
 * whitespace-insensitive but deliberately not fuzzy: a near-match that silently
 * cleared an unlisted employer would be an approval nothing supports. A spelling
 * variant therefore reads NOT_WHITELISTED and the underwriter — already looking
 * at the case — checks it. That is the cheap direction to be wrong in.
 */
export const EMPLOYER_CATEGORY: Record<
  LexEmployerCategory,
  { tone: "emerald" | "amber" | "slate"; labelKey: string; hintKey: string }
> = {
  WHITELISTED: {
    tone: "emerald",
    labelKey: "employer.whitelisted",
    hintKey: "employer.whitelistedHint",
  },
  NOT_WHITELISTED: {
    tone: "amber",
    labelKey: "employer.notWhitelisted",
    hintKey: "employer.notWhitelistedHint",
  },
  UNKNOWN: {
    tone: "slate",
    labelKey: "employer.unknown",
    hintKey: "employer.unknownHint",
  },
};

export const employerCategoryOf = (value?: string | null) =>
  value && value in EMPLOYER_CATEGORY
    ? EMPLOYER_CATEGORY[value as LexEmployerCategory]
    : undefined;

/**
 * The lifecycle. `WITH_SOURCE` is the older spelling of `AWAITING_SOURCE` and is
 * kept so a case created before the rename still renders — the server emits
 * `AWAITING_*` now.
 */
export type LexCaseStatus =
  | "OPEN"
  | "IN_REVIEW"
  | "AWAITING_SOURCE"
  | "AWAITING_PHYSICAL_VERIFICATION"
  | "WITH_SOURCE"
  | "ESCALATED"
  | "RESOLVED"
  | "CLOSED";

/** True for either spelling of "parked on the application source". */
export const isWithSource = (status?: string) =>
  status === "AWAITING_SOURCE" || status === "WITH_SOURCE";

/**
 * One queue row.
 *
 * Deliberately wide: this screen is the operations team's whole view of the
 * exception queue, and a row that needs a detail fetch to answer *how urgent,
 * whose, and why* turns a scan of forty cases into forty round trips.
 */
export interface LexCaseSummary {
  id: string;
  applicationId: string;
  applicationNumber?: string;
  customerId?: string;
  applicantName?: string;

  productId?: string | null;
  productName?: string | null;
  /**
   * Still null everywhere: sector does not exist in product-service, so there
   * is nothing upstream to relay and every sector-scoped rule resolves at the
   * "All Sectors" level. The one genuine gap left in this group.
   */
  sectorId?: string | null;
  sectorName?: string | null;
  /** The agent who sourced it. **Null means self-service**, not missing data. */
  salesId?: string | null;
  /**
   * Derived from the token's `azp` claim — the OAuth client that presented it —
   * because that is a fact the caller cannot misreport. An unrecognised client
   * yields null, never a default: "unknown" is a true answer and "Web" would
   * not be, and a source referral has to go back to the channel that can
   * actually reach the customer.
   */
  sourceChannel?: LexSourceChannel | string | null;

  /** From customer-service, relayed by lending. */
  employerName?: string | null;
  /** `employmentType` upstream — GOVERNMENT, PRIVATE, … */
  incomeSector?: string | null;
  /** The "employment vintage" figure. */
  employmentDurationMonths?: number | null;
  /** Resolved by LEX against the Approved Employer List — see `EMPLOYER_CATEGORY`. */
  employerCategory?: LexEmployerCategory | string | null;

  requestedAmount?: number | null;
  requestedTenureMonths?: number | null;
  monthlyInstallment?: number | null;
  creditScore?: number | null;
  dbr?: number | null;

  routingType?: string;
  drivingReasonCode?: string;
  /** Null when the code is unrecognized — fall back to the code itself. */
  drivingReasonTitle?: string | null;
  drivingSeverity?: string | null;
  /** Render as "CODE +2". The secondaries are context, never discarded. */
  secondaryCodeCount?: number;
  hasUnrecognizedCode?: boolean;

  status: LexCaseStatus | string;
  assignedLevelCode?: string | null;
  assigneeUserId?: string | null;
  beyondDelegation?: boolean;

  slaStatus?: string;
  slaStageCode?: string | null;
  slaTargetMinutes?: number | null;
  /** Stopped time excluded — this is time on the clock, not time open. */
  slaElapsedMinutes?: number | null;
  /** The countdown chip. Null means untracked; negative means past due. */
  slaRemainingMinutes?: number | null;
  slaDeadlineAt?: string | null;
  slaStopped?: boolean;

  decisionAction?: string | null;
  decisionActorName?: string | null;
  decisionLevelCode?: string | null;
  decisionOverrode?: boolean;
  decidedAt?: string | null;

  messageCount?: number;
  openedAt?: string;
  /** Sort by this for "recent", not `openedAt`. */
  lastActivityAt?: string;
  readOnly?: boolean;
}

/**
 * Tab counts in one call.
 *
 * Paging each tab to count it would be four round trips to render a header.
 * The breach counts exclude stopped clocks and untracked cases on purpose: a
 * case parked on the applicant is not breaching, and one with no published
 * policy is not compliant either — it is simply not measured.
 */
export interface LexCaseCounts {
  allIngested: number;
  humanReview: number;
  approved: number;
  declined: number;
  returned: number;
  nearBreach: number;
  criticalBreach: number;
  beyondDelegation: number;
  unrecognizedCode: number;
  unassigned: number;
}

export const getCaseCounts = async (): Promise<LexCaseCounts> =>
  unwrap(await lexCaseApi.get(`${CASES}/counts`));

/** The four tabs, and the `filter=` expression each one is. */
export const CASE_TABS = [
  { key: "ALL", countKey: "allIngested", filter: undefined },
  {
    key: "HUMAN_REVIEW",
    countKey: "humanReview",
    filter:
      "status:in:OPEN,IN_REVIEW,ESCALATED,AWAITING_SOURCE,AWAITING_PHYSICAL_VERIFICATION",
  },
  { key: "APPROVED", countKey: "approved", filter: "decisionAction:in:APPROVE,VERIFY,OVERRULE" },
  { key: "DECLINED", countKey: "declined", filter: "decisionAction:in:REJECT,DECLINE" },
] as const;

export type LexCaseTab = (typeof CASE_TABS)[number]["key"];

/**
 * Most-urgent-first, and the server's default when no sort is given — which is
 * what this screen is for. `slaDeadline` is an expression over
 * `slaStartedAt + slaTargetMinutes`, and cases with no clock sort last: an
 * untracked case is not the most urgent thing on the screen just because it
 * has no deadline.
 */
export const CASE_SORTS = [
  "slaDeadline,asc",
  "lastActivityAt,desc",
  "openedAt,desc",
  "requestedAmount,desc",
] as const;

/** The package the Decision Agent handed over. Read-only context, never edited here. */
export interface LexApplicationInfo {
  applicationNumber?: string;
  customerId?: string;
  applicantName?: string;
  productId?: string | null;
  productName?: string | null;
  /** Still null: sector does not exist upstream. See `LexCaseSummary.sectorId`. */
  sectorId?: string | null;
  sectorName?: string | null;
  sourceChannel?: LexSourceChannel | string | null;
  /**
   * When the customer actually submitted. **Distinct from the case's
   * `openedAt`**, which is when LEX received the referral and is always later —
   * labelling one as the other misstates how long the applicant has waited.
   */
  applicationSubmittedAt?: string | null;
  employerName?: string | null;
  incomeSector?: string | null;
  employmentDurationMonths?: number | null;
  employerCategory?: LexEmployerCategory | string | null;
  requestedAmount?: number | null;
  requestedTenureMonths?: number | null;
  monthlyInstallment?: number | null;
  creditScore?: number | null;
  dbr?: number | null;
  verifiedSalary?: number | null;
  verificationResults?: Record<string, unknown>;
}

export interface LexAttachedCode {
  referenceCode: string;
  /** Null when the code is unrecognized — render the reference code itself. */
  title?: string | null;
  severity?: string | null;
  priorityOrder?: number;
  /** The one that decided routing. The others are context and are never discarded. */
  driving?: boolean;
  recognized?: boolean;
}

export type LexMessageKind =
  | "SYSTEM_DELEGATION"
  | "SYSTEM_SUPERVISOR"
  | "SYSTEM_APPLICATION_SOURCE"
  | "SYSTEM_UNRECOGNIZED_CODE"
  | "HUMAN";

export interface LexCaseMessage {
  id: string;
  kind: LexMessageKind | string;
  /** Null on SYSTEM messages — the author is LEX, not an unknown user. */
  authorId?: string | null;
  authorName?: string | null;
  /** "Underwriter L1", "Company Sys Admin (Supervisor)" — context on who spoke. */
  authorRole?: string | null;
  body: string;
  metadata?: string | null;
  postedAt?: string;
}

export interface LexCaseSla {
  stageCode?: string;
  status?: string;
  targetMinutes?: number;
  elapsedMinutes?: number;
  remainingMinutes?: number;
  stopped?: boolean;
}

export interface LexCaseDecision {
  action: string;
  actorId?: string;
  actorName?: string;
  authorityLevelCode?: string | null;
  writtenReason?: string | null;
  evidenceReference?: string | null;
  overrode?: boolean;
  decidedAt?: string;
}

export interface LexAuditEntry {
  id: string;
  action: string;
  actorId?: string | null;
  /** "LEX" when the system acted. */
  actorName?: string | null;
  detail?: string;
  occurredAt?: string;
}

/**
 * One document's verification result as the case package carries it.
 *
 * `analysisId` is the wire name for what the documents service calls `id`;
 * `normalizeCaseAnalysis` maps it so both sources render through one component.
 */
export interface LexCaseDocumentAnalysis extends Omit<LexAnalysis, "id"> {
  analysisId: string;
  id?: string;
}

/**
 * The document analyses for this case, in one shape.
 *
 * Prefers the embedded `documentVerification` and falls back to whatever the
 * documents-service fetch returned, so a build whose case service predates the
 * embed still shows documents.
 */
export const caseAnalyses = (
  record?: LexCase | null,
  fetched: LexAnalysis[] = []
): LexAnalysis[] => {
  const embedded = record?.documentVerification || [];
  if (!embedded.length) return fetched;
  return embedded.map((entry) => ({
    ...entry,
    id: entry.id || entry.analysisId,
    applicationId: entry.applicationId || record?.applicationId || "",
  }));
};

/**
 * How the applicant is told the case is with them.
 *
 * **Nothing is preselected in the UI on purpose.** Which channel reaches a
 * given applicant is something the underwriter knows and the platform does
 * not — a branch-onboarded customer may have no app installed, and a push into
 * an app nobody opens is a request that silently never arrives while the case's
 * clock stays stopped.
 */
export type LexSourceRequestChannel = "PUSH" | "EMAIL" | "SMS";

export const SOURCE_REQUEST_CHANNELS: LexSourceRequestChannel[] = ["PUSH", "EMAIL", "SMS"];

/**
 * One line of the request.
 *
 * **`kind` is a `typeCode` from the governed catalogue, not free text.** It used
 * to be typed, and a typed code is now refused with
 * `LEX.CASE.UNKNOWN_DOCUMENT_TYPE`. The catalogue lives in lex-document-service
 * — `getDocumentTypeCatalogue()` — because that is the service that reads the
 * files: the request and the analysis answering it have to name the same thing.
 *
 * Send the code, never the display name: the name is a label an admin can
 * rename, the code is what the reader matches on.
 *
 * `note` is what turns a second rejected upload into a first accepted one:
 * "last six months", "stamped by the employer", "the page showing the IBAN".
 */
export interface LexRequestedDocument {
  kind: string;
  note?: string;
}

export interface LexSendToSourceRequest {
  /** Required. Shown to the applicant *and* written to the audit trail. */
  detail: string;
  /** Required, with no default — see `LexSourceRequestChannel`. */
  channel: LexSourceRequestChannel | string;
  /** Optional. Zero rows is valid and means "answer the question". */
  requestedDocuments?: LexRequestedDocument[];
  /** Optional duration in hours. Omit for no deadline. */
  dueInHours?: number;
}

/**
 * What the case is waiting on. **Null whenever nothing is outstanding**, which
 * is how the panel knows to disappear — including when the applicant pressed
 * Send and nobody on this side did anything. Nothing auto-submits: the upload
 * that completes the checklist still answers `submitted: false`, so a wrong
 * file can be replaced instead of leaving with the case.
 */
export interface LexOutstandingRequest {
  channel?: LexSourceRequestChannel | string | null;
  detail?: string | null;
  documents?: LexRequestedDocument[];
  /** Null means no deadline — which is "no deadline", never "overdue". */
  dueAt?: string | null;
  requestedAt?: string | null;
  /**
   * **Computed server-side.** Use it as given: comparing `dueAt` against the
   * browser clock puts an overdue badge on a case whose owner's laptop is
   * simply set wrong.
   */
  overdue?: boolean;
}

/**
 * Which requested kinds have actually arrived.
 *
 * The request object does not say — it is the audit trail that does, through
 * `DOCUMENT_UPLOADED` entries whose detail reads `Received BANK_STATEMENT
 * (statement.pdf)`. Matching is case-insensitive because `Bank_Statement` and
 * `BANK_STATEMENT` are the same document to the service that stores them.
 */
export const receivedDocumentKinds = (record?: LexCase | null): Set<string> => {
  const kinds = new Set<string>();
  for (const entry of record?.auditTrail || []) {
    if (entry.action !== "DOCUMENT_UPLOADED") continue;
    const match = /received\s+([A-Za-z0-9_\-.]+)/i.exec(entry.detail || "");
    if (match) kinds.add(match[1].toLowerCase());
  }
  return kinds;
};

/**
 * One row of the case's document **inventory** — what the underwriter has, not
 * what the reader concluded about it.
 *
 * Two sources are merged on purpose: files the applicant sent back through a
 * hand-back (`uploadedByApplicant`, with a `fileName`) and the files that came
 * with the original submission. An underwriter asks "what have I got", not
 * "which subsystem knows about it".
 */
export interface LexCaseDocument {
  documentId: string;
  kind?: string | null;
  /** Null for the original submission — render nothing, not an empty slot. */
  fileName?: string | null;
  receivedAt?: string | null;
  /**
   * `VERIFIED` · `ADVERSE_FINDINGS` · `UNREADABLE` · `WRONG_TYPE` ·
   * `ANALYSIS_UNAVAILABLE`. **Null means nothing has read it yet** — which must
   * render as "Not analysed" and never as a blank cell, because a blank beside
   * four verdicts reads as a pass.
   */
  verificationState?: string | null;
  /** The submission is at fault, not the applicant. Style it apart. */
  dataProblem?: boolean;
  /** Null when unanalysed. Links to the check rows. */
  analysisId?: string | null;
  uploadedByApplicant?: boolean;
  /**
   * **Relative** (`documents/{id}/content`), because the caller reached this
   * service through some gateway prefix and an absolute URL built server-side
   * would be that gateway's guess. Join it to the case call's own base — which
   * is what `getCaseDocumentBlob` does.
   */
  contentUrl?: string | null;
}

/**
 * The inventory. Newest first: a case with three hand-backs carries three
 * generations of the same `kind`, and the one that matters is the last.
 *
 * `documentVerification` on the case is unchanged and stays the source for the
 * check-row panel. This list is the inventory; that one is the forensics.
 */
export const getCaseDocuments = async (caseId: string): Promise<LexCaseDocument[]> => {
  // A bare array on this endpoint, an envelope on some deployments — read it
  // through the list unwrapper so either shape renders.
  const rows = unwrapList<LexCaseDocument>(await lexCaseApi.get(`${CASES}/${caseId}/documents`));
  return [...rows].sort(
    (a, b) => new Date(b.receivedAt || 0).getTime() - new Date(a.receivedAt || 0).getTime()
  );
};

/**
 * Fetch a document's bytes.
 *
 * The endpoint requires the Authorization header, so `<img src>` and
 * `<a href>` cannot be used — the browser sends no token and the 401 renders as
 * a broken image. This returns the blob; the caller makes an object URL from it
 * and **must revoke it when the viewer closes**, because those leak until it
 * does. The response is `Cache-Control: no-store` — it is somebody's payslip,
 * so nothing here persists it.
 */
export const getCaseDocumentBlob = async (
  caseId: string,
  doc: Pick<LexCaseDocument, "documentId" | "contentUrl">
): Promise<Blob> => {
  // The server's own relative path when it gives one, so a future change to the
  // route does not need a matching change here.
  const path = doc.contentUrl || `documents/${doc.documentId}/content`;
  try {
    const response = await lexCaseApi.get(`${CASES}/${caseId}/${path}`, { responseType: "blob" });
    return response.data as Blob;
  } catch (error) {
    // `responseType: blob` applies to the failure too, so the envelope arrives
    // as a Blob and `lexErrorCode` would read undefined off it — every 422
    // would then show the generic message instead of the one that says whether
    // to offer a retry. Decode it back into the shape the error helpers expect.
    throw await withDecodedErrorBody(error);
  }
};

const withDecodedErrorBody = async (error: unknown): Promise<unknown> => {
  const failure = error as { response?: { data?: unknown } };
  const body = failure?.response?.data;
  if (!(body instanceof Blob)) return error;
  try {
    failure.response!.data = JSON.parse(await body.text());
  } catch {
    // Not JSON — an infrastructure body. Leave it; the status still speaks.
    failure.response!.data = undefined;
  }
  return error;
};

export interface LexCase {
  id: string;
  applicationId: string;
  routingType?: string;
  status: LexCaseStatus | string;
  /** True once decided. **This** disables the form, not `status`. */
  readOnly?: boolean;
  /** The value sat above every configured band. Handled, not an error. */
  beyondDelegation?: boolean;
  assignedLevelCode?: string | null;
  assigneeUserId?: string | null;
  applicationInfo?: LexApplicationInfo;
  attachedCodes?: LexAttachedCode[];
  messages?: LexCaseMessage[];
  /**
   * Null when no published SLA policy covers this case's scope — not tracked,
   * which is a configuration gap and never a zero clock. `slaInfo` is the newer
   * spelling; read it through `caseSla()` rather than either field directly.
   */
  sla?: LexCaseSla | null;
  slaInfo?: LexCaseSla | null;
  decision?: LexCaseDecision | null;
  /**
   * The document analyses for this application, embedded on the case package
   * rather than fetched from lex-document-service. Same shape as `LexAnalysis`
   * except the id arrives as `analysisId` — the field is the analysis' own id,
   * not a link to something else.
   *
   * Read it in preference to `GET /documents/analyses`: it is the set the case
   * was actually opened against, it needs no second permission, and it cannot
   * drift from the reason codes attached above.
   */
  documentVerification?: LexCaseDocumentAnalysis[];
  /** The open hand-back, or null when the case is waiting on nothing. */
  outstandingRequest?: LexOutstandingRequest | null;
  auditTrail?: LexAuditEntry[];
  openedAt?: string;
  closedAt?: string | null;
}

/**
 * `scope=mine` — cases still awaiting a person, at or **below** the caller's
 * rung. At or below, because authority runs upward: an L2 underwriter can
 * decide an L1 case, so hiding it would leave work nobody sees. An admin is not
 * on the ladder and sees everything in flight.
 *
 * The server resolves the caller's rung itself — it already does so to decide
 * whether they may approve. Asking the client to map role → level → ordinal a
 * second time means two places have to agree about authority, and they drift.
 */
export const getCases = async (
  query: LexPageQuery & { filter?: string; sort?: string; scope?: "mine" } = {}
): Promise<LexPage<LexCaseSummary>> => {
  const { page = 1, size = 20, ...rest } = query;
  return pageOf(
    await lexCaseApi.get(CASES, { params: clean({ page: toServerPage(page), size, ...rest }) }),
    size,
    page
  );
};

/**
 * What the countdown chip should say.
 *
 * Null remaining means untracked and negative means past due — neither is a
 * countdown, and a stopped clock is a state rather than a ticking number.
 */
export const slaChip = (
  row: Pick<LexCaseSummary, "slaStatus" | "slaRemainingMinutes" | "slaStopped">
): { kind: "untracked" | "stopped" | "overdue" | "remaining"; minutes: number } => {
  if (row.slaStopped) return { kind: "stopped", minutes: 0 };
  if (row.slaRemainingMinutes === null || row.slaRemainingMinutes === undefined) {
    return { kind: "untracked", minutes: 0 };
  }
  if (row.slaRemainingMinutes < 0) return { kind: "overdue", minutes: -row.slaRemainingMinutes };
  return { kind: "remaining", minutes: row.slaRemainingMinutes };
};

/**
 * The chip on the row, which is **two fields and not one**.
 *
 * `status` is the lifecycle; `decisionAction` is what a person chose. A resolved
 * case reads "Approved" or "Declined" depending on the verb, and printing
 * `status` alone would show every decided case as the same word.
 */
export const caseChip = (
  row: Pick<LexCaseSummary, "status" | "decisionAction">
):
  | "OPEN"
  | "IN_REVIEW"
  | "AWAITING_SOURCE"
  | "AWAITING_PHYSICAL_VERIFICATION"
  | "ESCALATED"
  | "APPROVED"
  | "DECLINED"
  | "RESOLVED"
  | "CLOSED" => {
  if (row.status === "RESOLVED") {
    const action = canonicalAction(row.decisionAction);
    if (["APPROVE", "VERIFY", "OVERRULE"].includes(action)) return "APPROVED";
    if (["REJECT", "DECLINE"].includes(action)) return "DECLINED";
    return "RESOLVED";
  }
  if (isWithSource(row.status)) return "AWAITING_SOURCE";
  if (row.status === "AWAITING_PHYSICAL_VERIFICATION") return "AWAITING_PHYSICAL_VERIFICATION";
  if (row.status === "CLOSED") return "CLOSED";
  if (row.status === "ESCALATED") return "ESCALATED";
  if (row.status === "IN_REVIEW") return "IN_REVIEW";
  return "OPEN";
};

export const getCase = async (caseId: string): Promise<LexCase> =>
  unwrap(await lexCaseApi.get(`${CASES}/${caseId}`));

export const claimCase = async (caseId: string): Promise<LexCase> =>
  unwrap(await lexCaseApi.post(`${CASES}/${caseId}/claim`, {}));

/**
 * What this case permits — **ask, never hardcode**.
 *
 * The vocabulary is defined per Reason Code process, so a fixed picker here
 * would disagree with the configurator and a free text field lets anything
 * through. Before the server enforced the list, a production case was closed
 * with the action `JGY`: it counts as neither approved nor declined, and the
 * loan behind it never resumes because every reader downstream filters on real
 * verbs.
 */
export interface LexCaseActions {
  /** **The dropdown.** Nothing outside this list is accepted. */
  resolvingActions: string[];
  /** Includes ESCALATE — which is a separate call, not a decision. */
  primaryActions?: string[];
  additionalActions?: string[];
  /** Escalate is `POST /escalate`, never `/decision`. */
  escalationAvailable?: boolean;
  /** What `evidenceReference` must point at. Present ⇒ the field is required. */
  evidenceType?: string | null;
  /**
   * False when no published process covers the driving code. The verbs are then
   * routing defaults, and the honest thing is to say so and offer to configure
   * the code rather than imply a policy decided this.
   */
  fromConfiguredProcess?: boolean;
}

export const getCaseActions = async (caseId: string): Promise<LexCaseActions> => {
  const payload = unwrap<LexCaseActions>(await lexCaseApi.get(`${CASES}/${caseId}/actions`));
  return { ...payload, resolvingActions: payload?.resolvingActions || [] };
};

/** `lex.cases.messages` / `create` — a different object from the case itself. */
export const postCaseMessage = async (caseId: string, body: string): Promise<LexCaseMessage> =>
  unwrap(await lexCaseApi.post(`${CASES}/${caseId}/messages`, { body }));

/**
 * Up one rung. `422 LEX.CASE.AT_HIGHEST_LEVEL` is a hard stop, not a jump into a
 * level nobody switched on — the case has to be decided where it is.
 */
export const escalateCase = async (caseId: string, note?: string): Promise<LexCase> =>
  unwrap(await lexCaseApi.post(`${CASES}/${caseId}/escalate`, clean({ note })));

/**
 * Hand the case back to the applicant.
 *
 * Stops the SLA clock — which is why elapsed time can be smaller than wall
 * time — and mints a one-time upload link that is sent over the chosen channel.
 * The link is never returned here and cannot be re-read: there is no resend
 * endpoint, and re-sending means handing the case back again.
 *
 * `dueInHours` is a **duration**, not a timestamp: the deadline is computed
 * server-side so it does not ride on the browser clock. Never send a date.
 */
export const sendCaseToSource = async (
  caseId: string,
  body: LexSendToSourceRequest
): Promise<LexCase> =>
  unwrap(
    await lexCaseApi.post(
      `${CASES}/${caseId}/send-to-source`,
      clean({
        detail: body.detail,
        channel: body.channel,
        // An empty list is meaningful — it is a question rather than a
        // re-upload — but `clean` would drop it, so it is only sent when there
        // is something in it.
        requestedDocuments: body.requestedDocuments?.length ? body.requestedDocuments : undefined,
        dueInHours: body.dueInHours,
      })
    )
  );

/**
 * The manual close of the loop, for when the applicant sent something by other
 * means. The link path closes itself — see `outstandingRequest`.
 */
export const markSourceResponded = async (caseId: string, detail?: string): Promise<LexCase> =>
  unwrap(await lexCaseApi.post(`${CASES}/${caseId}/source-responded`, clean({ detail })));

/** Field verification. Stops the clock for the same reason sending to source does. */
export const sendForPhysicalVerification = async (
  caseId: string,
  note?: string
): Promise<LexCase> =>
  unwrap(await lexCaseApi.post(`${CASES}/${caseId}/physical-verification`, clean({ note })));

export const completePhysicalVerification = async (caseId: string): Promise<LexCase> =>
  unwrap(await lexCaseApi.post(`${CASES}/${caseId}/physical-verification/complete`, {}));

/**
 * `lex.cases.decision` / `create`.
 *
 * The action must be in this process's vocabulary — a credit verb on an
 * APPLICATION_SOURCE case is refused with `LEX.CASE.INVALID_ACTION`, and an
 * overrule with no reason with `LEX.CASE.OVERRIDE_REASON_REQUIRED`.
 */
export const decideCase = async (
  caseId: string,
  body: {
    action: string;
    writtenReason?: string;
    evidenceReference?: string | null;
    /** True ⇒ `writtenReason` is mandatory; the server refuses one without. */
    overrode?: boolean;
  }
): Promise<LexCase> =>
  unwrap(
    await lexCaseApi.post(`${CASES}/${caseId}/decision`, {
      ...body,
      action: canonicalAction(body.action),
    })
  );

/**
 * The SLA block under either spelling. Null means no published policy covers
 * this case's product and sector — the screen says "not tracked", because a case
 * with no target silently never breaches and is not therefore compliant.
 */
export const caseSla = (caseRecord?: LexCase | null): LexCaseSla | null =>
  caseRecord?.slaInfo ?? caseRecord?.sla ?? null;

/** The routing explanation LEX wrote — it lives inside `messages`, not beside them. */
export const systemMessage = (caseRecord?: LexCase): LexCaseMessage | undefined =>
  caseRecord?.messages?.find((m) => String(m.kind).startsWith("SYSTEM"));

/**
 * The canonical verb.
 *
 * Past-tense spellings are folded — `APPROVED`→`APPROVE`, and the same for
 * VERIFIED / OVERRULED / REJECTED / DECLINED / ESCALATED — because the server
 * accepts both and the two must not count as different outcomes on this side.
 */
export const canonicalAction = (action?: string | null): string => {
  const normalized = String(action || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  return normalized.endsWith("D") && PAST_TENSE[normalized] ? PAST_TENSE[normalized] : normalized;
};

const PAST_TENSE: Record<string, string> = {
  APPROVED: "APPROVE",
  VERIFIED: "VERIFY",
  OVERRULED: "OVERRULE",
  REJECTED: "REJECT",
  DECLINED: "DECLINE",
  ESCALATED: "ESCALATE",
};

/** Overruling always needs a written reason; the server refuses one without. */
export const isOverrideAction = (action: string) =>
  ["OVERRULE", "OVERRIDE"].includes(canonicalAction(action));
