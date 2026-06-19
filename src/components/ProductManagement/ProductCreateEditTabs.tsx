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
      className={cn(
        "product-tabs-bar",
        className
      )}
      role="tablist"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--surface-border)",
        borderRadius: 2,
        padding: 6,
        boxShadow: "var(--surface-elevation-1)",
        display: "flex",
        gap: 4,
        overflowX: "auto",
      }}
    >
      <style>{`
        .product-tabs-bar .product-tab-inactive:hover {
          background: var(--surface-card-hover) !important;
          color: var(--foreground) !important;
          border-color: var(--surface-border) !important;
        }
      `}</style>
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
              "px-5 py-2 text-sm font-semibold whitespace-nowrap transition-all rounded-lg",
              isActive
                ? "product-tab-active"
                : "product-tab-inactive"
            )}
            style={
              isActive
                ? {
                    background:
                      "linear-gradient(135deg, #1f2940 0%, #0f172a 100%)",
                    color: "#ffffff",
                    boxShadow:
                      "0 4px 12px rgba(15, 23, 42, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
                    border: "1px solid #0f172a",
                  }
                : {
                    background: "transparent",
                    color: "var(--muted-foreground)",
                    border: "1px solid transparent",
                  }
            }
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export { TABS as PRODUCT_CREATE_EDIT_TABS }
