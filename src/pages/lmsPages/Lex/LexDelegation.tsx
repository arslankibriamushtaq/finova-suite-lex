import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Archive,
  ChevronDown,
  Copy,
  Eye,
  History,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Scale,
  Send,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
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
  LexSearch,
  LexScope,
  LexSectorSelect,
  LexStatusBadge,
  LexVersionTimeline,
} from "../../../components/shared/lexKit";
import { cn } from "../../../lib/utils";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { emptyPage, isEditable, lexErrorCode, lexErrorMessage, logForbidden, type LexPage } from "../../../redux/apis/apisLexCore";
import {
  DBR_MAX,
  POLICY_PARAMETERS,
  archiveDelegationMatrix,
  cloneDelegationMatrix,
  createDelegationMatrix,
  getScopeProducts,
  getSectors,
  deleteDelegationDraft,
  getAuthorityLevels,
  getDelegationLineage,
  getDelegationMatrices,
  getDelegationMatrix,
  hasBandProblem,
  publishDelegationMatrix,
  updateDelegationMatrix,
  validateBands,
  type LexAuthorityLevel,
  type LexDelegationBand,
  type LexDelegationMatrix,
  type LexScopeProduct,
  type LexSector,
} from "../../../redux/apis/apisLexConfig";

/**
 * Delegation of authority: a policy parameter, a scope, and one band per
 * authority level.
 *
 * This covers the **Delegation Underwriter path only** — Supervisor and
 * Application Source routing follow their own paths regardless of any tolerance
 * set here.
 *
 * The lifecycle is the configurator's, so the behaviour matches the process
 * screen exactly. What differs is the body, and the body has four rules the
 * server checks and this screen shows live while the admin types:
 *
 * - every **active** level needs a row. A missing rung is not a blank cell — it
 *   is a value nobody is authorized to approve;
 * - no overlap between consecutive rungs — a value in the overlap reaches two
 *   levels. (Gaps are the server's check, not this screen's: the boundary
 *   convention was guessed here and rejected valid matrices.)
 * - min ≤ max, both non-negative;
 * - DBR is a percentage, so it caps at 100.
 *
 * Boundaries are **inclusive** — a DBR of exactly 40 resolves to the band
 * ending at 40 — which is the first question every admin asks, so it is on the
 * screen.
 *
 * What the UI must NOT do is present the last band's upper bound as a maximum.
 * A value above it resolves to empty: LEX opens the case at the highest active
 * level and flags `beyondDelegation`. That is a handled case, not an
 * escalation into a level nobody switched on.
 */
const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

const LexDelegation = () => {
  const { t } = useTranslation("lex");
  // Ungated while the LEX permission codes are unregistered — see useLexAccess.
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.DELEGATION_READ);
  const canWrite = can(LEX_PERMISSIONS.DELEGATION_WRITE);
  const canPublish = can(LEX_PERMISSIONS.DELEGATION_PUBLISH);

  const [result, setResult] = useState<LexPage<LexDelegationMatrix>>(emptyPage<LexDelegationMatrix>());
  const [levels, setLevels] = useState<LexAuthorityLevel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  const [editing, setEditing] = useState<LexDelegationMatrix | null>(null);
  /**
   * Scope: `null` on either half means "All". The pickers hold null rather than
   * a sentinel id, because null is literally what the API wants — a wildcard is
   * the absence of a scope, not a row named "All".
   */
  const [productId, setProductId] = useState<string | null>(null);
  const [sectorId, setSectorId] = useState<string | null>(null);
  const [products, setProducts] = useState<LexScopeProduct[]>([]);
  const [sectors, setSectors] = useState<LexSector[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [policyParameter, setPolicyParameter] = useState(POLICY_PARAMETERS[0]);
  const [bands, setBands] = useState<LexDelegationBand[]>([]);
  const [effectiveDate, setEffectiveDate] = useState("");

  const [lineage, setLineage] = useState<LexDelegationMatrix[]>([]);
  const [lineageOpen, setLineageOpen] = useState(false);
  const [openDraftId, setOpenDraftId] = useState<string | null>(null);

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "COMMON.VALIDATION.FAILED": t("err.validation"),
      "LEX.DELEGATION.OPEN_DRAFT_EXISTS": t("doa.err.draftExists"),
      "LEX.DELEGATION.NOT_EDITABLE": t("doa.err.notEditable"),
      "LEX.DELEGATION.NOT_PUBLISHED": t("doa.err.notPublished"),
      "LEX.DELEGATION.NOT_FOUND": t("doa.err.notFound"),
      "LEX.DELEGATION.INVALID": t("doa.err.invalid"),
      // Raised on save when a scope names a sector this company does not have
      // or one since deactivated. Unreachable if the picker is fresh — seeing
      // it means the sector list is stale.
      "LEX.SECTOR.UNKNOWN_SCOPE": t("sector.err.unknownScope"),
      // The product half is validated too now. Same cause, different catalogue:
      // the id names no product LOS has.
      "LEX.PRODUCT.UNKNOWN_SCOPE": t("product.err.unknownScope"),
    }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      const data = await getDelegationMatrices({
        page,
        size: pageSize,
        status: status === "ALL" ? undefined : status,
      });
      setResult(data);
    } catch (error) {
      logForbidden(error, "GET /delegation");
      toast.error(lexErrorMessage(error, t("doa.toast.loadFailed"), errorsByCode));
      setResult(emptyPage<LexDelegationMatrix>(pageSize));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status]);

  // Levels are data, not an enum — the band editor's level picker is built from
  // whatever the tenant has configured, active ones only.
  useEffect(() => {
    if (!canRead) return;
    getAuthorityLevels({ activeOnly: true })
      .then(setLevels)
      .catch(() => setLevels([]));

    // Both halves of the scope are data. Sectors are governed in LEX; products
    // come from LOS and LEX never validates them, so an empty picker here would
    // leave the admin typing ids by hand — which is how a scope that matches
    // nothing gets saved.
    getSectors()
      .then(setSectors)
      .catch(() => setSectors([]));
    getScopeProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [canRead]);

  const problems = useMemo(
    () => validateBands(bands, levels, policyParameter),
    [bands, levels, policyParameter]
  );

  // The list endpoint sends a scope's `productId`/`sectorId` but not always the
  // matching names, so the column would otherwise print raw ids. These resolve
  // an id to its label off the same catalogues the pickers use — products from
  // LOS, sectors governed here — so the table reads the way the picker does.
  const productNameById = useMemo(
    () => new Map(products.map((p) => [p.id, p.name])),
    [products]
  );
  const sectorNameById = useMemo(
    () => new Map(sectors.map((s) => [s.id, s.displayName])),
    [sectors]
  );

  // `null` product/sector is the "All" wildcard — return null so LexScope shows
  // the "All …" label rather than a resolved name. A specific id resolves to
  // its catalogue name, falling back to any name the row carried and, only if
  // both are missing, the id itself so the cell is never blank.
  const scopeProductName = (row: LexDelegationMatrix): string | null =>
    row.productId
      ? productNameById.get(row.productId) ?? row.productName ?? row.productId
      : null;
  const scopeSectorName = (row: LexDelegationMatrix): string | null =>
    row.sectorId
      ? sectorNameById.get(row.sectorId) ?? row.sectorName ?? row.sectorId
      : null;

  const openMatrix = async (row: LexDelegationMatrix) => {
    try {
      const full = await getDelegationMatrix(row.id);
      setEditing(full);
      setPolicyParameter(full.policyParameter);
      setEffectiveDate(full.effectiveDate || "");
      setProductId(full.productId ?? null);
      setSectorId(full.sectorId ?? null);
      setBands([...(full.bands || [])].sort((a, b) => Number(a.minValue) - Number(b.minValue)));
      setOpenDraftId(null);
      setFormOpen(true);
    } catch (error) {
      toast.error(lexErrorMessage(error, t("doa.toast.loadFailed"), errorsByCode));
    }
  };

  /**
   * A new matrix starts with one row per active level rather than empty — every
   * active level needs a row, so an empty form would be a form that cannot be
   * saved until the admin discovers that rule.
   */
  const openNew = () => {
    setEditing(null);
    setPolicyParameter(POLICY_PARAMETERS[0]);
    setEffectiveDate("");
    // The widest scope is the safe default: All Products / All Sectors is the
    // tier everything falls back to, and narrowing it is a deliberate choice.
    setProductId(null);
    setSectorId(null);
    setBands(
      levels.map((level) => ({ authorityLevelId: level.id, minValue: 0, maxValue: 0 }))
    );
    setOpenDraftId(null);
    setFormOpen(true);
  };

  const editable = !editing || isEditable(editing);
  const readOnly = !editable || !canWrite;

  const onSave = async () => {
    if (!bands.length) return toast.error(t("doa.valid.bands"));
    if (bands.some((b) => !b.authorityLevelId)) return toast.error(t("doa.valid.level"));
    // Every one of these is refused server-side as LEX.DELEGATION.INVALID, so
    // the save is blocked here rather than round-tripping to learn that.
    if (problems.invalid.length) return toast.error(t("doa.valid.range"));
    if (problems.overlaps.length) return toast.error(t("doa.valid.overlap"));
    if (problems.missingLevelIds.length) return toast.error(t("doa.valid.missingLevel"));
    if (problems.overDbrCap) return toast.error(t("doa.valid.dbrCap"));

    setBusy(true);
    try {
      const body = {
        // null is meaningful here — it is the "All" wildcard — so it is sent
        // rather than stripped.
        productId,
        sectorId,
        policyParameter,
        bands,
        effectiveDate: effectiveDate || undefined,
      };
      if (editing) await updateDelegationMatrix(editing.id, body);
      else await createDelegationMatrix(body);
      toast.success(t("doa.toast.saved"));
      setFormOpen(false);
      load();
    } catch (error) {
      logForbidden(error, "PUT /delegation/{id}");
      toast.error(lexErrorMessage(error, t("doa.toast.saveFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const onClone = async () => {
    if (!editing) return;
    setBusy(true);
    setOpenDraftId(null);
    try {
      const draft = await cloneDelegationMatrix(editing.id);
      toast.success(t("doa.toast.cloned"));
      // Swap the dialog's contents for the new draft rather than closing and
      // reopening it, which flashed the overlay.
      await openMatrix(draft);
      load();
    } catch (error) {
      if (lexErrorCode(error) === "LEX.DELEGATION.OPEN_DRAFT_EXISTS" && editing.lineageId) {
        try {
          const versions = await getDelegationLineage(editing.lineageId);
          const draft = versions.find((v) => v.status === "DRAFT");
          if (draft) setOpenDraftId(draft.id);
        } catch {
          /* the toast still carries the server's explanation */
        }
      }
      toast.error(lexErrorMessage(error, t("doa.toast.cloneFailed"), errorsByCode));
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
      toast.error(lexErrorMessage(error, t(failKey), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const openLineage = async () => {
    if (!editing?.lineageId) return;
    try {
      setLineage(await getDelegationLineage(editing.lineageId));
      setLineageOpen(true);
    } catch (error) {
      toast.error(lexErrorMessage(error, t("doa.toast.lineageFailed"), errorsByCode));
    }
  };

  const headers = [
    {
      name: t("doa.col.parameter"),
      cell: (row: LexDelegationMatrix) => (
        <span className="font-medium">{row.policyParameter}</span>
      ),
      width: "180px",
    },
    {
      name: t("doa.col.scope"),
      cell: (row: LexDelegationMatrix) => (
        <LexScope
          productName={scopeProductName(row)}
          sectorName={scopeSectorName(row)}
          allProductsLabel={t("scope.allProducts")}
          allSectorsLabel={t("scope.allSectors")}
        />
      ),
    },
    {
      name: t("doa.col.bands"),
      cell: (row: LexDelegationMatrix) => <span>{row.bands?.length ?? 0}</span>,
      width: "110px",
    },
    {
      name: t("doa.col.status"),
      cell: (row: LexDelegationMatrix) => <LexStatusBadge status={row.status} />,
      width: "130px",
    },
    {
      name: t("doa.col.version"),
      cell: (row: LexDelegationMatrix) => <span>v{row.version}</span>,
      width: "90px",
    },
    {
      name: t("doa.col.updated"),
      cell: (row: LexDelegationMatrix) => <span>{formatDateTime(row.updatedAt) || "—"}</span>,
      width: "170px",
    },
    {
      name: t("common:actions"),
      // Stops the row's own click handling from firing as the menu opens.
      cell: (row: LexDelegationMatrix) => (
        <div
          className="relative inline-block"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button type="button" className={SELECT_TRIGGER_CLS}>
                {t("common:select")}
                <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  openMatrix(row);
                }}
              >
                <Eye className="h-4 w-4" />
                {t("open")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      width: "120px",
    },
  ];

  if (!canRead) return <PermissionDenied />;

  // The endpoint takes status and policyParameter and nothing else, so this
  // narrows the rows already fetched rather than pretending to be a server
  // search. While it is active the counts describe the filtered set, so the
  // footer never claims more rows than are on screen.
  const needle = search.trim().toLowerCase();
  const rows = needle
    ? result.content.filter((m) =>
        [m.policyParameter, m.scopeDescription, m.productName, m.sectorName, m.status]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle))
      )
    : result.content;

  const totalRows = needle
    ? rows.length
    : result.pagination?.totalElements ?? result.content.length;
  const from = totalRows === 0 ? 0 : needle ? 1 : (page - 1) * pageSize + 1;
  const to = needle ? rows.length : Math.min(page * pageSize, totalRows);
  const totalPage = needle ? 1 : result.pagination?.totalPages || 1;

  return (
    <div className="service">
      <LexPageHeader icon={Scale} title={t("doa.title")} subtitle={t("doa.subtitle")} />

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LexSearch
            id="doa-search"
            className="flex-1"
            value={search}
            onChange={setSearch}
            placeholder={t("doa.search")}
          />
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Label htmlFor="doa-status" className="sr-only">
              {t("doa.col.status")}
            </Label>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger id="doa-status" className="w-44 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("filter.allStatuses")}</SelectItem>
                <SelectItem value="DRAFT">DRAFT</SelectItem>
                <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={load} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("common:refresh")}
            </Button>
            {canWrite && (
              <Button className="wallet-brand-btn gap-2" onClick={openNew}>
                <Plus className="h-4 w-4" />
                {t("doa.new")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="pro-card">
        {!isLoading && totalRows === 0 ? (
          <EmptyState icon={Scale} text={t("doa.empty")} />
        ) : (
          <TableView
            header={headers}
            data={rows}
            totalRows={totalRows}
            isLoading={isLoading}
            from={from}
            to={to}
            page={page}
            totalPage={totalPage}
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
              {editing
                ? t("doa.form.editTitle", { parameter: editing.policyParameter, version: editing.version })
                : t("doa.form.newTitle")}
            </DialogTitle>
            <DialogDescription>{t("doa.form.explain")}</DialogDescription>
          </DialogHeader>

          {editing && !editable && (
            <LexNotice tone="slate" icon={Lock}>
              {editing.status === "PUBLISHED" ? t("doa.readOnlyPublished") : t("doa.readOnlyArchived")}
            </LexNotice>
          )}

          {openDraftId && <LexNotice tone="amber">{t("doa.err.draftExists")}</LexNotice>}

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="doa-param">{t("doa.field.parameter")}</Label>
                <Select value={policyParameter} onValueChange={setPolicyParameter} disabled={readOnly}>
                  <SelectTrigger id="doa-param" className="w-full data-[size=default]:h-10">
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
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="doa-effective">{t("doa.field.effectiveDate")}</Label>
                <Input
                  id="doa-effective"
                  type="date"
                  className="h-10"
                  value={effectiveDate}
                  disabled={readOnly}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="doa-product">{t("doa.field.product")}</Label>
                <LexProductSelect
                  value={productId}
                  onChange={setProductId}
                  products={products}
                  allProductsLabel={t("scope.allProducts")}
                  disabled={readOnly}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="doa-sector">{t("doa.field.sector")}</Label>
                {/* Options come from GET /config/sectors — nothing is
                    hardcoded, and "All Sectors" is the wildcard the picker adds
                    rather than a row in that list. */}
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
            </div>

            {/* Live band validation, shown while the admin types rather than
                saved and refused. No gap check — see `validateBands`: the
                boundary convention was a guess here and it rejected valid
                matrices. The server checks the ladder on publish. */}
            {hasBandProblem(problems) && (
              <LexNotice tone="red">
                {problems.invalid.length > 0 && <p className="m-0">{t("doa.valid.range")}</p>}
                {problems.overlaps.length > 0 && <p className="m-0">{t("doa.valid.overlap")}</p>}
                {problems.missingLevelIds.length > 0 && (
                  <p className="m-0">
                    {t("doa.valid.missingLevelNamed", {
                      levels: levels
                        .filter((l) => problems.missingLevelIds.includes(l.id))
                        .map((l) => l.code)
                        .join(", "),
                    })}
                  </p>
                )}
                {problems.overDbrCap && (
                  <p className="m-0">{t("doa.valid.dbrCap", { max: DBR_MAX })}</p>
                )}
              </LexNotice>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="pro-head-badge">
                  <Layers className="h-4 w-4" />
                </span>
                <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                  {t("doa.bands.title")}
                </h4>
              </div>
              {!readOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    setBands([
                      ...bands,
                      // Start where the previous band leaves off — the value
                      // AFTER its top, not on it. Seeding the same number put
                      // that value in two bands, which is the overlap the
                      // validator is there to catch.
                      {
                        authorityLevelId: levels[0]?.id || "",
                        minValue: bands.length
                          ? Number(bands[bands.length - 1]?.maxValue || 0) + 1
                          : 0,
                        maxValue: bands.length
                          ? Number(bands[bands.length - 1]?.maxValue || 0) + 1
                          : 0,
                      },
                    ])
                  }
                >
                  <Plus className="h-4 w-4" />
                  {t("doa.bands.add")}
                </Button>
              )}
            </div>

            <div>
              {bands.length === 0 ? (
                <p className="m-0 py-6 text-center text-sm text-muted-foreground">
                  {t("doa.bands.empty")}
                </p>
              ) : (
                bands.map((band, index) => (
                  <div
                    key={band.id || index}
                    className={cn(
                      "mb-2 grid grid-cols-1 items-end gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_7rem_auto]",
                      // The notice names the problem; this points at the row
                      // that carries it, so a ten-band matrix does not have to
                      // be re-read from the top.
                      problems.invalid.includes(index) || problems.overlaps.includes(index)
                        ? "rounded-[2px] border border-red-500/50 bg-red-500/[0.04] px-3 py-2.5"
                        : "pro-tile"
                    )}
                  >
                    <div className="flex flex-col gap-1.5">
                      <Label>{t("doa.bands.level")}</Label>
                      <Select
                        value={band.authorityLevelId}
                        disabled={readOnly}
                        onValueChange={(v) => {
                          const next = [...bands];
                          next[index] = { ...band, authorityLevelId: v };
                          setBands(next);
                        }}
                      >
                        <SelectTrigger className="w-full data-[size=default]:h-9">
                          <SelectValue placeholder={t("doa.bands.level")} />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map((level) => (
                            <SelectItem key={level.id} value={level.id}>
                              {level.displayName.includes(level.code)
                                ? level.displayName
                                : `${level.displayName} (${level.code})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>{t("doa.bands.from")}</Label>
                      <Input
                        type="number"
                        className="h-9 w-full"
                        value={band.minValue}
                        disabled={readOnly}
                        onChange={(e) => {
                          const next = [...bands];
                          next[index] = { ...band, minValue: Number(e.target.value) };
                          setBands(next);
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>{t("doa.bands.to")}</Label>
                      <Input
                        type="number"
                        className="h-9 w-full"
                        value={band.maxValue}
                        disabled={readOnly}
                        onChange={(e) => {
                          const next = [...bands];
                          next[index] = { ...band, maxValue: Number(e.target.value) };
                          setBands(next);
                        }}
                      />
                    </div>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setBands(bands.filter((_, i) => i !== index))}
                        aria-label={t("doa.bands.remove")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="flex-wrap gap-2 sm:justify-end">
            {editing && (
              <Button variant="ghost" className="gap-2" onClick={openLineage}>
                <History className="h-4 w-4" />
                {t("doa.lineage")}
              </Button>
            )}
            {editing && editing.status === "PUBLISHED" && canWrite && (
              <>
                <Button variant="outline" className="gap-2" onClick={onClone} disabled={busy}>
                  <Copy className="h-4 w-4" />
                  {t("doa.clone")}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={busy}
                  onClick={() =>
                    runAction(
                      () => archiveDelegationMatrix(editing.id),
                      "doa.toast.archived",
                      "doa.toast.archiveFailed"
                    )
                  }
                >
                  <Archive className="h-4 w-4" />
                  {t("doa.archive")}
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
                    () => deleteDelegationDraft(editing.id),
                    "doa.toast.draftDeleted",
                    "doa.toast.deleteFailed"
                  )
                }
              >
                <Trash2 className="h-4 w-4" />
                {t("doa.deleteDraft")}
              </Button>
            )}
            {editing && editable && canPublish && (
              <Button
                variant="outline"
                className="gap-2"
                disabled={busy}
                onClick={() =>
                  runAction(
                    () => publishDelegationMatrix(editing.id),
                    "doa.toast.published",
                    "doa.toast.publishFailed"
                  )
                }
              >
                <Send className="h-4 w-4" />
                {t("doa.publish")}
              </Button>
            )}
            <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={busy}>
              {t("common:cancel")}
            </Button>
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
            <DialogTitle>{t("doa.lineageTitle")}</DialogTitle>
            <DialogDescription>{t("doa.lineageExplain")}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] overflow-y-auto pt-2">
            <LexVersionTimeline
              currentId={editing?.id}
              emptyText={t("doa.lineageEmpty")}
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

export default LexDelegation;
