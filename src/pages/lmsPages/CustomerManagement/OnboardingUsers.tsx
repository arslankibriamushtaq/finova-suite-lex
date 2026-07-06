import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Search, Eye, ChevronDown, Users } from "lucide-react";

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

import {
  getOnboardingSessions,
  OnboardingSession,
} from "../../../redux/apis/apisUniversalOnboarding";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PENDING", label: "Pending" },
  { value: "ABANDONED", label: "Abandoned" },
  { value: "FAILED", label: "Failed" },
];

const FLOW_OPTIONS = [
  { value: "ALL", label: "All Flows" },
  { value: "LOCAL", label: "Local" },
  { value: "FOREIGN", label: "Foreign" },
];

const STATUS_BADGE: Record<string, string> = {
  IN_PROGRESS:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 dark:border dark:border-blue-500/30",
  COMPLETED:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300 dark:border dark:border-green-500/30",
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 dark:border dark:border-amber-500/30",
  ABANDONED:
    "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300 dark:border dark:border-gray-500/30",
  FAILED:
    "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300 dark:border dark:border-red-500/30",
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

// Accessors — primary keys match the live payload; older keys kept as fallbacks.
const getWorkflowId = (row: OnboardingSession) =>
  row.workflowId || row.sessionId || row.id || "";
const getName = (row: OnboardingSession) =>
  row.customerName ||
  row.fullName ||
  row.name ||
  row.maskedEmail ||
  row.maskedMobile ||
  row.email ||
  row.phone ||
  row.mobile ||
  "-";
const getContact = (row: OnboardingSession) =>
  row.maskedEmail || row.maskedMobile || row.email || row.phone || row.mobile || "-";
const getFlow = (row: OnboardingSession) =>
  row.flowType || row.flow || row.countryCode || "-";
const getCurrentStep = (row: OnboardingSession) =>
  row.currentStepLabel || row.currentStepName || row.currentStep || "-";

const getProgress = (row: OnboardingSession): number => {
  if (typeof row.progressPercent === "number") {
    return Math.min(100, Math.round(row.progressPercent));
  }
  if (typeof row.progress === "number") {
    return row.progress > 1 ? Math.round(row.progress) : Math.round(row.progress * 100);
  }
  const total = Number(row.totalSteps);
  const done = Number(row.completedSteps ?? row.currentStepIndex);
  if (total > 0 && !Number.isNaN(done)) {
    return Math.min(100, Math.round((done / total) * 100));
  }
  return 0;
};

const ProgressCell = ({ row }: { row: OnboardingSession }) => {
  const pct = getProgress(row);
  const total = Number(row.totalSteps);
  const done = Number(row.completedSteps ?? row.currentStepIndex);
  const label =
    total > 0 && !Number.isNaN(done) ? `${done}/${total}` : `${pct}%`;
  return (
    <div className="flex flex-col gap-1 w-[120px]">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const OnboardingUsers = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<OnboardingSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [status, setStatus] = useState("ALL");
  const [flow, setFlow] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Pagination (Spring pageable is 0-based; TableView is 1-based)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status, flow, search]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const res = await getOnboardingSessions({
        page: page - 1,
        size: pageSize,
        status: status === "ALL" ? undefined : status,
        flow: flow === "ALL" ? undefined : flow,
        search: search || undefined,
      });

      const body = res?.data?.data ?? res?.data ?? {};
      const rows: OnboardingSession[] =
        body.content ?? body.sessions ?? body.items ?? (Array.isArray(body) ? body : []);
      setData(Array.isArray(rows) ? rows : []);

      const pagination = res?.data?.pagination ?? body;
      const totalItems = Number(
        pagination?.totalElements ?? pagination?.total ?? rows.length ?? 0
      );
      const totalPages = Number(
        pagination?.totalPages ?? Math.ceil(totalItems / pageSize) ?? 0
      );
      setTotalRows(totalItems);
      setTotalPage(totalPages);
      setFrom(totalItems === 0 ? 0 : (page - 1) * pageSize + 1);
      setTo(Math.min(page * pageSize, totalItems));
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load onboarding users"
      );
      setData([]);
      setTotalRows(0);
      setTotalPage(0);
    } finally {
      setIsLoading(false);
    }
  };

  const applySearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const openDetail = (row: OnboardingSession) => {
    const wf = getWorkflowId(row);
    if (!wf) {
      toast.error("No workflow id available for this session");
      return;
    }
    navigate(`/LOS/CustomerManagement/OnboardingUsers/${encodeURIComponent(wf)}`);
  };

  const headers = [
    {
      name: "User",
      cell: (row: OnboardingSession) => {
        const name = getName(row);
        const contact = getContact(row);
        return (
          <div className="flex flex-col leading-tight">
            <span className="font-medium text-foreground">{name}</span>
            {contact !== "-" && contact !== name && (
              <span className="text-[11px] text-muted-foreground">{contact}</span>
            )}
          </div>
        );
      },
      width: "220px",
    },
    {
      name: "Flow",
      cell: (row: OnboardingSession) => (
        <span className="text-sm text-foreground">{getFlow(row)}</span>
      ),
      width: "120px",
    },
    {
      name: "Current Step",
      cell: (row: OnboardingSession) => (
        <span className="text-sm text-foreground" title={getCurrentStep(row)}>
          {getCurrentStep(row)}
        </span>
      ),
      width: "200px",
    },
    {
      name: "Progress",
      cell: (row: OnboardingSession) => <ProgressCell row={row} />,
      width: "150px",
    },
    {
      name: "Status",
      cell: (row: OnboardingSession) => (
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
            STATUS_BADGE[row.status || ""] || "bg-muted text-foreground"
          }`}
        >
          {row.status || "-"}
        </span>
      ),
      width: "130px",
    },
    {
      name: "Started",
      cell: (row: OnboardingSession) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.startedAt || row.createdAt)}
        </span>
      ),
      width: "170px",
    },
    {
      name: "Last Updated",
      cell: (row: OnboardingSession) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.updatedAt)}</span>
      ),
      width: "170px",
    },
    {
      name: "Actions",
      cell: (row: OnboardingSession) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="gap-1.5 rounded-[2px] text-white hover:opacity-90"
              style={{ backgroundColor: "var(--color-action)" }}
              onClick={(e) => e.stopPropagation()}
            >
              Select
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="gap-2"
              onClick={(e) => {
                e.stopPropagation();
                openDetail(row);
              }}
            >
              <Eye className="h-3.5 w-3.5" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      width: "120px",
    },
  ];

  return (
    <div className="service customer-list-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <Users className="h-4 w-4" />
          </span>
          Onboarding Users
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <div
            className="d-flex align-items-center gap-1 border px-2"
            style={{ borderRadius: 2, height: 34, flex: "1 1 240px", minWidth: 200 }}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              placeholder="Search name, email, phone…"
              style={{ flex: 1, border: "none", outline: "none", background: "transparent" }}
              className="text-sm"
            />
          </div>
          <div style={{ width: 160 }}>
            <Select
              value={flow}
              onValueChange={(v) => {
                setPage(1);
                setFlow(v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Flow" />
              </SelectTrigger>
              <SelectContent>
                {FLOW_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div style={{ width: 170 }}>
            <Select
              value={status}
              onValueChange={(v) => {
                setPage(1);
                setStatus(v);
              }}
            >
              <SelectTrigger>
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
          <Button variant="outline" className="gap-2" onClick={loadSessions} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div className="pro-card">
        <TableView
          header={headers}
          data={data}
          isLoading={isLoading}
          paginationShow
          page={page}
          pageSize={pageSize}
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
          totalPage={totalPage}
          from={from}
          to={to}
        />
      </div>
    </div>
  );
};

export default OnboardingUsers;
