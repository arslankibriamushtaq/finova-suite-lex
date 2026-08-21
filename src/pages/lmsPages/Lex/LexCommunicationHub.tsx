import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowUpCircle,
  Bot,
  CheckCircle2,
  HelpCircle,
  MessagesSquare,
  RefreshCw,
  Send,
} from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { EmptyState, Field, PermissionDenied } from "../../../components/shared/detailKit";
import { TONES, formatDateTime, formatMoney } from "../../../components/shared/detailKitUtils";
import {
  LexEmployerBadge,
  LexNotice,
  LexPageHeader,
  LexSearch,
  LexStatusBadge,
} from "../../../components/shared/lexKit";
import { cn } from "../../../lib/utils";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { lexErrorMessage, logForbidden } from "../../../redux/apis/apisLexCore";
import { formatMinutes } from "../../../redux/apis/apisLexConfig";
import {
  caseChip,
  caseSla,
  escalateCase,
  getCase,
  getCases,
  postCaseMessage,
  type LexCase,
  type LexCaseSummary,
} from "../../../redux/apis/apisLexCases";

const SEVERITY_TONE: Record<string, string> = {
  CRITICAL: TONES.red,
  HIGH: TONES.orange,
  MEDIUM: TONES.amber,
  LOW: TONES.slate,
};

/**
 * One room per referral, and every LEX account is a member.
 *
 * **Visibility is deliberately unrestricted.** `assigneeUserId` tracks who must
 * act; it does not gate who can see. A room nobody outside the assignee can read
 * is a room where the supervisor learns about the problem from the breach
 * report.
 *
 * Two things this screen does not have, both on purpose:
 *
 * - **No co-assign.** One assignee per case, by design — see §12.4. There is no
 *   endpoint, and a button that quietly did nothing would be worse than none.
 * - **No Approve/Decline shortcut.** The mockup puts them in the room header,
 *   but the permitted verbs come from `GET /cases/{id}/actions` and differ per
 *   case. Deciding belongs on the workspace, where the vocabulary is loaded and
 *   the evidence and override fields exist; this screen links there instead.
 */
const LexCommunicationHub = () => {
  const { t } = useTranslation("lex");
  const navigate = useNavigate();
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.CASE_READ);
  const canMessage = can(LEX_PERMISSIONS.CASE_MESSAGE_CREATE);
  const canEscalate = can(LEX_PERMISSIONS.CASE_ESCALATE);

  const [rooms, setRooms] = useState<LexCaseSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [record, setRecord] = useState<LexCase | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRoomLoading, setIsRoomLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [routingType, setRoutingType] = useState("ALL");
  const [draft, setDraft] = useState("");

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "LEX.CASE.READ_ONLY": t("case.err.readOnly"),
      "LEX.CASE.AT_HIGHEST_LEVEL": t("case.err.atHighestLevel"),
    }),
    [t]
  );

  const loadRooms = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      const result = await getCases({
        page: 1,
        size: 50,
        search: search || undefined,
        filter: routingType === "ALL" ? undefined : `routingType:eq:${routingType}`,
        sort: "lastActivityAt,desc",
      });
      setRooms(result.content);
      // Keep the open room if it survived the filter, otherwise fall to the top.
      setActiveId((current) =>
        current && result.content.some((room) => room.id === current)
          ? current
          : result.content[0]?.id || null
      );
    } catch (error) {
      logForbidden(error, "GET /cases");
      toast.error(lexErrorMessage(error, t("case.toast.loadFailed"), errorsByCode));
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoom = async (caseId: string) => {
    setIsRoomLoading(true);
    try {
      setRecord(await getCase(caseId));
    } catch (error) {
      logForbidden(error, "GET /cases/{id}");
      toast.error(lexErrorMessage(error, t("case.toast.loadFailed"), errorsByCode));
      setRecord(null);
    } finally {
      setIsRoomLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, routingType, canRead]);

  useEffect(() => {
    if (activeId) loadRoom(activeId);
    else setRecord(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const onPost = async () => {
    if (!draft.trim() || !activeId) return;
    setBusy(true);
    try {
      await postCaseMessage(activeId, draft.trim());
      setDraft("");
      toast.success(t("case.toast.messagePosted"));
      loadRoom(activeId);
    } catch (error) {
      // `lex.cases.messages` is its own Casbin object — a 403 here means this
      // role may not write on the case, not that the case is unreadable.
      logForbidden(error, "POST /cases/{id}/messages");
      toast.error(lexErrorMessage(error, t("case.toast.messageFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const onEscalate = async () => {
    if (!activeId) return;
    setBusy(true);
    try {
      setRecord(await escalateCase(activeId));
      toast.success(t("case.toast.escalated"));
      loadRooms();
    } catch (error) {
      logForbidden(error, "POST /cases/{id}/escalate");
      toast.error(lexErrorMessage(error, t("case.toast.escalateFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  if (!canRead) return <PermissionDenied />;

  const info = record?.applicationInfo;
  const sla = caseSla(record);
  const messages = record?.messages || [];

  return (
    <div className="service">
      <LexPageHeader icon={MessagesSquare} title={t("hub.title")} subtitle={t("hub.subtitle")} />

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LexSearch
            id="hub-search"
            className="flex-1"
            value={search}
            onChange={setSearch}
            placeholder={t("case.search")}
          />
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Label htmlFor="hub-routing" className="sr-only">
              {t("case.col.routing")}
            </Label>
            <Select value={routingType} onValueChange={setRoutingType}>
              <SelectTrigger id="hub-routing" className="w-48 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("case.filter.allRouting")}</SelectItem>
                <SelectItem value="DELEGATION">DELEGATION</SelectItem>
                <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
                <SelectItem value="APPLICATION_SOURCE">APPLICATION_SOURCE</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={loadRooms} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("common:refresh")}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Room list */}
        <div className="pro-card overflow-hidden lg:col-span-3">
          {!isLoading && rooms.length === 0 ? (
            <EmptyState icon={MessagesSquare} text={t("hub.noRooms")} />
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setActiveId(room.id)}
                  className={cn(
                    "w-full border-b border-border/60 p-3 text-start transition-colors hover:bg-muted/40",
                    activeId === room.id && "bg-muted/60"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-medium text-foreground">
                      {room.applicationNumber || room.applicationId}
                    </span>
                    {/* The queue of codes nobody has configured. It is the most
                        actionable signal in this list. */}
                    {room.hasUnrecognizedCode && (
                      <Badge variant="outline" className={`border gap-1 font-medium ${TONES.amber}`}>
                        <HelpCircle className="h-3 w-3" />
                        {t("case.unrecognized")}
                      </Badge>
                    )}
                  </div>
                  <p className="m-0 mt-1 truncate text-sm text-foreground">
                    {room.applicantName || t("hub.noName")}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className={`border font-medium ${TONES.slate}`}>
                      {room.drivingReasonCode || "—"}
                    </Badge>
                    {!!room.secondaryCodeCount && (
                      <Badge variant="outline" className={`border font-medium ${TONES.slate}`}>
                        +{room.secondaryCodeCount}
                      </Badge>
                    )}
                  </div>
                  <p className="m-0 mt-1 truncate text-xs text-muted-foreground">
                    {[room.routingType, room.assignedLevelCode].filter(Boolean).join(" · ")}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thread */}
        <div className="lg:col-span-6">
          {!record ? (
            <div className="pro-card">
              <EmptyState icon={MessagesSquare} text={t("hub.pickRoom")} />
            </div>
          ) : (
            <div className="pro-card flex h-full flex-col p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="min-w-0">
                  <p className="m-0 font-mono text-xs font-medium">
                    {info?.applicationNumber || record.applicationId}
                  </p>
                  <p className="m-0 truncate text-sm text-muted-foreground">
                    {[info?.applicantName, info?.productName].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {canEscalate && !record.readOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={busy}
                      onClick={onEscalate}
                    >
                      <ArrowUpCircle className="h-3.5 w-3.5" />
                      {t("case.escalate")}
                    </Button>
                  )}
                  {/* Deciding needs the case's own verb list, its evidence type
                      and its override field — all of which live on the
                      workspace. This is a link there, not a second decision UI. */}
                  <Button
                    size="sm"
                    className="wallet-brand-btn gap-1.5"
                    onClick={() => navigate(`/LOS/Lex/Cases/${record.id}`)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("hub.openWorkspace")}
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pe-1" style={{ maxHeight: "52vh" }}>
                {messages.length === 0 ? (
                  <p className="m-0 text-sm text-muted-foreground">{t("case.noMessages")}</p>
                ) : (
                  messages.map((message) => {
                    const isSystem = String(message.kind).startsWith("SYSTEM");
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "mb-2 rounded-lg px-3 py-2.5",
                          // LEX's own narrative — why the case exists and what
                          // only the source channel can fix — reads differently
                          // from a colleague's note, so it looks different.
                          isSystem ? `ring-1 ${TONES.emerald}` : "bg-muted/40"
                        )}
                      >
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          {isSystem && <Bot className="h-3.5 w-3.5" />}
                          <span className="text-sm font-medium">
                            {message.authorName || t("case.systemAuthor")}
                          </span>
                          {message.authorRole && (
                            <span className="text-xs text-muted-foreground">
                              {message.authorRole}
                            </span>
                          )}
                          <span className="ms-auto text-xs text-muted-foreground">
                            {formatDateTime(message.postedAt)}
                          </span>
                        </div>
                        <p className="m-0 whitespace-pre-wrap text-sm text-foreground">
                          {message.body}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {canMessage && !record.readOnly && (
                <div className="mt-3 flex items-end gap-2 border-t border-border/60 pt-3">
                  <Textarea
                    rows={2}
                    className="flex-1"
                    placeholder={t("case.newMessage")}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <Button className="wallet-brand-btn gap-2" onClick={onPost} disabled={busy}>
                    <Send className="h-4 w-4" />
                    {t("case.post")}
                  </Button>
                </div>
              )}
              {record.readOnly && (
                <LexNotice tone="slate" className="mb-0 mt-3">
                  {t("case.readOnlyNote")}
                </LexNotice>
              )}
            </div>
          )}
        </div>

        {/* Context rail */}
        <div className="flex flex-col gap-3 lg:col-span-3">
          {record && (
            <>
              <div className="pro-card p-4">
                <h4 className="m-0 mb-3 text-sm font-semibold tracking-tight text-foreground">
                  {t("case.application")}
                </h4>
                <Field label={t("case.field.applicant")} value={info?.applicantName} />
                <Field label={t("case.field.product")} value={info?.productName} />
                <Field label={t("dash.field.employerName")} value={info?.employerName} />
                {/* UNKNOWN is styled apart from NOT_WHITELISTED: one says the
                    check found no listing, the other says it never ran. */}
                <div className="mb-2">
                  <p className="m-0 text-xs text-muted-foreground">
                    {t("dash.field.employerCategory")}
                  </p>
                  <LexEmployerBadge category={info?.employerCategory} t={t} className="mt-0.5" />
                </div>
                <Field
                  label={t("case.field.requestedAmount")}
                  value={info?.requestedAmount != null ? formatMoney(info.requestedAmount) : undefined}
                />
                {/* Declared income, Nafath status and a SIMAH summary line are
                    on the mockup and in no contract — verified salary and the
                    bureau score are the real figures. */}
                <Field
                  label={t("case.field.verifiedSalary")}
                  value={info?.verifiedSalary != null ? formatMoney(info.verifiedSalary) : undefined}
                />
                <Field label={t("case.field.creditScore")} value={info?.creditScore} />
                <Field
                  label={t("case.field.dbr")}
                  value={info?.dbr != null ? `${info.dbr}%` : undefined}
                />
              </div>

              <div className="pro-card p-4">
                <h4 className="m-0 mb-3 text-sm font-semibold tracking-tight text-foreground">
                  {t("case.codes")}
                </h4>
                {(record.attachedCodes || []).length === 0 ? (
                  <p className="m-0 text-sm text-muted-foreground">{t("case.noCodes")}</p>
                ) : (
                  (record.attachedCodes || []).map((code) => (
                    <div key={code.referenceCode} className="pro-tile mb-2 last:mb-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs">{code.referenceCode}</span>
                        {code.severity && (
                          <Badge
                            variant="outline"
                            className={`border font-medium ${
                              SEVERITY_TONE[code.severity] || TONES.slate
                            }`}
                          >
                            {code.severity}
                          </Badge>
                        )}
                        {code.driving && (
                          <Badge variant="outline" className={`border font-medium ${TONES.emerald}`}>
                            {t("case.driving")}
                          </Badge>
                        )}
                      </div>
                      {/* Null title means unrecognized — render the code, and
                          say it needs configuring. */}
                      <p className="m-0 mt-1 text-xs text-muted-foreground">
                        {code.title || t("case.unrecognizedNote")}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="pro-card p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                    {t("hub.sla")}
                  </h4>
                  <LexStatusBadge
                    status={caseChip({
                      status: record.status,
                      decisionAction: record.decision?.action,
                    })}
                    label={t(
                      `case.chip.${caseChip({
                        status: record.status,
                        decisionAction: record.decision?.action,
                      })}`
                    )}
                  />
                </div>
                {/* Null means no published policy covers this product and
                    sector. Not tracked is a configuration gap, never a zero
                    clock that would read as "on time". */}
                {sla ? (
                  <>
                    <Field label={t("case.sla.stage")} value={sla.stageCode} />
                    <Field label={t("case.sla.target")} value={formatMinutes(sla.targetMinutes)} />
                    <Field label={t("case.sla.onClock")} value={formatMinutes(sla.elapsedMinutes)} />
                    <Field
                      label={t("hub.remainingBuffer")}
                      value={formatMinutes(sla.remainingMinutes)}
                    />
                    {sla.stopped && (
                      <LexNotice tone="slate" className="mb-0 mt-2">
                        {t("case.sla.stoppedNote")}
                      </LexNotice>
                    )}
                  </>
                ) : (
                  <LexNotice tone="amber" className="mb-0">
                    {t("case.sla.notTrackedNote")}
                  </LexNotice>
                )}
              </div>

              <div className="pro-card p-4">
                <h4 className="m-0 mb-3 text-sm font-semibold tracking-tight text-foreground">
                  {t("case.audit")}
                </h4>
                {(record.auditTrail || []).length === 0 ? (
                  <p className="m-0 text-sm text-muted-foreground">{t("case.noAudit")}</p>
                ) : (
                  (record.auditTrail || []).map((entry) => (
                    <div key={entry.id} className="pro-tile mb-2 last:mb-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-mono text-[11px]">{entry.action}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDateTime(entry.occurredAt)}
                        </span>
                      </div>
                      {entry.detail && (
                        <p className="m-0 mt-0.5 text-xs text-muted-foreground">{entry.detail}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
          {isRoomLoading && (
            <p className="m-0 text-sm text-muted-foreground">{t("common:loading")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LexCommunicationHub;
