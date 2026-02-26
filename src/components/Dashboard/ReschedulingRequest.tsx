import { useEffect, useState } from "react";
import { Button, DatePicker, Dropdown, Menu, Select, Tooltip } from "antd";
import TableView from "../TableView/TableView";

import { Images } from "../Config/Images";
import {

  getReschedulingRequest,
  handleReschedulingRequest,
  resendLoginEmail,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { EyeOutlined,  } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useDispatch } from "react-redux";
import { authSlice } from "../../redux/apis/apisSlice";
import { formatDate } from "../../App";
import { useNavigate } from "react-router-dom";
import { encryptId } from "../../utils/encryption";

// Status mapping helper
const getStatusText = (statusId: number): string => {
  const statusMap: { [key: number]: string } = {
    1: "Incomplete",
    2: "Pending",
    3: "In Progress",
    4: "Approved",
    5: "Rejected",
    6: "Cancelled",
    7: "On Hold",
    8: "Under Review"
  };
  return statusMap[statusId] || `Status ${statusId}`;
};

// Status color mapping helper
const getStatusColor = (statusId: number): { backgroundColor: string; color: string } => {
  const colorMap: { [key: number]: { backgroundColor: string; color: string } } = {
    1: { backgroundColor: "#ffc107", color: "#000" }, // Incomplete - Yellow
    2: { backgroundColor: "#6c757d", color: "white" }, // Pending - Gray
    3: { backgroundColor: "#fd7e14", color: "white" }, // In Progress - Orange
    4: { backgroundColor: "#28a745", color: "white" }, // Approved - Green
    5: { backgroundColor: " #1963b9", color: "white" }, // Rejected - Red
    6: { backgroundColor: "#6c757d", color: "white" }, // Cancelled - Gray
    7: { backgroundColor: "#ffc107", color: "#000" }, // On Hold - Yellow
    8: { backgroundColor: "#17a2b8", color: "white" }, // Under Review - Blue
  };
  return colorMap[statusId] || { backgroundColor: "#6c757d", color: "white" };
};

const ReschedulingRequest = () => {
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
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const navigate = useNavigate();
  
  // Rescheduling status options
  const statusOptions = [
    { label: "All", value: "" },
    { label: "Under Rescheduling", value: "UNDER_RESCHULING" },
    { label: "Rescheduling Approved", value: "RESCHULING_APPROVED" },
    { label: "Rescheduling Rejected", value: "RESCHULING_REJECTED" },
    { label: "Rescheduling Cancelled", value: "RESCHULING_CANCELLED" },
    { label: "Rescheduling Accepted", value: "RESCHULING_ACCEPTED" },
    { label: "Rescheduling Disbursed", value: "RESCHULING_DISBURSED" },
  ];
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
      width: "200px",
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
            onClick={() => (console.log(row.status))}
            title={statusText}
          >
            {row.status}
          </span>
        );
      },
      width: "150px",
      sortable: true,
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
        key="accept"
        // icon={<EyeOutlined />}
        onClick={() => handleMenuClick("accept", row)}
      >
        Accept
      </Menu.Item> 
       <Menu.Item
        key="reject"
        // icon={<FileOutlined />}
        onClick={() => handleMenuClick("reject", row)}
      >
        Reject
      </Menu.Item>
      <Menu.Item
        key="cancel"
        // icon={<FileOutlined />}
        onClick={() => handleMenuClick("cancel", row)}
      >
        Cancel
      </Menu.Item>
      {/* <Menu.Item
        key="ActivityLogs"
        icon={<LogoutOutlined />}
        onClick={() => handleMenuClick("ActivityLogs", row)}
      >
        Activity Logs
      </Menu.Item> */}
      {/* <Menu.Item
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
      </Menu.Item>  */}
    </Menu>
  );
  const handleMenuClick = (key: string, row: any) => {
    switch (key) {
      case "view":
        navigate(`/FinancingApplications/AllApplications/View/${row.loan_application_number}`, {
          state: {
            rowData: {
              id: row.id, // Pass the numeric ID
              loan_application_id: row.id,
              loan_application_number: row.loan_application_number,
            }
          }
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
          `/FinancingApplications/AllApplications/ActivityLogs/${encryptedId}`
        );
        break;
      case "ResendLoginEmail":
        handleResendLoginEmail(row.id);
        break;
      case "RetryKastleEntry":
        // Retry Kastle logic
        break;
      case "accept":
        handleAcceptReject(row, "accept");
        break;
      case "reject":
        handleAcceptReject(row, "reject");
        break;
        case "cancel":
          handleAcceptReject(row, "cancel");
          break;
      default:
        console.warn("Unknown action:", key);
    }
  };
  
  const handleAcceptReject = async (id: any, type: string) => {
    try {
      setSkelitonLoading(true);
      const body = {
        action: type,
      };
      const res = await handleReschedulingRequest(id?.id, id.rescheduling_request_id, body);
      
      if (res?.data?.success) {
        toast.success(res?.data?.message || `Request ${type}ed successfully`);
        // Refresh the list after successful action
        getLeadsList();
      } else {
        toast.error(res?.data?.message || `Failed to ${type} request`);
      }
    } catch (error: any) {
      console.error(`Error ${type}ing request:`, error);
      toast.error(error?.response?.data?.message || error?.message || `Failed to ${type} request`);
    } finally {
      setSkelitonLoading(false);
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
      
      // Format dates for API (YYYY-MM-DD format)
      const formattedFromDate = fromDate ? (formatDate(fromDate) || undefined) : undefined;
      const formattedToDate = toDate ? (formatDate(toDate) || undefined) : undefined;
      
      const response = await getReschedulingRequest(
        page, 
        pageSize, 
        selectedStatus || undefined,
        formattedFromDate,
        formattedToDate
      );
      
      if (response?.data?.success) {
        // Access data from response.data.data.data as confirmed
        const responseData = response?.data?.data?.data;
        const paginationData = response?.data?.data?.pagination;
        
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
  }, [page, pageSize, selectedStatus, fromDate, toDate]);
  
  
  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item.id,
        loan_application_number: item?.loan_application_number || "-",
        customer_name: item?.kyc?.user?.name || "-",
        phone: item?.kyc?.phone || item?.kyc?.user?.phone || "-",
        nid: item?.kyc?.nid || "-",
        type: item?.type || "-",
        duration: item?.duration ? `${item?.duration} Months` : "-",
        loan_amount: item?.amount ? `SR ${item?.amount}` : "-",
        installment_type: item?.installment_Type || "-",
        created_at: item?.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-",
        status: item?.status_name || "-",
        status_id: item?.status_id,
        rescheduling_request_id: item?.rescheduling_request?.id,
        rejection_reason: item?.rejection_reason || "-",
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
      <div className="d-flex justify-content-end col-12 filter-select mb-3">
        <div className="d-flex gap-2 w-100">
          {/* Status Filter Dropdown */}
          <Select
            style={{ width: "20%" }}
            placeholder="Select Status"
            value={selectedStatus || undefined}
            onChange={(value) => {
              setSelectedStatus(value || "");
              // setPage(1); // Reset to first page when filter changes
            }}
            allowClear
            options={statusOptions}
          />

          <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box flex-grow-1">
            <img src={Images.searchIconGray} alt="" />
            <input
              type="text"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                width: "100%",
              }}
              className="p-2"
              placeholder="Search..."
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <DatePicker
              className="date-picker"
              placeholder="From"
              value={fromDate}
              onChange={(date) => {
                setFromDate(date);
                setPage(1); // Reset to first page when date filter changes
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
                setPage(1); // Reset to first page when date filter changes
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

export default ReschedulingRequest;
