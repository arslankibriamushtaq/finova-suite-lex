import { Check, CircleDot, Clock, UserX, X } from "lucide-react";

import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import type {
  ApprovalRequestAction,
  ApprovalRequestStage,
  ApprovalRequestStatus,
  StageProgress,
} from "../../redux/apis/apisApprovalRequests";

/**
 * Rendering pieces for a running approval request. Components only — Fast
 * Refresh treats this file as a boundary, so helpers belong in
 * `apisApprovalRequests`.
 */

const STATUS_TONES: Record<ApprovalRequestStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300",
  APPROVED:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300",
  REJECTED: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300",
  CANCELLED:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300",
};

export const RequestStatusBadge = ({ status }: { status: ApprovalRequestStatus }) => (
  <Badge variant="outline" className={cn("border font-medium", STATUS_TONES[status])}>
    {status}
  </Badge>
);

const DECISION_TONES = {
  APPROVE:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300",
  REJECT: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300",
};

const STAGE_ICON: Record<StageProgress, typeof Check> = {
  APPROVED: Check,
  REJECTED: X,
  CURRENT: CircleDot,
  WAITING: Clock,
};

const STAGE_DOT: Record<StageProgress, string> = {
  APPROVED: "bg-emerald-500 text-white",
  REJECTED: "bg-red-600 text-white",
  CURRENT: "bg-primary text-primary-foreground ring-4 ring-primary/20",
  WAITING: "bg-muted text-muted-foreground",
};

/**
 * The chain as a progress bar, drawn entirely from `stages[].status`.
 *
 * Nothing here is computed from `currentStageSeq` — under an `ALL` policy an
 * approve can leave the request on the same stage, so the server's own per-stage
 * status is the only thing that says where it actually is.
 */
export const ApprovalChainProgress = ({ stages }: { stages: ApprovalRequestStage[] }) => (
  <ol className="flex flex-col gap-0">
    {stages.map((stage, index) => {
      const Icon = STAGE_ICON[stage.status];
      const last = index === stages.length - 1;
      return (
        <li key={stage.sequenceNo} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                STAGE_DOT[stage.status]
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            {!last && <span className="w-px flex-1 bg-[var(--surface-border)]" />}
          </div>
          <div className={cn("min-w-0 flex-1", last ? "pb-0" : "pb-4")}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">
                {stage.sequenceNo}. {stage.stageName || stage.stageCode}
              </span>
              {stage.status === "CURRENT" && <Badge>Here now</Badge>}
              {stage.approvalPolicy === "ALL" && stage.status === "CURRENT" && (
                <Badge variant="outline">Everyone must approve</Badge>
              )}
            </div>
            <p className="mb-0 mt-0.5 text-xs text-muted-foreground">
              {stage.departmentCode} · {stage.roleCode} → {stage.resultStatus}
            </p>
            {/* Advisory on the definition screen; here it is the reason a request
                will sit still, so it is worth saying on the stage itself. */}
            {stage.eligibleApproverCount === 0 && (
              <p className="mb-0 mt-1 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <UserX className="h-3 w-3 shrink-0" />
                Nobody holds this role — the request will stop here.
              </p>
            )}
          </div>
        </li>
      );
    })}
  </ol>
);

/**
 * Who decided what, in order.
 *
 * A superseded action — one a later rejection sent the request back past — is
 * greyed and labelled rather than dropped. It happened, and hiding it makes the
 * history lie about how many times a stage was walked.
 */
export const ApprovalActionHistory = ({ actions }: { actions: ApprovalRequestAction[] }) => {
  if (actions.length === 0) {
    return <p className="text-sm text-muted-foreground">No decisions recorded yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {actions.map((action, index) => (
        <li
          key={`${action.stageSequenceNo}-${action.actedAt}-${index}`}
          className={cn(
            "rounded-md border border-[var(--surface-border)] px-3 py-2 text-sm",
            !action.effective && "opacity-50"
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* Explicit tones rather than the `secondary` variant: Bootstrap
                ships a `.bg-secondary` utility that overrides the Tailwind
                token, leaving the badge unreadable. */}
            <Badge
              variant="outline"
              className={cn(
                "border font-medium",
                action.decision === "APPROVE" ? DECISION_TONES.APPROVE : DECISION_TONES.REJECT
              )}
            >
              {action.decision === "APPROVE" ? "Approved" : "Rejected"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              stage {action.stageSequenceNo} · {action.stageCode}
            </span>
            {!action.effective && (
              <Badge variant="outline" className="text-[11px]">
                Superseded by a later rejection
              </Badge>
            )}
            <span className="ms-auto text-xs text-muted-foreground">
              {action.actedAt ? new Date(action.actedAt).toLocaleString() : ""}
            </span>
          </div>
          {action.comment && <p className="mb-0 mt-1 text-sm">{action.comment}</p>}
        </li>
      ))}
    </ul>
  );
};

/** The change a request is holding back, as fields rather than raw JSON. */
export const PayloadPreview = ({ payload }: { payload: Record<string, unknown> | null }) => {
  if (!payload) {
    return <p className="text-sm text-muted-foreground">Nothing to show — this is a deletion.</p>;
  }
  const entries = Object.entries(payload);
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">The request carries no fields.</p>;
  }
  return (
    <dl className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{key}</dt>
          <dd className="mb-0 truncate text-sm text-foreground">
            {value === null || value === undefined || value === "" ? "—" : String(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
};
