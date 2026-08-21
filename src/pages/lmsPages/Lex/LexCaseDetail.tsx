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
  MapPin,
  MessagesSquare,
  Send,
  SendHorizontal,
  Settings2,
  ShieldAlert,
  Tags,
  UserCheck,
} from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Tabs, TabsContent } from "../../../components/ui/tabs";
import { Textarea } from "../../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  DetailTabsList,
  DetailTabsTrigger,
  EmptyState,
  Field,
  PermissionDenied,
} from "../../../components/shared/detailKit";
import { TONES, formatDate, formatDateTime, formatMoney } from "../../../components/shared/detailKitUtils";
import { LexNotice, LexPageHeader, LexStatusBadge, LexTile } from "../../../components/shared/lexKit";
import { cn } from "../../../lib/utils";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { useLexAuthority } from "../../../hooks/useLexAuthority";
import { lexErrorMessage, logForbidden } from "../../../redux/apis/apisLexCore";
import { formatMinutes } from "../../../redux/apis/apisLexConfig";
import {
  getAnalyses,
  isDataProblem,
  isStubReader,
  type LexAnalysis,
} from "../../../redux/apis/apisLexDocuments";
import {
  caseChip,
  caseSla,
  claimCase,
  completePhysicalVerification,
  decideCase,
  escalateCase,
  getCase,
  getCaseActions,
  isOverrideAction,
  isWithSource,
  markSourceResponded,
  postCaseMessage,
  sendCaseToSource,
  sendForPhysicalVerification,
  systemMessage,
  type LexCase,
  type LexCaseActions,
} from "../../../redux/apis/apisLexCases";

const SEVERITY_TONE: Record<string, string> = {
  CRITICAL: TONES.red,
  HIGH: TONES.orange,
  MEDIUM: TONES.amber,
  LOW: TONES.slate,
};

const OUTCOME_TONE: Record<string, string> = {
  PASS: TONES.emerald,
  FAIL: TONES.red,
  FLAGGED: TONES.amber,
  NOT_RUN: TONES.slate,
};

/**
 * The Application Review Workspace: what LEX decided, why, and what the handler
 * may do about it.
 *
 * Five things this screen takes from the payload rather than inventing:
 *
 * - **`readOnly`** disables the form, not `status`. A decided case is closed to
 *   edits and the server enforces it with `422 LEX.CASE.READ_ONLY`.
 * - **The routing explanation is a message**, the one whose `kind` starts with
 *   `SYSTEM`. It is what LEX wrote about why this case exists, so it sits at the
 *   top rather than buried in the thread.
 * - **`sla: null` means not tracked** — no published policy covers this scope.
 *   Never a zero clock, which would read as "on time".
 * - **The action vocabulary comes from `/actions`**, not a hardcoded list.
 * - **`routingType` is the honest "Final LEX Output"** — it says which room the
 *   case is in and therefore who must act.
 *
 * **Three tabs, not five.** The mockup's *Data & Policy Checks* (Campaign
 * References, Traffic Light, RAC) and *Risk & Portfolio Context* (Portfolio
 * Statistics, LEX Analysis scores, Reporting Module, AI Guardrails) have no
 * service behind them, and neither does the Stage 1 LightGBM panel — its
 * accuracy figures, model comparison and decision factors are all mockup
 * content. A hidden panel is honest; a panel of placeholder numbers sitting
 * beside a real credit decision will be read as measured.
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
  const canReadDocs = can(LEX_PERMISSIONS.ANALYSIS_READ);

  /**
   * The rung check, predicted. Authority runs upward, so an L1 underwriter on
   * an L2 case gets the disabled button and the escalate path — which is the
   * correct action for a case above your rung — rather than a 422 on click.
   */
  const { levelCode, canDecideLevel } = useLexAuthority();

  const [record, setRecord] = useState<LexCase | null>(null);
  /**
   * The verbs this case permits, asked for rather than assumed. Loaded with the
   * case — not on dialog open — because it also decides whether Escalate is
   * offered at all, and a button that appears a moment after the page does is a
   * button people click twice.
   */
  const [actions, setActions] = useState<LexCaseActions | null>(null);
  const [analyses, setAnalyses] = useState<LexAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [tab, setTab] = useState("actions");

  const [decisionOpen, setDecisionOpen] = useState(false);
  const [action, setAction] = useState("");
  const [writtenReason, setWrittenReason] = useState("");
  const [evidenceReference, setEvidenceReference] = useState("");
  const [overrode, setOverrode] = useState(false);

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "LEX.CASE.READ_ONLY": t("case.err.readOnly"),
      "LEX.CASE.INVALID_ACTION": t("case.err.invalidAction"),
      "LEX.CASE.OVERRIDE_REASON": t("case.err.overrideReason"),
      // The older spelling. Both are mapped so the message does not regress to
      // the generic fallback whichever one the deployed service emits.
      "LEX.CASE.OVERRIDE_REASON_REQUIRED": t("case.err.overrideReason"),
      "LEX.CASE.AT_HIGHEST_LEVEL": t("case.err.atHighestLevel"),
      "LEX.CASE.NOT_FOUND": t("case.err.notFound"),
      // The server is the authority on the ladder: a stale level list here must
      // surface the rule, not a generic failure.
      "LEX.CASE.INSUFFICIENT_AUTHORITY": t("case.err.insufficientAuthority"),
    }),
    [t]
  );

  const load = async () => {
    if (!canRead || !caseId) return;
    setIsLoading(true);
    try {
      const next = await getCase(caseId);
      setRecord(next);
      // A decided case has nothing left to permit, and asking would 422.
      setActions(next.readOnly ? null : await loadActions(caseId));
      loadAnalyses(next.applicationId);
    } catch (error) {
      logForbidden(error, "GET /cases/{id}");
      toast.error(lexErrorMessage(error, t("case.toast.loadFailed"), errorsByCode));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * A failure here must not take the case down with it: the context on this page
   * is still worth reading, and the decision controls simply stay closed.
   */
  const loadActions = async (id: string): Promise<LexCaseActions | null> => {
    try {
      return await getCaseActions(id);
    } catch (error) {
      logForbidden(error, "GET /cases/{id}/actions");
      return null;
    }
  };

  /**
   * `applicationId` is required by this endpoint and it is the **application**
   * id, never the case id — omitting it is a 400, and passing the case id
   * silently returns nothing.
   */
  const loadAnalyses = async (applicationId?: string) => {
    if (!canReadDocs || !applicationId) return;
    try {
      const result = await getAnalyses({ applicationId, size: 50 });
      setAnalyses(result.content);
    } catch (error) {
      logForbidden(error, "GET /documents/analyses");
      setAnalyses([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const run = async (fn: () => Promise<LexCase>, successKey: string, failKey: string) => {
    setBusy(true);
    try {
      const next = await fn();
      setRecord(next);
      // Escalating or parking the case changes which verbs it permits — the
      // room it is in is what defines them.
      if (caseId) setActions(next.readOnly ? null : await loadActions(caseId));
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
    // The server refuses an override with no reason; asking here saves the trip.
    if (requiresReason && !writtenReason.trim()) {
      return toast.error(t("case.err.overrideReason"));
    }
    // `evidenceType` present means the process names what the decision must
    // point at. Recording one without it leaves an unsupported decision.
    if (actions?.evidenceType && !evidenceReference.trim()) {
      return toast.error(t("case.valid.evidence", { type: actions.evidenceType }));
    }

    setBusy(true);
    try {
      setRecord(
        await decideCase(caseId, {
          action: action.trim(),
          writtenReason: writtenReason.trim() || undefined,
          evidenceReference: evidenceReference.trim() || null,
          overrode,
        })
      );
      setActions(null);
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
  const hasAuthority = canDecideLevel(record?.assignedLevelCode);
  const resolvingActions = actions?.resolvingActions || [];
  /**
   * An override always needs a reason, and so does an OVERRULE verb whether or
   * not the box is ticked — the verb itself is the override.
   */
  const requiresReason = overrode || isOverrideAction(action);
  /**
   * Escalation is a separate call, and the server says whether there is anywhere
   * above this rung to go. Offering it at the top of the ladder produces a 422
   * on click and no way forward.
   */
  const canOfferEscalate = canEscalate && !readOnly && actions?.escalationAvailable !== false;
  // Declared after its operands: canOfferEscalate and resolvingActions are
  // both defined below readOnly, and reading them earlier is a TDZ error at
  // render rather than a compile error.
  const hasCaseActions =
    (!readOnly && canUpdate && !record?.assigneeUserId) ||
    canOfferEscalate ||
    (!readOnly && canDecide && resolvingActions.length > 0);
  const chip = caseChip({ status: record?.status || "", decisionAction: record?.decision?.action });
  const withSource = isWithSource(record?.status);
  const inPhysicalVerification = record?.status === "AWAITING_PHYSICAL_VERIFICATION";
  const parked = withSource || inPhysicalVerification;

  const system = systemMessage(record ?? undefined);
  const info = record?.applicationInfo;
  const sla = caseSla(record);
  const humanMessages = (record?.messages || []).filter((m) => !String(m.kind).startsWith("SYSTEM"));
  const unrecognized = (record?.attachedCodes || []).some((c) => c.recognized === false);
  const drivingCode = (record?.attachedCodes || []).find((c) => c.driving);

  const openDecision = () => {
    setAction(resolvingActions.length === 1 ? resolvingActions[0] : "");
    setWrittenReason("");
    setEvidenceReference("");
    setOverrode(false);
    setDecisionOpen(true);
  };

  return (
    <div className="service">
      <LexPageHeader
        icon={Inbox}
        title={t("ws.title")}
        subtitle={info?.applicantName || record?.applicationId || undefined}
      >
        <Button variant="outline" className="gap-2" onClick={() => navigate("/LOS/Lex/Cases")}>
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("case.backToList")}
        </Button>
      </LexPageHeader>

      {/* Record-changing actions on one bar, inside a card so they pick up
          the same sizing as the rest of the app's controls. Skipped when
          nothing applies, rather than leaving an empty strip. */}
      {hasCaseActions && (
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
          {canOfferEscalate && (
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
          {!readOnly && canDecide && resolvingActions.length > 0 && (
            <Button
              className="wallet-brand-btn gap-2"
              disabled={!hasAuthority}
              title={hasAuthority ? undefined : t("case.err.insufficientAuthority")}
              onClick={openDecision}
            >
              <CheckCircle2 className="h-4 w-4" />
              {t("case.decide")}
            </Button>
          )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Application header                                                */}
      {/* ---------------------------------------------------------------- */}
      <div className="pro-card mb-3 p-5">
        {/* Identity on one line: who, what state, which application. A bare
            `h2` is centred by a global rule in custom.scss, so the alignment
            is pinned here rather than inherited. */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="pro-head-badge">
              <UserCheck className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t("case.field.applicant")}
              </span>
              {/* Blank on cases opened during the identity-service outage. The
                  case package is append-only, so those stay blank. */}
              <h2 className="m-0 truncate text-start text-2xl font-bold tracking-tight text-foreground">
                {info?.applicantName || t("hub.noName")}
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {record && <LexStatusBadge status={record.status} />}
            <Badge variant="outline" className={`border font-mono font-medium ${TONES.slate}`}>
              {info?.applicationNumber || record?.applicationId || "—"}
            </Badge>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-4 sm:grid-cols-3 lg:grid-cols-5">
          {/* Case open time, not application submission time — lending does not
              send the submission date. */}
          <HeroField
            label={t("ws.field.openedAt")}
            value={formatDate(record?.openedAt)}
            hint={t("ws.field.openedAtHint")}
          />
          <HeroField label={t("case.field.product")} value={info?.productName} />
          <HeroField label={t("ws.field.sourcingChannel")} value={info?.sourceChannel} />
          <HeroField
            label={t("ws.field.statusDate")}
            value={formatDate(record?.decision?.decidedAt || record?.openedAt)}
          />
          <HeroField label={t("ws.field.bureauScore")} value={info?.creditScore} />
        </div>

        <div className="mt-4 border-t border-border/60 pt-4">
          <p className="m-0 mb-2 text-sm font-semibold text-foreground">{t("ws.financing")}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <HeroField
              label={t("case.field.requestedAmount")}
              value={info?.requestedAmount != null ? formatMoney(info.requestedAmount) : undefined}
              accent
            />
            <HeroField
              label={t("case.field.verifiedSalary")}
              value={info?.verifiedSalary != null ? formatMoney(info.verifiedSalary) : undefined}
            />
            <HeroField label={t("case.field.dbr")} value={info?.dbr != null ? `${info.dbr}%` : undefined} />
          </div>
        </div>

        {/* Income sector, employer name and employer category are on the mockup
            and in no contract: lending passes sector as a literal null and the
            employer registry is not linked to a case. Said once, on its own
            line, rather than as three empty fields or half an empty column. */}
        <div className="mt-4 border-t border-border/60 pt-3">
          <span className="text-sm font-semibold text-foreground">{t("ws.employment")}</span>
          <span className="ms-2 text-xs text-muted-foreground">{t("dash.employmentGap")}</span>
        </div>
      </div>
      {readOnly && (
        <LexNotice tone="slate" icon={Lock}>
          {t("case.readOnlyNote")}
        </LexNotice>
      )}

      {/* Above the signed-in user's rung: say so, and say that escalating is
          the action that fits — a disabled button with no explanation reads as
          a broken screen. */}
      {!readOnly && canDecide && !hasAuthority && (
        <LexNotice tone="amber" icon={ShieldAlert}>
          {t("case.authorityNote", { level: record?.assignedLevelCode, yours: levelCode || "—" })}
        </LexNotice>
      )}

      {unrecognized && (
        <LexNotice tone="amber" icon={HelpCircle}>
          {t("case.unrecognizedNote")}
        </LexNotice>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* LEX output                                                        */}
      {/* ---------------------------------------------------------------- */}
      <div className="pro-card mb-3 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Bot className="h-4 w-4" />
              </span>
              <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                {t("ws.lexOutput")}
              </h4>
            </div>
            <p className="m-0 text-xs text-muted-foreground">{t("ws.lexOutputSub")}</p>
          </div>
          {record?.beyondDelegation && (
            <Badge variant="outline" className={`border font-medium ${TONES.amber}`}>
              {t("ws.elevated")}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-muted/40 p-3">
            <span className="mb-1 block text-xs text-muted-foreground">
              {t("dash.field.referralReason")}
            </span>
            {/* Title is null when the code is unrecognized — show the reference
                code itself, and mark it as needing configuration. */}
            <span className="block text-sm font-semibold text-foreground">
              {drivingCode?.title || drivingCode?.referenceCode || "—"}
            </span>
            {drivingCode?.severity && (
              <Badge
                variant="outline"
                className={`mt-1.5 border font-medium ${
                  SEVERITY_TONE[drivingCode.severity] || TONES.slate
                }`}
              >
                {drivingCode.severity}
              </Badge>
            )}
          </div>

          {/* `routingType` is the honest "Final LEX Output": it names the room
              the case is in, and therefore who must act. */}
          <div className="rounded-lg bg-muted/40 p-3">
            <span className="mb-1 block text-xs text-muted-foreground">{t("ws.finalOutput")}</span>
            <span className="block text-sm font-semibold text-amber-600 dark:text-amber-400">
              {record?.routingType || "—"}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {record?.routingType ? t(`ws.routing.${record.routingType}`) : ""}
            </span>
          </div>

          <div className="rounded-lg bg-muted/40 p-3">
            <span className="mb-1 block text-xs text-muted-foreground">{t("ws.assignment")}</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <LexStatusBadge status={chip} label={record ? t(`case.chip.${chip}`) : undefined} />
              {record?.assignedLevelCode && (
                <Badge variant="outline" className={`border font-medium ${TONES.slate}`}>
                  {record.assignedLevelCode}
                </Badge>
              )}
            </div>
            <span className="mt-1.5 block text-xs text-muted-foreground">
              {record?.assigneeUserId || t("case.unassigned")}
            </span>
          </div>
        </div>

        {/* The mockup's Decision Rationale Summary, Risk Classification, SAMA
            Compliance verdict and ML Risk Score are not built: nothing writes
            prose, and no model service exists. Stated rather than filled in. */}
        <p className="m-0 mt-3 text-xs text-muted-foreground">{t("ws.analyticsGap")}</p>
      </div>

      {/* What LEX wrote about why this case exists. */}
      {system && (
        <div className="pro-card mb-3 p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
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

      {/* ---------------------------------------------------------------- */}
      {/* Tabs                                                              */}
      {/* ---------------------------------------------------------------- */}
      <Tabs value={tab} onValueChange={setTab}>
        <DetailTabsList>
          <DetailTabsTrigger value="actions">{t("ws.tab.actions")}</DetailTabsTrigger>
          <DetailTabsTrigger value="hitl">{t("ws.tab.hitl")}</DetailTabsTrigger>
          <DetailTabsTrigger value="audit">{t("ws.tab.audit")}</DetailTabsTrigger>
        </DetailTabsList>

        {/* ------------------------------ LEX Actions ------------------- */}
        <TabsContent value="actions" className="mt-3">
          <div className="pro-card mb-3 p-4">
            <div className="mb-1 flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Tags className="h-4 w-4" />
              </span>
              <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                {t("case.codes")}
              </h4>
            </div>
            <p className="m-0 mb-3 text-xs text-muted-foreground">{t("case.secondaryNote")}</p>
            {(record?.attachedCodes || []).length === 0 ? (
              <p className="m-0 text-sm text-muted-foreground">{t("case.noCodes")}</p>
            ) : (
              (record?.attachedCodes || []).map((code) => (
                <div
                  key={code.referenceCode}
                  className="pro-tile mb-2 flex flex-wrap items-center gap-2 last:mb-0"
                >
                  <span className="font-mono text-xs">{code.referenceCode}</span>
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

          {/* Documents viewed. Only document-derived checks carry a
              per-application outcome — the mockup's Employer Validation, Salary
              Match, Biometric Identity and SAMA Retail Limit rows are catalogue
              entries with no result stored against a case. */}
          <div className="pro-card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="pro-head-badge">
                  <FileText className="h-4 w-4" />
                </span>
                <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                  {t("ws.documents")}
                </h4>
              </div>
              {analyses.some(isStubReader) && (
                <Badge variant="outline" className={`border font-medium ${TONES.amber}`}>
                  {t("ws.stubReader")}
                </Badge>
              )}
            </div>

            {analyses.length === 0 ? (
              <EmptyState icon={FileText} text={t("ws.noDocuments")} />
            ) : (
              analyses.map((analysis) => (
                <div key={analysis.id} className="pro-tile mb-2 last:mb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{analysis.documentKind || "—"}</span>
                    <LexStatusBadge status={analysis.state} />
                    {/* The mismatch signal: expected a bank statement PDF,
                        received an image. That is what produces an
                        APPLICATION_SOURCE referral. */}
                    {analysis.expectedKind && analysis.expectedKind !== analysis.documentKind && (
                      <Badge variant="outline" className={`border font-medium ${TONES.amber}`}>
                        {t("ws.expectedKind", { kind: analysis.expectedKind })}
                      </Badge>
                    )}
                    {analysis.confidenceScore != null && (
                      <span className="text-xs text-muted-foreground">
                        {t("ws.confidence", { value: analysis.confidenceScore })}
                      </span>
                    )}
                  </div>

                  {/* A submission problem is not an adverse finding about the
                      applicant, and must never be shown as one. */}
                  {isDataProblem(analysis) && (
                    <LexNotice tone="amber" className="mb-0 mt-2">
                      {analysis.analysisNote || t("ws.dataProblem")}
                    </LexNotice>
                  )}

                  {!!analysis.checks?.length && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {analysis.checks.map((check) => (
                        <Badge
                          key={`${analysis.id}-${check.checkCode}`}
                          variant="outline"
                          className={`border font-medium ${OUTCOME_TONE[String(check.outcome)] || TONES.slate}`}
                          title={check.detail || undefined}
                        >
                          {check.displayName || check.checkCode}
                          {" · "}
                          {check.outcome}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {!!analysis.reasonCodes?.length && (
                    <p className="m-0 mt-2 text-xs text-muted-foreground">
                      {t("ws.derivedCodes", { codes: analysis.reasonCodes.join(", ") })}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* ------------------------------ Human-in-the-loop ------------- */}
        <TabsContent value="hitl" className="mt-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="pro-card p-4 lg:col-span-2">
              <div className="mb-1 flex items-center gap-2.5">
                <span className="pro-head-badge">
                  <Gavel className="h-4 w-4" />
                </span>
                <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                  {t("ws.commitDecision")}
                </h4>
              </div>
              <p className="m-0 mb-3 text-xs text-muted-foreground">{t("case.decideExplain")}</p>

              {/* The actor is the JWT subject. The mockup's Salim/Daniel
                  reviewer switcher is a mockup device — there is no
                  impersonation endpoint, and there must not be one on a credit
                  decision. */}
              <LexNotice tone="slate" className="mb-3">
                {t("ws.actorNote")}
              </LexNotice>

              {readOnly ? (
                <LexNotice tone="slate" icon={Lock} className="mb-0">
                  {t("case.readOnlyNote")}
                </LexNotice>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {canDecide && resolvingActions.length > 0 && (
                    <Button
                      className="wallet-brand-btn gap-2"
                      disabled={!hasAuthority || busy}
                      title={hasAuthority ? undefined : t("case.err.insufficientAuthority")}
                      onClick={openDecision}
                    >
                      <Gavel className="h-4 w-4" />
                      {t("case.decide")}
                    </Button>
                  )}
                  {canOfferEscalate && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => escalateCase(String(caseId)),
                          "case.toast.escalated",
                          "case.toast.escalateFailed"
                        )
                      }
                    >
                      <ArrowUpCircle className="h-4 w-4" />
                      {t("case.escalate")}
                    </Button>
                  )}
                  {canUpdate && !parked && (
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
                  {canUpdate && withSource && (
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
                  {canUpdate && !parked && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => sendForPhysicalVerification(String(caseId)),
                          "case.toast.sentForVerification",
                          "case.toast.sendVerificationFailed"
                        )
                      }
                    >
                      <MapPin className="h-4 w-4" />
                      {t("case.sendForVerification")}
                    </Button>
                  )}
                  {canUpdate && inPhysicalVerification && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => completePhysicalVerification(String(caseId)),
                          "case.toast.verificationCompleted",
                          "case.toast.verificationCompleteFailed"
                        )
                      }
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {t("case.completeVerification")}
                    </Button>
                  )}
                </div>
              )}

              {/* Approve Reduced Limit and Refer to Credit Risk Committee are on
                  the mockup and are not built: LEX records an action, not an
                  amended amount, and no committee routing exists. */}
              {!readOnly && <p className="m-0 mt-3 text-xs text-muted-foreground">{t("ws.buttonsGap")}</p>}

              {/* The decision, once made. */}
              {record?.decision && (
                <div className="mt-4 border-t border-border/60 pt-3">
                  <div className="flex mb-3 items-center gap-2.5">
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
                    {/* The actor's rung, not the case's — so the trail never
                        reads "approved at L2" for a button an L0 pressed. */}
                    <Field label={t("case.field.level")} value={record.decision.authorityLevelCode} />
                    <Field
                      label={t("case.field.decidedAt")}
                      value={formatDateTime(record.decision.decidedAt)}
                    />
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
              <div className="mt-4 border-t border-border/60 pt-3">
                <div className="flex mb-3 items-center gap-2.5">
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
                        <span className="text-sm font-medium">
                          {message.authorName || t("case.systemAuthor")}
                        </span>
                        {message.authorRole && (
                          <span className="text-xs text-muted-foreground">{message.authorRole}</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(message.postedAt)}
                        </span>
                      </div>
                      <p className="m-0 mt-1 whitespace-pre-wrap text-sm text-foreground">
                        {message.body}
                      </p>
                    </div>
                  ))
                )}

                {canMessage && !readOnly && (
                  <div className="mt-3 flex items-end gap-2">
                    <Textarea
                      rows={2}
                      className="flex-1"
                      placeholder={t("case.newMessage")}
                      value={draftMessage}
                      onChange={(e) => setDraftMessage(e.target.value)}
                    />
                    <Button className="wallet-brand-btn gap-2" onClick={onPostMessage} disabled={busy}>
                      <Send className="h-4 w-4" />
                      {t("case.post")}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* SLA rail */}
            <div className="pro-card p-4">
              <div className="flex mb-3 items-center gap-2.5">
                <span className="pro-head-badge">
                  <Gauge className="h-4 w-4" />
                </span>
                <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                  {t("hub.sla")}
                </h4>
              </div>
              {/* Null means no published policy covers this case's product and
                  sector. A case with no target silently never breaches, so it is
                  not tracked rather than compliant. */}
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
                  <div className="col-span-2">
                    <LexTile
                      label={t("hub.remainingBuffer")}
                      value={formatMinutes(sla.remainingMinutes)}
                    />
                  </div>
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
              {/* Assigned Team, Current Owner and Escalation Trigger are on the
                  mockup and are not modelled: there is no team model in any LEX
                  service. The assignee and the rung are the honest substitutes. */}
              <p className="m-0 mt-3 text-xs text-muted-foreground">{t("ws.teamGap")}</p>
            </div>
          </div>
        </TabsContent>

        {/* ------------------------------ Audit ------------------------- */}
        <TabsContent value="audit" className="mt-3">
          <div className="pro-card p-4">
            <h4 className="m-0 mb-1 text-sm font-semibold tracking-tight text-foreground">
              {t("case.audit")}
            </h4>
            {/* Append-only. Nothing edits or deletes an entry, which is what
                makes an old case explainable. */}
            <p className="m-0 mb-3 text-xs text-muted-foreground">{t("ws.auditNote")}</p>
            {(record?.auditTrail || []).length === 0 ? (
              <EmptyState icon={History} text={t("case.noAudit")} />
            ) : (
              (record?.auditTrail || []).map((entry) => (
                <div
                  key={entry.id}
                  className="pro-tile mb-2 flex flex-wrap items-baseline gap-2 last:mb-0"
                >
                  <Badge variant="outline" className={`border font-medium ${TONES.slate}`}>
                    {entry.action}
                  </Badge>
                  {/* "LEX" when the system acted — never "Unknown". */}
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
        </TabsContent>
      </Tabs>

      <Dialog open={decisionOpen} onOpenChange={setDecisionOpen}>
        <DialogContent className="pro-dialog sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle>{t("case.decideTitle")}</DialogTitle>
            <DialogDescription>{t("case.decideExplain")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {/* No published process covers the driving code, so these verbs are
                routing defaults rather than policy. Say so — the alternative is
                a screen that implies someone decided this. */}
            {actions?.fromConfiguredProcess === false && (
              <LexNotice tone="amber" icon={Settings2} className="mb-0">
                {t("case.unconfiguredProcessNote", { code: drivingCode?.referenceCode || "—" })}
              </LexNotice>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="case-action">{t("case.field.action")}</Label>
              {/* The vocabulary comes from the case, never from a list written
                  here: it is defined per Reason Code process, and anything
                  outside it is refused with LEX.CASE.INVALID_ACTION. */}
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger id="case-action" className="h-10 bg-card">
                  <SelectValue placeholder={t("case.field.actionPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {resolvingActions.map((verb) => (
                    <SelectItem key={verb} value={verb}>
                      {verb}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="m-0 text-xs text-muted-foreground">{t("case.field.actionHint")}</p>
            </div>

            {/* Overriding the delegated outcome is a deliberate act and is
                recorded as one — which is why it is a box the handler ticks,
                not something inferred from the verb. */}
            <label className="flex items-start gap-2 text-sm" htmlFor="case-overrode">
              <Checkbox
                id="case-overrode"
                checked={overrode}
                onCheckedChange={(checked) => setOverrode(checked === true)}
                className="mt-0.5"
              />
              <span className="min-w-0">
                {t("case.field.overrode")}
                <span className="block text-xs text-muted-foreground">
                  {t("case.field.overrodeHint")}
                </span>
              </span>
            </label>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="case-reason">
                {t("case.field.reason")}
                {requiresReason ? " *" : ""}
              </Label>
              <Textarea
                id="case-reason"
                rows={3}
                value={writtenReason}
                onChange={(e) => setWrittenReason(e.target.value)}
              />
              {requiresReason && (
                <p className="m-0 text-xs text-muted-foreground">{t("case.field.reasonHint")}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              {/* `evidenceType` names what the reference must point at, so it
                  becomes the label rather than sitting in a tooltip. */}
              <Label htmlFor="case-evidence">
                {actions?.evidenceType
                  ? t("case.field.evidenceTyped", { type: actions.evidenceType })
                  : t("case.field.evidence")}
                {actions?.evidenceType ? " *" : ""}
              </Label>
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
            <Button className="wallet-brand-btn" onClick={onDecide} disabled={busy || !action}>
              {t("case.decide")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading && <p className="mt-3 text-sm text-muted-foreground">{t("common:loading")}</p>}
    </div>
  );
};

/** One labelled fact in the application header strip. */
const HeroField = ({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value?: React.ReactNode;
  hint?: string;
  accent?: boolean;
}) => (
  <div className={cn("pro-tile min-w-0", hint && "cursor-help")} title={hint}>
    <span className="pro-tile__label">{label}</span>
    <span
      className={cn(
        "pro-tile__value truncate text-sm",
        accent && "pro-tile__value--accent"
      )}
    >
      {value === null || value === undefined || value === "" ? "—" : value}
    </span>
  </div>
);

export default LexCaseDetail;
