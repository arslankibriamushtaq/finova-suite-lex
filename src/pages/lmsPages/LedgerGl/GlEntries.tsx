import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  Eye,
  Info,
  RefreshCw,
  Repeat,
  SlidersHorizontal,
  Undo2,
} from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
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
import { FilterField, SearchField } from "../../../components/shared/filterKit";
import { TONES, humanizeCode } from "../../../components/shared/detailKitUtils";
import { PermissionDenied } from "../../../components/shared/detailKit";
import { useProductPermissions, LEDGER_GL_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { ledgerErrorMessage } from "../../../utils/ledgerErrors";
import {
  GL_ENTRY_STATUSES,
  formatGlAmount,
  getGlEntries,
  type GlEntry,
} from "../../../redux/apis/apisLedgerGl";
import { LEDGER_CURRENCIES } from "../../../redux/apis/apisCrudLms";
import GlEntryDetail, { GlStatusBadge } from "./GlEntryDetail";

const ALL = "ALL";

const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

/**
 * GL entry enquiry.
 *
 * The list deliberately totals nothing, which is why the currency filter is
 * optional here — an operator hunting "that entry from Tuesday" does not yet
 * know its currency. Anything that does total lives on the reconciliation
 * screen, per currency.
 */
const GlEntries = () => {
  const { t } = useTranslation("ledgerGl");
  const { hasPermission } = useProductPermissions();

  const canRead = hasPermission(LEDGER_GL_PERMISSIONS.READ);
  const canRetry = hasPermission(LEDGER_GL_PERMISSIONS.RETRY);
  const canReverse = hasPermission(LEDGER_GL_PERMISSIONS.REVERSE);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState(ALL);
  const [entryType, setEntryType] = useState(ALL);
  const [currency, setCurrency] = useState(ALL);
  const [loanId, setLoanId] = useState("");
  const [accountCode, setAccountCode] = useState("");
  const [subLedgerId, setSubLedgerId] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [entries, setEntries] = useState<GlEntry[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1); // 1-based in the UI, 0-based on the API
  const [pageSize, setPageSize] = useState(10);
  const [detail, setDetail] = useState<GlEntry | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [search]);

  const loadEntries = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      const res = await getGlEntries({
        from: fromDate || undefined,
        to: toDate || undefined,
        status: status === ALL ? undefined : status,
        type: entryType === ALL ? undefined : entryType,
        currency: currency === ALL ? undefined : currency,
        loanId: loanId.trim() || undefined,
        accountCode: accountCode.trim() || undefined,
        subLedgerId: subLedgerId.trim() || undefined,
        search: debouncedSearch || undefined,
        page: page - 1,
        size: pageSize,
        sortBy: "entryDate",
        sortDirection: "DESC",
      });
      const body = res?.data;
      setEntries(body?.data?.entries ?? []);
      setTotalRows(body?.pagination?.totalElements ?? body?.data?.totalCount ?? 0);
    } catch (error: any) {
      toast.error(ledgerErrorMessage(error, t("gl.toast.loadFailed")));
      setEntries([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fromDate,
    toDate,
    status,
    entryType,
    currency,
    loanId,
    accountCode,
    subLedgerId,
    debouncedSearch,
    page,
    pageSize,
  ]);

  const onFilter = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  /** Entry types follow the data — the backend adds new ones as rails land. */
  const entryTypes = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => e.entryType && set.add(e.entryType));
    return Array.from(set).sort();
  }, [entries]);

  const activeFilterCount = [
    status !== ALL,
    entryType !== ALL,
    currency !== ALL,
    !!loanId.trim(),
    !!accountCode.trim(),
    !!subLedgerId.trim(),
    !!fromDate,
    !!toDate,
  ].filter(Boolean).length;

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
      // Entry types run long — WALLET_TRANSFER_P2P_WALLET_NUMBER is four words
      // once humanised — so the cell wraps rather than clipping the tail, which
      // is the part that distinguishes one transfer type from another.
      name: t("gl.col.type"),
      cell: (row: GlEntry) => (
        <span style={{ whiteSpace: "break-spaces" }} title={row.entryType || ""}>
          {humanizeCode(row.entryType) || "-"}
        </span>
      ),
      width: "220px",
    },
    {
      name: t("gl.col.description"),
      cell: (row: GlEntry) => (
        <span style={{ whiteSpace: "break-spaces" }}>{row.description || "-"}</span>
      ),
      width: "240px",
    },
    {
      name: t("gl.col.currency"),
      cell: (row: GlEntry) => <span>{row.currency}</span>,
      width: "100px",
    },
    {
      // Raw totals for this entry, in this entry's own currency. Two rows in
      // different currencies are never added together anywhere on this page.
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
          <GlStatusBadge status={row.status} />
          {row.reversal && (
            <Badge variant="outline" className={`border gap-1 font-medium ${TONES.amber}`}>
              <Undo2 className="h-3 w-3" />
              {t("gl.badge.reversal")}
            </Badge>
          )}
          {!row.balanced && (
            <Badge variant="outline" className={`border gap-1 font-medium ${TONES.red}`}>
              <AlertTriangle className="h-3 w-3" />
              {t("gl.badge.unbalanced")}
            </Badge>
          )}
          {row.fxTransactionId && (
            <Badge
              variant="outline"
              title={t("gl.badge.fxHint")}
              className={`border gap-1 font-medium ${TONES.sky}`}
            >
              <Repeat className="h-3 w-3" />
              {t("gl.badge.fx")}
            </Badge>
          )}
        </div>
      ),
      width: "220px",
    },
    {
      name: t("gl.col.sync"),
      cell: (row: GlEntry) => (
        <Badge
          variant="outline"
          className={`border font-medium ${row.fineractSynced ? TONES.emerald : TONES.slate}`}
        >
          {row.fineractSynced ? t("gl.sync.synced") : t("gl.sync.pending")}
        </Badge>
      ),
      width: "140px",
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

  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);
  const totalPage = Math.ceil(totalRows / pageSize) || 1;

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
          <span className="pro-head-badge">
            <BookOpen className="h-4 w-4" />
          </span>
          {t("gl.title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">{t("gl.subtitle")}</p>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchField
            id="gl-search"
            className="flex-1"
            placeholder={t("gl.search")}
            value={search}
            onChange={setSearch}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10 flex-1 gap-2 sm:flex-none"
              aria-expanded={showFilters}
              aria-controls="gl-filter-panel"
              onClick={() => setShowFilters((open) => !open)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t("gl.filter.title")}
              {activeFilterCount > 0 && (
                <Badge
                  variant="outline"
                  title={t("gl.filter.active", { count: activeFilterCount })}
                  className={`border font-medium ${TONES.emerald}`}
                >
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </Button>
            <Button
              variant="outline"
              className="h-10 flex-1 gap-2 sm:flex-none"
              onClick={loadEntries}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("common:refresh")}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div id="gl-filter-panel" className="mt-3 border-t pt-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <FilterField label={t("gl.filter.status")}>
                <Select value={status} onValueChange={onFilter(setStatus)}>
                  <SelectTrigger className="w-full data-[size=default]:h-10">
                    <SelectValue placeholder={t("gl.filter.status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{t("gl.filter.allStatuses")}</SelectItem>
                    {GL_ENTRY_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {humanizeCode(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>

              <FilterField label={t("gl.filter.type")}>
                <Select value={entryType} onValueChange={onFilter(setEntryType)}>
                  <SelectTrigger className="w-full data-[size=default]:h-10">
                    <SelectValue placeholder={t("gl.filter.type")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{t("gl.filter.allTypes")}</SelectItem>
                    {entryTypes.map((ty) => (
                      <SelectItem key={ty} value={ty}>
                        {humanizeCode(ty)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>

              <FilterField label={t("gl.filter.currency")}>
                <Select value={currency} onValueChange={onFilter(setCurrency)}>
                  <SelectTrigger className="w-full data-[size=default]:h-10">
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

              <FilterField label={t("gl.filter.loanId")} htmlFor="gl-loan-id">
                <Input
                  id="gl-loan-id"
                  className="h-10"
                  placeholder={t("gl.filter.loanId")}
                  value={loanId}
                  onChange={(e) => {
                    setLoanId(e.target.value);
                    setPage(1);
                  }}
                />
              </FilterField>

              <FilterField label={t("gl.filter.accountCode")} htmlFor="gl-account-code">
                <Input
                  id="gl-account-code"
                  className="h-10"
                  placeholder={t("gl.filter.accountCode")}
                  value={accountCode}
                  onChange={(e) => {
                    setAccountCode(e.target.value);
                    setPage(1);
                  }}
                />
              </FilterField>

              {/* Every customer's wallet balance sits on one control account,
                  so the account-code filter cannot separate them — this can. */}
              <FilterField label={t("gl.filter.subLedgerId")} htmlFor="gl-sub-ledger-id">
                <Input
                  id="gl-sub-ledger-id"
                  className="h-10"
                  placeholder={t("gl.filter.subLedgerIdPlaceholder")}
                  value={subLedgerId}
                  onChange={(e) => {
                    setSubLedgerId(e.target.value);
                    setPage(1);
                  }}
                />
              </FilterField>

              <FilterField label={t("common:from")} htmlFor="gl-from-date">
                <Input
                  id="gl-from-date"
                  className="h-10"
                  type="date"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                />
              </FilterField>

              <FilterField label={t("common:to")} htmlFor="gl-to-date">
                <Input
                  id="gl-to-date"
                  className="h-10"
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                />
              </FilterField>
            </div>

            <div className="mt-3 flex justify-end">
              <Button
                variant="ghost"
                className="w-full sm:w-auto"
                disabled={activeFilterCount === 0 && !search.trim()}
                onClick={() => {
                  setStatus(ALL);
                  setEntryType(ALL);
                  setCurrency(ALL);
                  setLoanId("");
                  setAccountCode("");
                  setSubLedgerId("");
                  setSearch("");
                  setFromDate("");
                  setToDate("");
                  setPage(1);
                }}
              >
                {t("gl.filter.clear")}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-start gap-2 rounded-sm border border-dashed p-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{t("gl.filter.currencyHint")}</span>
        </div>
      </div>

      <div className="pro-card">
        <TableView
          header={headers}
          data={entries}
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
      </div>

      <GlEntryDetail
        entry={detail}
        canRetry={canRetry}
        canReverse={canReverse}
        onClose={() => setDetail(null)}
        onChanged={loadEntries}
      />
    </div>
  );
};

export default GlEntries;
