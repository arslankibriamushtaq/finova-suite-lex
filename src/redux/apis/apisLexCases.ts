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

/** Stops the SLA clock — which is why elapsed time can be smaller than wall time. */
export const sendCaseToSource = async (caseId: string, note?: string): Promise<LexCase> =>
  unwrap(await lexCaseApi.post(`${CASES}/${caseId}/send-to-source`, clean({ note })));

export const markSourceResponded = async (caseId: string): Promise<LexCase> =>
  unwrap(await lexCaseApi.post(`${CASES}/${caseId}/source-responded`, {}));

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
