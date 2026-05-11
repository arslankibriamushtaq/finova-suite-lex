import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dropdown, Input, Menu } from "antd";
import { DownOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getClientRequestTest } from "../../redux/apis/apisThirdParty";

const ClientRequestTest = () => {
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
      const firstRes = await getClientRequestTest(0, 100);
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
            getClientRequestTest(i + 1, 100)
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
          "Failed to fetch test requests"
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

  // Client-side filter — searches across request id, service, API, mobile, NID,
  // environment, and status code so users can find rows easily.
  const filteredRows = useMemo(() => {
    if (!debouncedSearch) return allRows;
    return allRows.filter((row: any) => {
      const haystack = [
        row.requestId,
        row.id,
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
        row.environment,
        row.env,
        row.envName,
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
    navigate(`/ThirdPartyManagement/RequestHistory/ClientRequestTest/${id}`);
  };

  const actionMenu = (row: any) => (
    <Menu>
      <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => handleView(row)}>
        View Details
      </Menu.Item>
    </Menu>
  );

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
      name: "Client",
      selector: (row: any) => row.clientName || row.client?.name || "-",
      sortable: true,
      width: "160px",
    },
    {
      name: "Provider",
      selector: (row: any) => row.providerName || row.provider?.name || "-",
      sortable: true,
      width: "160px",
    },
    {
      name: "Service",
      selector: (row: any) => row.serviceName || row.service?.name || row.serviceId || "-",
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
      name: "Environment",
      cell: (row: any) => {
        const env = (
          row.environment ||
          row.env ||
          row.envName ||
          "-"
        ).toString();
        const upper = env.toUpperCase();
        const color =
          upper === "PROD" || upper === "PRODUCTION"
            ? "var(--color-status-green)"
            : upper === "DEV" || upper === "DEVELOPMENT"
            ? "var(--color-status-blue)"
            : upper === "TEST" || upper === "TESTING" || upper === "UAT"
            ? "var(--color-status-amber)"
            : "var(--muted)";
        const textColor =
          upper === "-" || color === "var(--muted)"
            ? "var(--foreground)"
            : "var(--primary-foreground)";
        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              backgroundColor: color,
              color: textColor,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {upper}
          </span>
        );
      },
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
              borderRadius: 6,
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
      selector: (row: any) => formatDate(row.createdAt || row.requestedAt || row.timestamp),
      sortable: true,
      width: "180px",
    },
    {
      name: "Action",
      cell: (row: any) => (
        <Dropdown overlay={actionMenu(row)} trigger={["click"]}>
          <Button
            type="primary"
            className="theme-btn-next"
            style={{ height: 36, borderRadius: 8 }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
      width: "140px",
    },
  ];

  return (
    <div className="service client-request-test-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Client Request Test</h3>
      </div>

      {/* Filters card */}
      <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            allowClear
            placeholder="Search by request ID, service, API, mobile, NID, environment, status"
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
          />
        </div>
      </div>

      {/* Table card */}
      <div
        className="bg-white"
        style={{
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
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

export default ClientRequestTest;
