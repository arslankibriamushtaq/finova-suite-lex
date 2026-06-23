"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "../../lib/router"
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Plus,
  Trash2,
  Package,
  DollarSign,
  Building2,
  Users,
  Settings,
  RefreshCw,
  X,
} from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import ProductCreateEditTabs from "./ProductCreateEditTabs"
import { TooltipProvider } from "../ui/tooltip"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { useLanguage } from "../../hooks/use-language"
import toast from "react-hot-toast"
interface CommodityItem {
  id: string
  name: string
  name_ar: string
  category: string
  unit: string
  min_quantity: number
  max_quantity: number
  unit_price: number
  description: string
  specifications: Record<string, string>
}

interface FundingSettings {
  funding_types: ("company_backed" | "crowd_funded" | "investor_funded")[] // Allow multiple funding types
  portfolio_ids?: string[] // Allow multiple portfolio selection
  investment_settings?: {
    min_investment: number
    max_investment: number
    expected_return: number
    investment_period: number
    risk_level: "low" | "medium" | "high"
    investor_types: string[]
  }
}

interface CommodityFormData {
  commodity_source: "company_inventory" | "broker"
  commodities: CommodityItem[]
  funding_settings: FundingSettings
  commodity_provider: string
  commodity_provider_ar: string
  provider_contact: string
  quality_standards: string[]
  delivery_terms: string
  warranty_period: number
  return_policy: string
  broker_commission?: number
  broker_terms?: string
  inventory_location?: string
  stock_management?: string
  broker_provider?: string
  broker_api_endpoint?: string
  broker_api_key?: string
  profit_margin?: number
  profit_calculation_method?: "fixed" | "percentage"
}

const commodityCategories = [
  "Metals",
  "Agriculture",
  "Energy",
  "Real Estate",
  "Technology",
  "Automotive",
  "Healthcare",
  "Education",
]

const qualityStandards = [
  "ISO 9001",
  "ISO 14001",
  "HACCP",
  "GMP",
  "CE Marking",
  "FDA Approved",
  "Halal Certified",
  "Organic Certified",
]

const investorTypes = [
  "Individual Investors",
  "Institutional Investors",
  "Accredited Investors",
  "Retail Investors",
  "Corporate Investors",
]

const mockPortfolios = [
  { id: "portfolio-1", name: "Growth Portfolio A", balance: 2500000, currency: "SAR" },
  { id: "portfolio-2", name: "Conservative Portfolio B", balance: 1800000, currency: "SAR" },
  { id: "portfolio-3", name: "High-Yield Portfolio C", balance: 3200000, currency: "SAR" },
  { id: "portfolio-4", name: "Balanced Portfolio D", balance: 2100000, currency: "SAR" },
]

const commodityProviders = [
  { id: "lme", name: "London Metal Exchange (LME)", type: "Metals" },
  { id: "cme", name: "Chicago Mercantile Exchange (CME)", type: "Agriculture" },
  { id: "ice", name: "Intercontinental Exchange (ICE)", type: "Energy" },
  { id: "comex", name: "COMEX", type: "Precious Metals" },
  { id: "nymex", name: "NYMEX", type: "Energy & Metals" },
  { id: "local_broker", name: "Local Commodity Broker", type: "Mixed" },
]

export default function CreateComodityInfo() {
  const { t, isRTL } = useLanguage()
  const router = useRouter()
  const [searchParams] = useSearchParams()
  const productIdFromUrl = searchParams.get("id")
  const productIdForTabs = productIdFromUrl || sessionStorage.getItem("productId")

  useEffect(() => {
    if (productIdFromUrl) {
      sessionStorage.setItem("productId", productIdFromUrl)
    }
  }, [productIdFromUrl])

  useEffect(() => {
    const effectiveProductId = productIdFromUrl || sessionStorage.getItem("productId")
    if (!effectiveProductId) {
      toast.error("Product ID not found. Please start from Basic Information.")
      router.push("/Los/ProductManagement/Create/BasicInfo")
    }
  }, [productIdFromUrl])

  const [formData, setFormData] = useState<CommodityFormData>({
    commodity_source: "company_inventory",
    commodities: [],
    funding_settings: {
      funding_types: [], // Initialize as empty array for multiple selection
    },
    commodity_provider: "",
    commodity_provider_ar: "",
    provider_contact: "",
    quality_standards: [],
    delivery_terms: "",
    warranty_period: 12,
    return_policy: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isTestingApi, setIsTestingApi] = useState(false)

  // Load previous form data
  useEffect(() => {
    const savedData = sessionStorage.getItem("commodityFormData")
    if (savedData) {
      setFormData(JSON.parse(savedData))
    }
  }, [])

  const updateFormData = (field: keyof CommodityFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addCommodity = () => {
    const newCommodity: CommodityItem = {
      id: Date.now().toString(),
      name: "",
      name_ar: "",
      category: "",
      unit: "",
      min_quantity: 1,
      max_quantity: 1000,
      unit_price: 0,
      description: "",
      specifications: {},
    }
    updateFormData("commodities", [...formData.commodities, newCommodity])
  }

  const removeCommodity = (id: string) => {
    updateFormData(
      "commodities",
      formData.commodities.filter((c) => c.id !== id),
    )
  }

  const updateCommodity = (id: string, field: keyof CommodityItem, value: any) => {
    const updatedCommodities = formData.commodities.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    updateFormData("commodities", updatedCommodities)
  }

  const handleQualityStandardToggle = (standard: string) => {
    const newStandards = formData.quality_standards.includes(standard)
      ? formData.quality_standards.filter((s) => s !== standard)
      : [...formData.quality_standards, standard]
    updateFormData("quality_standards", newStandards)
  }

  const handleInvestorTypeToggle = (type: string) => {
    if (!formData.funding_settings.investment_settings) return

    const currentTypes = formData.funding_settings.investment_settings.investor_types || []
    const newTypes = currentTypes.includes(type) ? currentTypes.filter((t) => t !== type) : [...currentTypes, type]

    updateFormData("funding_settings", {
      ...formData.funding_settings,
      investment_settings: {
        ...formData.funding_settings.investment_settings,
        investor_types: newTypes,
      },
    })
  }

  const handleFundingTypeToggle = (type: "company_backed" | "crowd_funded" | "investor_funded") => {
    const currentTypes = formData.funding_settings.funding_types || []
    const newTypes = currentTypes.includes(type) ? currentTypes.filter((t) => t !== type) : [...currentTypes, type]

    const updatedSettings = {
      ...formData.funding_settings,
      funding_types: newTypes,
    }

    // If investor_funded is selected and investment_settings don't exist, create them
    if (newTypes.includes("investor_funded") && !formData.funding_settings.investment_settings) {
      updatedSettings.investment_settings = {
        min_investment: 1000,
        max_investment: 100000,
        expected_return: 8,
        investment_period: 12,
        risk_level: "medium" as const,
        investor_types: [],
      }
    }

    updateFormData("funding_settings", updatedSettings)
  }

  const handlePortfolioToggle = (portfolioId: string) => {
    const currentPortfolios = formData.funding_settings.portfolio_ids || []
    const newPortfolios = currentPortfolios.includes(portfolioId)
      ? currentPortfolios.filter((id) => id !== portfolioId)
      : [...currentPortfolios, portfolioId]

    updateFormData("funding_settings", {
      ...formData.funding_settings,
      portfolio_ids: newPortfolios,
    })
  }

  const testBrokerApi = async () => {
    if (!formData.broker_api_endpoint) return

    setIsTestingApi(true)
    try {
      // Simulate API test
      await new Promise((resolve) => setTimeout(resolve, 2000))
      // In real implementation, this would test the actual API endpoint
    } catch (error) {
      console.error("[v0] API test failed:", error)
    } finally {
      setIsTestingApi(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (formData.commodities.length === 0) {
      newErrors.commodities = "At least one commodity is required"
    }

    formData.commodities.forEach((commodity, index) => {
      if (!commodity.name.trim()) {
        newErrors[`commodity_${index}_name`] = "Commodity name is required"
      }
      if (!commodity.category) {
        newErrors[`commodity_${index}_category`] = "Category is required"
      }
      if (commodity.unit_price <= 0) {
        newErrors[`commodity_${index}_price`] = "Unit price must be greater than 0"
      }
    })

    if (!formData.commodity_provider.trim()) {
      newErrors.commodity_provider = "Commodity provider is required"
    }

    if (formData.commodity_source === "broker") {
      if (!formData.broker_commission || formData.broker_commission <= 0) {
        newErrors.broker_commission = "Broker commission is required and must be greater than 0"
      }
      if (!formData.broker_provider) {
        newErrors.broker_provider = "Please select a commodity provider"
      }
    }

    if (formData.funding_settings.funding_types.length === 0) {
      newErrors.funding_types = "At least one funding type must be selected"
    }

    if (formData.funding_settings.funding_types.includes("investor_funded")) {
      const investmentSettings = formData.funding_settings.investment_settings
      if (!investmentSettings) {
        newErrors.investment_settings = "Investment settings are required"
      } else {
        if (investmentSettings.min_investment <= 0) {
          newErrors.min_investment = "Minimum investment must be greater than 0"
        }
        if (investmentSettings.max_investment <= investmentSettings.min_investment) {
          newErrors.max_investment = "Maximum investment must be greater than minimum"
        }
        if (investmentSettings.expected_return <= 0) {
          newErrors.expected_return = "Expected return must be greater than 0"
        }
      }

      if (!formData.funding_settings.portfolio_ids || formData.funding_settings.portfolio_ids.length === 0) {
        newErrors.portfolio_ids = "Please select at least one portfolio for investor funding"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      setIsLoading(true)
      // sessionStorage.setItem("commodityFormData", JSON.stringify(formData))
      // setTimeout(() => {
      //   setIsLoading(false)
      //   router.push("/Los/ProductManagement/Create/ProductSettings")
      // }, 500)
    }
  }

  const handlePrevious = () => {
    sessionStorage.setItem("commodityFormData", JSON.stringify(formData))
    router.push("/products/create/basic-info")
  }

  const handleSaveDraft = () => {
    setIsLoading(true)
    sessionStorage.setItem("commodityFormData", JSON.stringify(formData))
    setTimeout(() => {
      setIsLoading(false)
      router.push("/")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background pm-create-page">
      {/* Header with tabs (no steps / progress) */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="px-3 py-3">
          <div className="max-w-8xl mx-auto">
            <div className={`flex items-center justify-between mb-4 ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
              <div className={`flex items-center gap-4 ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/Los/ProductManagement/Create/BasicInfo")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Products
                </Button>
              </div>
            </div>
            <h1 className="text-xl font-semibold mb-4 flex items-center gap-2.5">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15">
                <Package className="h-4 w-4" />
              </span>
              Edit Product
            </h1>
            <ProductCreateEditTabs
              activeTab="commodity-info"
              productId={productIdForTabs}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 py-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <TooltipProvider>
            <Card className="pro-card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Commodity Source
                </CardTitle>
                <p className="text-muted-foreground">
                  Choose whether commodities come from company inventory or external brokers.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Commodity Source Type *</Label>
                  <RadioGroup
                    value={formData.commodity_source}
                    onValueChange={(value: "company_inventory" | "broker") => updateFormData("commodity_source", value)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="company_inventory" id="company_inventory" />
                      <div className="space-y-1">
                        <Label htmlFor="company_inventory" className="font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Company Inventory
                        </Label>
                        <p className="text-sm text-muted-foreground">Commodities managed directly by the company</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="broker" id="broker" />
                      <div className="space-y-1">
                        <Label htmlFor="broker" className="font-medium flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Commodity from Broker
                        </Label>
                        <p className="text-sm text-muted-foreground">Commodities sourced through external brokers</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {formData.commodity_source === "broker" && (
                  <div className="space-y-6 p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-lg font-medium">Broker Configuration</h3>

                    <div className="space-y-2">
                      <Label>Commodity Provider *</Label>
                      <Select
                        value={formData.broker_provider || ""}
                        onValueChange={(value) => updateFormData("broker_provider", value)}
                      >
                        <SelectTrigger className={errors.broker_provider ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select commodity provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {commodityProviders.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{provider.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  {provider.type}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.broker_provider && <p className="text-sm text-destructive">{errors.broker_provider}</p>}
                    </div>

                    <div className="space-y-4 p-4 border rounded-lg">
                      <h4 className="font-medium flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        API Configuration
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>API Endpoint</Label>
                          <Input
                            placeholder="https://api.provider.com/commodities"
                            value={formData.broker_api_endpoint || ""}
                            onChange={(e) => updateFormData("broker_api_endpoint", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <Input
                            type="password"
                            placeholder="Enter API key"
                            value={formData.broker_api_key || ""}
                            onChange={(e) => updateFormData("broker_api_key", e.target.value)}
                          />
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={testBrokerApi}
                        disabled={!formData.broker_api_endpoint || isTestingApi}
                        className="gap-2 bg-transparent"
                      >
                        <RefreshCw className={`h-4 w-4 ${isTestingApi ? "animate-spin" : ""}`} />
                        {isTestingApi ? "Testing API..." : "Test API Connection"}
                      </Button>
                    </div>

                    <div className="space-y-4 p-4 border rounded-lg">
                      <h4 className="font-medium">Profit Configuration</h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Profit Calculation Method</Label>
                          <Select
                            value={formData.profit_calculation_method || "percentage"}
                            onValueChange={(value: "fixed" | "percentage") =>
                              updateFormData("profit_calculation_method", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage</SelectItem>
                              <SelectItem value="fixed">Fixed Amount</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>
                            Profit Margin {formData.profit_calculation_method === "percentage" ? "(%)" : "(Amount)"}
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder={formData.profit_calculation_method === "percentage" ? "5.0" : "100"}
                            value={formData.profit_margin || ""}
                            onChange={(e) => updateFormData("profit_margin", Number(e.target.value))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Broker Commission (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="2.5"
                            value={formData.broker_commission || ""}
                            onChange={(e) => updateFormData("broker_commission", Number(e.target.value))}
                            className={errors.broker_commission ? "border-destructive" : ""}
                          />
                          {errors.broker_commission && (
                            <p className="text-sm text-destructive">{errors.broker_commission}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Broker Terms & Conditions</Label>
                      <Textarea
                        placeholder="Special terms, conditions, and agreements with the broker..."
                        value={formData.broker_terms || ""}
                        onChange={(e) => updateFormData("broker_terms", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {formData.commodity_source === "company_inventory" && (
                  <div className="space-y-6 p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-lg font-medium">Inventory Management</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Inventory Location</Label>
                        <Input
                          placeholder="Warehouse address or location code"
                          value={formData.inventory_location || ""}
                          onChange={(e) => updateFormData("inventory_location", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Stock Management System</Label>
                        <Select
                          value={formData.stock_management || ""}
                          onValueChange={(value) => updateFormData("stock_management", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select system" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fifo">First In, First Out (FIFO)</SelectItem>
                            <SelectItem value="lifo">Last In, First Out (LIFO)</SelectItem>
                            <SelectItem value="weighted_average">Weighted Average</SelectItem>
                            <SelectItem value="specific_identification">Specific Identification</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="pro-card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Funding Configuration
                </CardTitle>
                <p className="text-muted-foreground">
                  Choose how this product will be funded and configure investment parameters if applicable.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Funding Type * {/* Updated to allow multiple selection */}</Label>
                  <p className="text-sm text-muted-foreground">Select one or more funding types for this product.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <Checkbox
                        id="company_backed"
                        checked={formData.funding_settings.funding_types.includes("company_backed")}
                        onCheckedChange={() => handleFundingTypeToggle("company_backed")}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="company_backed" className="font-medium cursor-pointer">
                          Company Backed
                        </Label>
                        <p className="text-sm text-muted-foreground">Funded directly by company resources</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <Checkbox
                        id="crowd_funded"
                        checked={formData.funding_settings.funding_types.includes("crowd_funded")}
                        onCheckedChange={() => handleFundingTypeToggle("crowd_funded")}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="crowd_funded" className="font-medium cursor-pointer">
                          Crowd-Funded
                        </Label>
                        <p className="text-sm text-muted-foreground">Funded through crowdfunding platform</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <Checkbox
                        id="investor_funded"
                        checked={formData.funding_settings.funding_types.includes("investor_funded")}
                        onCheckedChange={() => handleFundingTypeToggle("investor_funded")}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="investor_funded" className="font-medium cursor-pointer">
                          Investor Funded
                        </Label>
                        <p className="text-sm text-muted-foreground">Funded by selected investor portfolio</p>
                      </div>
                    </div>
                  </div>
                  {errors.funding_types && <p className="text-sm text-destructive">{errors.funding_types}</p>}
                </div>

                {formData.funding_settings.funding_types.includes("investor_funded") && (
                  <div className="space-y-6 p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-lg font-medium">Portfolio Selection</h3>

                    <div className="space-y-2">
                      <Label>Select Portfolio(s) *</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose one or more portfolios to fund this product.
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {mockPortfolios.map((portfolio) => (
                          <div key={portfolio.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                            <Checkbox
                              id={portfolio.id}
                              checked={formData.funding_settings.portfolio_ids?.includes(portfolio.id) || false}
                              onCheckedChange={() => handlePortfolioToggle(portfolio.id)}
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <Label htmlFor={portfolio.id} className="font-medium cursor-pointer">
                                {portfolio.name}
                              </Label>
                              <Badge variant="outline">
                                {portfolio.balance.toLocaleString()} {portfolio.currency}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      {errors.portfolio_ids && <p className="text-sm text-destructive">{errors.portfolio_ids}</p>}
                    </div>

                    {formData.funding_settings.portfolio_ids && formData.funding_settings.portfolio_ids.length > 0 && (
                      <div className="p-3 bg-background rounded-lg border">
                        <h4 className="font-medium mb-2">Selected Portfolios Summary</h4>
                        <div className="space-y-1">
                          {formData.funding_settings.portfolio_ids.map((portfolioId) => {
                            const portfolio = mockPortfolios.find((p) => p.id === portfolioId)
                            return portfolio ? (
                              <div key={portfolioId} className="flex justify-between text-sm">
                                <span>{portfolio.name}</span>
                                <span>
                                  {portfolio.balance.toLocaleString()} {portfolio.currency}
                                </span>
                              </div>
                            ) : null
                          })}
                          <div className="border-t pt-1 mt-2 font-medium">
                            <div className="flex justify-between">
                              <span>Total Available:</span>
                              <span>
                                {formData.funding_settings.portfolio_ids
                                  .reduce((total, portfolioId) => {
                                    const portfolio = mockPortfolios.find((p) => p.id === portfolioId)
                                    return total + (portfolio?.balance || 0)
                                  }, 0)
                                  .toLocaleString()}{" "}
                                SAR
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Commodity Items */}
            <Card className="pro-card-glow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Commodity Items
                    </CardTitle>
                    <p className="text-muted-foreground">Define the commodities involved in this product.</p>
                  </div>
                  <Button onClick={addCommodity} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Commodity
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.commodities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No commodities added yet. Click "Add Commodity" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formData.commodities.map((commodity, index) => (
                      <Card key={commodity.id} className="relative">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Commodity {index + 1}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCommodity(commodity.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Commodity Name (English) *</Label>
                              <Input
                                placeholder="e.g., Gold Bars"
                                value={commodity.name}
                                onChange={(e) => updateCommodity(commodity.id, "name", e.target.value)}
                                className={errors[`commodity_${index}_name`] ? "border-destructive" : ""}
                              />
                              {errors[`commodity_${index}_name`] && (
                                <p className="text-sm text-destructive">{errors[`commodity_${index}_name`]}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label>Commodity Name (Arabic)</Label>
                              <Input
                                placeholder="مثال: سبائك الذهب"
                                value={commodity.name_ar}
                                onChange={(e) => updateCommodity(commodity.id, "name_ar", e.target.value)}
                                dir="rtl"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Category *</Label>
                              <Select
                                value={commodity.category}
                                onValueChange={(value) => updateCommodity(commodity.id, "category", value)}
                              >
                                <SelectTrigger
                                  className={errors[`commodity_${index}_category`] ? "border-destructive" : ""}
                                >
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {commodityCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors[`commodity_${index}_category`] && (
                                <p className="text-sm text-destructive">{errors[`commodity_${index}_category`]}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label>Unit</Label>
                              <Input
                                placeholder="e.g., kg, pieces, liters"
                                value={commodity.unit}
                                onChange={(e) => updateCommodity(commodity.id, "unit", e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Minimum Quantity</Label>
                              <Input
                                type="number"
                                placeholder="1"
                                value={commodity.min_quantity}
                                onChange={(e) => updateCommodity(commodity.id, "min_quantity", Number(e.target.value))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Maximum Quantity</Label>
                              <Input
                                type="number"
                                placeholder="1000"
                                value={commodity.max_quantity}
                                onChange={(e) => updateCommodity(commodity.id, "max_quantity", Number(e.target.value))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Unit Price *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={commodity.unit_price}
                                onChange={(e) => updateCommodity(commodity.id, "unit_price", Number(e.target.value))}
                                className={errors[`commodity_${index}_price`] ? "border-destructive" : ""}
                              />
                              {errors[`commodity_${index}_price`] && (
                                <p className="text-sm text-destructive">{errors[`commodity_${index}_price`]}</p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              placeholder="Detailed description of the commodity..."
                              value={commodity.description}
                              onChange={(e) => updateCommodity(commodity.id, "description", e.target.value)}
                              rows={3}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {errors.commodities && <p className="text-sm text-destructive">{errors.commodities}</p>}
              </CardContent>
            </Card>

            {/* Provider Information */}
            <Card className="pro-card-glow">
              <CardHeader>
                <CardTitle>Commodity Provider Information</CardTitle>
                <p className="text-muted-foreground">Information about the commodity supplier or provider.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Provider Name (English) *</Label>
                    <Input
                      placeholder="e.g., ABC Commodities Ltd"
                      value={formData.commodity_provider}
                      onChange={(e) => updateFormData("commodity_provider", e.target.value)}
                      className={errors.commodity_provider ? "border-destructive" : ""}
                    />
                    {errors.commodity_provider && (
                      <p className="text-sm text-destructive">{errors.commodity_provider}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Provider Name (Arabic)</Label>
                    <Input
                      placeholder="مثال: شركة السلع التجارية المحدودة"
                      value={formData.commodity_provider_ar}
                      onChange={(e) => updateFormData("commodity_provider_ar", e.target.value)}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Provider Contact Information</Label>
                  <Textarea
                    placeholder="Contact details, address, phone, email..."
                    value={formData.provider_contact}
                    onChange={(e) => updateFormData("provider_contact", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
              </CardContent>
            </Card>
          </TooltipProvider>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t bg-card sticky bottom-0">
        <div className="px-3 py-3">
          <div className="max-w-4xl mx-auto">
            <div className={`flex items-center justify-between ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
              <div className={`flex items-center gap-3 ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
                {/* <Button
                  variant="outline"
                  onClick={() => {
                    setIsLoading(true)
                    sessionStorage.setItem("commodityFormData", JSON.stringify(formData))
                    setTimeout(() => {
                      setIsLoading(false)
                      router.push("/")
                    }, 1000)
                  }}
                  disabled={isLoading}
                  className="gap-2 bg-transparent"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button> */}
                <Button variant="outline" onClick={() => router.push("/Los/ProductManagement/Create/BasicInfo")} className="gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>

              <div className={`flex items-center gap-3 ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
                <Button
                  variant="outline"
                  onClick={() => router.push("/Los/ProductManagement/Create/BasicInfo")}
                  className="gap-2 bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button onClick={handleNext} disabled={isLoading} className="gap-2">
                  {isLoading ? "Saving..." : "Next: Settings"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
