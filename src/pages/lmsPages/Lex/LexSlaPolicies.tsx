import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Archive,
  Copy,
  History,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Send,
  Timer,
  Trash2,
  X,
} from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
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
import { formatDateTime } from "../../../components/shared/detailKitUtils";
import {
  LexNotice,
  LexPageHeader,
  LexProductSelect,
  LexScope,
  LexSectorSelect,
  LexStatusBadge,
  LexVersionTimeline,
} from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { emptyPage, isEditable, lexErrorCode, lexErrorMessage, logForbidden, type LexPage } from "../../../redux/apis/apisLexCore";
import {
  SLA_STAGE_CODES,
  archiveSlaPolicy,
  cloneSlaPolicy,
  createSlaPolicy,
  deleteSlaDraft,
  formatMinutes,
  getSlaLineage,
  getSlaPolicies,
  getScopeProducts,
  getSectors,
  getSlaPolicy,
  hoursToMinutes,
  minutesToHours,
  publishSlaPolicy,
  resolveThresholds,
  slaPercentProblem,
  updateSlaPolicy,
  type LexScopeProduct,
  type LexSector,
  type LexSlaPolicy,
  type LexSlaStage,
} from "../../../redux/apis/apisLexConfig";

/**
 * One stage's three thresholds on a single scale.
 *
 * They are only meaningful in relation to each other, and the near/critical
 * numbers are *derived* from the policy percentages rather than typed per
 * stage — so this is the only place the relationship is visible while editing.
 *
 * The minutes come from the server on read (`nearBreachMinutes`,
 * `criticalBreachMinutes`); the resolved fallback covers the gap between typing
 * a percentage and saving. Never a bare percentage — the board reports minutes.
 */
const ThresholdScale = ({
  stage,
  nearBreachPercent,
  criticalBreachPercent,
}: {
  stage: LexSlaStage;
  nearBreachPercent: number;
  criticalBreachPercent: number;
}) => {
  const resolved = resolveThresholds(stage.targetMinutes, nearBreachPercent, criticalBreachPercent);
  const near = stage.nearBreachMinutes ?? resolved.nearBreachMinutes;
  const critical = stage.criticalBreachMinutes ?? resolved.criticalBreachMinutes;
  const max = Math.max(critical, stage.targetMinutes || 0, 1);
  const pct = (value: number) => `${Math.min(100, Math.max(0, (value / max) * 100))}%`;

  return (
    <div className="mt-2">
      <div className="relative h-2 w-full rounded-full bg-muted">
        <div
          className="absolute inset-y-0 start-0 rounded-full bg-emerald-500/60"
          style={{ width: pct(near) }}
        />
        <div
          className="absolute inset-y-0 rounded-full bg-amber-500/60"
          style={{ insetInlineStart: pct(near), width: `calc(${pct(critical)} - ${pct(near)})` }}
        />
        <div
          className="absolute inset-y-0 end-0 rounded-full bg-red-500/50"
          style={{ insetInlineStart: pct(critical) }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>{formatMinutes(near)}</span>
        <span>{formatMinutes(stage.targetMinutes)}</span>
        <span>{formatMinutes(critical)}</span>
      </div>
    </div>
  );
};

/**
 * SLA policies — a scope plus a set of stage targets, on the configurator's
 * usual draft/publish/clone lifecycle.
 *
 * Durations are entered in hours because nobody thinks in 2880 minutes, but the
 * stored minutes stay visible next to every input: minutes are what the SLA
 * board reports, and a mismatch between the two screens is what confuses people.
 */
const LexSlaPolicies = () => {
  const { t } = useTranslation("lex");
  // Ungated while the LEX permission codes are unregistered — see useLexAccess.
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.SLA_CONFIG_READ);
  const canWrite = can(LEX_PERMISSIONS.SLA_CONFIG_WRITE);
  const canPublish = can(LEX_PERMISSIONS.SLA_CONFIG_PUBLISH);

  const [result, setResult] = useState<LexPage<LexSlaPolicy>>(emptyPage<LexSlaPolicy>());
  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState("ALL");

  const [editing, setEditing] = useState<LexSlaPolicy | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [policyName, setPolicyName] = useState("");
  const [stages, setStages] = useState<LexSlaStage[]>([]);
  const [nearBreachPercent, setNearBreachPercent] = useState(75);
  const [criticalBreachPercent, setCriticalBreachPercent] = useState(90);
  const [effectiveDate, setEffectiveDate] = useState("");

  const [lineage, setLineage] = useState<LexSlaPolicy[]>([]);
  const [lineageOpen, setLineageOpen] = useState(false);

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "COMMON.VALIDATION.FAILED": t("err.validation"),
      "LEX.SLA.OPEN_DRAFT_EXISTS": t("sla.err.draftExists"),
      "LEX.SLA.NOT_EDITABLE": t("sla.err.notEditable"),
      "LEX.SLA.NOT_PUBLISHED": t("sla.err.notPublished"),
      "LEX.SLA.NOT_FOUND": t("sla.err.notFound"),
      "LEX.SLA.INVALID": t("sla.err.invalid"),
      // Raised on save when a scope names a sector this company does not have
      // or one since deactivated. Unreachable if the picker is fresh — seeing
      // it means the sector list is stale.
      "LEX.SECTOR.UNKNOWN_SCOPE": t("sector.err.unknownScope"),
    }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      setResult(
        await getSlaPolicies({ page, size: pageSize, status: status === "ALL" ? undefined : status })
      );
    } catch (error) {
      logForbidden(error, "GET /config/sla");
      toast.error(lexErrorMessage(error, t("sla.toast.loadFailed"), errorsByCode));
      setResult(emptyPage<LexSlaPolicy>(pageSize));
    } finally {
      setIsLoading(false);
    }
  };

  /** Scope: `null` on either half is the "All" wildcard the API expects. */
  const [productId, setProductId] = useState<string | null>(null);
  const [sectorId, setSectorId] = useState<string | null>(null);
  const [products, setProducts] = useState<LexScopeProduct[]>([]);
  const [sectors, setSectors] = useState<LexSector[]>([]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status]);

  // Both halves of the scope are data: sectors are governed in LEX, products
  // come from LOS. Neither may be hardcoded.
  useEffect(() => {
    if (!canRead) return;
    getSectors()
      .then(setSectors)
      .catch(() => setSectors([]));
    getScopeProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [canRead]);

  const editable = !editing || isEditable(editing);
  const readOnly = !editable || !canWrite;

  const openPolicy = async (row: LexSlaPolicy) => {
    try {
      const full = await getSlaPolicy(row.id);
      setEditing(full);
      setPolicyName(full.policyName || "");
      setProductId(full.productId ?? null);
      setSectorId(full.sectorId ?? null);
      setStages([...(full.stages || [])].sort((a, b) => a.ordinal - b.ordinal));
      setNearBreachPercent(full.nearBreachPercent ?? 75);
      setCriticalBreachPercent(full.criticalBreachPercent ?? 90);
      setEffectiveDate(full.effectiveDate || "");
      setFormOpen(true);
    } catch (error) {
      toast.error(lexErrorMessage(error, t("sla.toast.loadFailed"), errorsByCode));
    }
  };

  const openNew = () => {
    setEditing(null);
    setPolicyName("");
    // The widest scope is the safe default; narrowing it is a deliberate act.
    setProductId(null);
    setSectorId(null);
    setStages([]);
    setNearBreachPercent(75);
    setCriticalBreachPercent(90);
    setEffectiveDate("");
    setFormOpen(true);
  };

  const onSave = async () => {
    if (!policyName.trim()) return toast.error(t("sla.valid.policyName"));
    if (!stages.length) return toast.error(t("sla.valid.targets"));
    if (stages.some((stage) => !stage.stageCode || !(stage.targetMinutes > 0))) {
      return toast.error(t("sla.valid.target"));
    }
    // Near breach must come before critical, or a case jumps straight to
    // critical and the warning state never renders.
    const percentProblem = slaPercentProblem(nearBreachPercent, criticalBreachPercent);
    if (percentProblem) return toast.error(t(`sla.valid.${percentProblem}`));

    setBusy(true);
    try {
      const body = {
        // null is meaningful — it is the "All" wildcard — so it is sent.
        productId,
        sectorId,
        policyName: policyName.trim(),
        // Ordinals are contiguous and reflect the order on screen.
        stages: stages.map((stage, index) => ({ ...stage, ordinal: index + 1 })),
        nearBreachPercent,
        criticalBreachPercent,
        effectiveDate: effectiveDate || undefined,
      };
      if (editing) await updateSlaPolicy(editing.id, body);
      else await createSlaPolicy(body);
      toast.success(t("sla.toast.saved"));
      setFormOpen(false);
      load();
    } catch (error) {
      logForbidden(error, "PUT /config/sla/{id}");
      toast.error(lexErrorMessage(error, t("sla.toast.saveFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const runAction = async (fn: () => Promise<unknown>, successKey: string, failKey: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(t(successKey));
      setFormOpen(false);
      load();
    } catch (error) {
      if (lexErrorCode(error) === "LEX.SLA.OPEN_DRAFT_EXISTS") {
        toast.error(t("sla.err.draftExists"));
      } else {
        toast.error(lexErrorMessage(error, t(failKey), errorsByCode));
      }
    } finally {
      setBusy(false);
    }
  };

  const openLineage = async () => {
    if (!editing?.lineageId) return;
    try {
      setLineage(await getSlaLineage(editing.lineageId));
      setLineageOpen(true);
    } catch (error) {
      toast.error(lexErrorMessage(error, t("sla.toast.lineageFailed"), errorsByCode));
    }
  };

  const updateStage = (index: number, patch: Partial<LexSlaStage>) => {
    const next = [...stages];
    next[index] = { ...next[index], ...patch };
    setStages(next);
  };

  const headers = [
    {
      name: t("sla.col.policyName"),
      cell: (row: LexSlaPolicy) => <span className="font-medium">{row.policyName}</span>,
    },
    {
      name: t("sla.col.scope"),
      cell: (row: LexSlaPolicy) =>
        row.scopeDescription ? (
          <span className="text-sm">{row.scopeDescription}</span>
        ) : (
          <LexScope
            productName={row.productName}
            sectorName={row.sectorName}
            allProductsLabel={t("scope.allProducts")}
            allSectorsLabel={t("scope.allSectors")}
          />
        ),
    },
    {
      name: t("sla.col.stages"),
      cell: (row: LexSlaPolicy) => <span>{row.stages?.length ?? 0}</span>,
      width: "110px",
    },
    {
      name: t("sla.col.status"),
      cell: (row: LexSlaPolicy) => <LexStatusBadge status={row.status} />,
      width: "130px",
    },
    {
      name: t("sla.col.version"),
      cell: (row: LexSlaPolicy) => <span>v{row.version}</span>,
      width: "90px",
    },
    {
      name: t("sla.col.updated"),
      cell: (row: LexSlaPolicy) => <span>{formatDateTime(row.updatedAt) || "—"}</span>,
      width: "170px",
    },
    {
      name: t("common:actions"),
      cell: (row: LexSlaPolicy) => (
        <Button variant="outline" size="sm" onClick={() => openPolicy(row)}>
          {t("open")}
        </Button>
      ),
      width: "110px",
    },
  ];

  if (!canRead) return <PermissionDenied />;

  const totalRows = result.pagination?.totalElements ?? result.content.length;
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);

  return (
    <div className="service">
      <LexPageHeader icon={Timer} title={t("sla.title")} subtitle={t("sla.subtitle")}>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-44 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("filter.allStatuses")}</SelectItem>
            <SelectItem value="DRAFT">DRAFT</SelectItem>
            <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
            <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="h-10 gap-2" onClick={load} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common:refresh")}
        </Button>
        {canWrite && (
          <Button className="wallet-brand-btn h-10 gap-2" onClick={openNew}>
            <Plus className="h-4 w-4" />
            {t("sla.new")}
          </Button>
        )}
      </LexPageHeader>

      {/* Said here because it is the consequence of an unpublished policy, and
          the board is where it surfaces — as "not tracked", not as compliant. */}
      <LexNotice tone="slate">{t("sla.notTrackedNote")}</LexNotice>

      <div className="pro-card">
        {!isLoading && totalRows === 0 ? (
          <EmptyState icon={Timer} text={t("sla.empty")} />
        ) : (
          <TableView
            header={headers}
            data={result.content}
            totalRows={totalRows}
            isLoading={isLoading}
            from={from}
            to={to}
            page={page}
            totalPage={result.pagination?.totalPages || 1}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={(size: number) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={(open) => !open && setFormOpen(false)}>
        <DialogContent className="pro-dialog sm:max-w-3xl">
          <DialogHeader className="text-start">
            <DialogTitle>
              {editing ? t("sla.form.editTitle", { version: editing.version }) : t("sla.form.newTitle")}
            </DialogTitle>
            <DialogDescription>{t("sla.form.explain")}</DialogDescription>
          </DialogHeader>

          {editing && !editable && (
            <LexNotice tone="slate" icon={Lock}>
              {editing.status === "PUBLISHED" ? t("sla.readOnlyPublished") : t("sla.readOnlyArchived")}
            </LexNotice>
          )}

          {/* Policy-level identity and the two percentages every stage derives
              its thresholds from. */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sla-name">{t("sla.field.policyName")}</Label>
              <Input
                id="sla-name"
                className="h-10"
                value={policyName}
                disabled={readOnly}
                onChange={(e) => setPolicyName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sla-product">{t("doa.field.product")}</Label>
              <LexProductSelect
                value={productId}
                onChange={setProductId}
                products={products}
                allProductsLabel={t("scope.allProducts")}
                disabled={readOnly}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sla-sector">{t("doa.field.sector")}</Label>
              {/* Options come from GET /config/sectors; "All Sectors" is the
                  wildcard the picker adds, never a row in that list. */}
              <LexSectorSelect
                value={sectorId}
                onChange={setSectorId}
                sectors={sectors}
                allSectorsLabel={t("scope.allSectors")}
                disabled={readOnly}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <p className="m-0 text-xs text-muted-foreground">{t("doa.field.scopeHint")}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sla-effective">{t("sla.field.effectiveDate")}</Label>
              <Input
                id="sla-effective"
                type="date"
                className="h-10"
                value={effectiveDate}
                disabled={readOnly}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sla-near-pct">{t("sla.field.nearPercent")}</Label>
              <Input
                id="sla-near-pct"
                type="number"
                className="h-10"
                value={nearBreachPercent}
                disabled={readOnly}
                onChange={(e) => setNearBreachPercent(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sla-critical-pct">{t("sla.field.criticalPercent")}</Label>
              <Input
                id="sla-critical-pct"
                type="number"
                className="h-10"
                value={criticalBreachPercent}
                disabled={readOnly}
                onChange={(e) => setCriticalBreachPercent(Number(e.target.value))}
              />
            </div>
          </div>

          {slaPercentProblem(nearBreachPercent, criticalBreachPercent) && (
            <LexNotice tone="red">
              {t(`sla.valid.${slaPercentProblem(nearBreachPercent, criticalBreachPercent)}`)}
            </LexNotice>
          )}

          <div className="flex items-center justify-between">
            <h4 className="m-0 text-sm font-semibold">{t("sla.stages.title")}</h4>
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  setStages([
                    ...stages,
                    {
                      ordinal: stages.length + 1,
                      stageCode: SLA_STAGE_CODES[0],
                      displayName: "",
                      targetMinutes: 120,
                    },
                  ])
                }
              >
                <Plus className="h-4 w-4" />
                {t("sla.stages.add")}
              </Button>
            )}
          </div>

          <div className="max-h-[45vh] overflow-y-auto">
            {stages.length === 0 ? (
              <p className="m-0 py-6 text-center text-sm text-muted-foreground">
                {t("sla.stages.empty")}
              </p>
            ) : (
              stages.map((stage, index) => (
                <div key={index} className="mb-2 rounded-lg border border-border bg-card p-3">
                  <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1.2fr_1.2fr_1fr_auto]">
                    <div className="flex flex-col gap-1.5">
                      <Label>{t("sla.field.stage")}</Label>
                      <Select
                        value={stage.stageCode}
                        disabled={readOnly}
                        onValueChange={(v) => updateStage(index, { stageCode: v })}
                      >
                        <SelectTrigger className="w-full data-[size=default]:h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(new Set([...SLA_STAGE_CODES, stage.stageCode]))
                            .filter(Boolean)
                            .map((code) => (
                              <SelectItem key={code} value={code}>
                                {code}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label>{t("sla.field.displayName")}</Label>
                      <Input
                        className="h-9"
                        value={stage.displayName}
                        disabled={readOnly}
                        onChange={(e) => updateStage(index, { displayName: e.target.value })}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label>{t("sla.field.target")}</Label>
                      <Input
                        type="number"
                        step="0.25"
                        className="h-9"
                        value={minutesToHours(stage.targetMinutes)}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateStage(index, { targetMinutes: hoursToMinutes(e.target.value) })
                        }
                      />
                      {/* The stored value, kept on screen: this is the number
                          the SLA board reports. */}
                      <span className="text-[11px] text-muted-foreground">
                        {t("sla.storedMinutes", { minutes: stage.targetMinutes ?? 0 })}
                      </span>
                    </div>

                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setStages(stages.filter((_, i) => i !== index))}
                        aria-label={t("sla.stages.remove")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <ThresholdScale
                    stage={stage}
                    nearBreachPercent={nearBreachPercent}
                    criticalBreachPercent={criticalBreachPercent}
                  />
                </div>
              ))
            )}
          </div>

          <DialogFooter className="flex-wrap gap-2 sm:justify-end">
            {editing && (
              <Button variant="ghost" className="gap-2" onClick={openLineage}>
                <History className="h-4 w-4" />
                {t("sla.lineage")}
              </Button>
            )}
            {editing && editing.status === "PUBLISHED" && canWrite && (
              <>
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={busy}
                  onClick={() =>
                    runAction(() => cloneSlaPolicy(editing.id), "sla.toast.cloned", "sla.toast.cloneFailed")
                  }
                >
                  <Copy className="h-4 w-4" />
                  {t("sla.clone")}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={busy}
                  onClick={() =>
                    runAction(
                      () => archiveSlaPolicy(editing.id),
                      "sla.toast.archived",
                      "sla.toast.archiveFailed"
                    )
                  }
                >
                  <Archive className="h-4 w-4" />
                  {t("sla.archive")}
                </Button>
              </>
            )}
            {editing && editable && canWrite && (
              <Button
                variant="ghost"
                className="gap-2"
                disabled={busy}
                onClick={() =>
                  runAction(
                    () => deleteSlaDraft(editing.id),
                    "sla.toast.draftDeleted",
                    "sla.toast.deleteFailed"
                  )
                }
              >
                <Trash2 className="h-4 w-4" />
                {t("sla.deleteDraft")}
              </Button>
            )}
            {editing && editable && canPublish && (
              <Button
                variant="outline"
                className="gap-2"
                disabled={busy}
                onClick={() =>
                  runAction(
                    () => publishSlaPolicy(editing.id),
                    "sla.toast.published",
                    "sla.toast.publishFailed"
                  )
                }
              >
                <Send className="h-4 w-4" />
                {t("sla.publish")}
              </Button>
            )}
            {!readOnly && (
              <Button className="wallet-brand-btn gap-2" onClick={onSave} disabled={busy}>
                <Save className="h-4 w-4" />
                {t("common:save")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={lineageOpen} onOpenChange={setLineageOpen}>
        <DialogContent className="pro-dialog sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle>{t("sla.lineageTitle")}</DialogTitle>
            <DialogDescription>{t("sla.lineageExplain")}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] overflow-y-auto pt-2">
            <LexVersionTimeline
              currentId={editing?.id}
              emptyText={t("sla.lineageEmpty")}
              entries={[...lineage]
                .sort((a, b) => (b.version || 0) - (a.version || 0))
                .map((v) => ({
                  id: v.id,
                  version: v.version,
                  status: v.status,
                  at: v.publishedAt || v.updatedAt || v.createdAt,
                }))}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LexSlaPolicies;
