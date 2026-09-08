import axiosFactoring from "../../utils/axiosFactoring";

/**
 * Dynamic approval workflows — identity-service.
 *
 * Definition only. This API describes maker-checker chains; it does not run
 * them. There are no requests and no approve/reject calls yet, which is why
 * nothing here has a runtime verb on it.
 *
 * The shape of a chain:
 *
 *   flow type ─→ workflow ─→ stage 1..n ─→ department + role
 *
 * Three things the server owns, so the client must never send them:
 *
 *   - `sequenceNo` — position in the `stages` array *is* the order.
 *   - `isInitiator` — the first stage in the array is the initiator.
 *   - stage `id` — a stage is addressed by its `stageCode`.
 *
 * Tenant comes from the JWT's `tenant_id` claim; there is no tenant field or
 * header to set here.
 */

const FLOW_TYPES = "/identity-service/api/v1/approval-flow-types";
const WORKFLOWS = "/identity-service/api/v1/approval-workflows";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * What a chain governs. Seeded server-side and read-only in this release — the
 * create/update endpoints do not exist yet, so there is no flow type editor.
 */
export interface ApprovalFlowType {
  id: string;
  flowTypeCode: string;
  flowTypeName: string;
  flowTypeNameAr?: string | null;
  description?: string | null;
  active: boolean;
  displayOrder?: number;
}

/**
 * Where a rejection at a stage goes. The target is **per stage** — stage 3 can
 * send it back to stage 2 while stage 2 sends it back to the maker — so this
 * never collapses into one workflow-level setting.
 */
export type OnRejectAction =
  "RETURN_TO_STAGE" | "RETURN_TO_INITIATOR" | "RETURN_TO_PREVIOUS" | "TERMINATE";

/** `ALL` = every eligible holder of that department+role must approve. */
export type ApprovalPolicy = "ALL" | "ANY";

export const ON_REJECT_ACTIONS: { value: OnRejectAction; label: string; hint: string }[] = [
  {
    value: "RETURN_TO_STAGE",
    label: "Send back to a specific stage",
    hint: "Pick any stage above this one.",
  },
  {
    value: "RETURN_TO_INITIATOR",
    label: "Send back to the creator",
    hint: "Returns to whoever raised the request.",
  },
  {
    value: "RETURN_TO_PREVIOUS",
    label: "Send back one step",
    hint: "Returns to the stage immediately above.",
  },
  { value: "TERMINATE", label: "End the request", hint: "The request stops here, rejected." },
];

/** Only `RETURN_TO_STAGE` carries a target; the other three are self-describing. */
export const needsRejectTarget = (action?: OnRejectAction | null): boolean =>
  action === "RETURN_TO_STAGE";

/** A stage as the server returns it, with department and role names denormalised in. */
export interface ApprovalStage {
  id: string;
  sequenceNo: number;
  stageCode: string;
  stageName: string;
  stageNameAr?: string | null;
  departmentId: string;
  departmentCode?: string;
  departmentName?: string;
  roleId: string;
  roleCode?: string;
  roleName?: string;
  initiator: boolean;
  approvalPolicy: ApprovalPolicy;
  resultStatus: string;
  onRejectAction?: OnRejectAction | null;
  onRejectStageCode?: string | null;
  /**
   * Active employees currently holding that stage's role. Advisory — the server
   * never refuses a zero, because a chain is legitimately defined before anyone
   * is hired into the role. Warn, never block.
   */
  eligibleApproverCount?: number;
}

/** A stage as it is sent. No id, no sequence, no initiator flag. */
export interface ApprovalStagePayload {
  stageCode: string;
  stageName: string;
  stageNameAr?: string | null;
  departmentId: string;
  roleId: string;
  approvalPolicy?: ApprovalPolicy;
  resultStatus: string;
  onRejectAction?: OnRejectAction;
  onRejectStageCode?: string;
}

export interface ApprovalWorkflow {
  id: string;
  flowTypeId: string;
  flowTypeCode: string;
  workflowName: string;
  description?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
  /** Empty on the list endpoint — that is a header-only listing, not an empty chain. */
  stages: ApprovalStage[];
}

export interface CreateWorkflowRequest {
  flowTypeCode: string;
  workflowName: string;
  description?: string | null;
  stages: ApprovalStagePayload[];
}

/** Header fields only. `null` means leave unchanged; stages are not touched. */
export interface UpdateWorkflowRequest {
  workflowName?: string;
  description?: string | null;
}

export interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

const qs = (params: Record<string, string | number | boolean | undefined>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.append(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
};

/** Sort by `displayOrder`; hide `active: false` on the create picker only. */
export function getApprovalFlowTypes(page?: number, size?: number) {
  return axiosFactoring.get(`${FLOW_TYPES}${qs({ page, size })}`);
}

export function getApprovalFlowType(id: string) {
  return axiosFactoring.get(`${FLOW_TYPES}/${id}`);
}

export function getApprovalFlowTypeByCode(flowTypeCode: string) {
  return axiosFactoring.get(`${FLOW_TYPES}/code/${encodeURIComponent(flowTypeCode)}`);
}

/** Headers only — every row comes back with `stages: []`. Fetch the detail to render a chain. */
export function getApprovalWorkflows(page?: number, size?: number) {
  return axiosFactoring.get(`${WORKFLOWS}${qs({ page, size })}`);
}

export function getApprovalWorkflow(id: string) {
  return axiosFactoring.get(`${WORKFLOWS}/${id}`);
}

/**
 * The live chain for a flow type. 404s when the flow type simply has no chain
 * yet — that is the empty state, not a failure.
 */
export function getActiveWorkflowForFlowType(flowTypeCode: string) {
  return axiosFactoring.get(`${WORKFLOWS}/by-flow-type/${encodeURIComponent(flowTypeCode)}/active`);
}

/**
 * Header and the complete chain in one call — a workflow with no stages cannot
 * exist, so there is no create-then-add-stages two-step.
 */
export function createApprovalWorkflow(body: CreateWorkflowRequest) {
  return axiosFactoring.post(WORKFLOWS, body);
}

/** Rename / re-describe. Does not touch stages. */
export function updateApprovalWorkflow(id: string, body: UpdateWorkflowRequest) {
  return axiosFactoring.put(`${WORKFLOWS}/${id}`, body);
}

/**
 * Replaces the **whole ordered chain**. There is no add-one or delete-one
 * endpoint by design: contiguous ordering, a single leading initiator and
 * backward-only reject targets are properties of the chain, not of a stage.
 *
 * Matching is by `stageCode` — present updates in place and keeps the stage id,
 * missing deletes, new inserts. So reordering rows preserves every id, and
 * editing a code is a delete + insert rather than a rename.
 *
 * Atomic: if any rule fails nothing changes, so the chain on screen is still
 * what the server holds and the admin can fix it in place.
 */
export function updateApprovalWorkflowStages(id: string, stages: ApprovalStagePayload[]) {
  return axiosFactoring.put(`${WORKFLOWS}/${id}/stages`, { stages });
}

/**
 * Refuses with DUPLICATE_ACTIVE while another chain governs the same flow type
 * rather than silently switching the incumbent off.
 */
export function activateApprovalWorkflow(id: string) {
  return axiosFactoring.post(`${WORKFLOWS}/${id}/activate`);
}

export function deactivateApprovalWorkflow(id: string) {
  return axiosFactoring.post(`${WORKFLOWS}/${id}/deactivate`);
}

/** Refused while active. The path is deactivate → delete, two deliberate steps. */
export function deleteApprovalWorkflow(id: string) {
  return axiosFactoring.delete(`${WORKFLOWS}/${id}`);
}

// ---------------------------------------------------------------------------
// Errors
//
// Switch on `code`, never on `message` or `error` — both are localized by
// `Accept-Language` and will read differently in en / ar / fr.
// ---------------------------------------------------------------------------

/** Stage-level rules. All 422, all anchored to one field on one row. */
export const STAGE_ERRORS = {
  ROLE_DEPARTMENT_MISMATCH: "IDENTITY.APPROVAL_STAGE.ROLE_DEPARTMENT_MISMATCH",
  REJECT_TARGET_NOT_EARLIER: "IDENTITY.APPROVAL_STAGE.REJECT_TARGET_NOT_EARLIER",
  REJECT_TARGET_INVALID: "IDENTITY.APPROVAL_STAGE.REJECT_TARGET_INVALID",
  CONSECUTIVE_DUPLICATE: "IDENTITY.APPROVAL_STAGE.CONSECUTIVE_DUPLICATE",
  DUPLICATE_CODE: "IDENTITY.APPROVAL_STAGE.DUPLICATE_CODE",
  INVALID_CODE: "IDENTITY.APPROVAL_STAGE.INVALID_CODE",
  INVALID_STATUS: "IDENTITY.APPROVAL_STAGE.INVALID_STATUS",
  INITIATOR_INVALID: "IDENTITY.APPROVAL_STAGE.INITIATOR_INVALID",
  DEPARTMENT_INACTIVE: "IDENTITY.APPROVAL_STAGE.DEPARTMENT_INACTIVE",
  ROLE_INACTIVE: "IDENTITY.APPROVAL_STAGE.ROLE_INACTIVE",
  INVALID_POLICY: "IDENTITY.APPROVAL_STAGE.INVALID_POLICY",
  INVALID_REJECT_ACTION: "IDENTITY.APPROVAL_STAGE.INVALID_REJECT_ACTION",
} as const;

export const WORKFLOW_ERRORS = {
  DUPLICATE_ACTIVE: "IDENTITY.APPROVAL_WORKFLOW.DUPLICATE_ACTIVE",
  ACTIVE_CANNOT_DELETE: "IDENTITY.APPROVAL_WORKFLOW.ACTIVE_CANNOT_DELETE",
  EMPTY: "IDENTITY.APPROVAL_WORKFLOW.EMPTY",
  TOO_MANY_STAGES: "IDENTITY.APPROVAL_WORKFLOW.TOO_MANY_STAGES",
  NOT_FOUND: "IDENTITY.APPROVAL_WORKFLOW.NOT_FOUND",
  FLOW_TYPE_INACTIVE: "IDENTITY.APPROVAL_FLOW_TYPE.INACTIVE",
  FLOW_TYPE_NOT_FOUND: "IDENTITY.APPROVAL_FLOW_TYPE.NOT_FOUND",
  ACCESS_DENIED: "COMMON.AUTH.ACCESS_DENIED",
  VALIDATION_FAILED: "COMMON.VALIDATION.FAILED",
} as const;

/** Deleting a department or a role a chain still references is refused. */
export const IN_USE_BY_WORKFLOW = {
  ROLE: "IDENTITY.ROLE.IN_USE_BY_WORKFLOW",
  DEPARTMENT: "IDENTITY.DEPARTMENT.IN_USE_BY_WORKFLOW",
} as const;

/** Which control on a stage row a given code belongs against. */
export type StageErrorField =
  | "stageCode"
  | "stageName"
  | "roleId"
  | "departmentId"
  | "resultStatus"
  | "onRejectStageCode"
  | "onRejectAction"
  | "form";

const STAGE_ERROR_FIELD: Record<string, StageErrorField> = {
  [STAGE_ERRORS.ROLE_DEPARTMENT_MISMATCH]: "roleId",
  [STAGE_ERRORS.ROLE_INACTIVE]: "roleId",
  [STAGE_ERRORS.DEPARTMENT_INACTIVE]: "departmentId",
  [STAGE_ERRORS.REJECT_TARGET_NOT_EARLIER]: "onRejectStageCode",
  [STAGE_ERRORS.REJECT_TARGET_INVALID]: "onRejectAction",
  [STAGE_ERRORS.INITIATOR_INVALID]: "onRejectAction",
  [STAGE_ERRORS.CONSECUTIVE_DUPLICATE]: "roleId",
  [STAGE_ERRORS.DUPLICATE_CODE]: "stageCode",
  [STAGE_ERRORS.INVALID_CODE]: "stageCode",
  [STAGE_ERRORS.INVALID_STATUS]: "resultStatus",
  [STAGE_ERRORS.INVALID_POLICY]: "form",
  [STAGE_ERRORS.INVALID_REJECT_ACTION]: "form",
};

export interface ApiError {
  status?: number;
  code?: string;
  message?: string;
}

export const toApiError = (error: unknown): ApiError => {
  const res = (error as { response?: { status?: number; data?: ApiError } })?.response;
  return {
    status: res?.status,
    code: res?.data?.code,
    message: res?.data?.message,
  };
};

export const errorCodeOf = (error: unknown): string | undefined => toApiError(error).code;

/**
 * Where to render a save failure.
 *
 * The server names the offending stage in the (localized) message but not in a
 * structured field, so a stage-level code is anchored to the row the client
 * already knows is at fault where it can work that out, and otherwise falls
 * back to the form. `field` is what the row highlights; `message` is the
 * server's own text, which is already in the admin's language.
 */
export const stageErrorField = (code?: string): StageErrorField | undefined =>
  code ? STAGE_ERROR_FIELD[code] : undefined;

/** Fallbacks for the codes whose server message may be too terse to act on. */
const WORKFLOW_MESSAGES: Record<string, string> = {
  [WORKFLOW_ERRORS.EMPTY]: "A workflow needs at least one stage.",
  [WORKFLOW_ERRORS.TOO_MANY_STAGES]: "A chain cannot have more than 20 stages.",
  [WORKFLOW_ERRORS.ACTIVE_CANNOT_DELETE]: "Deactivate this workflow before deleting it.",
  [WORKFLOW_ERRORS.FLOW_TYPE_INACTIVE]:
    "That flow type has been retired — a new chain cannot be attached to it.",
  [WORKFLOW_ERRORS.NOT_FOUND]:
    "This workflow no longer exists. Someone may have deleted it — reload the list.",
  [WORKFLOW_ERRORS.VALIDATION_FAILED]: "Some fields are missing or too long.",
  [STAGE_ERRORS.ROLE_DEPARTMENT_MISMATCH]:
    "That role is not in the stage's department. Assign it to the department first.",
  [STAGE_ERRORS.REJECT_TARGET_NOT_EARLIER]:
    "A rejection can only go back to a stage above this one.",
  [STAGE_ERRORS.CONSECUTIVE_DUPLICATE]:
    "Two stages in a row cannot use the same department and role.",
};

export const workflowMessage = (error: unknown, fallback: string): string => {
  const { code, message } = toApiError(error);
  return message || WORKFLOW_MESSAGES[code || ""] || fallback;
};

export const isAccessDenied = (error: unknown): boolean =>
  toApiError(error).status === 403 || errorCodeOf(error) === WORKFLOW_ERRORS.ACCESS_DENIED;

/** `by-flow-type/{code}/active` 404s when the flow type has no chain — an empty state. */
export const isNotFound = (error: unknown): boolean => toApiError(error).status === 404;
