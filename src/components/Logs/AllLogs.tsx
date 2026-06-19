import { useEffect, useState } from "react";

import { Dropdown, Menu, Button, Tag, Tooltip } from "antd";
import TableView from "../TableView/TableView";

import {
  getAllApiLogs,
} from "../../redux/apis/apisCrudLms";
import {

  DownOutlined,

  EyeOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
const AllLogs = () => {
  const [buisnessCustomers, setBuinsessCustomers] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  

  const getAllCustomers = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getAllApiLogs(page, pageSize);
      if (response?.data?.success) {
        // Extract logs from Elasticsearch hits
        const logs = response?.data?.data?.hits?.hits || [];
        setBuinsessCustomers(logs);
        // Elasticsearch returns total count in hits.total.value
        const totalCount = response?.data?.data?.hits?.total?.value || 0;
        setTotalRows(totalCount);
        
        // Calculate from and to based on pagination
        const calculatedFrom = totalCount > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalCount);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch logs");
      // Reset pagination values on error
      setTotalRows(0);
      setFrom(0);
      setTo(0);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const mappedData =
    buisnessCustomers &&
    buisnessCustomers.map((item: any) => {
      const source = item._source || {};
      return {
        id: item._id,
        channel: source.channel || "-",
        level: source.level || "-",
        message: source.message || "-",
        timestamp: source.timestamp || source["@timestamp"] || "-",
        trace_id: source.trace_id || source.traceId || "-",
        transaction_id: source.transaction_id || "-",
        context: source.context || {},
      };
    });
  useEffect(() => {}, []);
  useEffect(() => {
    getAllCustomers();
  }, [pageSize, page]);

  const handleChange = (key: string, row: any) => {
    if (key === "view") {
      // You can navigate to details page or open a modal here
      // navigate(`/lms/Logs/details/${row.id}`);
    }
  };

  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="view" icon={<EyeOutlined />}>
        View Details
      </Menu.Item>
    </Menu>
  );
  function formatDate(dateString: any) {
    if (!dateString || dateString === "-") return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "info":
        return "blue";
      case "warning":
      case "warn":
        return "orange";
      case "error":
        return "red";
      case "debug":
        return "green";
      default:
        return "default";
    }
  };

  const Customer_ALL_List_Header = [
    {
      name: "Level",
      selector: (row: any) => row.level,
      cell: (row: any) => (
        <Tag color={getLevelColor(row.level)} style={{ fontWeight: 600 }}>
          {row.level?.toUpperCase()}
        </Tag>
      ),
  
    },
    {
      name: "Channel",
      selector: (row: any) => row.channel,
      cell: (row: any) => <span style={{ fontSize: "12px" }}>{row.channel}</span>,

    },
    {
      name: "Message",
      selector: (row: any) => row.message,
      cell: (row: any) => (
        <Tooltip title={row.message}>
          <span
            style={{
              fontSize: "12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
              maxWidth: "300px",
            }}
          >
            {row.message}
          </span>
        </Tooltip>
      ),

    },
    {
      name: "Timestamp",
      selector: (row: any) => row.timestamp,
      cell: (row: any) => (
        <span style={{ fontSize: "11px" }}>{formatDate(row.timestamp)}</span>
      ),
  
    },
    {
      name: "Trace ID",
      selector: (row: any) => row.trace_id,
      cell: (row: any) => (
        <Tooltip title={row.trace_id}>
          <code
            style={{
              fontSize: "10px",
              background: "#f5f5f5",
              padding: "2px 6px",
              borderRadius: "6px",
              display: "block",
              maxWidth: "120px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {row.trace_id}
          </code>
        </Tooltip>
      ),

    },
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            size="small"
            style={{
              borderColor: "white",
              borderRadius: "6px",
              padding: "4px 12px",
            }}
          >
            View <DownOutlined />
          </Button>
        </Dropdown>
      ),

    },
  ];

  return (
    <>
      <div>
        <div className="d-flex col-12">
          <div className="col-10">
            <div className=" mt-4">
              <h1 style={{ fontSize: "22px" }}>API Logs</h1>
              <p style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                View and monitor all API logs from Elasticsearch
              </p>
            </div>
          </div>
        </div>

        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          from={from}
          to={to}
          header={Customer_ALL_List_Header}
          data={mappedData}
          isLoading={skelitonLoading}
        />
      </div>
    </>
  );
};

export default AllLogs;
