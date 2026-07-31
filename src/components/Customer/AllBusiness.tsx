import { useEffect, useState } from "react";
import PulseLoading from "../Loader/PulseLoader";
import { Button, DatePicker, Dropdown, Input, Menu, Modal, Checkbox } from "antd";
import TableView from "../TableView/TableView";
import { getRiskBlockCodes } from "../../redux/apis/apisRiskManagement";
import { getCustomerBlocks, assignBlockToCustomer, removeBlockFromCustomer } from "../../redux/apis/apisCrudLms";
import { getCustomers } from "../../redux/apis/apisEddReferenceData";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { Users } from "lucide-react";
import BeneficiariesDialog from "../../pages/lmsPages/Wallet/BeneficiariesDialog";
import { useDispatch } from "react-redux";
import { authSlice } from "../../redux/apis/apisSlice";
import { formatDate } from "../../App";
import { useNavigate } from "react-router-dom";
import { usePermissions, CUSTOMER_PERMISSIONS } from "../../hooks/useProductPermissions";
import { useTranslation } from "react-i18next";

/**
 * Business list — same dataset/columns as the Customer list, restricted to SME
 * customers via the backend filter below.
 */
const BUSINESS_FILTER = "customerType:eq:SME";

const AllBusiness = () => {
  const { t } = useTranslation("customerManagement");
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
  const canViewCustomer = hasPermission(CUSTOMER_PERMISSIONS.LIST);

  // Block codes modal state
  const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);
  const [selectedBlockCodes, setSelectedBlockCodes] = useState<string[]>([]);
  const [blockCodes, setBlockCodes] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<any>(null);
  const [isLoadingBlockCodes, setIsLoadingBlockCodes] = useState(false);

  // Beneficiaries dialog state
  const [beneficiaryCustomerId, setBeneficiaryCustomerId] = useState<string | null>(null);

  const Activity_Loans_Header = [
    {
      name: t("common:name"),
      cell: (row: any) => row.name,
      sortable: true,
      width: "200px",
    },
    {
      name: t("allCustomers.col.id"),
      selector: (row: any) => row.nationalId || "-",
      sortable: true,
      width: "150px",
    },
    {
      name: t("allCustomers.col.cif"),
      selector: (row: any) => row.cif || "-",
      sortable: true,
      width: "180px",
    },
    {
      name: t("common:email"),
      selector: (row: any) => row.email,
      sortable: true,
    },
    {
      name: t("common:phone"),
      selector: (row: any) => row.phone,
      sortable: true,
      width: "180px",
    },
    {
      name: t("allCustomers.col.nationality"),
      selector: (row: any) => row.nationality || "-",
      sortable: true,
      width: "120px",
    },
    {
      name: t("allCustomers.col.stage"),
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
    {
      name: t("allCustomers.col.created"),
      sortable: true,
      cell: (row: any) => (
        <div>
          {row.created_at && row.created_at !== "-" ? new Date(row.created_at).toLocaleDateString() : "-"}
        </div>
      ),
      width: "120px",
    },
    {
      name: t("allCustomers.col.isBlocked"),
      cell: (row: any) => {
        const blocked = row.isBlocked;
        return blocked
          ? <span onClick={() => handleBlockButtonClick(row)} style={{ padding: "4px 12px", borderRadius: "32px", fontSize: "12px", backgroundColor: "var(--color-error)", color: "var(--primary-foreground)", fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer" }}>{t("allCustomers.status.blocked")}</span>
          : <span onClick={() => handleBlockButtonClick(row)} style={{ padding: "4px 12px", borderRadius: "32px", fontSize: "12px", backgroundColor: "var(--color-success)", color: "var(--primary-foreground)", fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer" }}>{t("allCustomers.status.unblocked")}</span>;
      },
      width: "130px",
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
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            {t("allCustomers.select")} <img src={arrowDown} alt="" />
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
      {canViewCustomer && (
        <Menu.Item
          key="checkBeneficiaries"
          icon={<Users size={14} />}
          onClick={() => handleMenuClick("checkBeneficiaries", row)}
        >
          {t("allCustomers.menu.checkBeneficiaries")}
        </Menu.Item>
      )}
    </Menu>
  );

  const handleMenuClick = (action: string, data: any) => {
    switch (action) {
      case "view":
        navigate(`/LOS/CustomerManagement/BusinessDetails/${data.id}`);
        break;
      case "checkBeneficiaries":
        setBeneficiaryCustomerId(data.id);
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
    if (!currentUserId || selectedBlockCodes.length === 0) { toast.error(t("allCustomers.toast.selectBlockCode")); return; }
    try {
      await assignBlockToCustomer(currentUserId, selectedBlockCodes);
      toast.success(t("allCustomers.toast.blockCodesAssigned", { count: selectedBlockCodes.length }));
      setIsBlockModalVisible(false);
      setSelectedBlockCodes([]);
      setCurrentUserId(null);
      getBusinessList();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("allCustomers.toast.blockFailed"));
    }
  };

  const handleUnblockSelected = async () => {
    if (!currentUserId || selectedBlockCodes.length === 0) {
      toast.error(t("allCustomers.toast.selectBlockCode"));
      return;
    }
    try {
      await removeBlockFromCustomer(currentUserId, selectedBlockCodes);
      toast.success(t("allCustomers.toast.blockCodesRemoved", { count: selectedBlockCodes.length }));
      setSelectedBlockCodes([]);
      setBlockCodes((prev) => prev.map((c) => selectedBlockCodes.includes(c.id) ? { ...c, blocked: false } : c));
      getBusinessList();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("allCustomers.toast.unblockFailed"));
    }
  };

  const handleModalClose = () => {
    setIsBlockModalVisible(false);
    setSelectedBlockCodes([]);
    setCurrentUserId(null);
    setIsLoadingBlockCodes(false);
  };

  const getBusinessList = async () => {
    try {
      setSkelitonLoading(true);

      // Backend uses 0-based indexing for page
      const response = await getCustomers(page - 1, pageSize, search, '', '', BUSINESS_FILTER);
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
    getBusinessList();
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
      toast.loading(t("allCustomers.toast.exportingCsv"), { id: "export-csv" });

      let allData: any[] = [];

      try {
        const response = await getCustomers(0, 10000, search, '', '', BUSINESS_FILTER);
        const list = response?.data?.data || [];
        allData = Array.isArray(list) ? list : [];
      } catch (pageError) {
        console.error("Error fetching businesses for export:", pageError);
      }

      if (allData.length === 0) {
        toast.error(t("allCustomers.toast.noData"), { id: "export-csv" });
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
      link.setAttribute('download', `All_Business_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(t("allCustomers.toast.csvExported", { count: allData.length }), { id: "export-csv" });
    } catch (error: any) {
      console.error("Error exporting CSV:", error);
      toast.error(error?.message || t("allCustomers.toast.exportCsvFailed"), { id: "export-csv" });
    }
  };

  return (
    <div className="service customer-list-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <Users className="h-4 w-4" />
          </span>
          {t("business.title")}
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            allowClear
            placeholder={t("allCustomers.searchPlaceholder")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          <DatePicker
            placeholder={t("common:from")}
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
            placeholder={t("common:to")}
            value={toDate}
            onChange={(date: any) => {
              setToDate(date);
              dispatch(
                authSlice.actions.setToFilter({
                  toFilter: formatDate(date),
                })
              );
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
              {t("allCustomers.exportCsv")}
            </button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="pro-card">
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
      <Modal maskClosable={false} keyboard={false}
        title={<div style={{ fontSize: "20px", fontWeight: "600" }}>{t("allCustomers.blockModal.title")}</div>}
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
              <p style={{ fontSize: "16px", color: "var(--muted-foreground)", margin: 0 }}>{t("allCustomers.blockModal.loading")}</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", padding: "10px 0" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>{t("allCustomers.blockModal.selectionHeading")}</h3>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button type="primary" style={{ backgroundColor: "var(--color-success)", borderColor: "var(--color-success)" }} onClick={handleSelectAll}>{t("allCustomers.blockModal.selectAll")}</Button>
                  <Button style={{ backgroundColor: "var(--color-warning)", borderColor: "var(--color-warning)", color: "var(--primary-foreground)" }} onClick={handleDeselectAll}>{t("allCustomers.blockModal.deselectAll")}</Button>
                </div>
              </div>
              <div style={{ border: "1px solid var(--border)", borderRadius: "2px", overflow: "hidden", maxHeight: "400px", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "var(--muted)", position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid var(--border)", width: "50px" }}>
                        <Checkbox checked={selectedBlockCodes.length === blockCodes.length && blockCodes.length > 0} indeterminate={selectedBlockCodes.length > 0 && selectedBlockCodes.length < blockCodes.length} onChange={(e: any) => e.target.checked ? handleSelectAll() : handleDeselectAll()} />
                      </th>
                      <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid var(--border)", fontWeight: "600" }}>{t("allCustomers.blockModal.colBlockCode")}</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid var(--border)", fontWeight: "600" }}>{t("common:type")}</th>
                      <th style={{ padding: "12px 16px", textAlign: "center", borderBottom: "1px solid var(--border)", fontWeight: "600" }}>{t("allCustomers.blockModal.colAction")}</th>
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
                            {code.blocked ? t("allCustomers.blockModal.blocked") : t("allCustomers.blockModal.activeState")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
                <Button type="primary" danger disabled={selectedBlockCodes.length === 0} onClick={handleBlockSelected} style={{ backgroundColor: selectedBlockCodes.length === 0 ? undefined : "var(--color-error)", borderColor: selectedBlockCodes.length === 0 ? undefined : "var(--color-error)" }}>{t("allCustomers.blockModal.blockSelected")}</Button>
                <Button type="primary" disabled={selectedBlockCodes.length === 0} onClick={handleUnblockSelected} style={{ backgroundColor: selectedBlockCodes.length === 0 ? undefined : "var(--color-warning)", borderColor: selectedBlockCodes.length === 0 ? undefined : "var(--color-warning)" }}>{t("allCustomers.blockModal.unblockSelected")}</Button>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
                <Button onClick={handleModalClose} style={{ backgroundColor: "var(--color-disabled)", borderColor: "var(--color-disabled)", color: "var(--primary-foreground)" }}>{t("common:close")}</Button>
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

export default AllBusiness;
