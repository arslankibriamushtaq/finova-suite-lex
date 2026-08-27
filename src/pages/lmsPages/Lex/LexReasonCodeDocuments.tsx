import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  ArrowDown,
  ArrowUp,
  ClipboardList,
  GripVertical,
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
import { LexNotice, LexPageHeader, LexSearch } from "../../../components/shared/lexKit";
import { cn } from "../../../lib/utils";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { lexErrorMessage, logForbidden } from "../../../redux/apis/apisLexCore";
import { getProcesses } from "../../../redux/apis/apisLexConfig";
import {
  getDocumentTypes,
  getReasonCodeDocuments,
  getReasonCodeSummaries,
  putReasonCodeDocuments,
  type LexDocumentType,
  type LexReasonCodeDocument,
  type LexReasonCodeSummary,
} from "../../../redux/apis/apisLexDocuments";

/**
 * One row of the left-hand list: a reason code, whether it has a checklist, and
 * whether the Agent Configurator has published a process for it.
 *
 * The two sources are joined rather than shown as two lists — an admin needs to
 * see the *gap*, and a gap is only visible when both sides are on one row.
 */
interface CodeRow {
  reasonCode: string;
  summary?: LexReasonCodeSummary;
  /** The published process' title, when the vocabulary could be read. */
  title?: string;
  severity?: string;
}

const SEVERITY_TONE: Record<string, string> = {
  CRITICAL: TONES.red,
  HIGH: TONES.orange,
  MEDIUM: TONES.amber,
  LOW: TONES.slate,
};

/**
 * Reason code checklists — which documents a finding asks for.
 *
 * The screen that answers *"an application came back with `DBR_LIMIT_BREACHED`,
 * what do we ask the applicant for?"*. Before it, the answer lived in an
 * underwriter's head: two people looking at the same finding asked for different
 * things, and neither decision was reviewable afterwards.
 *
 * Four things this screen takes as rules rather than preferences:
 *
 * - **Unmapped codes are the point.** The endpoint returns only codes that have
 *   a checklist, so the list is joined against the Agent Configurator's
 *   published codes. A list of only the mapped ones hides exactly the thing that
 *   needs attention.
 * - **`mandatory` defaults to CHECKED.** Backwards means a case comes back
 *   without a document the underwriter was waiting for, and the only symptom is
 *   a case sitting for days.
 * - **The note is per code, not per type.** The catalogue's description says
 *   what a bank statement is; the note says what *this finding* needs from it.
 *   The description is the placeholder so the author can see what they are
 *   adding to.
 * - **Save sends the whole list**, ordinals re-indexed 1..n — the same contract
 *   as the type sequence editor, refused whole on the first bad entry.
 *
 * There is no "create a reason code": a checklist exists by having documents,
 * and disappears by having none.
 */
const LexReasonCodeDocuments = () => {
  const { t } = useTranslation("lex");
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.REASON_CODE_DOC_READ);
  const canWrite = can(LEX_PERMISSIONS.REASON_CODE_DOC_WRITE);

  const [summaries, setSummaries] = useState<LexReasonCodeSummary[]>([]);
  /** The Agent Configurator's vocabulary. Null when it could not be read. */
  const [vocabulary, setVocabulary] = useState<CodeRow[] | null>(null);
  const [catalogue, setCatalogue] = useState<LexDocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [showUnmapped, setShowUnmapped] = useState(true);

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  /** The checklist being edited, held locally until Save sends all of it. */
  const [rows, setRows] = useState<LexReasonCodeDocument[]>([]);
  const [savedRows, setSavedRows] = useState<LexReasonCodeDocument[]>([]);
  const [pickerCode, setPickerCode] = useState("");
  /** Row-level messages, keyed by type code — see REASON_CODE_TYPE_UNKNOWN. */
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [newCode, setNewCode] = useState("");

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "COMMON.VALIDATION.FAILED": t("err.validation"),
      "LEX.DOCUMENT.REASON_CODE_TYPE_UNKNOWN": t("rcd.err.typeUnknown"),
      "LEX.DOCUMENT.REASON_CODE_DUPLICATE_TYPE": t("rcd.err.duplicateType"),
      "LEX.DOCUMENT.REASON_CODE_DUPLICATE_ORDINAL": t("rcd.err.duplicateOrdinal"),
      "LEX.DOCUMENT.REASON_CODE_INVALID": t("rcd.err.invalid"),
    }),
    [t]
  );

  const byTypeCode = useMemo(() => {
    const map = new Map<string, LexDocumentType>();
    for (const type of catalogue) map.set(type.typeCode.toUpperCase(), type);
    return map;
  }, [catalogue]);

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      const [list, types] = await Promise.all([getReasonCodeSummaries(), getDocumentTypes()]);
      setSummaries(list);
      setCatalogue(types);
      if (!list.some((row) => row.reasonCode === selectedCode)) {
        setSelectedCode(list[0]?.reasonCode ?? null);
      }
    } catch (error) {
      logForbidden(error, "GET /documents/reason-codes");
      toast.error(lexErrorMessage(error, t("rcd.toast.loadFailed"), errorsByCode));
      setSummaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * The published vocabulary, best-effort.
   *
   * It comes from lex-config-service and needs `LEX_CONFIG_READ`, which a
   * documents administrator may not hold. A failure is not worth a toast: the
   * list falls back to the mapped codes alone, and the screen says the join is
   * unavailable rather than implying every code is mapped.
   */
  const loadVocabulary = async () => {
    try {
      const page = await getProcesses({ status: "PUBLISHED", size: 200 });
      setVocabulary(
        (page.content || []).map((process) => ({
          reasonCode: process.referenceCode,
          title: process.title,
          severity: String(process.severity || ""),
        }))
      );
    } catch (error) {
      logForbidden(error, "GET /config/processes");
      setVocabulary(null);
    }
  };

  useEffect(() => {
    load();
    loadVocabulary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRows = async (reasonCode: string) => {
    try {
      const list = await getReasonCodeDocuments(reasonCode);
      setRows(list);
      setSavedRows(list);
      setRowErrors({});
    } catch (error) {
      logForbidden(error, "GET /documents/reason-codes/{code}/documents");
      toast.error(lexErrorMessage(error, t("rcd.toast.checklistFailed"), errorsByCode));
      setRows([]);
      setSavedRows([]);
    }
  };

  useEffect(() => {
    if (selectedCode) loadRows(selectedCode);
    else {
      setRows([]);
      setSavedRows([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCode]);

  /**
   * The joined list. Every mapped code, plus every published code that has no
   * checklist — the unmapped ones are the gap, so they are not filtered out by
   * default.
   */
  const codeRows = useMemo(() => {
    const byCode = new Map<string, CodeRow>();
    for (const entry of vocabulary || []) byCode.set(entry.reasonCode, { ...entry });
    for (const summary of summaries) {
      byCode.set(summary.reasonCode, {
        ...byCode.get(summary.reasonCode),
        reasonCode: summary.reasonCode,
        summary,
      });
    }
    const term = search.trim().toUpperCase();
    return [...byCode.values()]
      .filter((row) => (showUnmapped ? true : !!row.summary))
      .filter(
        (row) =>
          !term ||
          row.reasonCode.toUpperCase().includes(term) ||
          (row.title || "").toUpperCase().includes(term)
      )
      .sort((a, b) => a.reasonCode.localeCompare(b.reasonCode));
  }, [summaries, vocabulary, search, showUnmapped]);

  const unmappedCount = useMemo(
    () => (vocabulary || []).filter((entry) => !summaries.some((s) => s.reasonCode === entry.reasonCode)).length,
    [vocabulary, summaries]
  );

  const selected = selectedCode ? codeRows.find((row) => row.reasonCode === selectedCode) : null;

  const dirty = useMemo(
    () =>
      JSON.stringify(
        rows.map((r) => [r.typeCode, r.mandatory !== false, r.note?.trim() || "", r.active !== false])
      ) !==
      JSON.stringify(
        savedRows.map((r) => [r.typeCode, r.mandatory !== false, r.note?.trim() || "", r.active !== false])
      ),
    [rows, savedRows]
  );

  const move = (from: number, to: number) =>
    setRows((list) => {
      if (to < 0 || to >= list.length || from === to) return list;
      const next = [...list];
      const [row] = next.splice(from, 1);
      next.splice(to, 0, row);
      return next;
    });

  /**
   * Adding a line pre-fills nothing into the note — the type's description is
   * the *placeholder*, not the value. Copying it in would make every checklist
   * repeat what the catalogue already says, and hide the moment the admin has
   * nothing finding-specific to add.
   */
  const addRow = () => {
    if (!pickerCode) return;
    setRows((list) => [
      ...list,
      // Mandatory, deliberately: a document nobody marked is one that is needed.
      { ordinal: list.length + 1, typeCode: pickerCode, mandatory: true, note: "" },
    ]);
    setPickerCode("");
  };

  const patchRow = (index: number, patch: Partial<LexReasonCodeDocument>) =>
    setRows((list) => list.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const removeRow = (index: number) => setRows((list) => list.filter((_, i) => i !== index));

  /**
   * Save.
   *
   * The whole save is refused on the first bad entry and nothing is written, so
   * a corrected retry is safe — there is no half-applied state to reconcile.
   */
  const onSave = async () => {
    if (!selectedCode) return;
    if (rows.length === 0 && !clearConfirmOpen) return setClearConfirmOpen(true);

    setBusy(true);
    setRowErrors({});
    try {
      const saved = await putReasonCodeDocuments(selectedCode, rows);
      setRows(saved);
      setSavedRows(saved);
      setClearConfirmOpen(false);
      toast.success(t("rcd.toast.saved"));
      // The counts on the left are now stale, and clearing a checklist removes
      // the code from the mapped list entirely.
      const list = await getReasonCodeSummaries();
      setSummaries(list);
    } catch (error) {
      logForbidden(error, "PUT /documents/reason-codes/{code}/documents");
      applyRowError(error);
      toast.error(lexErrorMessage(error, t("rcd.toast.saveFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  /**
   * Two of the save errors are about one row, and the server's message carries
   * the offending type code. Pin the message to that row: a toast naming a
   * document in a list of six leaves the user hunting for it.
   */
  const applyRowError = (error: unknown) => {
    const failure = error as { response?: { data?: { code?: string; message?: string } } };
    const code = failure?.response?.data?.code;
    if (
      code !== "LEX.DOCUMENT.REASON_CODE_TYPE_UNKNOWN" &&
      code !== "LEX.DOCUMENT.REASON_CODE_DUPLICATE_TYPE"
    ) {
      return;
    }
    const message = (failure?.response?.data?.message || "").toUpperCase();
    const hit = rows.find((row) => message.includes(row.typeCode.toUpperCase()));
    const label =
      code === "LEX.DOCUMENT.REASON_CODE_TYPE_UNKNOWN"
        ? t("rcd.err.typeUnknown")
        : t("rcd.err.duplicateType");
    if (hit) setRowErrors({ [hit.typeCode.toUpperCase()]: label });
  };

  /**
   * "Map another code" — free text on purpose. The reason code is not a hard
   * reference, so a company may decide what a finding needs before the Agent
   * Configurator has published the process for it.
   */
  const onAddCode = () => {
    const code = newCode.trim().toUpperCase().replace(/[\s-]+/g, "_");
    if (!code) return;
    setSelectedCode(code);
    // Nothing is written until the first Save — a code with no documents does
    // not exist, which is the same statement the index makes.
    setRows([]);
    setSavedRows([]);
    setRowErrors({});
    setAddOpen(false);
    setNewCode("");
  };

  if (!canRead) return <PermissionDenied />;

  const usedCodes = new Set(rows.map((row) => row.typeCode.toUpperCase()));
  const available = catalogue.filter(
    (type) => type.active && !usedCodes.has(type.typeCode.toUpperCase())
  );
  const mandatoryCount = rows.filter((row) => row.mandatory !== false && row.active !== false).length;

  return (
    <div className="service">
      <LexPageHeader icon={ClipboardList} title={t("rcd.title")} subtitle={t("rcd.subtitle")} />

      <div className="pro-card mb-3 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <LexSearch
            value={search}
            onChange={setSearch}
            placeholder={t("rcd.searchPlaceholder")}
            className="min-w-0 flex-1 basis-56"
          />
          <div className="flex items-center gap-2">
            <Switch
              id="rcd-unmapped"
              checked={showUnmapped}
              onCheckedChange={setShowUnmapped}
              disabled={vocabulary === null}
            />
            <Label htmlFor="rcd-unmapped" className="text-xs text-muted-foreground">
              {t("rcd.showUnmapped")}
            </Label>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              load();
              loadVocabulary();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common:refresh")}
          </Button>
          {canWrite && (
            <Button className="wallet-brand-btn gap-2" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("rcd.mapCode")}
            </Button>
          )}
        </div>
      </div>

      {/* The join is the useful screen; say so when it could not be made rather
          than showing the mapped codes as if they were all of them. */}
      {vocabulary === null && <LexNotice tone="slate">{t("rcd.vocabularyUnavailable")}</LexNotice>}
      {vocabulary !== null && unmappedCount > 0 && (
        <LexNotice tone="amber">{t("rcd.unmappedBanner", { count: unmappedCount })}</LexNotice>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* ------------------------------ Codes -------------------------- */}
        <div className="pro-card p-4">
          <h4 className="m-0 mb-3 flex items-center justify-between gap-2 text-sm font-semibold tracking-tight text-foreground">
            {t("rcd.listTitle")}
            <span className="font-normal text-xs text-muted-foreground">{codeRows.length}</span>
          </h4>
          {/* The join is every published code plus every mapped one — hundreds
              on a real tenant. The list scrolls inside the card so the editor
              beside it stays where the admin left it. */}
          <div className="max-h-[55vh] overflow-y-auto pe-1">
            {codeRows.length === 0 ? (
              <div className="py-6">
                <EmptyState icon={ClipboardList} text={t("rcd.empty")} />
                <p className="mx-auto mt-3 max-w-xs text-center text-xs text-muted-foreground">
                  {t("rcd.emptyExplain")}
                </p>
              </div>
            ) : (
              codeRows.map((row) => {
                const mapped = !!row.summary;
                return (
                  <button
                    key={row.reasonCode}
                    type="button"
                    onClick={() => setSelectedCode(row.reasonCode)}
                    className={cn(
                      "pro-tile mb-2 w-full text-start last:mb-0",
                      row.reasonCode === selectedCode && "ring-2 ring-primary/40"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="min-w-0 flex-1 truncate font-mono text-xs font-medium text-foreground">
                        {row.reasonCode}
                      </span>
                      {row.severity && (
                        <Badge
                          variant="outline"
                          className={`border font-medium ${SEVERITY_TONE[row.severity] || TONES.slate}`}
                        >
                          {row.severity}
                        </Badge>
                      )}
                    </div>
                    {row.title && (
                      <p className="m-0 mt-1 truncate text-sm text-muted-foreground">{row.title}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {mapped ? (
                        <>
                          <Badge variant="outline" className={`border font-medium ${TONES.emerald}`}>
                            {t("rcd.documentCount", { count: row.summary?.documentCount ?? 0 })}
                          </Badge>
                          {/* Counted apart from the total: this is the number
                              that actually gates a case coming back. */}
                          <Badge variant="outline" className={`border font-medium ${TONES.sky}`}>
                            {t("rcd.mandatoryCount", { count: row.summary?.mandatoryCount ?? 0 })}
                          </Badge>
                        </>
                      ) : (
                        <span className="text-xs text-amber-700 dark:text-amber-300">
                          {t("rcd.unmapped")}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ------------------------------ Checklist ---------------------- */}
        <div className="pro-card p-4 lg:col-span-2">
          {!selectedCode ? (
            <EmptyState icon={ClipboardList} text={t("rcd.selectCode")} />
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border/60 pb-3">
                <div className="min-w-0 flex-1 basis-56">
                  <h4 className="m-0 truncate text-sm font-semibold tracking-tight text-foreground">
                    {t("rcd.checklistFor")}
                  </h4>
                  <p className="m-0 mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span className="font-mono">{selectedCode}</span>
                    <span aria-hidden>·</span>
                    <span>{t("rcd.rowCount", { count: rows.length })}</span>
                    <span aria-hidden>·</span>
                    <span>{t("rcd.mandatoryCount", { count: mandatoryCount })}</span>
                    {dirty && (
                      <Badge variant="outline" className={`border font-medium ${TONES.amber}`}>
                        {t("rcd.unsaved")}
                      </Badge>
                    )}
                  </p>
                  {selected?.title && (
                    <p className="m-0 mt-1 truncate text-xs text-muted-foreground">
                      {selected.title}
                    </p>
                  )}
                </div>
                {canWrite && (
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="ghost"
                      disabled={!dirty || busy}
                      onClick={() => {
                        setRows(savedRows);
                        setRowErrors({});
                      }}
                    >
                      {t("rcd.discard")}
                    </Button>
                    <Button className="wallet-brand-btn" disabled={!dirty || busy} onClick={onSave}>
                      {t("rcd.saveChecklist")}
                    </Button>
                  </div>
                )}
              </div>

              {/* A code with no checklist asks for nothing. That is the
                  behaviour from before this screen existed — worth stating,
                  because a blank panel reads as "not loaded". */}
              {rows.length === 0 ? (
                <div className="py-4">
                  <EmptyState icon={ClipboardList} text={t("rcd.noDocuments")} />
                  <p className="mx-auto mt-3 max-w-md text-center text-xs text-muted-foreground">
                    {t("rcd.noDocumentsExplain")}
                  </p>
                </div>
              ) : (
                <ol className="m-0 mt-1 list-none p-0">
                  {rows.map((row, index) => {
                    const type = byTypeCode.get(row.typeCode.toUpperCase());
                    const rowError = rowErrors[row.typeCode.toUpperCase()];
                    const mandatory = row.mandatory !== false;
                    return (
                      <li
                        key={`${row.typeCode}-${index}`}
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
                        {/* The thread that makes a list read as an ordered
                            checklist — the applicant sees this order. */}
                        {index > 0 && (
                          <span aria-hidden className="absolute start-3.5 top-0 h-4 w-px bg-border" />
                        )}
                        {index < rows.length - 1 && (
                          <span
                            aria-hidden
                            className="absolute start-3.5 top-4 bottom-0 w-px bg-border"
                          />
                        )}

                        <span
                          className={cn(
                            "relative z-[1] mt-2 flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                            row.active === false
                              ? "bg-muted text-muted-foreground ring-1 ring-border"
                              : mandatory
                                ? "bg-sky-500 text-white"
                                : "bg-slate-400 text-white"
                          )}
                        >
                          {index + 1}
                        </span>

                        <div
                          className={cn(
                            "pro-tile mb-2 min-w-0 flex-1",
                            row.active === false && "opacity-60",
                            rowError && "ring-1 ring-red-400"
                          )}
                        >
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
                                  {/* A code with no catalogue row names a type
                                      this company does not have — the save will
                                      say so, and until then the code is the
                                      honest label. */}
                                  {type?.displayName || row.typeCode}
                                </p>
                                <Badge
                                  variant="outline"
                                  className={`border font-medium ${mandatory ? TONES.sky : TONES.slate}`}
                                >
                                  {mandatory ? t("rcd.mandatory") : t("rcd.optional")}
                                </Badge>
                                {row.active === false && (
                                  <Badge
                                    variant="outline"
                                    className={`border font-medium ${TONES.slate}`}
                                  >
                                    {t("rcd.skipped")}
                                  </Badge>
                                )}
                                {type && !type.active && (
                                  <Badge
                                    variant="outline"
                                    className={`border font-medium ${TONES.amber}`}
                                  >
                                    {t("rcd.typeRetired")}
                                  </Badge>
                                )}
                              </div>
                              <p className="m-0 mt-0.5 truncate font-mono text-xs text-muted-foreground">
                                {row.typeCode}
                              </p>
                            </div>

                            {canWrite && (
                              <div className="flex shrink-0 items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  aria-label={t("rcd.moveUp")}
                                  disabled={index === 0}
                                  onClick={() => move(index, index - 1)}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  aria-label={t("rcd.moveDown")}
                                  disabled={index === rows.length - 1}
                                  onClick={() => move(index, index + 1)}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground hover:text-red-600"
                                  aria-label={t("rcd.removeRow")}
                                  onClick={() => removeRow(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 ps-7">
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`rcd-mandatory-${index}`}
                                checked={mandatory}
                                disabled={!canWrite}
                                onCheckedChange={(checked) =>
                                  patchRow(index, { mandatory: checked })
                                }
                              />
                              <Label
                                htmlFor={`rcd-mandatory-${index}`}
                                className="text-xs text-muted-foreground"
                              >
                                {t("rcd.field.mandatory")}
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`rcd-active-${index}`}
                                checked={row.active !== false}
                                disabled={!canWrite}
                                onCheckedChange={(checked) => patchRow(index, { active: checked })}
                              />
                              <Label
                                htmlFor={`rcd-active-${index}`}
                                className="text-xs text-muted-foreground"
                              >
                                {t("rcd.field.active")}
                              </Label>
                            </div>
                          </div>

                          {/* The note. The type's description is the
                              placeholder, never the value — so the author can
                              see what they are adding to rather than repeating
                              it. */}
                          <div className="mt-2 ps-7">
                            <Label
                              htmlFor={`rcd-note-${index}`}
                              className="text-xs text-muted-foreground"
                            >
                              {t("rcd.field.note")}
                            </Label>
                            <Textarea
                              id={`rcd-note-${index}`}
                              rows={2}
                              className="mt-1 text-sm"
                              disabled={!canWrite}
                              placeholder={type?.description || t("rcd.field.notePlaceholder")}
                              value={row.note || ""}
                              onChange={(e) => patchRow(index, { note: e.target.value })}
                            />
                          </div>

                          {rowError && (
                            <p className="m-0 mt-2 ps-7 text-xs text-red-600 dark:text-red-400">
                              {rowError}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}

              {/* The picker sources from the type catalogue and never authors
                  into it — a request for a document nobody defined is one the
                  applicant cannot satisfy. */}
              {canWrite && (
                <div className="mt-3 border-t border-border/60 pt-3">
                  <Label htmlFor="rcd-picker" className="text-xs text-muted-foreground">
                    {t("rcd.addDocument")}
                  </Label>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Select value={pickerCode} onValueChange={setPickerCode}>
                      <SelectTrigger
                        id="rcd-picker"
                        className="min-w-0 flex-1 basis-56 data-[size=default]:h-10"
                      >
                        <SelectValue placeholder={t("rcd.pickType")} />
                      </SelectTrigger>
                      <SelectContent>
                        {available.length === 0 ? (
                          <div className="px-2 py-1.5 text-xs text-muted-foreground">
                            {catalogue.length === 0 ? t("rcd.noTypes") : t("rcd.allTypesUsed")}
                          </div>
                        ) : (
                          available.map((type) => (
                            <SelectItem key={type.id} value={type.typeCode}>
                              {type.displayName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      className="h-10 gap-2"
                      disabled={!pickerCode}
                      onClick={addRow}
                    >
                      <Plus className="h-4 w-4" />
                      {t("rcd.add")}
                    </Button>
                  </div>
                  <p className="m-0 mt-2 text-xs text-muted-foreground">{t("rcd.catalogueNote")}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ------------------------------ Map a code ---------------------- */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>{t("rcd.map.title")}</DialogTitle>
            <DialogDescription>{t("rcd.map.explain")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rcd-new-code">{t("rcd.field.reasonCode")} *</Label>
            <Input
              id="rcd-new-code"
              className="h-10 font-mono text-xs"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") onAddCode();
              }}
            />
            <p className="m-0 text-xs text-muted-foreground">{t("rcd.field.reasonCodeHint")}</p>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn" onClick={onAddCode} disabled={!newCode.trim()}>
              {t("rcd.map.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clearing is allowed and means something specific — say which, rather
          than letting an empty list read as a delete. */}
      <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>{t("rcd.clear.title")}</DialogTitle>
            <DialogDescription>
              {t("rcd.clear.explain", { code: selectedCode || "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setClearConfirmOpen(false)} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn" onClick={onSave} disabled={busy}>
              {t("rcd.clear.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading && <p className="mt-3 text-sm text-muted-foreground">{t("common:loading")}</p>}
    </div>
  );
};

export default LexReasonCodeDocuments;
