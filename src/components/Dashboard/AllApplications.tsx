import { useEffect, useState } from "react";
import { Button, DatePicker, Dropdown, Menu, Select, Tooltip } from "antd";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  getAllFinancingApplications,
  resendLoginEmail,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { EyeOutlined, FileOutlined, LogoutOutlined, SendOutlined, SyncOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useDispatch } from "react-redux";
import { authSlice } from "../../redux/apis/apisSlice";
import { formatDate } from "../../App";
import { useNavigate } from "react-router-dom";
import { encryptId } from "../../utils/encryption";

// Status mapping helper - based on status enum table
const getStatusText = (statusId: number): string => {
  const statusMap: { [key: number]: string } = {
    1:"PENDING",
    2:"IN-PROGRESS",
    3:"REVENUE-APPROVED",
    4: "CREDIT-CHECK-APPROVED",
    5: "COMPLIANCE-APPROVED",
    6: "BAYAN-APPROVED",
    7: "SIMAH-APPROVED",
    8: "FACTORING-AMOUNT-APPROVED",
    9: "REVISION-REQUESTED",
    10: "REJECTED",
    11: "REVENUE-REJECTED",
    12: "CREDIT-CHECK-REJECTED",
    13: "COMPLIANCE-REJECTED",
    14: "BAYAN-REJECTED",
    15: "SIMAH-REJECTED",
    16: "FACTORING-AMOUNT-REJECTED",
    17: "APPROVED",
    18: "DISBURSED",
    19: "NON-DISBURSED",
    20: "INCOMPLETE",
    21: "CANCELLED",
    22: "REVENUE-APPROVED-INCOMPLETE",
    23: "REVENUE-REJECTED-INCOMPLETE",
    24: "PAID"
  };
  return statusMap[statusId] || `Status ${statusId}`;
};

// Status color mapping helper
const getStatusColor = (statusId: number): { backgroundColor: string; color: string } => {
  const colorMap: { [key: number]: { backgroundColor: string; color: string } } = {
    1: { backgroundColor: "#6c757d", color: "white" }, // PENDING - Gray
    2: { backgroundColor: "#fd7e14", color: "white" }, // IN-PROGRESS - Orange
    3: { backgroundColor: "#28a745", color: "white" }, // REVENUE-APPROVED - Green
    4: { backgroundColor: "#28a745", color: "white" }, // CREDIT-CHECK-APPROVED - Green
    5: { backgroundColor: "#28a745", color: "white" }, // COMPLIANCE-APPROVED - Green
    6: { backgroundColor: "#28a745", color: "white" }, // BAYAN-APPROVED - Green
    7: { backgroundColor: "#28a745", color: "white" }, // SIMAH-APPROVED - Green
    8: { backgroundColor: "#28a745", color: "white" }, // FACTORING-AMOUNT-APPROVED - Green
    9: { backgroundColor: "#ffc107", color: "#000" }, // REVISION-REQUESTED - Yellow
    10: { backgroundColor: " #1963b9", color: "white" }, // REJECTED - Red
    11: { backgroundColor: " #1963b9", color: "white" }, // REVENUE-REJECTED - Red
    12: { backgroundColor: " #1963b9", color: "white" }, // CREDIT-CHECK-REJECTED - Red
    13: { backgroundColor: " #1963b9", color: "white" }, // COMPLIANCE-REJECTED - Red
    14: { backgroundColor: " #1963b9", color: "white" }, // BAYAN-REJECTED - Red
    15: { backgroundColor: " #1963b9", color: "white" }, // SIMAH-REJECTED - Red
    16: { backgroundColor: " #1963b9", color: "white" }, // FACTORING-AMOUNT-REJECTED - Red
    17: { backgroundColor: "#28a745", color: "white" }, // APPROVED - Green
    18: { backgroundColor: "#17a2b8", color: "white" }, // DISBURSED - Blue
    19: { backgroundColor: "#6c757d", color: "white" }, // NON-DISBURSED - Gray
    20: { backgroundColor: "#ffc107", color: "#000" }, // INCOMPLETE - Yellow
    21: { backgroundColor: "#6c757d", color: "white" }, // CANCELLED - Gray
    22: { backgroundColor: "#ffc107", color: "#000" }, // REVENUE-APPROVED-INCOMPLETE - Yellow
    23: { backgroundColor: " #1963b9", color: "white" }, // REVENUE-REJECTED-INCOMPLETE - Red
    24: { backgroundColor: "#28a745", color: "white" }, // PAID - Green
  };
  return colorMap[statusId] || { backgroundColor: "#6c757d", color: "white" };
};

const AllApplication = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [pagination, setPagination] = useState<any>(null);
  const dispatch = useDispatch();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const navigate = useNavigate();
  const Activity_Loans_Header = [
    {
      name: "Application Number",
      selector: (row: { loan_application_number: any }) => row.loan_application_number,
      sortable: true,
      width: "180px",
    },
    {
      name: "Customer Name",
      selector: (row: { customer_name: any }) => row.customer_name,
      sortable: true,
      width: "350px",
    },
    {
      name: "Phone",
      selector: (row: { phone: any }) => row.phone,
      sortable: true,
      width: "140px",
    },
    {
      name: "National ID",
      selector: (row: { nid: any }) => row.nid,
      sortable: true,
      width: "130px",
    },
    {
      name: "Type",
      selector: (row: { type: any }) => row.type,
      sortable: true,
      width: "120px",
    },
    {
      name: "Tenure",
      selector: (row: { duration: any }) => row.duration,
      sortable: true,
      width: "100px",
    },
    {
      name: "Amount",
      selector: (row: { loan_amount: any }) => row.loan_amount,
      sortable: true,
      width: "120px",
    },
    {
      name: "Risk",
      selector: (row: { risk: any }) => row.risk,
      sortable: true,
      width: "120px",
    },
    {
      name: "Partners",
      selector: (row: { partners: any }) => row.partners,
      sortable: true,
      width: "120px",
    },
    {
      name: "Installment Type",
      selector: (row: { installment_type: any }) => row.installment_type,
      sortable: true,
      width: "140px",
    },
    {
      name: "Application Date",
      selector: (row: { created_at: any }) => row.created_at,
      sortable: true,
      width: "150px",
    },
    {
      name: "Status",
      cell: (row: { status_id: any; status: any }) => {
        const statusId = row.status_id;
        const statusText = statusId ? getStatusText(statusId) : (row.status || 'N/A');
        const statusColor = statusId ? getStatusColor(statusId) : { backgroundColor: "#6c757d", color: "white" };
        
        return (
          <span 
            className="badge"
            style={{ 
              fontSize: "10px", 
              padding: "4px 8px",
              fontWeight: "500",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
              borderRadius: "4px",
              ...statusColor
            }}
            title={statusText}
          >
            {statusText}
          </span>
        );
      },
      width: "200px",
      sortable: true,
    },
    {
      name: "Reschedule Status",
      cell: (row: { reschedule_status: any }) => {
        const status = row.reschedule_status;
        if (!status || status === "-") {
          return <span>-</span>;
        }
        const colorMap: { [key: string]: { backgroundColor: string; color: string } } = {
          SUBMITTED: { backgroundColor: "#fd7e14", color: "white" },
          APPLIED: { backgroundColor: "#28a745", color: "white" },
          REJECTED: { backgroundColor: "#dc3545", color: "white" },
          PENDING: { backgroundColor: "#6c757d", color: "white" },
        };
        const statusColor = colorMap[status] || { backgroundColor: "#6c757d", color: "white" };
        return (
          <span
            className="badge"
            style={{
              fontSize: "10px",
              padding: "4px 8px",
              fontWeight: "500",
              borderRadius: "4px",
              ...statusColor,
            }}
          >
            {status}
          </span>
        );
      },
      sortable: true,
      width: "160px",
    },
    {
      name: "Rejection Reason",
      cell: (row: { rejection_reason: any }) => {
        const reason = row.rejection_reason || "-";
        return (
          <Tooltip title={reason} placement="top">
            <div
              style={{
                maxWidth: "150px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: reason !== "-" ? "pointer" : "default"
              }}
            >
              {reason}
            </div>
          </Tooltip>
        );
      },
      sortable: true,
      width: "150px",
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "#0B8085 !important",
              color: "#000000",
              borderColor: "white",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
          >
            Select <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
      width: "120px",
    },
  ];


  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => handleMenuClick("view", row)}
      >
        View
      </Menu.Item>
      <Menu.Item
        key="ActivityLogs"
        icon={<LogoutOutlined />}
        onClick={() => handleMenuClick("ActivityLogs", row)}
      >
        Activity Logs
      </Menu.Item>
      {/* <Menu.Item
        key="Invoices"
        icon={<EyeOutlined />}
        onClick={() => handleMenuClick("Invoices", row)}
      >
        Invoices
      </Menu.Item> */}
      {/* <Menu.Item
        key="Documents"
        icon={<FileOutlined />}
        onClick={() => handleMenuClick("Documents", row)}
      >
        Documents
      </Menu.Item>
      <Menu.Item
        key="ActivityLogs"
        icon={<LogoutOutlined />}
        onClick={() => handleMenuClick("ActivityLogs", row)}
      >
        Activity Logs
      </Menu.Item>
      <Menu.Item
        key="ResendLoginEmail"
        icon={<SendOutlined />}
        onClick={() => handleMenuClick("ResendLoginEmail", row)}
      >
        Resend Login Email
      </Menu.Item>
      <Menu.Item
        key="RetryKastleEntry"
        icon={<SyncOutlined />}
        onClick={() => handleMenuClick("RetryKastleEntry", row)}
      >
        Retry Kastle Entry
      </Menu.Item> */}
    </Menu>
  );
  const handleMenuClick = (key: string, row: any) => {
    switch (key) {
      case "view":
        navigate(`/FinancingApplications/AllApplications/View/${row.loan_application_number}`, {
          state: { rowData: row }
        });
        break;
      // case "Invoices":
      //   navigate(`/FinancingApplications/AllApplications/Invoices/${row.Sr}`);
      //   break;
      case "Documents":
        navigate(`/FinancingApplications/AllApplications/Documents/${row.loan_application_number}`);
        break;
      case "ActivityLogs":
        const encryptedId = encryptId(row.id);
        navigate(
          `/LOS/FinancingApplications/AllApplications/ActivityLogs/${encryptedId}`
        );
        break;
      case "ResendLoginEmail":
        handleResendLoginEmail(row.id);
        break;
      case "RetryKastleEntry":
        // Retry Kastle logic
      
        break;
      default:
        console.warn("Unknown action:", key);
    }
  };

  // Handle Resend Login Email
  const handleResendLoginEmail = async (id: any) => {
    try {
      setSkelitonLoading(true);
      const res = await resendLoginEmail(id);
      if (res?.data?.success) {
        toast.success(res?.data?.message || "Login email sent successfully");
        getLeadsList();
      } else {
        toast.error(res?.data?.message || "Failed to resend login email");
      }
    } catch (error: any) {
      console.error("Error resending login email:", error);
      toast.error(error?.response?.data?.message || "Failed to resend login email");
    } finally {
      setSkelitonLoading(false);
    }
  };

  const getLeadsList = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getAllFinancingApplications(page, pageSize);
      if (response?.data?.success) {
        // Access data from response.data.data.data as confirmed
        const responseData = response?.data?.data?.data;
        const paginationData = response?.data?.data;
        
        // Set the applications data
        setData(responseData || []);
        setPagination(paginationData);
        
        // Update pagination state from the API response
        if (paginationData) {
          setTotalRows(paginationData?.total || 0);
          setFrom(paginationData?.from || 0);
          setTo(paginationData?.to || 0);
          setPage(paginationData?.current_page || 1);
          setTotalPage(paginationData?.last_page || 1);
          setPageSize(paginationData?.per_page || 10);
        } else {
          // If no pagination, set basic values
          setTotalRows(responseData?.length || 0);
          setFrom(1);
          setTo(responseData?.length || 0);
        }
      }
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch applications");
    } finally {
      setSkelitonLoading(false);
    }
  };
  
  useEffect(() => {
    getLeadsList();
  }, [page, pageSize]);
  
  
  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item.id,
        loan_application_number: item?.loan_application_number || "-",
        customer_name: item?.kyc?.user?.name || "-",
        risk: item?.kyc?.risk || "-",
        phone: item?.kyc?.phone || item?.kyc?.user?.phone || "-",
        nid: item?.kyc?.nid || "-",
        type: item?.type || "-",
        duration: item?.duration ? `${item?.duration} Months` : "-",
        loan_amount: item?.amount ? `SR ${item?.amount}` : "-",
        installment_type: item?.installment_Type || "-",
        created_at: item?.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-",
        status: item?.application_status?.title || getStatusText(item?.status_id),
        status_id: item?.status_id,
        partners: item?.partners || "-",
        reschedule_status: item?.rescheduleStatus || item?.reschedule_status || "-",
        rejection_reason: item?.rejection_reason || "-",
        steps:item?.steps,
        nationalId:item?.nationalId || "-",
        product_id: item?.product_id || item?.productId || null,
      };
    });
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Financing Applications");
    XLSX.writeFile(workbook, "Financing_Applications.xlsx");
  };

  return (
    <div className="service">
      <div className="d-flex justify-content-end col-12 filter-select">
        <Select
          mode="tags"
          style={{ width: "15%", borderTopRightRadius: "0px" }}
          // onChange={handleChange}
          placeholder="Filter"
          tokenSeparators={[","]}
          suffixIcon={<FaFilter />}

          // options={options}
        />

        <div className="d-flex gap-2 w-100" style={{ height: 40 }}>
          <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box">
            <img src={Images.searchIconGray} alt="" />
            <input
              type="text"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
              }}
              className="p-2"
              placeholder="Search..."
            />
          </div>
          <div className="d-flex align-items-center">
            <div
              className="d-flex gap-1 p-2"
              style={{ paddingLeft: "0px !important" }}
            >
              <DatePicker
                className="date-picker"
                placeholder="From"
                value={fromDate}
                onChange={(date) => {
                  setFromDate(date);
                  dispatch(
                    authSlice.actions.setFromFilter({
                      fromFilter: formatDate(date ? date : null),
                    })
                  );
                }}
                allowClear
              />
              <DatePicker
                className="date-picker"
                placeholder="To"
                value={toDate}
                onChange={(date) => {
                  setToDate(date);
                  dispatch(
                    authSlice.actions.setToFilter({
                      toFilter: formatDate(date),
                    })
                  );
                  dispatch(authSlice.actions.setTheme({ theme: "" }));
                }}
                allowClear
              />
            </div>
          </div>
          <button className="theme-btn-next" onClick={exportToExcel}>
            Export CSV
          </button>
        </div>
      </div>

      <TableView
        header={Activity_Loans_Header}
        data={mappedData}
        totalRows={pagination?.total || totalRows}
        isLoading={skelitonLoading}
        from={pagination?.from || from}
        page={pagination?.current_page || page}
        totalPage={pagination?.last_page || totalPage}
        setPage={setPage}
        pageSize={pagination?.per_page || pageSize}
        setPageSize={setPageSize}
        to={pagination?.to || to}
      />
    </div>
  );
};

export default AllApplication;
