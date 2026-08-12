import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { AlertTriangle, ChevronDown, Eye, Info, RefreshCw } from "lucide-react";

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
import { FilterField } from "../../../components/shared/filterKit";
import { EmptyState, PermissionDenied } from "../../../components/shared/detailKit";
import { TONES, humanizeCode } from "../../../components/shared/detailKitUtils";
import { useProductPermissions, LEDGER_GL_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { ledgerErrorMessage } from "../../../utils/ledgerErrors";
import { formatGlAmount, getFailedGlEntries, type GlEntry } from "../../../redux/apis/apisLedgerGl";
import { LEDGER_CURRENCIES } from "../../../redux/apis/apisCrudLms";
import GlEntryDetail from "./GlEntryDetail";

const ALL = "ALL";

const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

/**
 * The work queue: entries the ledger could not post at all.
 *
 * An entry that posted but has not reached core banking is NOT here — that is
 * a sync backlog, and it shows on the reconciliation screen as pending sync.
 */
const GlFailedEntries = () => {
  const { t } = useTranslation("ledgerGl");
  const { hasPermission } = useProductPermissions();

  const canRead = hasPermission(LEDGER_GL_PERMISSIONS.READ);
  const canRetry = hasPermission(LEDGER_GL_PERMISSIONS.RETRY);
  const canReverse = hasPermission(LEDGER_GL_PERMISSIONS.REVERSE);

  const [currency, setCurrency] = useState(ALL);
  const [entries, setEntries] = useState<GlEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detail, setDetail] = useState<GlEntry | null>(null);

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      const res = await getFailedGlEntries(currency === ALL ? undefined : currency);
      setEntries(res?.data?.data?.entries ?? []);
    } catch (error: any) {
      toast.error(ledgerErrorMessage(error, t("failed.toast.loadFailed")));
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  const headers = [
    {
      name: t("gl.col.date"),
      cell: (row: GlEntry) => <span>{row.entryDate || "-"}</span>,
      width: "120px",
    },
    {
      name: t("gl.col.entryNo"),
      cell: (row: GlEntry) => <span className="font-mono text-xs">{row.entryNumber}</span>,
      width: "180px",
    },
    {
      name: t("gl.col.type"),
      cell: (row: GlEntry) => <span>{humanizeCode(row.entryType)}</span>,
      width: "200px",
    },
    {
      name: t("gl.col.description"),
      cell: (row: GlEntry) => (
        <span style={{ whiteSpace: "break-spaces" }}>{row.description || "-"}</span>
      ),
      width: "260px",
    },
    {
      name: t("gl.col.currency"),
      cell: (row: GlEntry) => <span>{row.currency}</span>,
      width: "100px",
    },
    {
      name: t("gl.col.debit"),
      cell: (row: GlEntry) => <span>{formatGlAmount(row.totalDebit, row.currency)}</span>,
      width: "160px",
    },
    {
      name: t("gl.col.credit"),
      cell: (row: GlEntry) => <span>{formatGlAmount(row.totalCredit, row.currency)}</span>,
      width: "160px",
    },
    {
      name: t("gl.col.status"),
      cell: (row: GlEntry) => (
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="outline" className={`border gap-1 font-medium ${TONES.red}`}>
            <AlertTriangle className="h-3 w-3" />
            {humanizeCode(row.status)}
          </Badge>
          {!row.balanced && (
            <Badge variant="outline" className={`border font-medium ${TONES.red}`}>
              {t("gl.badge.unbalanced")}
            </Badge>
          )}
        </div>
      ),
      width: "200px",
    },
    {
      name: t("gl.col.action"),
      cell: (row: GlEntry) => (
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
                  setDetail(row);
                }}
              >
                <Eye className="h-4 w-4" />
                {t("common:view")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      width: "120px",
    },
  ];

  if (!canRead) return <PermissionDenied />;

  // The endpoint returns the whole queue in one response, so paging is local.
  const totalRows = entries.length;
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);
  const totalPage = Math.ceil(totalRows / pageSize) || 1;
  const pageRows = entries.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
          <span className="pro-head-badge">
            <AlertTriangle className="h-4 w-4" />
          </span>
          {t("failed.title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">{t("failed.subtitle")}</p>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <FilterField label={t("gl.filter.currency")}>
            <Select
              value={currency}
              onValueChange={(v) => {
                setCurrency(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full data-[size=default]:h-10 sm:w-56">
                <SelectValue placeholder={t("gl.filter.currency")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t("gl.filter.allCurrencies")}</SelectItem>
                {LEDGER_CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
          <Button variant="outline" className="h-10 gap-2" onClick={load} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common:refresh")}
          </Button>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-sm border border-dashed p-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{t("failed.note")}</span>
        </div>
      </div>

      <div className="pro-card">
        {!isLoading && totalRows === 0 ? (
          <EmptyState icon={AlertTriangle} text={t("failed.empty")} />
        ) : (
          <TableView
            header={headers}
            data={pageRows}
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

      <GlEntryDetail
        entry={detail}
        canRetry={canRetry}
        canReverse={canReverse}
        onClose={() => setDetail(null)}
        onChanged={load}
      />
    </div>
  );
};

export default GlFailedEntries;
