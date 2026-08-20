import { lexCaseApi } from "../../utils/axiosLexService";
import { clean, pageOf, toServerPage, unwrap, type LexPage, type LexPageQuery } from "./apisLexCore";

/**
 * lex-case-service (:8203), review cases — `lex.cases`.
 *
 * **Messages and decisions are separate Casbin objects**, not actions on
 * `lex.cases`: `lex.cases.messages` (create) and `lex.cases.decision` (create).
 * A policy set that grants only `lex.cases` produces a screen where everything
 * loads and the decide button 403s, which is why the two are gated apart here.
 */

const CASES = "/api/v1/lex/cases";

export type LexCaseStatus =
  | "OPEN"
  | "IN_REVIEW"
  | "WITH_SOURCE"
  | "ESCALATED"
  | "RESOLVED"
  | "CLOSED";

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
  sectorId?: string | null;
  sectorName?: string | null;
  /** The agent or channel partner that sourced it. */
  salesId?: string | null;
  sourceChannel?: string | null;

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
  sectorId?: string | null;
  sectorName?: string | null;
  sourceChannel?: string;
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
  /** Null when no published SLA policy covers this case's scope. */
  sla?: LexCaseSla | null;
  decision?: LexCaseDecision | null;
  auditTrail?: LexAuditEntry[];
  openedAt?: string;
  closedAt?: string | null;
}

export const getCases = async (
  query: LexPageQuery & { filter?: string; sort?: string } = {}
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

export const getCase = async (caseId: string): Promise<LexCase> =>
  unwrap(await lexCaseApi.get(`${CASES}/${caseId}`));

export const claimCase = async (caseId: string): Promise<LexCase> =>
  unwrap(await lexCaseApi.post(`${CASES}/${caseId}/claim`, {}));

/** `lex.cases.messages` / `create` — a different object from the case itself. */
export const postCaseMessage = async (caseId: string, body: string): Promise<LexCaseMessage> =>
  unwrap(await lexCaseApi.post(`${CASES}/${caseId}/messages`, { body }));

export const escalateCase = async (caseId: string, reason?: string): Promise<LexCase> =>
  unwrap(await lexCaseApi.post(`${CASES}/${caseId}/escalate`, clean({ reason })));

export const sendCaseToSource = async (caseId: string, note?: string): Promise<LexCase> =>
  unwrap(await lexCaseApi.post(`${CASES}/${caseId}/send-to-source`, clean({ note })));

export const markSourceResponded = async (caseId: string): Promise<LexCase> =>
  unwrap(await lexCaseApi.post(`${CASES}/${caseId}/source-responded`, {}));

/**
 * `lex.cases.decision` / `create`.
 *
 * The action must be in this process's vocabulary — a credit verb on an
 * APPLICATION_SOURCE case is refused with `LEX.CASE.INVALID_ACTION`, and an
 * overrule with no reason with `LEX.CASE.OVERRIDE_REASON_REQUIRED`.
 */
export const decideCase = async (
  caseId: string,
  body: { action: string; writtenReason?: string; evidenceReference?: string | null }
): Promise<LexCase> => unwrap(await lexCaseApi.post(`${CASES}/${caseId}/decision`, body));

/** The routing explanation LEX wrote — it lives inside `messages`, not beside them. */
export const systemMessage = (caseRecord?: LexCase): LexCaseMessage | undefined =>
  caseRecord?.messages?.find((m) => String(m.kind).startsWith("SYSTEM"));

/** Overruling always needs a written reason; the server refuses one without. */
export const isOverrideAction = (action: string) =>
  ["OVERRULE", "OVERRIDE"].includes(action.trim().toUpperCase().replace(/[\s-]+/g, "_"));
