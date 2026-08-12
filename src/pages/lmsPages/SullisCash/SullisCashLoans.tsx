import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ChevronDown,
  Eye,
  HandCoins,
  Info,
  RefreshCw,
  SlidersHorizontal,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Field, PermissionDenied } from "../../../components/shared/detailKit";
import { FilterField, SearchField } from "../../../components/shared/filterKit";
import { TONES, formatDateTime, humanizeCode } from "../../../components/shared/detailKitUtils";
import { usePermissions, SULLIS_CASH_PERMISSIONS } from "../../../hooks/useProductPermissions";
import {
  SULLIS_CASH_LOAN_STATUSES,
  formatSullisAmount,
  formatRatePercent,
  getSullisCashLoan,
  getSullisCashLoans,
  getSullisCashLoanStats,
  sullisCashErrorMessage,
  type SullisCashLoan,
  type SullisCashLoanStats,
} from "../../../redux/apis/apisSullisCash";
import { LEDGER_CURRENCIES } from "../../../redux/apis/apisCrudLms";

const ALL = "ALL";

const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

const STATUS_TONE: Record<string, string> = {
  ACTIVE: TONES.emerald,
  REPAID: TONES.slate,
  OVERDUE: TONES.amber,
  DEFAULTED: TONES.red,
  CANCELLED: TONES.slate,
};

const LoanStatusBadge = ({ status }: { status?: string }) => (
  <Badge
    variant="outline"
    className={`border font-medium ${STATUS_TONE[(status || "").toUpperCase()] || TONES.slate}`}
  >
    {humanizeCode(status)}
  </Badge>
);

/** One currency's totals. Never combined with another card — they don't add. */
const StatsCard = ({ stats }: { stats: SullisCashLoanStats }) => {
  const { t } = useTranslation("sullisCash");
  return (
    <div className="card-product p-4 text-dark h-100">
      <div className="d-flex align-items-center justify-content-between gap-2">
        <span style={{ fontSize: 14, fontWeight: 600 }}>{stats.currency}</span>
        <Badge variant="outline" className={`border font-medium ${TONES.slate}`}>
          {t("loans.stats.totalLoans", { count: stats.totalLoans })}
        </Badge>
      </div>
      <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
        {formatSullisAmount(stats.outstandingPrincipal, stats.currency)}
      </div>
      <div className="text-xs text-muted-foreground">{t("loans.stats.outstanding")}</div>
      <div className="mt-2 d-flex flex-wrap gap-3 text-xs">
        <span>
          {t("loans.stats.active")}: <b>{stats.activeLoans}</b>
        </span>
        <span>
          {t("loans.stats.overdue")}: <b>{stats.overdueLoans}</b>
        </span>
        <span>
          {t("loans.stats.disbursed")}:{" "}
          <b>{formatSullisAmount(stats.disbursedPrincipal, stats.currency)}</b>
        </span>
      </div>
    </div>
  );
};

/**
 * The SullisCash loan book.
 *
 * Read-only by design: the API exposes no admin write action on a loan, so
 * there is no settle, waive or cancel to offer. `penaltyAmount`, `payoffAmount`
 * and `overdueDays` on an open loan are computed as of now, and become the
 * settled figures once the loan is repaid.
 */
const SullisCashLoansPage = () => {
  const { t } = useTranslation("sullisCash");
  const { hasPermission } = usePermissions();
  const canRead = hasPermission(SULLIS_CASH_PERMISSIONS.LOANS_READ);

  const [currency, setCurrency] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [walletId, setWalletId] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [loans, setLoans] = useState<SullisCashLoan[]>([]);
  const [stats, setStats] = useState<SullisCashLoanStats[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1); // 1-based here, 0-based on the API
  const [pageSize, setPageSize] = useState(20);
  const [detail, setDetail] = useState<SullisCashLoan | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [search]);

  const loadStats = async () => {
    if (!canRead) return;
    try {
      setStats(await getSullisCashLoanStats());
    } catch (error) {
      toast.error(sullisCashErrorMessage(error, t("loans.toast.statsFailed")));
      setStats([]);
    }
  };

  const loadLoans = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      const res = await getSullisCashLoans({
        currency: currency === ALL ? undefined : currency,
        status: status === ALL ? undefined : status,
        walletId: walletId.trim() || undefined,
        search: debouncedSearch || undefined,
        page: page - 1,
        size: pageSize,
      });
      const body = res?.data;
      setLoans(body?.data ?? []);
      setTotalRows(body?.pagination?.totalElements ?? body?.data?.length ?? 0);
    } catch (error) {
      toast.error(sullisCashErrorMessage(error, t("loans.toast.loadFailed")));
      setLoans([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, status, walletId, debouncedSearch, page, pageSize]);

  const openDetail = async (row: SullisCashLoan) => {
    // Show the list row immediately, then replace it with the full record —
    // only the detail call carries the wallet and the rate snapshot.
    setDetail(row);
    try {
      setDetail(await getSullisCashLoan(row.id));
    } catch (error) {
      toast.error(sullisCashErrorMessage(error, t("loans.toast.detailFailed")));
    }
  };

  const onFilter = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const activeFilterCount = [currency !== ALL, status !== ALL, !!walletId.trim()].filter(
    Boolean
  ).length;

  const headers = [
    {
      name: t("loans.col.loanNumber"),
      cell: (row: SullisCashLoan) => <span className="font-mono text-xs">{row.loanNumber}</span>,
      width: "130px",
    },
    {
      name: t("loans.col.currency"),
      cell: (row: SullisCashLoan) => <span>{row.currency}</span>,
      width: "100px",
    },
    {
      name: t("loans.col.principal"),
      cell: (row: SullisCashLoan) => (
        <span>{formatSullisAmount(row.principalAmount, row.currency)}</span>
      ),
      width: "150px",
    },
    {
      name: t("loans.col.profit"),
      cell: (row: SullisCashLoan) => (
        <span>{formatSullisAmount(row.profitAmount, row.currency)}</span>
      ),
      width: "140px",
    },
    {
      name: t("loans.col.totalDue"),
      cell: (row: SullisCashLoan) => (
        <b>{formatSullisAmount(row.totalDue, row.currency)}</b>
      ),
      width: "150px",
    },
    {
      // What it would cost to clear the loan today: total due plus any penalty.
      name: t("loans.col.payoff"),
      cell: (row: SullisCashLoan) => (
        <div className="flex flex-col">
          <span>{formatSullisAmount(row.payoffAmount, row.currency)}</span>
          {!!row.penaltyAmount && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              +{formatSullisAmount(row.penaltyAmount, row.currency)}
            </span>
          )}
        </div>
      ),
      width: "160px",
    },
    {
      name: t("loans.col.disbursed"),
      cell: (row: SullisCashLoan) => <span>{row.disbursedDate || "-"}</span>,
      width: "120px",
    },
    {
      name: t("loans.col.due"),
      cell: (row: SullisCashLoan) => (
        <div className="flex flex-col">
          <span>{row.dueDate || "-"}</span>
          {!!row.overdueDays && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              {t("loans.overdueDays", { count: row.overdueDays })}
            </span>
          )}
        </div>
      ),
      width: "140px",
    },
    {
      name: t("loans.col.status"),
      cell: (row: SullisCashLoan) => <LoanStatusBadge status={row.status} />,
      width: "130px",
    },
    {
      name: t("loans.col.action"),
      cell: (row: SullisCashLoan) => (
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
                  openDetail(row);
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
            <HandCoins className="h-4 w-4" />
          </span>
          {t("loans.title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">{t("loans.subtitle")}</p>
      </div>

      {/* One card per currency — the API has no grand total and neither do we */}
      {stats.length > 0 && (
        <div className="row gy-3 mb-3">
          {stats.map((s) => (
            <div key={s.currency} className="col-12 col-sm-6 col-xl-4 d-flex">
              <StatsCard stats={s} />
            </div>
          ))}
        </div>
      )}

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchField
            id="sc-loan-search"
            className="flex-1"
            placeholder={t("loans.search")}
            value={search}
            onChange={setSearch}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10 flex-1 gap-2 sm:flex-none"
              aria-expanded={showFilters}
              aria-controls="sc-loan-filters"
              onClick={() => setShowFilters((open) => !open)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t("loans.filter.title")}
              {activeFilterCount > 0 && (
                <Badge variant="outline" className={`border font-medium ${TONES.emerald}`}>
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
              onClick={() => {
                loadLoans();
                loadStats();
              }}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("common:refresh")}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div id="sc-loan-filters" className="mt-3 border-t pt-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FilterField label={t("loans.filter.currency")}>
                <Select value={currency} onValueChange={onFilter(setCurrency)}>
                  <SelectTrigger className="w-full data-[size=default]:h-10">
                    <SelectValue placeholder={t("loans.filter.currency")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{t("loans.filter.allCurrencies")}</SelectItem>
                    {/* Currencies that actually have loans first, then the rest */}
                    {Array.from(
                      new Set([...stats.map((s) => s.currency), ...LEDGER_CURRENCIES])
                    ).map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>

              <FilterField label={t("loans.filter.status")}>
                <Select value={status} onValueChange={onFilter(setStatus)}>
                  <SelectTrigger className="w-full data-[size=default]:h-10">
                    <SelectValue placeholder={t("loans.filter.status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{t("loans.filter.allStatuses")}</SelectItem>
                    {SULLIS_CASH_LOAN_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {humanizeCode(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>

              <FilterField label={t("loans.filter.walletId")} htmlFor="sc-wallet-id">
                <Input
                  id="sc-wallet-id"
                  className="h-10"
                  placeholder={t("loans.filter.walletIdPlaceholder")}
                  value={walletId}
                  onChange={(e) => {
                    setWalletId(e.target.value);
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
                  setCurrency(ALL);
                  setStatus(ALL);
                  setWalletId("");
                  setSearch("");
                  setPage(1);
                }}
              >
                {t("loans.filter.clear")}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-start gap-2 rounded-sm border border-dashed p-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{t("loans.readOnlyNote")}</span>
        </div>
      </div>

      <div className="pro-card">
        <TableView
          header={headers}
          data={loans}
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

      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="pro-dialog sm:max-w-3xl">
          <DialogHeader className="min-w-0 text-start">
            <DialogTitle className="truncate">
              {t("loans.detail.title", { loanNumber: detail?.loanNumber ?? "" })}
            </DialogTitle>
            <DialogDescription className="truncate">
              {detail?.wallet?.maskedName || detail?.wallet?.walletNumber || ""}
            </DialogDescription>
          </DialogHeader>

          {detail && (
            <div className="flex max-h-[70vh] min-w-0 flex-col gap-3 overflow-y-auto overflow-x-hidden">
              <div className="grid min-w-0 gap-x-6 md:grid-cols-2">
                <div className="min-w-0">
                  <Field label={t("loans.detail.status")} value={<LoanStatusBadge status={detail.status} />} />
                  <Field label={t("loans.col.currency")} value={detail.currency} />
                  <Field
                    label={t("loans.col.principal")}
                    value={formatSullisAmount(detail.principalAmount, detail.currency)}
                  />
                  <Field
                    label={t("loans.col.profit")}
                    value={formatSullisAmount(detail.profitAmount, detail.currency)}
                  />
                  <Field
                    label={t("loans.col.totalDue")}
                    value={formatSullisAmount(detail.totalDue, detail.currency)}
                  />
                  <Field
                    label={t("loans.detail.penalty")}
                    value={formatSullisAmount(detail.penaltyAmount, detail.currency)}
                  />
                  <Field
                    label={t("loans.col.payoff")}
                    value={formatSullisAmount(detail.payoffAmount, detail.currency)}
                  />
                  <Field
                    label={t("loans.detail.settled")}
                    value={
                      detail.settledAmount == null
                        ? "—"
                        : formatSullisAmount(detail.settledAmount, detail.currency)
                    }
                  />
                </div>
                <div className="min-w-0">
                  <Field label={t("loans.detail.tenure")} value={detail.tenureDays} />
                  <Field label={t("loans.col.disbursed")} value={detail.disbursedDate} />
                  <Field label={t("loans.col.due")} value={detail.dueDate} />
                  <Field label={t("loans.detail.overdueDays")} value={detail.overdueDays ?? 0} />
                  {/* The loan's OWN terms, frozen at disbursement — compare with
                      the config screen to see whether the product was re-priced. */}
                  <Field
                    label={t("loans.detail.dailyProfitRate")}
                    value={formatRatePercent(detail.dailyProfitRate)}
                  />
                  <Field
                    label={t("loans.detail.penaltyDailyRate")}
                    value={formatRatePercent(detail.penaltyDailyRate)}
                  />
                  <Field
                    label={t("loans.detail.penaltyGraceDays")}
                    value={detail.penaltyGraceDays ?? "—"}
                  />
                  <Field label={t("loans.detail.repaidAt")} value={formatDateTime(detail.repaidAt || undefined)} />
                </div>
              </div>

              <p className="m-0 text-xs text-muted-foreground">{t("loans.detail.snapshotNote")}</p>

              <div className="rounded-md border p-3">
                <div className="mb-2 text-sm font-semibold">{t("loans.detail.wallet")}</div>
                {detail.wallet?.walletNumber || detail.wallet?.customerId ? (
                  <div className="grid gap-x-6 md:grid-cols-2">
                    <Field
                      label={t("loans.detail.walletNumber")}
                      value={detail.wallet?.walletNumber || "—"}
                      mono
                    />
                    <Field
                      label={t("loans.detail.customerId")}
                      value={detail.wallet?.customerId || "—"}
                      mono
                    />
                    <Field
                      label={t("loans.detail.customerName")}
                      value={detail.wallet?.maskedName || "—"}
                    />
                    <Field
                      label={t("loans.detail.walletStatus")}
                      value={detail.wallet?.status || "—"}
                    />
                  </div>
                ) : (
                  // The wallet was purged; the loan is still shown in full.
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{t("loans.detail.walletPurged")}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SullisCashLoansPage;
