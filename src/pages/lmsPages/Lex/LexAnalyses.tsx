import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  ChevronDown,
  CircleSlash,
  Eye,
  FileSearch,
  FileWarning,
  RefreshCw,
  ScanEye,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
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
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { EmptyState, PermissionDenied } from "../../../components/shared/detailKit";
import { TONES, formatDateTime } from "../../../components/shared/detailKitUtils";
import { cn } from "../../../lib/utils";
import { LexNotice, LexPageHeader, LexSearch } from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { emptyPage, lexErrorMessage, logForbidden, type LexPage } from "../../../redux/apis/apisLexCore";
import {
  getAnalyses,
  getAnalysis,
  isDataProblem,
  type LexAnalysis,
  type LexAnalysisRow,
} from "../../../redux/apis/apisLexDocuments";

/**
 * The four outcomes, and the one that matters most.
 *
 * `NOT_RUN` means the sequence stopped before reaching this check — it is never
 * a pass and it is never hidden. Rendering it as blank makes a halted sequence
 * look like a clean one, which is the single easiest way to approve a document
 * nobody finished reading.
 */
/** `rung` is the solid marker on the sequence rail; `tone` is the badge. */
const OUTCOME_STYLE: Record<string, { tone: string; rung: string; icon: typeof ShieldCheck }> = {
  PASS: { tone: TONES.emerald, rung: "bg-emerald-500 text-white", icon: ShieldCheck },
  FAIL: { tone: TONES.red, rung: "bg-red-500 text-white", icon: ShieldAlert },
  FLAGGED: { tone: TONES.amber, rung: "bg-amber-500 text-white", icon: FileWarning },
  NOT_RUN: {
    tone: TONES.slate,
    rung: "bg-muted text-muted-foreground ring-1 ring-border",
    icon: CircleSlash,
  },
};

/**
 * The header states. The three data-problem states are styled apart from
 * ADVERSE_FINDINGS deliberately — an unreadable payslip is not an adverse
 * credit finding, and presenting them the same way teaches underwriters to
 * treat a scanning problem as a red flag on a customer.
 */
const STATE_STYLE: Record<string, string> = {
  VERIFIED: TONES.emerald,
  ADVERSE_FINDINGS: TONES.red,
  UNREADABLE: TONES.sky,
  WRONG_TYPE: TONES.sky,
  ANALYSIS_UNAVAILABLE: TONES.sky,
};

const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

const LexAnalyses = () => {
  const { t } = useTranslation("lex");
  // Ungated while the LEX permission codes are unregistered — see useLexAccess.
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.ANALYSIS_READ);

  const [result, setResult] = useState<LexPage<LexAnalysis>>(emptyPage<LexAnalysis>());
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [applicationId, setApplicationId] = useState("");

  const [selected, setSelected] = useState<LexAnalysis | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const errorsByCode = useMemo(
    () => ({ "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied") }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      setResult(
        await getAnalyses({ page, size: pageSize, applicationId: applicationId || undefined })
      );
    } catch (error) {
      logForbidden(error, "GET /documents/analyses");
      toast.error(lexErrorMessage(error, t("ana.toast.loadFailed"), errorsByCode));
      setResult(emptyPage<LexAnalysis>(pageSize));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, applicationId]);

  const openAnalysis = async (row: LexAnalysis) => {
    try {
      setSelected(await getAnalysis(row.id));
      setDetailOpen(true);
    } catch (error) {
      toast.error(lexErrorMessage(error, t("ana.toast.loadFailed"), errorsByCode));
    }
  };

  const headers = [
    {
      name: t("ana.col.application"),
      cell: (row: LexAnalysis) => (
        <span className="font-mono text-xs">{row.applicationId}</span>
      ),
      width: "200px",
    },
    {
      name: t("ana.col.documentType"),
      cell: (row: LexAnalysis) => <span>{row.documentKind || "—"}</span>,
      width: "180px",
    },
    {
      name: t("ana.col.state"),
      cell: (row: LexAnalysis) => (
        <div className="flex flex-col gap-1">
          <Badge
            variant="outline"
            className={`border font-medium ${STATE_STYLE[String(row.state)] || TONES.slate}`}
          >
            {row.state}
          </Badge>
          {/* Said on the row, not only in the detail: the list is where an
              underwriter triages, and "the file was unreadable" must not look
              like "the applicant has a problem". */}
          {isDataProblem(row) && (
            <span className="text-[11px] text-muted-foreground">{t("ana.dataProblemShort")}</span>
          )}
        </div>
      ),
      width: "230px",
    },
    {
      name: t("ana.col.analysedAt"),
      cell: (row: LexAnalysis) => <span>{formatDateTime(row.analysedAt) || "—"}</span>,
      width: "180px",
    },
    {
      name: t("common:actions"),
      // Stops the row's own click handling from firing as the menu opens.
      cell: (row: LexAnalysis) => (
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
                  openAnalysis(row);
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

  const totalRows = result.pagination?.totalElements ?? result.content.length;
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);

  const rows: LexAnalysisRow[] = selected?.checks || [];
  const notRunCount = rows.filter((r) => r.outcome === "NOT_RUN").length;

  return (
    <div className="service">
      <LexPageHeader icon={ScanEye} title={t("ana.title")} subtitle={t("ana.subtitle")} />

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LexSearch
            id="ana-search"
            className="flex-1"
            value={applicationId}
            onChange={(next) => {
              setApplicationId(next);
              setPage(1);
            }}
            placeholder={t("ana.filterApplication")}
          />
          <Button variant="outline" className="gap-2" onClick={load} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common:refresh")}
          </Button>
        </div>
      </div>

      <div className="pro-card">
        {!isLoading && totalRows === 0 ? (
          <EmptyState icon={FileSearch} text={t("ana.empty")} />
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader className="text-start">
            <DialogTitle>{t("ana.detail.title")}</DialogTitle>
            <DialogDescription>
              {selected?.applicationId} · {formatDateTime(selected?.analysedAt) || "—"}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <>
              {/* The header verdict. A data problem says plainly that nothing
                  about the applicant has been assessed. */}
              {isDataProblem(selected) ? (
                <LexNotice tone="sky" icon={FileWarning}>
                  <p className="m-0 font-medium">{t(`ana.state.${selected.state}`)}</p>
                  <p className="m-0 mt-1">{t("ana.dataProblemExplain")}</p>
                </LexNotice>
              ) : (
                <LexNotice
                  tone={selected.state === "ADVERSE_FINDINGS" ? "red" : "emerald"}
                  icon={selected.state === "ADVERSE_FINDINGS" ? ShieldAlert : ShieldCheck}
                >
                  <p className="m-0 font-medium">{t(`ana.state.${selected.state}`)}</p>
                  {selected.state === "ADVERSE_FINDINGS" && (
                    <p className="m-0 mt-1">{t("ana.adverseExplain")}</p>
                  )}
                </LexNotice>
              )}

              {notRunCount > 0 && (
                <LexNotice tone="amber" icon={CircleSlash}>
                  {t("ana.notRunSummary", { count: notRunCount })}
                </LexNotice>
              )}

              {rows.length === 0 ? (
                <p className="m-0 py-6 text-center text-sm text-muted-foreground">
                  {t("ana.detail.noRows")}
                </p>
              ) : (
                <ol className="m-0 -mb-2 list-none p-0">
                  {rows.map((row, index) => {
                    const style = OUTCOME_STYLE[String(row.outcome)] || OUTCOME_STYLE.NOT_RUN;
                    const Icon = style.icon;
                    return (
                      <li
                        key={`${row.checkCode}-${index}`}
                        className="relative flex items-center gap-3"
                      >
                        {index > 0 && (
                          <span
                            aria-hidden
                            className="absolute start-3.5 top-0 h-1/2 w-px bg-border"
                          />
                        )}
                        {index < rows.length - 1 && (
                          <span
                            aria-hidden
                            className="absolute start-3.5 top-1/2 bottom-0 w-px bg-border"
                          />
                        )}
                        {/* The rung carries the outcome, so where the sequence
                            stopped is visible without reading every badge. */}
                        <span
                          className={cn(
                            "relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                            style.rung
                          )}
                        >
                          {row.ordinal ?? index + 1}
                        </span>

                        <div
                          className={cn(
                            "pro-tile mb-2 flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2",
                            row.outcome === "NOT_RUN" && "opacity-60"
                          )}
                        >
                          <div className="min-w-0 flex-1 basis-48">
                            <p className="m-0 text-sm font-medium text-foreground">
                              {row.displayName || row.checkCode}
                            </p>
                            {row.detail && (
                              <p className="m-0 mt-0.5 text-xs text-muted-foreground">
                                {row.detail}
                              </p>
                            )}
                            {row.reasonCode && (
                              <p className="m-0 mt-0.5 font-mono text-[11px] text-muted-foreground">
                                {row.reasonCode}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={`border shrink-0 gap-1 font-medium ${style.tone}`}
                          >
                            <Icon className="h-3 w-3" />
                            {t(`ana.outcome.${row.outcome}`)}
                          </Badge>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LexAnalyses;
