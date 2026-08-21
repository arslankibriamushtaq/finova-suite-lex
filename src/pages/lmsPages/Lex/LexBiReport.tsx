import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  Download,
  EyeOff,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
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
import { TONES } from "../../../components/shared/detailKitUtils";
import { LexNotice, LexPageHeader } from "../../../components/shared/lexKit";
import { FilterField } from "../../../components/shared/filterKit";
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
  const [showFilters, setShowFilters] = useState(false);

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

  // A count on the button so a narrowed report never looks like the whole
  // population just because the panel is shut.
  const activeFilterCount = [filters.productId, filters.sectorId, filters.from, filters.to]
    .filter((v) => !!v)
    .length;
  return (
    <div className="service">
      <LexPageHeader
        icon={BarChart3}
        title={report?.title || t("bi.reportTitle")}
        subtitle={report?.summaryLabel}
      >
        <Button variant="outline" className="gap-2" onClick={() => navigate("/LOS/Lex/Bi")}>
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("bi.backToGallery")}
        </Button>
      </LexPageHeader>

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            className="gap-2"
            aria-expanded={showFilters}
            aria-controls="bi-report-filters"
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
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={!report}>
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
        </div>

        {showFilters && (
          <div id="bi-report-filters" className="mt-3 border-t pt-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FilterField label={t("bi.filter.product")} htmlFor="bi-product">
                <Input
                  id="bi-product"
                  value={filters.productId || ""}
                  onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
                />
              </FilterField>
              <FilterField label={t("bi.filter.sector")} htmlFor="bi-sector">
                <Input
                  id="bi-sector"
                  value={filters.sectorId || ""}
                  onChange={(e) => setFilters({ ...filters, sectorId: e.target.value })}
                />
              </FilterField>
              <FilterField label={t("bi.filter.from")} htmlFor="bi-from">
                <Input
                  id="bi-from"
                  type="date"
                  value={filters.from || ""}
                  onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                />
              </FilterField>
              <FilterField label={t("bi.filter.to")} htmlFor="bi-to">
                <Input
                  id="bi-to"
                  type="date"
                  value={filters.to || ""}
                  onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                />
              </FilterField>
            </div>
            {/* The export carries these in a header block, so the file says
                what it contains. */}
            <p className="m-0 mt-3 text-xs text-muted-foreground">{t("bi.exportFiltersNote")}</p>
          </div>
        )}
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
                  className="pro-tile mb-2 flex flex-wrap items-center justify-between gap-2 last:mb-0"
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
