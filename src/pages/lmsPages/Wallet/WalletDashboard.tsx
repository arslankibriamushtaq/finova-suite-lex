import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  RefreshCw,
  ChevronDown,
  Eye,
  Users,
  Snowflake,
  Sun,
  Ban,
  RotateCcw,
  XCircle,
  X,
  Wallet as WalletIcon,
  ArrowLeftRight,
} from "lucide-react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import TableView from "../../../components/TableView/TableView";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";

import {
  listAdminWallets,
  getAdminWalletDetail,
  getWalletTransactions,
  changeWalletStatus,
  WalletResponse,
  WalletStatus,
  WalletLifecycleAction,
} from "../../../redux/apis/apisWalletAdmin";
import BeneficiariesDialog from "./BeneficiariesDialog";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "PENDING_ACTIVATION", label: "Pending Activation" },
  { value: "ACTIVE", label: "Active" },
  { value: "FROZEN", label: "Frozen" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "CLOSED", label: "Closed" },
];

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300 dark:border dark:border-green-500/30",
  PENDING_ACTIVATION:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 dark:border dark:border-amber-500/30",
  FROZEN:
    "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 dark:border dark:border-sky-500/30",
  SUSPENDED:
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300 dark:border dark:border-orange-500/30",
  CLOSED:
    "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300 dark:border dark:border-red-500/30",
};

// Allowed lifecycle transitions per current status.
const ACTIONS_BY_STATUS: Record<WalletStatus, WalletLifecycleAction[]> = {
  ACTIVE: ["freeze", "suspend", "close"],
  FROZEN: ["unfreeze", "suspend", "close"],
  SUSPENDED: ["reactivate", "close"],
  PENDING_ACTIVATION: ["close"],
  CLOSED: [],
};

const ACTION_META: Record<
  WalletLifecycleAction,
  { label: string; Icon: any; danger?: boolean }
> = {
  freeze: { label: "Freeze", Icon: Snowflake },
  unfreeze: { label: "Unfreeze", Icon: Sun },
  suspend: { label: "Suspend", Icon: Ban },
  reactivate: { label: "Reactivate", Icon: RotateCcw },
  close: { label: "Close", Icon: XCircle, danger: true },
};

const formatMoney = (value: number | null | undefined, currency?: string) => {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "-";
  const amount = Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${amount} ${currency}` : amount;
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

// Transaction responses vary in field naming across services — read the first
// present key so the table is resilient to shape differences.
const txGet = (t: any, keys: string[], fallback: any = "-") => {
  for (const k of keys) {
    const v = t?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return fallback;
};

// Classify a transaction as money IN (received) or OUT (sent).
const txDirection = (t: any): "in" | "out" | "unknown" => {
  const dir = String(
    txGet(t, ["direction", "debitCredit", "drCr", "entryType", "flow"], "")
  ).toLowerCase();
  if (dir) {
    if (/(credit|^cr$|\bin\b|receiv|deposit|incoming)/.test(dir)) return "in";
    if (/(debit|^dr$|\bout\b|sent|send|withdraw|outgoing)/.test(dir)) return "out";
  }
  const type = String(txGet(t, ["type", "transactionType"], "")).toLowerCase();
  if (/(receiv|deposit|credit|incoming|cash[_-]?in|top[_-]?up|refund)/.test(type))
    return "in";
  if (/(send|sent|withdraw|debit|outgoing|cash[_-]?out|payment|transfer)/.test(type))
    return "out";
  const amt = Number(txGet(t, ["amount", "transactionAmount"], NaN));
  if (!Number.isNaN(amt)) return amt >= 0 ? "in" : "out";
  return "unknown";
};

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
      STATUS_BADGE[status] || "bg-muted text-foreground"
    }`}
  >
    {status?.replace(/_/g, " ")}
  </span>
);

const WalletDashboard = () => {
  const [data, setData] = useState<WalletResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [status, setStatus] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Debounce the search input → search-as-you-type (matches other list pages).
  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(handle);
  }, [searchInput]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

  // Detail dialog
  const [detail, setDetail] = useState<WalletResponse | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Beneficiaries dialog
  const [beneficiaryCustomerId, setBeneficiaryCustomerId] = useState<string | null>(
    null
  );

  // Lifecycle action dialog
  const [actionTarget, setActionTarget] = useState<{
    wallet: WalletResponse;
    action: WalletLifecycleAction;
  } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [isActing, setIsActing] = useState(false);

  // Transactions dialog
  const [txWallet, setTxWallet] = useState<WalletResponse | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isTxLoading, setIsTxLoading] = useState(false);
  const [txPage, setTxPage] = useState(1); // 1-based, client-side page
  const [txSize, setTxSize] = useState(10); // rows per page (client-side)
  const [txFilter, setTxFilter] = useState<"ALL" | "IN" | "OUT">("ALL");

  // Load the wallet's transactions once, then filter + paginate on the client so
  // pagination always matches the active All/Received/Sent tab.
  useEffect(() => {
    if (!txWallet) return;
    loadTransactions(txWallet.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txWallet]);

  const loadTransactions = async (walletId: string) => {
    setIsTxLoading(true);
    try {
      const res = await getWalletTransactions(walletId, 0, 500);
      const payload = res?.data || {};
      const rows = payload?.data || payload?.content || [];
      setTransactions(Array.isArray(rows) ? rows : []);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load wallet transactions"
      );
      setTransactions([]);
    } finally {
      setIsTxLoading(false);
    }
  };

  const openTransactions = (wallet: WalletResponse) => {
    setTransactions([]);
    setTxFilter("ALL");
    setTxPage(1);
    setTxSize(10);
    setTxWallet(wallet);
  };

  const changeTxFilter = (f: "ALL" | "IN" | "OUT") => {
    setTxFilter(f);
    setTxPage(1); // reset to first page so pagination matches the new tab
  };

  useEffect(() => {
    loadWallets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search, page, pageSize]);

  const loadWallets = async () => {
    setIsLoading(true);
    try {
      const res = await listAdminWallets({
        page: page - 1,
        size: pageSize,
        status: status === "ALL" ? undefined : status,
        search: search || undefined,
      });
      const payload = res?.data || {};
      const rows = payload?.data || [];
      setData(Array.isArray(rows) ? rows : []);
      // Pagination metadata lives under `pagination` (falls back to top-level).
      const pg = payload?.pagination || payload || {};
      const total =
        pg?.totalElements ?? (Array.isArray(rows) ? rows.length : 0);
      setTotalRows(total);
      setTotalPage(pg?.totalPages ?? (Math.ceil(total / pageSize) || 1));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load wallets");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openDetail = async (wallet: WalletResponse) => {
    setDetail(wallet);
    setIsDetailLoading(true);
    try {
      const res = await getAdminWalletDetail(wallet.id);
      const live = res?.data?.data || res?.data;
      if (live) setDetail(live);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load live wallet detail");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const openAction = (wallet: WalletResponse, action: WalletLifecycleAction) => {
    setActionTarget({ wallet, action });
    setActionReason("");
  };

  const handleAction = async () => {
    if (!actionTarget) return;
    setIsActing(true);
    try {
      await changeWalletStatus(actionTarget.wallet.id, actionTarget.action, {
        reason: actionReason.trim() || undefined,
      });
      toast.success(
        `Wallet ${ACTION_META[actionTarget.action].label.toLowerCase()} successful`
      );
      setActionTarget(null);
      loadWallets();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          `Failed to ${actionTarget.action} wallet`
      );
    } finally {
      setIsActing(false);
    }
  };

  const headers = [
    {
      name: "Wallet Number",
      cell: (row: WalletResponse) => (
        <span className="font-medium text-foreground">{row.walletNumber || "-"}</span>
      ),
      width: "170px",
    },
    {
      name: "Account Number",
      cell: (row: WalletResponse) => (
        <span className="font-mono text-xs">{row.accountNumber || "-"}</span>
      ),
      width: "180px",
    },
    {
      name: "Name",
      cell: (row: WalletResponse) => (
        <span className="text-sm">{row.maskedName || "-"}</span>
      ),
      width: "150px",
    },
    {
      name: "Available Balance",
      cell: (row: WalletResponse) => (
        <span className="font-medium">
          {formatMoney(row.availableBalance, row.currency)}
        </span>
      ),
      width: "180px",
    },
    {
      name: "Status",
      cell: (row: WalletResponse) => <StatusBadge status={row.status} />,
      width: "140px",
    },
    {
      name: "Created At",
      cell: (row: WalletResponse) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      ),
      width: "170px",
    },
    {
      name: "Actions",
      cell: (row: WalletResponse) => {
        const lifecycleActions = ACTIONS_BY_STATUS[row.status] || [];
        return (
          <div
            className="relative inline-block"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="wallet-brand-btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Select
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="bottom"
                className="z-[9999]"
                sideOffset={4}
              >
                <DropdownMenuItem
                  onClick={() => openDetail(row)}
                  className="cursor-pointer gap-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Detail</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openTransactions(row)}
                  className="cursor-pointer gap-2"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  <span>Transactions</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setBeneficiaryCustomerId(row.customerId)}
                  className="cursor-pointer gap-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Beneficiaries</span>
                </DropdownMenuItem>
                {lifecycleActions.length > 0 && <DropdownMenuSeparator />}
                {lifecycleActions.map((action) => {
                  const meta = ACTION_META[action];
                  return (
                    <DropdownMenuItem
                      key={action}
                      onClick={() => openAction(row, action)}
                      className={`cursor-pointer gap-2 ${
                        meta.danger
                          ? "text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950"
                          : ""
                      }`}
                    >
                      <meta.Icon className="h-4 w-4" />
                      <span>{meta.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
      width: "140px",
    },
  ];

  const receivedCount = transactions.filter((t) => txDirection(t) === "in").length;
  const sentCount = transactions.filter((t) => txDirection(t) === "out").length;
  const filteredTx = transactions.filter((t) => {
    if (txFilter === "ALL") return true;
    const d = txDirection(t);
    return txFilter === "IN" ? d === "in" : d === "out";
  });
  const txTotalRows = filteredTx.length;
  const txTotalPages = Math.max(1, Math.ceil(txTotalRows / txSize));
  const txCurrentPage = Math.min(txPage, txTotalPages);
  const pagedTx = filteredTx.slice(
    (txCurrentPage - 1) * txSize,
    txCurrentPage * txSize
  );
  const txFilters: { key: "ALL" | "IN" | "OUT"; label: string }[] = [
    { key: "ALL", label: `All (${transactions.length})` },
    { key: "IN", label: `Received (${receivedCount})` },
    { key: "OUT", label: `Sent (${sentCount})` },
  ];

  const txHeaders = [
    {
      name: "#",
      cell: (_row: any, index: number) => (txCurrentPage - 1) * txSize + index + 1,
      width: "60px",
    },
    {
      name: "Date",
      cell: (row: any) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(txGet(row, ["createdAt", "transactionDate", "timestamp", "date"], null))}
        </span>
      ),
      width: "170px",
    },
    {
      name: "Type",
      cell: (row: any) => {
        const dir = txDirection(row);
        return (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                background:
                  dir === "in"
                    ? "var(--color-success)"
                    : dir === "out"
                    ? "var(--color-error)"
                    : "var(--muted-foreground)",
              }}
            />
            {String(txGet(row, ["type", "transactionType"], "-")).replace(/_/g, " ")}
          </span>
        );
      },
      width: "180px",
    },
    {
      name: "Reference",
      cell: (row: any) => (
        <span className="font-mono text-xs text-muted-foreground break-all">
          {txGet(row, ["reference", "transactionReference", "referenceNumber", "id"], "-")}
        </span>
      ),
    },
    {
      name: "Amount",
      cell: (row: any) => {
        const dir = txDirection(row);
        const amount = txGet(row, ["amount", "transactionAmount"], null);
        const currency = txGet(row, ["currency"], txWallet?.currency || "");
        return (
          <span
            className="font-medium"
            style={{
              color:
                dir === "in"
                  ? "var(--color-success)"
                  : dir === "out"
                  ? "var(--color-error)"
                  : "var(--foreground)",
            }}
          >
            {amount === null
              ? "-"
              : `${dir === "in" ? "+" : dir === "out" ? "-" : ""}${formatMoney(Math.abs(Number(amount)), currency)}`}
          </span>
        );
      },
      width: "160px",
    },
    {
      name: "Balance After",
      cell: (row: any) =>
        formatMoney(
          txGet(row, ["balanceAfter", "runningBalance", "balance"], null),
          txGet(row, ["currency"], txWallet?.currency || "")
        ),
      width: "150px",
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
          {String(txGet(row, ["status", "state"], "-")).replace(/_/g, " ")}
        </span>
      ),
      width: "130px",
    },
  ];

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          Wallets
        </h3>
        <div className="d-flex align-items-center gap-2">
          <Input
            allowClear
            placeholder="Search..."
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ width: 280, minWidth: 200, borderRadius: 8, height: 40 }}
          />
          <div style={{ width: 190 }}>
            <Select
              value={status}
              onValueChange={(v) => {
                setPage(1);
                setStatus(v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={loadWallets}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div
        className="bg-white"
        style={{
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <TableView
          header={headers}
          data={data}
          isLoading={isLoading}
          paginationShow={totalRows > 0}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalRows={totalRows}
          totalPage={totalPage}
          from={totalRows === 0 ? 0 : (page - 1) * pageSize + 1}
          to={Math.min(page * pageSize, totalRows)}
        />
      </div>

      {/* Wallet Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent
          className="sm:max-w-xl gap-0"
          showCloseButton={false}
          style={{ padding: 0, overflow: "hidden" }}
        >
          {/* Header */}
          <DialogHeader
            className="relative border-b px-6 pt-5 pb-3 text-left"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              type="button"
              onClick={() => setDetail(null)}
              aria-label="Close"
              className="absolute flex items-center justify-center rounded-full transition-colors"
              style={{
                top: 16,
                right: 16,
                height: 32,
                width: 32,
                border: "none",
                background: "transparent",
                color: "var(--muted-foreground)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--muted)";
                e.currentTarget.style.color = "var(--foreground)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--muted-foreground)";
              }}
            >
              <X className="h-[18px] w-[18px]" />
            </button>
            <DialogTitle
              className="flex items-center gap-3"
              style={{ fontSize: "1.125rem", fontWeight: 600 }}
            >
              <span className="wallet-brand-bg inline-flex h-9 w-9 items-center justify-center rounded-lg">
                <WalletIcon className="h-5 w-5" />
              </span>
              Wallet Detail
              {isDetailLoading && (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </DialogTitle>
            <DialogDescription style={{ marginTop: 2 }}>
              Live balance enriched from the ledger.
            </DialogDescription>
          </DialogHeader>

          {detail && (
            <div className="px-6 py-4 space-y-4">
              {/* Balance summary */}
              <div className="wallet-brand-card rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{ opacity: 0.85 }}
                    >
                      Available Balance
                    </div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.2 }}>
                      {formatMoney(detail.availableBalance, detail.currency)}
                    </div>
                  </div>
                  <StatusBadge status={detail.status} />
                </div>
                <div
                  className="mt-3 flex gap-6 border-t pt-3 text-sm"
                  style={{ borderColor: "rgba(255,255,255,0.25)" }}
                >
                  <div>
                    <span style={{ opacity: 0.8 }}>Reserved: </span>
                    <span style={{ fontWeight: 600 }}>
                      {formatMoney(detail.reservedBalance, detail.currency)}
                    </span>
                  </div>
                  <div>
                    <span style={{ opacity: 0.8 }}>Total: </span>
                    <span style={{ fontWeight: 600 }}>
                      {formatMoney(detail.totalBalance, detail.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail grid */}
              <div
                className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border p-4"
                style={{ borderColor: "var(--border)" }}
              >
                <Field label="Wallet Number" value={detail.walletNumber} />
                <Field label="Account Number" value={detail.accountNumber} mono />
                <Field label="Customer ID" value={detail.customerId} mono />
                <Field label="Currency" value={detail.currency} />
                <Field label="Created At" value={formatDate(detail.createdAt)} />
                <Field label="Updated At" value={formatDate(detail.updatedAt)} />
              </div>
            </div>
          )}

          <DialogFooter
            className="border-t px-6 py-3"
            style={{ borderColor: "var(--border)" }}
          >
            <Button variant="outline" onClick={() => setDetail(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lifecycle Action Dialog */}
      <Dialog
        open={!!actionTarget}
        onOpenChange={(open) => !open && setActionTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionTarget && (
                <>
                  {(() => {
                    const Icon = ACTION_META[actionTarget.action].Icon;
                    return <Icon className="w-5 h-5" />;
                  })()}
                  {ACTION_META[actionTarget.action].label} Wallet
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionTarget?.wallet.walletNumber} — provide an optional audit note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              placeholder="e.g. AML hold / review cleared"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionTarget(null)}>
              Cancel
            </Button>
            <Button
              variant={
                actionTarget && ACTION_META[actionTarget.action].danger
                  ? "destructive"
                  : "default"
              }
              className={
                actionTarget && ACTION_META[actionTarget.action].danger
                  ? "hover:brightness-95"
                  : "wallet-brand-btn"
              }
              onClick={handleAction}
              disabled={isActing}
            >
              {isActing
                ? "Processing..."
                : actionTarget
                ? ACTION_META[actionTarget.action].label
                : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transactions Dialog */}
      <Dialog
        open={!!txWallet}
        onOpenChange={(open) => !open && setTxWallet(null)}
      >
        <DialogContent
          className="gap-0"
          showCloseButton={false}
          style={{
            padding: 0,
            overflow: "hidden",
            width: "min(96vw, 1000px)",
            maxWidth: "1000px",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <DialogHeader
            className="relative border-b px-6 pt-5 pb-3 text-left"
            style={{ borderColor: "var(--border)", flexShrink: 0 }}
          >
            <button
              type="button"
              onClick={() => setTxWallet(null)}
              aria-label="Close"
              className="absolute flex items-center justify-center rounded-full transition-colors"
              style={{
                top: 16,
                right: 16,
                height: 32,
                width: 32,
                border: "none",
                background: "transparent",
                color: "var(--muted-foreground)",
                cursor: "pointer",
              }}
            >
              <X className="h-[18px] w-[18px]" />
            </button>
            <DialogTitle
              className="flex items-center gap-3"
              style={{ fontSize: "1.125rem", fontWeight: 600 }}
            >
              <span className="wallet-brand-bg inline-flex h-9 w-9 items-center justify-center rounded-lg">
                <ArrowLeftRight className="h-5 w-5" />
              </span>
              Wallet Transactions
              {isTxLoading && (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </DialogTitle>
            <DialogDescription style={{ marginTop: 2 }}>
              {txWallet?.walletNumber}
              {txWallet?.maskedName ? ` — ${txWallet.maskedName}` : ""}
            </DialogDescription>
          </DialogHeader>

          {/* Received / Sent filter — uses the wallet module's tab style */}
          <div
            className="px-6 pt-4 pb-1"
            style={{ flexShrink: 0, borderBottom: "1px solid var(--border)" }}
          >
            <Tabs value={txFilter} onValueChange={(v) => changeTxFilter(v as any)}>
              <TabsList className="wallet-tabs">
                {txFilters.map((f) => (
                  <TabsTrigger
                    key={f.key}
                    value={f.key}
                    className="wallet-tab-trigger"
                  >
                    {f.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Vertically scrollable area; the table's own grid handles the
              horizontal scroll so only the rows scroll (pagination stays put). */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "16px 24px",
            }}
          >
            <div
              className="bg-white"
              style={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                overflow: "hidden",
              }}
            >
              <TableView
                header={txHeaders}
                data={pagedTx}
                isLoading={isTxLoading}
                paginationShow={txTotalRows > 0}
                page={txCurrentPage}
                setPage={setTxPage}
                pageSize={txSize}
                setPageSize={(s: number) => {
                  setTxSize(s);
                  setTxPage(1);
                }}
                totalRows={txTotalRows}
                totalPage={txTotalPages}
                from={txTotalRows === 0 ? 0 : (txCurrentPage - 1) * txSize + 1}
                to={Math.min(txCurrentPage * txSize, txTotalRows)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Beneficiaries Dialog */}
      <BeneficiariesDialog
        customerId={beneficiaryCustomerId}
        onClose={() => setBeneficiaryCustomerId(null)}
      />
    </div>
  );
};

const Field = ({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | number | null;
  mono?: boolean;
}) => (
  <div className="flex flex-col gap-1">
    <span
      className="text-muted-foreground"
      style={{
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
    <span
      className={`text-foreground ${mono ? "font-mono break-all" : ""}`}
      style={{ fontSize: mono ? "12px" : "14px", fontWeight: 500 }}
    >
      {value ?? "-"}
    </span>
  </div>
);

export default WalletDashboard;
