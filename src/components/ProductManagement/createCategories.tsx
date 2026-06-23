import { useEffect, useState } from "react"
import { ArrowRight, ChevronRight, ArrowLeft, FolderTree, Check } from "lucide-react"
import { useRouter } from "../../lib/router"
import { useLanguage } from "../../hooks/use-language"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { getAllCategories, getSubCategories } from "../../redux/apis/apisCrudProductManagement"
 
// const masterCategories = [
//   {
//     id: "murabaha",
//     name: "Murabaha",
//     name_ar: "مرابحة",
//     description: "Cost-plus financing for asset purchases",
//     description_ar: "تمويل بالتكلفة مضافاً إليها الربح لشراء الأصول",
//     icon: "🏠",
//     subCategories: [
//       { id: "home-financing", name: "Home Financing", name_ar: "تمويل المنازل" },
//       { id: "vehicle-financing", name: "Vehicle Financing", name_ar: "تمويل المركبات" },
//       { id: "inventory-financing", name: "Inventory Financing", name_ar: "تمويل المخزون" },
//       { id: "equipment-financing", name: "Equipment Financing", name_ar: "تمويل المعدات" },
//     ],
//   },
//   {
//     id: "ijarah",
//     name: "Ijarah",
//     name_ar: "إجارة",
//     description: "Islamic leasing and rental financing",
//     description_ar: "التمويل الإسلامي للإيجار والتأجير",
//     icon: "🚗",
//     subCategories: [
//       { id: "property-leasing", name: "Property Leasing", name_ar: "تأجير العقارات" },
//       { id: "vehicle-leasing", name: "Vehicle Leasing", name_ar: "تأجير المركبات" },
//       { id: "equipment-leasing", name: "Equipment Leasing", name_ar: "تأجير المعدات" },
//     ],
//   },
//   {
//     id: "tawarruq",
//     name: "Tawarruq",
//     name_ar: "تورق",
//     description: "Monetization-based personal financing",
//     description_ar: "التمويل الشخصي القائم على التورق",
//     icon: "💰",
//     subCategories: [
//       {
//         id: "personal-financing",
//         name: "Personal Financing (Commodity is involved in tawarruq)",
//         name_ar: "التمويل الشخصي (السلعة متضمنة في التورق)",
//       },
//       { id: "business-financing", name: "Business Financing", name_ar: "تمويل الأعمال" },
//       { id: "trade-financing", name: "Trade Financing", name_ar: "تمويل التجارة" },
//       { id: "investment-financing", name: "Investment Financing", name_ar: "تمويل الاستثمار" },
//       { id: "cash-management", name: "Cash Management", name_ar: "إدارة النقد" },
//       { id: "microfinance", name: "Microfinance", name_ar: "التمويل الأصغر" },
//       { id: "quick-cash", name: "Quick cash", name_ar: "النقد السريع" },
//       { id: "invoice-factoring", name: "Invoice factoring", name_ar: "تحصيل الفواتير" },
//       { id: "invoice-discounting", name: "Invoice discounting", name_ar: "خصم الفواتير" },
//       { id: "reverse-factoring", name: "reverse factoring", name_ar: "التحصيل العكسي" },
//     ],
//   },
//   {
//     id: "bnpl",
//     name: "Buy Now Pay Later",
//     name_ar: "اشتري الآن وادفع لاحقاً",
//     description: "Deferred payment solutions for consumers",
//     description_ar: "حلول الدفع المؤجل للمستهلكين",
//     icon: "💳",
//     subCategories: [
//       { id: "ecommerce-bnpl", name: "E-commerce BNPL", name_ar: "الشراء الآجل للتجارة الإلكترونية" },
//       { id: "retail-bnpl", name: "Retail BNPL", name_ar: "الشراء الآجل للتجزئة" },
//       { id: "healthcare-bnpl", name: "Healthcare BNPL", name_ar: "الشراء الآجل للرعاية الصحية" },
//       { id: "education-bnpl", name: "Education BNPL", name_ar: "الشراء الآجل للتعليم" },
//     ],
//   },
//   {
//     id: "crowdfunding",
//     name: "Crowd Funding",
//     name_ar: "التمويل الجماعي",
//     description: "Community-based investment platforms",
//     description_ar: "منصات الاستثمار المجتمعي",
//     icon: "👥",
//     subCategories: [
//       { id: "real-estate-crowdfunding", name: "Real Estate Crowdfunding", name_ar: "التمويل الجماعي العقاري" },
//       { id: "business-crowdfunding", name: "Business Crowdfunding", name_ar: "التمويل الجماعي للأعمال" },
//       { id: "project-crowdfunding", name: "Project Crowdfunding", name_ar: "التمويل الجماعي للمشاريع" },
//       { id: "social-crowdfunding", name: "Social Crowdfunding", name_ar: "التمويل الجماعي الاجتماعي" },
//     ],
//   },
// ]
 
export default function CreateCategories() {
  const { t, isRTL } = useLanguage()
  const router = useRouter()
  const [selectedMasterCategory, setSelectedMasterCategory] = useState<string | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<any>([])
  const [subCategories, setSubCategories] = useState<any>([])
  const handleCategorySelection = () => {
    if (selectedMasterCategory && selectedSubCategory) {
      // Save category selection to session storage
      sessionStorage.setItem(
        "selectedCategories",
        JSON.stringify({
          masterCategory: selectedMasterCategory,
          subCategory: selectedSubCategory,
        }),
      )
      // Redirect to wizard page where user chooses template vs custom
      router.push("/Los/ProductManagement/Wizerd")
    }
  }
 useEffect(() => {
  const getCategories = async () => {
    const response = await getAllCategories()
    if (response) {
      // Support both { data: [...] } and { data: { data: [...] } } shapes
      const responseData = response?.data?.data;
      const items = Array.isArray(responseData) ? responseData : (responseData?.data || []);
      setCategories(items)
    }
  }
  getCategories()
 }, [])

 // Fetch sub-categories when a master category is selected
 useEffect(() => {
  if (!selectedMasterCategory) {
    setSubCategories([])
    return
  }
  const fetchSubCategories = async () => {
    try {
      const response = await getSubCategories(selectedMasterCategory)
      if (response) {
        const responseData = response?.data?.data;
        const items = Array.isArray(responseData) ? responseData : (responseData?.data || []);
        setSubCategories(items)
      }
    } catch {
      setSubCategories([])
    }
  }
  fetchSubCategories()
 }, [selectedMasterCategory])

  return (
    <div className="min-h-screen bg-background pm-create-page">
      <div className="px-3 py-3">
        {/* Page header — same style as other pages' page name */}
        <div className="mb-3 pb-2 border-bottom">
          <h1 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
            <span className="pro-head-badge">
              <FolderTree className="h-4 w-4" />
            </span>
            Select Product Category
          </h1>
        </div>

        <div className="space-y-6">
          {/* Step 1: Master Category Selection */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-semibold shadow-sm shadow-emerald-500/30">
                1
              </div>
              <h2 className="text-base font-semibold m-0">Select Master Category</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category:any) => {
                const isSelected = selectedMasterCategory === category.id;
                const nameEn = category.nameEn || category.name_en || "";
                return (
                <Card
                  key={category.id}
                  className={`group relative cursor-pointer gap-0 overflow-hidden rounded-lg border py-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md ${
                    isSelected ? "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-500/[0.06]" : ""
                  }`}
                  onClick={() => {
                    setSelectedMasterCategory(category.id)
                    setSelectedSubCategory(null) // Reset sub-category when master changes
                  }}
                >
                  {isSelected && (
                    <span className="absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                  <CardContent className="flex items-start gap-3 p-3.5">
                    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-emerald-500/10 text-sm font-semibold text-emerald-600 ring-1 ring-emerald-500/15">
                      {category.iconUrl ? (
                        <img src={category.iconUrl} alt="" className="h-5 w-5 object-contain" />
                      ) : (
                        (nameEn.charAt(0) || "?").toUpperCase()
                      )}
                    </span>
                    <div className="min-w-0 flex-1 pr-4">
                      <h3 className="font-semibold leading-tight">{nameEn}</h3>
                      {(category.nameAr || category.name_ar) && (
                        <div className="text-xs text-muted-foreground" dir="rtl">
                          {category.nameAr || category.name_ar}
                        </div>
                      )}
                      {(category.descriptionEn || category.description) && (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {category.descriptionEn || category.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </div>
 
          {/* Step 2: Sub-Category Selection */}
          {selectedMasterCategory && (
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    selectedSubCategory ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30" : "bg-muted text-muted-foreground"
                  }`}
                >
                  2
                </div>
                <h2 className="text-base font-semibold m-0">Select Sub-Category</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subCategories.map((subCategory: any) => {
                  const isSelected = selectedSubCategory === subCategory.id;
                  return (
                    <Card
                      key={subCategory.id}
                      className={`cursor-pointer gap-0 rounded-lg border py-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md ${
                        isSelected ? "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-500/[0.06]" : ""
                      }`}
                      onClick={() => setSelectedSubCategory(subCategory.id)}
                    >
                      <CardContent className="p-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-medium">{subCategory.nameEn || subCategory.name_en}</h4>
                            {(subCategory.nameAr || subCategory.name_ar) && (
                              <div className="text-sm text-muted-foreground" dir="rtl">
                                {subCategory.nameAr || subCategory.name_ar}
                              </div>
                            )}
                          </div>
                          {isSelected ? (
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </span>
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
 
          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button variant="outline" onClick={() => router.push("/Los/ProductManagement")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
 
            <div className="flex gap-3">
              {selectedMasterCategory && selectedSubCategory && (
                <Button onClick={handleCategorySelection} className="gap-2">
                  Continue to Setup Options
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}