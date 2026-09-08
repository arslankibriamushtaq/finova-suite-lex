import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Inbox, ListChecks, RefreshCw, Undo2, XCircle } from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Skeleton } from "../../../components/ui/skeleton";
import { Tabs, TabsContent } from "../../../components/ui/tabs";
import { Textarea } from "../../../components/ui/textarea";
import {
  DetailTabsList,
  DetailTabsTrigger,
  EmptyState,
  PermissionDenied,
} from "../../../components/shared/detailKit";
import { LexNotice, LexPageHeader } from "../../../components/shared/lexKit";
import {
  ApprovalActionHistory,
  ApprovalChainProgress,
  PayloadPreview,
  RequestStatusBadge,
} from "../../../components/shared/approvalRequestKit";
import {
  approvalRequestMessage,
  approveApprovalRequest,
  cancelApprovalRequest,
  getApprovalRequest,
  getApprovalRequests,
  getMyApprovalQueue,
  parsePayload,
  rejectApprovalRequest,
  resubmitApprovalRequest,
  type ApprovalRequest,
  type ApprovalRequestStatus,
} from "../../../redux/apis/apisApprovalRequests";
import { usePermissions, APPROVAL_REQUEST_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { getCurrentUserId } from "../../../utils/tokenClaims";
import type { RootState } from "../../../redux/store";

const STATUSES: ApprovalRequestStatus[] = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

/** What the editable resubmit form sends back for a field, keeping its original type. */
const coerce = (original: unknown, next: string): unknown => {
  if (typeof original === "number") return next === "" ? null : Number(next);
  if (typeof original === "boolean") return next === "true";
  return next;
};

/**
 * Approval requests — the runtime side of dynamic approval workflows.
 *
 * Two lists: the approver's queue, which is exactly what the signed-in user can
 * act on, and every request, for tracing one that has already been decided.
 */
const ApprovalRequests = () => {
  const { hasPermission } = usePermissions();
  const canRead = hasPermission(APPROVAL_REQUEST_PERMISSIONS.LIST);
  const canApprove = hasPermission(APPROVAL_REQUEST_PERMISSIONS.APPROVE);
  const canReject = hasPermission(APPROVAL_REQUEST_PERMISSIONS.REJECT);

  const token = useSelector((state: RootState) => state.block.token);
  const currentUserId = useMemo(() => getCurrentUserId(token), [token]);

  const [tab, setTab] = useState("queue");
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);

  const [queue, setQueue] = useState<ApprovalRequest[]>([]);
  const [all, setAll] = useState<ApprovalRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<ApprovalRequestStatus>("PENDING");

  const [open, setOpen] = useState<ApprovalRequest | null>(null);
  const [comment, setComment] = useState("");
  const [resubmitDraft, setResubmitDraft] = useState<Record<string, unknown> | null>(null);

  /** Everything in the queue is actionable by definition — the server built it that way. */
  const actionableIds = useMemo(() => new Set(queue.map((r) => r.id)), [queue]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [queueRes, allRes] = await Promise.all([
        getMyApprovalQueue(),
        getApprovalRequests({ status: statusFilter, page: 0, size: 100 }),
      ]);
      setQueue(Array.isArray(queueRes?.data?.data) ? queueRes.data.data : []);
      setAll(Array.isArray(allRes?.data?.data) ? allRes.data.data : []);
    } catch (error) {
      toast.error(approvalRequestMessage(error, "Could not load the approval requests."));
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (canRead) load();
    else setIsLoading(false);
  }, [canRead, load]);

  const openRequest = async (row: ApprovalRequest) => {
    setComment("");
    setResubmitDraft(null);
    // The list is header-only — `stages`, `actions` and `payload` are null there.
    if (row.stages) {
      setOpen(row);
      return;
    }
    try {
      const res = await getApprovalRequest(row.id);
      setOpen(res?.data?.data || row);
    } catch (error) {
      toast.error(approvalRequestMessage(error, "Could not open that request."));
    }
  };

  /**
   * Every decision answers with the updated request. Re-render from that rather
   * than assuming the chain moved: under an `ALL` policy an approve routinely
   * leaves the request on the same stage, waiting on a colleague.
   */
  const applyResult = (updated: ApprovalRequest | undefined) => {
    if (updated) setOpen(updated);
    load();
  };

  const approve = async () => {
    if (!open) return;
    setIsActing(true);
    try {
      const res = await approveApprovalRequest(open.id, comment.trim() || undefined);
      toast.success("Approved.");
      setComment("");
      applyResult(res?.data?.data);
    } catch (error) {
      toast.error(approvalRequestMessage(error, "Could not approve the request."));
    } finally {
      setIsActing(false);
    }
  };

  const reject = async () => {
    if (!open) return;
    // Required by the server, and the one place a comment is the whole point —
    // a rejection with no reason is a request the maker cannot act on.
    if (!comment.trim()) {
      toast.error("A rejection needs a reason.");
      return;
    }
    setIsActing(true);
    try {
      const res = await rejectApprovalRequest(open.id, comment.trim());
      toast.success("Rejected and sent back.");
      setComment("");
      applyResult(res?.data?.data);
    } catch (error) {
      toast.error(approvalRequestMessage(error, "Could not reject the request."));
    } finally {
      setIsActing(false);
    }
  };

  const resubmit = async () => {
    if (!open || !resubmitDraft) return;
    setIsActing(true);
    try {
      const res = await resubmitApprovalRequest(open.id, resubmitDraft);
      toast.success("Resubmitted.");
      setResubmitDraft(null);
      applyResult(res?.data?.data);
    } catch (error) {
      toast.error(approvalRequestMessage(error, "Could not resubmit the request."));
    } finally {
      setIsActing(false);
    }
  };

  const cancel = async () => {
    if (!open) return;
    setIsActing(true);
    try {
      await cancelApprovalRequest(open.id);
      toast.success("Request withdrawn.");
      setOpen(null);
      load();
    } catch (error) {
      toast.error(approvalRequestMessage(error, "Could not cancel the request."));
    } finally {
      setIsActing(false);
    }
  };

  if (!canRead) {
    return <PermissionDenied message="You do not have access to approval requests." />;
  }

  const payload = open ? parsePayload(open.payload) : null;
  const isPending = open?.status === "PENDING";
  const canActOnOpen = !!open && isPending && actionableIds.has(open.id);
  /**
   * `undefined` means the token carried no readable id — not "somebody else".
   * Showing the maker actions and letting the server answer NOT_THE_MAKER is
   * better than hiding them from the one person who may use them.
   */
  const isMaker = !!open && (!currentUserId || open.requestedBy === currentUserId);
  // Resubmit is accepted only once the request has come back to stage 1.
  const canResubmit = !!open && isPending && isMaker && open.currentStageSeq === 1;
  const canCancel = !!open && isPending && isMaker;

  const rows = tab === "queue" ? queue : all;

  return (
    <div className="p-3">
      <LexPageHeader
        icon={Inbox}
        title="Approval Requests"
        subtitle="Changes waiting on a maker-checker chain before they are applied."
      >
        <Button variant="outline" onClick={load} disabled={isLoading}>
          <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh
        </Button>
      </LexPageHeader>

      <Tabs value={tab} onValueChange={setTab}>
        <DetailTabsList>
          <DetailTabsTrigger value="queue">
            My queue
            {queue.length > 0 && (
              <Badge className="ms-2" variant="default">
                {queue.length}
              </Badge>
            )}
          </DetailTabsTrigger>
          <DetailTabsTrigger value="all">All requests</DetailTabsTrigger>
        </DetailTabsList>

        <TabsContent value="queue">
          <LexNotice tone="slate">
            Everything here is sitting on a stage you are an approver for. Your own requests never
            appear — the chain is four-eyes by design.
          </LexNotice>
        </TabsContent>

        <TabsContent value="all">
          <div className="mb-3 flex items-center gap-2">
            <Label className="text-xs">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ApprovalRequestStatus)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          text={tab === "queue" ? "Nothing is waiting on you." : "No requests match that status."}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => openRequest(row)}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] p-3 text-start hover:bg-accent/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{row.action}</Badge>
                  <span className="truncate font-semibold text-foreground">{row.entityType}</span>
                  <RequestStatusBadge status={row.status} />
                </div>
                <p className="mb-0 mt-1 text-xs text-muted-foreground">
                  {row.workflowName} · stage {row.currentStageSeq} {row.currentStageCode} ·{" "}
                  {row.businessStatus}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {row.requestedAt ? new Date(row.requestedAt).toLocaleString() : ""}
              </span>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {open?.action} · {open?.entityType}
            </DialogTitle>
          </DialogHeader>

          {open && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <RequestStatusBadge status={open.status} />
                <Badge variant="outline">{open.businessStatus}</Badge>
                <span className="text-xs text-muted-foreground">{open.workflowName}</span>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold">The change</h4>
                <PayloadPreview payload={payload} />
              </div>

              {open.stages && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Chain</h4>
                  <ApprovalChainProgress stages={open.stages} />
                </div>
              )}

              <div>
                <h4 className="mb-2 text-sm font-semibold">History</h4>
                <ApprovalActionHistory actions={open.actions || []} />
              </div>

              {canActOnOpen && (
                <div>
                  <Label className="mb-1 block text-xs">
                    Comment {canReject ? "(required to reject)" : ""}
                  </Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                    placeholder="Why you are approving or sending it back"
                  />
                </div>
              )}

              {/* Resubmit edits the parked payload in place: the endpoint takes
                  the corrected body in the original shape, and the payload is
                  the only description of that shape the client has. */}
              {canResubmit && resubmitDraft && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Correct and resubmit</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(resubmitDraft).map(([key, value]) => (
                      <div key={key}>
                        <Label className="mb-1 block text-xs">{key}</Label>
                        <Input
                          value={value === null || value === undefined ? "" : String(value)}
                          onChange={(e) =>
                            setResubmitDraft((draft) => ({
                              ...(draft || {}),
                              [key]: coerce(value, e.target.value),
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isPending && !canActOnOpen && !isMaker && (
                <LexNotice tone="slate">
                  This request is on a stage you are not an approver for, so there is nothing to do
                  here.
                </LexNotice>
              )}
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setOpen(null)} disabled={isActing}>
              Close
            </Button>
            {canCancel && (
              <Button variant="outline" onClick={cancel} disabled={isActing}>
                <XCircle className="h-4 w-4" /> Withdraw
              </Button>
            )}
            {canResubmit &&
              (resubmitDraft ? (
                <Button onClick={resubmit} disabled={isActing}>
                  <Undo2 className="h-4 w-4" /> Resubmit
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setResubmitDraft(payload || {})}>
                  <Undo2 className="h-4 w-4" /> Correct and resubmit
                </Button>
              ))}
            {canActOnOpen && canReject && (
              <Button variant="destructive" onClick={reject} disabled={isActing}>
                Reject
              </Button>
            )}
            {canActOnOpen && canApprove && (
              <Button onClick={approve} disabled={isActing}>
                Approve
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalRequests;
