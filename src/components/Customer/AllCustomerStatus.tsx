import { useEffect, useState } from "react";
import PulseLoading from "../Loader/PulseLoader";
import { Button, DatePicker, Dropdown, Menu, Select, Modal, Checkbox, Switch } from "antd";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import { getLeadCustomers, blockUserWithBlockCode, unblockUserWithBlockCode, getBlockCodes, getUserBlocksByUserId, changeUserStatus, updateKycRisk, getAllCustomersWithStatuses } from "../../redux/apis/apisCrud";
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

const AllCustomerStatus = () => {
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
  const getRiskColor = (risk: string) => {
    const riskLower = risk.toLowerCase();
    switch (riskLower) {
      case "highrisk":
      case "high":
        return "var(--color-error)";
      case "mediumrisk":
      case "medium":
        return "var(--color-warning-gold)";
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
    return riskLower;
  };
  const Activity_Loans_Header = [
    {
      name: "Name",
      cell: (row: { name: any }) => row.name,
      sortable: true,
      width: "250px",
    },
    /* {
      name: "Application No.",
      cell: (row: { application_number: any }) => row.application_number,
      sortable: true,
      width: "250px",
    }, */
    {
      name: "NID",
      cell: (row: any) => (
        <MaskedValue value={row.nid} showToggle={true} unmaskedCount={4} />
      ),
      width: "150px",
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row: { phone: any }) => row.phone,
      sortable: true,
      width: "150px",
    },
    /* {
      name: "CIF",
      selector: (row: { cif: any }) => row.cif || "-",
      sortable: true,
      width: "220px",
    }, */
    {
      name: "Email",
      selector: (row: { email: any }) => row.email,
      sortable: true,
      width: "200px",
    },
    {
      name: "Pep",
      selector: (row: { pep: any }) => row.pep || "-",
      sortable: true,
    },
    {
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
            {displayRisk}
          </span>
        );
      },
      sortable: true,
    },
    {
      name: "Risk Score",
      selector: (row: { risk_score: any }) => row.risk_score || "-",
      sortable: true,
      //width: "200px",
    },
    /* {
      name: "Is Blocked",
      selector: (row: { is_blocked: any }) => row.is_blocked,
      sortable: true,
      cell: (row: any) => (
        <button
          onClick={() => handleBlockButtonClick(row)}
          style={{
            padding: "8px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            backgroundColor: row.is_blocked ? "var(--color-error)" : "var(--color-success)",
            color: "white",
            cursor: "pointer",
            border: "none",
          }}
        >
          {row.is_blocked ? "Blocked" : "Unblocked"}
        </button>
      ),
    }, */
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
      cell: (row: any) => {
        const isActive = row.status?.toLowerCase() === "active";
        return (
          <Switch
            checked={isActive}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            onChange={(checked) => handleStatusSwitchChange(row, checked)}
            style={{
              backgroundColor: isActive ? "var(--color-success)" : undefined
            }}
          />
        );
      },
    },
    {
      name: "Actions",

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "var(--color-action) !important",
              color: "var(--foreground)",
              borderColor: "white",
              borderRadius: "6px",
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

      const response = await getAllCustomersWithStatuses(page, pageSize, search);
      if (response && response.data?.success) {
        const responseData = response.data?.data;
        let allData = responseData?.data || [];
        
        // Apply client-side filtering for PEP and status if needed
        if (pep !== '') {
          const pepValue = pep === '1';
          allData = allData.filter((item: any) => {
            const isPep = item?.kyc?.is_pep || false;
            return isPep === pepValue;
          });
        }
        
        if (status !== '') {
          allData = allData.filter((item: any) => {
            const itemStatus = item?.status?.toLowerCase() || '';
            return itemStatus === status.toLowerCase();
          });
        }
        
        setData(allData);
        setSkelitonLoading(false);
        // Note: totalRows might not be accurate after client-side filtering
        // If API provides total, use it; otherwise calculate from filtered data
        const total = responseData?.total || allData.length;
        setTotalRows(total);
        setFrom(responseData?.from || ((page - 1) * pageSize) + 1);
        setTo(responseData?.to || Math.min(page * pageSize, total));
        setPage(responseData?.current_page || page);
        setTotalPage(responseData?.last_page || Math.ceil(total / pageSize));
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
        nid: item?.kyc?.nid || "-",
        email: item?.email || "-",
        phone: item?.phone || item?.kyc?.phone || "-",
        cnic: item?.kyc?.nid || "-", // Using nid as CNIC equivalent
        pep: item?.kyc?.is_pep ? "Yes" : "No",
        accountBalance: item?.kyc?.expense || "-", // Using expense as balance equivalent
        UpdatedBy: item?.updated_at || "-",
        accountType: item?.country || "-",
        accountStatus: item?.kyc?.status || "-",
        status: item?.status || item?.kyc?.status || "-",
        risk_status: item?.kyc?.risk || "",
        risk: item?.kyc?.risk || "",
        created_at: item?.created_at || item?.kyc?.created_at || "-",
        compliance_status: item?.kyc?.status || "-",
        risk_score: item?.kyc?.risk_score || "-",
        income: item?.kyc?.income || "-",
        expense: item?.kyc?.expense || "-"
      };
    });
  const exportToCSV = async () => {
    try {
      toast.loading("Exporting CSV...", { id: "export-csv" });
      
      // Fetch all data by getting all pages
      let allData: any[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      const pageSizeForExport = 1000; // Large page size to minimize API calls
      
      while (hasMorePages) {
        try {
          const response = await getAllCustomersWithStatuses(currentPage, pageSizeForExport, search);
          if (response?.data?.success && response.data.data?.data && response.data.data.data.length > 0) {
            let pageData = response.data.data.data;
            
            // Apply client-side filtering for PEP and status if needed
            if (pep !== '') {
              const pepValue = pep === '1';
              pageData = pageData.filter((item: any) => {
                const isPep = item?.kyc?.is_pep || false;
                return isPep === pepValue;
              });
            }
            
            if (status !== '') {
              pageData = pageData.filter((item: any) => {
                const itemStatus = item?.status?.toLowerCase() || '';
                return itemStatus === status.toLowerCase();
              });
            }
            
            allData = [...allData, ...pageData];
            const totalPages = response.data.data.last_page || 1;
            hasMorePages = currentPage < totalPages;
            currentPage++;
          } else {
            hasMorePages = false;
          }
        } catch (pageError) {
          console.error(`Error fetching page ${currentPage}:`, pageError);
          hasMorePages = false;
        }
      }
      
      if (allData.length === 0) {
        toast.error("No data to export", { id: "export-csv" });
        return;
      }
      
      // Map data according to table headers in Activity_Loans_Header
      const csvData = allData.map((item: any) => ({
        "Name": item?.name || "-",
        "Application No.": item?.ids_id || "-",
        "ID": item?.kyc?.nid || "-",
        "CIF": item?.ids_id || "-",
        "Email": item?.email || "-",
        "Phone": item?.phone || item?.kyc?.phone || "-",
        "Partner": "-",
        "Product": "-",
        "Is Blocked": "-", // Not available in new API
        "Date": item?.created_at ? new Date(item.created_at).toLocaleDateString() : "-",
        "Status": item?.status || item?.kyc?.status || "-",
        "Comments": "-", // Not available in new API
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
    <div className="service">
      <div className="d-flex justify-content-end col-12 filter-select">
        <Select
          style={{ width: "120px", marginRight: "8px" }}
          placeholder="PEP"
          allowClear
          value={pep || undefined}
          onChange={(value) => setPep(value || '')}
        >
          <Select.Option value="1">Yes</Select.Option>
          <Select.Option value="0">No</Select.Option>
        </Select>

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
          <button className="theme-btn-next" onClick={exportToCSV}>
              Export CSV
          </button>
          {/* <button
            className="invoice-btn"
            onClick={() => {
              exportToPDF();
            }}
          >
            PDF
          </button>
          <button className="invoice-btn">Print</button> */}
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
              <PulseLoading size="lg" />
              <p style={{ fontSize: "16px", color: "var(--color-text-muted)", margin: 0 }}>Loading block codes...</p>
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
                    style={{ backgroundColor: "var(--color-success)", borderColor: "var(--color-success)" }}
                    onClick={handleSelectAll}
                  >
                    ✓ Select All
                  </Button>
                  <Button
                    style={{
                      backgroundColor: "var(--color-warning-gold)",
                      borderColor: "var(--color-warning-gold)",
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
            border: "1px solid var(--color-surface-muted)",
            borderRadius: "6px",
            overflow: "hidden",
            maxHeight: "400px",
            overflowY: "auto"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{
                backgroundColor: "var(--color-surface-ice)",
                position: "sticky",
                top: 0,
                zIndex: 1
              }}>
                <tr>
                  <th style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-surface-muted)",
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
                    borderBottom: "1px solid var(--color-surface-muted)",
                    fontWeight: "600"
                  }}>
                    Block Code
                  </th>
                  <th style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-surface-muted)",
                    fontWeight: "600"
                  }}>
                    Type
                  </th>
                  <th style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    borderBottom: "1px solid var(--color-surface-muted)",
                    fontWeight: "600"
                  }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {blockCodes.map((code) => (
                  <tr key={code.id} style={{
                    backgroundColor: selectedBlockCodes.includes(code.id) ? "var(--color-surface-subtle)" : "white"
                  }}>
                    <td style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--color-surface-muted)"
                    }}>
                      <Checkbox
                        checked={selectedBlockCodes.includes(code.id)}
                        onChange={() => handleCheckboxChange(code.id)}
                      />
                    </td>
                    <td style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--color-surface-muted)",
                      fontWeight: "500"
                    }}>
                      {code.code}
                    </td>
                    <td style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--color-surface-muted)"
                    }}>
                      <span style={{
                        backgroundColor: "var(--color-block-compliance)",
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "500"
                      }}>
                        {code.type}
                      </span>
                    </td>
                    <td style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--color-surface-muted)",
                      textAlign: "center"
                    }}>
                      <button style={{
                        backgroundColor: code.blocked ? "var(--color-error)" : "var(--color-success)",
                        color: "white",
                        border: "none",
                        padding: "6px 16px",
                        borderRadius: "6px",
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
            borderTop: "1px solid var(--color-surface-muted)"
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
              ⊘ Block Selected
            </Button>
            <Button
              type="primary"
              disabled={selectedBlockCodes.length === 0}
              onClick={handleUnblockSelected}
              style={{
                backgroundColor: selectedBlockCodes.length === 0 ? undefined : "var(--color-warning-gold)",
                borderColor: selectedBlockCodes.length === 0 ? undefined : "var(--color-warning-gold)"
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
                borderTop: "1px solid var(--color-surface-muted)"
              }}>
                <Button
                  onClick={handleModalClose}
                  style={{
                    backgroundColor: "var(--color-text-slate)",
                    borderColor: "var(--color-text-slate)",
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
                <p style={{ marginBottom: "16px", color: "var(--color-text-muted)" }}>{selectedUserForStatusChange.name || "-"}</p>
                
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
                      color: "white",
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
                  onChange={(value) => setNewStatus(value)}
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
                borderTop: "1px solid var(--color-surface-muted)"
              }}>
                <Button
                  onClick={handleChangeStatusModalClose}
                  disabled={isChangingStatus}
                  style={{
                    backgroundColor: "var(--color-text-slate)",
                    borderColor: "var(--color-text-slate)",
                    color: "white"
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
                <p style={{ marginBottom: "16px", color: "var(--color-text-muted)" }}>{selectedUserForRiskChange.name || "-"}</p>
                
                <p style={{ marginBottom: "8px", fontWeight: "500" }}>Current Risk:</p>
                <div style={{ marginBottom: "16px" }}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "32px",
                      fontSize: "12px",
                      backgroundColor: 
                        selectedUserForRiskChange.risk_status === "high" ? "var(--color-error)" :
                        selectedUserForRiskChange.risk_status === "medium" ? "var(--color-warning-gold)" :
                        selectedUserForRiskChange.risk_status === "pep" ? "var(--color-pep)" :
                        "var(--color-success)",
                      color: "white",
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
                borderTop: "1px solid var(--color-surface-muted)"
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

export default AllCustomerStatus;
