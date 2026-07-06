import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { History, ChevronDown, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getClientRequestDevList } from "../../redux/apis/apisThirdParty";

const ClientRequestDev = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  const extractItems = (root: any): any[] => {
    const items =
      root?.data?.content ||
      root?.data?.items ||
      root?.data ||
      root?.content ||
      [];
    return Array.isArray(items) ? items : [];
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Backend pagination: request only the current page (API is 0-based).
      const res = await getClientRequestDevList(page - 1, pageSize);
      const root = res?.data ?? {};
      const rows = extractItems(root);

      // Pagination metadata can live at the root, under `pagination`, or inside
      // a Spring-style page object (`data.content` + totals).
      const container = root?.data ?? root;
      const meta =
        root?.pagination ||
        root?.data?.pagination ||
        (Array.isArray(container) ? root : container) ||
        {};

      const total =
        Number(meta?.totalElements ?? meta?.total ?? meta?.totalCount) ||
        rows.length;
      const pages =
        Number(meta?.totalPages ?? meta?.last_page) ||
        Math.max(1, Math.ceil(total / pageSize));

      setData(rows);
      setTotalRows(total);
      setTotalPage(pages);
      setFrom(total === 0 ? 0 : (page - 1) * pageSize + 1);
      setTo(Math.min(page * pageSize, total));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch dev requests"
      );
      setData([]);
      setTotalRows(0);
      setTotalPage(0);
      setFrom(0);
      setTo(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleView = (row: any) => {
    const id = row.id || row.requestId || row.uuid;
    if (!id) return;
    navigate(`/ThirdPartyManagement/RequestHistory/ClientRequestDev/${id}`);
  };

  const formatDate = (value: any) =>
    value ? new Date(value).toLocaleString() : "-";

  const headers = [
    {
      name: "Request ID",
      selector: (row: any) => row.requestId || row.id || "-",
      sortable: true,
      width: "170px",
      cell: (row: any) => {
        const reqId = row.requestId || row.id || "-";
        return (
          <span title={reqId} style={{ fontSize: 12 }}>
            {reqId.toString().length > 15
              ? reqId.toString().slice(0, 15) + "..."
              : reqId}
          </span>
        );
      },
    },
    {
      name: "API Code",
      selector: (row: any) => row.apiCode || "-",
      sortable: true,
      width: "180px",
      cell: (row: any) => (
        <span title={row.apiCode || "-"} style={{ fontSize: 12, fontWeight: 600 }}>
          {row.apiCode || "-"}
        </span>
      ),
    },
    {
      name: "Client",
      selector: (row: any) => row.clientName || row.client?.name || "-",
      sortable: true,
      width: "160px",
    },
    {
      name: "Service",
      selector: (row: any) =>
        row.serviceName || row.service?.name || row.serviceId || "-",
      sortable: true,
    },
    {
      name: "API",
      selector: (row: any) => row.apiName || row.api?.name || row.endpoint || "-",
      sortable: true,
    },
    {
      name: "Mobile Phone",
      selector: (row: any) =>
        row.mobilePhone || row.mobile || row.phone || row.phoneNumber || "-",
      width: "150px",
    },
    {
      name: "NID",
      selector: (row: any) => row.nid || row.nationalId || "-",
      width: "130px",
    },
    {
      name: "Status",
      cell: (row: any) => {
        const status = row.responseStatus ?? row.statusCode ?? row.status ?? "-";
        const code = Number(status);
        const isSuccess = code >= 200 && code < 300;
        const isClientError = code >= 400 && code < 500;
        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 2,
              backgroundColor: isSuccess
                ? "var(--color-status-green)"
                : isClientError
                ? "var(--color-status-amber)"
                : "var(--color-status-coral)",
              color: "var(--primary-foreground)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {status}
          </span>
        );
      },
      width: "110px",
    },
    {
      name: "Created At",
      selector: (row: any) =>
        formatDate(row.createdAt || row.requestedAt || row.timestamp),
      sortable: true,
      width: "180px",
    },
    {
      name: "Action",
      cell: (row: any) => (
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
                Select
                <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  handleView(row);
                }}
              >
                <Eye className="h-4 w-4" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      width: "140px",
    },
  ];

  return (
    <div className="service client-request-dev-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <History className="h-4 w-4" />
          </span>
          Client Request Dev
        </h3>
      </div>

      {/* Table card */}
      <div className="pro-card">
        <TableView
          header={headers}
          data={data}
          totalRows={totalRows}
          isLoading={loading}
          from={from}
          to={to}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          paginationShow={true}
        />
      </div>
    </div>
  );
};

export default ClientRequestDev;
