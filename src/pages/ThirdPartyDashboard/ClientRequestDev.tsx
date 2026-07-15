import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { History, ChevronDown, Eye, Search, X } from "lucide-react";
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
  const { t } = useTranslation("connector");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [search, setSearch] = useState("");

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
          t("clientRequestDev.toast.fetchFailed")
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

  // Client-side search over the loaded rows across the visible columns.
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => {
      const haystack = [
        row.requestId,
        row.id,
        row.apiCode,
        row.clientName,
        row.client?.name,
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
        row.responseStatus ?? row.statusCode ?? row.status,
      ]
        .filter((v) => v !== undefined && v !== null)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [data, search]);

  const handleView = (row: any) => {
    const id = row.id || row.requestId || row.uuid;
    if (!id) return;
    navigate(`/ThirdPartyManagement/RequestHistory/ClientRequestDev/${id}`);
  };

  const formatDate = (value: any) =>
    value ? new Date(value).toLocaleString() : "-";

  const headers = [
    {
      name: t("clientRequestDev.col.requestId"),
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
      name: t("clientRequestDev.col.apiCode"),
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
      name: t("clientRequestDev.col.client"),
      selector: (row: any) => row.clientName || row.client?.name || "-",
      sortable: true,
      width: "160px",
    },
    {
      name: t("clientRequestDev.col.service"),
      selector: (row: any) =>
        row.serviceName || row.service?.name || row.serviceId || "-",
      sortable: true,
    },
    {
      name: t("clientRequestDev.col.api"),
      selector: (row: any) => row.apiName || row.api?.name || row.endpoint || "-",
      sortable: true,
    },
    {
      name: t("clientRequestDev.col.mobilePhone"),
      selector: (row: any) =>
        row.mobilePhone || row.mobile || row.phone || row.phoneNumber || "-",
      width: "150px",
    },
    {
      name: t("clientRequestDev.col.nid"),
      selector: (row: any) => row.nid || row.nationalId || "-",
      width: "130px",
    },
    {
      name: t("common:status"),
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
      name: t("clientRequestDev.col.createdAt"),
      selector: (row: any) =>
        formatDate(row.createdAt || row.requestedAt || row.timestamp),
      sortable: true,
      width: "180px",
    },
    {
      name: t("clientRequestDev.col.action"),
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
                {t("clientRequestDev.select")}
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
                {t("clientRequestDev.viewDetails")}
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
          {t("clientRequestDev.title")}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("clientRequestDev.searchPlaceholder")}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent" }}
              className="text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground"
                aria-label={t("clientRequestDev.clearSearch")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="pro-card">
        <TableView
          header={headers}
          data={filteredData}
          totalRows={search ? filteredData.length : totalRows}
          isLoading={loading}
          from={search ? (filteredData.length ? 1 : 0) : from}
          to={search ? filteredData.length : to}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          paginationShow={!search}
        />
      </div>
    </div>
  );
};

export default ClientRequestDev;
