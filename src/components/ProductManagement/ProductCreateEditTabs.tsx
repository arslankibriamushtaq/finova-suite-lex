import { useRouter } from "../../lib/router"
import { cn } from "../../lib/utils"

export type ProductCreateEditTabId =
  | "basic-info"
  | "commodity-info"
  | "settings"
  | "partner-affiliation"
  | "required-documents"

const TABS: { id: ProductCreateEditTabId; label: string; path: string }[] = [
  { id: "basic-info", label: "Basic Information", path: "/Los/ProductManagement/Create/BasicInfo" },
  // { id: "commodity-info", label: "Commodity Information", path: "/Los/ProductManagement/Create/CommodityInfo" },
  { id: "settings", label: "Settings", path: "/Los/ProductManagement/Create/ProductSettings" },
  { id: "partner-affiliation", label: "Partner Affiliation", path: "/Los/ProductManagement/Create/ProductAffiliation" },
  { id: "required-documents", label: "Required Documents", path: "/Los/ProductManagement/Create/RequiredDocuments" },
]

interface ProductCreateEditTabsProps {
  activeTab: ProductCreateEditTabId
  productId?: string | null
  className?: string
}

export default function ProductCreateEditTabs({
  activeTab,
  productId,
  className,
}: ProductCreateEditTabsProps) {
  const router = useRouter()

  const buildPath = (path: string) => {
    if (productId) {
      const separator = path.includes("?") ? "&" : "?"
      return `${path}${separator}id=${productId}`
    }
    return path
  }

  return (
    <div
      className={cn("border-b border-border bg-muted/30", className)}
      role="tablist"
    >
      <div className="flex gap-0 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => router.push(buildPath(tab.path))}
              className={cn(
                "px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-transparent bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { TABS as PRODUCT_CREATE_EDIT_TABS }
