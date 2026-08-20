import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GitBranch, Layers, Plus, RefreshCw, Workflow } from "lucide-react";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { EmptyState, PermissionDenied } from "../../../components/shared/detailKit";
import { TONES, formatDateTime } from "../../../components/shared/detailKitUtils";
import {
  LexNotice,
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
      cell: (row: LexProcess) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/LOS/Lex/Processes/${row.id}`)}
        >
          {t("open")}
        </Button>
      ),
      width: "110px",
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
      <LexPageHeader icon={Workflow} title={t("proc.title")} subtitle={t("proc.subtitle")}>
        <LexSearch
          value={search}
          onChange={(next) => {
            setSearch(next);
            setPage(1);
          }}
          placeholder={t("proc.search")}
        />
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-44 bg-card">
            <SelectValue placeholder={t("proc.filter.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IN_FORCE">{t("proc.filter.inForce")}</SelectItem>
            <SelectItem value="DRAFT">DRAFT</SelectItem>
            <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
            <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severity} onValueChange={(v) => { setSeverity(v); setPage(1); }}>
          <SelectTrigger className="w-40 bg-card">
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
        <Select value={routingType} onValueChange={(v) => { setRoutingType(v); setPage(1); }}>
          <SelectTrigger className="w-48 bg-card">
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
        <Button variant="outline" className="h-10 gap-2" onClick={load} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common:refresh")}
        </Button>
        {canWrite && (
          <Button
            className="wallet-brand-btn h-10 gap-2"
            onClick={() => navigate("/LOS/Lex/Processes/new")}
          >
            <Plus className="h-4 w-4" />
            {t("proc.new")}
          </Button>
        )}
      </LexPageHeader>

      <LexNotice tone="slate" icon={GitBranch}>
        {t("proc.immutableNote")}
      </LexNotice>

      {/* A code with no entry here is not an error state — it falls into the
          Supervisor fallback automatically, which is how the library grows. */}
      <LexNotice tone="slate">{t("proc.unrecognizedNote")}</LexNotice>

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
