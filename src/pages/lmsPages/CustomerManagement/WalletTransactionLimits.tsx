import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { RefreshCw, Check, X, ChevronDown, SlidersHorizontal } from "lucide-react";

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
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

import {
  getWalletLimitRequests,
  approveWalletLimitRequest,
  rejectWalletLimitRequest,
  WalletLimitRequest,
} from "../../../redux/apis/apisWalletAdmin";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const STATUS_BADGE: Record<string, string> = {
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 dark:border dark:border-amber-500/30",
  APPROVED:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300 dark:border dark:border-green-500/30",
  REJECTED:
    "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300 dark:border dark:border-red-500/30",
};

const formatMoney = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const formatDate = (dateString: string | null) => {
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

const LimitCell = ({ current, requested }: { current: number; requested: number }) => {
  const { t } = useTranslation("customerManagement");
  return (
    <div className="flex flex-col text-xs leading-tight">
      <span className="text-muted-foreground">{t("walletLimits.cell.current", { value: formatMoney(current) })}</span>
      <span className="font-medium text-foreground">{t("walletLimits.cell.requested", { value: formatMoney(requested) })}</span>
    </div>
  );
};

const WalletTransactionLimits = () => {
  const { t } = useTranslation("customerManagement");
  const [data, setData] = useState<WalletLimitRequest[]>([]);
  const [status, setStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  // Approve modal
  const [approveTarget, setApproveTarget] = useState<WalletLimitRequest | null>(null);
  const [approveNotes, setApproveNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<WalletLimitRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const res = await getWalletLimitRequests(status === "ALL" ? undefined : status);
      const rows = res?.data?.data || res?.data || [];
      setData(Array.isArray(rows) ? rows : []);
    } catch (error: any) {
      console.error(error);
      toast.error(t("walletLimits.toast.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const openApprove = (row: WalletLimitRequest) => {
    setApproveTarget(row);
    setApproveNotes("");
  };

  const openReject = (row: WalletLimitRequest) => {
    setRejectTarget(row);
    setRejectionReason("");
    setRejectNotes("");
  };

  const handleApprove = async () => {
    if (!approveTarget) return;
    setIsApproving(true);
    try {
      await approveWalletLimitRequest(approveTarget.id, { notes: approveNotes.trim() });
      toast.success(t("walletLimits.toast.approved"));
      setApproveTarget(null);
      loadRequests();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || t("walletLimits.toast.approveFailed"));
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectionReason.trim()) {
      return toast.error(t("walletLimits.toast.reasonRequired"));
    }
    setIsRejecting(true);
    try {
      await rejectWalletLimitRequest(rejectTarget.id, {
        rejectionReason: rejectionReason.trim(),
        notes: rejectNotes.trim(),
      });
      toast.success(t("walletLimits.toast.rejected"));
      setRejectTarget(null);
      loadRequests();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || t("walletLimits.toast.rejectFailed"));
    } finally {
      setIsRejecting(false);
    }
  };

  const headers = [
    {
      name: t("walletLimits.col.customerId"),
      cell: (row: WalletLimitRequest) => (
        <span className="font-mono text-xs" title={row.customerId}>
          {row.customerId}
        </span>
      ),
      width: "230px",
    },
    {
      name: t("walletLimits.col.singleLimit"),
      cell: (row: WalletLimitRequest) => (
        <LimitCell current={row.currentSingleLimit} requested={row.requestedSingleLimit} />
      ),
      width: "150px",
    },
    {
      name: t("walletLimits.col.dailyLimit"),
      cell: (row: WalletLimitRequest) => (
        <LimitCell current={row.currentDailyLimit} requested={row.requestedDailyLimit} />
      ),
      width: "150px",
    },
    {
      name: t("walletLimits.col.weeklyLimit"),
      cell: (row: WalletLimitRequest) => (
        <LimitCell current={row.currentWeeklyLimit} requested={row.requestedWeeklyLimit} />
      ),
      width: "150px",
    },
    {
      name: t("walletLimits.col.monthlyLimit"),
      cell: (row: WalletLimitRequest) => (
        <LimitCell current={row.currentMonthlyLimit} requested={row.requestedMonthlyLimit} />
      ),
      width: "150px",
    },
    {
      name: t("walletLimits.col.yearlyLimit"),
      cell: (row: WalletLimitRequest) => (
        <LimitCell current={row.currentYearlyLimit} requested={row.requestedYearlyLimit} />
      ),
      width: "160px",
    },
    {
      name: t("walletLimits.col.reason"),
      cell: (row: WalletLimitRequest) => (
        <span className="text-sm text-muted-foreground" title={row.reason || ""}>
          {row.reason || "-"}
        </span>
      ),
      width: "220px",
    },
    {
      name: t("common:status"),
      cell: (row: WalletLimitRequest) => (
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
            STATUS_BADGE[row.status] || "bg-muted text-foreground"
          }`}
        >
          {row.status}
        </span>
      ),
      width: "120px",
    },
    {
      name: t("walletLimits.col.requestedAt"),
      cell: (row: WalletLimitRequest) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.requestedAt)}</span>
      ),
      width: "170px",
    },
    {
      name: t("common:actions"),
      cell: (row: WalletLimitRequest) =>
        row.status === "PENDING" ? (
          <div
            className="relative inline-block"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {t("common:select")}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
                <DropdownMenuItem onClick={() => openApprove(row)} className="cursor-pointer gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{t("common:approve")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openReject(row)}
                  className="cursor-pointer gap-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950"
                >
                  <X className="h-4 w-4" />
                  <span>{t("common:reject")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
      ignoreRowClick: true,
      allowOverflow: true,
      width: "140px",
    },
  ];

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          {t("walletLimits.title")}
        </h3>
        <div className="d-flex align-items-center gap-2">
          <div style={{ width: 180 }}>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder={t("walletLimits.filterPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(`common:${opt.value.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="gap-2" onClick={loadRequests} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common:refresh")}
          </Button>
        </div>
      </div>

      <div className="pro-card">
        <TableView
          header={headers}
          data={data}
          isLoading={isLoading}
          paginationShow={false}
        />
      </div>

      {/* Approve Modal */}
      <Dialog open={!!approveTarget} onOpenChange={(open) => !open && setApproveTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              {t("walletLimits.approve.title")}
            </DialogTitle>
            <DialogDescription>
              {t("walletLimits.approve.desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{t("walletLimits.notesOptional")}</Label>
            <Textarea
              placeholder={t("walletLimits.approve.notesPlaceholder")}
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>
              {t("common:cancel")}
            </Button>
            <Button onClick={handleApprove} disabled={isApproving} className="gap-2">
              <Check className="h-4 w-4" />
              {isApproving ? t("walletLimits.approving") : t("common:approve")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="w-5 h-5 text-destructive" />
              {t("walletLimits.reject.title")}
            </DialogTitle>
            <DialogDescription>
              {t("walletLimits.reject.desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                {t("walletLimits.reject.reasonLabel")} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder={t("walletLimits.reject.reasonPlaceholder")}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("walletLimits.notesOptional")}</Label>
              <Textarea
                placeholder={t("walletLimits.reject.notesPlaceholder")}
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              {t("common:cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              {isRejecting ? t("walletLimits.rejecting") : t("common:reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletTransactionLimits;
