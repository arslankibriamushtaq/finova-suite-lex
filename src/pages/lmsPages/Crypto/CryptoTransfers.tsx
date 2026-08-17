import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  ChevronDown,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  Skull,
  XCircle,
} from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { EmptyState, Field, PermissionDenied } from "../../../components/shared/detailKit";
import { FilterField, SearchField } from "../../../components/shared/filterKit";
import { TONES, formatDateTime, humanizeCode } from "../../../components/shared/detailKitUtils";
import { useProductPermissions, CRYPTO_PERMISSIONS } from "../../../hooks/useProductPermissions";
import {
  CRYPTO_TRANSFER_LIMIT_DEFAULT,
  CRYPTO_TRANSFER_LIMIT_MAX,
  CRYPTO_TRANSFER_STATUSES,
  abandonCryptoTransfer,
  cryptoErrorMessage,
  formatCryptoAmount,
  getCryptoTransfer,
  getCryptoTransfers,
  isTerminalTransferStatus,
  reconcileCryptoTransfer,
  truncateHex,
  type CryptoTransfer,
} from "../../../redux/apis/apisCryptoAdmin";

const ALL = "ALL";

const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

const STATUS_TONE: Record<string, string> = {
  CONFIRMED: TONES.emerald,
  BROADCAST: TONES.sky,
  FAILED: TONES.red,
  ABANDONED: TONES.slate,
};

const StatusBadge = ({ status }: { status?: string }) => {
  const key = (status || "").toUpperCase();
  return (
    <Badge
      variant="outline"
      className={`border gap-1 font-medium ${STATUS_TONE[key] || TONES.slate}`}
    >
      {key === "CONFIRMED" && <CheckCircle2 className="h-3 w-3" />}
      {key === "FAILED" && <XCircle className="h-3 w-3" />}
      {key === "ABANDONED" && <Skull className="h-3 w-3" />}
      {humanizeCode(status)}
    </Badge>
  );
};

/**
 * Every transfer in the tenant.
 *
 * Read-only on the money by design: a transfer needs a signature from the
 * customer's device and no operator holds a key that could produce one, so there
 * is no send action here and there will not be one. The two writes that do exist
 * — reconcile and abandon — move no coin. Reconcile asks the chain; abandon
 * closes OUR RECORD and explicitly not the transaction, which is why the confirm
 * step says so and why a reason is mandatory.
 */
const CryptoTransfers = () => {
  const { t } = useTranslation("crypto");
  const { hasPermission } = useProductPermissions();

  const canRead = hasPermission(CRYPTO_PERMISSIONS.TRANSFERS_READ);
  const canUpdate = hasPermission(CRYPTO_PERMISSIONS.TRANSFERS_UPDATE);

  const [userId, setUserId] = useState("");
  const [asset, setAsset] = useState("");
  const [status, setStatus] = useState(ALL);
  const [limit, setLimit] = useState(CRYPTO_TRANSFER_LIMIT_DEFAULT);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [transfers, setTransfers] = useState<CryptoTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [detail, setDetail] = useState<CryptoTransfer | null>(null);
  const [abandoning, setAbandoning] = useState<CryptoTransfer | null>(null);
  const [reason, setReason] = useState("");
  const [reasonTouched, setReasonTouched] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const errorsByCode = useMemo(
    () => ({
      "CRYPTO.TRANSFER.NOT_FOUND": t("err.notFound"),
      "CRYPTO.CHAIN.UNAVAILABLE": t("err.chainUnavailable"),
      "CRYPTO.ASSET.NOT_SUPPORTED": t("err.assetNotSupported"),
      "COMMON.VALIDATION.FAILED": t("err.validation"),
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
    }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      setTransfers(
        await getCryptoTransfers({
          userId: userId.trim() || undefined,
          asset: asset.trim().toUpperCase() || undefined,
          status: status === ALL ? undefined : status,
          limit,
        })
      );
    } catch (error) {
      toast.error(cryptoErrorMessage(error, t("err.validation"), errorsByCode));
      setTransfers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, limit]);

  /**
   * Replaces one row in place after a write, so reconciling row 30 does not
   * scroll the operator back to the top of a refetched list.
   */
  const replaceRow = (updated: CryptoTransfer) => {
    setTransfers((prev) =>
      prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row))
    );
    setDetail((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
  };

  const openDetail = async (row: CryptoTransfer) => {
    // Show the list row immediately, then replace it with the full record.
    setDetail(row);
    try {
      const full = await getCryptoTransfer(row.id);
      setDetail(full);
      replaceRow(full);
    } catch (error) {
      toast.error(cryptoErrorMessage(error, t("err.notFound"), errorsByCode));
    }
  };

  const onReconcile = async (row: CryptoTransfer) => {
    // Terminal transfers come back unchanged; saying so beats a no-op that looks
    // like a failed request.
    if (isTerminalTransferStatus(row.status)) {
      return toast(t("trf.reconcile.terminal", { status: humanizeCode(row.status) }));
    }
    setBusyId(row.id);
    try {
      const updated = await reconcileCryptoTransfer(row.id);
      replaceRow(updated);
      toast.success(t("trf.reconcile.done", { status: humanizeCode(updated.status) }));
    } catch (error) {
      toast.error(cryptoErrorMessage(error, t("trf.reconcile.failed"), errorsByCode));
    } finally {
      setBusyId(null);
    }
  };

  const openAbandon = (row: CryptoTransfer) => {
    setAbandoning(row);
    setReason("");
    setReasonTouched(false);
  };

  const onAbandon = async () => {
    if (!abandoning || !reason.trim()) {
      setReasonTouched(true);
      return;
    }
    setBusyId(abandoning.id);
    try {
      const updated = await abandonCryptoTransfer(abandoning.id, reason.trim());
      replaceRow(updated);
      toast.success(t("trf.abandon.done"));
      setAbandoning(null);
    } catch (error) {
      toast.error(cryptoErrorMessage(error, t("trf.abandon.failed"), errorsByCode));
    } finally {
      setBusyId(null);
    }
  };

  const activeFilterCount = [!!userId.trim(), !!asset.trim(), status !== ALL].filter(
    Boolean
  ).length;

  /**
   * Search is local. The API takes `userId`, `asset`, `status` and `limit` and
   * nothing else, so a box that looked like a server search would silently
   * ignore what was typed. It narrows the rows already fetched — the id and the
   * hash, which are what support is reading off a ticket.
   */
  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return transfers;
    return transfers.filter((row) =>
      [row.id, row.txHash, row.toAddress].some((v) => (v || "").toLowerCase().includes(needle))
    );
  }, [transfers, search]);

  const headers = [
    {
      name: t("trf.col.created"),
      cell: (row: CryptoTransfer) => <span>{formatDateTime(row.createdAt) || "-"}</span>,
      width: "170px",
    },
    {
      name: t("trf.col.user"),
      cell: (row: CryptoTransfer) => (
        <span className="font-mono text-xs" title={row.userId || ""}>
          {truncateHex(row.userId, 8, 6)}
        </span>
      ),
      width: "150px",
    },
    {
      name: t("trf.col.asset"),
      cell: (row: CryptoTransfer) => <span>{row.assetCode}</span>,
      width: "90px",
    },
    {
      name: t("trf.col.amount"),
      cell: (row: CryptoTransfer) => (
        <span className="tabular-nums">{formatCryptoAmount(row.amount, row.assetCode)}</span>
      ),
      width: "170px",
    },
    {
      name: t("trf.col.destination"),
      cell: (row: CryptoTransfer) => (
        <span className="font-mono text-xs" title={row.toAddress || ""}>
          {truncateHex(row.toAddress)}
        </span>
      ),
      width: "190px",
    },
    {
      name: t("trf.col.hash"),
      cell: (row: CryptoTransfer) =>
        row.txHash ? (
          <span className="font-mono text-xs" title={row.txHash}>
            {truncateHex(row.txHash)}
          </span>
        ) : (
          <span className="text-muted-foreground">{t("trf.noHash")}</span>
        ),
      width: "190px",
    },
    {
      name: t("trf.col.status"),
      cell: (row: CryptoTransfer) => <StatusBadge status={row.status} />,
      width: "150px",
    },
    {
      name: t("trf.col.confirmations"),
      cell: (row: CryptoTransfer) => (
        <span className="tabular-nums">
          {row.confirmations ?? 0}
          {row.requiredConfirmations ? ` / ${row.requiredConfirmations}` : ""}
        </span>
      ),
      width: "130px",
    },
    {
      name: t("trf.col.action"),
      cell: (row: CryptoTransfer) => (
        <div
          className="relative inline-block"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button type="button" className={SELECT_TRIGGER_CLS} disabled={busyId === row.id}>
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
              {canUpdate && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    onReconcile(row);
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("trf.action.reconcile")}
                </DropdownMenuItem>
              )}
              {/* A CONFIRMED transfer cannot be abandoned — the coin already
                  moved, and rewriting the record would make the ledger lie. The
                  server rejects it; not offering it is clearer than a 422. */}
              {canUpdate && row.status !== "CONFIRMED" && row.status !== "ABANDONED" && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    openAbandon(row);
                  }}
                >
                  <Skull className="h-4 w-4" />
                  {t("trf.action.abandon")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      width: "120px",
    },
  ];

  if (!canRead) return <PermissionDenied />;

  // One response, capped server-side at `limit`, so paging is local.
  const totalRows = rows.length;
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);
  const totalPage = Math.ceil(totalRows / pageSize) || 1;
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const isStuck = detail?.status === "BROADCAST" && !detail?.confirmations;

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
          <span className="pro-head-badge">
            <ArrowLeftRight className="h-4 w-4" />
          </span>
          {t("trf.title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">{t("trf.subtitle")}</p>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchField
            id="crypto-transfer-search"
            className="flex-1"
            placeholder={t("trf.search")}
            value={search}
            onChange={setSearch}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10 flex-1 gap-2 sm:flex-none"
              aria-expanded={showFilters}
              aria-controls="crypto-transfer-filters"
              onClick={() => setShowFilters((open) => !open)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t("trf.filter.title")}
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
              onClick={load}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("common:refresh")}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div id="crypto-transfer-filters" className="mt-3 border-t pt-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FilterField label={t("trf.filter.userId")} htmlFor="crypto-user-id">
                <Input
                  id="crypto-user-id"
                  className="h-10"
                  placeholder={t("trf.filter.userIdPlaceholder")}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onBlur={load}
                />
              </FilterField>

              <FilterField label={t("trf.filter.asset")} htmlFor="crypto-asset">
                <Input
                  id="crypto-asset"
                  className="h-10"
                  placeholder={t("trf.filter.assetPlaceholder")}
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  onBlur={load}
                />
              </FilterField>

              {/* A select, not a text box: the API rejects an unknown status
                  outright rather than ignoring it, so a typo becomes an error the
                  operator has to decode. */}
              <FilterField label={t("trf.filter.status")}>
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full data-[size=default]:h-10">
                    <SelectValue placeholder={t("trf.filter.status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{t("trf.filter.allStatuses")}</SelectItem>
                    {CRYPTO_TRANSFER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {humanizeCode(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>

              <FilterField label={t("trf.filter.limit")} htmlFor="crypto-limit">
                <Input
                  id="crypto-limit"
                  className="h-10"
                  type="number"
                  min="1"
                  max={CRYPTO_TRANSFER_LIMIT_MAX}
                  value={limit}
                  onChange={(e) => {
                    // Clamped here as well as server-side: asking for 5000 and
                    // silently receiving 500 reads as missing data.
                    const next = Number(e.target.value) || CRYPTO_TRANSFER_LIMIT_DEFAULT;
                    setLimit(Math.min(Math.max(1, next), CRYPTO_TRANSFER_LIMIT_MAX));
                    setPage(1);
                  }}
                />
                <p className="m-0 text-xs text-muted-foreground">
                  {t("trf.filter.limitHint", { max: CRYPTO_TRANSFER_LIMIT_MAX })}
                </p>
              </FilterField>
            </div>

            <div className="mt-3 flex justify-end">
              <Button
                variant="ghost"
                className="w-full sm:w-auto"
                disabled={activeFilterCount === 0 && !search.trim()}
                onClick={() => {
                  setUserId("");
                  setAsset("");
                  setStatus(ALL);
                  setSearch("");
                  setPage(1);
                  setLimit(CRYPTO_TRANSFER_LIMIT_DEFAULT);
                }}
              >
                {t("trf.filter.clear")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="pro-card">
        {!isLoading && totalRows === 0 ? (
          <EmptyState icon={ArrowLeftRight} text={t("trf.empty")} />
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

      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="pro-dialog sm:max-w-3xl">
          <DialogHeader className="min-w-0 text-start">
            <DialogTitle className="truncate">
              {t("trf.detail.title", { id: truncateHex(detail?.id, 8, 6) })}
            </DialogTitle>
            <DialogDescription>
              {detail ? formatCryptoAmount(detail.amount, detail.assetCode) : ""}
            </DialogDescription>
          </DialogHeader>

          {detail && (
            <div className="flex max-h-[70vh] min-w-0 flex-col gap-3 overflow-y-auto overflow-x-hidden">
              <div className="grid min-w-0 gap-x-6 md:grid-cols-2">
                <div className="min-w-0">
                  <Field
                    label={t("trf.detail.status")}
                    value={<StatusBadge status={detail.status} />}
                  />
                  <Field
                    label={t("trf.detail.amount")}
                    value={formatCryptoAmount(detail.amount, detail.assetCode)}
                  />
                  <Field
                    label={t("trf.detail.confirmations")}
                    value={`${detail.confirmations ?? 0}${
                      detail.requiredConfirmations ? ` / ${detail.requiredConfirmations}` : ""
                    }`}
                  />
                  <Field
                    label={t("trf.detail.networkFee")}
                    value={
                      detail.networkFee == null
                        ? "—"
                        : formatCryptoAmount(detail.networkFee, detail.assetCode)
                    }
                  />
                  <Field label={t("trf.detail.created")} value={formatDateTime(detail.createdAt)} />
                  <Field label={t("trf.detail.updated")} value={formatDateTime(detail.updatedAt)} />
                  <Field
                    label={t("trf.detail.confirmed")}
                    value={formatDateTime(detail.confirmedAt || undefined)}
                  />
                </div>
                <div className="min-w-0">
                  <Field label={t("trf.detail.from")} value={detail.fromAddress || "—"} mono />
                  <Field label={t("trf.detail.to")} value={detail.toAddress || "—"} mono />
                  <Field
                    label={t("trf.detail.hash")}
                    value={detail.txHash || t("trf.noHash")}
                    mono
                  />
                  {detail.failureReason && (
                    <Field label={t("trf.detail.failureReason")} value={detail.failureReason} />
                  )}
                </div>
              </div>

              {/* Broadcast with no confirmation is the case support actually
                  calls about, and the wrong move here is abandoning a transfer
                  the customer is replacing. */}
              {isStuck && (
                <div
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ring-1 ${TONES.amber}`}
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{t("trf.detail.stuckNote")}</span>
                </div>
              )}

              {/* The three fields the customer view does not carry: who, which
                  request, which ledger entry. */}
              <div className="rounded-md border p-3">
                <div className="mb-2 text-sm font-semibold">{t("trf.detail.trace")}</div>
                <div className="grid gap-x-6 md:grid-cols-2">
                  <Field label={t("trf.detail.userId")} value={detail.userId || "—"} mono />
                  <Field
                    label={t("trf.detail.idempotencyKey")}
                    value={detail.idempotencyKey || "—"}
                    mono
                  />
                  <Field
                    label={t("trf.detail.journalEntryId")}
                    value={detail.journalEntryId || "—"}
                    mono
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-end">
            {canUpdate && detail && !isTerminalTransferStatus(detail.status) && (
              <Button
                variant="outline"
                className="gap-2"
                disabled={busyId === detail.id}
                onClick={() => onReconcile(detail)}
              >
                <RefreshCw className={`h-4 w-4 ${busyId === detail.id ? "animate-spin" : ""}`} />
                {t("trf.action.reconcile")}
              </Button>
            )}
            {canUpdate &&
              detail &&
              detail.status !== "CONFIRMED" &&
              detail.status !== "ABANDONED" && (
                <Button variant="outline" className="gap-2" onClick={() => openAbandon(detail)}>
                  <Skull className="h-4 w-4" />
                  {t("trf.action.abandon")}
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Abandon — a reason is mandatory, and the copy is explicit that this
          closes our record rather than cancelling anything on the chain. */}
      <Dialog open={!!abandoning} onOpenChange={(open) => !open && setAbandoning(null)}>
        <DialogContent className="pro-dialog sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle>{t("trf.abandon.title")}</DialogTitle>
            <DialogDescription>{t("trf.abandon.explain")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div
              className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ring-1 ${TONES.amber}`}
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{t("trf.abandon.reconcileFirst")}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="crypto-abandon-reason" className="text-sm font-medium">
                {t("trf.abandon.reason")}
              </label>
              <Textarea
                id="crypto-abandon-reason"
                rows={3}
                value={reason}
                placeholder={t("trf.abandon.reasonPlaceholder")}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => setReasonTouched(true)}
              />
              {reasonTouched && !reason.trim() && (
                <span className="text-xs text-red-600">{t("trf.abandon.reasonRequired")}</span>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => setAbandoning(null)}
              disabled={busyId === abandoning?.id}
            >
              {t("common:cancel")}
            </Button>
            <Button
              className="gap-2"
              onClick={onAbandon}
              disabled={!reason.trim() || busyId === abandoning?.id}
            >
              <Skull className="h-4 w-4" />
              {t("trf.abandon.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CryptoTransfers;
