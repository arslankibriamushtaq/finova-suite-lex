import { useEffect, useState, useRef } from "react";
import PulseLoading from "../Loader/PulseLoader";
import TableView from "../TableView/TableView";
import { getOpportunitiesCustomers, blockUserWithBlockCode, unblockUserWithBlockCode, getBlockCodes, getUserBlocksByUserId, exportOpportunities } from "../../redux/apis/apisCrud";
import { Button, Dropdown, Menu, Modal, Checkbox, DatePicker, Select } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import arrowDown from "../../assets/images/arrow-down.png";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { formatDate } from "../../App";
import { useDispatch } from "react-redux";
import { authSlice } from "../../redux/apis/apisSlice";
import { usePermissions, OPPORTUNITY_PERMISSIONS } from "../../hooks/useProductPermissions";
const Opportunity = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pep, setPep] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Permissions
  const { hasPermission } = usePermissions();
  const canExportOpportunities = hasPermission(OPPORTUNITY_PERMISSIONS.EXPORT);

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
  const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);
  const [selectedBlockCodes, setSelectedBlockCodes] = useState<number[]>([]);
  const [blockCodes, setBlockCodes] = useState(blockCodesData);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoadingBlockCodes, setIsLoadingBlockCodes] = useState(false);

  
  // Handle search input with debouncing
  const handleSearchChange = (value: string) => {
    setSearch(value);
    
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1); // Reset to page 1 when searching
    }, 500); // 500ms debounce delay
  };

  useEffect(() => {
    getAllUsers();
  }, [page, pageSize, debouncedSearch, pep, status, fromDate, toDate]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const getAllUsers = async () => {
    setSkelitonLoading(true);
    try {
      const formattedFromDate = fromDate ? formatDate(fromDate) : null;
      const formattedToDate = toDate ? formatDate(toDate) : null;
      const res = await getOpportunitiesCustomers(page, pageSize, debouncedSearch, pep, status, formattedFromDate, formattedToDate);
      if (res) {
        const data = res?.data?.data?.data;
        setData(data || []);
        setTotalRows(res?.data?.data?.total || 0);
        setFrom(res?.data?.data?.from || 0);
        setTo(res?.data?.data?.to || 0);
        setPage(res?.data?.data?.current_page);
        setTotalPage(res?.data?.data?.last_page);
        setSkelitonLoading(false);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setSkelitonLoading(false);
    }
  };

  // Close popup when clicking outside
  const Activity_Loans_Header = [
    {
      name: "Name",
      selector: (row: { name: any }) => row.name || "-",
      sortable: true,
      width: "400px"
    },
    {
      name: "NID",
      selector: (row: { nid: any }) => row.nid || "-",
      sortable: true,
      width: "200px"
    },
    {
      name: "Email",
      selector: (row: { email: any }) => row.email || "-",
      sortable: true,
      width: "200px"
    },
    {
      name: "Partner",
      selector: (row: { partner: any }) => row.partner || "-",
      sortable: true,
      width: "150px"
    },
    {
      name: "compliance_status",
      selector: (row: { compliance_status: any }) => row.compliance_status || "-",
      sortable: true,
      width: "150px"
    },
    {
      name: "Phone",
      selector: (row: { phone: any }) => row.phone || "-",
      sortable: true,
      width: "200px"
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
            {displayRisk}
          </span>
        );
      },
      sortable: true,
    }, */
    {
      name: "Is Blocked",
      selector: (row: { is_blocked: any }) => row.is_blocked,
      sortable: true,
      cell: (row: any) => (
        <span
          style={{
            padding: "8px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            backgroundColor: row.is_blocked ? "var(--color-error)" : "var(--color-success)",
            color: "white",
            cursor: "default",
            border: "none",
            display: "inline-block",
          }}
        >
          {row.is_blocked ? "Blocked" : "Unblocked"}
        </span>
      ),
      width: "150px"
    },
    {
      name: "Status",
      cell: (row: { status: any }) => {
        const status = row.status || "-";
        const getStatusColor = () => {
          if (status.toLowerCase() === "active") return "var(--color-status-active)";
          if (status.toLowerCase() === "inactive") return "var(--theme-secondary)";
          if (status.toLowerCase() === "pending") return "var(--color-warning-gold)";
          return "var(--color-text-slate)";
        };
        
        return (
          <span
            style={{
              backgroundColor: getStatusColor(),
              color: "var(--primary-foreground)",
              padding: "4px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            {status}
          </span>
        );
      },
      sortable: true,
      width: "150px"
    },
    {
      name: "Created At",
      selector: (row: { created_at: any }) => row.created_at || "-",
      sortable: true,
      width: "200px"
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
    </Menu>
  );

  const handleMenuClick = (key: string, row: any) => {
    if (key === "view") {
      navigate(`/LOS/CustomerManagement/OpportunityDetails/${row.id}`);
    }
  };
  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item?.id,
        name: item?.name || "-",
        nid: item?.nid || "-",
        email: item?.email || "-",
        phone: item?.phone || "-",
        status: item?.status || "-",
        created_at: item?.created_at || "-",
        compliance_status:item?.compliance_status,
        partner:item?.partner,
        is_blocked: item?.is_blocked,
        risk: item?.risk || "-",
      };
    });

  const exportCSV = async () => {
    try {
      toast.loading("Exporting Opportunities...", { id: "export-opportunities" });
      const response = await exportOpportunities();
      
      if (!response || !response.data) {
        throw new Error("Failed to download file");
      }
      
      // Convert server response to a Blob (binary file)
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      
      // Try to extract filename from response header
      const contentDisposition = response.headers['content-disposition'];
      let fileName = "opportunities_export";
      
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
      
      toast.success("Opportunities exported successfully", { id: "export-opportunities" });
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(
        error?.response?.data?.message || 
        error?.message || 
        "Failed to export Opportunities",
        { id: "export-opportunities" }
      );
    }
  };
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
        
        // Refresh the opportunities list to get updated data
        getAllUsers();
        
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
        
        // Refresh the opportunities list to get updated data
        getAllUsers();
        
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
  const [selectedValue, setSelectedValue] = useState("today");
  return (
    <>
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
                onChange={(e) => handleSearchChange(e.target.value)}
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
            {canExportOpportunities && (
              <button className="theme-btn-next" onClick={exportCSV}>
                Export CSV
              </button>
            )} 
          </div>
        </div>
        <TableView
          header={Activity_Loans_Header}
          data={mappedData}
          isLoading={skelitonLoading}
          totalRows={totalRows}

          from={from}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={to}
        />
      </div>

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
                      checked={selectedBlockCodes.length === blockCodes.length && blockCodes.length > 0}
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
                backgroundColor: selectedBlockCodes.length === 0 ? undefined : "var(--color-success)",
                borderColor: selectedBlockCodes.length === 0 ? undefined : "var(--color-success)"
              }}
            >
              ✓ Unblock Selected
            </Button>
            <Button onClick={handleModalClose}>
              Close
            </Button>
          </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Opportunity;
