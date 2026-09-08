import {
  needsRejectTarget,
  type ApprovalPolicy,
  type ApprovalStage,
  type ApprovalStagePayload,
  type OnRejectAction,
  type StageErrorField,
} from "../../redux/apis/apisApprovalWorkflows";

/**
 * Editor-side helpers for the chain builder. Pure functions only — the editor
 * itself is a Fast Refresh boundary, and these are wanted by the page too.
 */

/** The most stages the server will accept in one chain. */
export const MAX_STAGES = 20;

/** `stageCode` and `resultStatus` share one alphabet, enforced server-side. */
const CODE_RE = /^[A-Z0-9_]{1,50}$/;

/**
 * One row of the builder.
 *
 * `key` exists only for React and the drag list: `stageCode` is the server's
 * identity for a stage but it is editable until the first save, so it cannot be
 * a stable list key. `persisted` marks a code the server already knows, which
 * is what freezes the code field — see the note on the stages endpoint about a
 * code change being a delete + insert rather than a rename.
 */
export interface StageDraft {
  key: string;
  stageCode: string;
  stageName: string;
  stageNameAr: string;
  departmentId: string;
  roleId: string;
  approvalPolicy: ApprovalPolicy;
  resultStatus: string;
  onRejectAction: OnRejectAction;
  onRejectStageCode: string;
  /** Advisory count from the server; absent on rows the admin just added. */
  eligibleApproverCount?: number;
  persisted: boolean;
}

export type StageErrors = Partial<Record<StageErrorField, string>>;
/** Keyed by row index, because a row's identity before the first save is its position. */
export type ChainErrors = Record<number, StageErrors>;

let seq = 0;
const nextKey = () => `stage-${Date.now()}-${seq++}`;

export const newStageDraft = (): StageDraft => ({
  key: nextKey(),
  stageCode: "",
  stageName: "",
  stageNameAr: "",
  departmentId: "",
  roleId: "",
  approvalPolicy: "ALL",
  resultStatus: "",
  // The default the API documents, and the only one that needs a second choice
  // from the admin — which is the point of the feature.
  onRejectAction: "RETURN_TO_STAGE",
  onRejectStageCode: "",
  persisted: false,
});

export const toStageDraft = (stage: ApprovalStage): StageDraft => ({
  key: stage.id || nextKey(),
  stageCode: stage.stageCode || "",
  stageName: stage.stageName || "",
  stageNameAr: stage.stageNameAr || "",
  departmentId: stage.departmentId || "",
  roleId: stage.roleId || "",
  approvalPolicy: stage.approvalPolicy || "ALL",
  resultStatus: stage.resultStatus || "",
  onRejectAction: stage.onRejectAction || "RETURN_TO_STAGE",
  onRejectStageCode: stage.onRejectStageCode || "",
  eligibleApproverCount: stage.eligibleApproverCount,
  persisted: true,
});

/** Keep the field in the server's alphabet as it is typed, so a save cannot fail on it. */
export const normalizeCode = (value: string): string =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "")
    .slice(0, 50);

/**
 * The wire format.
 *
 * The first row is the initiator and is the thing being rejected, so it carries
 * no reject route at all — sending one is `INITIATOR_INVALID`. Everything else
 * the server owns (`sequenceNo`, `isInitiator`, stage `id`) is simply absent.
 */
export const toStagePayload = (drafts: StageDraft[]): ApprovalStagePayload[] =>
  drafts.map((draft, index) => {
    const payload: ApprovalStagePayload = {
      stageCode: normalizeCode(draft.stageCode),
      stageName: draft.stageName.trim(),
      departmentId: draft.departmentId,
      roleId: draft.roleId,
      approvalPolicy: draft.approvalPolicy,
      resultStatus: normalizeCode(draft.resultStatus),
    };
    const nameAr = draft.stageNameAr.trim();
    if (nameAr) payload.stageNameAr = nameAr;
    if (index > 0) {
      payload.onRejectAction = draft.onRejectAction;
      // A target on any other action is `REJECT_TARGET_INVALID`.
      if (needsRejectTarget(draft.onRejectAction)) {
        payload.onRejectStageCode = draft.onRejectStageCode;
      }
    }
    return payload;
  });

/** The stages a rejection at `index` may be sent back to: strictly the ones above it. */
export const earlierStages = (drafts: StageDraft[], index: number): StageDraft[] =>
  drafts.slice(0, index).filter((d) => d.stageCode.trim().length > 0);

/**
 * Reordering or deleting can leave a reject target pointing forwards or at a
 * stage that is gone. Rather than send that and collect a 422, the now-invalid
 * pointers are cleared: the field goes empty and required, which is a question
 * the admin can answer, where a silently forward-pointing target is not.
 */
export const pruneRejectTargets = (drafts: StageDraft[]): StageDraft[] =>
  drafts.map((draft, index) => {
    if (index === 0 || !needsRejectTarget(draft.onRejectAction)) return draft;
    const reachable = earlierStages(drafts, index).some(
      (d) => d.stageCode === draft.onRejectStageCode
    );
    return reachable ? draft : { ...draft, onRejectStageCode: "" };
  });

export const moveStage = (drafts: StageDraft[], from: number, to: number): StageDraft[] => {
  if (from === to || from < 0 || to < 0 || from >= drafts.length || to >= drafts.length) {
    return drafts;
  }
  const next = [...drafts];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return pruneRejectTargets(next);
};

/**
 * The server's chain rules, checked before the call.
 *
 * This is not belt-and-braces — every rule here maps to a 422 the admin would
 * otherwise meet only after filling in a whole chain, and each one is anchored
 * to the field that caused it so the answer is where the question was asked.
 */
export const validateChain = (drafts: StageDraft[]): ChainErrors => {
  const errors: ChainErrors = {};
  const put = (index: number, field: StageErrorField, message: string) => {
    if (!errors[index]) errors[index] = {};
    if (!errors[index][field]) errors[index][field] = message;
  };

  const seen = new Map<string, number>();

  drafts.forEach((draft, index) => {
    const code = draft.stageCode.trim();
    if (!code) {
      put(index, "stageCode", "Required.");
    } else if (!CODE_RE.test(code)) {
      put(index, "stageCode", "Letters, digits and underscores only.");
    } else if (seen.has(code)) {
      put(index, "stageCode", `Already used by stage ${(seen.get(code) as number) + 1}.`);
    } else {
      seen.set(code, index);
    }

    if (!draft.stageName.trim()) put(index, "stageName", "Required.");

    if (!draft.departmentId) put(index, "departmentId", "Pick a department.");
    if (!draft.roleId) put(index, "roleId", "Pick a role.");

    const status = draft.resultStatus.trim();
    if (!status) {
      put(index, "resultStatus", "Required.");
    } else if (!CODE_RE.test(status)) {
      put(index, "resultStatus", "Letters, digits and underscores only.");
    }

    // Back-to-back only. The same department+role further apart in the chain is
    // allowed and is a normal shape — a manager who signs twice on a long chain.
    const previous = drafts[index - 1];
    if (
      previous &&
      draft.departmentId &&
      draft.roleId &&
      previous.departmentId === draft.departmentId &&
      previous.roleId === draft.roleId
    ) {
      put(index, "roleId", "The stage above already uses this department and role.");
    }

    if (index > 0 && needsRejectTarget(draft.onRejectAction)) {
      if (!draft.onRejectStageCode) {
        put(index, "onRejectStageCode", "Pick the stage a rejection goes back to.");
      } else if (
        !earlierStages(drafts, index).some((d) => d.stageCode === draft.onRejectStageCode)
      ) {
        put(index, "onRejectStageCode", "A rejection can only go back to a stage above this one.");
      }
    }
  });

  return errors;
};

export const hasChainErrors = (errors: ChainErrors): boolean =>
  Object.values(errors).some((row) => Object.values(row).some(Boolean));
