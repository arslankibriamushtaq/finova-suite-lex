import type { AxiosResponse } from "axios";

import axiosSupport from "../../utils/axiosSupport";

/**
 * Complaint management — the register, not the inbox.
 *
 * Contract: `support-service` (see SUPPORT_COMPLAINTS_ADMIN_API).
 *
 * These endpoints are **read-only by design**. Answering a complaint —
 * replying, assigning, resolving — happens in the support engine's own console,
 * which the console-session endpoints below open by SSO. There is deliberately
 * no assign/resolve call here: two systems writing the same state is how they
 * drift apart.
 *
 * As with `apisTenancyAdmin`, each function returns the **unwrapped `data`**
 * rather than the axios response.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ComplaintStatus = "OPEN" | "PENDING" | "RESOLVED";

export const COMPLAINT_STATUSES: ComplaintStatus[] = ["OPEN", "PENDING", "RESOLVED"];

export type ComplaintScope = "CUSTOMER_TO_TENANT" | "TENANT_TO_PLATFORM";

export type ComplainantType = "CUSTOMER" | "TENANT_ADMIN";

/**
 * How a complaint ended — a separate question from whether the talking stopped.
 * A status says the conversation closed; it cannot answer "how many complaints
 * were upheld", which is why this is recorded by a person and lands in the
 * history with that person on it.
 */
export type ComplaintOutcome = "RESOLVED" | "REJECTED" | "INVALID" | "DUPLICATE";

export const COMPLAINT_OUTCOMES: ComplaintOutcome[] = [
  "RESOLVED",
  "REJECTED",
  "INVALID",
  "DUPLICATE",
];

/** What each outcome claims, in the words the person choosing it needs. */
export const COMPLAINT_OUTCOME_HINTS: Record<ComplaintOutcome, string> = {
  RESOLVED: "Upheld — something was wrong and it was put right.",
  REJECTED: "Considered and not upheld.",
  INVALID: "Not a complaint: a question, a test, or spam.",
  DUPLICATE: "The same complaint arrived twice.",
};

// ---------------------------------------------------------------------------
// The taxonomy — what a complaint can be about, and how fast each kind must be
// answered. Tenant-scoped: these are the tenant's own categories.
// ---------------------------------------------------------------------------

export interface SupportPriority {
  id: string;
  /** Immutable once created — `[A-Z][A-Z0-9_]{1,39}`. A rename edits the names. */
  code: string;
  nameEn: string;
  nameAr: string;
  /** Somebody looked at it. Minutes, so a 30-minute fraud target can be written down. */
  acknowledgeMinutes: number;
  /** Never below `acknowledgeMinutes` — that is a contradiction, not a stricter promise. */
  resolveMinutes: number;
  displayOrder: number;
  active: boolean;
}

export interface SupportCategory {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  displayOrder: number;
  active: boolean;
}

export interface SupportSubCategory {
  id: string;
  categoryId: string;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  /** Required. The whole SLA ladder rests on it, and the API refuses a save without it. */
  priorityId: string;
  /** Free-form, matching a team in the engine. The escalation ladder will build on it. */
  owningTeam?: string | null;
  displayOrder: number;
  active: boolean;
}

/**
 * The append-only trail. The table refuses UPDATE, DELETE and TRUNCATE, so what
 * comes back is what happened.
 *
 * `ESCALATED` and `SLA_BREACHED` are reserved — nothing writes them yet, and the
 * union carries them so a screen does not break the day something does.
 */
export type ComplaintEventType =
  | "OPENED"
  | "ASSIGNED"
  | "UNASSIGNED"
  | "AGENT_REPLIED"
  | "STATUS_CHANGED"
  | "REOPENED"
  | "OUTCOME_RECORDED"
  | "ESCALATED"
  | "SLA_BREACHED";

export interface ComplaintEvent {
  /** Widened deliberately: an unknown type must render, not throw. */
  type: ComplaintEventType | string;
  /** Free-form — statuses for a status change, agent names for an assignment. Render, never parse. */
  fromValue: string | null;
  toValue: string | null;
  actorType: string | null;
  actorName: string | null;
  note: string | null;
  occurredAt: string;
}

export interface Complaint {
  id: string;
  referenceNo: string;
  tenantId: string;
  scope: ComplaintScope;
  complainantType: ComplainantType;
  /** The complainant's **Keycloak subject**, not their customer-service id. */
  complainantId: string;
  /** Usually null: the engine has no subject line for an API-channel conversation. */
  subject: string | null;
  status: ComplaintStatus;
  /**
   * The agent currently holding it, mirrored from the engine within about a
   * second. A MIRROR, not a control — reassignment happens in the engine's
   * console, so nothing here writes it.
   */
  assigneeName: string | null;
  assignedAt: string | null;
  /** Null until somebody classifies it; only ever set on a RESOLVED complaint. */
  resolutionOutcome: ComplaintOutcome | null;
  resolutionNote: string | null;
  reopenCount: number;
  /** What it is about. Set by the customer's own pick, corrected by an agent. */
  categoryId: string | null;
  subCategoryId: string | null;
  /**
   * The SLA clocks, copied onto the complaint when it was classified.
   *
   * Copied rather than read through the priority, so a tenant that tightens
   * CRITICAL next month does not retroactively breach what it already
   * promised. Null throughout while a complaint is filed at category level
   * only: a priority hangs off the SUB-category, and inventing a target for
   * "something else" would make every unsorted complaint look either urgent
   * or ignorable.
   */
  acknowledgeDueAt: string | null;
  resolveDueAt: string | null;
  acknowledgeBreachedAt: string | null;
  resolveBreachedAt: string | null;
  /**
   * True while the complaint is PENDING — the engine's "waiting on the
   * customer". Both due timestamps move forward by exactly what the pause
   * cost, so a customer who takes three days to reply does not consume the
   * tenant's target.
   */
  slaPaused: boolean;
  /** 0 until the scan climbs the ladder. There is no manual escalate. */
  escalationLevel: number;
  escalationTeam: string | null;
  /**
   * The survey the engine runs after a resolution. **1 worst … 5 best** — the
   * direction is stated because the reference system carried two contradictory
   * definitions of its own, so agents and reports had been reading opposite
   * values. The first answer stands: a score that can be revised after a
   * complaint is closed is a score worth nothing.
   */
  csatRating: number | null;
  csatFeedback: string | null;
  conversationId: number | null;
  openedAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  lastEventAt: string;
}

/**
 * One rung of the escalation ladder.
 *
 * Levels are ordered and climbed one at a time, and escalation stops at the
 * top rung — the reference system had a single rule per sub-category with no
 * level and re-applied it forever, which is a loop wearing a ladder's clothes.
 */
export interface EscalationRule {
  id: string;
  subCategoryId: string;
  /**
   * NOT editable. Complaints already sitting on rung two would jump or stall
   * depending on which way it moved; retire the rung and add another.
   */
  level: number;
  /** From the previous rung, or from the opening for level 1 — on the paused clock. */
  afterMinutes: number;
  /** A rung must name a team or a role. One that names neither escalates to nobody. */
  targetTeam?: string | null;
  targetRole?: string | null;
  active: boolean;
}

export type EscalationRuleDraft = Omit<EscalationRule, "id" | "active">;

/** What the SLA pass changed. Per-record failures: one broken row never stops the rest. */
export interface SlaScanResult {
  acknowledgementBreaches: number;
  resolutionBreaches: number;
  escalations: number;
  failures: number;
  skippedBecauseAnotherInstanceWasRunning: boolean;
}

/**
 * What a complaint is about — the difference between one that is logged and
 * one that is answerable. Without it an agent reads "double charge on my card"
 * and then goes looking for which card.
 */
export type ComplaintSubjectType =
  | "LOAN_APPLICATION"
  | "LOAN"
  | "SETTLEMENT"
  | "INSTALMENT"
  | "PAYMENT"
  | "WALLET"
  | "WALLET_TRANSACTION"
  | "CARD"
  | "CARD_TRANSACTION"
  | "KYC"
  | "ONBOARDING_SESSION"
  | "LEX_CASE"
  | "INVOICE";

export const COMPLAINT_SUBJECT_TYPES: ComplaintSubjectType[] = [
  "LOAN_APPLICATION",
  "LOAN",
  "SETTLEMENT",
  "INSTALMENT",
  "PAYMENT",
  "WALLET",
  "WALLET_TRANSACTION",
  "CARD",
  "CARD_TRANSACTION",
  "KYC",
  "ONBOARDING_SESSION",
  "LEX_CASE",
  "INVOICE",
];

export interface ComplaintLink {
  id: string;
  subjectType: ComplaintSubjectType | string;
  /**
   * TEXT, not a UUID: most are UUIDs, a Fineract loan id is a number, a
   * national id is neither. It carries the owning service's own key.
   *
   * Deliberately unverified by the service. The reference system called an
   * external API synchronously when a ticket was created and refused the
   * ticket when that call failed, so an outage meant no complaints at all. A
   * link pointing at nothing is a wrong label on a real complaint; a complaint
   * refused because lending-service was slow is a lost one.
   */
  subjectId: string;
  /** What the queue renders, so a row needs no extra calls. Trimmed at 200 chars. */
  subjectReference?: string | null;
  note?: string | null;
}

export type ComplaintLinkDraft = Omit<ComplaintLink, "id">;

export interface ComplaintPagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ComplaintPage {
  data: Complaint[];
  pagination: ComplaintPagination;
}

export interface SupportError {
  code?: string;
  message: string;
  status?: number;
  traceId?: string;
}

type RejectedRequest = {
  response?: {
    status?: number;
    data?: { code?: string; message?: string; traceId?: string };
  };
};

/**
 * The platform envelope. Switch on `code` — `error` and `message` are
 * localised by `Accept-Language`, the code never changes.
 */
export const toSupportError = (err: unknown, fallbackMessage: string): SupportError => {
  const response = (err as RejectedRequest)?.response;
  if (!response) return { message: fallbackMessage, code: "NETWORK" };
  return {
    code: response.data?.code,
    // The service's own localised sentence first; the catalog's second; the
    // caller's generic line only when neither said anything.
    message: response.data?.message || catalogMessage(response.data?.code) || fallbackMessage,
    status: response.status,
    traceId: response.data?.traceId,
  };
};

/**
 * A tenant provisioned before the support channel existed answers 422 until it
 * is backfilled. That is a normal empty state, not a failure to shout about.
 */
export const isNotProvisioned = (err: unknown): boolean =>
  (err as RejectedRequest)?.response?.data?.code === "SUPPORT.ACCOUNT.NOT_PROVISIONED";

export const isSuspended = (err: unknown): boolean =>
  (err as RejectedRequest)?.response?.data?.code === "SUPPORT.ACCOUNT.SUSPENDED";

/**
 * The taxonomy refusals, each of which the UI mirrors rather than discovers:
 * a code already used in this tenant, a row something still depends on, and
 * the last active priority, which cannot be retired because a sub-category
 * would then have no SLA target to point at.
 */
export const TAXONOMY_MESSAGES: Record<string, string> = {
  "SUPPORT.TAXONOMY.DUPLICATE_CODE": "That code is already used in this organisation.",
  "SUPPORT.TAXONOMY.IN_USE": "Still in use — retire what depends on it first.",
  "SUPPORT.TAXONOMY.LAST_PRIORITY": "The last active priority cannot be retired.",
  "SUPPORT.TAXONOMY.MISMATCH": "That sub-category belongs to a different category.",
};

/**
 * The service localises its own messages, so that is what a user should read.
 * The table above is the fallback for the case where a refusal arrives with a
 * code and no body — the rule is still worth stating.
 */
export const taxonomyMessage = (err: unknown, fallback: string): string => {
  const error = toSupportError(err, "");
  return error.message || TAXONOMY_MESSAGES[error.code || ""] || fallback;
};

/** That link is not on this complaint — it was already removed, or never added. */
export const isLinkNotFound = (err: unknown): boolean =>
  (err as RejectedRequest)?.response?.data?.code === "SUPPORT.LINK.NOT_FOUND";

/** Classified before the complaint was resolved — a queue is cleared by answering. */
export const isNotResolved = (err: unknown): boolean =>
  (err as RejectedRequest)?.response?.data?.code === "SUPPORT.OUTCOME.NOT_RESOLVED";

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

const unwrapPage = (res: AxiosResponse<ComplaintPage>): ComplaintPage => ({
  data: res.data?.data || [],
  pagination: res.data?.pagination || {
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    empty: true,
  },
});

const unwrap = <T>(res: AxiosResponse<{ data: T }>): T => res.data?.data;

export interface ComplaintQuery {
  status?: ComplaintStatus | "";
  page?: number;
  size?: number;
}

const queryParams = (params: ComplaintQuery) => ({
  status: params.status || undefined,
  page: params.page ?? 0,
  size: params.size ?? 10,
});

/** The tenant's own customers' complaints. Scoped to the caller's `tenant_id`. */
export function getTenantComplaints(params: ComplaintQuery): Promise<ComplaintPage> {
  return axiosSupport
    .get("/tenant/support/complaints", { params: queryParams(params) })
    .then(unwrapPage);
}

export function getTenantComplaint(id: string): Promise<Complaint> {
  return axiosSupport
    .get(`/tenant/support/complaints/${encodeURIComponent(id)}`)
    .then(unwrap<Complaint>);
}

/**
 * Complaints tenants raised about the platform. Super admin only, and the one
 * cross-tenant read in the service — rows arrive from every tenant.
 */
export function getPlatformComplaints(params: ComplaintQuery): Promise<ComplaintPage> {
  return axiosSupport
    .get("/platform/support/complaints", { params: queryParams(params) })
    .then(unwrapPage);
}

export function getPlatformComplaint(id: string): Promise<Complaint> {
  return axiosSupport
    .get(`/platform/support/complaints/${encodeURIComponent(id)}`)
    .then(unwrap<Complaint>);
}

/**
 * The history, oldest first.
 *
 * The engine stamps its events to the whole second, so several often share an
 * `occurredAt`. They arrive in insertion order and the API preserves it — the
 * caller must keep the order it is given rather than re-sorting on the
 * timestamp, which would shuffle same-second events into nonsense.
 */
export function getTenantComplaintEvents(id: string): Promise<ComplaintEvent[]> {
  return axiosSupport
    .get(`/tenant/support/complaints/${encodeURIComponent(id)}/events`)
    .then(unwrap<ComplaintEvent[]>);
}

export function getPlatformComplaintEvents(id: string): Promise<ComplaintEvent[]> {
  return axiosSupport
    .get(`/platform/support/complaints/${encodeURIComponent(id)}/events`)
    .then(unwrap<ComplaintEvent[]>);
}

/**
 * Record how it ended. The one write in the register, and a different act from
 * `read` in Casbin: seeing the queue does not make you someone who may classify
 * its outcomes.
 *
 * The API enforces both rules the UI also applies — only on a RESOLVED
 * complaint, and a note on anything but `RESOLVED`.
 */
export function recordTenantOutcome(
  id: string,
  body: { outcome: ComplaintOutcome; note?: string }
): Promise<void> {
  return axiosSupport
    .post(`/tenant/support/complaints/${encodeURIComponent(id)}/outcome`, body)
    .then(() => undefined);
}

export function recordPlatformOutcome(
  id: string,
  body: { outcome: ComplaintOutcome; note?: string }
): Promise<void> {
  return axiosSupport
    .post(`/platform/support/complaints/${encodeURIComponent(id)}/outcome`, body)
    .then(() => undefined);
}

/**
 * File a complaint under a category.
 *
 * Allowed at any point, resolution included: the first classification usually
 * comes from the customer picking in the app, and an agent correcting it
 * afterwards is the normal case rather than an exception. `subCategoryId` may
 * be omitted while a complaint is still being triaged.
 */
export function classifyComplaint(
  id: string,
  body: { categoryId: string; subCategoryId?: string }
): Promise<void> {
  return axiosSupport
    .put(`/tenant/support/complaints/${encodeURIComponent(id)}/classification`, body)
    .then(() => undefined);
}

// --- Priorities ------------------------------------------------------------

export function getPriorities(activeOnly = true): Promise<SupportPriority[]> {
  return axiosSupport
    .get("/tenant/support/priorities", { params: { activeOnly } })
    .then(unwrap<SupportPriority[]>);
}

export type PriorityDraft = Omit<SupportPriority, "id" | "active">;

export function createPriority(body: PriorityDraft): Promise<SupportPriority> {
  return axiosSupport.post("/tenant/support/priorities", body).then(unwrap<SupportPriority>);
}

export function updatePriority(
  id: string,
  body: Partial<PriorityDraft>
): Promise<SupportPriority> {
  return axiosSupport
    .put(`/tenant/support/priorities/${encodeURIComponent(id)}`, body)
    .then(unwrap<SupportPriority>);
}

/**
 * DELETE never deletes — it deactivates.
 *
 * Complaints already filed under one of these keep pointing at it, and removing
 * the row would take their history and their SLA target with them. Every screen
 * must call this "Retire".
 */
export function retirePriority(id: string): Promise<void> {
  return axiosSupport
    .delete(`/tenant/support/priorities/${encodeURIComponent(id)}`)
    .then(() => undefined);
}

// --- Categories ------------------------------------------------------------

export function getCategories(activeOnly = true): Promise<SupportCategory[]> {
  return axiosSupport
    .get("/tenant/support/categories", { params: { activeOnly } })
    .then(unwrap<SupportCategory[]>);
}

export type CategoryDraft = Omit<SupportCategory, "id" | "active">;

export function createCategory(body: CategoryDraft): Promise<SupportCategory> {
  return axiosSupport.post("/tenant/support/categories", body).then(unwrap<SupportCategory>);
}

export function updateCategory(
  id: string,
  body: Partial<CategoryDraft>
): Promise<SupportCategory> {
  return axiosSupport
    .put(`/tenant/support/categories/${encodeURIComponent(id)}`, body)
    .then(unwrap<SupportCategory>);
}

/** Deactivates. See `retirePriority`. */
export function retireCategory(id: string): Promise<void> {
  return axiosSupport
    .delete(`/tenant/support/categories/${encodeURIComponent(id)}`)
    .then(() => undefined);
}

// --- Sub-categories --------------------------------------------------------

export function getSubCategories(params: {
  categoryId?: string;
  activeOnly?: boolean;
}): Promise<SupportSubCategory[]> {
  return axiosSupport
    .get("/tenant/support/sub-categories", {
      params: {
        categoryId: params.categoryId || undefined,
        activeOnly: params.activeOnly ?? true,
      },
    })
    .then(unwrap<SupportSubCategory[]>);
}

export type SubCategoryDraft = Omit<SupportSubCategory, "id" | "active">;

export function createSubCategory(body: SubCategoryDraft): Promise<SupportSubCategory> {
  return axiosSupport
    .post("/tenant/support/sub-categories", body)
    .then(unwrap<SupportSubCategory>);
}

export function updateSubCategory(
  id: string,
  body: Partial<SubCategoryDraft>
): Promise<SupportSubCategory> {
  return axiosSupport
    .put(`/tenant/support/sub-categories/${encodeURIComponent(id)}`, body)
    .then(unwrap<SupportSubCategory>);
}

/** Deactivates. See `retirePriority`. */
export function retireSubCategory(id: string): Promise<void> {
  return axiosSupport
    .delete(`/tenant/support/sub-categories/${encodeURIComponent(id)}`)
    .then(() => undefined);
}

/**
 * A badge count. There is no stats endpoint, so a count is a one-row page read
 * for its `totalElements`.
 */
export async function countComplaints(
  scope: "tenant" | "platform",
  status: ComplaintStatus
): Promise<number> {
  const read = scope === "tenant" ? getTenantComplaints : getPlatformComplaints;
  const page = await read({ status, size: 1, page: 0 });
  return page.pagination.totalElements;
}

// --- The escalation ladder -------------------------------------------------

export function getEscalationRules(subCategoryId?: string): Promise<EscalationRule[]> {
  return axiosSupport
    .get("/tenant/support/escalation-rules", {
      params: { subCategoryId: subCategoryId || undefined },
    })
    .then(unwrap<EscalationRule[]>);
}

export function createEscalationRule(body: EscalationRuleDraft): Promise<EscalationRule> {
  return axiosSupport.post("/tenant/support/escalation-rules", body).then(unwrap<EscalationRule>);
}

/**
 * Everything but `level`. The API will not move a rung, and neither does this:
 * complaints already sitting on rung two would jump or stall depending on
 * which way it went.
 */
export function updateEscalationRule(
  id: string,
  body: Partial<Omit<EscalationRuleDraft, "level">>
): Promise<EscalationRule> {
  return axiosSupport
    .put(`/tenant/support/escalation-rules/${encodeURIComponent(id)}`, body)
    .then(unwrap<EscalationRule>);
}

/** Deactivates. See `retirePriority`. */
export function retireEscalationRule(id: string): Promise<void> {
  return axiosSupport
    .delete(`/tenant/support/escalation-rules/${encodeURIComponent(id)}`)
    .then(() => undefined);
}

/**
 * The same pass the scheduler makes every minute, run by hand.
 *
 * It changes nothing the scheduled run would not have changed a minute later,
 * which is what makes it safe to offer to an operator. There is deliberately
 * no manual ESCALATE anywhere in this file: an escalation that skipped the
 * clock would make the SLA report a work of fiction.
 */
export function runSlaScan(): Promise<SlaScanResult> {
  return axiosSupport.post("/tenant/support/sla-scan").then(unwrap<SlaScanResult>);
}

// --- What the complaint is about -------------------------------------------

export function getComplaintLinks(complaintId: string): Promise<ComplaintLink[]> {
  return axiosSupport
    .get(`/tenant/support/complaints/${encodeURIComponent(complaintId)}/links`)
    .then(unwrap<ComplaintLink[]>);
}

/**
 * Safe to retry: a POST for a subject already linked returns the existing link
 * with 201, unchanged, so a double-click does not produce two rows.
 */
export function addComplaintLink(
  complaintId: string,
  body: ComplaintLinkDraft
): Promise<ComplaintLink> {
  return axiosSupport
    .post(`/tenant/support/complaints/${encodeURIComponent(complaintId)}/links`, body)
    .then(unwrap<ComplaintLink>);
}

/**
 * Removes the row and writes UNLINKED into the complaint's history, with who
 * did it — a wrong link on a regulated complaint is exactly what a review asks
 * about, so the fact of it outlives the link.
 */
export function removeComplaintLink(complaintId: string, linkId: string): Promise<void> {
  return axiosSupport
    .delete(
      `/tenant/support/complaints/${encodeURIComponent(complaintId)}/links/${encodeURIComponent(
        linkId
      )}`
    )
    .then(() => undefined);
}

/**
 * The reverse read: what a loan, card or wallet screen asks before it draws a
 * badge — has anybody complained about this?
 */
export function getComplaintsBySubject(params: {
  subjectType: ComplaintSubjectType | string;
  subjectId: string;
}): Promise<Complaint[]> {
  return axiosSupport
    .get("/tenant/support/complaints/by-subject", { params })
    .then(unwrap<Complaint[]>);
}

/**
 * What a month of complaints looked like. Both bounds are optional and apply
 * to when the complaint was OPENED — `from` inclusive, `to` exclusive.
 */
export interface SupportReportCategoryRow {
  /** Null for complaints nobody has filed under a category — the "Unfiled" bucket. */
  categoryCode: string | null;
  categoryNameEn: string | null;
  count: number;
}

export interface SupportReportSummary {
  total: number;
  open: number;
  pending: number;
  resolved: number;
  upheld: number;
  rejected: number;
  invalid: number;
  duplicate: number;
  /** Resolved by the engine, classified by nobody. The queue's real paperwork backlog. */
  unclassifiedOutcome: number;
  withSlaTarget: number;
  acknowledgementBreached: number;
  resolutionBreached: number;
  /**
   * NULL, not zero, when `withSlaTarget` is 0 — no complaints with a target is
   * no data, not perfect compliance. Render "—", never "0%".
   */
  acknowledgementMetRate: number | null;
  averageMinutesToFirstResponse: number | null;
  averageMinutesToResolution: number | null;
  reopened: number;
  escalated: number;
  csatResponses: number;
  averageCsat: number | null;
  byCategory: SupportReportCategoryRow[];
}

export interface SupportReportQuery {
  from?: string;
  to?: string;
}

const reportParams = (query: SupportReportQuery = {}) => ({
  from: query.from || undefined,
  to: query.to || undefined,
});

export function getTenantReportSummary(
  query?: SupportReportQuery
): Promise<SupportReportSummary> {
  return axiosSupport
    .get("/tenant/support/reports/summary", { params: reportParams(query) })
    .then(unwrap<SupportReportSummary>);
}

/**
 * Pinned to level 2 in SQL, exactly like the platform queue: a report is not a
 * way around the tenant boundary.
 */
export function getPlatformReportSummary(
  query?: SupportReportQuery
): Promise<SupportReportSummary> {
  return axiosSupport
    .get("/platform/support/reports/summary", { params: reportParams(query) })
    .then(unwrap<SupportReportSummary>);
}

/**
 * The service's own error codes with their localised templates,
 * unauthenticated — so a message can be rendered by code without shipping a
 * copy of the bundle in the frontend.
 */
export interface SupportErrorCode {
  code: string;
  message: string;
  status?: number;
}

export function getSupportErrorCodes(): Promise<SupportErrorCode[]> {
  return axiosSupport.get("/error-codes").then(unwrap<SupportErrorCode[]>);
}

/**
 * The catalog, fetched once and kept — it is a small static table, and the
 * alternative is shipping a copy of the service's message bundle in the
 * frontend and watching the two drift.
 *
 * It is a FALLBACK, never an override: a refusal that carries its own message
 * has already been localised by the service for this caller, and that is the
 * sentence a user should read.
 */
let errorCatalog: Record<string, string> | null = null;
let errorCatalogInFlight: Promise<void> | null = null;

export function primeSupportErrorCatalog(): Promise<void> {
  if (errorCatalog) return Promise.resolve();
  if (!errorCatalogInFlight) {
    errorCatalogInFlight = getSupportErrorCodes()
      .then((codes) => {
        errorCatalog = Object.fromEntries(codes.map((entry) => [entry.code, entry.message]));
      })
      // A missing catalog costs a nicer sentence, nothing else — every caller
      // below still has its own fallback.
      .catch(() => {
        errorCatalog = {};
      })
      .finally(() => {
        errorCatalogInFlight = null;
      });
  }
  return errorCatalogInFlight;
}

/** The catalog's sentence for a code, if it has been primed and knows it. */
export const catalogMessage = (code?: string | null): string | undefined =>
  code ? errorCatalog?.[code] : undefined;

/**
 * The SSO hand-off into the engine's agent console.
 *
 * **This is the only way in** — the administrator account created at
 * provisioning has a random password that was handed to the engine once and is
 * shown to nobody. The URL is single-use and short-lived: fetch it at the
 * moment of the click, redirect immediately, and never store or log it. It is a
 * credential that signs its holder in as that tenant's support administrator.
 */
export function openTenantConsoleSession(): Promise<{ loginUrl: string }> {
  return axiosSupport
    .post("/tenant/support/console-session")
    .then(unwrap<{ loginUrl: string }>);
}

export function openPlatformConsoleSession(): Promise<{ loginUrl: string }> {
  return axiosSupport
    .post("/platform/support/console-session")
    .then(unwrap<{ loginUrl: string }>);
}
