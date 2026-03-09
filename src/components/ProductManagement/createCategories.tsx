import { useEffect, useState } from "react"
import { ArrowRight, ChevronRight, ArrowLeft } from "lucide-react"
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className={`max-w-8xl mx-auto ${isRTL ? "rtl:text-right" : ""}`}>
            <h1 className="text-3xl font-bold text-foreground mb-2">Select Product Category</h1>
            <p className="text-lg text-muted-foreground">
              Choose the master category and sub-category for your product to configure the appropriate templates
            </p>
          </div>
        </div>
      </div>
 
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-8xl mx-auto space-y-8">
          {/* Step 1: Master Category Selection */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <h2 className="text-2xl font-semibold m-0">Select Master Category</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category:any) => (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedMasterCategory === category.id ? "ring-2 ring-primary bg-primary-50" : ""
                  }`}
                  onClick={() => {
                    setSelectedMasterCategory(category.id)
                    setSelectedSubCategory(null) // Reset sub-category when master changes
                  }}
                >
                  <CardContent className="p-6 text-center">
                    {category.iconUrl && <div className="text-4xl mb-4"><img src={category.iconUrl} alt="" className="h-10 w-10 mx-auto" /></div>}
                    <h3 className="text-lg font-semibold mb-2">{category.nameEn || category.name_en}</h3>
                    {(category.nameAr || category.name_ar) && (
                      <div className="text-sm text-muted-foreground mb-3" dir="rtl">
                        {category.nameAr || category.name_ar}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">{category.descriptionEn || category.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
 
          {/* Step 2: Sub-Category Selection */}
          {selectedMasterCategory && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    selectedSubCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  2
                </div>
                <h2 className="text-2xl font-semibold m-0">Select Sub-Category</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subCategories.map((subCategory: any) => (
                    <Card
                      key={subCategory.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedSubCategory === subCategory.id ? "ring-2 ring-primary bg-primary-50" : ""
                      }`}
                      onClick={() => setSelectedSubCategory(subCategory.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{subCategory.nameEn || subCategory.name_en}</h4>
                            {(subCategory.nameAr || subCategory.name_ar) && (
                              <div className="text-sm text-muted-foreground" dir="rtl">
                                {subCategory.nameAr || subCategory.name_ar}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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