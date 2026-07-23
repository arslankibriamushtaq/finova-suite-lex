import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Receipt, Eye, CheckCircle2, Search } from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

import {
  listExchangePayments,
  confirmExchangePayment,
  ExchangePayment,
} from "../../../redux/apis/apisWalletAdmin";

const STATUS_BADGE: Record<string, string> = {
  COMPLETED:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

const StatusBadge = ({ status }: { status?: string }) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
      STATUS_BADGE[status || ""] || "bg-muted text-foreground"
    }`}
  >
    {status || "-"}
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

const methodLabel = (method?: string) =>
  method === "ONE_BILL" ? "1 Bill" : method === "CARD" ? "Card" : method || "-";

const STATUS_FILTERS = ["ALL", "PENDING", "COMPLETED", "FAILED"];

const ExchangePayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<ExchangePayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

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
        error?.response?.data?.message || "Failed to load exchange payments"
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
      toast.success("Payment confirmed — customer wallet credited");
      loadPayments();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to confirm payment"
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

  const headers = [
    {
      name: "Payment ID",
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
      name: "Customer",
      cell: (row: ExchangePayment) => (
        <span className="text-sm">{row.customerName || "-"}</span>
      ),
      width: "180px",
    },
    {
      name: "Method",
      cell: (row: ExchangePayment) => (
        <span className="text-sm">{methodLabel(row.method)}</span>
      ),
      width: "100px",
    },
    {
      name: "Receiving",
      cell: (row: ExchangePayment) => (
        <span className="font-medium">
          {formatMoney(row.receivingAmount, row.receivingCurrency)}
        </span>
      ),
      width: "150px",
    },
    {
      name: "Paying",
      cell: (row: ExchangePayment) => (
        <span className="text-sm">
          {formatMoney(row.totalPaying, row.payingCurrency)}
        </span>
      ),
      width: "160px",
    },
    {
      name: "Status",
      cell: (row: ExchangePayment) => <StatusBadge status={row.status} />,
      width: "120px",
    },
    {
      name: "Action",
      cell: (row: ExchangePayment) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => openDetail(row)}
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
          {canConfirm(row) && (
            <Button
              size="sm"
              className="gap-1 wallet-brand-btn"
              onClick={() => confirmPayment(row)}
              disabled={confirmingId === row.paymentId}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {confirmingId === row.paymentId ? "Confirming…" : "Confirm"}
            </Button>
          )}
        </div>
      ),
      width: "220px",
    },
  ];

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between">
        <div>
          <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
            <span className="pro-head-badge">
              <Receipt className="h-4 w-4" />
            </span>
            Exchange Payments
          </h3>
          <p className="mb-0 mt-1 text-sm text-muted-foreground">
            Oversee the exchange top-up payments customers make (1 Bill / card).
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="relative w-[260px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search customer, ID, bill, ref…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-[180px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "ALL" ? "All statuses" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="pro-card-glow">
        <CardHeader>
          <CardTitle className="text-base">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <TableView
            header={headers}
            data={filteredPayments}
            isLoading={isLoading}
            paginationShow={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangePayments;
