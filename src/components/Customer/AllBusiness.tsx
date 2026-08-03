import { useEffect, useState } from "react";
import PulseLoading from "../Loader/PulseLoader";
import { Button, DatePicker, Dropdown, Input, Menu, Modal, Checkbox } from "antd";
import TableView from "../TableView/TableView";
import { getRiskBlockCodes } from "../../redux/apis/apisRiskManagement";
import { getCustomerBlocks, assignBlockToCustomer, removeBlockFromCustomer } from "../../redux/apis/apisCrudLms";
import { getBusinessesList } from "../../redux/apis/apisEddReferenceData";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { Users, Lock, ShieldAlert, AlertTriangle } from "lucide-react";
import BeneficiariesDialog from "../../pages/lmsPages/Wallet/BeneficiariesDialog";
import { useDispatch } from "react-redux";
import { authSlice } from "../../redux/apis/apisSlice";
import { formatDate } from "../../App";
import { useNavigate } from "react-router-dom";
import { usePermissions, CUSTOMER_PERMISSIONS } from "../../hooks/useProductPermissions";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import { TONES, statusTone, riskTone } from "../../components/shared/detailKit";

/** Business (SME) list — dedicated admin businesses endpoint, filterable by KYC status. */
const KYC_STATUS_CHIPS = ["PENDING", "ALL", "VERIFIED", "REJECTED"] as const;

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
  const [kycStatus, setKycStatus] = useState<(typeof KYC_STATUS_CHIPS)[number]>("PENDING");

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
      name: t("business.col.businessName"),
      cell: (row: any) => (
        <div className="d-flex flex-column gap-1 py-1">
          <span className="fw-semibold">{row.name}</span>
          <div className="d-flex flex-wrap gap-1">
            {row.isBlocked && (
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", TONES.red)}>
                <Lock className="size-2.5" /> {t("onboarding360.badge.blocked")}
              </span>
            )}
            {row.sanctionsFlag && (
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", TONES.red)}>
                <ShieldAlert className="size-2.5" /> {t("onboarding360.badge.sanctioned")}
              </span>
            )}
            {row.pepFlag && (
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", TONES.amber)}>
                <AlertTriangle className="size-2.5" /> {t("onboarding360.badge.pep")}
              </span>
            )}
          </div>
        </div>
      ),
      sortable: true,
      width: "220px",
    },
    {
      name: t("business.col.registrationNo"),
      selector: (row: any) => row.businessRegistrationNumber || "-",
      sortable: true,
      width: "160px",
    },
    {
      name: t("business.col.type"),
      selector: (row: any) => row.businessTypeCode || "-",
      sortable: true,
      width: "120px",
    },
    {
      name: t("business.col.kycStatus"),
      cell: (row: any) => (
        <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", TONES[statusTone(row.kycStatus)])}>
          {row.kycStatus || "-"}
        </span>
      ),
      sortable: true,
      width: "140px",
    },
    {
      name: t("business.col.riskGrade"),
      cell: (row: any) => (
        <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", TONES[riskTone(row.risk)])}>
          {row.risk || "-"}
        </span>
      ),
      sortable: true,
      width: "120px",
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
      {canViewCustomer && (
        <Menu.Item
          key="manageBlocks"
          icon={<Lock size={14} />}
          onClick={() => handleMenuClick("manageBlocks", row)}
        >
          {t("business.menu.manageBlocks")}
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
      case "manageBlocks":
        handleBlockButtonClick(data);
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
      const response = await getBusinessesList({
        kycStatus: kycStatus === "ALL" ? undefined : kycStatus,
        page: page - 1,
        size: pageSize,
        search,
      });
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
  }, [page, pageSize, search, kycStatus]);

  // Reset to page 1 when search / page size / status chip changes
  useEffect(() => {
    setPage(1);
  }, [search, pageSize, kycStatus]);

  const mappedData =
    (data || []).map((item: any, index: number) => {
      const customer = item?.customer || {};
      return {
        id: item.customerId,
        Sr: (page - 1) * pageSize + index + 1,
        name: item?.businessName || customer?.fullName || "-",
        businessRegistrationNumber: item?.businessRegistrationNumber || "-",
        businessTypeCode: item?.businessTypeCode || "-",
        nationalId: customer?.nationalId || "-",
        cif: customer?.cifNumber || "-",
        email: customer?.email || "-",
        phone: customer?.mobileNumber || "-",
        nationality: customer?.nationality || "-",
        isBlocked: customer?.isBlocked,
        blockCodes: customer?.blockCodes,
        gender: customer?.gender || "-",
        pepFlag: customer?.pepFlag,
        kycStatus: customer?.kycStatus || "-",
        lifecycleStage: customer?.lifecycleStage || "-",
        risk: customer?.riskGrade || "-",
        sanctionsFlag: customer?.sanctionsFlag,
        customerType: customer?.customerType || "-",
        residencyType: customer?.residencyType || "-",
        created_at: customer?.createdAt || "-",
        dateOfBirth: customer?.dateOfBirth || "-",
      };
    });

  const fromValue = totalRows > 0 ? (page - 1) * pageSize + 1 : 0;
  const toValue = Math.min(page * pageSize, totalRows);

  const exportToCSV = async () => {
    try {
      toast.loading(t("allCustomers.toast.exportingCsv"), { id: "export-csv" });

      let allData: any[] = [];

      try {
        const response = await getBusinessesList({
          kycStatus: kycStatus === "ALL" ? undefined : kycStatus,
          page: 0,
          size: 10000,
          search,
        });
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
      const csvData = allData.map((item: any) => {
        const customer = item?.customer || {};
        return {
          "Business Name": item?.businessName || customer?.fullName || "-",
          "Registration No": item?.businessRegistrationNumber || "-",
          "Type": item?.businessTypeCode || "-",
          "CIF": customer?.cifNumber || "-",
          "Email": customer?.email || "-",
          "Phone": customer?.mobileNumber || "-",
          "KYC Status": customer?.kycStatus || "-",
          "Lifecycle Stage": customer?.lifecycleStage || "-",
          "PEP": customer?.pepFlag ? "Yes" : "No",
          "Risk Grade": customer?.riskGrade || "-",
          "Created": customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "-",
        };
      });

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

      {/* KYC status chips */}
      <div className="mb-3 flex flex-wrap gap-2">
        {KYC_STATUS_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setKycStatus(chip)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              kycStatus === chip
                ? TONES[chip === "ALL" ? "sky" : statusTone(chip)]
                : "border-border bg-transparent text-muted-foreground hover:bg-muted/50"
            )}
          >
            {t(`business.chip.${chip.toLowerCase()}`)}
          </button>
        ))}
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
