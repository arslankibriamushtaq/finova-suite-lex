import { useEffect, useState } from "react";
import PulseLoading from "../Loader/PulseLoader";
import { Button, DatePicker, Dropdown, Input, Menu } from "antd";
import TableView from "../TableView/TableView";
import { getRiskBlockCodes } from "../../redux/apis/apisRiskManagement";
import { getCustomerBlocks, assignBlockToCustomer, removeBlockFromCustomer } from "../../redux/apis/apisCrudLms";
import { getBusinessesList } from "../../redux/apis/apisEddReferenceData";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { Users, Lock, ShieldAlert, AlertTriangle, ShieldCheck } from "lucide-react";
import { Tabs } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Button as ShadButton } from "../ui/button";
import { Checkbox as ShadCheckbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import BeneficiariesDialog from "../../pages/lmsPages/Wallet/BeneficiariesDialog";
import { useDispatch } from "react-redux";
import { authSlice } from "../../redux/apis/apisSlice";
import { formatDate } from "../../App";
import { useNavigate } from "react-router-dom";
import { usePermissions, BUSINESS_PERMISSIONS } from "../../hooks/useProductPermissions";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import {
  PermissionDenied,
  DetailTabsList,
  DetailTabsTrigger,
} from "../../components/shared/detailKit";
import { TONES, statusTone, riskTone, humanizeCode } from "../../components/shared/detailKitUtils";

/** Business (SME) list — dedicated admin businesses endpoint, filterable by KYC status. */
const KYC_STATUS_CHIPS = ["ALL", "PENDING", "VERIFIED", "REJECTED"] as const;
type KycStatus = (typeof KYC_STATUS_CHIPS)[number];

/** Statuses the endpoint can filter on — "All" is their union, not a value. */
const FILTERABLE_STATUSES = KYC_STATUS_CHIPS.filter((s) => s !== "ALL");

/** Per-status page size used to build the "All" tab's merged set. */
const ALL_TAB_FETCH_SIZE = 1000;

/**
 * Pull the row array out of the response regardless of envelope shape.
 * The admin list endpoint has been seen returning both a bare array under
 * `data.data` and a Spring `Page` (`{ content, totalElements, totalPages }`),
 * and an unhandled Page object silently rendered as an empty table.
 */
const extractRows = (response: any): any[] => {
  const d = response?.data;
  const candidates = [d?.data, d?.data?.content, d?.content, d?.items, d?.results, d];
  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
};

const extractPagination = (response: any): { totalElements: number; totalPages: number } | null => {
  const d = response?.data;
  const src = d?.pagination || d?.data?.pagination || (Array.isArray(d?.data) ? null : d?.data) || d;
  const totalElements = src?.totalElements ?? src?.total ?? src?.totalCount;
  const totalPages = src?.totalPages ?? src?.pageCount;
  if (totalElements == null && totalPages == null) return null;
  return { totalElements: Number(totalElements ?? 0), totalPages: Number(totalPages ?? 1) };
};

const AllBusiness = () => {
  const { t } = useTranslation("customerManagement");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  /** Server-paginated rows for a single-status tab. */
  const [rows, setRows] = useState<any[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [serverPages, setServerPages] = useState(1);
  /** Full merged set backing the "All" tab (paginated client-side). */
  const [allRows, setAllRows] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const dispatch = useDispatch();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [kycStatus, setKycStatus] = useState<KycStatus>("ALL");
  const [reloadKey, setReloadKey] = useState(0);
  const isAll = kycStatus === "ALL";

  // Permissions
  const { hasPermission } = usePermissions();
  const canListBusiness = hasPermission(BUSINESS_PERMISSIONS.LIST);
  const canExportCustomers = hasPermission(BUSINESS_PERMISSIONS.EXPORT);
  const canViewCustomer = hasPermission(BUSINESS_PERMISSIONS.VIEW);
  const canManageBlocks = hasPermission(BUSINESS_PERMISSIONS.REVIEW);

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
      {canManageBlocks && (
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

  /** Refetch whichever view is active — used after a block/unblock mutation. */
  const getBusinessList = () => setReloadKey((k) => k + 1);

  // "All" tab: the admin endpoint returns nothing unless `kycStatus` is given,
  // so All is the union of every status fetched in parallel, deduped and
  // paginated client-side. Re-runs on search only — paging slices the cache.
  useEffect(() => {
    if (!canListBusiness || !isAll) return;
    let active = true;
    (async () => {
      setSkelitonLoading(true);
      try {
        const settled = await Promise.allSettled(
          FILTERABLE_STATUSES.map((s) =>
            getBusinessesList({ kycStatus: s, page: 0, size: ALL_TAB_FETCH_SIZE, search })
          )
        );
        if (!active) return;
        const seen = new Set<string>();
        const merged: any[] = [];
        settled.forEach((r) => {
          if (r.status !== "fulfilled") return;
          extractRows(r.value).forEach((row: any) => {
            const key = String(row?.customerId ?? row?.id ?? "");
            if (key && seen.has(key)) return;
            if (key) seen.add(key);
            merged.push(row);
          });
        });
        merged.sort(
          (a, b) =>
            new Date(b?.customer?.createdAt || 0).getTime() -
            new Date(a?.customer?.createdAt || 0).getTime()
        );
        setAllRows(merged);
        if (settled.every((r) => r.status === "rejected")) {
          toast.error(t("business.toast.loadFailed"));
        }
      } finally {
        if (active) setSkelitonLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAll, search, canListBusiness, reloadKey]);

  // Single-status tabs keep server-side pagination.
  useEffect(() => {
    if (!canListBusiness || isAll) return;
    let active = true;
    (async () => {
      setSkelitonLoading(true);
      try {
        // Backend uses 0-based indexing for page
        const response = await getBusinessesList({
          kycStatus,
          page: page - 1,
          size: pageSize,
          search,
        });
        if (!active) return;
        const list = extractRows(response);
        setRows(list);
        const pagination = extractPagination(response);
        setServerTotal(pagination ? pagination.totalElements : list.length);
        setServerPages(pagination ? pagination.totalPages : Math.ceil(list.length / pageSize) || 1);
      } catch (error: any) {
        if (active) toast.error(error?.message || t("business.toast.loadFailed"));
      } finally {
        if (active) setSkelitonLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAll, kycStatus, search, page, pageSize, canListBusiness, reloadKey]);

  // Reset to page 1 when search / page size changes. The status tab resets
  // `page` in its own handler so both land in one render — resetting it here
  // too would fire a second fetch against the previous page.
  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const handleKycStatusChange = (next: string) => {
    setKycStatus(next as KycStatus);
    setPage(1);
  };

  const sourceRows = isAll ? allRows.slice((page - 1) * pageSize, page * pageSize) : rows;
  const totalRows = isAll ? allRows.length : serverTotal;
  const totalPage = isAll ? Math.ceil(allRows.length / pageSize) || 1 : serverPages;

  const mappedData =
    (sourceRows || []).map((item: any, index: number) => {
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
        if (isAll) {
          // Mirror the All tab: union of every status, deduped.
          const settled = await Promise.allSettled(
            FILTERABLE_STATUSES.map((s) =>
              getBusinessesList({ kycStatus: s, page: 0, size: 10000, search })
            )
          );
          const seen = new Set<string>();
          settled.forEach((r) => {
            if (r.status !== "fulfilled") return;
            extractRows(r.value).forEach((row: any) => {
              const key = String(row?.customerId ?? row?.id ?? "");
              if (key && seen.has(key)) return;
              if (key) seen.add(key);
              allData.push(row);
            });
          });
        } else {
          const response = await getBusinessesList({
            kycStatus,
            page: 0,
            size: 10000,
            search,
          });
          allData = extractRows(response);
        }
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
          [t("business.col.businessName")]: item?.businessName || customer?.fullName || "-",
          [t("business.col.registrationNo")]: item?.businessRegistrationNumber || "-",
          [t("business.col.type")]: item?.businessTypeCode || "-",
          [t("allCustomers.col.cif")]: customer?.cifNumber || "-",
          [t("common:email")]: customer?.email || "-",
          [t("common:phone")]: customer?.mobileNumber || "-",
          [t("business.col.kycStatus")]: customer?.kycStatus || "-",
          [t("businessDetail.field.lifecycleStage")]: customer?.lifecycleStage || "-",
          [t("onboarding360.badge.pep")]: customer?.pepFlag ? t("common:yes") : t("common:no"),
          [t("business.col.riskGrade")]: customer?.riskGrade || "-",
          [t("allCustomers.col.created")]: customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "-",
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

      {!canListBusiness ? (
        <div className="pro-card">
          <PermissionDenied message={t("permission.businessDenied")} />
        </div>
      ) : (
      <>
      {/* KYC status tabs — same underline bar as the Business detail page. */}
      <Tabs value={kycStatus} onValueChange={handleKycStatusChange} className="mb-3">
        <DetailTabsList>
          {KYC_STATUS_CHIPS.map((chip) => (
            <DetailTabsTrigger key={chip} value={chip}>
              {t(`business.chip.${chip.toLowerCase()}`)}
            </DetailTabsTrigger>
          ))}
        </DetailTabsList>
      </Tabs>

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
      </>
      )}

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

      {/* Block Codes Management — shadcn Dialog (migration target); soft tone
          badges instead of saturated blocks, and the state column is a status
          chip rather than a button that never did anything. */}
      <Dialog
        open={isBlockModalVisible}
        onOpenChange={(open: boolean) => {
          if (!open) handleModalClose();
        }}
      >
        <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 ring-1 ring-red-500/15">
                <Lock className="size-4" />
              </span>
              {t("allCustomers.blockModal.title")}
            </DialogTitle>
          </DialogHeader>

          {isLoadingBlockCodes ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-4 px-5 py-10">
              <PulseLoading size="lg" />
              <p className="m-0 text-sm text-muted-foreground">{t("allCustomers.blockModal.loading")}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="m-0 text-sm font-semibold text-foreground">
                    {t("allCustomers.blockModal.selectionHeading")}
                  </h3>
                  {selectedBlockCodes.length > 0 && (
                    <Badge variant="outline" className={cn("border text-[11px] font-medium", TONES.sky)}>
                      {t("allCustomers.blockModal.selectedCount", { count: selectedBlockCodes.length })}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <ShadButton variant="outline" size="sm" className="h-8 text-xs" onClick={handleSelectAll}>
                    {t("allCustomers.blockModal.selectAll")}
                  </ShadButton>
                  <ShadButton
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={selectedBlockCodes.length === 0}
                    onClick={handleDeselectAll}
                  >
                    {t("allCustomers.blockModal.deselectAll")}
                  </ShadButton>
                </div>
              </div>

              <div className="max-h-[45vh] overflow-y-auto border-y">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/70 backdrop-blur">
                    <tr className="border-b text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="w-12 px-4 py-2.5 text-start font-medium">
                        <ShadCheckbox
                          checked={
                            selectedBlockCodes.length > 0 && selectedBlockCodes.length === blockCodes.length
                              ? true
                              : selectedBlockCodes.length > 0
                              ? "indeterminate"
                              : false
                          }
                          onCheckedChange={(checked: boolean | "indeterminate") =>
                            checked === true ? handleSelectAll() : handleDeselectAll()
                          }
                          aria-label={t("allCustomers.blockModal.selectAll")}
                        />
                      </th>
                      <th className="px-4 py-2.5 text-start font-medium">{t("allCustomers.blockModal.colBlockCode")}</th>
                      <th className="px-4 py-2.5 text-start font-medium">{t("common:type")}</th>
                      <th className="px-4 py-2.5 text-end font-medium">{t("common:status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockCodes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                          {t("allCustomers.blockModal.noCodes")}
                        </td>
                      </tr>
                    ) : (
                      blockCodes.map((code) => {
                        const checked = selectedBlockCodes.includes(code.id);
                        return (
                          <tr
                            key={code.id}
                            onClick={() => handleCheckboxChange(code.id)}
                            className={cn(
                              "cursor-pointer border-b border-border/60 transition-colors last:border-b-0",
                              checked ? "bg-red-500/[0.06]" : "hover:bg-muted/40"
                            )}
                          >
                            <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                              <ShadCheckbox
                                checked={checked}
                                onCheckedChange={() => handleCheckboxChange(code.id)}
                                aria-label={code.code}
                              />
                            </td>
                            <td className="px-4 py-2.5 font-medium text-foreground">{code.code}</td>
                            <td className="px-4 py-2.5">
                              <Badge variant="outline" className={cn("border text-[11px] font-medium", TONES.sky)}>
                                {humanizeCode(code.type)}
                              </Badge>
                            </td>
                            <td className="px-4 py-2.5 text-end">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "border text-[11px] font-medium",
                                  code.blocked ? TONES.red : TONES.emerald
                                )}
                              >
                                {code.blocked
                                  ? t("allCustomers.blockModal.blocked")
                                  : t("allCustomers.blockModal.activeState")}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <DialogFooter className="flex-row items-center justify-between gap-2 px-5 py-3 sm:justify-between">
                <div className="flex items-center gap-2">
                  <ShadButton
                    size="sm"
                    disabled={selectedBlockCodes.length === 0}
                    onClick={handleBlockSelected}
                    className="h-8 gap-1.5 bg-red-600 text-xs text-white hover:bg-red-700 focus-visible:ring-red-500/40"
                  >
                    <Lock className="size-3.5" />
                    {t("allCustomers.blockModal.blockSelected")}
                  </ShadButton>
                  <ShadButton
                    variant="outline"
                    size="sm"
                    disabled={selectedBlockCodes.length === 0}
                    onClick={handleUnblockSelected}
                    className="h-8 gap-1.5 border-red-500/40 text-xs text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400"
                  >
                    <ShieldCheck className="size-3.5" />
                    {t("allCustomers.blockModal.unblockSelected")}
                  </ShadButton>
                </div>
                <ShadButton variant="ghost" size="sm" className="h-8 text-xs" onClick={handleModalClose}>
                  {t("common:close")}
                </ShadButton>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Beneficiaries (IBAN + IBFT) */}
      <BeneficiariesDialog
        customerId={beneficiaryCustomerId}
        onClose={() => setBeneficiaryCustomerId(null)}
      />

    </div>
  );
};

export default AllBusiness;
