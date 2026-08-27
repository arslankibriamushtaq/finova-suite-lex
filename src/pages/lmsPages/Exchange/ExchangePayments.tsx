import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Receipt, Eye, CheckCircle2, RefreshCw, ChevronDown } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import TableView from "../../../components/TableView/TableView";
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

const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

import {
  listExchangePayments,
  confirmExchangePayment,
  ExchangePayment,
} from "../../../redux/apis/apisWalletAdmin";

const STATUS_BADGE: Record<string, string> = {
  COMPLETED:
    "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

const StatusBadge = ({ status, label }: { status?: string; label?: string }) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
      STATUS_BADGE[status || ""] || "bg-muted text-foreground"
    }`}
  >
    {label || status || "-"}
  </span>
);

const formatMoney = (value: number | null | undefined, currency?: string) => {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "-";
  const amount = Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${amount} ${currency}` : amount;
};

const STATUS_FILTERS = ["ALL", "PENDING", "COMPLETED", "FAILED"];

const ExchangePayments = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("exchange");
  const methodText = (m?: string) =>
    m === "ONE_BILL"
      ? t("payments.method.oneBill")
      : m === "CARD"
        ? t("payments.method.card")
        : m || "-";
  const statusLabel = (s?: string) =>
    s ? (t(`payments.status.${s.toLowerCase()}`) as string) : "-";
  const [payments, setPayments] = useState<ExchangePayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const loadPayments = async (status = statusFilter) => {
    setIsLoading(true);
    try {
      const res = await listExchangePayments({
        status: status === "ALL" ? undefined : status,
        limit: 50,
      });
      const body = res?.data ?? {};
      const inner = body?.data ?? body;
      const rows = Array.isArray(inner) ? inner : inner?.content ?? [];
      setPayments(Array.isArray(rows) ? rows : []);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || t("payments.toast.loadFailed")
      );
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openDetail = (payment: ExchangePayment) =>
    navigate(`/LOS/Exchange/Payments/${payment.paymentId}`);

  const confirmPayment = async (payment: ExchangePayment) => {
    setConfirmingId(payment.paymentId);
    try {
      await confirmExchangePayment(payment.paymentId);
      toast.success(t("payments.toast.confirmed"));
      loadPayments();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || t("payments.toast.confirmFailed")
      );
    } finally {
      setConfirmingId(null);
    }
  };

  const canConfirm = (p: ExchangePayment) =>
    p.status === "PENDING" && p.method === "ONE_BILL";

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((p) =>
      [
        p.customerName,
        p.customerId,
        p.paymentId,
        p.quoteId,
        p.billId,
        p.providerReference,
        p.cardLastFour,
        p.method,
        p.status,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }, [payments, search]);

  const from = (page - 1) * pageSize;
  const paged = filteredPayments.slice(from, from + pageSize);
  const totalPage = Math.ceil(filteredPayments.length / pageSize) || 1;

  const headers = [
    {
      name: t("payments.col.paymentId"),
      cell: (row: ExchangePayment) => (
        <button
          type="button"
          onClick={() => openDetail(row)}
          className="font-mono text-xs text-primary hover:underline"
        >
          {row.paymentId}
        </button>
      ),
      width: "180px",
    },
    {
      name: t("payments.col.customer"),
      cell: (row: ExchangePayment) => (
        <span className="text-sm">{row.customerName || "-"}</span>
      ),
      width: "180px",
    },
    {
      name: t("payments.col.method"),
      cell: (row: ExchangePayment) => (
        <span className="text-sm">{methodText(row.method)}</span>
      ),
      width: "100px",
    },
    {
      name: t("payments.col.receiving"),
      cell: (row: ExchangePayment) => (
        <span className="font-medium">
          {formatMoney(row.receivingAmount, row.receivingCurrency)}
        </span>
      ),
      width: "150px",
    },
    {
      name: t("payments.col.paying"),
      cell: (row: ExchangePayment) => (
        <span className="text-sm">
          {formatMoney(row.totalPaying, row.payingCurrency)}
        </span>
      ),
      width: "160px",
    },
    {
      name: t("common:status"),
      cell: (row: ExchangePayment) => (
        <StatusBadge status={row.status} label={statusLabel(row.status)} />
      ),
      width: "120px",
    },
    {
      name: t("payments.col.action"),
      cell: (row: ExchangePayment) => (
        <div
          className="relative inline-block"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={confirmingId === row.paymentId}
                className={SELECT_TRIGGER_CLS}
              >
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
              {canConfirm(row) && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    confirmPayment(row);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {confirmingId === row.paymentId
                    ? t("payments.action.confirming")
                    : t("payments.action.confirm")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      width: "120px",
    },
  ];

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
          <span className="pro-head-badge">
            <Receipt className="h-4 w-4" />
          </span>
          {t("payments.title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">
          {t("payments.subtitle")}
        </p>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder={t("payments.search")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          <div style={{ width: 170 }}>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger style={{ height: 40 }}>
                <SelectValue placeholder={t("common:status")} />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            style={{ height: 40 }}
            onClick={() => loadPayments()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common:refresh")}
          </Button>
        </div>
      </div>

      <div className="pro-card">
        <TableView
          header={headers}
          data={paged}
          totalRows={filteredPayments.length}
          isLoading={isLoading}
          from={filteredPayments.length === 0 ? 0 : from + 1}
          to={Math.min(page * pageSize, filteredPayments.length)}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </div>
    </div>
  );
};

export default ExchangePayments;
