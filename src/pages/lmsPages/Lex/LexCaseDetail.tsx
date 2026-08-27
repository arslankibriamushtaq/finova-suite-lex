import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpCircle,
  Bot,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  Eye,
  Mail,
  MessageSquare,
  MinusCircle,
  Plus,
  Smartphone,
  Trash2,
  XCircle,
  FileText,
  Gauge,
  Gavel,
  HelpCircle,
  History,
  Inbox,
  Lock,
  MapPin,
  MessagesSquare,
  RefreshCw,
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
import {
  TONES,
  formatDate,
  formatDateTime,
  formatMoney,
  humanizeCode,
} from "../../../components/shared/detailKitUtils";
import {
  LexEmployerBadge,
  LexNotice,
  LexPageHeader,
  LexStatusBadge,
  LexTile,
} from "../../../components/shared/lexKit";
import { cn } from "../../../lib/utils";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { useLexAuthority } from "../../../hooks/useLexAuthority";
import { lexErrorCode, lexErrorMessage, logForbidden } from "../../../redux/apis/apisLexCore";
import { formatMinutes } from "../../../redux/apis/apisLexConfig";
import {
  CHECK_GROUPS,
  getAnalyses,
  getDocumentTypeCatalogue,
  isDataProblem,
  isStubReader,
  resolveReasonCodeDocuments,
  type LexAnalysis,
  type LexAnalysisRow,
  type LexDocumentType,
  type LexResolvedDocument,
} from "../../../redux/apis/apisLexDocuments";
import {
  SOURCE_REQUEST_CHANNELS,
  caseAnalyses,
  caseChip,
  caseSla,
  claimCase,
  completePhysicalVerification,
  decideCase,
  escalateCase,
  getCase,
  getCaseActions,
  getCaseDocumentBlob,
  getCaseDocuments,
  isOverrideAction,
  isWithSource,
  markSourceResponded,
  postCaseMessage,
  receivedDocumentKinds,
  sendCaseToSource,
  sendForPhysicalVerification,
  systemMessage,
  type LexCase,
  type LexCaseActions,
  type LexCaseDocument,
  type LexRequestedDocument,
} from "../../../redux/apis/apisLexCases";

const SEVERITY_TONE: Record<string, string> = {
  CRITICAL: TONES.red,
  HIGH: TONES.orange,
  MEDIUM: TONES.amber,
  LOW: TONES.slate,
};

/** The mark that carries the outcome, so the row need not print the word. */
const OUTCOME_ICON: Record<string, typeof CheckCircle2> = {
  PASS: CheckCircle2,
  FAIL: XCircle,
  FLAGGED: AlertTriangle,
  NOT_RUN: MinusCircle,
};

const OUTCOME_ICON_TONE: Record<string, string> = {
  PASS: "text-emerald-600 dark:text-emerald-400",
  FAIL: "text-red-600 dark:text-red-400",
  FLAGGED: "text-amber-600 dark:text-amber-400",
  NOT_RUN: "text-muted-foreground",
};

const OUTCOME_TONE: Record<string, string> = {
  PASS: TONES.emerald,
  FAIL: TONES.red,
  FLAGGED: TONES.amber,
  NOT_RUN: TONES.slate,
};

/**
 * The inventory's verdict tones.
 *
 * There is deliberately no entry for a missing state: `null` is "not analysed",
 * which is a *sixth* thing and is rendered by `VerificationChip` as its own
 * dashed chip. Folding it into this map would give it a solid badge like the
 * five real verdicts, and a solid grey badge beside four verdicts reads as one.
 */
const VERIFICATION_TONE: Record<string, string> = {
  VERIFIED: TONES.emerald,
  ADVERSE_FINDINGS: TONES.red,
  UNREADABLE: TONES.amber,
  WRONG_TYPE: TONES.amber,
  ANALYSIS_UNAVAILABLE: TONES.slate,
};

/** What each channel actually does, drawn rather than described twice. */
const CHANNEL_ICON: Record<string, typeof Mail> = {
  PUSH: Smartphone,
  EMAIL: Mail,
  SMS: MessageSquare,
};

/** The deadline chips. Custom is typed, so it is not in the list. */
const DUE_PRESETS = [24, 48, 72];

/**
 * How often the case is re-read while it sits with the applicant.
 *
 * There is no websocket, and the case moves without us: each upload lands as an
 * audit entry, and when the applicant presses Send the clock resumes and the
 * status flips to IN_REVIEW with nobody on this screen doing anything. Nothing
 * auto-submits — the last file does not close the request — but the moment it
 * closes is still the applicant's, so the state last rendered here is never
 * safe to assume is still true.
 */
const AWAITING_POLL_MS = 20000;

/**
 * Checks by group, in the sequence's own order.
 *
 * `CHECK_GROUPS` fixes the order of the four shipped groups; anything the
 * catalogue grows beyond them follows, and a row with no group falls into
 * "OTHER" rather than being dropped — an unshown check reads as one that
 * never ran.
 */
const groupChecks = (checks: LexAnalysisRow[]): [string, LexAnalysisRow[]][] => {
  const byGroup = new Map<string, LexAnalysisRow[]>();
  for (const check of [...checks].sort((a, b) => (a.ordinal || 0) - (b.ordinal || 0))) {
    const key = String(check.group || "OTHER");
    byGroup.set(key, [...(byGroup.get(key) || []), check]);
  }
  const known = CHECK_GROUPS.filter((g) => byGroup.has(g)) as string[];
  const rest = [...byGroup.keys()].filter((g) => !known.includes(g));
  return [...known, ...rest].map((g) => [g, byGroup.get(g) as LexAnalysisRow[]]);
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
  /**
   * The inventory — what the case has, as against what the reader concluded.
   * Null while it has never loaded, so an empty case can render an empty state
   * rather than a spinner that never resolves.
   */
  const [caseDocuments, setCaseDocuments] = useState<LexCaseDocument[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [tab, setTab] = useState("actions");

  /**
   * The hand-back form. `channel` starts empty and is **never** preselected —
   * picking one for the underwriter is picking which of their applicants can be
   * reached, which is not something this screen knows.
   */
  const [sendOpen, setSendOpen] = useState(false);
  const [sendDetail, setSendDetail] = useState("");
  const [sendChannel, setSendChannel] = useState("");
  const [sendDocs, setSendDocs] = useState<LexRequestedDocument[]>([]);
  /** Empty means no deadline, which is a real choice and not an unset field. */
  const [sendDue, setSendDue] = useState("");
  const [sendErrors, setSendErrors] = useState<{ detail?: boolean; channel?: boolean }>({});
  /**
   * The document catalogue behind the `kind` picker. `null` while it has never
   * loaded — an empty array is a real answer ("no types are configured") and
   * must not be shown until the fetch has actually returned one.
   */
  const [catalogue, setCatalogue] = useState<LexDocumentType[] | null>(null);
  /**
   * The checklist the case's reason codes resolve to — the decoration behind
   * the pre-filled rows, not the rows themselves. Kept so each row can name
   * which finding asked for it: an underwriter who sees a document they did not
   * expect needs to know where it came from, or they redo the list by hand.
   */
  const [resolvedDocs, setResolvedDocs] = useState<LexResolvedDocument[]>([]);
  /** What the pre-fill did, so the dialog can say it rather than look arbitrary. */
  const [prefillState, setPrefillState] = useState<"idle" | "done" | "empty" | "failed">("idle");

  /**
   * The open file.
   *
   * `url` is an object URL over a blob this session fetched with the bearer
   * token — `<img src>` on the endpoint itself sends no token and renders the
   * 401 as a broken image. The URL is revoked the moment the viewer closes:
   * they are held by the document until it is, and this is somebody's payslip.
   */
  const [preview, setPreview] = useState<{
    doc: LexCaseDocument;
    url: string;
    type: string;
  } | null>(null);
  const previewUrlRef = useRef("");
  const [previewBusy, setPreviewBusy] = useState(false);
  /** `retryable` is the 422 — the file is not lost, so a retry is honest. */
  const [previewError, setPreviewError] = useState<{ message: string; retryable: boolean } | null>(
    null
  );

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
      // Someone else moved the case — the fix is a refresh, not a retry.
      "LEX.CASE.INVALID_STATE": t("case.err.invalidState"),
      // The server is the authority on the ladder: a stale level list here must
      // surface the rule, not a generic failure.
      "LEX.CASE.INSUFFICIENT_AUTHORITY": t("case.err.insufficientAuthority"),
      // A code the picker gave us is no longer in the catalogue — an admin
      // retired the type mid-dialog. The handler re-fetches; this only names
      // the cause, because the server's message lists codes, not the reason.
      "LEX.CASE.UNKNOWN_DOCUMENT_TYPE": t("case.err.unknownDocumentType"),
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
      // The case package now carries its own document verification. Only reach
      // for the documents service when it does not — a second call for a set
      // already in hand is a round trip that can only disagree with it.
      if (!next.documentVerification?.length) loadAnalyses(next.applicationId);
      loadCaseDocuments(caseId);
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

  /**
   * The inventory is gated on `lex.cases : read` — the same permission that
   * fetched the case — so it needs no second check. A failure leaves the panel
   * empty rather than taking the case down with it: the rest of the page is
   * still the underwriter's whole context.
   */
  const loadCaseDocuments = async (id: string) => {
    try {
      setCaseDocuments(await getCaseDocuments(id));
    } catch (error) {
      logForbidden(error, "GET /cases/{id}/documents");
      setCaseDocuments([]);
    }
  };

  /**
   * Open a file.
   *
   * Any previously open blob is revoked first — opening a second document
   * without doing so leaks the first for the life of the document.
   */
  const openPreview = async (doc: LexCaseDocument) => {
    if (!caseId) return;
    releasePreview();
    setPreviewError(null);
    setPreviewBusy(true);
    try {
      const blob = await getCaseDocumentBlob(caseId, doc);
      const url = URL.createObjectURL(blob);
      previewUrlRef.current = url;
      setPreview({ doc, url, type: blob.type || "" });
    } catch (error) {
      logForbidden(error, "GET /cases/{id}/documents/{documentId}/content");
      // 404 is settled — the id was checked against the case before anything
      // was fetched, so retrying asks the same answered question. 422 means the
      // file exists and document-service could not return it, which is worth
      // another go.
      const retryable = lexErrorCode(error) === "LEX.CASE.DOCUMENT_UNAVAILABLE";
      setPreviewError({
        message: lexErrorMessage(error, t("inv.openFailed"), {
          "COMMON.RESOURCE.NOT_FOUND": t("inv.err.notFound"),
          "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
        }),
        retryable,
      });
      setPreview({ doc, url: "", type: "" });
    } finally {
      setPreviewBusy(false);
    }
  };

  // Tracked in a ref as well as in state so unmount can revoke without the
  // cleanup closing over a stale render's url.
  const releasePreview = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = "";
    setPreview(null);
  };

  const closePreview = () => {
    releasePreview();
    setPreviewError(null);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  // Leaving the page with a viewer open would otherwise hold the blob — and
  // its bytes — for as long as the document lives.
  useEffect(() => () => releasePreview(), []);

  /**
   * While the case is with the applicant it changes without us: each upload
   * lands as an audit entry and refreshes `documentVerification`, and the last
   * one can resume the case outright. Poll, and refresh on focus for the
   * underwriter who comes back to the tab.
   */
  const awaitingSource = isWithSource(record?.status);
  useEffect(() => {
    if (!awaitingSource || !canRead || !caseId) return;
    const timer = window.setInterval(load, AWAITING_POLL_MS);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awaitingSource, canRead, caseId]);

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

  /**
   * Hand the case back.
   *
   * Both required fields are checked as **field errors** rather than a toast:
   * the missing thing is on the form, and a toast that vanishes leaves nothing
   * pointing at it.
   *
   * `LEX.CASE.INVALID_ACTION` is deliberately absent from the error map here —
   * on this endpoint it means the channel was not one of the three, and the
   * server's own message lists the real values. Overriding it with the
   * decision-vocabulary wording would answer a question nobody asked.
   */
  const onSendToSource = async () => {
    if (!caseId) return;
    const detail = sendDetail.trim();
    const errors = { detail: !detail, channel: !sendChannel };
    setSendErrors(errors);
    if (errors.detail || errors.channel) return;

    const documents = sendDocs
      .map((row) => ({ kind: row.kind.trim(), note: row.note?.trim() || undefined }))
      .filter((row) => row.kind);
    const dueInHours = Number(sendDue);

    setBusy(true);
    try {
      const next = await sendCaseToSource(caseId, {
        detail,
        channel: sendChannel,
        requestedDocuments: documents,
        // A duration, never a timestamp — the deadline is computed server-side
        // so it does not ride on this browser's clock.
        dueInHours: sendDue && Number.isFinite(dueInHours) && dueInHours > 0 ? dueInHours : undefined,
      });
      // The response is the whole case, already AWAITING_SOURCE and carrying
      // its outstandingRequest. Re-fetching could only return the same thing
      // later, or something a third party changed in between.
      setRecord(next);
      setActions(next.readOnly ? null : await loadActions(caseId));
      setSendOpen(false);
      toast.success(t("case.toast.sentToSource"));
    } catch (error) {
      logForbidden(error, "POST /cases/{id}/send-to-source");
      const codes = { ...errorsByCode };
      delete (codes as Record<string, string>)["LEX.CASE.INVALID_ACTION"];
      toast.error(lexErrorMessage(error, t("case.toast.sendFailed"), codes));
      // Someone else acted on it — show the case as it now is rather than the
      // state this form was written against.
      if (lexErrorCode(error) === "LEX.CASE.INVALID_STATE") load();
      // A code the picker offered is no longer in the catalogue: an admin
      // retired the type while this dialog was open. Re-fetch and re-render
      // rather than leaving a dropdown that cannot be submitted.
      if (lexErrorCode(error) === "LEX.CASE.UNKNOWN_DOCUMENT_TYPE") {
        const fresh = await loadCatalogueAndPrune();
        if (fresh) setSendDocs((rows) => rows.filter((row) => fresh.has(row.kind)));
      }
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
  const withSource = awaitingSource;
  const inPhysicalVerification = record?.status === "AWAITING_PHYSICAL_VERIFICATION";
  const parked = withSource || inPhysicalVerification;

  const system = systemMessage(record ?? undefined);
  const info = record?.applicationInfo;
  const sla = caseSla(record);
  const humanMessages = (record?.messages || []).filter((m) => !String(m.kind).startsWith("SYSTEM"));
  const unrecognized = (record?.attachedCodes || []).some((c) => c.recognized === false);
  const drivingCode = (record?.attachedCodes || []).find((c) => c.driving);
  /**
   * Embedded first, fetched as the fallback. The embedded set needs no
   * ANALYSIS_READ — it arrived inside a case the reader is already allowed to
   * read — so it is not gated a second time here.
   */
  const documents = caseAnalyses(record, analyses);
  /** Which analyses have their check rows on this page — see `inv.viewChecks`. */
  const renderedAnalysisIds = new Set(documents.map((a) => a.id).filter(Boolean) as string[]);
  const scrollToAnalysis = (analysisId: string) =>
    document
      .getElementById(`lex-analysis-${analysisId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });

  /**
   * The open hand-back, and which of its lines have arrived.
   *
   * `outstandingRequest` is null whenever nothing is being waited on, so the
   * panel appears and disappears with the request itself rather than with the
   * status — including when the applicant pressed Send between two polls.
   */
  const outstanding = record?.outstandingRequest || null;
  const receivedKinds = receivedDocumentKinds(record);
  /** Rows may only be added once there is a vocabulary to pick from. */
  const catalogueReady = !!catalogue?.length;

  const openSend = () => {
    setSendDetail("");
    // No default. See LexSourceRequestChannel.
    setSendChannel("");
    setSendDocs([]);
    setSendDue("");
    setSendErrors({});
    setResolvedDocs([]);
    setPrefillState("idle");
    setSendOpen(true);
    // The catalogue first, because the pre-fill is pruned against it: a
    // resolved row naming a retired type would render as an empty picker.
    loadCatalogue().then((types) => prefill(types));
  };

  /**
   * The `kind` vocabulary, fetched on open and cached for the session — it
   * changes when an admin edits the catalogue, not per case.
   *
   * A failure leaves it null, which the dialog renders as "could not be
   * loaded" rather than as an empty catalogue: those are different statements,
   * and only one of them means "ask an administrator".
   */
  const loadCatalogue = async (force = false): Promise<LexDocumentType[] | null> => {
    try {
      const types = await getDocumentTypeCatalogue(force);
      setCatalogue(types);
      return types;
    } catch (error) {
      logForbidden(error, "GET /documents/types?activeOnly=true");
      setCatalogue(null);
      return null;
    }
  };

  /**
   * Pre-fill the request from the case's own reason codes.
   *
   * This is the reason `/resolve` exists: the underwriter edits from a correct
   * starting point instead of deciding from memory, and the same document asked
   * for by two findings appears once.
   *
   * **A config gap never blocks the hand-back.** No codes, no checklists, or a
   * failed call all leave the dialog exactly as it was before — free choice from
   * the catalogue, with a line saying why nothing was filled in.
   */
  const prefill = async (types: LexDocumentType[] | null) => {
    const codes = (record?.attachedCodes || [])
      .map((code) => code.referenceCode)
      .filter(Boolean) as string[];
    if (codes.length === 0) return setPrefillState("empty");

    try {
      const resolved = await resolveReasonCodeDocuments(codes);
      // Offerable codes only — the picker lists the active catalogue, so a row
      // it cannot represent is worse than a row that is not there.
      const offerable = types ? new Set(types.map((type) => type.typeCode)) : null;
      const usable = offerable
        ? resolved.filter((row) => offerable.has(row.typeCode))
        : resolved;
      setResolvedDocs(usable);
      if (usable.length === 0) return setPrefillState("empty");
      setSendDocs(
        usable.map((row) => ({
          kind: row.typeCode,
          // The checklist's note is finding-specific and beats the type's
          // general description; both stay editable.
          note: row.note || row.description || "",
        }))
      );
      setPrefillState("done");
    } catch (error) {
      logForbidden(error, "GET /documents/reason-codes/resolve");
      setResolvedDocs([]);
      setPrefillState("failed");
    }
  };

  /**
   * The `UNKNOWN_DOCUMENT_TYPE` path: re-read the catalogue and hand back the
   * codes that survive, so the rows naming a retired type can be dropped
   * instead of being resubmitted to the same refusal.
   */
  const loadCatalogueAndPrune = async (): Promise<Set<string> | null> => {
    try {
      const fresh = await getDocumentTypeCatalogue(true);
      setCatalogue(fresh);
      return new Set(fresh.map((type) => type.typeCode));
    } catch {
      return null;
    }
  };

  const setDocRow = (index: number, patch: Partial<LexRequestedDocument>) =>
    setSendDocs((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  /**
   * Picking a kind pre-fills the note from the catalogue's `description` — the
   * guidance an admin wrote for exactly this moment ("last six months",
   * "stamped by the employer") — and leaves it editable, because the reason
   * *this* case needs the document is something only the underwriter knows.
   * An edited note is never overwritten.
   */
  const setDocKind = (index: number, typeCode: string) => {
    const type = catalogue?.find((entry) => entry.typeCode === typeCode);
    const current = sendDocs[index];
    const untouched =
      !current?.note ||
      current.note ===
        catalogue?.find((entry) => entry.typeCode === current.kind)?.description;
    setDocRow(index, {
      kind: typeCode,
      note: untouched ? type?.description || "" : current?.note,
    });
  };

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
      {/* What the case is waiting on                                       */}
      {/* ---------------------------------------------------------------- */}
      {outstanding && (
        <div className="pro-card mb-3 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <SendHorizontal className="h-4 w-4" />
              </span>
              <div>
                <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                  {t("case.source.panelTitle")}
                </h4>
                {/* Which channel carried it, so a chase can go down another one. */}
                <span className="text-xs text-muted-foreground">
                  {t("case.source.sentVia", {
                    channel: outstanding.channel
                      ? t(`case.source.channel.${outstanding.channel}`, {
                          defaultValue: humanizeCode(outstanding.channel),
                        })
                      : "—",
                    at: formatDateTime(outstanding.requestedAt),
                  })}
                </span>
              </div>
            </div>
            {/* `overdue` is the server's verdict. A null deadline is "no
                deadline" and must never render as a breach. */}
            <Badge
              variant="outline"
              className={`border font-medium ${
                outstanding.overdue ? TONES.red : TONES.slate
              }`}
            >
              <Clock className="me-1 h-3.5 w-3.5" />
              {!outstanding.dueAt
                ? t("case.source.noDeadline")
                : outstanding.overdue
                  ? t("case.source.overdue", { at: formatDateTime(outstanding.dueAt) })
                  : t("case.source.dueAt", { at: formatDateTime(outstanding.dueAt) })}
            </Badge>
          </div>

          {outstanding.detail && (
            <p className="m-0 mb-3 whitespace-pre-wrap text-sm text-foreground">
              {outstanding.detail}
            </p>
          )}

          {/* A checklist, not a paragraph: one row per requested document, and
              a tick as soon as an upload for that kind lands in the audit
              trail. Matching is case-insensitive. */}
          {outstanding.documents?.length ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {outstanding.documents.map((doc, index) => {
                const received = receivedKinds.has(String(doc.kind).toLowerCase());
                const Icon = received ? CheckCircle2 : Circle;
                return (
                  <div key={`${doc.kind}-${index}`} className="pro-tile flex items-start gap-2">
                    <Icon
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        received ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                      )}
                    />
                    <div className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {humanizeCode(doc.kind)}
                      </span>
                      {doc.note && (
                        <span className="block text-xs text-muted-foreground">{doc.note}</span>
                      )}
                      <span className="block text-[11px] text-muted-foreground">
                        {received ? t("case.source.received") : t("case.source.awaited")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Zero documents is a question, not a re-upload. Like every
            // hand-back it closes only when the applicant presses Send, or when
            // someone here marks the source as having responded.
            <LexNotice tone="amber" className="mb-0">
              {t("case.source.noDocumentsNote")}
            </LexNotice>
          )}
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
          {/* The real submission time. `openedAt` is when LEX received the
              referral and is always later — labelling one as the other
              misstates how long the applicant has been waiting. */}
          <HeroField
            label={t("ws.field.applicationDate")}
            value={formatDate(info?.applicationSubmittedAt || record?.openedAt)}
            hint={info?.applicationSubmittedAt ? undefined : t("ws.field.openedAtFallbackHint")}
          />
          <HeroField
            label={t("ws.field.applicationDate")}
            value={formatDate(info?.applicationSubmittedAt || record?.openedAt)}
            hint={
              info?.applicationSubmittedAt ? undefined : t("ws.field.openedAtFallbackHint")
            }
          />
          <HeroField label={t("case.field.product")} value={info?.productName} />
          <HeroField
            label={t("ws.field.sourcingChannel")}
            value={info?.sourceChannel ? humanizeCode(info.sourceChannel) : undefined}
            hint={t("ws.field.channelHint")}
          />
          <HeroField
            label={t("ws.field.statusDate")}
            value={formatDate(record?.decision?.decidedAt || record?.openedAt)}
          />
          <HeroField label={t("ws.field.bureauScore")} value={info?.creditScore} />
        </div>

        <div className="mt-4 border-t border-border/60 pt-4">
          <p className="m-0 mb-2 text-sm font-semibold text-foreground">{t("ws.employment")}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <HeroField
              label={t("dash.field.incomeSector")}
              value={info?.incomeSector ? humanizeCode(info.incomeSector) : undefined}
            />
            <HeroField label={t("dash.field.employerName")} value={info?.employerName} />
            <div className="pro-tile min-w-0">
              <span className="pro-tile__label">{t("dash.field.employerCategory")}</span>
              {/* Resolved by LEX against the Approved Employer List, not sent
                  by lending. UNKNOWN means the check never ran and is styled
                  apart from NOT_WHITELISTED — only the latter is grounds for
                  declining. */}
              <LexEmployerBadge category={info?.employerCategory} t={t} className="mt-1.5" />
            </div>
            <HeroField
              label={t("dash.field.employmentVintage")}
              value={
                info?.employmentDurationMonths != null
                  ? t("dash.months", { count: info.employmentDurationMonths })
                  : undefined
              }
            />
          </div>
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

          {/* The inventory: what the case has, merged across the applicant's
              hand-back uploads and the original submission. The forensics —
              which check said what — is the panel below. */}
          <div className="pro-card mb-3 p-4">
            <div className="mb-1 flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Inbox className="h-4 w-4" />
              </span>
              <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                {t("inv.title")}
              </h4>
            </div>
            <p className="m-0 mb-3 text-xs text-muted-foreground">{t("inv.subtitle")}</p>

            {caseDocuments === null ? (
              <p className="m-0 text-sm text-muted-foreground">{t("inv.loading")}</p>
            ) : caseDocuments.length === 0 ? (
              <EmptyState icon={FileText} text={t("inv.empty")} />
            ) : (
              // Newest first — three hand-backs mean three generations of the
              // same kind, and the last one is the one being judged.
              caseDocuments.map((doc) => (
                <div key={doc.documentId} className="pro-tile mb-2 last:mb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {doc.kind ? humanizeCode(doc.kind) : t("inv.unknownKind")}
                    </span>
                    <VerificationChip
                      state={doc.verificationState}
                      notAnalysedLabel={t("inv.notAnalysed")}
                    />
                    {doc.uploadedByApplicant && (
                      <Badge variant="outline" className={`border font-medium ${TONES.sky}`}>
                        {t("inv.fromApplicant")}
                      </Badge>
                    )}
                    <span className="ms-auto text-xs text-muted-foreground">
                      {formatDateTime(doc.receivedAt || undefined)}
                    </span>
                  </div>

                  {/* Absent for the original submission — no empty slot. */}
                  {doc.fileName && (
                    <p className="m-0 mt-1 truncate text-xs text-muted-foreground">{doc.fileName}</p>
                  )}

                  {/* A submission problem is the file's fault, not the
                      applicant's, and must not look like an adverse finding. */}
                  {doc.dataProblem && (
                    <LexNotice tone="amber" className="mb-0 mt-2">
                      {t("inv.dataProblem")}
                    </LexNotice>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={previewBusy}
                      onClick={() => openPreview(doc)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {t("inv.open")}
                    </Button>
                    {/* Only offered when the check rows are actually on this
                        page — a link to a panel that is not rendered is a
                        promise the screen cannot keep. */}
                    {doc.analysisId && renderedAnalysisIds.has(doc.analysisId) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => scrollToAnalysis(String(doc.analysisId))}
                      >
                        <Gauge className="h-3.5 w-3.5" />
                        {t("inv.viewChecks")}
                      </Button>
                    )}
                  </div>
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
              {documents.some(isStubReader) && (
                <Badge variant="outline" className={`border font-medium ${TONES.amber}`}>
                  {t("ws.stubReader")}
                </Badge>
              )}
            </div>

            {documents.length === 0 ? (
              <EmptyState icon={FileText} text={t("ws.noDocuments")} />
            ) : (
              documents.map((analysis) => (
                <div
                  key={analysis.id}
                  id={`lex-analysis-${analysis.id}`}
                  className="pro-tile mb-2 last:mb-0"
                >
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

                  {/* Fifteen long names never fit on badges — they wrap into an
                      unreadable stack. Each check is a row instead: outcome
                      mark, name, and the detail the reader actually needs to
                      judge it. Grouped, in ordinal order, which is the order
                      the runner executed them in. */}
                  {!!analysis.checks?.length && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-border/60">
                      {groupChecks(analysis.checks).map(([group, rows]) => (
                        <div key={`${analysis.id}-${group}`}>
                          <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/50 px-3 py-1.5">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {humanizeCode(group)}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {rows.filter((r) => r.outcome === "PASS").length}/{rows.length}
                            </span>
                          </div>
                          {rows.map((check) => (
                            <CheckRow
                              key={`${analysis.id}-${check.checkCode}`}
                              check={check}
                              confidenceLabel={
                                check.confidence != null
                                  ? t("ws.confidence", { value: check.confidence })
                                  : undefined
                              }
                            />
                          ))}
                        </div>
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
                      onClick={openSend}
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
                  {/* A stopped clock has no countdown. Printing a remaining
                      figure beside it reads as time running out on a case
                      nobody in the queue is holding up. */}
                  {!sla.stopped && (
                    <div className="col-span-2">
                      <LexTile
                        label={t("hub.remainingBuffer")}
                        value={formatMinutes(sla.remainingMinutes)}
                      />
                    </div>
                  )}
                  {sla.stopped && (
                    <div className="col-span-2">
                      <LexNotice tone="slate" icon={Clock} className="mb-0">
                        {withSource ? t("case.sla.waitingOnApplicant") : t("case.sla.stoppedNote")}
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

      {/* ---------------------------------------------------------------- */}
      {/* Send to source                                                    */}
      {/* ---------------------------------------------------------------- */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="pro-dialog sm:max-w-xl">
          <DialogHeader className="text-start">
            <DialogTitle>{t("case.source.title")}</DialogTitle>
            <DialogDescription>{t("case.source.explain")}</DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[65vh] flex-col gap-3 overflow-y-auto pe-1">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="source-detail">{t("case.source.detail")}</Label>
              {/* Read by the applicant and written to the audit trail, so the
                  placeholder pushes for the specific complaint rather than
                  "documents needed". */}
              <Textarea
                id="source-detail"
                rows={2}
                value={sendDetail}
                placeholder={t("case.source.detailPlaceholder")}
                aria-invalid={sendErrors.detail || undefined}
                className={cn(sendErrors.detail && "border-destructive")}
                onChange={(e) => {
                  setSendDetail(e.target.value);
                  if (sendErrors.detail) setSendErrors((prev) => ({ ...prev, detail: false }));
                }}
              />
              {sendErrors.detail ? (
                <p className="m-0 text-xs text-destructive">{t("case.source.valid.detail")}</p>
              ) : (
                <p className="m-0 text-xs text-muted-foreground">{t("case.source.detailHint")}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t("case.source.channel")}</Label>
              {/* Nothing preselected: which channel reaches this applicant is
                  the underwriter's knowledge, and a push into an app nobody
                  opens is a request that never arrives while the clock stays
                  stopped. Each option is labelled by what it does. */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {SOURCE_REQUEST_CHANNELS.map((channel) => {
                  const Icon = CHANNEL_ICON[channel];
                  const selected = sendChannel === channel;
                  return (
                    <button
                      key={channel}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setSendChannel(channel);
                        setSendErrors((prev) => ({ ...prev, channel: false }));
                      }}
                      className={cn(
                        // min-w-0 because a grid child defaults to min-width:auto
                        // and the hint below would push past the card's border
                        // rather than wrapping inside it.
                        "flex min-w-0 flex-col items-start gap-1 rounded-md border p-3 text-start transition-colors",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:bg-muted/50",
                        sendErrors.channel && !selected && "border-destructive"
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Icon className="h-4 w-4 shrink-0" />
                        {t(`case.source.channel.${channel}`)}
                      </span>
                      <span className="w-full text-xs leading-snug text-balance text-muted-foreground">
                        {t(`case.source.channelHint.${channel}`)}
                      </span>
                    </button>
                  );
                })}
              </div>
              {sendErrors.channel && (
                <p className="m-0 text-xs text-destructive">{t("case.source.valid.channel")}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label>{t("case.source.documents")}</Label>
                {/* Re-apply, for the underwriter who cleared the rows and wants
                    the checklist back. Only offered when there is one. */}
                {!!(record?.attachedCodes || []).length && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 me-auto"
                    onClick={() => prefill(catalogue)}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t("case.source.prefill")}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  // No catalogue, no rows. A free-text fallback would put a
                  // request the reader cannot match in front of an applicant,
                  // and nothing downstream would flag it.
                  disabled={!catalogueReady}
                  onClick={() => setSendDocs((rows) => [...rows, { kind: "", note: "" }])}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("case.source.addDocument")}
                </Button>
              </div>

              {/* Three different states, and only one of them is the user's to
                  fix: still loading, the fetch failed, or the catalogue is
                  genuinely empty and an admin has to populate it. */}
              {catalogue === null ? (
                <LexNotice tone="slate" className="mb-0">
                  {t("case.source.catalogueUnavailable")}
                </LexNotice>
              ) : catalogue.length === 0 ? (
                <LexNotice tone="amber" className="mb-0">
                  {t("case.source.catalogueEmpty")}
                </LexNotice>
              ) : sendDocs.length === 0 ? (
                // Zero rows is valid, and it changes what the request is: a
                // question rather than a re-upload. The case stays with the
                // applicant until they press Send either way.
                <>
                  {/* A config gap is worth naming, but it is never a blocker —
                      the free choice below is the same one that existed before
                      checklists did. */}
                  {prefillState === "empty" && (
                    <LexNotice tone="slate" className="mb-0">
                      {t("case.source.prefillEmpty")}
                    </LexNotice>
                  )}
                  {prefillState === "failed" && (
                    <LexNotice tone="slate" className="mb-0">
                      {t("case.source.prefillFailed")}
                    </LexNotice>
                  )}
                  <LexNotice tone="amber" className="mb-0">
                    {t("case.source.noDocumentsWarning")}
                  </LexNotice>
                </>
              ) : (
                <>
                  {prefillState === "done" && (
                    <LexNotice tone="sky" className="mb-0">
                      {t("case.source.prefilled", {
                        count: (record?.attachedCodes || []).length,
                      })}
                    </LexNotice>
                  )}
                  {sendDocs.map((row, index) => {
                    const type = catalogue.find((entry) => entry.typeCode === row.kind);
                    // What the checklist said about this document, when it came
                    // from one. Null for a row the underwriter added by hand.
                    const resolved = resolvedDocs.find((entry) => entry.typeCode === row.kind);
                    return (
                      <div key={index} className="flex items-start gap-2">
                        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                          {/* Governed data: the picker shows `displayName` and
                              posts `typeCode`, which is what the reader matches
                              on. A typed code is refused. */}
                          <Select
                            value={row.kind}
                            onValueChange={(value) => setDocKind(index, value)}
                          >
                            <SelectTrigger className="w-full data-[size=default]:h-10">
                              <SelectValue placeholder={t("case.source.kindPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              {catalogue.map((entry) => (
                                <SelectItem key={entry.id} value={entry.typeCode}>
                                  {entry.displayName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {/* Pre-filled from the type's description and still
                              editable — the note is what turns a second rejected
                              upload into a first accepted one. */}
                          <Input
                            value={row.note || ""}
                            placeholder={type?.description || t("case.source.notePlaceholder")}
                            onChange={(e) => setDocRow(index, { note: e.target.value })}
                          />
                          {/* Which finding asked for this. The difference
                              between a list the underwriter trusts and one they
                              redo from scratch. */}
                          {!!resolved?.requiredBy?.length && (
                            <div className="flex flex-wrap items-center gap-1.5 sm:col-span-2">
                              <span className="text-xs text-muted-foreground">
                                {t("case.source.requiredBy", {
                                  codes: resolved.requiredBy.join(", "),
                                })}
                              </span>
                              {resolved.mandatory && (
                                <Badge
                                  variant="outline"
                                  className={`border font-medium ${TONES.sky}`}
                                >
                                  {t("case.source.mandatory")}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={t("case.source.removeDocument")}
                          onClick={() => setSendDocs((rows) => rows.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="source-due">{t("case.source.due")}</Label>
              {/* A duration, not a date: the deadline is computed server-side
                  so it does not ride on this browser's clock. */}
              <div className="flex flex-wrap items-center gap-2">
                {DUE_PRESETS.map((hours) => (
                  <Button
                    key={hours}
                    type="button"
                    variant={sendDue === String(hours) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSendDue(sendDue === String(hours) ? "" : String(hours))}
                  >
                    {t("case.source.hours", { hours })}
                  </Button>
                ))}
                <Input
                  id="source-due"
                  type="number"
                  min={1}
                  className="h-9 w-28"
                  value={sendDue}
                  placeholder={t("case.source.customHours")}
                  onChange={(e) => setSendDue(e.target.value)}
                />
              </div>
              <p className="m-0 text-xs text-muted-foreground">
                {sendDue ? t("case.source.dueHint") : t("case.source.noDeadlineHint")}
              </p>
            </div>

            {/* The link is a bearer credential: it is never shown here, never
                stored in full and cannot be re-read. There is no resend — a
                second copy means handing the case back again. */}
            <LexNotice tone="slate" icon={Lock} className="mb-0">
              {t("case.source.linkNote")}
            </LexNotice>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setSendOpen(false)} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn gap-2" onClick={onSendToSource} disabled={busy}>
              <SendHorizontal className="h-4 w-4" />
              {t("case.sendToSource")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* ---------------------------------------------------------------- */}
      {/* Document preview                                                  */}
      {/* ---------------------------------------------------------------- */}
      {/* Closing revokes the object URL — see `releasePreview`. The blob is
          never written anywhere: the response is `no-store` and this is
          somebody's payslip. */}
      <Dialog open={!!preview} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {preview?.doc.kind ? humanizeCode(preview.doc.kind) : t("inv.unknownKind")}
            </DialogTitle>
            <DialogDescription>
              {preview?.doc.fileName || t("inv.originalSubmission")}
            </DialogDescription>
          </DialogHeader>

          {previewError ? (
            <LexNotice tone="red" className="mb-0">
              {previewError.message}
            </LexNotice>
          ) : previewBusy || !preview?.url ? (
            <p className="m-0 text-sm text-muted-foreground">{t("common:loading")}</p>
          ) : preview.type.startsWith("image/") ? (
            <img
              src={preview.url}
              alt={preview.doc.fileName || preview.doc.kind || ""}
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
          ) : (
            // Anything the browser can render in place — a PDF above all —
            // goes in the frame; the Download button covers what it cannot.
            <iframe
              src={preview.url}
              title={preview.doc.fileName || preview.doc.documentId}
              className="h-[70vh] w-full rounded-lg border border-border/60"
            />
          )}

          <DialogFooter>
            {/* The 422 says the file exists and document-service could not
                return it — worth another go. The 404 says it is not on this
                case, which retrying cannot change. */}
            {previewError?.retryable && preview && (
              <Button
                variant="outline"
                className="gap-2"
                disabled={previewBusy}
                onClick={() => openPreview(preview.doc)}
              >
                <RefreshCw className="h-4 w-4" />
                {t("inv.retry")}
              </Button>
            )}
            {preview?.url && (
              <Button variant="outline" className="gap-2" asChild>
                <a
                  href={preview.url}
                  download={preview.doc.fileName || preview.doc.kind || preview.doc.documentId}
                >
                  <Download className="h-4 w-4" />
                  {t("inv.download")}
                </a>
              </Button>
            )}
            <Button variant="ghost" onClick={closePreview}>
              {t("common:close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading && <p className="mt-3 text-sm text-muted-foreground">{t("common:loading")}</p>}
    </div>
  );
};

/**
 * The inventory's verdict.
 *
 * **A null state is drawn, never omitted.** Nothing has read the file yet, and
 * an empty cell in a column of VERIFIED chips reads as a clean one — which is
 * the same mistake as printing `checksNotRun` as passes. The dashed outline
 * says the answer is absent rather than good.
 */
const VerificationChip = ({
  state,
  notAnalysedLabel,
}: {
  state?: string | null;
  notAnalysedLabel: string;
}) =>
  state ? (
    <Badge
      variant="outline"
      className={`border font-medium ${VERIFICATION_TONE[state] || TONES.slate}`}
    >
      {humanizeCode(state)}
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="gap-1 border border-dashed bg-transparent font-medium text-muted-foreground"
    >
      <HelpCircle className="h-3 w-3" />
      {notAnalysedLabel}
    </Badge>
  );

/**
 * One check in the verification sequence.
 *
 * The mark carries the outcome, so the row does not spend width on the word
 * "PASS" fifteen times — the eye scans a column of ticks and stops at the one
 * that is not. `NOT_RUN` is drawn as its own mark and never as a neutral blank:
 * a check the sequence never reached must not read as one that passed.
 */
const CheckRow = ({
  check,
  confidenceLabel,
}: {
  check: LexAnalysisRow;
  confidenceLabel?: string;
}) => {
  const outcome = String(check.outcome);
  const Icon = OUTCOME_ICON[outcome] || MinusCircle;
  return (
    <div className="flex items-start gap-2.5 border-b border-border/40 px-3 py-2 last:border-b-0">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", OUTCOME_ICON_TONE[outcome] || "text-muted-foreground")} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-medium text-foreground">
            {check.displayName || check.checkCode}
          </span>
          {/* Only worth saying when it is not a pass — every row is otherwise
              the same word. */}
          {outcome !== "PASS" && (
            <Badge
              variant="outline"
              className={`border text-[10px] font-medium ${OUTCOME_TONE[outcome] || TONES.slate}`}
            >
              {outcome}
            </Badge>
          )}
          {/* Present only on FAIL and FLAGGED — it is the code the referral was
              raised under, so it belongs on the row, not in a tooltip. */}
          {check.reasonCode && (
            <span className="font-mono text-[11px] text-muted-foreground">{check.reasonCode}</span>
          )}
        </div>
        {check.detail && (
          <p className="m-0 mt-0.5 text-xs text-muted-foreground">{check.detail}</p>
        )}
      </div>
      {confidenceLabel && (
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {confidenceLabel}
        </span>
      )}
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
