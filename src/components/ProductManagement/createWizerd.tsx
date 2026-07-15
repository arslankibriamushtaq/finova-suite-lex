import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ArrowRight, ArrowLeft, BookTemplate as Template, Wrench, Eye, CheckCircle, Clock, Zap } from "lucide-react"
import { useLanguage } from "../../hooks/use-language"
import { useRouter } from "../../lib/router"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Separator } from "../ui/separator"
import Loader from "../Loader/Loader"
const productTemplates = [
  {
    id: "murabaha-home",
    name: "Home Financing (Murabaha)",
    name_ar: "تمويل المنازل (مرابحة)",
    category: "Murabaha",
    subCategory: "home-financing",
    description: "Complete home financing solution with competitive rates and flexible terms",
    description_ar: "حل تمويل منازل شامل بأسعار تنافسية وشروط مرنة",
    logo: "/abstract-bank-logo.png",
    features: ["Pre-configured application steps", "Standard fee structure", "Document templates", "Partner network"],
    popularity: "Most Popular",
    estimatedSetupTime: "15 minutes",
    preview: {
      overview:
        "Comprehensive home financing solution designed for retail customers seeking property purchases through Sharia-compliant Murabaha contracts.",
      applicationSteps: [
        "Initial Application & KYC",
        "Property Valuation",
        "Credit Assessment",
        "Sharia Compliance Review",
        "Contract Execution",
        "Disbursement",
      ],
      approvalWorkflows: [
        {
          type: "Auto-Approval",
          condition: "Credit Score > 750 & Income > 15,000 SAR",
          action: "Instant approval up to 80% LTV",
        },
        {
          type: "Manual Review",
          condition: "Credit Score 650-750",
          action: "Senior underwriter review within 24 hours",
        },
        {
          type: "Rejection",
          condition: "Credit Score < 650",
          action: "Automatic rejection with improvement suggestions",
        },
      ],
      feeStructure: {
        processingFee: "0.5% of financing amount",
        adminFee: "500 SAR",
        valuationFee: "1,000 SAR",
        earlySettlement: "1% of outstanding amount",
      },
      fundingConfiguration: ["Company Backed", "Investor Funded"],
      documents: ["Salary Certificate", "Bank Statements", "Property Documents", "Identity Documents"],
      creditScoring: {
        minCreditScore: 650,
        maxLTV: "80%",
        maxDBR: "50%",
        minIncome: "10,000 SAR",
      },
    },
  },
  {
    id: "bnpl-ecommerce",
    name: "Buy Now Pay Later (E-commerce)",
    name_ar: "اشتري الآن وادفع لاحقاً (التجارة الإلكترونية)",
    category: "Buy Now Pay Later",
    subCategory: "ecommerce-bnpl",
    description: "Modern BNPL solution for online retailers with instant approval",
    description_ar: "حل حديث للشراء الآن والدفع لاحقاً للمتاجر الإلكترونية مع الموافقة الفورية",
    logo: "/digital-payment.png",
    features: ["API-first integration", "Real-time decisions", "Merchant dashboard", "Risk management"],
    popularity: "Trending",
    estimatedSetupTime: "20 minutes",
    preview: {
      overview:
        "Fast and flexible BNPL solution for e-commerce platforms with real-time decision making and seamless integration.",
      applicationSteps: [
        "Customer Registration",
        "Purchase Initiation",
        "Instant Credit Check",
        "Terms Acceptance",
        "Payment Schedule Setup",
        "Order Confirmation",
      ],
      approvalWorkflows: [
        {
          type: "Auto-Approval",
          condition: "Purchase < 2,000 SAR & Good Payment History",
          action: "Instant approval within 30 seconds",
        },
        { type: "Manual Review", condition: "Purchase 2,000-10,000 SAR", action: "Quick review within 5 minutes" },
        {
          type: "Rejection",
          condition: "Poor payment history or high risk",
          action: "Decline with alternative options",
        },
      ],
      feeStructure: {
        merchantFee: "2.5% per transaction",
        lateFee: "25 SAR per missed payment",
        processingFee: "Free for customers",
        adminFee: "No admin fees",
      },
      fundingConfiguration: ["Company Backed", "Crowd-Funded"],
      documents: ["Identity Verification", "Mobile Number", "Bank Account Details"],
      creditScoring: {
        minCreditScore: 550,
        maxPurchaseAmount: "10,000 SAR",
        maxDBR: "40%",
        minAge: "18 years",
      },
    },
  },
  {
    id: "ijarah-vehicle",
    name: "Vehicle Leasing (Ijarah)",
    name_ar: "تأجير المركبات (إجارة)",
    category: "Ijarah",
    subCategory: "vehicle-leasing",
    description: "Comprehensive vehicle leasing program for individuals and businesses",
    description_ar: "برنامج تأجير مركبات شامل للأفراد والشركات",
    logo: "/auto-financing.png",
    features: ["Fleet management", "Maintenance tracking", "Insurance integration", "End-of-lease options"],
    popularity: "New",
    estimatedSetupTime: "25 minutes",
    preview: {
      overview:
        "Full-service vehicle leasing solution based on Ijarah principles, suitable for both individual and corporate clients.",
      applicationSteps: [
        "Application Submission",
        "Vehicle Selection",
        "Credit & Income Verification",
        "Insurance Arrangement",
        "Contract Signing",
        "Vehicle Delivery",
      ],
      approvalWorkflows: [
        {
          type: "Auto-Approval",
          condition: "Corporate clients with credit rating A+",
          action: "Instant approval for fleet orders",
        },
        {
          type: "Manual Review",
          condition: "Individual applications > 100,000 SAR",
          action: "Detailed assessment within 48 hours",
        },
        { type: "Rejection", condition: "Insufficient income or poor credit", action: "Decline with co-signer option" },
      ],
      feeStructure: {
        securityDeposit: "10% of vehicle value",
        processingFee: "1,000 SAR",
        maintenanceFee: "200 SAR/month",
        insuranceFee: "Included in monthly payment",
      },
      fundingConfiguration: ["Company Backed", "Investor Funded"],
      documents: ["Driving License", "Income Proof", "Insurance Documents", "Vehicle Registration"],
      creditScoring: {
        minCreditScore: 700,
        maxLeaseTerm: "60 months",
        maxDBR: "45%",
        minIncome: "8,000 SAR",
      },
    },
  },
  {
    id: "crowdfunding-realestate",
    name: "Real Estate Crowdfunding",
    name_ar: "التمويل الجماعي العقاري",
    category: "Crowd-Funding",
    subCategory: "real-estate-crowdfunding",
    description: "Investment platform for real estate crowdfunding projects",
    description_ar: "منصة استثمار لمشاريع التمويل الجماعي العقاري",
    logo: "/crowdfunding-investment.png",
    features: ["Investor portal", "Project management", "Returns distribution", "Compliance tools"],
    popularity: "Growing",
    estimatedSetupTime: "30 minutes",
    preview: {
      overview:
        "Sophisticated crowdfunding platform for real estate investments with comprehensive investor management and project tracking.",
      applicationSteps: [
        "Investor Registration",
        "KYC & Suitability Assessment",
        "Project Selection",
        "Investment Commitment",
        "Payment Processing",
        "Investment Confirmation",
      ],
      approvalWorkflows: [
        {
          type: "Auto-Approval",
          condition: "Accredited investors < 50,000 SAR",
          action: "Instant investment approval",
        },
        {
          type: "Manual Review",
          condition: "High-value investments > 50,000 SAR",
          action: "Compliance review within 24 hours",
        },
        {
          type: "Rejection",
          condition: "Non-accredited or high-risk investors",
          action: "Decline with education resources",
        },
      ],
      feeStructure: {
        managementFee: "1.5% annually",
        performanceFee: "15% of profits",
        platformFee: "0.5% of investment",
        exitFee: "1% of withdrawal amount",
      },
      fundingConfiguration: ["Crowd-Funded", "Investor Funded"],
      documents: ["Investor Accreditation", "Financial Statements", "Risk Assessment", "Investment Agreement"],
      creditScoring: {
        minInvestment: "5,000 SAR",
        maxInvestment: "500,000 SAR",
        investorType: "Accredited only",
        riskTolerance: "Medium to High",
      },
    },
  },
  {
    id: "tawarruq-personal",
    name: "Personal Finance (Tawarruq)",
    name_ar: "التمويل الشخصي (تورق)",
    category: "Tawarruq",
    subCategory: "personal-finance",
    description: "Flexible personal financing solution based on Tawarruq principles",
    description_ar: "حل تمويل شخصي مرن قائم على مبادئ التورق",
    logo: "/business-growth-path.png",
    features: ["Quick approval", "Flexible repayment", "Digital onboarding", "Credit scoring"],
    popularity: "Reliable",
    estimatedSetupTime: "18 minutes",
    preview: {
      overview:
        "Streamlined personal financing solution using Tawarruq structure, designed for quick processing and flexible repayment options.",
      applicationSteps: [
        "Online Application",
        "Digital Identity Verification",
        "Income Assessment",
        "Credit Bureau Check",
        "Tawarruq Contract Execution",
        "Fund Disbursement",
      ],
      approvalWorkflows: [
        {
          type: "Auto-Approval",
          condition: "Salary > 5,000 SAR & Credit Score > 700",
          action: "Instant approval up to 200,000 SAR",
        },
        {
          type: "Manual Review",
          condition: "Credit Score 600-700",
          action: "Review within 2 hours during business hours",
        },
        {
          type: "Rejection",
          condition: "Credit Score < 600 or DBR > 50%",
          action: "Decline with financial counseling offer",
        },
      ],
      feeStructure: {
        processingFee: "1% of financing amount",
        adminFee: "300 SAR",
        earlySettlement: "Free after 12 months",
        lateFee: "100 SAR per missed payment",
      },
      fundingConfiguration: ["Company Backed", "Investor Funded"],
      documents: ["Salary Certificate", "Bank Statements (3 months)", "Identity Card", "Employment Letter"],
      creditScoring: {
        minCreditScore: 600,
        maxFinancing: "300,000 SAR",
        maxDBR: "50%",
        minIncome: "3,000 SAR",
      },
    },
  },
]

export default function CreateWizerd() {
  const { isRTL } = useLanguage()
  const { t } = useTranslation("productManagement2")
  const router = useRouter()
  const [selectedCategories, setSelectedCategories] = useState<any>(null)
  const [selectedOption, setSelectedOption] = useState<"template" | "custom" | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<any>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    const categories = sessionStorage.getItem("selectedCategories")
    if (categories) {
      setSelectedCategories(JSON.parse(categories))
    } else {
      router.push("/products/create/categories")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUseTemplate = (templateId: string) => {
    sessionStorage.setItem("selectedTemplate", templateId)
    // router.push(`/products/create/basic-info?template=${templateId}`)
    router.push("/Los/ProductManagement/Create/BasicInfo")
  }

  const handleCreateCustom = () => {
    sessionStorage.removeItem("selectedTemplate")
    router.push("/Los/ProductManagement/Create/BasicInfo")
  }

  const handlePreviewTemplate = (template: any) => {
    setPreviewTemplate(template)
    setIsPreviewOpen(true)
  }

  const handleUsePreviewedTemplate = () => {
    if (previewTemplate) {
      setIsPreviewOpen(false)
      handleUseTemplate(previewTemplate.id)
    }
  }

  const getPopularityBadge = (popularity: string) => {
    const variants = {
      "Most Popular": "bg-green-100 text-green-800 border-green-200",
      Trending: "bg-blue-100 text-blue-800 border-blue-200",
      New: "bg-purple-100 text-purple-800 border-purple-200",
      Growing: "bg-orange-100 text-orange-800 border-orange-200",
      Reliable: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return <Badge className={variants[popularity as keyof typeof variants]}>{popularity}</Badge>
  }

  const getFilteredTemplates = () => {
    if (!selectedCategories) return []

    return productTemplates.filter(
      (template) =>
        template?.subCategory === selectedCategories?.subCategory ||
        template?.category?.toLowerCase().includes(selectedCategories?.masterCategory?.toLowerCase()),
    )
  }

  if (!selectedCategories) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-background pm-create-page">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="px-3 py-3">
          <div className={`max-w-8xl mx-auto ${isRTL ? "rtl:text-end" : ""}`}>
            <h1 className="text-xl font-semibold text-foreground mb-1 flex items-center gap-2.5">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
                <Wrench className="h-4 w-4" />
              </span>
              {t("setupWizard.chooseSetupMethodTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("setupWizard.chooseSetupMethodSubtitle")}
            </p>
            {selectedCategories && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{t("setupWizard.selected")}</span>
                <Badge variant="outline">{selectedCategories.masterCategory}</Badge>
                <span>→</span>
                <Badge variant="outline">{selectedCategories.subCategory}</Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 py-4">
        <div className="max-w-8xl mx-auto space-y-6">
          {/* Setup Method Selection */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-semibold shadow-sm shadow-emerald-500/30">
                1
              </div>
              <h2 className="text-base font-semibold m-0">{t("setupWizard.chooseSetupMethod")}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Use Template Option */}
              {/* <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedOption === "template" ? "ring-2 ring-primary bg-primary/5" : ""
                }`}
                // onClick={() => setSelectedOption("template")}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Template className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Use Template</h3>
                  <p className="text-muted-foreground mb-4">
                    Start with a pre-configured template that includes industry best practices, standard configurations,
                    and proven workflows.
                  </p>
                  <div className="text-sm text-green-600 font-medium">Recommended • Faster Setup</div>
                </CardContent>
              </Card> */}

              {/* Create Custom Option */}
              <Card
                className={`cursor-pointer rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md ${
                  selectedOption === "custom" ? "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-500/[0.06]" : ""
                }`}
                onClick={() => setSelectedOption("custom")}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{t("setupWizard.createCustom")}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t("setupWizard.createCustomDesc")}
                  </p>
                  <div className="text-xs text-emerald-600 font-medium">{t("setupWizard.fullControl")}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Template Selection */}
          {selectedOption === "template" && (
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-semibold shadow-sm shadow-emerald-500/30">
                  2
                </div>
                <h2 className="text-base font-semibold m-0">{t("setupWizard.selectTemplate")}</h2>
              </div>

              {getFilteredTemplates().length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getFilteredTemplates().map((template) => (
                    <Card
                      key={template.id}
                      className={`transition-all duration-200 hover:shadow-lg ${
                        selectedTemplate === template.id ? "ring-2 ring-primary bg-primary/5" : ""
                      }`}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={template.logo || "/placeholder.svg"} alt={template.name} />
                              <AvatarFallback>{template.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                              {template.name_ar && (
                                <div className="text-sm text-muted-foreground" dir="rtl">
                                  {template.name_ar}
                                </div>
                              )}
                            </div>
                          </div>
                          {getPopularityBadge(template.popularity)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="outline">{template.category}</Badge>
                          <span className="text-muted-foreground">~{template.estimatedSetupTime}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">{t("setupWizard.includes")}</div>
                          <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                            {template.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePreviewTemplate(template)
                            }}
                            className="flex-1 gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            {t("setupWizard.preview")}
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTemplate(template.id)
                              handleUseTemplate(template.id)
                            }}
                            className="flex-1 gap-2"
                          >
                            {t("setupWizard.useTemplate")}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-semibold mb-2">{t("setupWizard.noTemplates")}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t("setupWizard.noTemplatesDesc")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button variant="outline" onClick={() => router.push("/Los/ProductManagement/Categories")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("setupWizard.backToCategories")}
            </Button>

            <div className="flex gap-3">
              {selectedOption === "custom" && (
                <Button onClick={handleCreateCustom} className="gap-2">
                  {t("setupWizard.createCustomProduct")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {previewTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={previewTemplate.logo || "/placeholder.svg"} alt={previewTemplate.name} />
                    <AvatarFallback>{previewTemplate.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">{previewTemplate.name}</DialogTitle>
                    {previewTemplate.name_ar && (
                      <div className="text-sm text-muted-foreground" dir="rtl">
                        {previewTemplate.name_ar}
                      </div>
                    )}
                  </div>
                  {getPopularityBadge(previewTemplate.popularity)}
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Overview */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t("setupWizard.overview")}</h3>
                  <p className="text-muted-foreground">{previewTemplate.preview.overview}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>~{previewTemplate.estimatedSetupTime}</span>
                    </div>
                    <Badge variant="outline">{previewTemplate.category}</Badge>
                  </div>
                </div>

                <Separator />

                {/* Application Steps */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t("setupWizard.applicationSteps")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {previewTemplate.preview.applicationSteps.map((step: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Approval Workflows */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t("setupWizard.approvalWorkflows")}</h3>
                  <div className="space-y-3">
                    {previewTemplate.preview.approvalWorkflows.map((workflow: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          {workflow.type === "Auto-Approval" && <Zap className="h-4 w-4 text-green-600" />}
                          {workflow.type === "Manual Review" && <Clock className="h-4 w-4 text-yellow-600" />}
                          {workflow.type === "Rejection" && <CheckCircle className="h-4 w-4 text-red-600" />}
                          <span className="font-medium text-sm">{workflow.type}</span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>
                            <strong>{t("setupWizard.condition")}</strong> {workflow.condition}
                          </div>
                          <div>
                            <strong>{t("setupWizard.action")}</strong> {workflow.action}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Fee Structure */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t("setupWizard.feeStructure")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(previewTemplate.preview.feeStructure).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                        <span className="text-sm font-medium">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Credit Scoring Criteria */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t("setupWizard.creditScoringCriteria")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(previewTemplate.preview.creditScoring).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                        <span className="text-sm font-medium">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Required Documents */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t("setupWizard.requiredDocuments")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {previewTemplate.preview.documents.map((doc: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {doc}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Funding Configuration */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t("setupWizard.fundingConfiguration")}</h3>
                  <div className="flex gap-2">
                    {previewTemplate.preview.fundingConfiguration.map((funding: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {funding}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="flex-1">
                    {t("setupWizard.closePreview")}
                  </Button>
                  <Button onClick={handleUsePreviewedTemplate} className="flex-1 gap-2">
                    {t("setupWizard.useThisTemplate")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
