import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
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
  const [allRows, setAllRows] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 1s debounce
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
      setPage(1);
    }, 1000);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  // Reset to page 1 when pageSize changes
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const extractItems = (root: any): any[] => {
    const data =
      root?.data?.content ||
      root?.data?.items ||
      root?.data ||
      root?.content ||
      [];
    return Array.isArray(data) ? data : [];
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      // Backend caps each page, so walk every page and concatenate so search +
      // pagination both work over the full result set.
      const firstRes = await getClientRequestDevList(0, 100);
      const firstRoot = firstRes?.data;
      let combined: any[] = [...extractItems(firstRoot)];

      const pagination =
        firstRoot?.pagination ||
        firstRoot?.data?.pagination ||
        firstRoot?.page ||
        firstRoot?.data?.page;
      const totalPagesFromApi = Number(pagination?.totalPages) || 1;

      if (totalPagesFromApi > 1) {
        const remaining = await Promise.all(
          Array.from({ length: totalPagesFromApi - 1 }, (_, i) =>
            getClientRequestDevList(i + 1, 100)
              .then((r) => extractItems(r?.data))
              .catch(() => [])
          )
        );
        combined = combined.concat(...remaining);
      }

      setAllRows(combined);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch dev requests"
      );
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side filter — searches across request id, API code, service, API,
  // mobile, NID and status so users can find rows easily.
  const filteredRows = useMemo(() => {
    if (!debouncedSearch) return allRows;
    return allRows.filter((row: any) => {
      const haystack = [
        row.requestId,
        row.id,
        row.apiCode,
        row.clientName,
        row.client?.name,
        row.providerName,
        row.provider?.name,
        row.serviceName,
        row.service?.name,
        row.serviceId,
        row.apiName,
        row.api?.name,
        row.endpoint,
        row.mobilePhone,
        row.mobile,
        row.phone,
        row.phoneNumber,
        row.nid,
        row.nationalId,
        row.responseStatus,
        row.statusCode,
        row.status,
        row.httpMethod,
        row.method,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
        .join(" ");
      return haystack.includes(debouncedSearch);
    });
  }, [allRows, debouncedSearch]);

  // Client-side pagination over the filtered set
  const totalRows = filteredRows.length;
  const totalPage = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filteredRows.slice(startIndex, startIndex + pageSize);

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

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            allowClear
            placeholder="Search by request ID, API code, service, API, mobile, NID, status"
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
        </div>
      </div>

      {/* Table card */}
      <div className="pro-card">
        <TableView
          header={headers}
          data={paginatedData}
          totalRows={totalRows}
          isLoading={loading}
          from={totalRows > 0 ? startIndex + 1 : 0}
          to={Math.min(page * pageSize, totalRows)}
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
