import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowUpCircle,
  Bot,
  CheckCircle2,
  FileText,
  Gauge,
  Gavel,
  HelpCircle,
  History,
  Inbox,
  Lock,
  MessagesSquare,
  Send,
  SendHorizontal,
  Tags,
  UserCheck,
} from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Field, PermissionDenied } from "../../../components/shared/detailKit";
import { TONES, formatDateTime, formatMoney } from "../../../components/shared/detailKitUtils";
import { LexNotice, LexPageHeader, LexStatusBadge, LexTile } from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { lexErrorMessage, logForbidden } from "../../../redux/apis/apisLexCore";
import { formatMinutes } from "../../../redux/apis/apisLexConfig";
import {
  claimCase,
  decideCase,
  escalateCase,
  getCase,
  isOverrideAction,
  markSourceResponded,
  postCaseMessage,
  sendCaseToSource,
  systemMessage,
  type LexCase,
} from "../../../redux/apis/apisLexCases";

const SEVERITY_TONE: Record<string, string> = {
  CRITICAL: TONES.red,
  HIGH: TONES.orange,
  MEDIUM: TONES.amber,
  LOW: TONES.slate,
};

/**
 * One review case: what LEX decided, why, and what the handler may do about it.
 *
 * Four things this screen gets from the payload rather than inventing:
 *
 * - **`readOnly`** disables the form, not `status`. A decided case is closed to
 *   edits and the server enforces it with `422 LEX.CASE.READ_ONLY`.
 * - **The routing explanation is a message**, the one whose `kind` starts with
 *   `SYSTEM`. It is what LEX wrote about why this case exists, so it is the
 *   first thing on the page rather than buried in the thread.
 * - **`sla: null` means not tracked** — no published policy covers this scope.
 *   Never a zero clock, which would read as "on time".
 * - **The action vocabulary comes from the case**, not from a hardcoded list: a
 *   credit verb on an APPLICATION_SOURCE case is refused.
 */
const LexCaseDetail = () => {
  const { t } = useTranslation("lex");
  const navigate = useNavigate();
  const { caseId } = useParams();
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.CASE_READ);
  const canUpdate = can(LEX_PERMISSIONS.CASE_UPDATE);
  const canEscalate = can(LEX_PERMISSIONS.CASE_ESCALATE);
  const canMessage = can(LEX_PERMISSIONS.CASE_MESSAGE_CREATE);
  const canDecide = can(LEX_PERMISSIONS.CASE_DECISION_CREATE);

  const [record, setRecord] = useState<LexCase | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");

  const [decisionOpen, setDecisionOpen] = useState(false);
  const [action, setAction] = useState("");
  const [writtenReason, setWrittenReason] = useState("");
  const [evidenceReference, setEvidenceReference] = useState("");

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "LEX.CASE.READ_ONLY": t("case.err.readOnly"),
      "LEX.CASE.INVALID_ACTION": t("case.err.invalidAction"),
      "LEX.CASE.OVERRIDE_REASON_REQUIRED": t("case.err.overrideReason"),
      "LEX.CASE.NOT_FOUND": t("case.err.notFound"),
    }),
    [t]
  );

  const load = async () => {
    if (!canRead || !caseId) return;
    setIsLoading(true);
    try {
      setRecord(await getCase(caseId));
    } catch (error) {
      logForbidden(error, "GET /cases/{id}");
      toast.error(lexErrorMessage(error, t("case.toast.loadFailed"), errorsByCode));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const run = async (fn: () => Promise<LexCase>, successKey: string, failKey: string) => {
    setBusy(true);
    try {
      setRecord(await fn());
      toast.success(t(successKey));
    } catch (error) {
      logForbidden(error, failKey);
      toast.error(lexErrorMessage(error, t(failKey), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const onPostMessage = async () => {
    if (!draftMessage.trim() || !caseId) return;
    setBusy(true);
    try {
      await postCaseMessage(caseId, draftMessage.trim());
      setDraftMessage("");
      toast.success(t("case.toast.messagePosted"));
      load();
    } catch (error) {
      // `lex.cases.messages` is its own Casbin object — a 403 here does not mean
      // the case is unreadable, only that this role may not write on it.
      logForbidden(error, "POST /cases/{id}/messages");
      toast.error(lexErrorMessage(error, t("case.toast.messageFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const onDecide = async () => {
    if (!caseId) return;
    if (!action.trim()) return toast.error(t("case.valid.action"));
    // The server refuses an overrule with no reason; asking here saves the trip.
    if (isOverrideAction(action) && !writtenReason.trim()) {
      return toast.error(t("case.err.overrideReason"));
    }

    setBusy(true);
    try {
      setRecord(
        await decideCase(caseId, {
          action: action.trim(),
          writtenReason: writtenReason.trim() || undefined,
          evidenceReference: evidenceReference.trim() || null,
        })
      );
      toast.success(t("case.toast.decided"));
      setDecisionOpen(false);
    } catch (error) {
      logForbidden(error, "POST /cases/{id}/decision");
      toast.error(lexErrorMessage(error, t("case.toast.decideFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  if (!canRead) return <PermissionDenied />;

  const readOnly = !!record?.readOnly;
  // canUpdate alone guarantees a button, since send-to-source and
  // source-responded are complementary halves of one condition.
  const hasActions = !readOnly && (canUpdate || canEscalate || canDecide);
  const system = systemMessage(record ?? undefined);
  const info = record?.applicationInfo;
  const sla = record?.sla;
  const humanMessages = (record?.messages || []).filter((m) => !String(m.kind).startsWith("SYSTEM"));
  const unrecognized = (record?.attachedCodes || []).some((c) => c.recognized === false);

  return (
    <div className="service">
      <LexPageHeader
        icon={Inbox}
        title={info?.applicationNumber || record?.applicationId || t("case.title")}
        subtitle={info?.applicantName || undefined}
      >
        <Button variant="outline" className="gap-2" onClick={() => navigate("/LOS/Lex/Cases")}>
          <ArrowLeft className="h-4 w-4" />
          {t("case.backToList")}
        </Button>
      </LexPageHeader>

      {/* Every action on one bar, inside a card so the buttons pick up the
          same sizing as the rest of the app's controls. Skipped entirely
          when nothing is actionable, rather than leaving an empty strip. */}
      {hasActions && (
        <div className="pro-card p-3 mb-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!readOnly && canUpdate && !record?.assigneeUserId && (
              <Button
                variant="outline"
                className="gap-2"
                disabled={busy}
                onClick={() => run(() => claimCase(String(caseId)), "case.toast.claimed", "case.toast.claimFailed")}
              >
                <UserCheck className="h-4 w-4" />
                {t("case.claim")}
              </Button>
            )}
            {!readOnly && canEscalate && (
              <Button
                variant="outline"
                className="gap-2"
                disabled={busy}
                onClick={() =>
                  run(() => escalateCase(String(caseId)), "case.toast.escalated", "case.toast.escalateFailed")
                }
              >
                <ArrowUpCircle className="h-4 w-4" />
                {t("case.escalate")}
              </Button>
            )}
            {!readOnly && canUpdate && record?.status !== "WITH_SOURCE" && (
              <Button
                variant="outline"
                className="gap-2"
                disabled={busy}
                onClick={() =>
                  run(
                    () => sendCaseToSource(String(caseId)),
                    "case.toast.sentToSource",
                    "case.toast.sendFailed"
                  )
                }
              >
                <SendHorizontal className="h-4 w-4" />
                {t("case.sendToSource")}
              </Button>
            )}
            {!readOnly && canUpdate && record?.status === "WITH_SOURCE" && (
              <Button
                variant="outline"
                className="gap-2"
                disabled={busy}
                onClick={() =>
                  run(
                    () => markSourceResponded(String(caseId)),
                    "case.toast.sourceResponded",
                    "case.toast.sourceRespondedFailed"
                  )
                }
              >
                <CheckCircle2 className="h-4 w-4" />
                {t("case.sourceResponded")}
              </Button>
            )}
            {!readOnly && canDecide && (
              <Button className="wallet-brand-btn gap-2" onClick={() => setDecisionOpen(true)}>
                <CheckCircle2 className="h-4 w-4" />
                {t("case.decide")}
              </Button>
            )}
          </div>
        </div>
      )}

      {readOnly && (
        <LexNotice tone="slate" icon={Lock}>
          {t("case.readOnlyNote")}
        </LexNotice>
      )}

      {record?.beyondDelegation && (
        <LexNotice tone="amber">{t("case.beyondDelegationNote")}</LexNotice>
      )}

      {unrecognized && (
        <LexNotice tone="amber" icon={HelpCircle}>
          {t("case.unrecognizedNote")}
        </LexNotice>
      )}

      {/* What LEX wrote about why this case exists. First, because it is the
          thing the handler needs before anything else on the page. */}
      {system && (
        <div className="pro-card mb-3 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="pro-head-badge">
              <Bot className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-foreground">{t("case.systemAuthor")}</span>
            <Badge variant="outline" className={`border font-medium ${TONES.sky}`}>
              {system.kind}
            </Badge>
            <span className="text-xs text-muted-foreground">{formatDateTime(system.postedAt)}</span>
          </div>
          <p className="m-0 whitespace-pre-wrap text-sm text-foreground">{system.body}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Application context */}
        <div className="pro-card p-4 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="pro-head-badge">
              <FileText className="h-4 w-4" />
            </span>
            <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
              {t("case.application")}
            </h4>
          </div>
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            <Field label={t("case.field.applicant")} value={info?.applicantName} />
            <Field label={t("case.field.product")} value={info?.productName} />
            <Field label={t("case.field.channel")} value={info?.sourceChannel} />
            <Field
              label={t("case.field.requestedAmount")}
              value={info?.requestedAmount != null ? formatMoney(info.requestedAmount) : undefined}
            />
            <Field label={t("case.field.tenure")} value={info?.requestedTenureMonths} />
            <Field label={t("case.field.creditScore")} value={info?.creditScore} />
            <Field label={t("case.field.dbr")} value={info?.dbr != null ? `${info.dbr}%` : undefined} />
            <Field
              label={t("case.field.verifiedSalary")}
              value={info?.verifiedSalary != null ? formatMoney(info.verifiedSalary) : undefined}
            />
          </div>
        </div>

        {/* Status, level, SLA */}
        <div className="pro-card p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="pro-head-badge">
              <Gauge className="h-4 w-4" />
            </span>
            <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
              {t("case.state")}
            </h4>
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <LexStatusBadge status={record?.status} />
            <Badge variant="outline" className={`border font-medium ${TONES.sky}`}>
              {record?.routingType}
            </Badge>
            {record?.assignedLevelCode && (
              <Badge variant="outline" className={`border font-medium ${TONES.slate}`}>
                {record.assignedLevelCode}
              </Badge>
            )}
          </div>

          {/* Null means no published policy covers this scope — not a zero clock. */}
          {sla ? (
            <div className="grid grid-cols-2 gap-2">
              <LexTile label={t("case.sla.stage")} value={sla.stageCode || "—"} />
              <LexTile label={t("case.sla.status")} value={sla.status || "—"} />
              <LexTile
                label={t("case.sla.onClock")}
                value={formatMinutes(sla.elapsedMinutes)}
                hint={t("board.onClockHint")}
              />
              <LexTile label={t("case.sla.target")} value={formatMinutes(sla.targetMinutes)} />
              {sla.stopped && (
                <div className="col-span-2">
                  <LexNotice tone="slate" className="mb-0">
                    {t("case.sla.stoppedNote")}
                  </LexNotice>
                </div>
              )}
            </div>
          ) : (
            <LexNotice tone="amber" className="mb-0">
              {t("case.sla.notTrackedNote")}
            </LexNotice>
          )}
        </div>
      </div>

      {/* Attached codes: the driving one, then the context nobody discarded. */}
      <div className="pro-card mt-3 p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="pro-head-badge">
            <Tags className="h-4 w-4" />
          </span>
          <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
            {t("case.codes")}
          </h4>
        </div>
        {(record?.attachedCodes || []).length === 0 ? (
          <p className="m-0 text-sm text-muted-foreground">{t("case.noCodes")}</p>
        ) : (
          (record?.attachedCodes || []).map((code) => (
            <div
              key={code.referenceCode}
              className="pro-tile mb-2 flex flex-wrap items-center gap-2 last:mb-0"
            >
              <span className="font-mono text-xs">{code.referenceCode}</span>
              {/* Null title means the code is unrecognized — show the code, not a blank. */}
              {code.title && <span className="text-sm">{code.title}</span>}
              {code.severity && (
                <Badge
                  variant="outline"
                  className={`border font-medium ${SEVERITY_TONE[code.severity] || TONES.slate}`}
                >
                  {code.severity}
                </Badge>
              )}
              {code.driving && (
                <Badge variant="outline" className={`border font-medium ${TONES.emerald}`}>
                  {t("case.driving")}
                </Badge>
              )}
              {code.recognized === false && (
                <Badge variant="outline" className={`border gap-1 font-medium ${TONES.amber}`}>
                  <HelpCircle className="h-3 w-3" />
                  {t("case.unrecognized")}
                </Badge>
              )}
            </div>
          ))
        )}
      </div>

      {/* The decision, once made. */}
      {record?.decision && (
        <div className="pro-card mt-3 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="pro-head-badge">
              <Gavel className="h-4 w-4" />
            </span>
            <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
              {t("case.decision")}
            </h4>
          </div>
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            <Field label={t("case.field.action")} value={record.decision.action} />
            <Field label={t("case.field.decidedBy")} value={record.decision.actorName} />
            <Field label={t("case.field.level")} value={record.decision.authorityLevelCode} />
            <Field label={t("case.field.decidedAt")} value={formatDateTime(record.decision.decidedAt)} />
            <Field label={t("case.field.reason")} value={record.decision.writtenReason} />
            <Field label={t("case.field.evidence")} value={record.decision.evidenceReference} />
          </div>
          {record.decision.overrode && (
            <LexNotice tone="amber" className="mt-3">
              {t("case.overrodeNote")}
            </LexNotice>
          )}
        </div>
      )}

      {/* Human thread. */}
      <div className="pro-card mt-3 p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="pro-head-badge">
            <MessagesSquare className="h-4 w-4" />
          </span>
          <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
            {t("case.messages")}
          </h4>
        </div>
        {humanMessages.length === 0 ? (
          <p className="m-0 text-sm text-muted-foreground">{t("case.noMessages")}</p>
        ) : (
          humanMessages.map((message) => (
            <div key={message.id} className="pro-tile mb-2 last:mb-0">
              <div className="flex flex-wrap items-center gap-2">
                {/* System messages are authored by LEX, never "Unknown". */}
                <span className="text-sm font-medium">
                  {message.authorName || t("case.systemAuthor")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(message.postedAt)}
                </span>
              </div>
              <p className="m-0 mt-1 whitespace-pre-wrap text-sm text-foreground">{message.body}</p>
            </div>
          ))
        )}

        {canMessage && !readOnly && (
          <div className="mt-3 flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="case-message" className="sr-only">
                {t("case.newMessage")}
              </Label>
              <Textarea
                id="case-message"
                rows={2}
                placeholder={t("case.newMessage")}
                value={draftMessage}
                onChange={(e) => setDraftMessage(e.target.value)}
              />
            </div>
            <Button className="wallet-brand-btn gap-2" onClick={onPostMessage} disabled={busy}>
              <Send className="h-4 w-4" />
              {t("case.post")}
            </Button>
          </div>
        )}
      </div>

      {/* Audit trail. */}
      <div className="pro-card mt-3 p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="pro-head-badge">
            <History className="h-4 w-4" />
          </span>
          <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
            {t("case.audit")}
          </h4>
        </div>
        {(record?.auditTrail || []).length === 0 ? (
          <p className="m-0 text-sm text-muted-foreground">{t("case.noAudit")}</p>
        ) : (
          (record?.auditTrail || []).map((entry) => (
            <div
              key={entry.id}
              className="pro-tile mb-2 flex flex-wrap items-baseline gap-2 last:mb-0"
            >
              <span className="font-mono text-xs">{entry.action}</span>
              <span className="text-xs text-muted-foreground">
                {entry.actorName || t("case.systemAuthor")}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(entry.occurredAt)}
              </span>
              {entry.detail && <span className="text-sm">{entry.detail}</span>}
            </div>
          ))
        )}
      </div>

      <Dialog open={decisionOpen} onOpenChange={setDecisionOpen}>
        <DialogContent className="pro-dialog sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle>{t("case.decideTitle")}</DialogTitle>
            <DialogDescription>{t("case.decideExplain")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="case-action">{t("case.field.action")}</Label>
              {/* Free text on purpose: the vocabulary is defined per process, so
                  a hardcoded picker here would disagree with the configurator. */}
              <Input
                id="case-action"
                className="h-10"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="case-reason">
                {t("case.field.reason")}
                {isOverrideAction(action) ? " *" : ""}
              </Label>
              <Textarea
                id="case-reason"
                rows={3}
                value={writtenReason}
                onChange={(e) => setWrittenReason(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="case-evidence">{t("case.field.evidence")}</Label>
              <Input
                id="case-evidence"
                className="h-10"
                value={evidenceReference}
                onChange={(e) => setEvidenceReference(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setDecisionOpen(false)} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn" onClick={onDecide} disabled={busy}>
              {t("case.decide")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading && <p className="mt-3 text-sm text-muted-foreground">{t("common:loading")}</p>}
    </div>
  );
};

export default LexCaseDetail;
