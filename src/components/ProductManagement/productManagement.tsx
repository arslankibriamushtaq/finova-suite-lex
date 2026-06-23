import { useState, useEffect } from "react"
import { Plus, Package } from "lucide-react"
import { Input } from "antd"
import { SearchOutlined } from "@ant-design/icons"
import { Button } from "../ui/button"
import { useRouter } from "../../lib/router"
import { ProductFilters } from "../../lib/types"
import { useLanguage } from "../../hooks/use-language"
// import { LanguageSwitcher } from "../language-switcher"
import { getAllProducts, deleteProduct } from "../../redux/apis/apisCrudProductManagement"
import toast from "react-hot-toast"
import TableView from "../TableView/TableView"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { ChevronDown, Pencil, Check, X, ShieldCheck, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import useProductPermissions, { useWorkflowActions, WORKFLOW_MODULE_NAMES } from "../../hooks/useProductPermissions"

export default function ProductManagement() {
  const { t, isRTL } = useLanguage()
  const router = useRouter()
  
  // TODO: Re-enable when permission API is implemented
  // const { canAdd, canEdit, canVerify, canCheckerReject, canApprove, canApproverReject } = useProductPermissions()
  // const { verifyItem, rejectAsChecker, approveItem, rejectAsApprover } = useWorkflowActions()
  const canAdd = () => true;
  const canEdit = () => true;
  const canVerify = () => false;
  const canCheckerReject = () => false;
  const canApprove = () => false;
  const canApproverReject = () => false;
  const { verifyItem, rejectAsChecker, approveItem, rejectAsApprover } = useWorkflowActions()

  const [searchTerm, setSearchTerm] = useState("")
  // Filters kept at default ("all") since the filter UI was removed; the API
  // treats "all" as no filter, so the existing call signature still works.
  const [filters] = useState<ProductFilters>({
    status: "all",
    commodity_id: "all",
    country: "all",
    master_category: "all",
    customer_type: "all",
    has_commodity: undefined,
  })
  const [tabData, setTabData] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleEditProduct = (productId: string) => {
    router.push(`/Los/ProductManagement/Create/BasicInfo?id=${productId}`)
  }

  const openDeleteDialog = (productId: string) => {
    setDeleteProductId(productId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return
    try {
      setDeleting(true)
      await deleteProduct(deleteProductId)
      toast.success("Product deleted successfully")
      setDeleteDialogOpen(false)
      setDeleteProductId(null)
      getData()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete product")
    } finally {
      setDeleting(false)
    }
  }
  
  // Static workflow action ID for product management (temporary - will be dynamic later)
  const PRODUCT_WORKFLOW_ACTION_ID = "1766144168137-action";
  
  const handleVerifyProduct = async (row: any) => {
    const result = await verifyItem(WORKFLOW_MODULE_NAMES.PRODUCT, PRODUCT_WORKFLOW_ACTION_ID, { product_id: row.id });
    if (result.success) {
      getData(); // Refresh the data after successful action
    }
  }
  
  const handleCheckerRejectProduct = async (row: any) => {
    const result = await rejectAsChecker(WORKFLOW_MODULE_NAMES.PRODUCT, PRODUCT_WORKFLOW_ACTION_ID, { product_id: row.id });
    if (result.success) {
      getData(); // Refresh the data after successful action
    }
  }
  
  const handleApproveProduct = async (row: any) => {
    const result = await approveItem(WORKFLOW_MODULE_NAMES.PRODUCT, PRODUCT_WORKFLOW_ACTION_ID, { product_id: row.id });
    if (result.success) {
      getData(); // Refresh the data after successful action
    }
  }
  
  const handleApproverRejectProduct = async (row: any) => {
    const result = await rejectAsApprover(WORKFLOW_MODULE_NAMES.PRODUCT, PRODUCT_WORKFLOW_ACTION_ID, { product_id: row.id });
    if (result.success) {
      getData(); // Refresh the data after successful action
    }
  }
  const getData = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getAllProducts(
        page - 1,
        pageSize,
        searchTerm,
        filters.status,
        filters.country,
        filters.master_category
      );
      if (response) {
        console.log("Product API Response:", response.data);
        // Support multiple response shapes:
        // 1. { data: { data: [...], total: ... } }
        // 2. { data: [...], total: ... }
        // 3. Directly an array [...]
        const responseData = response?.data;
        const resultData = responseData?.data;
        
        // Aggressive search for the data array
        const values = Array.isArray(resultData?.data) 
          ? resultData.data 
          : (Array.isArray(resultData) 
            ? resultData 
            : (Array.isArray(responseData) 
              ? responseData 
              : (resultData?.content || resultData?.products || resultData?.items || responseData?.data || responseData?.content || responseData?.products || responseData?.items || [])));
            
        const total = resultData?.total || resultData?.totalElements || responseData?.total || responseData?.totalElements || responseData?.pagination?.totalElements || values?.length || 0;
        
        setTabData(values || []);
        setTotalRows(total);
        setFrom(resultData?.from || responseData?.from || 1);
        setTo(resultData?.to || responseData?.to || values?.length);
        // Calculate total pages locally to ensure it's always correct
        setTotalPage(Math.ceil(total / pageSize) || 1);
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setSkelitonLoading(false);
    }
  };
  useEffect(() => {
    getData();
  }, [page, pageSize, searchTerm, filters]);
  const Table_Headers = [
    {
      name: "Product Name",
      selector: (row: any) => row.productName,
      wrap: true,
      width: "200px",
    },
    {
      name: "Product Arabic Name",
      selector: (row: any) => row.name_ar,
      wrap: true,
      width: "200px",
    },
    // {
    //   name: "Logo",
    //   cell: (row: any) => row.logo ? (
    //     <img
    //       src={row.logo.startsWith("http") ? row.logo : `${import.meta.env.VITE_API_BASE_URL}/product-service${row.logo}`}
    //       alt="logo"
    //       style={{ width: 50 }}
    //     />
    //   ) : <span className="text-muted-foreground">-</span>,
    // },
    {
      name: "Email",
      selector: (row: any) => row.email || "-",
      width: "260px",
    },
    {
      name: "Country",
      selector: (row: any) => row.country || "-",
    },
    {
      name: "Category",
      selector: (row: any) => row.category?.name_en || "-",
      wrap: true,
    },
    {
      name: "Product Type",
      selector: (row: any) => row.productType || "-",
    },
    {
      name: "Status",
      cell: (row: any) => {
        const status = row.status?.toUpperCase?.() || row.status;
        const isActive = status === "ACTIVE" || status === "Active";
        return (
          <div style={{ backgroundColor: isActive ? "var(--chart-2)" : "var(--destructive)", color: "var(--primary-foreground)", padding: "8px 10px", fontSize: "12px", borderRadius: "32px",minWidth:"fit-content" }}>
            {row.status}
          </div>
        );
      },
    },
    {
      name: "Actions",
      cell: (row: any) => {
        const menuItems = menu(row)
        // Only show dropdown if there are menu items
        if (menuItems.length === 0) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <div
            className="relative z-10 inline-block"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Select
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
                {menuItems.map((item) => (
                  <DropdownMenuItem
                    key={item.key}
                    onSelect={(e) => {
                      e.preventDefault();
                      item.onClick?.();
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ];
  const menu = (row: any) => {
    const menuItems: any[] = []
    
    // Edit - requires maker.submit or maker.resubmit permissions
    if (canEdit()) {
      menuItems.push({
        key: "edit",
        icon: <Pencil className="h-4 w-4" />,
        label: "Edit",
        onClick: () => handleEditProduct(row.id),
      })
    }

    // Delete
    menuItems.push({
      key: "delete",
      icon: <Trash2 className="h-4 w-4 text-destructive" />,
      label: "Delete",
      onClick: () => openDeleteDialog(row.id),
    })

    // Verify - requires checker.verify permission
    if (canVerify()) {
      menuItems.push({
        key: "verify",
        icon: <Check className="h-4 w-4" />,
        label: "Verify",
        onClick: () => handleVerifyProduct(row),
      })
    }
    
    // Checker Reject - requires checker.reject permission
    if (canCheckerReject()) {
      menuItems.push({
        key: "checker-reject",
        icon: <X className="h-4 w-4" />,
        label: "Reject",
        onClick: () => handleCheckerRejectProduct(row),
      })
    }
    
    // Approve - requires approver.approve permission
    if (canApprove()) {
      menuItems.push({
        key: "approve",
        icon: <ShieldCheck className="h-4 w-4" />,
        label: "Approve",
        onClick: () => handleApproveProduct(row),
      })
    }
    
    // Approver Reject - requires approver.reject permission
    if (canApproverReject()) {
      menuItems.push({
        key: "approver-reject",
        icon: <X className="h-4 w-4" />,
        label: "Reject",
        onClick: () => handleApproverRejectProduct(row),
      })
    }
    
    return menuItems
  };
  const mappedData =
    tabData &&
    tabData.map((item: any) => {
      return {
        id: item?.id || item?.productId || item?._id,
        productName: item?.nameEn || item?.name_en || item?.name || item?.productName || item?.title || item?.title_en,
        name_ar: item?.nameAr || item?.name_ar || item?.nameArName || item?.productNameAr || item?.title_ar || item?.nameAr,
        productCode: item?.productCode || item?.code || item?.product_code,
        logo: item?.logoUrl || item?.logo || item?.logo_url,
        email: item?.notificationEmail || item?.email || item?.notification_email,
        country: item?.countryNameEn || item?.countryName || item?.country || item?.country_name,
        category: item?.masterCategoryId ? { name_en: item?.masterCategoryNameEn || item?.masterCategoryName } : (item?.category || { name_en: item?.categoryNameEn || item?.category_name }),
        productType: item?.productType || item?.type || item?.categoryType || item?.product_type,
        status: item?.status || item?.productStatus,
        wizardStep: item?.wizardStep,
        actions: item?.actions || [],
      };
    });

  return (
    <div className="service product-management-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <Package className="h-4 w-4" />
          </span>
          {t("products")}
        </h3>
      </div>

      {/* Filters card — search + Add New on one line */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            allowClear
            placeholder={t("products.search")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          {canAdd() && (
            <Button
              className="gap-2"
              style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
              onClick={() => {
                try {
                  localStorage.removeItem("productBasicInfoFormData")
                  sessionStorage.removeItem("productId")
                  sessionStorage.removeItem("productFormData")
                  router.push("/Los/ProductManagement/Categories")
                } catch (error) {
                  console.error("Error clearing storage:", error)
                  router.push("/Los/ProductManagement/Categories")
                }
              }}
            >
              <Plus className="h-4 w-4" />
              {t("products.addNew")}
            </Button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="pro-card">
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          totalPage={totalPage}
          header={Table_Headers}
          data={mappedData}
          isLoading={skelitonLoading}
          from={from}
          to={to}
        />
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="confirm-dialog sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="size-6 text-red-600" />
            </span>
            <DialogTitle className="text-center">Delete Product</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


