import React, { useState, useEffect } from "react";
import { Input, Select, DatePicker, Button, Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";

const { Option } = Select;

interface ClientRequestHistoryProps {
  environment?: "dev" | "prod" | "service";
}

const ClientRequestHistory: React.FC<ClientRequestHistoryProps> = ({ environment = "dev" }) => {
  const navigate = useNavigate();
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  // Filter states
  const [searchCR, setSearchCR] = useState("");
  const [searchContract, setSearchContract] = useState("");
  const [searchNID, setSearchNID] = useState("");
  const [searchRequest, setSearchRequest] = useState("");
  const [selectedClient, setSelectedClient] = useState("All");
  const [selectedService, setSelectedService] = useState("All");
  const [selectedApi, setSelectedApi] = useState("All");
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);

  const menu = (row: any) => (
    <Menu>
      <Menu.Item key="view" onClick={() => handleMenuClick("view", row)}>
        View Details
      </Menu.Item>
      <Menu.Item key="retry" onClick={() => handleMenuClick("retry", row)}>
        Retry Request
      </Menu.Item>
    </Menu>
  );

  const handleMenuClick = (action: string, row: any) => {
    // TODO: Add action logic
  };

  const Request_Headers = [
    {
      name: "Request Number",
      selector: (row: { requestNumber: any }) => row.requestNumber,
      sortable: true,
    },
    {
      name: "Contract Number",
      selector: (row: { contractNumber: any }) => row.contractNumber,
      sortable: true,
    },
    {
      name: "CR Number",
      selector: (row: { crNumber: any }) => row.crNumber,
      sortable: true,
    },
    {
      name: "NID",
      selector: (row: { nid: any }) => row.nid,
      sortable: true,
    },
    {
      name: "Client Name",
      selector: (row: { clientName: any }) => row.clientName,
      sortable: true,
    },
    {
      name: "Service Name",
      selector: (row: { serviceName: any }) => row.serviceName,
      sortable: true,
    },
    {
      name: "Api Name",
      selector: (row: { apiName: any }) => row.apiName,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            backgroundColor: row.status === "Success" ? "#52c41a" : "#ff4d4f",
            color: "white",
            fontSize: "12px",
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Request Time",
      selector: (row: { requestTime: any }) => row.requestTime,
      sortable: true,
      width: "180px",
    },
    {
      name: "Action",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button type="link">
            View <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const getRequestHistory = async () => {
    try {
      setSkelitonLoading(true);
      // TODO: Replace with actual API call
      // const response = await getClientRequestHistory(page, pageSize, environment, filters);
      
      // Mock data
      const mockData = {
        data: {
          data: [],
          total: 0,
          from: 0,
          to: 0,
          current_page: 1,
          last_page: 1,
        },
      };
      
      setData(mockData.data.data || []);
      setTotalRows(mockData.data.total || 0);
      setFrom(mockData.data.from || 0);
      setTo(mockData.data.to || 0);
      setPage(mockData.data.current_page);
      setTotalPage(mockData.data.last_page);
      setSkelitonLoading(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch request history");
      setSkelitonLoading(false);
    }
  };

  useEffect(() => {
    getRequestHistory();
  }, [page, pageSize]);

  const mappedData = data?.map((item: any) => ({
    id: item?.id,
    requestNumber: item?.request_number || "-",
    contractNumber: item?.contract_number || "-",
    crNumber: item?.cr_number || "-",
    nid: item?.nid || "-",
    clientName: item?.client_name || "-",
    serviceName: item?.service_name || "-",
    apiName: item?.api_name || "-",
    status: item?.status || "Success",
    requestTime: item?.request_time || "-",
  }));

  const handleExport = () => {
    toast.success("Exporting to Excel...");
    // TODO: Implement export logic
  };

  return (
    <div className="service">
      {/* <h2 style={{ marginBottom: "20px" }}>Client Request History</h2> */}
      
      {/* Filters Row */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px" }}>Search by CR No.</label>
          <Input
            placeholder="Xxxxxxxxxx"
            value={searchCR}
            onChange={(e) => setSearchCR(e.target.value)}
            style={{ width: "150px" }}
          />
        </div>
        
        <div>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px" }}>Search by Contract No.</label>
          <Input
            placeholder="Xxxxxxxxxx"
            value={searchContract}
            onChange={(e) => setSearchContract(e.target.value)}
            style={{ width: "150px" }}
          />
        </div>
        
        <div>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px" }}>Search by Nid</label>
          <Input
            placeholder="Xxxxxxxxxx"
            value={searchNID}
            onChange={(e) => setSearchNID(e.target.value)}
            style={{ width: "150px" }}
          />
        </div>
        
        <div>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px" }}>Search by Request Number</label>
          <Input
            placeholder="Req-Xxxxxxxxx"
            value={searchRequest}
            onChange={(e) => setSearchRequest(e.target.value)}
            style={{ width: "150px" }}
          />
        </div>
        
        <div>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px" }}>Select Client</label>
          <Select value={selectedClient} onChange={setSelectedClient} style={{ width: "120px" }}>
            <Option value="All">All</Option>
          </Select>
        </div>
        
        <div>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px" }}>Select Service</label>
          <Select value={selectedService} onChange={setSelectedService} style={{ width: "120px" }}>
            <Option value="All">All</Option>
          </Select>
        </div>
        
        <div>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px" }}>Select Api</label>
          <Select value={selectedApi} onChange={setSelectedApi} style={{ width: "120px" }}>
            <Option value="All">All</Option>
          </Select>
        </div>
        
        <div>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px" }}>From</label>
          <DatePicker
            format="MM/DD/YYYY"
            value={fromDate}
            onChange={setFromDate}
            placeholder="mm/dd/yyyy"
            style={{ width: "140px" }}
          />
        </div>
        
        <div>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px" }}>To</label>
          <DatePicker
            format="MM/DD/YYYY"
            value={toDate}
            onChange={setToDate}
            placeholder="mm/dd/yyyy"
            style={{ width: "140px" }}
          />
        </div>

        {environment === "service" && (
          <Button
            style={{ backgroundColor: "#28a745", color: "white", border: "none" }}
            onClick={handleExport}
          >
            Export Excel
          </Button>
        )}
      </div>

      <TableView
        header={Request_Headers}
        data={mappedData}
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
  );
};

export default ClientRequestHistory;

