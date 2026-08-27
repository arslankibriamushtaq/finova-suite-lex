import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Select, DatePicker, Button, Dropdown, Menu } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { History } from "lucide-react";
import toast from "react-hot-toast";
import { getClientRequestProd, getClientsList, getServicesList } from "../../redux/apis/apisThirdParty";
import { themeStyle } from "../../components/Config/Theme";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const { Option } = Select;

const ClientRequestProd = () => {
  const { t } = useTranslation("connector");
  const navigate = useNavigate();
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedApi, setSelectedApi] = useState<string>("");
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: { request?: boolean; response?: boolean } }>({});

  const menu = (row: any) => (
    <Menu>
      <Menu.Item key="view" onClick={() => handleMenuClick("view", row)}>
        {t("clientRequestProd.menu.viewDetails")}
      </Menu.Item>
    </Menu>
  );

  const handleMenuClick = (action: string, row: any) => {
    if (action === "view" && row.id) {
      navigate(`/ThirdPartyManagement/RequestHistory/RequestDetail/${row.id}`);
    }
  };

  // API calls commented out for now
  // useEffect(() => {
  //   fetchClients();
  //   fetchServices();
  //   getRequestsList();
  // }, [page, pageSize]);

  // const fetchClients = async () => {
  //   try {
  //     const response = await getClientsList(100, 1);
  //     if (response?.data?.success) {
  //       const clientsData = response.data.data.clients?.data || response.data.data.clients || [];
  //       setClients(Array.isArray(clientsData) ? clientsData : []);
  //     }
  //   } catch (error: any) {
  //     console.error("Failed to fetch clients:", error);
  //   }
  // };

  // const fetchServices = async () => {
  //   try {
  //     const response = await getServicesList(100, 1);
  //     if (response?.data?.success) {
  //       const servicesData = response.data.data;
  //       let servicesArray: any[] = [];
  //       if (Array.isArray(servicesData)) {
  //         servicesArray = servicesData;
  //       } else if (servicesData?.services && Array.isArray(servicesData.services)) {
  //         servicesArray = servicesData.services;
  //       } else if (servicesData?.data?.services && Array.isArray(servicesData.data.services)) {
  //         servicesArray = servicesData.data.services;
  //       }
  //       setServices(servicesArray);
  //     }
  //   } catch (error: any) {
  //     console.error("Failed to fetch services:", error);
  //   }
  // };

  // const getRequestsList = async () => {
  //   try {
  //     setSkelitonLoading(true);
  //     const params: any = {
  //       records: pageSize,
  //       page: page,
  //     };
  //
  //     if (selectedClient) params.client_id = selectedClient;
  //     if (selectedService) params.service_id = selectedService;
  //     if (selectedApi) params.api_id = selectedApi;
  //     if (fromDate) params.from = fromDate.format("YYYY-MM-DD");
  //     if (toDate) params.to = toDate.format("YYYY-MM-DD");
  //
  //     const response = await getClientRequestProd(params);
  //     if (response?.data?.success) {
  //       const requestsHistory = response.data.data?.requests_history;
  //       let requestsArray: any[] = [];
  //
  //       if (requestsHistory?.data && Array.isArray(requestsHistory.data)) {
  //         requestsArray = requestsHistory.data;
  //         setTotalRows(requestsHistory.total || 0);
  //         setFrom(requestsHistory.from || 0);
  //         setTo(requestsHistory.to || 0);
  //         setPage(requestsHistory.current_page || page);
  //         setTotalPage(requestsHistory.last_page || 1);
  //       } else if (response.data.data?.data && Array.isArray(response.data.data.data)) {
  //         requestsArray = response.data.data.data;
  //         setTotalRows(response.data.data.total || 0);
  //         setFrom(response.data.data.from || 0);
  //         setTo(response.data.data.to || 0);
  //         setPage(response.data.data.current_page || page);
  //         setTotalPage(response.data.data.last_page || 1);
  //       } else if (Array.isArray(response.data.data)) {
  //         requestsArray = response.data.data;
  //         setTotalRows(requestsArray.length || 0);
  //         setFrom(requestsArray.length > 0 ? 1 : 0);
  //         setTo(requestsArray.length || 0);
  //         setPage(1);
  //         setTotalPage(1);
  //       }
  //       setData(requestsArray);
  //     }
  //     setSkelitonLoading(false);
  //   } catch (error: any) {
  //     toast.error(error?.response?.data?.message || "Failed to fetch requests");
  //     setSkelitonLoading(false);
  //   }
  // };

  const handleFilter = () => {
    setPage(1);
    // getRequestsList();
  };

  const handleReset = () => {
    setSelectedClient("");
    setSelectedService("");
    setSelectedApi("");
    setFromDate(null);
    setToDate(null);
    setPage(1);
  };

  // useEffect(() => {
  //   getRequestsList();
  // }, [page, pageSize]);

  // Helper function to format JSON strings
  const formatJSON = (jsonString: string | any) => {
    if (!jsonString) return "-";
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return typeof jsonString === 'string' ? jsonString : JSON.stringify(jsonString);
    }
  };

  const toggleExpand = (rowId: number, type: 'request' | 'response') => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [type]: !prev[rowId]?.[type],
      },
    }));
  };

  const isExpanded = (rowId: number, type: 'request' | 'response') => {
    return expandedRows[rowId]?.[type] || false;
  };

  return (
    <div className="service client-request-prod-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <History className="h-4 w-4" />
          </span>
          {t("clientRequestProd.title")}
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Select
            placeholder={t("clientRequestProd.placeholder.selectClient")}
            value={selectedClient || undefined}
            onChange={(value) => setSelectedClient(value || "")}
            style={{ flex: "1 1 200px", minWidth: 180, height: 40 }}
          >
            {clients.map((client: any) => (
              <Option key={client.id} value={client.id.toString()}>
                {client.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder={t("clientRequestProd.placeholder.selectService")}
            allowClear
            value={selectedService || undefined}
            onChange={(value) => setSelectedService(value || "")}
            style={{ flex: "1 1 200px", minWidth: 180, height: 40 }}
          >
            {services.map((service: any) => (
              <Option key={service.id} value={service.id.toString()}>
                {service.name}
              </Option>
            ))}
          </Select>

          <DatePicker
            placeholder={t("clientRequestProd.placeholder.from")}
            value={fromDate}
            onChange={(date) => setFromDate(date)}
            format="YYYY-MM-DD"
            style={{ flex: "1 1 180px", minWidth: 160, height: 40, borderRadius: 2, background: "#fff" }}
          />
          <DatePicker
            placeholder={t("clientRequestProd.placeholder.to")}
            value={toDate}
            onChange={(date) => setToDate(date)}
            format="YYYY-MM-DD"
            style={{ flex: "1 1 180px", minWidth: 160, height: 40, borderRadius: 2, background: "#fff" }}
          />
          <button
            type="button"
            className="theme-btn-next"
            onClick={handleFilter}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {t("common:filter")}
          </button>
          <button
            type="button"
            className="theme-btn-next"
            onClick={handleReset}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {t("common:reset")}
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="pro-card">
        {/* Table Header */}
        <div
          style={{
            display: "flex",
            borderBottom: "2px solid var(--color-border-subtle)",
            background: themeStyle?.table.backgroundColor || "#FAF2F3",
            borderRadius: "2px 2px 0 0",
          }}
        >
          <div style={{ flex: "0 0 120px", padding: "12px 8px", textAlign: "left" }}>
            <span style={{ fontSize: "12px", fontWeight: "400", color: themeStyle?.table.headingColor || "#090909" }}>
              {t("clientRequestProd.col.nid")}
            </span>
          </div>
          <div style={{ flex: "1", padding: "12px 8px", textAlign: "left" }}>
            <span style={{ fontSize: "12px", fontWeight: "400", color: themeStyle?.table.headingColor || "#090909" }}>
              {t("clientRequestProd.col.clientName")}
            </span>
          </div>
          <div style={{ flex: "1", padding: "12px 8px", textAlign: "left" }}>
            <span style={{ fontSize: "12px", fontWeight: "400", color: themeStyle?.table.headingColor || "#090909" }}>
              {t("clientRequestProd.col.apiName")}
            </span>
          </div>
          <div style={{ flex: "1", padding: "12px 8px", textAlign: "left" }}>
            <span style={{ fontSize: "12px", fontWeight: "400", color: themeStyle?.table.headingColor || "#090909" }}>
              {t("clientRequestProd.col.request")}
            </span>
          </div>
          <div style={{ flex: "1", padding: "12px 8px", textAlign: "left" }}>
            <span style={{ fontSize: "12px", fontWeight: "400", color: themeStyle?.table.headingColor || "#090909" }}>
              {t("clientRequestProd.col.response")}
            </span>
          </div>
          <div style={{ flex: "0 0 120px", padding: "12px 8px", textAlign: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: "400", color: themeStyle?.table.headingColor || "#090909" }}>
              {t("clientRequestProd.col.action")}
            </span>
          </div>
        </div>

        {/* Table Body */}
        {skelitonLoading ? (
          <div>
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  minHeight: "44px",
                  padding: "0px 10px",
                }}
              >
                <div style={{ flex: "0 0 120px", padding: "12px 8px" }}>
                  <Skeleton height={20} />
                </div>
                <div style={{ flex: "1", padding: "12px 8px" }}>
                  <Skeleton height={20} />
                </div>
                <div style={{ flex: "1", padding: "12px 8px" }}>
                  <Skeleton height={20} />
                </div>
                <div style={{ flex: "1", padding: "12px 8px" }}>
                  <Skeleton height={20} />
                </div>
                <div style={{ flex: "1", padding: "12px 8px" }}>
                  <Skeleton height={20} />
                </div>
                <div style={{ flex: "0 0 120px", padding: "12px 8px" }}>
                  <Skeleton height={20} />
                </div>
              </div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div>
            {data.map((row: any, index: number) => (
              <div key={row.id || index}>
                {/* Main Row */}
                <div
                  style={{
                    display: "flex",
                    borderBottom: "1px solid var(--color-border-subtle)",
                    minHeight: "44px",
                    padding: "0px 10px",
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: "0 0 120px", padding: "12px 8px", fontSize: "15px", color: themeStyle?.table.bodyTextColor || "black" }}>
                    {row.nid || "-"}
                  </div>
                  <div style={{ flex: "1", padding: "12px 8px", fontSize: "15px", color: themeStyle?.table.bodyTextColor || "black" }}>
                    {row.client?.name || row.client_name || "-"}
                  </div>
                  <div style={{ flex: "1", padding: "12px 8px", fontSize: "15px", color: themeStyle?.table.bodyTextColor || "black" }}>
                    {row.api?.name || row.api_name || "-"}
                  </div>
                  <div style={{ flex: "1", padding: "12px 8px" }}>
                    <Button
                      type="link"
                      onClick={() => toggleExpand(row.id, 'request')}
                      style={{
                        padding: 0,
                        height: "auto",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "var(--color-action)",
                      }}
                    >
                      {isExpanded(row.id, 'request') ? <UpOutlined /> : <DownOutlined />}
                      <span>{t("clientRequestProd.viewRequest")}</span>
                    </Button>
                  </div>
                  <div style={{ flex: "1", padding: "12px 8px" }}>
                    <Button
                      type="link"
                      onClick={() => toggleExpand(row.id, 'response')}
                      style={{
                        padding: 0,
                        height: "auto",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "var(--color-action)",
                      }}
                    >
                      {isExpanded(row.id, 'response') ? <UpOutlined /> : <DownOutlined />}
                      <span>{t("clientRequestProd.viewResponse")}</span>
                    </Button>
                  </div>
                  <div style={{ flex: "0 0 120px", padding: "12px 8px", textAlign: "center" }}>
                    <Dropdown overlay={menu(row)} trigger={["click"]}>
                      <Button type="primary" style={{ backgroundColor: "var(--foreground)" }}>
                        {t("clientRequestProd.select")} <DownOutlined />
                      </Button>
                    </Dropdown>
                  </div>
                </div>
                {/* Expanded Request Content */}
                {isExpanded(row.id, 'request') && (
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "var(--color-surface-cloud)",
                      borderBottom: "1px solid var(--color-border-subtle)",
                    }}
                  >
                    <div style={{ marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>{t("clientRequestProd.requestLabel")}</div>
                    <pre
                      style={{
                        margin: 0,
                        padding: "12px",
                        fontSize: "12px",
                        backgroundColor: "var(--background)",
                        borderRadius: "2px",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        maxHeight: "400px",
                        overflow: "auto",
                        border: "1px solid var(--color-border-subtle)",
                      }}
                    >
                      {formatJSON(row.request || "")}
                    </pre>
                  </div>
                )}
                {/* Expanded Response Content */}
                {isExpanded(row.id, 'response') && (
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "var(--color-surface-cloud)",
                      borderBottom: "1px solid var(--color-border-subtle)",
                    }}
                  >
                    <div style={{ marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>{t("clientRequestProd.responseLabel")}</div>
                    <pre
                      style={{
                        margin: 0,
                        padding: "12px",
                        fontSize: "12px",
                        backgroundColor: "var(--background)",
                        borderRadius: "2px",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        maxHeight: "400px",
                        overflow: "auto",
                        border: "1px solid var(--color-border-subtle)",
                      }}
                    >
                      {formatJSON(row.responses || "")}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--color-text-subtle)" }}>
            {t("common:noData")}
          </div>
        )}

        {/* Pagination */}
        {totalRows > 0 && (
          <div
            className="pagination-div"
            style={{
              padding: "16px",
              borderTop: "1px solid var(--color-border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px" }}>
                {t("clientRequestProd.pagination", { from, to, total: totalRows })}
              </span>
              <Select
                value={pageSize}
                onChange={(value) => setPageSize(value)}
                style={{ width: 80 }}
              >
                <Option value={5}>5</Option>
                <Option value={10}>10</Option>
                <Option value={15}>15</Option>
                <Option value={20}>20</Option>
              </Select>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                style={{
                  padding: "4px 12px",
                  border: "1px solid var(--color-border-light)",
                  borderRadius: "2px",
                  backgroundColor: page === 1 ? "var(--color-surface-subtle)" : "var(--background)",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >
                ««
              </button>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                style={{
                  padding: "4px 12px",
                  border: "1px solid var(--color-border-light)",
                  borderRadius: "2px",
                  backgroundColor: page === 1 ? "var(--color-surface-subtle)" : "var(--background)",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >
                ‹
              </button>
              <span style={{ padding: "4px 12px", fontSize: "14px" }}>{page}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPage}
                style={{
                  padding: "4px 12px",
                  border: "1px solid var(--color-border-light)",
                  borderRadius: "2px",
                  backgroundColor: page === totalPage ? "var(--color-surface-subtle)" : "var(--background)",
                  cursor: page === totalPage ? "not-allowed" : "pointer",
                }}
              >
                ›
              </button>
              <button
                onClick={() => setPage(totalPage)}
                disabled={page === totalPage}
                style={{
                  padding: "4px 12px",
                  border: "1px solid var(--color-border-light)",
                  borderRadius: "2px",
                  backgroundColor: page === totalPage ? "var(--color-surface-subtle)" : "var(--background)",
                  cursor: page === totalPage ? "not-allowed" : "pointer",
                }}
              >
                »»
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientRequestProd;

