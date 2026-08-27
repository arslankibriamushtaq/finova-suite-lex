import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  ArrowDown,
  ArrowUp,
  FileStack,
  GripVertical,
  OctagonAlert,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
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
import { EmptyState, PermissionDenied } from "../../../components/shared/detailKit";
import { TONES } from "../../../components/shared/detailKitUtils";
import { LexNotice, LexPageHeader } from "../../../components/shared/lexKit";
import { cn } from "../../../lib/utils";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { lexErrorMessage, logForbidden } from "../../../redux/apis/apisLexCore";
import {
  createDocumentType,
  getChecks,
  getDocumentTypeCatalogue,
  getDocumentTypes,
  getResolvedSequence,
  getTypeChecks,
  misorderedFinancialStep,
  putTypeChecks,
  updateDocumentType,
  type LexCheck,
  type LexDocumentType,
  type LexResolvedSequence,
  type LexTypeCheckStep,
} from "../../../redux/apis/apisLexDocuments";

const GROUP_TONE: Record<string, string> = {
  AUTHENTICITY: TONES.sky,
  FINANCIAL: TONES.emerald,
  FORENSIC: TONES.orange,
  SCORING: TONES.slate,
};

/**
 * The tri-state, as three values the form can hold. `blocking: null` is
 * "inherit the library check's own setting" and is a different statement from
 * "never halt" — which is why this is a select and not a switch.
 */
const BLOCKING_OPTIONS = ["INHERIT", "ALWAYS", "NEVER"] as const;

const blockingValue = (blocking?: boolean | null) =>
  blocking === true ? "ALWAYS" : blocking === false ? "NEVER" : "INHERIT";

const blockingFromValue = (value: string): boolean | null =>
  value === "ALWAYS" ? true : value === "NEVER" ? false : null;

/**
 * Document types, and for each type the sequence of checks that runs on it.
 *
 * The feature this screen exists for: before it, one sequence ran over every
 * document whatever it was, so a salary certificate was judged partly on a
 * closing balance it does not have and half the result was `NOT_RUN` rows that
 * people learn to skim — which is how a real finding gets skimmed too.
 *
 * Four things this screen takes as rules rather than preferences:
 *
 * - **The library is referenced, never copied.** The picker sources from
 *   `GET /documents/checks`; there is no "create a check for this type" here,
 *   because one `checkCode` must mean one thing wherever it is sequenced.
 * - **Save sends the whole list.** There is no add-one or reorder endpoint: a
 *   partial edit leaves the order ambiguous mid-write, and an ambiguous order
 *   makes an analysis non-reproducible.
 * - **`blocking` is tri-state.** Inherit / Always halt / Never halt. A checkbox
 *   cannot express inherit, and defaulting it off strips halting behaviour from
 *   checks that were meant to have it.
 * - **`source: TENANT_DEFAULT` is banner-worthy.** Fifteen checks look the same
 *   whether this type configured them or fell back to the company-wide list,
 *   and the difference is the whole point of the feature.
 *
 * There is no delete anywhere — a retired type keeps the meaning of every
 * analysis already filed under its code.
 */
const LexDocumentTypes = () => {
  const { t } = useTranslation("lex");
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.DOC_TYPE_READ);
  const canWrite = can(LEX_PERMISSIONS.DOC_TYPE_WRITE);

  const [types, setTypes] = useState<LexDocumentType[]>([]);
  /** The library. Loaded once — the picker and every row's decoration need it. */
  const [library, setLibrary] = useState<LexCheck[]>([]);
  /** What actually runs, per type code. Drives the count column and the banner. */
  const [resolved, setResolved] = useState<Record<string, LexResolvedSequence>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** The sequence being edited, held locally until Save sends all of it. */
  const [steps, setSteps] = useState<LexTypeCheckStep[]>([]);
  const [savedSteps, setSavedSteps] = useState<LexTypeCheckStep[]>([]);
  const [pickerCode, setPickerCode] = useState("");
  /** Row-level messages, keyed by check code — see TYPE_CHECK_UNKNOWN. */
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LexDocumentType | null>(null);
  const [typeCode, setTypeCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [codeError, setCodeError] = useState("");

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "COMMON.VALIDATION.FAILED": t("err.validation"),
      "LEX.DOCUMENT.TYPE_NOT_FOUND": t("dt.err.notFound"),
      "LEX.DOCUMENT.TYPE_DUPLICATE_CODE": t("dt.err.duplicateCode"),
      "LEX.DOCUMENT.TYPE_INVALID": t("dt.err.invalid"),
      "LEX.DOCUMENT.TYPE_DUPLICATE_ORDINAL": t("dt.err.duplicateOrdinal"),
    }),
    [t]
  );

  const byCode = useMemo(() => {
    const map = new Map<string, LexCheck>();
    for (const check of library) map.set(check.checkCode.toUpperCase(), check);
    return map;
  }, [library]);

  const selected = types.find((type) => type.id === selectedId) || null;
  const selectedResolved = selected ? resolved[selected.typeCode.toUpperCase()] : undefined;

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      const [list, checks] = await Promise.all([getDocumentTypes(), getChecks()]);
      setTypes(list);
      setLibrary([...checks].sort((a, b) => a.ordinal - b.ordinal));
      loadResolved(list);
      // Keep the open editor pointed at something that still exists.
      if (!list.some((type) => type.id === selectedId)) setSelectedId(list[0]?.id ?? null);
    } catch (error) {
      logForbidden(error, "GET /documents/types");
      toast.error(lexErrorMessage(error, t("dt.toast.loadFailed"), errorsByCode));
      setTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * The resolved sequence for every type, so the list can show the real count
   * and flag the unassigned ones in one pass rather than only on the detail
   * screen — an admin who has to open each type to find the gap will not.
   *
   * A failure here is not worth a toast: the count column simply stays empty
   * and the types themselves are still editable.
   */
  const loadResolved = async (list: LexDocumentType[]) => {
    const entries = await Promise.all(
      list.map(async (type) => {
        try {
          return [type.typeCode.toUpperCase(), await getResolvedSequence(type.typeCode)] as const;
        } catch {
          return null;
        }
      })
    );
    setResolved(Object.fromEntries(entries.filter(Boolean) as [string, LexResolvedSequence][]));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** The configured sequence — deactivated steps and all. This is the editor. */
  const loadSteps = async (documentTypeId: string) => {
    try {
      const rows = await getTypeChecks(documentTypeId);
      setSteps(rows);
      setSavedSteps(rows);
      setRowErrors({});
    } catch (error) {
      logForbidden(error, "GET /documents/types/{id}/checks");
      toast.error(lexErrorMessage(error, t("dt.toast.stepsFailed"), errorsByCode));
      setSteps([]);
      setSavedSteps([]);
    }
  };

  useEffect(() => {
    if (selectedId) loadSteps(selectedId);
    else {
      setSteps([]);
      setSavedSteps([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const dirty = useMemo(
    () =>
      JSON.stringify(
        steps.map((s) => [s.checkCode, s.blocking ?? null, s.active !== false])
      ) !==
      JSON.stringify(
        savedSteps.map((s) => [s.checkCode, s.blocking ?? null, s.active !== false])
      ),
    [steps, savedSteps]
  );

  /** The soft warning: an authenticity check is meant to gate the financial ones. */
  const misordered = useMemo(
    () => misorderedFinancialStep(steps.map((s) => byCode.get(s.checkCode.toUpperCase())?.group as string)),
    [steps, byCode]
  );

  const move = (from: number, to: number) =>
    setSteps((rows) => {
      if (to < 0 || to >= rows.length || from === to) return rows;
      const next = [...rows];
      const [row] = next.splice(from, 1);
      next.splice(to, 0, row);
      return next;
    });

  const addStep = () => {
    if (!pickerCode) return;
    setSteps((rows) => [...rows, { ordinal: rows.length + 1, checkCode: pickerCode, blocking: null }]);
    setPickerCode("");
  };

  const patchStep = (index: number, patch: Partial<LexTypeCheckStep>) =>
    setSteps((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const removeStep = (index: number) =>
    setSteps((rows) => rows.filter((_, i) => i !== index));

  /**
   * Save.
   *
   * Ordinals are re-indexed 1..n by the api module, so a drag never sends a gap.
   * The whole save is refused on the first bad step and nothing is written, so a
   * corrected retry is safe — there is no half-applied state to reconcile.
   */
  const onSave = async () => {
    if (!selected) return;
    if (steps.length === 0 && !clearConfirmOpen) return setClearConfirmOpen(true);

    setBusy(true);
    setRowErrors({});
    try {
      const rows = await putTypeChecks(selected.id, steps);
      setSteps(rows);
      setSavedSteps(rows);
      setClearConfirmOpen(false);
      toast.success(t("dt.toast.sequenceSaved"));
      // The confirm step: re-read what will actually run, so the banner and the
      // count reflect the save rather than the state before it.
      const next = await getResolvedSequence(selected.typeCode);
      setResolved((current) => ({ ...current, [selected.typeCode.toUpperCase()]: next }));
    } catch (error) {
      logForbidden(error, "PUT /documents/types/{id}/checks");
      applyRowError(error);
      toast.error(lexErrorMessage(error, t("dt.toast.sequenceFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  /**
   * Two of the sequence errors are about one row, and the server's message
   * carries the offending code. Pin the message to that row: a toast that names
   * a check in a list of fifteen leaves the user hunting for it.
   */
  const applyRowError = (error: unknown) => {
    const failure = error as { response?: { data?: { code?: string; message?: string } } };
    const code = failure?.response?.data?.code;
    if (code !== "LEX.DOCUMENT.TYPE_CHECK_UNKNOWN" && code !== "LEX.DOCUMENT.TYPE_DUPLICATE_CHECK") {
      return;
    }
    const message = failure?.response?.data?.message || "";
    const hit = steps.find((step) => message.toUpperCase().includes(step.checkCode.toUpperCase()));
    const label =
      code === "LEX.DOCUMENT.TYPE_CHECK_UNKNOWN" ? t("dt.err.checkUnknown") : t("dt.err.duplicateCheck");
    if (hit) setRowErrors({ [hit.checkCode.toUpperCase()]: label });
  };

  const openForm = (type?: LexDocumentType) => {
    setEditing(type || null);
    setTypeCode(type?.typeCode || "");
    setDisplayName(type?.displayName || "");
    setDescription(type?.description || "");
    setActive(type?.active ?? true);
    setCodeError("");
    setFormOpen(true);
  };

  const onSaveType = async () => {
    if (!editing && !typeCode.trim()) return setCodeError(t("dt.valid.code"));
    if (!displayName.trim()) return toast.error(t("dt.valid.name"));

    setBusy(true);
    setCodeError("");
    try {
      const body = {
        displayName: displayName.trim(),
        description: description.trim() || undefined,
        active,
      };
      if (editing) {
        // `typeCode` is deliberately not sent — the server ignores it and the
        // form shows it read-only, rather than pretending it can change.
        await updateDocumentType(editing.id, body);
      } else {
        const created = await createDocumentType({ ...body, typeCode: typeCode.trim() });
        setSelectedId(created.id);
      }
      toast.success(t("dt.toast.saved"));
      // The Send to Source picker caches this catalogue for the session.
      // Retiring a type here removes it from what underwriters may ask an
      // applicant for, so a stale cache would keep offering it.
      getDocumentTypeCatalogue(true).catch(() => undefined);
      setFormOpen(false);
      load();
    } catch (error) {
      logForbidden(error, "POST /documents/types");
      const failure = error as { response?: { data?: { code?: string } } };
      // Case-insensitive on the server: `bank_statement` collides with
      // `BANK_STATEMENT`, which is not obvious from the field alone.
      if (failure?.response?.data?.code === "LEX.DOCUMENT.TYPE_DUPLICATE_CODE") {
        setCodeError(t("dt.err.duplicateCode"));
      }
      toast.error(lexErrorMessage(error, t("dt.toast.saveFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  if (!canRead) return <PermissionDenied />;

  const usedCodes = new Set(steps.map((s) => s.checkCode.toUpperCase()));
  const available = library.filter((check) => check.active && !usedCodes.has(check.checkCode.toUpperCase()));

  return (
    <div className="service">
      <LexPageHeader icon={FileStack} title={t("dt.title")} subtitle={t("dt.subtitle")} />

      <div className="pro-card mb-3 p-3">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" className="gap-2" onClick={load} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common:refresh")}
          </Button>
          {canWrite && (
            <Button className="wallet-brand-btn gap-2" onClick={() => openForm()}>
              <Plus className="h-4 w-4" />
              {t("dt.new")}
            </Button>
          )}
        </div>
      </div>

      {/* Nothing exists until someone creates it, and a company with no types
          behaves exactly as it did before — one sequence over every document.
          That is worth saying here rather than leaving the screen blank. */}
      {!isLoading && types.length === 0 ? (
        <div className="pro-card p-4">
          <div className="py-8">
            <EmptyState icon={FileStack} text={t("dt.empty")} />
            <p className="mx-auto mt-3 max-w-xl text-center text-xs text-muted-foreground">
              {t("dt.emptyExplain")}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {/* ------------------------------ Types ------------------------- */}
          <div className="pro-card p-4">
            <h4 className="m-0 mb-3 text-sm font-semibold tracking-tight text-foreground">
              {t("dt.listTitle")}
            </h4>
            {types.map((type) => {
              const sequence = resolved[type.typeCode.toUpperCase()];
              const unassigned = sequence?.source === "TENANT_DEFAULT";
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedId(type.id)}
                  className={cn(
                    "pro-tile mb-2 w-full text-start last:mb-0",
                    type.id === selectedId && "ring-2 ring-primary/40",
                    !type.active && "opacity-60"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                      {type.displayName}
                    </span>
                    {!type.active && (
                      <Badge variant="outline" className={`border font-medium ${TONES.slate}`}>
                        {t("dt.inactive")}
                      </Badge>
                    )}
                    {canWrite && (
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={t("common:edit")}
                        className="text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          openForm(type);
                        }}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter" && e.key !== " ") return;
                          e.stopPropagation();
                          openForm(type);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="m-0 mt-1 truncate font-mono text-xs text-muted-foreground">
                    {type.typeCode}
                  </p>
                  {sequence && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`border font-medium ${unassigned ? TONES.amber : TONES.emerald}`}
                      >
                        {t("dt.checkCount", { count: sequence.checks.length })}
                      </Badge>
                      {/* Flagged in the list, not only on the detail screen. */}
                      {unassigned && (
                        <span className="text-xs text-amber-700 dark:text-amber-300">
                          {t("dt.unassigned")}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* ------------------------------ Sequence ---------------------- */}
          <div className="pro-card p-4 lg:col-span-2">
            {!selected ? (
              <EmptyState icon={FileStack} text={t("dt.selectType")} />
            ) : (
              <>
                {/* Title left, the two save controls right, and the step count
                    between them — an unsaved edit has to be visible from the
                    header or Save reads as disabled for no reason. */}
                <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border/60 pb-3">
                  <div className="min-w-0 flex-1 basis-56">
                    <h4 className="m-0 truncate text-sm font-semibold tracking-tight text-foreground">
                      {t("dt.sequenceFor", { name: selected.displayName })}
                    </h4>
                    <p className="m-0 mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      <span className="font-mono">{selected.typeCode}</span>
                      <span aria-hidden>·</span>
                      <span>{t("dt.stepCount", { count: steps.length })}</span>
                      {dirty && (
                        <Badge variant="outline" className={`border font-medium ${TONES.amber}`}>
                          {t("dt.unsaved")}
                        </Badge>
                      )}
                    </p>
                  </div>
                  {canWrite && (
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="ghost"
                        disabled={!dirty || busy}
                        onClick={() => {
                          setSteps(savedSteps);
                          setRowErrors({});
                        }}
                      >
                        {t("dt.discard")}
                      </Button>
                      <Button className="wallet-brand-btn" disabled={!dirty || busy} onClick={onSave}>
                        {t("dt.saveSequence")}
                      </Button>
                    </div>
                  )}
                </div>

                {/* The banner the resolved endpoint earns. Without it an admin
                    sees a configured-looking sequence they never configured. */}
                {selectedResolved?.source === "TENANT_DEFAULT" && (
                  <LexNotice tone="amber">
                    {t("dt.fallbackBanner", { count: selectedResolved.checks.length })}
                  </LexNotice>
                )}

                {misordered >= 0 && (
                  <LexNotice tone="amber">
                    {t("dt.misorderWarning", {
                      code: steps[misordered]?.checkCode,
                    })}
                  </LexNotice>
                )}

                {/* The halting rule, once, above the controls it governs —
                    the per-row hint below says how many checks each halt
                    would take with it. */}
                {steps.length > 0 && (
                  <p className="m-0 mb-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                    <OctagonAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    {t("dt.blockingWarning")}
                  </p>
                )}

                {steps.length === 0 ? (
                  <EmptyState icon={FileStack} text={t("dt.noSteps")} />
                ) : (
                  <ol className="m-0 mt-1 list-none p-0">
                    {steps.map((step, index) => {
                      const check = byCode.get(step.checkCode.toUpperCase());
                      const rowError = rowErrors[step.checkCode.toUpperCase()];
                      const inherited = check?.blocking;
                      const halts = step.blocking ?? inherited;
                      return (
                        <li
                          key={`${step.checkCode}-${index}`}
                          draggable={canWrite}
                          onDragStart={() => setDragIndex(index)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (dragIndex !== null) move(dragIndex, index);
                            setDragIndex(null);
                          }}
                          onDragEnd={() => setDragIndex(null)}
                          className={cn(
                            "relative flex items-stretch gap-3",
                            dragIndex === index && "opacity-50"
                          )}
                        >
                          {/* The thread that makes a list read as a sequence.
                              Drawn behind the numbers, not between the tiles,
                              so a wrapped row does not break the line. */}
                          {index > 0 && (
                            <span
                              aria-hidden
                              className="absolute start-3.5 top-0 h-4 w-px bg-border"
                            />
                          )}
                          {index < steps.length - 1 && (
                            <span
                              aria-hidden
                              className="absolute start-3.5 top-4 bottom-0 w-px bg-border"
                            />
                          )}

                          <span
                            className={cn(
                              "relative z-[1] mt-2 flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                              step.active === false
                                ? "bg-muted text-muted-foreground ring-1 ring-border"
                                : halts
                                  ? "bg-amber-500 text-white"
                                  : "bg-red-500 text-white"
                            )}
                          >
                            {index + 1}
                          </span>

                          <div
                            className={cn(
                              "pro-tile mb-2 min-w-0 flex-1",
                              step.active === false && "opacity-60",
                              rowError && "ring-1 ring-red-400"
                            )}
                          >
                            {/* Line one: what the check is, and what to do with
                                it. The title gets the width; the controls sit
                                at the end and never wrap into the name. */}
                            <div className="flex items-start gap-3">
                              {canWrite && (
                                <GripVertical
                                  className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-muted-foreground"
                                  aria-hidden
                                />
                              )}

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="m-0 min-w-0 truncate text-sm font-medium text-foreground">
                                    {/* A code with no library row is a step
                                        naming a check this company does not
                                        have — the save will say so, and until
                                        then the code is the honest label. */}
                                    {check?.displayName || step.checkCode}
                                  </p>
                                  {check?.group && (
                                    <Badge
                                      variant="outline"
                                      className={`border font-medium ${GROUP_TONE[String(check.group)] || TONES.slate}`}
                                    >
                                      {check.group}
                                    </Badge>
                                  )}
                                  {halts && step.active !== false && (
                                    <Badge
                                      variant="outline"
                                      className={`border gap-1 font-medium ${TONES.amber}`}
                                      title={t("dt.blockingWarning")}
                                    >
                                      <OctagonAlert className="h-3 w-3" />
                                      {t("chk.blocking")}
                                    </Badge>
                                  )}
                                  {step.active === false && (
                                    <Badge
                                      variant="outline"
                                      className={`border font-medium ${TONES.slate}`}
                                    >
                                      {t("dt.skipped")}
                                    </Badge>
                                  )}
                                </div>
                                <p className="m-0 mt-0.5 truncate font-mono text-xs text-muted-foreground">
                                  {step.checkCode}
                                  {check?.reasonCode ? " · " + check.reasonCode : ""}
                                </p>
                              </div>

                              {canWrite && (
                                <div className="flex shrink-0 items-center gap-1">
                                  <Switch
                                    checked={step.active !== false}
                                    onCheckedChange={(checked) =>
                                      patchStep(index, { active: checked })
                                    }
                                    aria-label={t("dt.stepActive")}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    aria-label={t("dt.moveUp")}
                                    disabled={index === 0}
                                    onClick={() => move(index, index - 1)}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    aria-label={t("dt.moveDown")}
                                    disabled={index === steps.length - 1}
                                    onClick={() => move(index, index + 1)}
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-red-600"
                                    aria-label={t("dt.removeStep")}
                                    onClick={() => removeStep(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Line two: the halting rule. It gets its own row
                                because it is a three-way choice with a label
                                worth reading, not a toggle to squeeze in beside
                                a name. */}
                            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 ps-7">
                              <Label className="text-xs text-muted-foreground">
                                {t("dt.onFailure")}
                              </Label>
                              {/* Tri-state. "Inherit" says what it resolves to,
                                  because the value is meaningless without it. */}
                              <Select
                                value={blockingValue(step.blocking)}
                                disabled={!canWrite}
                                onValueChange={(value) =>
                                  patchStep(index, { blocking: blockingFromValue(value) })
                                }
                              >
                                <SelectTrigger className="h-8 w-52 data-[size=default]:h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {BLOCKING_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option === "INHERIT"
                                        ? t("dt.blocking.inherit", {
                                            resolved: inherited
                                              ? t("dt.blocking.always")
                                              : t("dt.blocking.never"),
                                          })
                                        : t(`dt.blocking.${option.toLowerCase()}`)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {/* The consequence, on the row it applies to. */}
                              {halts && step.active !== false && (
                                <span className="text-xs text-amber-700 dark:text-amber-300">
                                  {t("dt.haltsHint", { count: steps.length - index - 1 })}
                                </span>
                              )}
                            </div>

                            {rowError && (
                              <p className="m-0 mt-2 text-xs text-red-600 dark:text-red-400">
                                {rowError}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}

                {/* The picker sources from the library and never authors into
                    it — see the note at the top of this file. */}
                {canWrite && (
                  <div className="mt-3 border-t border-border/60 pt-3">
                    <Label htmlFor="dt-picker" className="text-xs text-muted-foreground">
                      {t("dt.addCheck")}
                    </Label>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Select value={pickerCode} onValueChange={setPickerCode}>
                        <SelectTrigger
                          id="dt-picker"
                          className="min-w-0 flex-1 basis-56 data-[size=default]:h-10"
                        >
                          <SelectValue placeholder={t("dt.pickCheck")} />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Empty once every active check is sequenced — the
                              picker offers the library, and there is nothing
                              left of it to offer. */}
                          {available.length === 0 ? (
                            <div className="px-2 py-1.5 text-xs text-muted-foreground">
                              {t("dt.allChecksUsed")}
                            </div>
                          ) : (
                            available.map((check) => (
                              <SelectItem key={check.id} value={check.checkCode}>
                                {check.displayName} · {check.group}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        className="h-10 gap-2"
                        disabled={!pickerCode}
                        onClick={addStep}
                      >
                        <Plus className="h-4 w-4" />
                        {t("dt.add")}
                      </Button>
                    </div>
                    <p className="m-0 mt-2 text-xs text-muted-foreground">{t("dt.libraryNote")}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------ Type form ----------------------- */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="pro-dialog sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle>{editing ? t("dt.form.editTitle") : t("dt.form.newTitle")}</DialogTitle>
            <DialogDescription>{t("dt.form.explain")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dt-code">{t("dt.field.code")} *</Label>
              <Input
                id="dt-code"
                className="h-10 font-mono text-xs"
                value={typeCode}
                // Read-only when editing: the code is what analyses are filed
                // under, and the server ignores it on a PUT anyway.
                disabled={!!editing}
                onChange={(e) => setTypeCode(e.target.value.toUpperCase())}
              />
              {editing ? (
                <p className="m-0 text-xs text-muted-foreground">{t("dt.field.codeLocked")}</p>
              ) : (
                <p className="m-0 text-xs text-muted-foreground">{t("dt.field.codeHint")}</p>
              )}
              {codeError && <p className="m-0 text-xs text-red-600 dark:text-red-400">{codeError}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dt-name">{t("dt.field.name")} *</Label>
              <Input
                id="dt-name"
                className="h-10"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dt-desc">{t("dt.field.description")}</Label>
              <Textarea
                id="dt-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Retire, never delete: analyses filed under the code keep their
                meaning, the type just stops being offered. */}
            <div className="pro-tile flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Label htmlFor="dt-active">{t("dt.field.active")}</Label>
                <p className="m-0 mt-1 text-xs text-muted-foreground">{t("dt.field.activeHint")}</p>
              </div>
              <Switch id="dt-active" checked={active} onCheckedChange={setActive} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn" onClick={onSaveType} disabled={busy}>
              {t("common:save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clearing is allowed and means something specific — say which, rather
          than letting an empty list read as "no checks will run". */}
      <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>{t("dt.clear.title")}</DialogTitle>
            <DialogDescription>{t("dt.clear.explain")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setClearConfirmOpen(false)} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn" onClick={onSave} disabled={busy}>
              {t("dt.clear.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading && <p className="mt-3 text-sm text-muted-foreground">{t("common:loading")}</p>}
    </div>
  );
};

export default LexDocumentTypes;
