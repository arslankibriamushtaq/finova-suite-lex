import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChevronDown,
  Eye,
  Layers,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Workflow,
} from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
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
import { FilterField } from "../../../components/shared/filterKit";
import { TONES, formatDateTime } from "../../../components/shared/detailKitUtils";
import {
  LexPageHeader,
  LexScope,
  LexSearch,
  LexStatusBadge,
} from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { emptyPage, lexErrorMessage, logForbidden, type LexPage } from "../../../redux/apis/apisLexCore";
import {
  ROUTING_TYPES,
  SEVERITIES,
  bootstrapProcesses,
  getProcessTemplates,
  getProcesses,
  type LexProcess,
  type LexProcessTemplate,
} from "../../../redux/apis/apisLexConfig";

/**
 * The rule library: each entry maps one Reason Code to a process — where it
 * routes, what steps run, what evidence is required.
 *
 * The default filter shows PUBLISHED and DRAFT. Archived versions are history;
 * they are reachable, but a list that leads with them buries what is in force.
 */
/** Severity drives routing when several codes arrive together. */
const SEVERITY_TONE: Record<string, string> = {
  CRITICAL: TONES.red,
  HIGH: TONES.orange,
  MEDIUM: TONES.amber,
  LOW: TONES.slate,
};

const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

const LexProcesses = () => {
  const { t } = useTranslation("lex");
  const navigate = useNavigate();
  // Ungated while the LEX permission codes are unregistered — see useLexAccess.
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.PROCESS_READ);
  const canWrite = can(LEX_PERMISSIONS.PROCESS_WRITE);

  const [result, setResult] = useState<LexPage<LexProcess>>(emptyPage<LexProcess>());
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState("IN_FORCE");
  const [severity, setSeverity] = useState("ALL");
  const [routingType, setRoutingType] = useState("ALL");
  const [search, setSearch] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const [templates, setTemplates] = useState<LexProcessTemplate[]>([]);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "COMMON.VALIDATION.FAILED": t("err.validation"),
      "LEX.PROCESS.NOT_FOUND": t("proc.err.notFound"),
    }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      // "In force" is two statuses, and the endpoint takes one — so the filter
      // is only sent when it names a single status, and the pair is filtered
      // client-side over the page the server returned.
      const data = await getProcesses({
        page,
        size: pageSize,
        // Free-text search covers code, title and purpose.
        search: search || undefined,
        status: status === "IN_FORCE" ? undefined : status,
        severity: severity === "ALL" ? undefined : severity,
        routingType: routingType === "ALL" ? undefined : routingType,
      });
      setResult(data);
    } catch (error) {
      logForbidden(error, "GET /processes");
      toast.error(lexErrorMessage(error, t("proc.toast.loadFailed"), errorsByCode));
      setResult(emptyPage<LexProcess>(pageSize));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status, severity, routingType, search]);

  const rows = useMemo(
    () =>
      status === "IN_FORCE"
        ? result.content.filter((p) => p.status === "PUBLISHED" || p.status === "DRAFT")
        : result.content,
    [result.content, status]
  );

  // "In force" is the default view, so it is not counted as a filter the user
  // set — only a deliberate narrowing shows on the badge.
  const activeFilterCount = [
    status !== "IN_FORCE",
    severity !== "ALL",
    routingType !== "ALL",
  ].filter(Boolean).length;

  /** Shown before bootstrap so the admin sees what they are about to create. */
  const openTemplates = async () => {
    setBusy(true);
    try {
      setTemplates(await getProcessTemplates());
      setTemplatesOpen(true);
    } catch (error) {
      toast.error(lexErrorMessage(error, t("proc.toast.templatesFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const onBootstrap = async () => {
    setBusy(true);
    try {
      // Idempotent by reference code, so the response is what makes a re-run
      // visibly do something rather than appearing to no-op.
      const result = await bootstrapProcesses(false);
      toast.success(
        t("proc.toast.bootstrapped", {
          created: result.created,
          skipped: result.skippedExisting,
        })
      );
      setTemplatesOpen(false);
      load();
    } catch (error) {
      logForbidden(error, "POST /processes/bootstrap");
      toast.error(lexErrorMessage(error, t("proc.toast.bootstrapFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const headers = [
    {
      name: t("proc.col.referenceCode"),
      cell: (row: LexProcess) => (
        <span className="font-mono text-xs font-medium">{row.referenceCode}</span>
      ),
      width: "180px",
    },
    {
      name: t("proc.col.title"),
      cell: (row: LexProcess) => <span className="font-medium">{row.title}</span>,
    },
    {
      name: t("proc.col.severity"),
      cell: (row: LexProcess) => (
        <Badge
          variant="outline"
          className={`border font-medium ${SEVERITY_TONE[String(row.severity)] || TONES.slate}`}
        >
          {row.severity}
        </Badge>
      ),
      width: "130px",
    },
    {
      name: t("proc.col.status"),
      cell: (row: LexProcess) => <LexStatusBadge status={row.status} />,
      width: "130px",
    },
    {
      name: t("proc.col.version"),
      cell: (row: LexProcess) => <span>v{row.version}</span>,
      width: "90px",
    },
    {
      name: t("proc.col.scope"),
      cell: (row: LexProcess) =>
        row.scopes?.[0]?.describe ? (
          <span className="text-sm">{row.scopes[0].describe}</span>
        ) : (
          <LexScope
            productName={row.productName}
            sectorName={row.sectorName}
            allProductsLabel={t("scope.allProducts")}
            allSectorsLabel={t("scope.allSectors")}
          />
        ),
      width: "230px",
    },
    {
      name: t("proc.col.routing"),
      cell: (row: LexProcess) => (
        <Badge variant="outline" className={`border font-medium ${TONES.sky}`}>
          {row.routingType}
        </Badge>
      ),
      width: "200px",
    },
    {
      name: t("proc.col.updated"),
      cell: (row: LexProcess) => <span>{formatDateTime(row.updatedAt) || "—"}</span>,
      width: "170px",
    },
    {
      name: t("common:actions"),
      // Stops the row's own click handling from firing as the menu opens.
      cell: (row: LexProcess) => (
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
                  navigate(`/LOS/Lex/Processes/${row.id}`);
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

  const totalRows = result.pagination?.totalElements ?? rows.length;
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);
  const totalPage = result.pagination?.totalPages || 1;
  const isEmptyLibrary = !isLoading && totalRows === 0 && !search && status === "IN_FORCE";

  return (
    <div className="service">
      <LexPageHeader icon={Workflow} title={t("proc.title")} subtitle={t("proc.subtitle")} />

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LexSearch
            id="lex-process-search"
            className="flex-1"
            value={search}
            onChange={(next) => {
              setSearch(next);
              setPage(1);
            }}
            placeholder={t("proc.search")}
          />
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              aria-expanded={showFilters}
              aria-controls="lex-process-filters"
              onClick={() => setShowFilters((open) => !open)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t("common:filters")}
              {activeFilterCount > 0 && (
                <Badge variant="outline" className={`border font-medium ${TONES.emerald}`}>
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </Button>
            <Button variant="outline" className="gap-2" onClick={load} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("common:refresh")}
            </Button>
            {canWrite && (
              <Button
                className="wallet-brand-btn gap-2"
                onClick={() => navigate("/LOS/Lex/Processes/new")}
              >
                <Plus className="h-4 w-4" />
                {t("proc.new")}
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div id="lex-process-filters" className="mt-3 border-t pt-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FilterField label={t("proc.filter.status")} htmlFor="lex-process-status">
                <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                  <SelectTrigger id="lex-process-status" className="w-full bg-card">
                    <SelectValue placeholder={t("proc.filter.status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_FORCE">{t("proc.filter.inForce")}</SelectItem>
                    <SelectItem value="DRAFT">DRAFT</SelectItem>
                    <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                    <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
                  </SelectContent>
                </Select>
              </FilterField>

              <FilterField label={t("proc.filter.severity")} htmlFor="lex-process-severity">
                <Select value={severity} onValueChange={(v) => { setSeverity(v); setPage(1); }}>
                  <SelectTrigger id="lex-process-severity" className="w-full bg-card">
                    <SelectValue placeholder={t("proc.filter.severity")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t("proc.filter.allSeverities")}</SelectItem>
                    {SEVERITIES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>

              <FilterField label={t("proc.filter.routing")} htmlFor="lex-process-routing">
                <Select value={routingType} onValueChange={(v) => { setRoutingType(v); setPage(1); }}>
                  <SelectTrigger id="lex-process-routing" className="w-full bg-card">
                    <SelectValue placeholder={t("proc.filter.routing")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t("proc.filter.allRouting")}</SelectItem>
                    {ROUTING_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            </div>
          </div>
        )}
      </div>

      <div className="pro-card">
        {isEmptyLibrary ? (
          <div className="py-8">
            <EmptyState icon={Layers} text={t("proc.empty")} />
            {canWrite && (
              <div className="mt-3 flex justify-center">
                <Button variant="outline" className="gap-2" onClick={openTemplates} disabled={busy}>
                  <Layers className="h-4 w-4" />
                  {t("proc.viewTemplates")}
                </Button>
              </div>
            )}
          </div>
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

      {/* Bootstrap creates ~25 records in one click, so the templates are shown
          first — the admin approves a list they have seen rather than a number. */}
      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader className="text-start">
            <DialogTitle>{t("proc.templates.title", { count: templates.length })}</DialogTitle>
            <DialogDescription>{t("proc.templates.explain")}</DialogDescription>
          </DialogHeader>

          <div className="max-h-[50vh] overflow-y-auto">
            {templates.map((tpl) => (
              <div
                key={tpl.referenceCode}
                className="flex items-start justify-between gap-3 border-b border-border/60 py-2 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="m-0 text-sm font-medium">{tpl.title}</p>
                  <p className="m-0 font-mono text-xs text-muted-foreground">{tpl.referenceCode}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {tpl.severity && (
                    <Badge
                      variant="outline"
                      className={`border font-medium ${SEVERITY_TONE[tpl.severity] || TONES.slate}`}
                    >
                      {tpl.severity}
                    </Badge>
                  )}
                  <Badge variant="outline" className={`border font-medium ${TONES.sky}`}>
                    {tpl.routingType}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setTemplatesOpen(false)} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn gap-2" onClick={onBootstrap} disabled={busy}>
              {t("proc.templates.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LexProcesses;
