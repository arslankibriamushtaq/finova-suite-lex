import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  BookOpen,
  Eye,
  RefreshCw,
  Info,
  AlertTriangle,
  Undo2,
  Coins,
  ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";

// Shared stat-card styling used by every dashboard-style KPI row in the app.
import "../../../components/Dashboard/DashboardOverview.css";
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
  getWalletLedgerCurrencies,
  getWalletLedgerEntries,
  getWalletLedgerSummary,
  formatLedgerAmount,
  humanizeCode,
  isUnknownCurrency,
  signedLedgerAmount,
  walletSide,
  type CurrencySummary,
  type EntriesTotals,
  type PartyView,
  type WalletCounterparty,
  type WalletLedgerEntry,
  type WalletParty,
} from "../../../redux/apis/apisWalletLedger";

const ALL = "ALL";

/** Documented reference types; the list grows as new wallet rails are added. */
const REFERENCE_TYPES = [
  "WALLET_TRANSFER",
  "EXTERNAL_TRANSFER",
  "IBFT",
  "SWIFT",
  "IBFT_FEE",
  "SWIFT_FEE",
  "EXTERNAL_TRANSFER_FEE",
];

/** Ledger statuses aren't in the shared statusTone map, so tone them here. */
const STATUS_TONE: Record<string, string> = {
  POSTED: TONES.emerald,
  REVERSED: TONES.amber,
};

/** Brand color per currency card — same palette as the dashboard stat cards. */
const CARD_THEMES = ["emerald", "teal", "indigo", "amber", "cyan", "violet", "green", "rose"];

const StatusBadge = ({ status }: { status?: string }) => (
  <Badge
    variant="outline"
    className={`border font-medium ${STATUS_TONE[(status || "").toUpperCase()] || TONES.slate}`}
  >
    {humanizeCode(status)}
  </Badge>
);

/** Section divider inside the detail dialog. */
const SectionTitle = ({ icon: Icon, title }: { icon: LucideIcon; title: string }) => (
  <div className="flex items-center gap-2 border-b pb-1 pt-1">
    <Icon className="h-4 w-4 text-emerald-600" />
    <span className="text-sm font-semibold">{title}</span>
  </div>
);

/** A wallet on one side of the transfer, or the note that this side is external. */
const WalletBox = ({ label, party }: { label: string; party?: WalletParty | null }) => {
  const { t } = useTranslation("walletLedger");
  return (
    <div className="min-w-0 rounded-sm border p-2">
      <div className="mb-1 text-xs font-semibold text-muted-foreground">{label}</div>
      {party ? (
        <>
          <div className="truncate text-sm font-medium">{party.customerName || "—"}</div>
          <div className="truncate text-xs text-muted-foreground">
            {t("detail.walletNumber")}: <span className="font-mono">{party.walletNumber}</span>
            {party.currency ? ` · ${party.currency}` : ""}
          </div>
          {party.mobileNumber && (
            <div className="truncate text-xs text-muted-foreground">
              {t("detail.mobile")}: {party.mobileNumber}
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-muted-foreground">—</div>
      )}
    </div>
  );
};

/** The party outside the platform (bank account, beneficiary, employee). */
const CounterpartyBox = ({ party }: { party: WalletCounterparty }) => {
  const { t } = useTranslation("walletLedger");
  const rows = [
    { label: t("detail.accountNumber"), value: party.accountNumber },
    { label: t("detail.bankCode"), value: party.bankCode },
    { label: t("detail.mobile"), value: party.mobileNumber },
    { label: t("detail.email"), value: party.email },
  ].filter((r) => r.value);
  return (
    <div className="min-w-0 rounded-sm border p-2">
      <div className="mb-1 text-xs font-semibold text-muted-foreground">
        {t("detail.counterparty")}
      </div>
      <div className="truncate text-sm font-medium">{party.name || "—"}</div>
      {rows.map((r) => (
        <div key={r.label} className="truncate text-xs text-muted-foreground">
          {r.label}: {r.value}
        </div>
      ))}
    </div>
  );
};

/** One card per currency — never a grand total, the API deliberately has none. */
const CurrencyCard = ({ summary, theme }: { summary: CurrencySummary; theme: string }) => {
  const { t } = useTranslation("walletLedger");
  return (
    <div className={`stat-card stat-card--${theme}`}>
      <div className="stat-card__row">
        <span className="stat-card__title">
          {summary.currency} · {t("summary.entries")}
        </span>
        <span className="stat-card__icon">
          <Coins strokeWidth={2} />
        </span>
      </div>

      <div className="stat-card__value-row">
        <p className="stat-card__value">{summary.entryCount}</p>
        {summary.balanced ? (
          <span className="stat-card__chip stat-card__chip--neutral">{t("summary.balanced")}</span>
        ) : (
          <span
            className="stat-card__chip stat-card__chip--down d-inline-flex align-items-center gap-1"
            title={t("summary.unbalancedHint")}
          >
            <AlertTriangle className="h-3 w-3" />
            {t("summary.unbalanced")}
          </span>
        )}
      </div>

      {/* Debit / credit and the top transaction types, in the card's footer */}
      <div className="mt-auto pb-3">
        <div className="d-flex justify-content-between gap-2 text-xs">
          <span className="text-muted-foreground">{t("summary.totalDebit")}</span>
          <span className="font-semibold">
            {formatLedgerAmount(summary.totalDebit, summary.currency)}
          </span>
        </div>
        <div className="d-flex justify-content-between gap-2 text-xs">
          <span className="text-muted-foreground">{t("summary.totalCredit")}</span>
          <span className="font-semibold">
            {formatLedgerAmount(summary.totalCredit, summary.currency)}
          </span>
        </div>

        {summary.byTransactionType?.length ? (
          <div className="border-top mt-2 pt-2">
            {summary.byTransactionType.slice(0, 3).map((b) => (
              <div key={b.transactionType} className="d-flex justify-content-between gap-2 text-xs">
                <span className="text-muted-foreground text-truncate">
                  {humanizeCode(b.transactionType)} ({b.entryCount})
                </span>
                <span className="font-medium">
                  {formatLedgerAmount(b.totalAmount, summary.currency)}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const WalletLedgerTransactions = () => {
  const { t } = useTranslation("walletLedger");
  const navigate = useNavigate();

  const [currencies, setCurrencies] = useState<string[]>([]);
  const [currency, setCurrency] = useState(ALL);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [referenceType, setReferenceType] = useState(ALL);
  const [transactionType, setTransactionType] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [accountCode, setAccountCode] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [entries, setEntries] = useState<WalletLedgerEntry[]>([]);
  const [totals, setTotals] = useState<EntriesTotals[]>([]);
  const [summary, setSummary] = useState<CurrencySummary[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1); // 1-based in the UI, 0-based on the API
  const [pageSize, setPageSize] = useState(20);
  const [detail, setDetail] = useState<WalletLedgerEntry | null>(null);

  // Build the currency dropdown from the API — never hardcode the list.
  useEffect(() => {
    getWalletLedgerCurrencies()
      .then((res) => {
        const list = res?.data?.data ?? [];
        setCurrencies(Array.isArray(list) ? list : []);
      })
      .catch((error: any) =>
        toast.error(error?.response?.data?.message || t("tx.toast.currenciesFailed"))
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [search]);

  const loadSummary = async () => {
    try {
      const res = await getWalletLedgerSummary({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setSummary(res?.data?.data?.currencies ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("tx.toast.summaryFailed"));
      setSummary([]);
    }
  };

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const res = await getWalletLedgerEntries({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        currency: currency === ALL ? undefined : currency,
        referenceType: referenceType === ALL ? undefined : referenceType,
        transactionType: transactionType === ALL ? undefined : transactionType,
        status: status === ALL ? undefined : status,
        accountCode: accountCode.trim() || undefined,
        search: debouncedSearch || undefined,
        page: page - 1,
        size: pageSize,
      });
      const body = res?.data;
      setEntries(body?.data?.entries ?? []);
      // Server-side over the whole filtered set — never sum the page here.
      setTotals(body?.data?.totals ?? []);
      setTotalRows(body?.pagination?.totalElements ?? body?.data?.totalEntries ?? 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("tx.toast.loadFailed"));
      setEntries([]);
      setTotals([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fromDate,
    toDate,
    currency,
    referenceType,
    transactionType,
    status,
    accountCode,
    debouncedSearch,
    page,
    pageSize,
  ]);

  // Reset to the first page whenever a filter narrows the result set.
  const onFilter = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  /** Transaction types come off the summary, so the list follows the data. */
  const transactionTypes = useMemo(() => {
    const set = new Set<string>();
    summary.forEach((c) =>
      c.byTransactionType?.forEach((b) => b.transactionType && set.add(b.transactionType))
    );
    entries.forEach((e) => e.transactionType && set.add(e.transactionType));
    return Array.from(set).sort();
  }, [summary, entries]);

  const statuses = useMemo(() => {
    const set = new Set<string>(["POSTED", "REVERSED"]);
    entries.forEach((e) => e.status && set.add(e.status));
    return Array.from(set).sort();
  }, [entries]);

  /**
   * The account the Dr / Cr / signed-amount columns are measured from. It comes
   * back on the rows (the accountCode filter when set, else Consumer Wallet).
   */
  const perspective = useMemo(() => {
    const row = entries.find((e) => e.perspectiveAccountCode);
    if (!row) return "";
    return [row.perspectiveAccountCode, row.perspectiveAccountName].filter(Boolean).join(" ");
  }, [entries]);

  // SAR is the posting path's default, not a real currency — no tile for it.
  const visibleSummary = summary
    .filter((c) => !isUnknownCurrency(c.currency))
    .filter((c) => currency === ALL || c.currency === currency);

  const openAccount = (code?: string, cur?: string) => {
    if (!code) return;
    const params = new URLSearchParams({ accountCode: code });
    if (cur) params.append("currency", cur);
    navigate(`/LOS/WalletLedger/Accounts?${params.toString()}`);
  };

  const AccountLink = ({ code, name, cur }: { code?: string; name?: string; cur?: string }) =>
    code ? (
      // Code and name stack, because the width measurement treats stacked
      // children as separate lines but inline ones as the widest single child.
      <button
        type="button"
        onClick={() => openAccount(code, cur)}
        className="flex flex-col text-start text-primary hover:underline"
      >
        <span className="font-mono">{code}</span>
        {name ? <span>{name}</span> : null}
      </button>
    ) : (
      <span className="text-muted-foreground">-</span>
    );

  /**
   * One side of a row as a human reads it. Falls back to the GL account when
   * the wallet block is missing (deleted source record / wallet-service down) —
   * the row still renders, it just loses the names.
   */
  const PartyCell = ({
    party,
    fallbackCode,
    fallbackName,
    currency: cur,
  }: {
    party: PartyView | null;
    fallbackCode?: string;
    fallbackName?: string;
    currency?: string;
  }) => {
    // No truncation and no font-size override: TableView measures each column
    // from the rendered text at the table's own 12px, so an override (text-sm)
    // makes the real text wider than the measured column and it gets clipped.
    if (party) {
      return (
        <div className="flex flex-col">
          <span>{party.name}</span>
          {party.detail && <span className="text-muted-foreground">{party.detail}</span>}
        </div>
      );
    }
    return (
      <div className="flex flex-col" title={t("tx.noWalletHint")}>
        <AccountLink code={fallbackCode} name={fallbackName} cur={cur} />
      </div>
    );
  };

  const headers = [
    {
      name: t("tx.col.date"),
      cell: (row: WalletLedgerEntry) => <span>{row.entryDate || "-"}</span>,
      width: "110px",
    },
    {
      // The transfer's own reference is what a human quotes; the journal number
      // is the accounting handle, so it rides underneath.
      name: t("tx.col.txnNo"),
      cell: (row: WalletLedgerEntry) => (
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setDetail(row)}
            className="text-start font-mono text-primary hover:underline"
          >
            {row.wallet?.transactionNumber || row.entryNumber}
          </button>
          {row.wallet?.transactionNumber && (
            <span className="font-mono text-muted-foreground">{row.entryNumber}</span>
          )}
        </div>
      ),
      width: "220px",
    },
    {
      name: t("tx.col.type"),
      cell: (row: WalletLedgerEntry) => (
        <div className="flex flex-col">
          <span>{humanizeCode(row.transactionType)}</span>
          <span className="text-muted-foreground">
            {humanizeCode(row.wallet?.channel || row.wallet?.rail || row.referenceType)}
          </span>
        </div>
      ),
      width: "240px",
    },
    {
      name: t("tx.col.from"),
      cell: (row: WalletLedgerEntry) => (
        <PartyCell
          party={walletSide(row.wallet, "from")}
          fallbackCode={row.fromAccountCode}
          fallbackName={row.fromAccountName}
          currency={row.currency}
        />
      ),
      width: "200px",
    },
    {
      name: t("tx.col.to"),
      cell: (row: WalletLedgerEntry) => (
        <PartyCell
          party={walletSide(row.wallet, "to")}
          fallbackCode={row.toAccountCode}
          fallbackName={row.toAccountName}
          currency={row.currency}
        />
      ),
      width: "200px",
    },
    {
      // Dr / Cr are posted to the perspective account; the zero side stays blank.
      name: t("tx.col.debit"),
      cell: (row: WalletLedgerEntry) => (
        <span>{row.debitAmount ? formatLedgerAmount(row.debitAmount, row.currency) : ""}</span>
      ),
      width: "140px",
    },
    {
      name: t("tx.col.credit"),
      cell: (row: WalletLedgerEntry) => (
        <span>{row.creditAmount ? formatLedgerAmount(row.creditAmount, row.currency) : ""}</span>
      ),
      width: "140px",
    },
    {
      name: t("tx.col.amount"),
      cell: (row: WalletLedgerEntry) => {
        const { text, tone } = signedLedgerAmount(row);
        return (
          <span
            className={`font-semibold ${
              tone === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : tone === "down"
                  ? "text-red-600 dark:text-red-400"
                  : ""
            }`}
            title={
              row.direction === "INTERNAL"
                ? t("tx.internal")
                : isUnknownCurrency(row.currency)
                  ? t("tx.currencyUnknown")
                  : undefined
            }
          >
            {text}
          </span>
        );
      },
      width: "160px",
    },
    {
      name: t("common:status"),
      cell: (row: WalletLedgerEntry) => (
        // Stacked, not side by side: side-by-side badges measure as the widest
        // one, so the pair would be wider than the column it's given.
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={row.status} />
          {row.reversal && (
            <Badge variant="outline" className={`border gap-1 font-medium ${TONES.amber}`}>
              <Undo2 className="h-3 w-3" />
              {t("tx.badge.reversal")}
            </Badge>
          )}
        </div>
      ),
      width: "150px",
    },
    {
      name: t("tx.col.action"),
      cell: (row: WalletLedgerEntry) => (
        <Button variant="outline" size="sm" className="gap-1" onClick={() => setDetail(row)}>
          <Eye className="h-4 w-4" />
          {t("common:view")}
        </Button>
      ),
      width: "110px",
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
            <BookOpen className="h-4 w-4" />
          </span>
          {t("tx.title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">{t("tx.subtitle")}</p>
      </div>

      {/* Currency summary — one card per currency, never a cross-currency total */}
      {visibleSummary.length > 0 && (
        <div className="row gy-3 dashboard-stats mb-3">
          {visibleSummary.map((c, i) => (
            <div key={c.currency} className="col-12 col-sm-6 col-lg-3 d-flex">
              <CurrencyCard summary={c} theme={CARD_THEMES[i % CARD_THEMES.length]} />
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            placeholder={t("tx.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: "1 1 220px", minWidth: 190 }}
          />
          <div style={{ width: 140 }}>
            <Select value={currency} onValueChange={onFilter(setCurrency)}>
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
          <div style={{ width: 180 }}>
            <Select value={referenceType} onValueChange={onFilter(setReferenceType)}>
              <SelectTrigger>
                <SelectValue placeholder={t("tx.filter.referenceType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t("tx.filter.allReferenceTypes")}</SelectItem>
                {REFERENCE_TYPES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {humanizeCode(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div style={{ width: 200 }}>
            <Select value={transactionType} onValueChange={onFilter(setTransactionType)}>
              <SelectTrigger>
                <SelectValue placeholder={t("tx.filter.transactionType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t("tx.filter.allTransactionTypes")}</SelectItem>
                {transactionTypes.map((tt) => (
                  <SelectItem key={tt} value={tt}>
                    {humanizeCode(tt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div style={{ width: 140 }}>
            <Select value={status} onValueChange={onFilter(setStatus)}>
              <SelectTrigger>
                <SelectValue placeholder={t("common:status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t("tx.filter.allStatuses")}</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {humanizeCode(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder={t("tx.filter.accountCode")}
            value={accountCode}
            onChange={(e) => {
              setAccountCode(e.target.value);
              setPage(1);
            }}
            style={{ width: 140 }}
          />
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
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              loadEntries();
              loadSummary();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common:refresh")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setCurrency(ALL);
              setReferenceType(ALL);
              setTransactionType(ALL);
              setStatus(ALL);
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

        {/* The wallet posting path does not send a currency yet — say so here. */}
        <div className="d-flex align-items-start gap-2 mt-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{t("tx.currencyNote")}</span>
        </div>
      </div>

      <div className="pro-card">
        {/* Dr / Cr only mean something relative to one account — name it once. */}
        {perspective && (
          <div
            className="d-flex align-items-center gap-2 px-3 pt-2 text-xs text-muted-foreground"
            title={t("tx.perspectiveHint")}
          >
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>{t("tx.perspective", { account: perspective })}</span>
          </div>
        )}
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

      {/* Entry detail — both sides plus the full line breakdown */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        {/* Scrolling lives on the body below: tokens.css sets `overflow: hidden`
            on [data-slot="dialog-content"] unlayered, which outranks utilities. */}
        <DialogContent className="pro-dialog sm:max-w-3xl">
          <DialogHeader className="min-w-0 text-start">
            <DialogTitle className="truncate">
              {t("detail.title", { entryNumber: detail?.entryNumber ?? "" })}
            </DialogTitle>
            <DialogDescription className="truncate">{detail?.description || ""}</DialogDescription>
          </DialogHeader>

          {detail && (
            <div className="flex max-h-[70vh] min-w-0 flex-col gap-3 overflow-y-auto overflow-x-hidden">
              {/* Who moved the money — the part a human reads */}
              <SectionTitle icon={ArrowLeftRight} title={t("detail.transfer")} />
              {detail.wallet ? (
                <>
                  <div className="grid min-w-0 gap-x-6 md:grid-cols-2">
                    <div className="min-w-0">
                      <Field
                        label={t("detail.txnNumber")}
                        value={detail.wallet.transactionNumber}
                        mono
                      />
                      <Field label={t("detail.rail")} value={humanizeCode(detail.wallet.rail)} />
                      {detail.wallet.channel && (
                        <Field
                          label={t("detail.channel")}
                          value={humanizeCode(detail.wallet.channel)}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Field
                        label={t("detail.direction")}
                        value={humanizeCode(detail.wallet.direction)}
                      />
                      <Field
                        label={t("detail.transferStatus")}
                        value={humanizeCode(detail.wallet.status)}
                      />
                      {detail.wallet.feeAmount != null && (
                        <Field
                          label={t("detail.fee")}
                          value={formatLedgerAmount(detail.wallet.feeAmount, detail.currency)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Only a cross-currency transfer carries a rate */}
                  {detail.wallet.exchangeRate != null && (
                    <Field
                      label={t("detail.fx")}
                      value={`${formatLedgerAmount(
                        detail.wallet.creditAmount,
                        detail.wallet.creditCurrency ?? undefined
                      )} · ${t("detail.fxRate", { rate: detail.wallet.exchangeRate })}`}
                    />
                  )}
                  {detail.wallet.purposeNote && (
                    <Field label={t("detail.purpose")} value={detail.wallet.purposeNote} />
                  )}

                  <div className="grid min-w-0 gap-3 md:grid-cols-2">
                    <WalletBox label={t("detail.debitWallet")} party={detail.wallet.debitWallet} />
                    <WalletBox
                      label={t("detail.creditWallet")}
                      party={detail.wallet.creditWallet}
                    />
                    {detail.wallet.counterparty && (
                      <CounterpartyBox party={detail.wallet.counterparty} />
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-sm border border-dashed p-3 text-xs text-muted-foreground">
                  <div className="font-medium">{t("tx.noWallet")}</div>
                  {t("tx.noWalletHint")}
                </div>
              )}

              <SectionTitle icon={BookOpen} title={t("detail.accounting")} />
              <div className="grid min-w-0 gap-x-6 md:grid-cols-2">
                <div className="min-w-0">
                  <Field label={t("detail.entryDate")} value={detail.entryDate} />
                  <Field label={t("detail.valueDate")} value={detail.valueDate} />
                  <Field
                    label={t("detail.amount")}
                    value={formatLedgerAmount(detail.amount, detail.currency)}
                  />
                  <Field
                    label={t("common:status")}
                    value={<StatusBadge status={detail.status} />}
                  />
                </div>
                <div className="min-w-0">
                  <Field
                    label={t("detail.referenceType")}
                    value={humanizeCode(detail.referenceType)}
                  />
                  <Field
                    label={t("detail.transactionType")}
                    value={humanizeCode(detail.transactionType)}
                  />
                  <Field label={t("detail.referenceId")} value={detail.referenceId} mono />
                  <Field label={t("detail.createdAt")} value={detail.createdAt} />
                </div>
              </div>

              <div className="grid min-w-0 gap-3 md:grid-cols-2">
                {[
                  { label: t("detail.from"), legs: detail.from ?? [] },
                  { label: t("detail.to"), legs: detail.to ?? [] },
                ].map((side) => (
                  <div key={side.label} className="min-w-0">
                    <div className="mb-1 text-xs font-semibold text-muted-foreground">
                      {side.label}
                    </div>
                    {side.legs.length ? (
                      side.legs.map((leg) => (
                        <div
                          key={`${side.label}-${leg.accountCode}`}
                          className="flex min-w-0 items-baseline justify-between gap-2 text-sm"
                        >
                          <span className="truncate">
                            <span className="font-mono text-xs">{leg.accountCode}</span>{" "}
                            {leg.accountName}
                          </span>
                          <span className="shrink-0 font-semibold">
                            {formatLedgerAmount(leg.amount, detail.currency)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="min-w-0">
                <div className="mb-1 text-xs font-semibold text-muted-foreground">
                  {t("detail.lines")}
                </div>
                <div className="w-full min-w-0 overflow-x-auto">
                  <table className="mini-table">
                    <thead>
                      <tr>
                        <th>{t("detail.line.no")}</th>
                        <th>{t("detail.line.account")}</th>
                        <th>{t("detail.line.type")}</th>
                        <th className="num">{t("detail.line.debit")}</th>
                        <th className="num">{t("detail.line.credit")}</th>
                        <th>{t("detail.line.description")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.lines ?? []).map((line) => (
                        <tr key={line.lineNumber}>
                          <td>{line.lineNumber}</td>
                          <td>
                            <span className="font-mono text-xs">{line.accountCode}</span>{" "}
                            {line.accountName}
                          </td>
                          <td>{humanizeCode(line.accountType)}</td>
                          <td className="num">
                            {line.debitAmount
                              ? formatLedgerAmount(line.debitAmount, line.currency)
                              : "-"}
                          </td>
                          <td className="num">
                            {line.creditAmount
                              ? formatLedgerAmount(line.creditAmount, line.currency)
                              : "-"}
                          </td>
                          <td className="text-muted-foreground">{line.description || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletLedgerTransactions;
