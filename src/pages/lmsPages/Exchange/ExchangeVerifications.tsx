import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck, Eye, Search } from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
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
  listExchangeVerifications,
  ExchangeVerificationQueueItem,
} from "../../../redux/apis/apisWalletAdmin";

const APPROVAL_BADGE: Record<string, string> = {
  APPROVED:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

const ApprovalBadge = ({ status }: { status?: string }) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
      APPROVAL_BADGE[status || ""] || "bg-muted text-foreground"
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

const STATUS_FILTERS = ["PENDING", "APPROVED", "REJECTED"];

const ExchangeVerifications = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ExchangeVerificationQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [search, setSearch] = useState("");

  const load = async (status = statusFilter) => {
    setIsLoading(true);
    try {
      const res = await listExchangeVerifications({ status, limit: 50 });
      const body = res?.data ?? {};
      const inner = body?.data ?? body;
      const rows = Array.isArray(inner) ? inner : inner?.content ?? [];
      setItems(Array.isArray(rows) ? rows : []);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load verifications"
      );
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openDetail = (row: ExchangeVerificationQueueItem) =>
    navigate(`/LOS/Exchange/Verifications/${row.quoteId}`);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.customerName, it.customerId, it.quoteId, it.countryCode]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [items, search]);

  const headers = [
    {
      name: "Customer",
      cell: (row: ExchangeVerificationQueueItem) => (
        <button
          type="button"
          onClick={() => openDetail(row)}
          className="text-sm text-primary hover:underline"
        >
          {row.customerName || row.customerId || "-"}
        </button>
      ),
      width: "200px",
    },
    {
      name: "Country",
      cell: (row: ExchangeVerificationQueueItem) => (
        <Badge variant="outline">{row.countryCode}</Badge>
      ),
      width: "100px",
    },
    {
      name: "Receiving",
      cell: (row: ExchangeVerificationQueueItem) => (
        <span className="font-medium">
          {formatMoney(row.receivingAmount, row.receivingCurrency)}
        </span>
      ),
      width: "150px",
    },
    {
      name: "Paying",
      cell: (row: ExchangeVerificationQueueItem) => (
        <span className="text-sm">
          {formatMoney(row.totalPaying, row.payingCurrency)}
        </span>
      ),
      width: "160px",
    },
    {
      name: "Face Match",
      cell: (row: ExchangeVerificationQueueItem) => (
        <span className="text-sm text-muted-foreground">
          {row.faceMatchScore == null
            ? "-"
            : `${(row.faceMatchScore * 100).toFixed(1)}%`}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Approval",
      cell: (row: ExchangeVerificationQueueItem) => (
        <ApprovalBadge status={row.approvalStatus} />
      ),
      width: "120px",
    },
    {
      name: "Action",
      cell: (row: ExchangeVerificationQueueItem) => (
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => openDetail(row)}
        >
          <Eye className="h-3.5 w-3.5" />
          Review
        </Button>
      ),
      width: "120px",
    },
  ];

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between">
        <div>
          <h3 className="mb-0 fw-bold text-dark ps-0 d-flex align-items-center gap-2">
            <span className="pro-head-badge">
              <ShieldCheck className="h-4 w-4" />
            </span>
            Verification Approvals
          </h3>
          <p className="mb-0 mt-1 text-sm text-muted-foreground">
            Review completed KYC and approve or reject before the top-up can be
            paid.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="relative w-[240px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search customer, country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-[160px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="pro-card-glow">
        <CardHeader>
          <CardTitle className="text-base">Review Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <TableView
            header={headers}
            data={filtered}
            isLoading={isLoading}
            paginationShow={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeVerifications;
