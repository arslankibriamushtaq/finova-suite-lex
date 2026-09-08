import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FolderTree, History, ShieldCheck, Timer } from "lucide-react";

import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";
import { Field } from "./detailKit";
import { formatDateTime } from "./detailKitUtils";
import { LexNotice } from "./lexKit";
import ComplaintLinksPanel from "./ComplaintLinksPanel";
import {
  ComplaintOutcomeBadge,
  ComplaintStatusBadge,
  ComplaintTimeline,
  CsatBadge,
  EscalationBadge,
  ReferenceNo,
  SlaBadge,
} from "./supportKit";
import {
  canRecordOutcome,
  formatDuration,
  isEscalated,
  outcomeNeedsNote,
  timeToFirstResponse,
  timeToResolution,
} from "./supportKitUtils";
import {
  COMPLAINT_OUTCOMES,
  COMPLAINT_OUTCOME_HINTS,
  classifyComplaint,
  isNotResolved,
  taxonomyMessage,
  toSupportError,
  type Complaint,
  type ComplaintEvent,
  type ComplaintOutcome,
  type SupportCategory,
  type SupportSubCategory,
} from "../../redux/apis/apisSupport";

export interface ComplaintDetailDialogProps {
  complaint: Complaint | null;
  onClose: () => void;
  fetchEvents: (id: string) => Promise<ComplaintEvent[]>;
  recordOutcome: (
    id: string,
    body: { outcome: ComplaintOutcome; note?: string }
  ) => Promise<void>;
  /** Refresh the queue after a classification — the row's outcome changed. */
  onRecorded: () => void;
  showTenant?: boolean;
  tenantName?: (tenantId: string) => string | undefined;
  /**
   * The tenant's own taxonomy. Absent on the platform queue: those categories
   * belong to the tenant, and the platform has no business filing a complaint
   * under somebody else's.
   */
  categories?: SupportCategory[];
  subCategories?: SupportSubCategory[];
  /**
   * Subject links exist under `/tenant` only, so the platform register does
   * not offer them — and should not: what a tenant's complaint is about is
   * that tenant's data.
   */
  showLinks?: boolean;
}

/**
 * One complaint: what the register knows, the trail behind it, and the one
 * write this screen is allowed to make.
 *
 * Everything conversational — replying, assigning, resolving — stays in the
 * engine's console. The outcome is the exception because the engine has no
 * concept of it: closing a conversation says the talking stopped, not whether
 * the complainant was right, and "how many complaints were upheld" is a
 * question a regulator asks.
 */
export default function ComplaintDetailDialog({
  complaint,
  onClose,
  fetchEvents,
  recordOutcome,
  onRecorded,
  showTenant,
  tenantName,
  categories,
  subCategories,
  showLinks,
}: ComplaintDetailDialogProps) {
  const [events, setEvents] = useState<ComplaintEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [outcome, setOutcome] = useState<ComplaintOutcome | "">("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [classifying, setClassifying] = useState(false);

  const id = complaint?.id;

  const loadEvents = useCallback(async () => {
    if (!id) return;
    setEventsLoading(true);
    try {
      setEvents(await fetchEvents(id));
    } catch (error) {
      setEvents([]);
      toast.error(toSupportError(error, "Could not load this complaint's history.").message);
    } finally {
      setEventsLoading(false);
    }
  }, [fetchEvents, id]);

  // Re-keyed on the id so opening a second complaint never shows the first
  // one's trail while its own is still in flight.
  useEffect(() => {
    setEvents([]);
    setOutcome("");
    setNote("");
    setCategoryId(complaint?.categoryId || "");
    setSubCategoryId(complaint?.subCategoryId || "");
    if (id) loadEvents();
    // `complaint` beyond its id is only read to seed the fields, and re-seeding
    // on every parent render would fight the user's own typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loadEvents]);

  const requiresNote = outcomeNeedsNote(outcome);
  const canSubmit = !!outcome && (!requiresNote || note.trim().length > 0);

  const submit = async () => {
    if (!complaint || !outcome || !canSubmit) return;
    setSaving(true);
    try {
      await recordOutcome(complaint.id, {
        outcome,
        note: note.trim() || undefined,
      });
      toast.success("Outcome recorded.");
      // The trail gains an OUTCOME_RECORDED entry and the row gains a value:
      // both are refetched rather than patched locally, so what is shown is
      // what the service stored, with the actor it stamped.
      await loadEvents();
      onRecorded();
    } catch (error) {
      if (isNotResolved(error)) {
        toast.error("This complaint has to be resolved before its outcome can be recorded.");
      } else {
        toast.error(toSupportError(error, "Could not record the outcome.").message);
      }
    } finally {
      setSaving(false);
    }
  };

  const saveClassification = async () => {
    if (!complaint || !categoryId) return;
    setClassifying(true);
    try {
      await classifyComplaint(complaint.id, {
        categoryId,
        subCategoryId: subCategoryId || undefined,
      });
      toast.success("Classification saved.");
      onRecorded();
    } catch (error) {
      toast.error(taxonomyMessage(error, "Could not save the classification."));
    } finally {
      setClassifying(false);
    }
  };

  return (
    <Dialog open={!!complaint} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="pe-8">
            Complaint <ReferenceNo value={complaint?.referenceNo} />
          </DialogTitle>
        </DialogHeader>

        {complaint && (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pe-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Status" value={<ComplaintStatusBadge status={complaint.status} />} />
              <Field
                label="Outcome"
                value={<ComplaintOutcomeBadge outcome={complaint.resolutionOutcome} />}
              />
              {/* `subject` is usually null — the engine has no subject line for
                  an API-channel conversation. The row is identified by its
                  reference number rather than a fabricated title. */}
              <Field label="Subject" value={complaint.subject || "—"} />
              {showTenant && (
                <Field
                  label="Tenant"
                  value={tenantName?.(complaint.tenantId) || complaint.tenantId}
                  mono={!tenantName?.(complaint.tenantId)}
                />
              )}
              {/* Mirrored from the engine. Shown, never edited — reassignment
                  is the engine's to do, and a control here would be a second
                  writer of the same state. */}
              <Field
                label="Assigned to"
                value={
                  complaint.assigneeName
                    ? `${complaint.assigneeName}${
                        complaint.assignedAt ? ` · ${formatDateTime(complaint.assignedAt)}` : ""
                      }`
                    : "Unassigned"
                }
              />
              <Field label="Complainant" value={complaint.complainantType} />
              {/* The complainant's Keycloak subject, not a customer-service id —
                  shown as the identifier it is rather than passed off as one. */}
              <Field label="Complainant subject" value={complaint.complainantId} mono />
              <Field label="Reopened" value={`${complaint.reopenCount ?? 0} time(s)`} />
              <Field label="Opened" value={formatDateTime(complaint.openedAt)} />
              <Field label="Last activity" value={formatDateTime(complaint.lastEventAt)} />
              <Field
                label="First response"
                value={
                  complaint.firstResponseAt
                    ? `${formatDateTime(complaint.firstResponseAt)} (${formatDuration(
                        timeToFirstResponse(complaint)
                      )})`
                    : "Not yet answered"
                }
              />
              <Field
                label="Resolved"
                value={
                  complaint.resolvedAt
                    ? `${formatDateTime(complaint.resolvedAt)} (${formatDuration(
                        timeToResolution(complaint)
                      )})`
                    : "—"
                }
              />
              {complaint.resolutionNote && (
                <Field label="Outcome note" value={complaint.resolutionNote} />
              )}
              {/* The engine runs the survey after a resolution; the answer is
                  kept on the complaint because "how satisfied were
                  complainants" is a question about the record and outlives the
                  conversation. The first answer stands — there is nothing here
                  that could revise it. */}
              <Field label="Satisfaction" value={<CsatBadge complaint={complaint} />} />
              {complaint.csatFeedback && (
                <Field label="Their words" value={complaint.csatFeedback} />
              )}
            </div>

            {/* The clocks. Every target, breach and escalation on this platform
                is the platform's own — the engine's Community build has no SLA
                at all. Read from the payload, never recomputed here. */}
            <div className="rounded-lg border border-[var(--surface-border)] p-3">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Timer className="h-4 w-4" />
                SLA
                <SlaBadge complaint={complaint} />
                <EscalationBadge complaint={complaint} />
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Acknowledgement due"
                  value={
                    complaint.acknowledgeDueAt ? formatDateTime(complaint.acknowledgeDueAt) : "—"
                  }
                />
                <Field
                  label="Resolution due"
                  value={complaint.resolveDueAt ? formatDateTime(complaint.resolveDueAt) : "—"}
                />
                {complaint.acknowledgeBreachedAt && (
                  <Field
                    label="Acknowledgement breached"
                    value={formatDateTime(complaint.acknowledgeBreachedAt)}
                  />
                )}
                {complaint.resolveBreachedAt && (
                  <Field
                    label="Resolution breached"
                    value={formatDateTime(complaint.resolveBreachedAt)}
                  />
                )}
                {isEscalated(complaint) && (
                  <Field
                    label="Escalated to"
                    value={`Level ${complaint.escalationLevel}${
                      complaint.escalationTeam ? ` · ${complaint.escalationTeam}` : ""
                    }`}
                  />
                )}
              </div>
              {!complaint.acknowledgeDueAt && !complaint.resolveDueAt ? (
                <LexNotice tone="slate" className="mb-0 mt-2">
                  No target: only a sub-category carries a priority. Filing this complaint under
                  one starts its clocks, counted from when it was opened.
                </LexNotice>
              ) : (
                <LexNotice tone="slate" className="mb-0 mt-2">
                  {complaint.slaPaused
                    ? "The clock is stopped while this complaint waits on the customer. Both targets move forward by exactly what the pause costs."
                    : "The clock is wall-clock — it runs through evenings and weekends. There is no working calendar behind these targets."}
                </LexNotice>
              )}
            </div>

            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <History className="h-4 w-4" />
                History
              </h4>
              {eventsLoading ? (
                <div className="grid gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <p className="text-xs text-muted-foreground">No events recorded yet.</p>
              ) : (
                <ComplaintTimeline events={events} formatWhen={formatDateTime} />
              )}
            </div>

            {/* Filing it under a category. Allowed at any point, resolution
                included — the customer's own pick in the app is the first
                classification, and an agent correcting it later is the normal
                case rather than an exception. */}
            {categories && categories.length > 0 && (
              <div className="rounded-lg border border-[var(--surface-border)] p-3">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FolderTree className="h-4 w-4" />
                  Classification
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex min-w-0 flex-col gap-1">
                    <Label htmlFor="complaint-category" className="text-xs text-muted-foreground">
                      Category
                    </Label>
                    <Select
                      value={categoryId}
                      onValueChange={(value) => {
                        setCategoryId(value);
                        // The API refuses a sub-category from another category
                        // (`SUPPORT.TAXONOMY.MISMATCH`), so the stale one is
                        // dropped here rather than sent to be rejected.
                        setSubCategoryId("");
                      }}
                    >
                      <SelectTrigger
                        id="complaint-category"
                        className="w-full data-[size=default]:h-10"
                      >
                        <SelectValue placeholder="Not classified" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1">
                    <Label
                      htmlFor="complaint-subcategory"
                      className="text-xs text-muted-foreground"
                    >
                      Sub-category (optional while triaging)
                    </Label>
                    <Select
                      value={subCategoryId}
                      onValueChange={setSubCategoryId}
                      disabled={!categoryId}
                    >
                      <SelectTrigger
                        id="complaint-subcategory"
                        className="w-full data-[size=default]:h-10"
                      >
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        {(subCategories || [])
                          .filter((sub) => sub.categoryId === categoryId)
                          .map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.nameEn}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={saveClassification}
                  disabled={!categoryId || classifying}
                >
                  {classifying ? "Saving…" : "Save classification"}
                </Button>
              </div>
            )}

            {showLinks && <ComplaintLinksPanel complaintId={complaint.id} />}

            <div className="rounded-lg border border-[var(--surface-border)] p-3">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4" />
                Record the outcome
              </h4>

              {/* Gated the same way the API gates it, so the control is never
                  offered in a state that can only answer 422. A queue is
                  cleared by answering the complaint, not by relabelling it. */}
              {!canRecordOutcome(complaint) ? (
                <LexNotice tone="slate" className="mb-0">
                  The outcome can be recorded once this complaint is resolved in the support
                  console.
                </LexNotice>
              ) : complaint.resolutionOutcome ? (
                <LexNotice tone="slate" className="mb-0">
                  Already classified as <strong>{complaint.resolutionOutcome}</strong>
                  {complaint.resolutionNote ? ` — ${complaint.resolutionNote}` : ""}.
                </LexNotice>
              ) : (
                <div className="space-y-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <Label htmlFor="complaint-outcome" className="text-xs text-muted-foreground">
                      Outcome
                    </Label>
                    <Select
                      value={outcome}
                      onValueChange={(value) => setOutcome(value as ComplaintOutcome)}
                    >
                      <SelectTrigger
                        id="complaint-outcome"
                        className="w-full data-[size=default]:h-10 sm:w-72"
                      >
                        <SelectValue placeholder="Choose an outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPLAINT_OUTCOMES.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {outcome && (
                      <p className="text-xs text-muted-foreground">
                        {COMPLAINT_OUTCOME_HINTS[outcome]}
                      </p>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col gap-1">
                    <Label htmlFor="complaint-note" className="text-xs text-muted-foreground">
                      Note {requiresNote ? "(required)" : "(optional)"}
                    </Label>
                    <Textarea
                      id="complaint-note"
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={
                        requiresNote
                          ? "Why was this not upheld?"
                          : "Anything worth recording about how it was put right."
                      }
                    />
                    {/* "Not upheld" with no reason is the first thing a
                        regulator asks about, so the note is required for
                        everything except an upheld complaint. */}
                    {requiresNote && note.trim().length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Anything other than RESOLVED needs a stated reason.
                      </p>
                    )}
                  </div>

                  <Button size="sm" onClick={submit} disabled={!canSubmit || saving}>
                    {saving ? "Recording…" : "Record outcome"}
                  </Button>
                </div>
              )}
            </div>

            <LexNotice tone="slate" className="mb-0">
              Apart from the outcome, this register is read-only. Replying, assigning and
              resolving happen in the support console.
            </LexNotice>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
