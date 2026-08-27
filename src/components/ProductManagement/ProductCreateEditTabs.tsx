import { useTranslation } from "react-i18next"
import { useRouter } from "../../lib/router"
import { cn } from "../../lib/utils"

const TAB_LABEL_KEYS: Record<ProductCreateEditTabId, string> = {
  "basic-info": "createTabs.basicInfo",
  "commodity-info": "createTabs.commodityInfo",
  settings: "createTabs.settings",
  "partner-affiliation": "createTabs.partnerAffiliation",
  "required-documents": "createTabs.requiredDocuments",
}

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
  const { t } = useTranslation("productManagement2")

  const buildPath = (path: string) => {
    if (productId) {
      const separator = path.includes("?") ? "&" : "?"
      return `${path}${separator}id=${productId}`
    }
    return path
  }

  const activeIndex = TABS.findIndex((t) => t.id === activeTab)

  return (
    <div
      className={cn("flex items-center gap-1 overflow-x-auto border-b", className)}
      role="tablist"
    >
      {TABS.map((tab, i) => {
        const isActive = activeTab === tab.id
        const isDone = activeIndex > -1 && i < activeIndex
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => router.push(buildPath(tab.path))}
            className={cn(
              "group relative flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "text-red-600"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                isActive
                  ? "bg-red-500 text-white"
                  : isDone
                  ? "bg-red-500/15 text-red-600"
                  : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20"
              )}
            >
              {i + 1}
            </span>
            {t(TAB_LABEL_KEYS[tab.id])}
            {isActive && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-red-500" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export { TABS as PRODUCT_CREATE_EDIT_TABS }
