import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getClientRequestDev } from "../../redux/apis/apisThirdParty";

const ClientRequestDev = () => {
  const navigate = useNavigate();
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const menu = (row: any) => (
    <Menu>
      <Menu.Item key="view" onClick={() => handleMenuClick("view", row)}>
        View Details
      </Menu.Item>
    </Menu>
  );

  const handleMenuClick = (action: string, row: any) => {
    if (action === "view" && row.id) {
      navigate(`/ThirdPartyManagement/RequestHistory/RequestDetail/${row.id}`);
    }
  };

  // API calls commented out for now
  // const getRequestsList = async () => {
  //   try {
  //     setSkelitonLoading(true);
  //     const response = await getClientRequestDev(pageSize, page);
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

  // useEffect(() => {
  //   getRequestsList();
  // }, [page, pageSize]);

  const Headers = [
    {
      name: "Request ID",
      selector: (row: any) => row.request_id || "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "Client",
      selector: (row: any) => row.client?.name || "-",
      sortable: true,
    },
    {
      name: "Service",
      selector: (row: any) => row.api?.service?.name || row.api?.service_id || "-",
      sortable: true,
    },
    {
      name: "API",
      selector: (row: any) => row.api?.name || "-",
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: any) => {
        const statusCode = row.status || "500";
        const isSuccess = statusCode === "200" || statusCode === 200;
        return (
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              backgroundColor: isSuccess ? "var(--color-success)" : "var(--color-error)",
              color: "white",
              fontSize: "12px",
            }}
          >
            {statusCode}
          </span>
        );
      },
      sortable: true,
    },
    {
      name: "NID",
      selector: (row: any) => row.nid || "-",
      sortable: true,
      width: "120px",
    },
    {
      name: "Created At",
      selector: (row: any) => row.created_at ? new Date(row.created_at).toLocaleString() : "-",
      sortable: true,
      width: "180px",
    },
    {
      name: "Action",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button type="primary" style={{ backgroundColor: "var(--foreground)" }}>
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="service client-request-dev-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Client Request Dev</h3>
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
          header={Headers}
          data={data}
          totalRows={totalRows}
          isLoading={skelitonLoading}
          from={from}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={to}
        />
      </div>
    </div>
  );
};

export default ClientRequestDev;

