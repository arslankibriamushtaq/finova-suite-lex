import { useEffect, useState } from "react";
import { Button, DatePicker, Dropdown, Menu, Select, Modal, Checkbox } from "antd";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import { getLeadCustomers, blockUserWithBlockCode, unblockUserWithBlockCode, getBlockCodes, getUserBlocksByUserId, getPepCustomers, changeUserStatus, updateKycRisk, exportPepCustomers } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { EyeOutlined, SyncOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import MaskedValue from "../MaskedValue";
import { useDispatch } from "react-redux";
import { authSlice } from "../../redux/apis/apisSlice";
import { formatDate } from "../../App";
import { useNavigate } from "react-router-dom";

// Block codes data
const blockCodesData = [
  { id: 1, code: "500", type: "Compliance", blocked: true },
  { id: 2, code: "403", type: "Aml", blocked: false },
  { id: 3, code: "709", type: "Anti_fraud", blocked: false },
  { id: 4, code: "404", type: "Compliance", blocked: true },
  { id: 5, code: "503", type: "Sanction", blocked: true },
  { id: 6, code: "409", type: "Compliance", blocked: true },
  { id: 7, code: "789", type: "Compliance", blocked: true },
  { id: 8, code: "213213", type: "Compliance", blocked: true },
];

const PepBlockCodes = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const dispatch = useDispatch();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [pep, setPep] = useState('');
  const [status, setStatus] = useState('');

  // Block codes modal state
  const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);
  const [selectedBlockCodes, setSelectedBlockCodes] = useState<number[]>([]);
  const [blockCodes, setBlockCodes] = useState(blockCodesData);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoadingBlockCodes, setIsLoadingBlockCodes] = useState(false);
  
  // Change status modal state
  const [isChangeStatusModalVisible, setIsChangeStatusModalVisible] = useState(false);
  const [selectedUserForStatusChange, setSelectedUserForStatusChange] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  
  // Change risk modal state
  const [isChangeRiskModalVisible, setIsChangeRiskModalVisible] = useState(false);
  const [selectedUserForRiskChange, setSelectedUserForRiskChange] = useState<any>(null);
  const [newRisk, setNewRisk] = useState<string>("");
  const [isChangingRisk, setIsChangingRisk] = useState(false);
  
  // Helper functions for risk status
  const getRiskColor = (risk: string) => {
    const riskLower = risk.toLowerCase();
    switch (riskLower) {
      case "highrisk":
      case "high":
        return "#F84D4D";
      case "mediumrisk":
      case "medium":
        return "#FFC107";
      case "peprisk":
      case "pep":
        return "#9C27B0";
      case "lowrisk":
      case "low":
      default:
        return "rgba(63, 195, 128, 0.9)";
    }
  };
  
  const normalizeRiskDisplay = (risk: string) => {
    if (!risk) return "low";
    const riskLower = risk.toLowerCase();
    // Remove "risk" suffix if present
    if (riskLower.endsWith("risk")) {
      return riskLower.slice(0, -4); 
    }
    return riskLower;
  };
  
  const Activity_Loans_Header = [
    {
      name: "Name",
      cell: (row: { name: any }) => row.name,
      sortable: true,
      width: "200px",
    },
    {
      name: "ID",
      cell: (row: any) => (
        <MaskedValue value={row.nid} showToggle={true} unmaskedCount={4} />
      ),
      width: "200px",
      sortable: true,
    },
    {
      name: "CIF",
      selector: (row: { cif: any }) => row.cif || "-",
      sortable: true,
      width: "220px",
    },
    {
      name: "Email",
      selector: (row: { email: any }) => row.email,
      sortable: true,
      width: "200px",
    },
    {
      name: "Phone",
      selector: (row: { phone: any }) => row.phone,
      sortable: true,
      width: "200px",
    },
    {
      name: "Partner",
      selector: (row: { partner: any }) => row.partner || "-",
      sortable: true,
    },
    /* {
      name: "Risk Status",
      cell: (row: any) => {
        const riskStatus = row.risk || "--";
        const displayRisk = normalizeRiskDisplay(riskStatus);
        
        return (
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "32px",
              fontSize: "12px",
              backgroundColor: getRiskColor(riskStatus),
              color: "white",
              display: "inline-block",
              textTransform: "capitalize",
              fontWeight: "500"
            }}
          >
            {riskStatus}
          </span>
        );
      },
      sortable: true,
      width: "200px",
    }, */
    {
      name: "Is Blocked",
      selector: (row: { is_blocked: any }) => row.is_blocked,
      sortable: true,
      cell: (row: any) => (
        <span
          style={{
            padding: "8px 10px",
            borderRadius: "5px",
            fontSize: "12px",
            backgroundColor: row.is_blocked ? "#F84D4D" : "rgba(63, 195, 128, 0.9)",
            color: "white",
            cursor: "default",
            border: "none",
            display: "inline-block",
          }}
        >
          {row.is_blocked ? "Blocked" : "Unblocked"}
        </span>
      ),
    },
    {
      name:"Date",
      sortable: true,
      cell: (row: any) => (
        <div>
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}
        </div>
      ),
    },
    {
      name: "Status",
      cell: (row: { status: any }) => {
        const getStatusColor = (status: string) => {
          switch (status?.toLowerCase()) {
            case "approved":
            case "approved":
              return "rgba(63, 195, 128, 0.9)";
            case "reject":
            case "rejected":
              return "#F84D4D";
            case "pending":
              return "#FFC107";
            default:
              return "transparent";
          }
        };
        
        const getStatusLabel = (status: string) => {
          switch (status?.toLowerCase()) {
            case "approved":
            case "approved":
              return "Approved";
            case "reject":
            case "rejected":
              return "Rejected";
            case "pending":
              return "Pending";
            default:
              return status || "-";
          }
        };
        
        return (
          <div
            style={{
              padding: "8px 10px",
              borderRadius: "32px",
              fontSize: "12px",
              backgroundColor: getStatusColor(row.status),
              color: "white",
              display: "inline-block",
              textTransform: "capitalize"
            }}
          >
            {getStatusLabel(row.status)}
          </div>
        );
      },
    },
    {
      name:"Comments",
      cell: (row: { comment: any }) => row.comment || "-",
      sortable: true,
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
    },
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
        key="changeRisk"
        icon={<SyncOutlined />}
        onClick={() => handleMenuClick("changeRisk", row)}
      >
        Change Risk
      </Menu.Item>
      {/* <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={() => handleMenuClick("logout", row)}
      >
        Force Logout
      </Menu.Item> */}
    </Menu>
  );
  const handleMenuClick = (action: string, data: any) => {
    switch (action) {
      case "view":
        // Handle view action
        navigate(`/LOS/CustomerManagement/PepCustomers/${data.id}`);
        break;
      case "change":
        // Handle change status action
        setSelectedUserForStatusChange(data);
        setNewStatus(data.status=="active"?"approved" : "rejected");
        setIsChangeStatusModalVisible(true);
        break;
      case "changeRisk":
        // Handle change risk action
        setSelectedUserForRiskChange(data);
        setNewRisk(data.risk_status || "");
        setIsChangeRiskModalVisible(true);
        break;
      case "logout":
        // Handle force logout action
        break;
      default:
        break;
    }
  };

  // Handle block button click
  const handleBlockButtonClick = async (row: any) => {
    setCurrentUserId(row.id);
    setIsBlockModalVisible(true);
    setIsLoadingBlockCodes(true);
    // Reset selections when opening modal
    setSelectedBlockCodes([]);
    
    try {
      // Fetch both APIs in parallel
      const [blockCodesResponse, userBlocksResponse] = await Promise.all([
        getBlockCodes(1, 100), // Get all block codes
        getUserBlocksByUserId(row.id) // Get user's blocked codes
      ]);

      // Get user's blocked code IDs
      const userBlockedCodeIds = userBlocksResponse?.data?.data?.block_codes?.map((code: any) => code.id) || [];
      

      // Process all block codes and mark as blocked if they exist in user's blocked codes
      if (blockCodesResponse?.data?.success) {
        const apiBlockCodes = blockCodesResponse?.data?.data?.data?.map((item: any) => ({
          id: item.id,
          code: item.code,
          type: item.type,
          blocked: userBlockedCodeIds.includes(item.id) // Mark as blocked if ID exists in user's blocked codes
        }));
        setBlockCodes(apiBlockCodes || blockCodesData);
      } else {
        // Fallback to static data if API fails
        setBlockCodes(blockCodesData);
      }
    } catch (error) {
      console.error("Error fetching block codes:", error);
      // Fallback to static data if API fails
      setBlockCodes(blockCodesData);
    } finally {
      setIsLoadingBlockCodes(false);
    }
  };

  // Handle select all block codes
  const handleSelectAll = () => {
    const allIds = blockCodes.map((code) => code.id);
    setSelectedBlockCodes(allIds);
  };

  // Handle deselect all block codes
  const handleDeselectAll = () => {
    setSelectedBlockCodes([]);
  };

  // Handle individual checkbox change
  const handleCheckboxChange = (id: number) => {
    setSelectedBlockCodes((prev) =>
      prev.includes(id) ? prev.filter((codeId) => codeId !== id) : [...prev, id]
    );
  };

  // Handle block selected codes
  const handleBlockSelected = async () => {
    if (!currentUserId) {
      toast.error("User ID not found");
      return;
    }

    if (selectedBlockCodes.length === 0) {
      toast.error("Please select at least one block code");
      return;
    }

    try {
      const payload = {
        user_id: currentUserId,
        block_code_id: selectedBlockCodes
      };

      const response = await blockUserWithBlockCode(payload);
      
      if (response?.data?.success) {
        // Update local state
        setBlockCodes((prev) =>
          prev.map((code) =>
            selectedBlockCodes.includes(code.id) ? { ...code, blocked: true } : code
          )
        );
        toast.success(response?.data?.message || `${selectedBlockCodes.length} block code(s) have been blocked`);
        setSelectedBlockCodes([]);
        
        // Refresh the leads list to get updated data
        getLeadsList();
        
        // Optionally refresh the block codes in modal to show updated status
        try {
          const userBlocksResponse = await getUserBlocksByUserId(currentUserId);
          const userBlockedCodeIds = userBlocksResponse?.data?.data?.block_codes?.map((code: any) => code.id) || [];
          
          setBlockCodes((prev) =>
            prev.map((code) => ({
              ...code,
              blocked: userBlockedCodeIds.includes(code.id)
            }))
          );
        } catch (error) {
          console.error("Error refreshing block codes:", error);
        }
      } else {
        toast.error(response?.data?.message || "Failed to block codes");
      }
    } catch (error: any) {
      console.error("Error blocking codes:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to block codes");
    }
  };

  // Handle unblock selected codes
  const handleUnblockSelected = async () => {
    if (!currentUserId) {
      toast.error("User ID not found");
      return;
    }

    if (selectedBlockCodes.length === 0) {
      toast.error("Please select at least one block code");
      return;
    }

    try {
      const payload = {
        user_id: currentUserId,
        block_code_id: selectedBlockCodes
      };

      const response = await unblockUserWithBlockCode(payload);
      
      if (response?.data?.success) {
        // Update local state
        setBlockCodes((prev) =>
          prev.map((code) =>
            selectedBlockCodes.includes(code.id) ? { ...code, blocked: false } : code
          )
        );
        toast.success(response?.data?.message || `${selectedBlockCodes.length} block code(s) have been unblocked`);
        setSelectedBlockCodes([]);
        
        // Refresh the leads list to get updated data
        getLeadsList();
        
        // Optionally refresh the block codes in modal to show updated status
        try {
          const userBlocksResponse = await getUserBlocksByUserId(currentUserId);
          const userBlockedCodeIds = userBlocksResponse?.data?.data?.block_codes?.map((code: any) => code.id) || [];
          
          setBlockCodes((prev) =>
            prev.map((code) => ({
              ...code,
              blocked: userBlockedCodeIds.includes(code.id)
            }))
          );
        } catch (error) {
          console.error("Error refreshing block codes:", error);
        }
      } else {
        toast.error(response?.data?.message || "Failed to unblock codes");
      }
    } catch (error: any) {
      console.error("Error unblocking codes:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to unblock codes");
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsBlockModalVisible(false);
    setSelectedBlockCodes([]);
    setCurrentUserId(null);
    setIsLoadingBlockCodes(false);
  };

  // Handle change status modal close
  const handleChangeStatusModalClose = () => {
    setIsChangeStatusModalVisible(false);
    setSelectedUserForStatusChange(null);
    setNewStatus("");
    setIsChangingStatus(false);
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!selectedUserForStatusChange || !newStatus) {
      toast.error("Please select a status");
      return;
    }

    try {
      setIsChangingStatus(true);
      const response = await changeUserStatus(selectedUserForStatusChange.id, {
        user_id: selectedUserForStatusChange.id,
        status: newStatus
      });

      if (response?.data?.success) {
        toast.success(response?.data?.message || `Status changed to ${newStatus} successfully`);
        handleChangeStatusModalClose();
        // Refresh the leads list to get updated data
        getLeadsList();
      } else {
        toast.error(response?.data?.message || "Failed to change status");
      }
    } catch (error: any) {
      console.error("Error changing status:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to change status");
    } finally {
      setIsChangingStatus(false);
    }
  };

  // Handle change risk modal close
  const handleChangeRiskModalClose = () => {
    setIsChangeRiskModalVisible(false);
    setSelectedUserForRiskChange(null);
    setNewRisk("");
    setIsChangingRisk(false);
  };

  // Handle risk change
  const handleRiskChange = async () => {
    if (!selectedUserForRiskChange || !newRisk) {
      toast.error("Please select a risk level");
      return;
    }

    try {
      setIsChangingRisk(true);
      const response = await updateKycRisk({
        user_id: selectedUserForRiskChange.id,
        risk: newRisk
      });

      if (response?.data?.success) {
        toast.success(response?.data?.message || `Risk changed to ${newRisk} successfully`);
        handleChangeRiskModalClose();
        // Refresh the leads list to get updated data
        getLeadsList();
      } else {
        toast.error(response?.data?.message || "Failed to change risk");
      }
    } catch (error: any) {
      console.error("Error changing risk:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to change risk");
    } finally {
      setIsChangingRisk(false);
    }
  };

  const getLeadsList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await getPepCustomers(page, pageSize, search, pep, status);
      if (response) {
        const responseData = response?.data?.data;
        setData(responseData?.data || []);
        setSkelitonLoading(false);
        setTotalRows(responseData?.total || 0);
        setFrom(responseData?.from || 0);
        setTo(responseData?.to || 0);
        setPage(responseData?.current_page || 1);
        setTotalPage(responseData?.last_page || 1);
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
  }, [page, pageSize, search, pep, status]);

  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      return {
        id: item.id,
        Sr: index + 1,
        name: item?.name || "-",
        nid: item?.nid || "-",
        cif: item?.cif || "-",
        email: item?.email || "-",
        phone: item?.phone || "-",
        cnic: item?.cnic || "-",
        pep: item?.pep ? "Yes" : "No",
        accountBalance: item?.balance || "-",
        UpdatedBy: item?.updated_at || "-",
        accountType: item?.user_type || "-",
        accountStatus: item?.accountStatus || "-",
        status: item?.status || "-",
        partner: item?.partner,
        risk: item?.risk,
        is_blocked: item?.is_blocked,
        blocked_by_payment_guard: item?.blocked_by_payment_guard,
        created_at: item?.created_at,
        comment: item?.comment,
      };
    });
    const exportCSV = async () => {
      try {
        toast.loading("Exporting PEP customers...", { id: "export-pep-customers" });
        const response = await exportPepCustomers();
        
        if (!response || !response.data) {
          throw new Error("Failed to download file");
        }
        
        // Convert server response to a Blob (binary file)
        const blob = new Blob([response.data], { 
          type: response.headers['content-type'] || 'application/octet-stream' 
        });
        
        // Try to extract filename from response header
        const contentDisposition = response.headers['content-disposition'];
        let fileName = "pep_customers_export";
        
        if (contentDisposition && contentDisposition.includes("filename=")) {
          fileName = contentDisposition
            .split("filename=")[1]
            .replace(/"/g, "")
            .trim();
        } else {
          // Fallback based on content type
          const contentType = response.headers['content-type'] || "";
          if (contentType.includes("zip")) fileName += ".zip";
          else if (contentType.includes("csv")) fileName += ".csv";
          else if (contentType.includes("sheet") || contentType.includes("excel")) fileName += ".xlsx";
          else fileName += ".csv"; // Default to CSV
        }
        
        // Create downloadable URL
        const url = window.URL.createObjectURL(blob);
        
        // Create temporary hidden link
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        
        // Trigger the download
        link.click();
        
        // Cleanup
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success("PEP customers exported successfully", { id: "export-pep-customers" });
      } catch (error: any) {
        console.error("Export error:", error);
        toast.error(
          error?.response?.data?.message || 
          error?.message || 
          "Failed to export PEP customers",
          { id: "export-pep-customers" }
        );
      }
    };
  const [selectedValue, setSelectedValue] = useState("today");
  return (
    <div className="service">
      <div className="d-flex justify-content-end col-12 filter-select">
        {/* <Select
          style={{ width: "120px", marginRight: "8px" }}
          placeholder="PEP"
          allowClear
          value={pep || undefined}
          onChange={(value) => setPep(value || '')}
        >
          <Select.Option value="1">Yes</Select.Option>
          <Select.Option value="0">No</Select.Option>
        </Select> */}

        <Select
          style={{ width: "120px", borderTopRightRadius: "0px" }}
          placeholder="Status"
          allowClear
          value={status || undefined}
          onChange={(value) => setStatus(value || '')}
          suffixIcon={<FaFilter />}
        >
          <Select.Option value="active">Active</Select.Option>
          <Select.Option value="inactive">Inactive</Select.Option>
        </Select>

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                  setSelectedValue(!toDate ? "" : "today");
                  dispatch(authSlice.actions.setTheme({ theme: "" }));
                }}
                allowClear
              />
            </div>
          </div>
            <button className="theme-btn-next" onClick={exportCSV}>
              Export CSV
          </button> 
        </div>
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
        pageSize={pageSize}
        setPageSize={setPageSize}
        to={to}
      />

      {/* Block Codes Management Modal */}
      <Modal
        title={<div style={{ fontSize: "20px", fontWeight: "600" }}>Manage Block Codes for User</div>}
        open={isBlockModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        centered
      >
        <div style={{ marginTop: "20px" }}>
          {isLoadingBlockCodes ? (
            // Loading State
            <div style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px",
              gap: "20px"
            }}>
              <div className="spinner-border text-primary" role="status" style={{
                width: "3rem",
                height: "3rem",
                borderWidth: "0.3em"
              }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p style={{ fontSize: "16px", color: "#666", margin: 0 }}>Loading block codes...</p>
            </div>
          ) : (
            <>
              {/* Header with Select/Deselect All buttons */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                padding: "10px 0"
              }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>Block Code Selection</h3>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button
                    type="primary"
                    style={{ backgroundColor: "#3FC380", borderColor: "#3FC380" }}
                    onClick={handleSelectAll}
                  >
                    ✓ Select All
                  </Button>
                  <Button
                    style={{
                      backgroundColor: "#FFC107",
                      borderColor: "#FFC107",
                      color: "white"
                    }}
                    onClick={handleDeselectAll}
                  >
                    ⊘ Deselect All
                  </Button>
                </div>
              </div>

          {/* Block Codes Table */}
          <div style={{
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
            overflow: "hidden",
            maxHeight: "400px",
            overflowY: "auto"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{
                backgroundColor: "#fafafa",
                position: "sticky",
                top: 0,
                zIndex: 1
              }}>
                <tr>
                  <th style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid #f0f0f0",
                    width: "50px"
                  }}>
                    <Checkbox
                      checked={selectedBlockCodes.length === blockCodes.length}
                      indeterminate={selectedBlockCodes.length > 0 && selectedBlockCodes.length < blockCodes.length}
                      onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                    />
                  </th>
                  <th style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid #f0f0f0",
                    fontWeight: "600"
                  }}>
                    Block Code
                  </th>
                  <th style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid #f0f0f0",
                    fontWeight: "600"
                  }}>
                    Type
                  </th>
                  <th style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    borderBottom: "1px solid #f0f0f0",
                    fontWeight: "600"
                  }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {blockCodes.map((code) => (
                  <tr key={code.id} style={{
                    backgroundColor: selectedBlockCodes.includes(code.id) ? "#f5f5f5" : "white"
                  }}>
                    <td style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #f0f0f0"
                    }}>
                      <Checkbox
                        checked={selectedBlockCodes.includes(code.id)}
                        onChange={() => handleCheckboxChange(code.id)}
                      />
                    </td>
                    <td style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #f0f0f0",
                      fontWeight: "500"
                    }}>
                      {code.code}
                    </td>
                    <td style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #f0f0f0"
                    }}>
                      <span style={{
                        backgroundColor: "#00BCD4",
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "500"
                      }}>
                        {code.type}
                      </span>
                    </td>
                    <td style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #f0f0f0",
                      textAlign: "center"
                    }}>
                      <button style={{
                        backgroundColor: code.blocked ? "#F84D4D" : "#3FC380",
                        color: "white",
                        border: "none",
                        padding: "6px 16px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "default",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        {code.blocked ? "⊘" : "✓"} {code.blocked ? "Blocked" : "Active"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px",
            paddingTop: "20px",
            borderTop: "1px solid #f0f0f0"
          }}>
            <Button
              type="primary"
              danger
              disabled={selectedBlockCodes.length === 0}
              onClick={handleBlockSelected}
              style={{
                backgroundColor: selectedBlockCodes.length === 0 ? undefined : "#F84D4D",
                borderColor: selectedBlockCodes.length === 0 ? undefined : "#F84D4D"
              }}
            >
              ⊘ Block Selected
            </Button>
            <Button
              type="primary"
              disabled={selectedBlockCodes.length === 0}
              onClick={handleUnblockSelected}
              style={{
                backgroundColor: selectedBlockCodes.length === 0 ? undefined : "#FFC107",
                borderColor: selectedBlockCodes.length === 0 ? undefined : "#FFC107"
              }}
            >
              ⊙ Unblock Selected
            </Button>
          </div>

              {/* Close Button */}
              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid #f0f0f0"
              }}>
                <Button
                  onClick={handleModalClose}
                  style={{
                    backgroundColor: "#6c757d",
                    borderColor: "#6c757d",
                    color: "white"
                  }}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Change Status Modal */}
      <Modal
        title={<div style={{ fontSize: "20px", fontWeight: "600" }}>Change User Status</div>}
        open={isChangeStatusModalVisible}
        onCancel={handleChangeStatusModalClose}
        footer={null}
        width={500}
        centered
      >
        <div style={{ marginTop: "20px" }}>
          {selectedUserForStatusChange && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <p style={{ marginBottom: "8px", fontWeight: "500" }}>User Name:</p>
                <p style={{ marginBottom: "16px", color: "#666" }}>{selectedUserForStatusChange.name || "-"}</p>
                
                <p style={{ marginBottom: "8px", fontWeight: "500" }}>Current Status:</p>
                <div style={{ marginBottom: "16px" }}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "32px",
                      fontSize: "12px",
                      backgroundColor: 
                        selectedUserForStatusChange.status?.toLowerCase() === "approved" || selectedUserForStatusChange.status?.toLowerCase() === "approved"
                          ? "rgba(63, 195, 128, 0.9)"
                          : selectedUserForStatusChange.status?.toLowerCase() === "reject" || selectedUserForStatusChange.status?.toLowerCase() === "rejected"
                          ? "#F84D4D"
                          : selectedUserForStatusChange.status?.toLowerCase() === "pending"
                          ? "#FFC107"
                          : "transparent",
                      color: "white",
                      display: "inline-block",
                      textTransform: "capitalize"
                    }}
                  >
                    {selectedUserForStatusChange.status?.toLowerCase() === "approved" || selectedUserForStatusChange.status?.toLowerCase() === "approved"
                      ? "Approved"
                      : selectedUserForStatusChange.status?.toLowerCase() === "reject" || selectedUserForStatusChange.status?.toLowerCase() === "rejected"
                      ? "Rejected"
                      : selectedUserForStatusChange.status?.toLowerCase() === "pending"
                      ? "Pending"
                      : selectedUserForStatusChange.status || "-"}
                  </span>
                </div>

                <p style={{ marginBottom: "8px", fontWeight: "500" }}>New Status:</p>
                <Select
                  style={{ width: "100%", marginBottom: "20px" }}
                  value={newStatus}
                  onChange={(value) => setNewStatus(value)}
                  placeholder="Select Status"
                >
                  <Select.Option value="approved">Approved</Select.Option>
                  <Select.Option value="rejected">Reject</Select.Option>
                  {/* <Select.Option value="pending">Pending</Select.Option> */}
                </Select>
              </div>

              <div style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid #f0f0f0"
              }}>
                <button
                  onClick={handleChangeStatusModalClose}
                  disabled={isChangingStatus}
               className="invoice-btn"
                >
                  Cancel
                </button>
                <button
            
                  onClick={handleStatusChange}
                
                  disabled={!newStatus || newStatus.toLowerCase() === selectedUserForStatusChange.status?.toLowerCase()}
              className="theme-btn"
                >
                  {isChangingStatus ? "Changing..." : "Change Status"}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Change Risk Modal */}
      <Modal
        title={<div style={{ fontSize: "20px", fontWeight: "600" }}>Change User Risk</div>}
        open={isChangeRiskModalVisible}
        onCancel={handleChangeRiskModalClose}
        footer={null}
        width={500}
        centered
      >
        <div style={{ marginTop: "20px" }}>
          {selectedUserForRiskChange && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <p style={{ marginBottom: "8px", fontWeight: "500" }}>User Name:</p>
                <p style={{ marginBottom: "16px", color: "#666" }}>{selectedUserForRiskChange.name || "-"}</p>
                
                <p style={{ marginBottom: "8px", fontWeight: "500" }}>Current Risk:</p>
                <div style={{ marginBottom: "16px" }}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "32px",
                      fontSize: "12px",
                      backgroundColor: getRiskColor(selectedUserForRiskChange.risk_status || "low"),
                      color: "white",
                      display: "inline-block",
                      textTransform: "capitalize"
                    }}
                  >
                    {normalizeRiskDisplay(selectedUserForRiskChange.risk_status || "low")}
                  </span>
                </div>

                <p style={{ marginBottom: "8px", fontWeight: "500" }}>New Risk:</p>
                <Select
                  style={{ width: "100%", marginBottom: "20px" }}
                  value={newRisk}
                  onChange={(value) => setNewRisk(value)}
                  placeholder="Select Risk Level"
                >
                  <Select.Option value="high">High</Select.Option>
                  <Select.Option value="low">Low</Select.Option>
                  <Select.Option value="medium">Medium</Select.Option>
                  <Select.Option value="pep">PEP</Select.Option>
                </Select>
              </div>

              <div style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid #f0f0f0"
              }}>
                <button
                  onClick={handleChangeRiskModalClose}
                  disabled={isChangingRisk}
              className="invoice-btn"
                >
                  Cancel
                </button>
                <button
                
                  onClick={handleRiskChange}
               
                  disabled={!newRisk || newRisk === selectedUserForRiskChange.risk_status}
               className="theme-btn"
                >
                  {isChangingRisk ? "Changing..." : "Change Risk"}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PepBlockCodes;
