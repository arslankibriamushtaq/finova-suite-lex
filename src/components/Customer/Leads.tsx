import { useEffect, useState } from "react";
import PulseLoading from "../Loader/PulseLoader";
import { Button, DatePicker, Dropdown, Input, Menu, Select, Modal, Checkbox, Switch } from "antd";
import TableView from "../TableView/TableView";
import { getCustomersByLifecycleStage } from "../../redux/apis/apisOnboardingService";
import { blockUserWithBlockCode, unblockUserWithBlockCode, getBlockCodes, getUserBlocksByUserId, changeUserStatus, updateKycRisk, userActive, exportLeads } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { EyeOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import MaskedValue from "../MaskedValue";
import { useDispatch } from "react-redux";
import { authSlice } from "../../redux/apis/apisSlice";
import { formatDate } from "../../App";
import { useNavigate } from "react-router-dom";
import { usePermissions, LEAD_PERMISSIONS } from "../../hooks/useProductPermissions";
import { name } from "react-date-object/calendars/julian";
import { useTranslation } from "react-i18next";

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

const Leads = () => {
  const { t } = useTranslation("customerManagement");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const dispatch = useDispatch();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  // Permissions
  const { hasPermission } = usePermissions();
  const canExportLeads = hasPermission(LEAD_PERMISSIONS.EXPORT);
  const canViewCustomer = hasPermission("CUSTOMER_READ");
  const canWriteCustomer = hasPermission("CUSTOMER_WRITE");

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
        return "var(--color-error)";
      case "mediumrisk":
      case "medium":
        return "var(--color-warning)";
      case "peprisk":
      case "pep":
        return "var(--color-error)";
      case "lowrisk":
      case "low":
      default:
        return "var(--color-success)";
    }
  };
  
  const normalizeRiskDisplay = (risk: string) => {
    if (!risk) return "low";
    const riskLower = risk.toLowerCase();
    // Remove "risk" suffix if present
    if (riskLower.endsWith("risk")) {
      return riskLower.slice(0, -4); // Remove last 4 characters ("risk")
    }
    return riskLower;
  };

  // Helper function for lifecycle color
  const getLifecycleColor = (stage: string) => {
    if (!stage) return "var(--color-disabled)";
    const stageLower = stage.toLowerCase();
    switch (stageLower) {
      case "lead":
        return "var(--color-info)";
      case "qualified":
        return "var(--color-success)";
      case "customer":
        return "var(--color-success)";
      case "lost":
        return "var(--color-error)";
      default:
        return "var(--color-disabled)";
    }
  };
  
  const Activity_Loans_Header = [
    // {
    //   name: "CIF Number",
    //   selector: (row: any) => row.cifNumber,
    //   sortable: true,
    //   // width: "150px",
    // },
    {
      name: t("leads.col.nid"),
      selector: (row: any) => row.nationalId,
      sortable: true,
      // width: "150px",
    },
    // {
    //   name: "Full Name",
    //   selector: (row: any) => row.fullName,
    //   sortable: true,
    //   // width: "180px",
    // },
    {
      name: t("leads.col.mobileNo"),
      selector: (row: any) => row.phone,
      sortable: true,
      // width: "160px",
    },
    // {
    //   name: "Email",
    //   selector: (row: any) => row.email,
    //   sortable: true,
    //   // width: "200px",
    // },
    {
      name: t("leads.col.currentStep"),
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "32px",
            fontSize: "12px",
            fontWeight: "500",
            backgroundColor: row.currentStep === "OTP_SENT" ? "var(--color-warning)" : "var(--color-success)",
            color: "var(--primary-foreground)",
            display: "inline-block",
            textTransform: "capitalize",
          }}
        >
          {(row.currentStep || "-").toLowerCase().replace(/_/g, " ")}
        </span>
      ),
      sortable: true,
      // width: "160px",
    },
    // {
    //   name: "Customer Type",
    //   selector: (row: any) => row.customerType,
    //   sortable: true,
    //   // width: "150px",
    // },
    {
      name: t("leads.col.globalId"),
      selector: (row: any) => row.globalUid,
      sortable: true,
      // width: "150px",
    },
    // {
    //   name: "KYC Status",
    //   cell: (row: any) => (
    //     <span
    //       style={{
    //         padding: "6px 12px",
    //         borderRadius: "32px",
    //         fontSize: "12px",
    //         fontWeight: "500",
    //         backgroundColor: row.kycStatus === "VERIFIED" ? "var(--color-success)" : "var(--color-warning)",
    //         color: "var(--primary-foreground)",
    //         display: "inline-block",
    //         textTransform: "capitalize",
    //       }}
    //     >
    //       {(row.kycStatus || "-").toLowerCase()}
    //     </span>
    //   ),
    //   sortable: true,
    //   // width: "150px",
    // },
    {
      name: t("leads.col.deviceTrusted"),
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "32px",
            fontSize: "12px",
            fontWeight: "500",
            backgroundColor: row.deviceTrusted === true ? "var(--color-success)" : "var(--color-warning)",
            color: "var(--primary-foreground)",
            display: "inline-block",
            textTransform: "capitalize",
          }}
        >
          {row.deviceTrusted === true ? t("leads.deviceTrusted.yes") : t("leads.deviceTrusted.no")}
        </span>
      ),
      sortable: true,
      // width: "150px",
    },
    // {
    //   name: "Created At",
    //   sortable: true,
    //   cell: (row: any) => (
    //     <div>
    //       {row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}
    //     </div>
    //   ),
    //   // width: "130px",
    // },

    {
      name: t("leads.col.lifeCycle"),
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "32px",
            fontSize: "12px",
            fontWeight: "500",
            backgroundColor: getLifecycleColor(row.lifecycleStage),
            color: "var(--primary-foreground)",
            display: "inline-block",
            textTransform: "capitalize",
          }}
        >
          {(row.lifecycleStage || "-").toLowerCase().replace(/_/g, " ")}
        </span>
      ),
      sortable: true,
      // width: "150px",
    },
    {
      name: t("common:actions"),
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "var(--color-action)",
              color: "var(--foreground)",
              borderColor: "var(--primary-foreground)",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            {t("leads.select")} <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
    },
  ];
  const menu = (row: any) => (
    <Menu>
      {canViewCustomer && (
      <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => handleMenuClick("view", row)}
      >
        {t("common:viewDetails")}
      </Menu.Item>
      )}
      {canWriteCustomer && (
      <Menu.Item
        key="changeRisk"
        icon={<SyncOutlined />}
        onClick={() => handleMenuClick("changeRisk", row)}
      >
        {t("leads.menu.changeRisk")}
      </Menu.Item>
      )}
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
        // Handle view actio
        navigate(`/LOS/CustomerManagement/LeadDetails/${data.id}`);
        break;
      case "change":
        // Handle change status action
        setSelectedUserForStatusChange(data);
        setNewStatus(data.status === "active" ? "inactive" : "active");
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
      toast.error(t("leads.toast.userIdNotFound"));
      return;
    }

    if (selectedBlockCodes.length === 0) {
      toast.error(t("leads.toast.selectBlockCode"));
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
        toast.success(response?.data?.message || t("leads.toast.blocked", { count: selectedBlockCodes.length }));
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
        toast.error(response?.data?.message || t("leads.toast.blockFailed"));
      }
    } catch (error: any) {
      console.error("Error blocking codes:", error);
      toast.error(error?.response?.data?.message || error?.message || t("leads.toast.blockFailed"));
    }
  };

  // Handle unblock selected codes
  const handleUnblockSelected = async () => {
    if (!currentUserId) {
      toast.error(t("leads.toast.userIdNotFound"));
      return;
    }

    if (selectedBlockCodes.length === 0) {
      toast.error(t("leads.toast.selectBlockCode"));
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
        toast.success(response?.data?.message || t("leads.toast.unblocked", { count: selectedBlockCodes.length }));
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
        toast.error(response?.data?.message || t("leads.toast.unblockFailed"));
      }
    } catch (error: any) {
      console.error("Error unblocking codes:", error);
      toast.error(error?.response?.data?.message || error?.message || t("leads.toast.unblockFailed"));
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

  // Handle status switch change
  const handleStatusSwitchChange = async (row: any, checked: boolean) => {
    const newStatus = checked ? "active" : "inactive";
    
    try {
      const response = await userActive(row.id, {
        user_id: row.id,
        status: newStatus
      });

      if (response?.data?.success) {
        toast.success(response?.data?.message || t("leads.toast.statusChanged", { status: newStatus }));
        // Refresh the leads list to get updated data
        getLeadsList();
      } else {
        toast.error(response?.data?.message || t("leads.toast.statusChangeFailed"));
        // Revert the switch if API call failed
        getLeadsList();
      }
    } catch (error: any) {
      console.error("Error changing status:", error);
      toast.error(error?.response?.data?.message || error?.message || t("leads.toast.statusChangeFailed"));
      // Revert the switch if API call failed
      getLeadsList();
    }
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!selectedUserForStatusChange || !newStatus) {
      toast.error(t("leads.toast.selectStatus"));
      return;
    }

    try {
      setIsChangingStatus(true);
      const response = await changeUserStatus(selectedUserForStatusChange.id, {
        user_id: selectedUserForStatusChange.id,
        status: newStatus
      });

      if (response?.data?.success) {
        toast.success(response?.data?.message || t("leads.toast.statusChanged", { status: newStatus }));
        handleChangeStatusModalClose();
        // Refresh the leads list to get updated data
        getLeadsList();
      } else {
        toast.error(response?.data?.message || t("leads.toast.statusChangeFailed"));
      }
    } catch (error: any) {
      console.error("Error changing status:", error);
      toast.error(error?.response?.data?.message || error?.message || t("leads.toast.statusChangeFailed"));
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
      toast.error(t("leads.toast.selectRisk"));
      return;
    }

    try {
      setIsChangingRisk(true);
      const response = await updateKycRisk(selectedUserForRiskChange.id, newRisk);

      if (response?.status >= 200 && response?.status < 300) {
        toast.success(response?.data?.message || t("leads.toast.riskChanged", { risk: newRisk }));
        handleChangeRiskModalClose();
        // Refresh the leads list to get updated data
        getLeadsList();
      } else {
        toast.error(response?.data?.message || t("leads.toast.riskChangeFailed"));
      }
    } catch (error: any) {
      console.error("Error changing risk:", error);
      toast.error(error?.response?.data?.message || error?.message || t("leads.toast.riskChangeFailed"));
    } finally {
      setIsChangingRisk(false);
    }
  };

  const getLeadsList = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getCustomersByLifecycleStage("LEAD");
      const list = response?.data?.data || response?.data || [];
      const allData = Array.isArray(list) ? list : [];
      setData(allData);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || t("leads.toast.fetchFailed"));
    } finally {
      setSkelitonLoading(false);
    }
  };
  useEffect(() => {
    getLeadsList();
  }, []);

  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      return {
        id: item.id,
        Sr: index + 1,
        cifNumber: item?.cifNumber || "-",
        fullName: item?.fullName || "-",
        nationalId: item?.nationalId || item?.nationalIdType || "-",
        phone: item?.mobileNumber || "-",
        email: item?.email || "-",
        currentStep: item?.currentStep || "-",
        globalUid: item?.globalUid || "-",
        deviceTrusted: item?.deviceTrusted || "-",
        customerType: item?.customerType || "-",
        kycStatus: item?.kycStatus || "-",
        lifecycleStage: item?.lifecycleStage || "-",
        riskGrade: item?.riskGrade || item?.riskLevel || item?.risk_grade || item?.risk || "-",
        gender: item?.gender || "-",
        nationality: item?.nationality || "-",
        created_at: item?.createdAt,
        lastUpdatedAt: item?.updatedAt,
      };
    });
  const exportCSV = async () => {
    try {
      toast.loading(t("leads.toast.exporting"), { id: "export-leads" });
      const response = await exportLeads();
      
      if (!response || !response.data) {
        throw new Error("Failed to download file");
      }
      
      // Convert server response to a Blob (binary file)
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      
      // Try to extract filename from response header
      const contentDisposition = response.headers['content-disposition'];
      let fileName = "leads_export";
      
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
      
      toast.success(t("leads.toast.exported"), { id: "export-leads" });
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        t("leads.toast.exportFailed"),
        { id: "export-leads" }
      );
    }
  };

  const [selectedValue, setSelectedValue] = useState("today");
  return (
    <div className="service leads-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">{t("leads.title")}</h3>
      </div>

      {/* Filters card */}
      <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            allowClear
            placeholder={t("leads.searchPlaceholder")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          <DatePicker
            placeholder={t("common:from")}
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
            style={{
              flex: "1 1 180px",
              minWidth: 160,
              height: 40,
              borderRadius: 2,
              background: "#fff",
            }}
          />
          <DatePicker
            placeholder={t("common:to")}
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
            style={{
              flex: "1 1 180px",
              minWidth: 160,
              height: 40,
              borderRadius: 2,
              background: "#fff",
            }}
          />
          {canExportLeads && (
            <button
              className="theme-btn-next"
              onClick={exportCSV}
              style={{ height: 40, flexShrink: 0, whiteSpace: "nowrap" }}
            >
              {t("leads.exportCsv")}
            </button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div
        className="bg-white"
        style={{
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <TableView
          header={Activity_Loans_Header}
          data={mappedData}
          totalRows={mappedData?.length || 0}
          isLoading={skelitonLoading}
          from={1}
          page={page}
          totalPage={Math.ceil((mappedData?.length || 0) / pageSize) || 1}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={mappedData?.length || 0}
        />
      </div>

      <style>{`
        /* Table styling is centralized (shared across all pages) — no per-page
           table CSS here. Only page-specific, non-table tweaks below. */
        /* Date pickers in the filter card: match the search input */
        .leads-page .ant-picker {
          background: #fff !important;
          border: 1px solid var(--border) !important;
          color: var(--foreground) !important;
          padding: 4px 11px !important;
        }
        .leads-page .ant-picker-input > input {
          color: var(--foreground) !important;
        }
        .leads-page .ant-picker-input > input::placeholder {
          color: var(--muted-foreground) !important;
        }
        /* Responsive: stack everything full-width on small screens */
        @media (max-width: 575.98px) {
          .leads-page .ant-input-affix-wrapper,
          .leads-page .ant-picker,
          .leads-page .theme-btn-next {
            flex: 1 1 100% !important;
            width: 100% !important;
            min-width: 0 !important;
          }
        }
      `}</style>

      {/* Block Codes Management Modal */}
      <Modal maskClosable={false} keyboard={false}
        title={<div style={{ fontSize: "20px", fontWeight: "600" }}>{t("leads.blockModal.title")}</div>}
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
              <PulseLoading size="lg" />
              <p style={{ fontSize: "16px", color: "var(--muted-foreground)", margin: 0 }}>{t("leads.blockModal.loading")}</p>
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
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>{t("leads.blockModal.selectionHeading")}</h3>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button
                    type="primary"
                    style={{ backgroundColor: "var(--color-success)", borderColor: "var(--color-success)" }}
                    onClick={handleSelectAll}
                  >
                    {t("leads.blockModal.selectAll")}
                  </Button>
                  <Button
                    style={{
                      backgroundColor: "var(--color-warning)",
                      borderColor: "var(--color-warning)",
                      color: "var(--primary-foreground)"
                    }}
                    onClick={handleDeselectAll}
                  >
                    {t("leads.blockModal.deselectAll")}
                  </Button>
                </div>
              </div>

          {/* Block Codes Table */}
          <div style={{
            border: "1px solid var(--border)",
            borderRadius: "2px",
            overflow: "hidden",
            maxHeight: "400px",
            overflowY: "auto"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{
                backgroundColor: "var(--muted)",
                position: "sticky",
                top: 0,
                zIndex: 1
              }}>
                <tr>
                  <th style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--border)",
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
                    borderBottom: "1px solid var(--border)",
                    fontWeight: "600"
                  }}>
                    {t("leads.blockModal.colBlockCode")}
                  </th>
                  <th style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--border)",
                    fontWeight: "600"
                  }}>
                    {t("common:type")}
                  </th>
                  <th style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    borderBottom: "1px solid var(--border)",
                    fontWeight: "600"
                  }}>
                    {t("leads.blockModal.colAction")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {blockCodes.map((code) => (
                  <tr key={code.id} style={{
                    backgroundColor: selectedBlockCodes.includes(code.id) ? "var(--muted)" : "var(--background)"
                  }}>
                    <td style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border)"
                    }}>
                      <Checkbox
                        checked={selectedBlockCodes.includes(code.id)}
                        onChange={() => handleCheckboxChange(code.id)}
                      />
                    </td>
                    <td style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border)",
                      fontWeight: "500"
                    }}>
                      {code.code}
                    </td>
                    <td style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border)"
                    }}>
                      <span style={{
                        backgroundColor: "var(--color-info)",
                        color: "var(--primary-foreground)",
                        padding: "4px 12px",
                        borderRadius: "2px",
                        fontSize: "12px",
                        fontWeight: "500"
                      }}>
                        {code.type}
                      </span>
                    </td>
                    <td style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border)",
                      textAlign: "center"
                    }}>
                      <button style={{
                        backgroundColor: code.blocked ? "var(--color-error)" : "var(--color-success)",
                        color: "var(--primary-foreground)",
                        border: "none",
                        padding: "6px 16px",
                        borderRadius: "2px",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "default",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        {code.blocked ? "⊘" : "✓"} {code.blocked ? t("leads.blockModal.blocked") : t("leads.blockModal.active")}
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
            borderTop: "1px solid var(--border)"
          }}>
            <Button
              type="primary"
              danger
              disabled={selectedBlockCodes.length === 0}
              onClick={handleBlockSelected}
              style={{
                backgroundColor: selectedBlockCodes.length === 0 ? undefined : "var(--color-error)",
                borderColor: selectedBlockCodes.length === 0 ? undefined : "var(--color-error)"
              }}
            >
              {t("leads.blockModal.blockSelected")}
            </Button>
            <Button
              type="primary"
              disabled={selectedBlockCodes.length === 0}
              onClick={handleUnblockSelected}
              style={{
                backgroundColor: selectedBlockCodes.length === 0 ? undefined : "var(--color-warning)",
                borderColor: selectedBlockCodes.length === 0 ? undefined : "var(--color-warning)"
              }}
            >
              {t("leads.blockModal.unblockSelected")}
            </Button>
          </div>

              {/* Close Button */}
              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid var(--border)"
              }}>
                <Button
                  onClick={handleModalClose}
                  style={{
                    backgroundColor: "var(--color-disabled)",
                    borderColor: "var(--color-disabled)",
                    color: "var(--primary-foreground)"
                  }}
                >
                  {t("common:close")}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Change Status Modal */}
      <Modal maskClosable={false} keyboard={false}
        title={<div style={{ fontSize: "20px", fontWeight: "600" }}>{t("leads.statusModal.title")}</div>}
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
                <p style={{ marginBottom: "8px", fontWeight: "500" }}>{t("leads.statusModal.userName")}</p>
                <p style={{ marginBottom: "16px", color: "var(--muted-foreground)" }}>{selectedUserForStatusChange.name || "-"}</p>

                <p style={{ marginBottom: "8px", fontWeight: "500" }}>{t("leads.statusModal.currentStatus")}</p>
                <div style={{ marginBottom: "16px" }}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "32px",
                      fontSize: "12px",
                      backgroundColor:
                        selectedUserForStatusChange.status === "active"
                          ? "var(--color-success)"
                          : "var(--color-error)",
                      color: "var(--primary-foreground)",
                      display: "inline-block"
                    }}
                  >
                    {selectedUserForStatusChange.status === "active" ? t("common:active") : t("common:inactive")}
                  </span>
                </div>

                <p style={{ marginBottom: "8px", fontWeight: "500" }}>{t("leads.statusModal.newStatus")}</p>
                <Select
                  style={{ width: "100%", marginBottom: "20px" }}
                  value={newStatus}
                  onChange={(value) => setNewStatus(value)}
                  placeholder={t("leads.statusModal.selectStatus")}
                >
                  <Select.Option value="active">{t("common:active")}</Select.Option>
                  <Select.Option value="inactive">{t("common:inactive")}</Select.Option>
                </Select>
              </div>

              <div style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid var(--border)"
              }}>
                <Button
                  onClick={handleChangeStatusModalClose}
                  disabled={isChangingStatus}
                  style={{
                    backgroundColor: "var(--color-disabled)",
                    borderColor: "var(--color-disabled)",
                    color: "var(--primary-foreground)"
                  }}
                >
                  {t("common:cancel")}
                </Button>
                <Button
                  type="primary"
                  onClick={handleStatusChange}
                  loading={isChangingStatus}
                  disabled={!newStatus || newStatus === selectedUserForStatusChange.status}
                  style={{
                    backgroundColor: "var(--color-action)",
                    borderColor: "var(--color-action)"
                  }}
                >
                  {isChangingStatus ? t("leads.changing") : t("leads.statusModal.changeStatus")}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Change Risk Modal */}
      <Modal maskClosable={false} keyboard={false}
        title={<div style={{ fontSize: "20px", fontWeight: "600" }}>{t("leads.riskModal.title")}</div>}
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
                <p style={{ marginBottom: "8px", fontWeight: "500" }}>{t("leads.statusModal.userName")}</p>
                <p style={{ marginBottom: "16px", color: "var(--muted-foreground)" }}>{selectedUserForRiskChange.name || "-"}</p>

                <p style={{ marginBottom: "8px", fontWeight: "500" }}>{t("leads.riskModal.currentRisk")}</p>
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

                <p style={{ marginBottom: "8px", fontWeight: "500" }}>{t("leads.riskModal.newRisk")}</p>
                <Select
                  style={{ width: "100%", marginBottom: "20px" }}
                  value={newRisk}
                  onChange={(value) => setNewRisk(value)}
                  placeholder={t("leads.riskModal.selectRisk")}
                >
                  <Select.Option value="high">{t("leads.risk.high")}</Select.Option>
                  <Select.Option value="low">{t("leads.risk.low")}</Select.Option>
                  <Select.Option value="medium">{t("leads.risk.medium")}</Select.Option>
                  <Select.Option value="pep">{t("leads.risk.pep")}</Select.Option>
                </Select>
              </div>

              <div style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid var(--border)"
              }}>
                <button
                  onClick={handleChangeRiskModalClose}
                  disabled={isChangingRisk}
              className="invoice-btn"
                >
                  {t("common:cancel")}
                </button>
                <button

                  onClick={handleRiskChange}

                  disabled={!newRisk || newRisk === selectedUserForRiskChange.risk_status}
               className="theme-btn"
                >
                  {isChangingRisk ? t("leads.changing") : t("leads.riskModal.changeRisk")}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Leads;
