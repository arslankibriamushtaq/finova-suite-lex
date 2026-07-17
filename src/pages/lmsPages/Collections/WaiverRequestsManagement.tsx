import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown, BadgePercent } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";
import { usePermissions, POLICY_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Label } from "../../../components/ui/label";
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
  DialogFooter,
} from "../../../components/ui/dialog";
import TableView from "../../../components/TableView/TableView";
import {
  getWaiverRequests,
  approveWaiverRequest,
  rejectWaiverRequest,
} from "../../../redux/apis/apisLendingService";

const STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "All", value: "ALL" },
];

const statusBadgeStyle = (status: string) => {
  switch (status) {
    case "APPROVED":
      return { backgroundColor: "var(--color-status-green)", color: "var(--primary-foreground)" };
    case "REJECTED":
      return { backgroundColor: "var(--color-status-coral)", color: "var(--primary-foreground)" };
    default:
      return { backgroundColor: "var(--muted)", color: "var(--muted-foreground)" };
  }
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "-";

const formatCurrency = (amount?: number | null) =>
  amount != null
    ? new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR" }).format(amount)
    : "-";

const WaiverRequestsManagement = () => {
  const { hasPermission } = usePermissions();
  // Approving/rejecting waiver requests is an authorize action.
  const canAuthorizeWaiver = hasPermission(POLICY_PERMISSIONS.AUTHORIZE) || hasPermission(POLICY_PERMISSIONS.MANAGE);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");

  // Approve state
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonError, setRejectionReasonError] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getWaiverRequests(page - 1, pageSize, statusFilter, searchTerm);
      const list = response?.data?.data;
      setData(Array.isArray(list) ? list : []);
      const pagination = response?.data?.pagination || response?.data?.pageInfo;
      if (pagination) {
        const total = pagination.totalElements ?? pagination.totalCount ?? 0;
        setTotalRows(total);
        setTotalPage(Math.ceil(total / pageSize) || 1);
      } else {
        const arr = Array.isArray(list) ? list : [];
        setTotalRows(arr.length);
        setTotalPage(Math.ceil(arr.length / pageSize) || 1);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch waiver requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, statusFilter, searchTerm]);

  const handleApprove = async (row: any) => {
    try {
      setApprovingId(row.id);
      await approveWaiverRequest(row.id);
      toast.success("Waiver request approved");
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to approve waiver request");
    } finally {
      setApprovingId(null);
    }
  };

  const openRejectModal = (row: any) => {
    setRejectTarget(row);
    setRejectionReason("");
    setRejectionReasonError("");
  };

  const closeRejectModal = () => {
    setRejectTarget(null);
    setRejectionReason("");
    setRejectionReasonError("");
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectionReasonError("Rejection reason is required");
      return;
    }
    try {
      setIsRejecting(true);
      await rejectWaiverRequest(rejectTarget.id, { rejectionReason: rejectionReason.trim() });
      toast.success("Waiver request rejected");
      closeRejectModal();
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to reject waiver request");
    } finally {
      setIsRejecting(false);
    }
  };

  const columns = [
    {
      name: "Customer",
      cell: (row: any) => (
        <div>
          <div className="font-medium text-sm">{row.customerName || "-"}</div>
          <div className="text-xs text-muted-foreground">{row.customerId || ""}</div>
        </div>
      ),
      width: "180px",
    },
    {
      name: "Loan ID",
      selector: (row: any) => row.loanId || row.loanNumber || "-",
      width: "140px",
    },
    {
      name: "Installment",
      cell: (row: any) => (
        <div>
          <div className="text-sm">{formatDate(row.installmentDate)}</div>
          {row.installmentNumber != null && (
            <div className="text-xs text-muted-foreground">#{row.installmentNumber}</div>
          )}
        </div>
      ),
      width: "140px",
    },
    {
      name: "Accrued Penalty",
      selector: (row: any) => formatCurrency(row.accruedPenaltyAmount),
      width: "150px",
    },
    {
      name: "Requested Waiver",
      selector: (row: any) => formatCurrency(row.requestedWaiverAmount),
      width: "150px",
    },
    {
      name: "Reason",
      cell: (row: any) => (
        <span
          title={row.reason || ""}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: 12,
          }}
        >
          {row.reason || "-"}
        </span>
      ),
      width: "200px",
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 32,
            fontSize: 12,
            fontWeight: 500,
            ...statusBadgeStyle(row.status),
          }}
        >
          {row.status || "-"}
        </span>
      ),
      width: "110px",
    },
    {
      name: "Requested",
      selector: (row: any) => formatDate(row.createdAt),
      width: "120px",
    },
    {
      name: "Actions",
      cell: (row: any) => {
        if (row.status !== "PENDING" || !canAuthorizeWaiver) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={approvingId === row.id}
              >
                {approvingId === row.id ? "Processing..." : "Select"}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => handleApprove(row)}
                disabled={approvingId === row.id}
              >
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => openRejectModal(row)}
              >
                Reject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      width: "140px",
    },
  ];

  return (
    <div className="service waiver-requests-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <BadgePercent className="h-4 w-4" />
          </span>
          Waiver Requests
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder="Search by customer or loan..."
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger style={{ flex: "1 1 180px", minWidth: 160, height: 40 }}>
              <SelectValue placeholder="Status" />
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
      </div>

      {/* Table card */}
      <div className="pro-card">
        <TableView
          header={columns}
          data={data}
          totalRows={totalRows}
          isLoading={isLoading}
          from={(page - 1) * pageSize + (totalRows > 0 ? 1 : 0)}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={Math.min(page * pageSize, totalRows)}
        />
      </div>

      {/* Reject Modal */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && closeRejectModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Waiver Request</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Provide a reason for rejecting this waiver request from{" "}
              <strong>{rejectTarget?.customerName || "customer"}</strong>.
            </p>
            <div className="space-y-1">
              <Label>Rejection Reason *</Label>
              <textarea
                rows={3}
                className={`w-full rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring ${
                  rejectionReasonError ? "border-destructive" : "border-input"
                }`}
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (e.target.value.trim()) setRejectionReasonError("");
                }}
              />
              {rejectionReasonError && (
                <p className="text-sm text-destructive">{rejectionReasonError}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeRejectModal} disabled={isRejecting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isRejecting}>
              {isRejecting ? "Rejecting..." : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaiverRequestsManagement;
