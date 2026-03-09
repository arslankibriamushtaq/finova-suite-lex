import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Filter,
  // Download,

} from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useRouter } from "../../lib/router"
import { ProductFilters } from "../../lib/types"
import { customerTypes, mockCommodities, productCategories } from "../../lib/mock-data"
import { useLanguage } from "../../hooks/use-language"
// import { LanguageSwitcher } from "../language-switcher"
import { getAllProducts } from "../../redux/apis/apisCrudProductManagement"
import toast from "react-hot-toast"
import TableView from "../TableView/TableView"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { ChevronDown, Pencil, Check, X, ShieldCheck } from "lucide-react"
import { getCountries } from "../../redux/apis/apisCrud"
import useProductPermissions, { useWorkflowActions, WORKFLOW_MODULE_NAMES } from "../../hooks/useProductPermissions"

export default function ProductManagement() {
  const { t, isRTL } = useLanguage()
  const router = useRouter()
  
  // TODO: Re-enable when permission API is implemented
  // const { canAdd, canEdit, canVerify, canCheckerReject, canApprove, canApproverReject } = useProductPermissions()
  // const { verifyItem, rejectAsChecker, approveItem, rejectAsApprover } = useWorkflowActions()
  const canAdd = () => true;
  const canEdit = () => true;
  const canVerify = () => true;
  const canCheckerReject = () => true;
  const canApprove = () => true;
  const canApproverReject = () => true;
  const { verifyItem, rejectAsChecker, approveItem, rejectAsApprover } = useWorkflowActions()

  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<ProductFilters>({
    status: "all",
    commodity_id: "all",
    country: "all",
    master_category: "all",
    customer_type: "all",
    has_commodity: undefined,
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [tabData, setTabData] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
 const [countries, setCountries] = useState<any>([])

  const handleEditProduct = (productId: string) => {
    router.push(`/Los/ProductManagement/Create/BasicInfo?id=${productId}`)
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
        page,
        pageSize,
        // searchValue
      );
      if (response) {
        // Support both { data: { data: [...], total, ... } } and { data: [...] } response shapes
        const responseData = response?.data?.data;
        const values = Array.isArray(responseData) ? responseData : (responseData?.data || responseData?.content || []);
        setTabData(values || []);
        setTotalRows(responseData?.total || responseData?.totalElements || values?.length || 0);
        setFrom(responseData?.from || 1);
        setTo(responseData?.to || values?.length);
        setTotalPage(responseData?.last_page || responseData?.totalPages || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setSkelitonLoading(false);
    }
  };
  const getCountryList = async () => {
    const response = await getCountries(2,100)
    if (response?.data?.success) {
      setCountries(response?.data?.data?.data)
    }
  }
  useEffect(() => {
    getData();
  }, [page, pageSize]);
  useEffect(() => {
    getCountryList()
  }, [])
  const Table_Headers = [
    {
      name: "Product Name",
      selector: (row: any) => row.productName,
    },
    // {
    //   name: "Product Arabic Name",
    //   selector: (row: any) => row.name_ar,
    // },
    {
      name: "Logo",
      cell: (row: any) => row.logo ? (
        <img
          src={row.logo.startsWith("http") ? row.logo : `${import.meta.env.VITE_API_BASE_URL}/product-service${row.logo}`}
          alt="logo"
          style={{ width: 50 }}
        />
      ) : <span className="text-muted-foreground">-</span>,
    },
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
    },
    {
      name: "Product Type",
      selector: (row: any) => row.productType?.name || "-",
    },
    {
      name: "Status",
      cell: (row: any) => {
        const status = row.status?.toUpperCase?.() || row.status;
        const isActive = status === "ACTIVE" || status === "Active";
        return (
          <div style={{ backgroundColor: isActive ? "var(--chart-2)" : "var(--destructive)", color: "var(--primary-foreground)", padding: "8px 10px", fontSize: "12px", borderRadius: "32px" }}>
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
        id: item?.id,
        productName: item?.nameEn || item?.name_en,
        name_ar: item?.nameAr || item?.name_ar,
        productCode: item?.productCode,
        logo: item?.logoUrl || item?.logo,
        email: item?.notificationEmail || item?.email,
        country: item?.country,
        category: item?.masterCategoryId ? { name_en: item?.productType } : item?.category,
        productType: item?.productType || item?.type,
        status: item?.status,
        wizardStep: item?.wizardStep,
        actions: item?.actions || [],
      };
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className={`flex items-center justify-between ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
            <div className={isRTL ? "rtl:text-right" : ""}>
              <h1 className="text-2xl font-semibold text-foreground">{t("products")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("products.subtitle")}</p>
            </div>
            <div className={`flex items-center gap-3 ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
              {/* <LanguageSwitcher />
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                {t("products.export")}
              </Button> */}
              {canAdd() && (
                <Button className="gap-2" onClick={() => {
                  // Clear all product-related storage before navigating to create new product
                  try {
                    // Clear localStorage
                    localStorage.removeItem("productBasicInfoFormData")
                    
                    // Clear sessionStorage items related to product creation
                    sessionStorage.removeItem("productId")
                    sessionStorage.removeItem("productFormData")
                    
                    // Navigate to create product page
                    router.push("/Los/ProductManagement/Categories")
                  } catch (error) {
                    console.error("Error clearing storage:", error)
                    // Still navigate even if clearing fails
                    router.push("/Los/ProductManagement/Categories")
                  }
                }}>
                  <Plus className="h-4 w-4" />
                  {t("products.addNew")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-6">
        <Card className="mb-6">
          <CardContent>
            <div className="flex flex-col gap-4">
              <div
                className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${isRTL ? "rtl:flex-row-reverse" : ""}`}
              >
                <div className={`flex flex-1 gap-4 flex-wrap ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
                  <div className="relative flex-1 min-w-64">
                    <Search
                      className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`}
                    />
                    <Input
                      placeholder={t("products.search")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={isRTL ? "pr-9" : "pl-9"}
                      dir={isRTL ? "rtl" : "ltr"}
                    />
                  </div>

                  <Select
                    value={filters.status}
                    onValueChange={(value: any) => setFilters((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder={t("table.status")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">{t("status.active")}</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">{t("status.draft")}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.country}
                    onValueChange={(value: string) => setFilters((prev: any) => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t("table.country")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map((country: any) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.country_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.master_category}
                    onValueChange={(value: string) => setFilters((prev: any) => ({ ...prev, master_category: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t("table.productType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {productCategories.map((category: any) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <Filter className="h-4 w-4" />
                    {t("products.filters")}
                  </Button>
                </div>
              </div>

              {showAdvancedFilters && (
                <div className={`flex flex-wrap gap-4 pt-4 border-t ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
                  <Select
                    value={filters.customer_type}
                    onValueChange={(value: any) => setFilters((prev: any) => ({ ...prev, customer_type: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Customer Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customer Types</SelectItem>
                      {customerTypes.map((type: any) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.commodity_id}
                    onValueChange={(value: any) => setFilters((prev: any) => ({ ...prev, commodity_id: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Commodity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Commodities</SelectItem>
                      {mockCommodities.map((commodity: any) => (
                        <SelectItem key={commodity.id} value={commodity.id}>
                          {commodity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.has_commodity?.toString() || "all"}
                    onValueChange={(value: any) =>
                      setFilters((prev: any) => ({
                        ...prev,
                        has_commodity: value === "all" ? undefined : value === "true",
                      }))
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Has Commodity?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="true">With Commodity</SelectItem>
                      <SelectItem value="false">Without Commodity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="rounded-md border col-12">
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



        {/* </Card> */}
      </div>
    </div>
  )
}


