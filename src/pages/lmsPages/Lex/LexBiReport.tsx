import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, BarChart3, Download, EyeOff, RefreshCw } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
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
import { PermissionDenied } from "../../../components/shared/detailKit";
import { LexNotice, LexPageHeader } from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { lexErrorCode, lexErrorMessage, logForbidden } from "../../../redux/apis/apisLexCore";
import {
  EXPORT_FORMATS,
  exportSavedReport,
  exportStandardReport,
  getDrillDown,
  getStandardReport,
  runSavedReport,
  type LexExportFormat,
  type LexReportFilters,
  type LexReportResult,
  type LexDrillRow,
  type LexReportRow,
} from "../../../redux/apis/apisLexBi";
import LexReportRenderer from "./LexReportRenderer";

/**
 * One report screen for both kinds. `/Standard/:reportKey` runs a gallery
 * report; `/Report/:id` runs a saved one — the payload and therefore the whole
 * screen are identical.
 *
 * The filter bar is adjustable without navigating away and is passed to the
 * export endpoints too, so the file always matches the screen.
 *
 * Export offers XLSX and CSV. PDF is in the BRD but not in this build, so it is
 * absent from the menu rather than present and failing.
 */
const LexBiReport = ({ kind }: { kind: "standard" | "saved" }) => {
  const { t } = useTranslation("lex");
  const navigate = useNavigate();
  const params = useParams();
  const key = String(params.reportKey || params.id || "");
  // Ungated while the LEX permission codes are unregistered — see useLexAccess.
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.BI_READ);

  const [report, setReport] = useState<LexReportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  /** A 422 that explains itself: not visible, or no projection behind it yet. */
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [filters, setFilters] = useState<LexReportFilters>({});

  const [drill, setDrill] = useState<{ row: LexReportRow; rows: LexDrillRow[] } | null>(null);

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "LEX.BI.REPORT_NOT_VISIBLE": t("bi.err.notVisible"),
      "LEX.BI.REPORT_UNAVAILABLE": t("bi.err.unavailable"),
    }),
    [t]
  );

  const load = async () => {
    if (!canRead || !key) return;
    setIsLoading(true);
    setBlockedReason(null);
    try {
      const data =
        kind === "standard"
          ? await getStandardReport(key, filters)
          : await runSavedReport(key, filters);
      setReport(data);
    } catch (error) {
      // A report the user may not see answers 422 REPORT_NOT_VISIBLE, not 404 —
      // and saying so is more useful than pretending it does not exist.
      const code = lexErrorCode(error);
      if (code === "LEX.BI.REPORT_NOT_VISIBLE" || code === "LEX.BI.REPORT_UNAVAILABLE") {
        // Both are 422 with an explanation worth reading, not an empty chart.
        setBlockedReason(
          lexErrorMessage(error, t(code === "LEX.BI.REPORT_UNAVAILABLE" ? "bi.err.unavailable" : "bi.err.notVisible"), errorsByCode)
        );
        setReport(null);
      } else {
        logForbidden(error, "GET /bi report");
        toast.error(lexErrorMessage(error, t("bi.toast.runFailed"), errorsByCode));
        setReport(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, kind, filters]);

  const onExport = async (format: LexExportFormat) => {
    try {
      if (kind === "standard") await exportStandardReport(key, format, filters);
      else await exportSavedReport(key, report?.title || key, format, filters);
      toast.success(t("bi.toast.exported"));
    } catch (error) {
      toast.error(lexErrorMessage(error, t("bi.toast.exportFailed"), errorsByCode));
    }
  };

  const onDrill = async (row: LexReportRow) => {
    if (!row.drillKey) return;
    try {
      setDrill({ row, rows: await getDrillDown(row.drillKey, row.label, filters) });
    } catch (error) {
      toast.error(lexErrorMessage(error, t("bi.toast.drillFailed"), errorsByCode));
    }
  };

  if (!canRead) return <PermissionDenied />;

  return (
    <div className="service">
      <LexPageHeader
        icon={BarChart3}
        title={report?.title || t("bi.reportTitle")}
        subtitle={report?.summaryLabel}
      >
        <Button variant="ghost" className="h-10 gap-2" onClick={() => navigate("/LOS/Lex/Bi")}>
          <ArrowLeft className="h-4 w-4" />
          {t("common:back")}
        </Button>
        <Button variant="outline" className="h-10 gap-2" onClick={load} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common:refresh")}
        </Button>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 gap-2" disabled={!report}>
              <Download className="h-4 w-4" />
              {t("bi.export")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {EXPORT_FORMATS.map((format) => (
              <DropdownMenuItem key={format} onSelect={() => onExport(format)}>
                {format}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </LexPageHeader>

      {/* Filters, on every report screen and adjustable in place. */}
      <div className="pro-card mb-3 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bi-product">{t("bi.filter.product")}</Label>
            <Input
              id="bi-product"
              className="h-10"
              value={filters.productId || ""}
              onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bi-sector">{t("bi.filter.sector")}</Label>
            <Input
              id="bi-sector"
              className="h-10"
              value={filters.sectorId || ""}
              onChange={(e) => setFilters({ ...filters, sectorId: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bi-from">{t("bi.filter.from")}</Label>
            <Input
              id="bi-from"
              type="date"
              className="h-10"
              value={filters.from || ""}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bi-to">{t("bi.filter.to")}</Label>
            <Input
              id="bi-to"
              type="date"
              className="h-10"
              value={filters.to || ""}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            />
          </div>
        </div>
        <p className="m-0 mt-2 text-xs text-muted-foreground">{t("bi.exportFiltersNote")}</p>
      </div>

      {blockedReason ? (
        <LexNotice tone="slate" icon={EyeOff}>
          {blockedReason}
        </LexNotice>
      ) : report ? (
        <LexReportRenderer report={report} onDrill={onDrill} />
      ) : (
        !isLoading && <p className="text-sm text-muted-foreground">{t("bi.noReport")}</p>
      )}

      <Dialog open={!!drill} onOpenChange={(open) => !open && setDrill(null)}>
        <DialogContent className="pro-dialog sm:max-w-3xl">
          <DialogHeader className="text-start">
            <DialogTitle>{t("bi.drillTitle", { value: drill?.row.label })}</DialogTitle>
            <DialogDescription>{t("bi.drillExplain")}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] overflow-y-auto">
            {(drill?.rows.length ?? 0) === 0 ? (
              <p className="m-0 py-6 text-center text-sm text-muted-foreground">{t("bi.drillEmpty")}</p>
            ) : (
              drill?.rows.map((row, index) => (
                <div
                  key={row.applicationId || row.id || index}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 py-2 last:border-b-0"
                >
                  <span className="font-mono text-xs">
                    {row.applicationNumber || row.applicationId || row.id}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {[row.status, row.stageCode, row.reasonCode, row.assignedLevelCode]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LexBiReport;
