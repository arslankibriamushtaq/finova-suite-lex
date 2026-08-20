import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Archive,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  History,
  Info,
  Lock,
  Plus,
  Save,
  Send,
  Trash2,
  Workflow,
  X,
} from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { PermissionDenied } from "../../../components/shared/detailKit";
import { TONES, formatDateTime } from "../../../components/shared/detailKitUtils";
import {
  LexNotice,
  LexPageHeader,
  LexStatusBadge,
  LexVersionTimeline,
} from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { isEditable, lexErrorCode, lexErrorMessage, logForbidden } from "../../../redux/apis/apisLexCore";
import {
  EVIDENCE_TYPES,
  POLICY_PARAMETERS,
  ROUTING_TYPES,
  SEVERITIES,
  archiveProcess,
  cloneProcess,
  createProcess,
  deleteProcessDraft,
  forbiddenVerb,
  forbidsEvidence,
  getProcess,
  getProcessLineage,
  publishProcess,
  requiresEvidence,
  requiresPolicyParameter,
  updateProcess,
  verbsForRouting,
  type LexExecutionStep,
  type LexProcess,
} from "../../../redux/apis/apisLexConfig";

/**
 * One Reason Code process, and the rule that shapes the whole configurator:
 *
 * > A published process cannot be edited. Editing means cloning it into a new
 * > draft version.
 *
 * So when the status is not DRAFT every field renders read-only and the primary
 * action is "Clone into a new draft". Rendering an enabled form and letting the
 * save fail is the alternative, and discovering the rule after twenty minutes
 * of editing is a bad way to learn it.
 *
 * Two shape rules are enforced in the domain aggregate *and* by a database
 * CHECK constraint, so the form mirrors them rather than offering the refused
 * combination:
 *
 * - `DELEGATION` must name a policy parameter — without one there is nothing
 *   for the delegation matrix to compare a value against;
 * - `APPLICATION_SOURCE` must not carry an evidence type. A data problem is not
 *   a credit decision and must never be closable with credit-decision evidence.
 */
const LexProcessDetail = () => {
  const { t } = useTranslation("lex");
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === "new";
  // Ungated while the LEX permission codes are unregistered — see useLexAccess.
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.PROCESS_READ);
  const canWrite = can(LEX_PERMISSIONS.PROCESS_WRITE);
  const canPublish = can(LEX_PERMISSIONS.PROCESS_PUBLISH);

  const [process, setProcess] = useState<LexProcess | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [referenceCode, setReferenceCode] = useState("");
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [severity, setSeverity] = useState<string>("MEDIUM");
  const [routingType, setRoutingType] = useState<string>("DELEGATION");
  const [linkedPolicyParameter, setLinkedPolicyParameter] = useState<string>(POLICY_PARAMETERS[0]);
  const [evidenceType, setEvidenceType] = useState<string>(EVIDENCE_TYPES[0]);
  const [steps, setSteps] = useState<LexExecutionStep[]>([]);
  const [primaryActions, setPrimaryActions] = useState<string[]>([]);
  const [additionalActions, setAdditionalActions] = useState<string[]>([]);
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [verbDraft, setVerbDraft] = useState("");

  const [lineage, setLineage] = useState<LexProcess[]>([]);
  const [lineageOpen, setLineageOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  /** Set when a clone is refused because the lineage already has an open draft. */
  const [openDraftId, setOpenDraftId] = useState<string | null>(null);

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "COMMON.VALIDATION.FAILED": t("err.validation"),
      "LEX.PROCESS.OPEN_DRAFT_EXISTS": t("proc.err.draftExists"),
      "LEX.PROCESS.NOT_EDITABLE": t("proc.err.notEditable"),
      "LEX.PROCESS.DUPLICATE_REFERENCE_CODE": t("proc.err.duplicateCode"),
      "LEX.PROCESS.NOT_PUBLISHED": t("proc.err.notPublished"),
      "LEX.PROCESS.NOT_FOUND": t("proc.err.notFound"),
      "LEX.PROCESS.INVALID": t("proc.err.invalid"),
    }),
    [t]
  );

  const hydrate = (data: LexProcess) => {
    setProcess(data);
    setReferenceCode(data.referenceCode || "");
    setTitle(data.title || "");
    setPurpose(data.purpose || "");
    setSeverity(String(data.severity || "MEDIUM"));
    setRoutingType(String(data.routingType || "DELEGATION"));
    setLinkedPolicyParameter(data.linkedPolicyParameter || POLICY_PARAMETERS[0]);
    setEvidenceType(data.evidenceType || EVIDENCE_TYPES[0]);
    setSteps([...(data.executionSteps || [])].sort((a, b) => (a.ordinal || 0) - (b.ordinal || 0)));
    setPrimaryActions(data.primaryActions || []);
    setAdditionalActions(data.additionalActions || []);
    setExpectedOutcome(data.expectedOutcome || "");
    setEffectiveDate(data.effectiveDate || "");
  };

  const load = async () => {
    if (!canRead || isNew) return;
    setIsLoading(true);
    try {
      hydrate(await getProcess(String(id)));
    } catch (error) {
      logForbidden(error, "GET /processes/{id}");
      toast.error(lexErrorMessage(error, t("proc.toast.loadFailed"), errorsByCode));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // `editable` comes from the server and already encodes the lifecycle rule.
  const editable = isNew || isEditable(process ?? undefined);
  const readOnly = !editable || !canWrite;

  const needsPolicyParameter = requiresPolicyParameter(routingType);
  const needsEvidence = requiresEvidence(routingType);
  const noEvidence = forbidsEvidence(routingType);

  /**
   * The suggested vocabulary for this routing type. Free entry stays open — the
   * action list is definable per process, not one fixed global set — but a verb
   * the server would refuse for this routing is blocked before saving.
   */
  const suggestedVerbs = useMemo(() => verbsForRouting(routingType), [routingType]);

  const offendingVerbs = useMemo(
    () => [...primaryActions, ...additionalActions].filter((verb) => forbiddenVerb(routingType, verb)),
    [primaryActions, additionalActions, routingType]
  );

  const addVerb = (verb: string, additional = false) => {
    const value = verb.trim();
    if (!value) return;
    const list = additional ? additionalActions : primaryActions;
    if (list.some((v) => v.toLowerCase() === value.toLowerCase())) return;
    (additional ? setAdditionalActions : setPrimaryActions)([...list, value]);
    setVerbDraft("");
  };

  const moveStep = (index: number, delta: number) => {
    const next = [...steps];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSteps(next);
  };

  const onSave = async () => {
    if (!referenceCode.trim()) return toast.error(t("proc.valid.referenceCode"));
    if (!title.trim()) return toast.error(t("proc.valid.title"));
    if (steps.some((s) => !s.instruction?.trim())) return toast.error(t("proc.valid.steps"));
    if (needsPolicyParameter && !linkedPolicyParameter) {
      return toast.error(t("proc.valid.policyParameter"));
    }
    if (needsEvidence && !evidenceType) return toast.error(t("proc.valid.evidence"));
    if (offendingVerbs.length) {
      return toast.error(t("proc.valid.verbs", { verbs: offendingVerbs.join(", ") }));
    }

    setBusy(true);
    try {
      const body = {
        // Ignored on update — it is identity — but sent on create, where it is
        // normalised to upper case server-side.
        referenceCode: referenceCode.trim().toUpperCase(),
        title: title.trim(),
        purpose: purpose.trim() || undefined,
        severity,
        routingType,
        linkedPolicyParameter: needsPolicyParameter ? linkedPolicyParameter : null,
        // Explicitly null rather than omitted: switching a process to
        // APPLICATION_SOURCE has to clear the evidence type, not leave the old
        // one in place for the constraint to reject.
        evidenceType: noEvidence || !needsEvidence ? null : evidenceType,
        // Renumbered 1..n on save, so reordering is lossless — the order is
        // what gets sent, not the numbers.
        executionSteps: steps.map((step, index) => ({ ...step, ordinal: index + 1 })),
        primaryActions,
        additionalActions,
        expectedOutcome: expectedOutcome.trim() || undefined,
        effectiveDate: effectiveDate || undefined,
      };
      const saved = isNew ? await createProcess(body) : await updateProcess(String(id), body);
      toast.success(t("proc.toast.saved"));
      if (isNew) navigate(`/LOS/Lex/Processes/${saved.id}`, { replace: true });
      else hydrate(saved);
    } catch (error) {
      logForbidden(error, "PUT /processes/{id}");
      toast.error(lexErrorMessage(error, t("proc.toast.saveFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const onClone = async () => {
    setBusy(true);
    setOpenDraftId(null);
    try {
      const draft = await cloneProcess(String(id));
      toast.success(t("proc.toast.cloned"));
      navigate(`/LOS/Lex/Processes/${draft.id}`);
    } catch (error) {
      // Only one open draft per lineage, so two admins cannot silently diverge
      // the same rule. Find the existing draft and link to it — the error alone
      // leaves the user with no way forward.
      if (lexErrorCode(error) === "LEX.PROCESS.OPEN_DRAFT_EXISTS" && process?.lineageId) {
        try {
          const versions = await getProcessLineage(process.lineageId);
          const draft = versions.find((v) => v.status === "DRAFT");
          if (draft) setOpenDraftId(draft.id);
        } catch {
          /* the message below still explains the refusal */
        }
      }
      toast.error(lexErrorMessage(error, t("proc.toast.cloneFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const onPublish = async () => {
    setBusy(true);
    try {
      hydrate(await publishProcess(String(id)));
      toast.success(t("proc.toast.published"));
      setPublishOpen(false);
    } catch (error) {
      logForbidden(error, "POST /processes/{id}/publish");
      toast.error(lexErrorMessage(error, t("proc.toast.publishFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const onArchive = async () => {
    setBusy(true);
    try {
      hydrate(await archiveProcess(String(id)));
      toast.success(t("proc.toast.archived"));
    } catch (error) {
      toast.error(lexErrorMessage(error, t("proc.toast.archiveFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const onDeleteDraft = async () => {
    setBusy(true);
    try {
      await deleteProcessDraft(String(id));
      toast.success(t("proc.toast.draftDeleted"));
      navigate("/LOS/Lex/Processes");
    } catch (error) {
      toast.error(lexErrorMessage(error, t("proc.toast.deleteFailed"), errorsByCode));
    } finally {
      setBusy(false);
      setDeleteOpen(false);
    }
  };

  const openLineage = async () => {
    if (!process?.lineageId) return;
    try {
      setLineage(await getProcessLineage(process.lineageId));
      setLineageOpen(true);
    } catch (error) {
      toast.error(lexErrorMessage(error, t("proc.toast.lineageFailed"), errorsByCode));
    }
  };

  if (!canRead) return <PermissionDenied />;

  const verbChip = (verb: string, additional: boolean) => (
    <Badge
      key={verb}
      variant="outline"
      className={`border gap-1 font-medium ${
        forbiddenVerb(routingType, verb) ? TONES.red : TONES.sky
      }`}
    >
      {verb}
      {!readOnly && (
        <button
          type="button"
          aria-label={t("proc.actions.remove", { verb })}
          onClick={() =>
            additional
              ? setAdditionalActions(additionalActions.filter((v) => v !== verb))
              : setPrimaryActions(primaryActions.filter((v) => v !== verb))
          }
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );

  return (
    <div className="service">
      <LexPageHeader
        icon={Workflow}
        title={isNew ? t("proc.newTitle") : process?.title || t("proc.title")}
        subtitle={
          isNew
            ? t("proc.newSubtitle")
            : `${process?.referenceCode || ""} · v${process?.version ?? "—"}`
        }
      >
        <Button variant="ghost" className="h-10 gap-2" onClick={() => navigate("/LOS/Lex/Processes")}>
          <ArrowLeft className="h-4 w-4" />
          {t("common:back")}
        </Button>
        {!isNew && process && (
          <Button variant="outline" className="h-10 gap-2" onClick={openLineage}>
            <History className="h-4 w-4" />
            {t("proc.lineage")}
          </Button>
        )}
        {!isNew && process && !editable && canWrite && process.status === "PUBLISHED" && (
          <Button className="wallet-brand-btn h-10 gap-2" onClick={onClone} disabled={busy}>
            <Copy className="h-4 w-4" />
            {t("proc.clone")}
          </Button>
        )}
        {editable && canWrite && (
          <Button className="wallet-brand-btn h-10 gap-2" onClick={onSave} disabled={busy}>
            <Save className="h-4 w-4" />
            {t("common:save")}
          </Button>
        )}
        {!isNew && editable && canPublish && (
          <Button variant="outline" className="h-10 gap-2" onClick={() => setPublishOpen(true)}>
            <Send className="h-4 w-4" />
            {t("proc.publish")}
          </Button>
        )}
        {!isNew && process?.status === "PUBLISHED" && canWrite && (
          <Button variant="outline" className="h-10 gap-2" onClick={onArchive} disabled={busy}>
            <Archive className="h-4 w-4" />
            {t("proc.archive")}
          </Button>
        )}
        {!isNew && editable && canWrite && (
          <Button variant="ghost" className="h-10 gap-2" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            {t("proc.deleteDraft")}
          </Button>
        )}
      </LexPageHeader>

      {!isNew && process && !editable && (
        <LexNotice tone="slate" icon={Lock}>
          {process.status === "PUBLISHED" ? t("proc.readOnlyPublished") : t("proc.readOnlyArchived")}
        </LexNotice>
      )}

      {openDraftId && (
        <LexNotice tone="amber">
          <span>{t("proc.err.draftExists")} </span>
          <button
            type="button"
            className="underline"
            onClick={() => navigate(`/LOS/Lex/Processes/${openDraftId}`)}
          >
            {t("proc.openExistingDraft")}
          </button>
        </LexNotice>
      )}

      <div className="pro-card mb-3 p-4">
        <div className="mb-3 flex items-center gap-2">
          <LexStatusBadge status={isNew ? "DRAFT" : process?.status} />
          {process?.publishedAt && (
            <span className="text-xs text-muted-foreground">
              {t("proc.publishedAt", { at: formatDateTime(process.publishedAt) })}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lex-ref">{t("proc.field.referenceCode")}</Label>
            <Input
              id="lex-ref"
              className="h-10 font-mono text-xs"
              value={referenceCode}
              // Identity: ignored on update, so the field is disabled rather
              // than accepting an edit the server will silently drop.
              disabled={readOnly || !isNew}
              onChange={(e) => setReferenceCode(e.target.value)}
            />
            <p className="m-0 text-xs text-muted-foreground">
              {isNew
                ? t("proc.field.referenceCodeNormalized", {
                    code: referenceCode.trim().toUpperCase() || "—",
                  })
                : t("proc.field.referenceCodeLocked")}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lex-title">{t("proc.field.title")}</Label>
            <Input
              id="lex-title"
              className="h-10"
              value={title}
              disabled={readOnly}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lex-severity">{t("proc.field.severity")}</Label>
            <Select value={severity} onValueChange={setSeverity} disabled={readOnly}>
              <SelectTrigger id="lex-severity" className="w-full data-[size=default]:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Admins assume a lower-severity code was discarded. It is not —
                it stays on the case as secondary context. */}
            <p className="m-0 text-xs text-muted-foreground">{t("proc.field.severityHint")}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lex-routing">{t("proc.field.routing")}</Label>
            <Select value={routingType} onValueChange={setRoutingType} disabled={readOnly}>
              <SelectTrigger id="lex-routing" className="w-full data-[size=default]:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROUTING_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="m-0 text-xs text-muted-foreground">{t(`proc.routing.${routingType}`)}</p>
          </div>

          {/* Shown only where the server requires it. */}
          {needsPolicyParameter && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lex-param">{t("proc.field.policyParameter")} *</Label>
              <Select
                value={linkedPolicyParameter}
                onValueChange={setLinkedPolicyParameter}
                disabled={readOnly}
              >
                <SelectTrigger id="lex-param" className="w-full data-[size=default]:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POLICY_PARAMETERS.map((param) => (
                    <SelectItem key={param} value={param}>
                      {param}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="m-0 text-xs text-muted-foreground">
                {t("proc.field.policyParameterHint")}
              </p>
            </div>
          )}

          {/* Hidden entirely for APPLICATION_SOURCE, which must not carry one. */}
          {needsEvidence && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lex-evidence">{t("proc.field.evidence")} *</Label>
              <Select value={evidenceType} onValueChange={setEvidenceType} disabled={readOnly}>
                <SelectTrigger id="lex-evidence" className="w-full data-[size=default]:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVIDENCE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="m-0 text-xs text-muted-foreground">{t("proc.field.evidenceHint")}</p>
            </div>
          )}

          {noEvidence && (
            <div className="flex flex-col justify-end">
              <p className="m-0 text-xs text-muted-foreground">{t("proc.field.noEvidenceHint")}</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lex-effective">{t("proc.field.effectiveDate")}</Label>
            <Input
              id="lex-effective"
              type="date"
              className="h-10"
              value={effectiveDate}
              disabled={readOnly}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("proc.field.scope")}</Label>
            <div className="flex h-10 items-center rounded-lg border border-border bg-muted/30 px-3 text-sm">
              {/* The server built this label; assembling one from two nulls
                  risks disagreeing with what resolution actually used. */}
              {process?.scopes?.[0]?.describe ||
                `${process?.productName || t("scope.allProducts")} / ${
                  process?.sectorName || t("scope.allSectors")
                }`}
            </div>
            {/* Naming a Product always beats naming only a Sector. */}
            <p className="m-0 text-xs text-muted-foreground">{t("proc.field.scopeHint")}</p>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="lex-purpose">{t("proc.field.purpose")}</Label>
            <Textarea
              id="lex-purpose"
              rows={2}
              value={purpose}
              disabled={readOnly}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="lex-outcome">{t("proc.field.expectedOutcome")}</Label>
            <Textarea
              id="lex-outcome"
              rows={2}
              value={expectedOutcome}
              disabled={readOnly}
              onChange={(e) => setExpectedOutcome(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Execution steps — ordered, reorderable, renumbered on save. */}
      <div className="pro-card mb-3 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
            {t("proc.steps.title")}
          </h4>
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setSteps([...steps, { instruction: "", policyParameter: null }])}
            >
              <Plus className="h-4 w-4" />
              {t("proc.steps.add")}
            </Button>
          )}
        </div>

        {steps.length === 0 ? (
          <p className="m-0 py-6 text-center text-sm text-muted-foreground">{t("proc.steps.empty")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {steps.map((step, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-start gap-3">
                  <span className="mt-2 w-6 shrink-0 text-center text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr]">
                    <Input
                      className="h-9"
                      placeholder={t("proc.steps.instruction")}
                      value={step.instruction}
                      disabled={readOnly}
                      onChange={(e) => {
                        const next = [...steps];
                        next[index] = { ...step, instruction: e.target.value };
                        setSteps(next);
                      }}
                    />
                    <Select
                      value={step.policyParameter || "NONE"}
                      disabled={readOnly}
                      onValueChange={(v) => {
                        const next = [...steps];
                        next[index] = { ...step, policyParameter: v === "NONE" ? null : v };
                        setSteps(next);
                      }}
                    >
                      <SelectTrigger className="w-full data-[size=default]:h-9">
                        <SelectValue placeholder={t("proc.steps.policyParameter")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">{t("proc.steps.noParameter")}</SelectItem>
                        {POLICY_PARAMETERS.map((param) => (
                          <SelectItem key={param} value={param}>
                            {param}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {!readOnly && (
                    <div className="flex shrink-0 flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveStep(index, -1)}
                        disabled={index === 0}
                        aria-label={t("proc.steps.moveUp")}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveStep(index, 1)}
                        disabled={index === steps.length - 1}
                        aria-label={t("proc.steps.moveDown")}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSteps(steps.filter((_, i) => i !== index))}
                        aria-label={t("proc.steps.remove")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions. Free-form by design — nothing validates these against a
          catalogue, so a typo becomes a button label. Previously-used verbs are
          offered alongside free entry for exactly that reason. */}
      <div className="pro-card p-4">
        <h4 className="m-0 mb-3 text-sm font-semibold tracking-tight text-foreground">
          {t("proc.actions.title")}
        </h4>

        {offendingVerbs.length > 0 && (
          <LexNotice tone="red">
            {t("proc.actions.forbidden", { verbs: offendingVerbs.join(", ") })}
          </LexNotice>
        )}

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Label className="w-28">{t("proc.actions.primary")}</Label>
          {primaryActions.map((verb) => verbChip(verb, false))}
          {primaryActions.length === 0 && (
            <span className="text-xs text-muted-foreground">{t("proc.actions.none")}</span>
          )}
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Label className="w-28">{t("proc.actions.additional")}</Label>
          {additionalActions.map((verb) => verbChip(verb, true))}
          {additionalActions.length === 0 && (
            <span className="text-xs text-muted-foreground">{t("proc.actions.none")}</span>
          )}
        </div>

        {!readOnly && (
          <>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lex-verb">{t("proc.actions.add")}</Label>
                <Input
                  id="lex-verb"
                  className="h-9 w-56"
                  value={verbDraft}
                  onChange={(e) => setVerbDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addVerb(verbDraft)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => addVerb(verbDraft)}>
                {t("proc.actions.addPrimary")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => addVerb(verbDraft, true)}>
                {t("proc.actions.addAdditional")}
              </Button>
            </div>

            {suggestedVerbs.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">{t("proc.actions.suggested")}</span>
                {suggestedVerbs.map((verb) => (
                  <button
                    key={verb}
                    type="button"
                    className="rounded-full border border-border px-2.5 py-1 text-xs hover:bg-muted/40"
                    onClick={() => addVerb(verb)}
                  >
                    {verb}
                  </button>
                ))}
              </div>
            )}

            <LexNotice tone="slate" icon={Info} className="mt-3">
              {t("proc.actions.freeFormNote")}
            </LexNotice>
          </>
        )}
      </div>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>{t("proc.publishConfirm.title")}</DialogTitle>
            {/* The point of no return, stated plainly. */}
            <DialogDescription>{t("proc.publishConfirm.body")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setPublishOpen(false)} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn" onClick={onPublish} disabled={busy}>
              {t("proc.publish")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>{t("proc.deleteConfirm.title")}</DialogTitle>
            <DialogDescription>{t("proc.deleteConfirm.body")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button variant="destructive" onClick={onDeleteDraft} disabled={busy}>
              {t("proc.deleteDraft")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version lineage — one click from the detail screen, because it is how
          an auditor answers "what did this rule say in March?". */}
      <Dialog open={lineageOpen} onOpenChange={setLineageOpen}>
        <DialogContent className="pro-dialog sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle>{t("proc.lineageTitle")}</DialogTitle>
            <DialogDescription>{t("proc.lineageExplain")}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] overflow-y-auto pt-2">
            <LexVersionTimeline
              currentId={process?.id}
              emptyText={t("proc.lineageEmpty")}
              entries={[...lineage]
                .sort((a, b) => (b.version || 0) - (a.version || 0))
                .map((v) => ({
                  id: v.id,
                  version: v.version,
                  status: v.status,
                  at: v.publishedAt || v.updatedAt || v.createdAt,
                  by: v.publishedBy,
                }))}
              onSelect={(selectedId) => {
                setLineageOpen(false);
                navigate(`/LOS/Lex/Processes/${selectedId}`);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {isLoading && <p className="mt-3 text-sm text-muted-foreground">{t("common:loading")}</p>}
    </div>
  );
};

export default LexProcessDetail;
