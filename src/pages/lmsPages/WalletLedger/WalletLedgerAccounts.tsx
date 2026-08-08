import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Landmark, RefreshCw, Info, ArrowDownLeft, ArrowUpRight, FileText } from "lucide-react";

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
import { Field } from "../../../components/shared/detailKit";
import { TONES } from "../../../components/shared/detailKitUtils";
import {
  getWalletLedgerAccounts,
  getWalletLedgerCurrencies,
  formatLedgerAmount,
  humanizeCode,
  isUnknownCurrency,
  signedLedgerAmount,
  walletSide,
  type AccountLedger,
} from "../../../redux/apis/apisWalletLedger";

const ALL = "ALL";

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

  const [ledgers, setLedgers] = useState<AccountLedger[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1); // 1-based in the UI, 0-based on the API
  const [pageSize, setPageSize] = useState(15);
  const [statement, setStatement] = useState<AccountLedger | null>(null);

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
          onClick={() => setStatement(row)}
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
        <Button variant="outline" size="sm" className="gap-1" onClick={() => setStatement(row)}>
          <FileText className="h-4 w-4" />
          {t("acc.action.statement")}
        </Button>
      ),
      width: "130px",
    },
  ];

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

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            placeholder={t("acc.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: "1 1 220px", minWidth: 190 }}
          />
          <Input
            placeholder={t("tx.filter.accountCode")}
            value={accountCode}
            onChange={(e) => {
              setAccountCode(e.target.value);
              setPage(1);
            }}
            style={{ width: 150 }}
          />
          <div style={{ width: 140 }}>
            <Select
              value={currency}
              onValueChange={(v) => {
                setCurrency(v);
                setPage(1);
              }}
            >
              <SelectTrigger>
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
          </div>
          <Input
            type="date"
            aria-label={t("common:from")}
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            style={{ width: 150 }}
          />
          <Input
            type="date"
            aria-label={t("common:to")}
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            style={{ width: 150 }}
          />
          <Button variant="outline" className="gap-2" onClick={loadLedgers} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common:refresh")}
          </Button>
        </div>
        <div className="d-flex align-items-start gap-2 mt-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{t("tx.currencyNote")}</span>
        </div>
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

      {/* T-account statement — opening balance, movements, closing balance */}
      <Dialog open={!!statement} onOpenChange={(open) => !open && setStatement(null)}>
        {/* Scrolling lives on the body below: tokens.css sets `overflow: hidden`
            on [data-slot="dialog-content"] unlayered, which outranks utilities. */}
        <DialogContent className="pro-dialog sm:max-w-4xl">
          <DialogHeader className="min-w-0 text-start">
            <DialogTitle className="truncate">
              {statement
                ? `${statement.accountCode} — ${statement.accountName} (${statement.currency})`
                : ""}
            </DialogTitle>
            <DialogDescription className="truncate">
              {statement
                ? `${humanizeCode(statement.accountType)} · ${t("acc.movements", {
                    count: statement.movementCount,
                  })}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {statement && (
            <div className="flex max-h-[70vh] min-w-0 flex-col gap-3 overflow-y-auto overflow-x-hidden">
              <div className="grid min-w-0 gap-x-6 md:grid-cols-2">
                <div className="min-w-0">
                  <Field
                    label={t("acc.opening")}
                    value={formatLedgerAmount(statement.openingBalance, statement.currency)}
                  />
                  <Field
                    label={t("acc.debits")}
                    value={formatLedgerAmount(statement.totalDebits, statement.currency)}
                  />
                </div>
                <div className="min-w-0">
                  <Field
                    label={t("acc.credits")}
                    value={formatLedgerAmount(statement.totalCredits, statement.currency)}
                  />
                  <Field
                    label={t("acc.closing")}
                    value={formatLedgerAmount(statement.closingBalance, statement.currency)}
                  />
                </div>
              </div>

              <div className="w-full min-w-0 overflow-x-auto">
                <table className="mini-table">
                  <thead>
                    <tr>
                      <th>{t("acc.col.date")}</th>
                      <th>{t("acc.col.txnNo")}</th>
                      <th>{t("acc.col.description")}</th>
                      <th>{t("acc.col.contra")}</th>
                      <th className="num">{t("acc.col.debit")}</th>
                      <th className="num">{t("acc.col.credit")}</th>
                      <th className="num">{t("acc.col.amount")}</th>
                      <th className="num">{t("acc.col.balance")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(statement.movements ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted-foreground">
                          {t("acc.noMovements")}
                        </td>
                      </tr>
                    ) : (
                      statement.movements.map((m, i) => {
                        // The other side, relative to this account: money that
                        // left it went to the credited party, and vice versa.
                        const other = walletSide(m.wallet, m.direction === "OUT" ? "to" : "from");
                        // A movement has no unsigned `amount` of its own — the
                        // posted leg is whichever of Dr / Cr is non-zero.
                        const signed = signedLedgerAmount({
                          amount: Math.abs(m.signedAmount ?? m.debitAmount ?? m.creditAmount ?? 0),
                          currency: m.currency,
                          signedAmount: m.signedAmount,
                        });
                        return (
                          <tr key={`${m.entryNumber}-${i}`}>
                            <td className="text-nowrap">{m.entryDate || "-"}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <span className="font-mono text-xs">
                                  {m.wallet?.transactionNumber || m.entryNumber}
                                </span>
                                <DirectionBadge direction={m.direction} />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {humanizeCode(m.transactionType)}
                              </div>
                            </td>
                            <td>{m.description || "-"}</td>
                            <td>
                              {other ? (
                                <>
                                  <div>{other.name}</div>
                                  {other.detail && (
                                    <div className="text-xs text-muted-foreground">
                                      {other.detail}
                                    </div>
                                  )}
                                </>
                              ) : m.contraAccountCode ? (
                                <>
                                  <span className="font-mono text-xs">{m.contraAccountCode}</span>{" "}
                                  {m.contraAccountName}
                                </>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="num">
                              {m.debitAmount ? formatLedgerAmount(m.debitAmount, m.currency) : "-"}
                            </td>
                            <td className="num">
                              {m.creditAmount
                                ? formatLedgerAmount(m.creditAmount, m.currency)
                                : "-"}
                            </td>
                            {/* Signed the same way as runningBalance, so the
                                Amount and Balance columns can never disagree. */}
                            <td
                              className={`num font-medium ${
                                signed.tone === "up"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : signed.tone === "down"
                                    ? "text-red-600 dark:text-red-400"
                                    : ""
                              }`}
                            >
                              {signed.text}
                            </td>
                            <td className="num font-semibold">
                              {formatLedgerAmount(m.runningBalance, m.currency)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletLedgerAccounts;
