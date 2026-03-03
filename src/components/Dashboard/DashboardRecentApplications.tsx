import { useEffect, useState } from "react";
import { Button, Dropdown, Menu, Select } from "antd";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import { getRecentApplications, leadsList } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { EyeOutlined, LogoutOutlined, SyncOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import MaskedValue from "../MaskedValue";

const DashboardRecentApplications = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const getStatusColor = (status: string) => {
    const statusColors: any = {
      "DISBURSED":   "var(--color-success)",
      "APPROVED":    "var(--color-info)",
      "PENDING":     "var(--color-warning)",
      "REJECTED":    "var(--theme-secondary)",
      "IN_PROGRESS": "var(--color-info)",
      "CANCELLED":   "var(--color-disabled)",
    };
    return statusColors[status] || "var(--color-disabled)";
  };

  const Activity_Loans_Header = [
    {
      name: "Application Number",
      selector: (row: { loan_application_number: any }) => row.loan_application_number || "--",
      sortable: true,
      width: "180px",
    },
    {
      name: "Customer Name",
      selector: (row: { company_name: any }) => row.company_name || "--",
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row: { phone: any }) => row.phone || "--",
      sortable: true,
    },
    {
      name: "Requested Amount",
      selector: (row: { requested_amount: any }) => {
        return row.requested_amount ? `SAR ${row.requested_amount.toLocaleString()}` : "--";
      },
      sortable: true,
    },
    {
      name: "Customer Type",
      selector: (row: { customer_type: any }) => row.customer_type || "--",
      sortable: true,
    },
    {
      name: "Channel",
      selector: (row: { channel: any }) => row.channel || "--",
      sortable: true,
    },
    {
      name: "Created Date",
      selector: (row: { created_at: any }) => {
        if (!row.created_at) return "--";
        const date = new Date(row.created_at);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      },
      sortable: true,
      width: "130px",
    },
    {
      name: "Status",
      cell: (row: { status: any }) => (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "32px",
            fontSize: "12px",
            backgroundColor: getStatusColor(row.status),
            color: "var(--primary-foreground)",
            fontWeight: 500,
            textAlign: "center",
           width: "150px",
          }}
        >
          {row.status || "PENDING"}
        </div>
      ),
      width: "200px",
    },
    // {
    //   name: "Actions",
    //   cell: (row: any) => (
    //     <Dropdown overlay={menu(row)} trigger={["click"]}>
    //       <Button
    //         className="gradient-btn"
    //         type="primary"
    //         style={{
    //           backgroundColor: "#0B8085 !important",
    //           color: "#000000",
    //           borderColor: "white",
    //           borderRadius: "8px",
    //           padding: "10px 20px",
    //         }}
    //       >
    //         Select <img src={arrowDown} alt="" />
    //       </Button>
    //     </Dropdown>
    //   ),
    // },
  ];
  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => handleMenuClick("view", row)}
      >
        View Details
      </Menu.Item>
      <Menu.Item
        key="change"
        icon={<SyncOutlined />}
        onClick={() => handleMenuClick("change", row)}
      >
        Change Status
      </Menu.Item>
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={() => handleMenuClick("logout", row)}
      >
        Force Logout
      </Menu.Item>
    </Menu>
  );
  const handleMenuClick = (action: string, data: any) => {
    switch (action) {
      case "view":
        break;
      case "change":
        break;
      case "logout":
        break;
      default:
        break;
    }
  };

  const getLeadsList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await getRecentApplications(page, pageSize);
      if (response) {
        const data = response?.data?.data;
        setData(data || []);
        setSkelitonLoading(false);
        setTotalRows(response?.data?.data?.total || 0);
        setFrom(response?.data?.data?.from || 0);
        setTo(response?.data?.data?.to || 0);
        // setPage(response?.data?.data?.current_page);
        // setTotalPage(response?.data?.data?.last_page);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };
  useEffect(() => {
    getLeadsList();
  }, [page, pageSize]);
  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      return {
        id: item.id,
        loan_application_number: item?.loan_application_number || "--",
        company_name: item?.company_name || "--",
        phone: item?.phone || "--",
        created_at: item?.created_at,
        requested_amount: item?.requested_amount || 0,
        status: item?.status || "PENDING",
        customer_type: item?.customer_type || "--",
        channel: item?.channel || "--",
        application: item?.application || "--",
      };
    });
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Recent Applications");
    XLSX.writeFile(workbook, "Recent_Applications.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "Application Number",
      "Company Name",
      "Phone",
      "Requested Amount",
      "Customer Type",
      "Channel",
      "Status",
    ];

    const tableRows = mappedData?.map((item: any) => [
      item.loan_application_number,
      item.company_name,
      item.phone,
      item.requested_amount ? `SAR ${item.requested_amount.toLocaleString()}` : "--",
      item.customer_type,
      item.channel,
      item.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Recent_Applications.pdf");
  };
  return (
    <div className="service">
    
    <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h5 style={{ fontWeight: 600, fontSize: "20px", margin: 0 }}>Recent Applications</h5>
       
      </div>
      <TableView
        header={Activity_Loans_Header}
        data={mappedData}
        totalRows={totalRows}
        isLoading={skelitonLoading}
        from={from}
        page={page}
        totalPage={totalPage}
        setPage={setPage}
        paginationShow={false}
        pageSize={pageSize}
        setPageSize={setPageSize}
        to={to}
      />
    </div>
  );
};

export default DashboardRecentApplications;
