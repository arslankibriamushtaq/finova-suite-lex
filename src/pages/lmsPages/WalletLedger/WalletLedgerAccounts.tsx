import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Landmark,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  // Only used by the currency note that is commented out below — kept so that
  // block can be restored as-is.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Info,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
} from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Field } from "../../../components/shared/detailKit";
import { FilterField, SearchField } from "../../../components/shared/filterKit";
import { TONES } from "../../../components/shared/detailKitUtils";
import {
  getWalletLedgerAccounts,
  getWalletLedgerAccountStatement,
  getWalletLedgerCurrencies,
  formatLedgerAmount,
  humanizeCode,
  isUnknownCurrency,
  signedLedgerAmount,
  walletSide,
  type AccountLedger,
  type AccountMovement,
  type AccountStatementData,
} from "../../../redux/apis/apisWalletLedger";

const ALL = "ALL";

/**
 * Row-action dropdown trigger, identical to the other tables. The emerald
 * paint, padding and height come from the global table-action rules in
 * tokens.css, which key off `bg-foreground` / `aria-haspopup` — so keep those
 * classes for the button to look like every other Action column in the app.
 */
const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

/** IN = this account was debited, OUT = credited. */
const DirectionBadge = ({ direction }: { direction: string }) => {
  const { t } = useTranslation("walletLedger");
  const isIn = direction === "IN";
  return (
    <Badge
      variant="outline"
      className={`border font-medium gap-1 ${isIn ? TONES.emerald : TONES.red}`}
    >
      {isIn ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
      {isIn ? t("acc.direction.in") : t("acc.direction.out")}
    </Badge>
  );
};

const WalletLedgerAccounts = () => {
  const { t } = useTranslation("walletLedger");
  const [searchParams, setSearchParams] = useSearchParams();

  const [currencies, setCurrencies] = useState<string[]>([]);
  const [currency, setCurrency] = useState(searchParams.get("currency") || ALL);
  const [accountCode, setAccountCode] = useState(searchParams.get("accountCode") || "");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // The advanced filters stay collapsed until asked for — the page opens on
  // just the search row. It starts open when the URL arrives carrying a filter
  // (the Transactions page links here with accountCode / currency set), so the
  // narrowed result set is never unexplained.
  const [showFilters, setShowFilters] = useState(
    !!searchParams.get("accountCode") || !!searchParams.get("currency")
  );

  const [ledgers, setLedgers] = useState<AccountLedger[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1); // 1-based in the UI, 0-based on the API
  const [pageSize, setPageSize] = useState(15);

  // The statement lives behind its own paginated endpoint, fetched when a row
  // is opened — the listing carries balances only.
  const [openRow, setOpenRow] = useState<AccountLedger | null>(null);
  const [statement, setStatement] = useState<AccountStatementData | null>(null);
  const [stmtLoading, setStmtLoading] = useState(false);
  const [stmtPage, setStmtPage] = useState(1);
  const [stmtPageSize, setStmtPageSize] = useState(10);
  const [stmtTotalRows, setStmtTotalRows] = useState(0);

  useEffect(() => {
    getWalletLedgerCurrencies()
      .then((res) => {
        const list = res?.data?.data ?? [];
        setCurrencies(Array.isArray(list) ? list : []);
      })
      .catch(() => setCurrencies([]));
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [search]);

  // Keep the URL in step so an account statement can be linked to directly.
  useEffect(() => {
    const next = new URLSearchParams();
    if (accountCode.trim()) next.set("accountCode", accountCode.trim());
    if (currency !== ALL) next.set("currency", currency);
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountCode, currency]);

  const loadLedgers = async () => {
    setIsLoading(true);
    try {
      const res = await getWalletLedgerAccounts({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        currency: currency === ALL ? undefined : currency,
        accountCode: accountCode.trim() || undefined,
        search: debouncedSearch || undefined,
        page: page - 1,
        size: pageSize,
      });
      const body = res?.data;
      setLedgers(body?.data?.ledgers ?? []);
      setTotalRows(body?.pagination?.totalElements ?? body?.data?.totalLedgers ?? 0);
    } catch (error: any) {
      const notFound = error?.response?.status === 404;
      toast.error(
        notFound ? t("acc.notFound") : error?.response?.data?.message || t("acc.toast.loadFailed")
      );
      setLedgers([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLedgers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, currency, accountCode, debouncedSearch, page, pageSize]);

  /** Open a row's statement — the currency is required by the endpoint. */
  const openStatement = (row: AccountLedger) => {
    setOpenRow(row);
    setStatement(null);
    setStmtPage(1);
    setStmtTotalRows(row.movementCount ?? 0);
  };

  const closeStatement = () => {
    setOpenRow(null);
    setStatement(null);
    setStmtTotalRows(0);
  };

  useEffect(() => {
    if (!openRow) return;
    let cancelled = false;
    const loadStatement = async () => {
      setStmtLoading(true);
      try {
        const res = await getWalletLedgerAccountStatement(openRow.accountCode, {
          currency: openRow.currency,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          page: stmtPage - 1,
          size: stmtPageSize,
        });
        if (cancelled) return;
        const body = res?.data;
        setStatement(body?.data ?? null);
        setStmtTotalRows(body?.pagination?.totalElements ?? 0);
      } catch (error: any) {
        if (cancelled) return;
        toast.error(error?.response?.data?.message || t("acc.toast.statementFailed"));
        setStatement(null);
      } finally {
        if (!cancelled) setStmtLoading(false);
      }
    };
    loadStatement();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openRow, stmtPage, stmtPageSize, fromDate, toDate]);

  // The movements table mirrors the entries table: no font-size overrides and
  // stacked (not inline) lines, so TableView's width measurement matches.
  const movementHeaders = [
    {
      name: t("acc.col.date"),
      cell: (m: AccountMovement) => <span>{m.entryDate || "-"}</span>,
      width: "110px",
    },
    {
      name: t("acc.col.txnNo"),
      cell: (m: AccountMovement) => (
        <div className="flex flex-col">
          <span className="font-mono">{m.wallet?.transactionNumber || m.entryNumber}</span>
          <span className="text-muted-foreground">{humanizeCode(m.transactionType)}</span>
        </div>
      ),
      width: "220px",
    },
    {
      name: t("acc.col.description"),
      cell: (m: AccountMovement) => <span>{m.description || "-"}</span>,
      width: "260px",
    },
    {
      // The other side, relative to this account: money that left it went to
      // the credited party, and vice versa.
      name: t("acc.col.contra"),
      cell: (m: AccountMovement) => {
        const other = walletSide(m.wallet, m.direction === "OUT" ? "to" : "from");
        if (other) {
          return (
            <div className="flex flex-col">
              <span>{other.name}</span>
              {other.detail && <span className="text-muted-foreground">{other.detail}</span>}
            </div>
          );
        }
        return m.contraAccountCode ? (
          <div className="flex flex-col">
            <span className="font-mono">{m.contraAccountCode}</span>
            <span>{m.contraAccountName}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
      width: "220px",
    },
    {
      name: t("acc.col.debit"),
      cell: (m: AccountMovement) => (
        <span>{m.debitAmount ? formatLedgerAmount(m.debitAmount, m.currency) : ""}</span>
      ),
      width: "140px",
    },
    {
      name: t("acc.col.credit"),
      cell: (m: AccountMovement) => (
        <span>{m.creditAmount ? formatLedgerAmount(m.creditAmount, m.currency) : ""}</span>
      ),
      width: "140px",
    },
    {
      name: t("acc.col.amount"),
      cell: (m: AccountMovement) => {
        const signed = signedLedgerAmount({
          amount: Math.abs(m.signedAmount ?? m.debitAmount ?? m.creditAmount ?? 0),
          currency: m.currency,
          signedAmount: m.signedAmount,
        });
        return (
          <span
            className={`font-medium ${
              signed.tone === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : signed.tone === "down"
                  ? "text-red-600 dark:text-red-400"
                  : ""
            }`}
          >
            {signed.text}
          </span>
        );
      },
      width: "150px",
    },
    {
      // Accumulated server-side across the whole window, so it carries over
      // between pages — never recomputed here from the rows on screen.
      name: t("acc.col.balance"),
      cell: (m: AccountMovement) => (
        <span className="font-semibold">{formatLedgerAmount(m.runningBalance, m.currency)}</span>
      ),
      width: "160px",
    },
    {
      name: t("acc.direction.in") + " / " + t("acc.direction.out"),
      cell: (m: AccountMovement) => <DirectionBadge direction={m.direction} />,
      width: "110px",
    },
  ];

  // One row per (account, currency) pair — an account holding two currencies
  // appears twice, and the two are never added together.
  const headers = [
    {
      name: t("acc.col.account"),
      // Code and name stack: TableView sizes a column from its widest stacked
      // line, but measures inline siblings as the widest single one — so an
      // inline "code + name" renders wider than the column it is given.
      cell: (row: AccountLedger) => (
        <button
          type="button"
          onClick={() => openStatement(row)}
          className="flex flex-col text-start text-primary hover:underline"
        >
          <span className="font-mono">{row.accountCode}</span>
          <span>{row.accountName}</span>
        </button>
      ),
      width: "330px",
    },
    {
      name: t("acc.col.type"),
      cell: (row: AccountLedger) => <span>{humanizeCode(row.accountType)}</span>,
      width: "110px",
    },
    {
      name: t("acc.col.currency"),
      cell: (row: AccountLedger) => (
        <span
          className="font-semibold"
          title={isUnknownCurrency(row.currency) ? t("tx.currencyUnknown") : undefined}
        >
          {row.currency}
        </span>
      ),
      width: "100px",
    },
    {
      name: t("acc.opening"),
      cell: (row: AccountLedger) => (
        <span>{formatLedgerAmount(row.openingBalance, row.currency)}</span>
      ),
      width: "150px",
    },
    {
      name: t("acc.debits"),
      cell: (row: AccountLedger) => (
        <span>{formatLedgerAmount(row.totalDebits, row.currency)}</span>
      ),
      width: "150px",
    },
    {
      name: t("acc.credits"),
      cell: (row: AccountLedger) => (
        <span>{formatLedgerAmount(row.totalCredits, row.currency)}</span>
      ),
      width: "150px",
    },
    {
      name: t("acc.closing"),
      cell: (row: AccountLedger) => (
        <span className="font-semibold">
          {formatLedgerAmount(row.closingBalance, row.currency)}
        </span>
      ),
      width: "160px",
    },
    {
      name: t("acc.col.movementCount"),
      cell: (row: AccountLedger) => <span>{row.movementCount}</span>,
      width: "110px",
    },
    {
      name: t("acc.col.action"),
      cell: (row: AccountLedger) => (
        // Row clicks are stopped here so opening the menu never triggers the
        // row's own handlers, same as every other Action column in the app.
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
                // Nothing to open when the window holds no movements.
                disabled={!row.movementCount}
                onSelect={(e) => {
                  e.preventDefault();
                  openStatement(row);
                }}
              >
                <FileText className="h-4 w-4" />
                {t("acc.action.statement")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      width: "120px",
    },
  ];

  // How many of the collapsed filters are applied — search is excluded, it has
  // its own visible field. Shown on the Filters button so a hidden filter is
  // never a surprise, and it keeps Clear disabled while nothing is set.
  const activeFilterCount = [
    currency !== ALL,
    !!accountCode.trim(),
    !!fromDate,
    !!toDate,
  ].filter(Boolean).length;

  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);
  const totalPage = Math.ceil(totalRows / pageSize) || 1;

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
          <span className="pro-head-badge">
            <Landmark className="h-4 w-4" />
          </span>
          {t("acc.title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">{t("acc.subtitle")}</p>
      </div>

      {/* Search stays out front; the rest of the filters live behind the
          Filters button so the page opens on one clean row. The panel is a
          labelled grid that collapses 4 → 3 → 2 → 1 from desktop to phone. */}
      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchField
            id="accounts-search"
            className="flex-1"
            placeholder={t("acc.search")}
            value={search}
            onChange={setSearch}
          />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10 flex-1 gap-2 sm:flex-none"
              aria-expanded={showFilters}
              aria-controls="accounts-filter-panel"
              onClick={() => setShowFilters((open) => !open)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t("tx.filter.title")}
              {activeFilterCount > 0 && (
                <Badge
                  variant="outline"
                  title={t("tx.filter.active", { count: activeFilterCount })}
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
              onClick={loadLedgers}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("common:refresh")}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div id="accounts-filter-panel" className="mt-3 border-t pt-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <FilterField label={t("tx.filter.accountCode")} htmlFor="accounts-account-code">
                <Input
                  id="accounts-account-code"
                  className="h-10"
                  placeholder={t("tx.filter.accountCode")}
                  value={accountCode}
                  onChange={(e) => {
                    setAccountCode(e.target.value);
                    setPage(1);
                  }}
                />
              </FilterField>

              <FilterField label={t("tx.filter.currency")}>
                <Select
                  value={currency}
                  onValueChange={(v) => {
                    setCurrency(v);
                    setPage(1);
                  }}
                >
                  {/* h-10 to match the search field; the data-size variant is
                      what SelectTrigger sizes itself with, so plain h-10 loses. */}
                  <SelectTrigger className="w-full data-[size=default]:h-10">
                    <SelectValue placeholder={t("tx.filter.currency")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{t("tx.filter.allCurrencies")}</SelectItem>
                    {currencies.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>

              <FilterField label={t("common:from")} htmlFor="accounts-from-date">
                <Input
                  id="accounts-from-date"
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

              <FilterField label={t("common:to")} htmlFor="accounts-to-date">
                <Input
                  id="accounts-to-date"
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
                  setCurrency(ALL);
                  setAccountCode("");
                  setSearch("");
                  setFromDate("");
                  setToDate("");
                  setPage(1);
                }}
              >
                {t("tx.filter.clear")}
              </Button>
            </div>
          </div>
        )}

        {/* Hidden on request. The wallet posting path does not send a currency
            yet, so older rows landed on the SAR default — the note explained
            that. Restore this block when the note is wanted back on screen.
        <div className="d-flex align-items-start gap-2 mt-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{t("tx.currencyNote")}</span>
        </div>
        */}
      </div>

      <div className="pro-card">
        <TableView
          header={headers}
          data={ledgers}
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

      {/* Statement detail — fetched per row from its own paginated endpoint */}
      <Dialog open={!!openRow} onOpenChange={(open) => !open && closeStatement()}>
        {/* Scrolling lives on the body below: tokens.css sets `overflow: hidden`
            on [data-slot="dialog-content"] unlayered, which outranks utilities. */}
        <DialogContent className="pro-dialog sm:max-w-5xl">
          <DialogHeader className="min-w-0 text-start">
            <DialogTitle className="truncate">
              {openRow
                ? `${openRow.accountCode} — ${openRow.accountName} (${openRow.currency})`
                : ""}
            </DialogTitle>
            <DialogDescription className="truncate">
              {openRow
                ? `${humanizeCode(openRow.accountType)} · ${t("acc.movements", {
                    count: openRow.movementCount,
                  })}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {openRow && (
            <div className="flex max-h-[70vh] min-w-0 flex-col gap-3 overflow-y-auto overflow-x-hidden">
              {/* Window balances — the listing already carries the same numbers,
                  so they show immediately and never flicker while paging. */}
              <div className="grid min-w-0 gap-x-6 md:grid-cols-2">
                <div className="min-w-0">
                  <Field
                    label={t("acc.opening")}
                    value={formatLedgerAmount(
                      statement?.openingBalance ?? openRow.openingBalance,
                      openRow.currency
                    )}
                  />
                  <Field
                    label={t("acc.debits")}
                    value={formatLedgerAmount(
                      statement?.totalDebits ?? openRow.totalDebits,
                      openRow.currency
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <Field
                    label={t("acc.credits")}
                    value={formatLedgerAmount(
                      statement?.totalCredits ?? openRow.totalCredits,
                      openRow.currency
                    )}
                  />
                  <Field
                    label={t("acc.closing")}
                    value={formatLedgerAmount(
                      statement?.closingBalance ?? openRow.closingBalance,
                      openRow.currency
                    )}
                  />
                </div>
              </div>

              <TableView
                header={movementHeaders}
                data={statement?.movements ?? []}
                totalRows={stmtTotalRows}
                isLoading={stmtLoading}
                from={stmtTotalRows === 0 ? 0 : (stmtPage - 1) * stmtPageSize + 1}
                to={Math.min(stmtPage * stmtPageSize, stmtTotalRows)}
                page={stmtPage}
                totalPage={Math.ceil(stmtTotalRows / stmtPageSize) || 1}
                setPage={setStmtPage}
                pageSize={stmtPageSize}
                setPageSize={(size: number) => {
                  setStmtPageSize(size);
                  setStmtPage(1);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletLedgerAccounts;
