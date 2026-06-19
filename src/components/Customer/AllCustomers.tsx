import { useEffect, useState } from "react";
import PulseLoading from "../Loader/PulseLoader";
import { Button, DatePicker, Dropdown, Input, Menu, Select, Modal, Checkbox } from "antd";
import TableView from "../TableView/TableView";
import { getLeadCustomers, changeUserStatus, updateKycRisk } from "../../redux/apis/apisCrud";
import { getRiskBlockCodes } from "../../redux/apis/apisRiskManagement";
import { getCustomerBlocks, assignBlockToCustomer, removeBlockFromCustomer } from "../../redux/apis/apisCrudLms";
import ManageCustomerBlocksModal from "../CustomerManagemnt/ManageCustomerBlocksModal";
import { getCustomers } from "../../redux/apis/apisEddReferenceData";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { EyeOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import { SaudiRiyal, UserPlus, ShieldOff, Users } from "lucide-react";
import BeneficiariesDialog from "../../pages/lmsPages/Wallet/BeneficiariesDialog";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import MaskedValue from "../MaskedValue";
import { useDispatch } from "react-redux";
import { authSlice } from "../../redux/apis/apisSlice";
import { formatDate } from "../../App";
import { useNavigate } from "react-router-dom";
import { usePermissions, CUSTOMER_PERMISSIONS } from "../../hooks/useProductPermissions";


const AllCustomers = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const dispatch = useDispatch();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Permissions
  const { hasPermission } = usePermissions();
  const canExportCustomers = hasPermission(CUSTOMER_PERMISSIONS.EXPORT);

  // Block codes modal state
  const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);
  const [selectedBlockCodes, setSelectedBlockCodes] = useState<string[]>([]);
  const [blockCodes, setBlockCodes] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<any>(null);
  const [isLoadingBlockCodes, setIsLoadingBlockCodes] = useState(false);

  // Change status modal state
  const [isChangeStatusModalVisible, setIsChangeStatusModalVisible] = useState(false);
  const [selectedUserForStatusChange, setSelectedUserForStatusChange] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Beneficiaries dialog state
  const [beneficiaryCustomerId, setBeneficiaryCustomerId] = useState<string | null>(null);

  // Change risk modal state
  const [isChangeRiskModalVisible, setIsChangeRiskModalVisible] = useState(false);
  const [selectedUserForRiskChange, setSelectedUserForRiskChange] = useState<any>(null);
  const [newRisk, setNewRisk] = useState<string>("");
  const [isChangingRisk, setIsChangingRisk] = useState(false);

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
        return "var(--color-pep)";
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
    return risk;
  };
  const Activity_Loans_Header = [
    {
      name: "Name",
      cell: (row: any) => row.name,
      sortable: true,
      width: "200px",
    },
    {
      name: "National ID",
      selector: (row: any) => row.nationalId || "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "CIF",
      selector: (row: any) => row.cif || "-",
      sortable: true,
      width: "180px",
    },
    {
      name: "Email",
      selector: (row: any) => row.email,
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row: any) => row.phone,
      sortable: true,
      width: "180px",
    },
    {
      name: "Nationality",
      selector: (row: any) => row.nationality || "-",
      sortable: true,
      width: "120px",
    },
    // {
    //   name: "KYC Status",
    //   cell: (row: any) => {
    //     const status = row.kycStatus || "-";
    //     const color = status === "VERIFIED" ? "var(--color-success)" : status === "PENDING" ? "var(--color-warning)" : "var(--color-error)";
    //     return (
    //       <span
    //         style={{
    //           padding: "6px 12px",
    //           borderRadius: "32px",
    //           fontSize: "12px",
    //           backgroundColor: color,
    //           color: "var(--primary-foreground)",
    //           display: "inline-block",
    //           textTransform: "capitalize",
    //           fontWeight: "500",
    //           whiteSpace: "nowrap"
    //         }}
    //       >
    //         {status.toLowerCase()}
    //       </span>
    //     );
    //   },
    //   sortable: true,
    //   width: "140px",
    // },
    {
      name: "Stage",
      cell: (row: any) => {
        const stage = row.lifecycleStage || "-";
        const color = stage === "QUALIFIED" ? "var(--color-success)" : stage === "LEAD" ? "var(--color-info)" : "var(--color-warning)";
        return (
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "32px",
              fontSize: "12px",
              backgroundColor: color,
              color: "var(--primary-foreground)",
              display: "inline-block",
              textTransform: "capitalize",
              fontWeight: "500",
              whiteSpace: "nowrap"
            }}
          >
            {stage.toLowerCase()}
          </span>
        );
      },
      sortable: true,
      width: "130px",
    },
    // {
    //   name: "PEP",
    //   cell: (row: any) => (
    //     <span style={{ fontWeight: "500", color: row.pep === "Yes" ? "var(--color-error)" : "var(--color-success)" }}>
    //       {row.pep}
    //     </span>
    //   ),
    //   sortable: true,
    //   width: "80px",
    // },
    // {
    //   name: "Risk",
    //   cell: (row: any) => {
    //     const riskStatus = row.risk || "N/A";
    //     const displayRisk = normalizeRiskDisplay(riskStatus);

    //     return (
    //       <span
    //         style={{
    //           padding: "6px 12px",
    //           borderRadius: "32px",
    //           fontSize: "12px",
    //           backgroundColor: getRiskColor(riskStatus),
    //           color: "var(--primary-foreground)",
    //           display: "inline-block",
    //           textTransform: "capitalize",
    //           fontWeight: "500",
    //           whiteSpace: "nowrap"
    //         }}
    //       >
    //         {displayRisk}
    //       </span>
    //     );
    //   },
    //   sortable: true,
    //   width: "100px",
    // },
    {
      name: "Created",
      sortable: true,
      cell: (row: any) => (
        <div>
          {row.created_at && row.created_at !== "-" ? new Date(row.created_at).toLocaleDateString() : "-"}
        </div>
      ),
      width: "120px",
    },
    {
      name: "Is Blocked",
      cell: (row: any) => {
        const blocked = row.isBlocked;
        return blocked
          ? <span onClick={() => handleBlockButtonClick(row)} style={{ padding: "4px 12px", borderRadius: "32px", fontSize: "12px", backgroundColor: "var(--color-error)", color: "var(--primary-foreground)", fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer" }}>Blocked</span>
          : <span onClick={() => handleBlockButtonClick(row)} style={{ padding: "4px 12px", borderRadius: "32px", fontSize: "12px", backgroundColor: "var(--color-success)", color: "var(--primary-foreground)", fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer" }}>Unblocked</span>;
      },
      width: "130px",
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "var(--color-action)",
              color: "var(--foreground)",
              borderColor: "white",
              borderRadius: "2px",
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
        key="changeRisk"
        icon={<SyncOutlined />}
        onClick={() => handleMenuClick("changeRisk", row)}
      >
        Change Risk
      </Menu.Item>
      <Menu.Item
        key="costByCustomer"
        icon={<SaudiRiyal size={14} />}
        onClick={() => handleMenuClick("costByCustomer", row)}
      >
        Cost By Customer
      </Menu.Item>
      <Menu.Item
        key="onboardingCostByCustomer"
        icon={<UserPlus size={14} />}
        onClick={() => handleMenuClick("onboardingCostByCustomer", row)}
      >
        Onboarding Cost By Customer
      </Menu.Item>
      <Menu.Item
        key="checkBeneficiaries"
        icon={<Users size={14} />}
        onClick={() => handleMenuClick("checkBeneficiaries", row)}
      >
        Check Beneficiary List
      </Menu.Item>
      {/* <Menu.Item
        key="manageBlockCodes"
        icon={<ShieldOff size={14} />}
        onClick={() => handleBlockButtonClick(row)}
      >
        Manage Block Codes
      </Menu.Item> */}
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

        navigate(`/LOS/CustomerManagement/CustomerDetails/${data.id}`);

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
      case "costByCustomer":
        navigate(`/LOS/CustomerManagement/CostByCustomer/${data.id}`);
        break;
      case "onboardingCostByCustomer":
        navigate(`/LOS/CustomerManagement/OnboardingCostByCustomer/${data.id}`);
        break;
      case "checkBeneficiaries":
        setBeneficiaryCustomerId(data.id);
        break;
      case "logout":
        // Handle force logout action
        break;
      default:
        break;
    }
  };

  const handleBlockButtonClick = async (row: any) => {
    setCurrentUserId(row.id);
    setIsBlockModalVisible(true);
    setIsLoadingBlockCodes(true);
    setSelectedBlockCodes([]);
    try {
      const [codesRes, activeBlocksRes] = await Promise.allSettled([
        getRiskBlockCodes(),
        getCustomerBlocks(row.id),
      ]);
      const allCodes = codesRes.status === "fulfilled"
        ? (Array.isArray(codesRes.value?.data?.data) ? codesRes.value.data.data : Array.isArray(codesRes.value?.data) ? codesRes.value.data : [])
        : [];
      const activeBlocks = activeBlocksRes.status === "fulfilled"
        ? (Array.isArray(activeBlocksRes.value?.data?.data) ? activeBlocksRes.value.data.data : [])
        : [];
      const activeIds = activeBlocks.map((b: any) => b.blockCodeId || b.id);
      setBlockCodes(allCodes.map((item: any) => ({ id: item.id, code: item.code, type: item.type, blocked: activeIds.includes(item.id) })));
      setSelectedBlockCodes(activeIds);
    } catch {
      setBlockCodes([]);
    } finally {
      setIsLoadingBlockCodes(false);
    }
  };

  const handleSelectAll = () => setSelectedBlockCodes(blockCodes.map((c) => c.id));
  const handleDeselectAll = () => setSelectedBlockCodes([]);
  const handleCheckboxChange = (id: string) =>
    setSelectedBlockCodes((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleBlockSelected = async () => {
    if (!currentUserId || selectedBlockCodes.length === 0) { toast.error("Select at least one block code"); return; }
    try {
      await assignBlockToCustomer(currentUserId, selectedBlockCodes);
      toast.success(`${selectedBlockCodes.length} block code(s) assigned`);
      setIsBlockModalVisible(false);
      setSelectedBlockCodes([]);
      setCurrentUserId(null);
      getLeadsList();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to block");
    }
  };

  const handleUnblockSelected = async () => {
    if (!currentUserId || selectedBlockCodes.length === 0) {
      toast.error("Select at least one block code");
      return;
    }
    try {
      await removeBlockFromCustomer(currentUserId, selectedBlockCodes);
      toast.success(`${selectedBlockCodes.length} block code(s) removed`);
      setSelectedBlockCodes([]);
      setBlockCodes((prev) => prev.map((c) => selectedBlockCodes.includes(c.id) ? { ...c, blocked: false } : c));
      getLeadsList();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to unblock");
    }
  };

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
      const response = await changeUserStatus(row.id, {
        user_id: row.id,
        status: newStatus
      });

      if (response?.data?.success) {
        toast.success(response?.data?.message || `Status changed to ${newStatus} successfully`);
        // Refresh the leads list to get updated data
        getLeadsList();
      } else {
        toast.error(response?.data?.message || "Failed to change status");
        // Revert the switch if API call failed
        getLeadsList();
      }
    } catch (error: any) {
      console.error("Error changing status:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to change status");
      // Revert the switch if API call failed
      getLeadsList();
    }
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
      const response = await updateKycRisk(selectedUserForRiskChange.id, newRisk);

      if (response?.status >= 200 && response?.status < 300) {
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

      // Backend uses 0-based indexing for page
      const response = await getCustomers(page - 1, pageSize, search, '', '');
      if (response) {
        const list = response?.data?.data || [];
        const allData = Array.isArray(list) ? list : [];
        setData(allData);

        const pagination = response?.data?.pagination;
        if (pagination) {
          setTotalRows(pagination.totalElements || 0);
          setTotalPage(pagination.totalPages || 1);
        } else {
          setTotalRows(allData.length);
          setTotalPage(Math.ceil(allData.length / pageSize) || 1);
        }
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setSkelitonLoading(false);
    }
  };
  useEffect(() => {
    getLeadsList();
  }, [page, pageSize, search]);

  // Reset to page 1 when search / page size changes
  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const mappedData =
    (data || []).map((item: any, index: number) => {
      return {
        id: item.id,
        Sr: (page - 1) * pageSize + index + 1,
        name: item?.fullName || `${item?.firstName || ""} ${item?.lastName || ""}`.trim() || "-",
        nationalId: item?.nationalId || "-",
        cif: item?.cifNumber || "-",
        email: item?.email || "-",
        phone: item?.mobileNumber || "-",
        nationality: item?.nationality || "-",
        isBlocked: item?.isBlocked,
        gender: item?.gender || "-",
        pep: item?.pepFlag ? "Yes" : "No",
        kycStatus: item?.kycStatus || "-",
        lifecycleStage: item?.lifecycleStage || "-",
        risk: item?.riskGrade || item?.riskLevel || item?.risk_grade || item?.risk || "N/A",
        risk_status: item?.riskGrade || item?.riskLevel || item?.risk_grade || item?.risk || "-",
        sanctionsFlag: item?.sanctionsFlag,
        customerType: item?.customerType || "-",
        residencyType: item?.residencyType || "-",
        created_at: item?.createdAt || "-",
        dateOfBirth: item?.dateOfBirth || "-",
      };
    });

  const fromValue = totalRows > 0 ? (page - 1) * pageSize + 1 : 0;
  const toValue = Math.min(page * pageSize, totalRows);
  const exportToCSV = async () => {
    try {
      toast.loading("Exporting CSV...", { id: "export-csv" });

      let allData: any[] = [];

      try {
        const response = await getCustomers(0, 10000, search, '', '');
        const list = response?.data?.data || [];
        allData = Array.isArray(list) ? list : [];
      } catch (pageError) {
        console.error("Error fetching customers for export:", pageError);
      }

      if (allData.length === 0) {
        toast.error("No data to export", { id: "export-csv" });
        return;
      }

      // Map data according to table headers
      const csvData = allData.map((item: any) => ({
        "Name": item?.fullName || `${item?.firstName || ""} ${item?.lastName || ""}`.trim() || "-",
        "CIF": item?.cifNumber || "-",
        "Email": item?.email || "-",
        "Phone": item?.mobileNumber || "-",
        "Nationality": item?.nationality || "-",
        "Gender": item?.gender || "-",
        "KYC Status": item?.kycStatus || "-",
        "Lifecycle Stage": item?.lifecycleStage || "-",
        "PEP": item?.pepFlag ? "Yes" : "No",
        "Risk Grade": item?.riskGrade || "-",
        "Customer Type": item?.customerType || "-",
        "Created": item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-",
      }));

      // Create CSV string
      const headers = Object.keys(csvData[0]);
      const csvRows = [
        headers.join(','), // Header row
        ...csvData.map((row: any) =>
          headers.map((header: string) => {
            const value = row[header] || '';
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `All_Customers_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`CSV exported successfully! (${allData.length} records)`, { id: "export-csv" });
    } catch (error: any) {
      console.error("Error exporting CSV:", error);
      toast.error(error?.message || "Failed to export CSV", { id: "export-csv" });
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "Leads.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "ID",
      "Phone",
      "Cnic",
      "Total Balance",
      "Register Date",
      "Type",
      "Status",
    ];

    const tableRows = mappedData?.map((item: any) => [
      item.id,
      item.phone,
      item.cnic || "-",
      item.accountBalance,
      item.UpdatedBy,
      item.accountType || "-",
      item.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Leads.pdf");
  };
  const [selectedValue, setSelectedValue] = useState("today");
  return (
    <div className="service customer-list-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Customer List</h3>
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
            placeholder="Search..."
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          <DatePicker
            placeholder="From"
            value={fromDate}
            onChange={(date: any) => {
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
            placeholder="To"
            value={toDate}
            onChange={(date: any) => {
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
          {canExportCustomers && (
            <button
              className="theme-btn-next"
              onClick={exportToCSV}
              style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              Export CSV
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
          totalRows={totalRows}
          isLoading={skelitonLoading}
          from={fromValue}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={toValue}
        />
      </div>

      <style>{`
        /* Table styling is centralized (shared across all pages) — no per-page
           table CSS here. Only page-specific, non-table tweaks below. */
        /* Date pickers in the filter card: match the search input */
        .customer-list-page .ant-picker {
          background: #fff !important;
          border: 1px solid var(--border) !important;
          color: var(--foreground) !important;
          padding: 4px 11px !important;
        }
        .customer-list-page .ant-picker-input > input {
          color: var(--foreground) !important;
        }
        .customer-list-page .ant-picker-input > input::placeholder {
          color: var(--muted-foreground) !important;
        }
        /* Responsive: stack everything full-width on small screens */
        @media (max-width: 575.98px) {
          .customer-list-page .ant-input-affix-wrapper,
          .customer-list-page .ant-picker,
          .customer-list-page .theme-btn-next {
            flex: 1 1 100% !important;
            width: 100% !important;
            min-width: 0 !important;
          }
        }
      `}</style>

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
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "300px", gap: "20px" }}>
              <PulseLoading size="lg" />
              <p style={{ fontSize: "16px", color: "var(--muted-foreground)", margin: 0 }}>Loading block codes...</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", padding: "10px 0" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>Block Code Selection</h3>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button type="primary" style={{ backgroundColor: "var(--color-success)", borderColor: "var(--color-success)" }} onClick={handleSelectAll}>✓ Select All</Button>
                  <Button style={{ backgroundColor: "var(--color-warning)", borderColor: "var(--color-warning)", color: "var(--primary-foreground)" }} onClick={handleDeselectAll}>⊘ Deselect All</Button>
                </div>
              </div>
              <div style={{ border: "1px solid var(--border)", borderRadius: "2px", overflow: "hidden", maxHeight: "400px", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "var(--muted)", position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid var(--border)", width: "50px" }}>
                        <Checkbox checked={selectedBlockCodes.length === blockCodes.length && blockCodes.length > 0} indeterminate={selectedBlockCodes.length > 0 && selectedBlockCodes.length < blockCodes.length} onChange={(e: any) => e.target.checked ? handleSelectAll() : handleDeselectAll()} />
                      </th>
                      <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid var(--border)", fontWeight: "600" }}>Block Code</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid var(--border)", fontWeight: "600" }}>Type</th>
                      <th style={{ padding: "12px 16px", textAlign: "center", borderBottom: "1px solid var(--border)", fontWeight: "600" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockCodes.map((code) => (
                      <tr key={code.id} style={{ backgroundColor: selectedBlockCodes.includes(code.id) ? "var(--muted)" : "var(--background)" }}>
                        <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                          <Checkbox checked={selectedBlockCodes.includes(code.id)} onChange={() => handleCheckboxChange(code.id)} />
                        </td>
                        <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: "500" }}>{code.code}</td>
                        <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                          <span style={{ backgroundColor: "var(--color-info)", color: "var(--primary-foreground)", padding: "4px 12px", borderRadius: "2px", fontSize: "12px", fontWeight: "500" }}>{code.type}</span>
                        </td>
                        <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
                          <button style={{ backgroundColor: code.blocked ? "var(--color-error)" : "var(--color-success)", color: "var(--primary-foreground)", border: "none", padding: "6px 16px", borderRadius: "2px", fontSize: "12px", fontWeight: "500", cursor: "default", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            {code.blocked ? "⊘ Blocked" : "✓ Active"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
                <Button type="primary" danger disabled={selectedBlockCodes.length === 0} onClick={handleBlockSelected} style={{ backgroundColor: selectedBlockCodes.length === 0 ? undefined : "var(--color-error)", borderColor: selectedBlockCodes.length === 0 ? undefined : "var(--color-error)" }}>⊘ Block Selected</Button>
                <Button type="primary" disabled={selectedBlockCodes.length === 0} onClick={handleUnblockSelected} style={{ backgroundColor: selectedBlockCodes.length === 0 ? undefined : "var(--color-warning)", borderColor: selectedBlockCodes.length === 0 ? undefined : "var(--color-warning)" }}>⊙ Unblock Selected</Button>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
                <Button onClick={handleModalClose} style={{ backgroundColor: "var(--color-disabled)", borderColor: "var(--color-disabled)", color: "var(--primary-foreground)" }}>Close</Button>
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
                <p style={{ marginBottom: "16px", color: "var(--muted-foreground)" }}>{selectedUserForStatusChange.name || "-"}</p>

                <p style={{ marginBottom: "8px", fontWeight: "500" }}>Current Status:</p>
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
                    {selectedUserForStatusChange.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>

                <p style={{ marginBottom: "8px", fontWeight: "500" }}>New Status:</p>
                <Select
                  style={{ width: "100%", marginBottom: "20px" }}
                  value={newStatus}
                  onChange={(value: any) => setNewStatus(value)}
                  placeholder="Select Status"
                >
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="inactive">Inactive</Select.Option>
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
                  Cancel
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
                  {isChangingStatus ? "Changing..." : "Change Status"}
                </Button>
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
                <p style={{ marginBottom: "16px", color: "var(--muted-foreground)" }}>{selectedUserForRiskChange.name || "-"}</p>

                <p style={{ marginBottom: "8px", fontWeight: "500" }}>Current Risk:</p>
                <div style={{ marginBottom: "16px" }}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "32px",
                      fontSize: "12px",
                      backgroundColor:
                        selectedUserForRiskChange.risk_status === "high" ? "var(--color-error)" :
                          selectedUserForRiskChange.risk_status === "medium" ? "var(--color-warning)" :
                            selectedUserForRiskChange.risk_status === "pep" ? "var(--color-pep)" :
                              "var(--color-success)",
                      color: "var(--primary-foreground)",
                      display: "inline-block",
                      textTransform: "capitalize"
                    }}
                  >
                    {selectedUserForRiskChange.risk_status || "Low"}
                  </span>
                </div>

                <p style={{ marginBottom: "8px", fontWeight: "500" }}>New Risk:</p>
                <Select
                  style={{ width: "100%", marginBottom: "20px" }}
                  value={newRisk}
                  onChange={(value: any) => setNewRisk(value)}
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
                borderTop: "1px solid var(--border)"
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

      {/* Customer Beneficiaries (IBAN + IBFT) */}
      <BeneficiariesDialog
        customerId={beneficiaryCustomerId}
        onClose={() => setBeneficiaryCustomerId(null)}
      />

    </div>
  );
};

export default AllCustomers;
