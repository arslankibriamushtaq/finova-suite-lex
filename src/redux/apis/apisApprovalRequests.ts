import type { AxiosResponse } from "axios";

import axiosLendingService from "../../utils/axiosLendingService";
import type { OnRejectAction, ApprovalPolicy } from "./apisApprovalWorkflows";

/**
 * Approval requests — lending-service. The runtime half of dynamic approval
 * workflows.
 *
 * `apisApprovalWorkflows` (identity-service) *defines* a chain. This module is
 * what happens when one runs: a write to a governed entity is parked as a
 * request, walks the stages, and is applied only when the last one passes.
 *
 * The consequence for every screen that writes a governed entity: the write
 * endpoint now has two success shapes. See `isParkedForApproval` below — that is
 * the whole integration for a caller that only needs to stop saying "saved".
 */

const BASE = "/api/v1/approval-requests";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The request's own lifecycle, as distinct from the record's `businessStatus`. */
export type ApprovalRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

/** Where a stage stands in the chain — enough to draw it as a progress bar. */
export type StageProgress = "WAITING" | "CURRENT" | "APPROVED" | "REJECTED";

export type ApprovalDecision = "APPROVE" | "REJECT";

/** The write that is being held back. */
export type ApprovalAction = "CREATE" | "UPDATE" | "DELETE";

/**
 * The `202` body. Deliberately not the entity shape with null fields — nothing
 * was created or changed, and a caller that treats this as a saved record will
 * show a row that does not exist.
 */
export interface PendingApproval {
  requestId: string;
  status: ApprovalRequestStatus;
  businessStatus: string;
  workflowName: string;
  currentStageSeq: number;
  currentStageCode: string;
  currentStageName: string;
  currentDepartmentCode: string;
  currentRoleCode: string;
  /** Already localized and already names the department and role. Show it as-is. */
  message: string;
}

export interface ApprovalRequestStage {
  sequenceNo: number;
  stageCode: string;
  stageName: string;
  departmentCode: string;
  roleCode: string;
  approvalPolicy: ApprovalPolicy;
  resultStatus: string;
  onRejectAction: OnRejectAction | null;
  onRejectSequenceNo: number | null;
  status: StageProgress;
  eligibleApproverCount: number;
}

export interface ApprovalRequestAction {
  stageSequenceNo: number;
  stageCode: string;
  actorId: string;
  decision: ApprovalDecision;
  comment: string | null;
  /**
   * False once a rejection sent the request back past this stage, superseding
   * the approval. Keep it in the history, greyed — it happened — but never
   * count it towards a stage's `ALL` quorum.
   */
  effective: boolean;
  actedAt: string;
}

export interface ApprovalRequest {
  id: string;
  flowTypeCode: string;
  workflowName: string;
  entityType: string;
  /** Null on a CREATE — there is no record yet for the request to point at. */
  entityId: string | null;
  action: ApprovalAction;
  /** A JSON **string**, not an object. Parse it with `parsePayload`. */
  payload: string | null;
  status: ApprovalRequestStatus;
  /** The `resultStatus` of the last stage that passed — what the record reads as. */
  businessStatus: string;
  currentStageSeq: number;
  currentStageCode: string;
  requestedBy: string;
  requestedAt: string;
  completedAt: string | null;
  /** Null on the list endpoint — that is a header-only listing. */
  stages: ApprovalRequestStage[] | null;
  actions: ApprovalRequestAction[] | null;
}

export interface ApprovalRequestQuery {
  page?: number;
  size?: number;
  status?: ApprovalRequestStatus;
  entityType?: string;
  action?: ApprovalAction;
  flowTypeCode?: string;
  requestedBy?: string;
}

// ---------------------------------------------------------------------------
// The 202 fork
// ---------------------------------------------------------------------------

/**
 * Did this write get parked for approval instead of applied?
 *
 * Once a chain is live for the entity's flow type, `POST` / `PUT` / `DELETE`
 * answer `202` and a {@link PendingApproval} rather than `201` / `200` / `204`.
 * Every caller of a governed write endpoint has to fork on this, or it will
 * announce a save that did not happen and refresh a list the record is not in.
 */
export const isParkedForApproval = (response: AxiosResponse): boolean => response?.status === 202;

/** The `202` body, or `undefined` when the write went straight through. */
export const parkedApproval = (response: AxiosResponse): PendingApproval | undefined =>
  isParkedForApproval(response) ? response.data?.data || response.data : undefined;

/** `payload` arrives as a JSON string; anything unparseable is shown as raw text. */
export const parsePayload = (payload: string | null): Record<string, unknown> | null => {
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

const qs = (params: Record<string, string | number | undefined>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.append(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
};

/** Headers only — `stages`, `actions` and `payload` come back null here. */
export function getApprovalRequests(query: ApprovalRequestQuery = {}) {
  return axiosLendingService.get(
    `${BASE}${qs(query as Record<string, string | number | undefined>)}`
  );
}

/**
 * Everything sitting on a stage the signed-in user is eligible for, in full
 * detail. A user's own requests are never in it, so this is exactly "things you
 * can act on" — no maker filtering needed on the client.
 */
export function getMyApprovalQueue() {
  return axiosLendingService.get(`${BASE}/my-queue`);
}

/**
 * Full detail. Also accepts the **id of the record** being held back, so a
 * detail screen can ask "does this row have a pending change?" without a search.
 */
export function getApprovalRequest(idOrEntityId: string) {
  return axiosLendingService.get(`${BASE}/${idOrEntityId}`);
}

/** Comment optional. Returns the updated detail — re-render from it. */
export function approveApprovalRequest(id: string, comment?: string) {
  return axiosLendingService.post(`${BASE}/${id}/approve`, { comment: comment || null });
}

/** Comment is required, and the server enforces it. Returns the updated detail. */
export function rejectApprovalRequest(id: string, comment: string) {
  return axiosLendingService.post(`${BASE}/${id}/reject`, { comment });
}

/**
 * The corrected body, in the same shape as the original write. Maker only, and
 * only while the request has come back to stage 1.
 */
export function resubmitApprovalRequest(id: string, body: unknown) {
  return axiosLendingService.post(`${BASE}/${id}/resubmit`, body);
}

/** Maker only. Withdraws the request; nothing is written. */
export function cancelApprovalRequest(id: string) {
  return axiosLendingService.post(`${BASE}/${id}/cancel`);
}

// ---------------------------------------------------------------------------
// Errors — switch on `code`, never on `message`.
// ---------------------------------------------------------------------------

export const APPROVAL_REQUEST_ERRORS = {
  /** Permission is there; the chain just does not list this person for this stage. */
  NOT_ELIGIBLE: "LENDING.APPROVAL_REQUEST.NOT_ELIGIBLE",
  /** Four-eyes: you raised it. */
  MAKER_CANNOT_APPROVE: "LENDING.APPROVAL_REQUEST.MAKER_CANNOT_APPROVE",
  ALREADY_ACTED: "LENDING.APPROVAL_REQUEST.ALREADY_ACTED",
  ENTITY_ALREADY_PENDING: "LENDING.APPROVAL_REQUEST.ENTITY_ALREADY_PENDING",
  NOT_PENDING: "LENDING.APPROVAL_REQUEST.NOT_PENDING",
  NOT_THE_MAKER: "LENDING.APPROVAL_REQUEST.NOT_THE_MAKER",
  NOT_RETURNED_TO_MAKER: "LENDING.APPROVAL_REQUEST.NOT_RETURNED_TO_MAKER",
  NO_ELIGIBLE_APPROVERS: "LENDING.APPROVAL_REQUEST.NO_ELIGIBLE_APPROVERS",
  /** identity-service unreachable. The gate fails closed: the write was REFUSED. */
  CHAIN_UNAVAILABLE: "LENDING.APPROVAL_REQUEST.CHAIN_UNAVAILABLE",
  APPLY_FAILED: "LENDING.APPROVAL_REQUEST.APPLY_FAILED",
} as const;

export const approvalRequestErrorCode = (error: unknown): string | undefined =>
  (error as { response?: { data?: { code?: string } } })?.response?.data?.code;

/**
 * Fallbacks for the codes whose consequence is easy to read the wrong way. The
 * server's own message is preferred where there is one — it is localized and it
 * names the stage, department and role.
 */
const MESSAGES: Record<string, string> = {
  [APPROVAL_REQUEST_ERRORS.NOT_ELIGIBLE]:
    "You are not an approver for the stage this request is on.",
  [APPROVAL_REQUEST_ERRORS.MAKER_CANNOT_APPROVE]:
    "You raised this request, so you cannot approve it.",
  [APPROVAL_REQUEST_ERRORS.ALREADY_ACTED]:
    "You have already decided this stage — it is waiting on your colleagues.",
  [APPROVAL_REQUEST_ERRORS.ENTITY_ALREADY_PENDING]:
    "That record already has a change waiting for approval.",
  [APPROVAL_REQUEST_ERRORS.NOT_PENDING]:
    "This request has already been decided. Refresh to see where it ended up.",
  [APPROVAL_REQUEST_ERRORS.NOT_THE_MAKER]: "Only the person who raised this request can do that.",
  [APPROVAL_REQUEST_ERRORS.NOT_RETURNED_TO_MAKER]:
    "This request can only be resubmitted once it has been sent back to you.",
  [APPROVAL_REQUEST_ERRORS.NO_ELIGIBLE_APPROVERS]:
    "A stage in the chain has nobody in its role, so the request cannot move. An admin needs to fix the workflow.",
  // The important one: nothing was saved and nothing was queued. Reading this as
  // "it is in the queue" loses the change silently.
  [APPROVAL_REQUEST_ERRORS.CHAIN_UNAVAILABLE]:
    "Your change was not saved — the approval service could not be reached. Please try again.",
  [APPROVAL_REQUEST_ERRORS.APPLY_FAILED]:
    "The approved change could not be applied, so the approval was rolled back. The request is still on its final stage.",
};

export const approvalRequestMessage = (error: unknown, fallback: string): string => {
  const data = (error as { response?: { data?: { code?: string; message?: string } } })?.response
    ?.data;
  return data?.message || MESSAGES[data?.code || ""] || fallback;
};

/** True when the failed write was refused outright rather than parked. */
export const isChainUnavailable = (error: unknown): boolean =>
  approvalRequestErrorCode(error) === APPROVAL_REQUEST_ERRORS.CHAIN_UNAVAILABLE;

/** True when the record already has an open request — link to it, do not error. */
export const isEntityAlreadyPending = (error: unknown): boolean =>
  approvalRequestErrorCode(error) === APPROVAL_REQUEST_ERRORS.ENTITY_ALREADY_PENDING;
