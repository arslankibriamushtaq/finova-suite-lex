import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ShieldCheck, Eye, ChevronDown } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import TableView from "../../../components/TableView/TableView";
import { Badge } from "../../../components/ui/badge";
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
  listExchangeVerifications,
  ExchangeVerificationQueueItem,
} from "../../../redux/apis/apisWalletAdmin";

const APPROVAL_BADGE: Record<string, string> = {
  APPROVED:
    "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

const ApprovalBadge = ({ status, label }: { status?: string; label?: string }) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
      APPROVAL_BADGE[status || ""] || "bg-muted text-foreground"
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

const STATUS_FILTERS = ["PENDING", "APPROVED", "REJECTED"];

const ExchangeVerifications = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("exchange");
  // Enum status values map to shared common: labels for display.
  const statusLabel = (s?: string) =>
    s ? (t(`common:${s.toLowerCase()}`) as string) : "-";
  const [items, setItems] = useState<ExchangeVerificationQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

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
        error?.response?.data?.message || t("verifications.toast.loadFailed")
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

  const from = (page - 1) * pageSize;
  const paged = filtered.slice(from, from + pageSize);
  const totalPage = Math.ceil(filtered.length / pageSize) || 1;

  const headers = [
    {
      name: t("verifications.col.customer"),
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
      name: t("verifications.col.country"),
      cell: (row: ExchangeVerificationQueueItem) => (
        <Badge variant="outline">{row.countryCode}</Badge>
      ),
      width: "100px",
    },
    {
      name: t("verifications.col.receiving"),
      cell: (row: ExchangeVerificationQueueItem) => (
        <span className="font-medium">
          {formatMoney(row.receivingAmount, row.receivingCurrency)}
        </span>
      ),
      width: "150px",
    },
    {
      name: t("verifications.col.paying"),
      cell: (row: ExchangeVerificationQueueItem) => (
        <span className="text-sm">
          {formatMoney(row.totalPaying, row.payingCurrency)}
        </span>
      ),
      width: "160px",
    },
    {
      name: t("verifications.col.faceMatch"),
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
      name: t("verifications.col.approval"),
      cell: (row: ExchangeVerificationQueueItem) => (
        <ApprovalBadge
          status={row.approvalStatus}
          label={statusLabel(row.approvalStatus)}
        />
      ),
      width: "120px",
    },
    {
      name: t("verifications.col.action"),
      cell: (row: ExchangeVerificationQueueItem) => (
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
                {t("verifications.action.review")}
              </DropdownMenuItem>
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
            <ShieldCheck className="h-4 w-4" />
          </span>
          {t("verifications.title")}
        </h3>
        <p className="mb-0 mt-1 text-sm text-muted-foreground">
          {t("verifications.subtitle")}
        </p>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder={t("verifications.search")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ flex: "1 1 240px", minWidth: 220, borderRadius: 2, height: 40 }}
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
        </div>
      </div>

      <div className="pro-card">
        <TableView
          header={headers}
          data={paged}
          totalRows={filtered.length}
          isLoading={isLoading}
          from={filtered.length === 0 ? 0 : from + 1}
          to={Math.min(page * pageSize, filtered.length)}
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

export default ExchangeVerifications;
