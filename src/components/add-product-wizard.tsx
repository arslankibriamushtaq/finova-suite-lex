"use client"

import { useState } from "react"
import { X, Upload, HelpCircle, GripVertical, Plus, Trash2, Eye, Calculator, Settings } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Checkbox } from "./ui/checkbox"
import { Switch } from "./ui/switch"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Progress } from "./ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Separator } from "./ui/separator"
import { mockCountries, productCategories, customerTypes } from "../lib/mock-data"

interface AddProductWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ProductFormData {
  name: string
  name_ar: string
  notification_email: string
  country: string
  master_category: string
  sub_categories: string[]
  customer_types: string[]
  status: "draft" | "active"
  logo_url: string
  short_desc_en: string
  short_desc_ar: string
  has_commodity: boolean
  // Settings data
  application_steps: ApplicationStep[]
  terms_conditions_en: string
  terms_conditions_ar: string
  fee_settings: FeeSettings
  admin_fee_slabs: AdminFeeSlab[]
  api_configs: ApiConfig[]
  duration_settings: DurationSettings
  partners: PartnerAffiliation[]
  documents: RequiredDocument[]
}

interface ApplicationStep {
  id: string
  key: string
  name_en: string
  name_ar: string
  visible: boolean
  required: boolean
  order: number
}

interface FeeSettings {
  min_financing_amount: number
  max_financing_amount: number
  currency: string
  vat_percentage: number
  bi_annual_financing_percentage: number
  annual_financing_percentage: number
  bi_annual_to_annual_difference: number
}

interface AdminFeeSlab {
  id: string
  from_amount: number
  to_amount: number
  profit_percentage: number
  admin_slabs_label: string
  processing_fee: number
  status: "active" | "disabled"
  partner_scope: "all" | "specific"
  partner_ids: string[]
}

interface ApiConfig {
  id: string
  name: string
  base_url: string
  endpoint: string
  environment: "dev" | "staging" | "prod"
  method: "GET" | "POST" | "PUT" | "DELETE"
  credentials_type: "none" | "basic" | "bearer" | "custom"
  username: string
  password: string
  params: { key: string; value: string }[]
  test_status: "untested" | "success" | "failed"
}

interface DurationSettings {
  application_submission_duration: number
  approved_factoring_application_gap: number
  application_auto_rejection_duration: number
  applied_application_idle_duration: number
  applied_application_department_idle_duration: number
  bayan_me_financial_duration: number
  bayan_credit_duration: number
  bayan_nae_duration: number
  simah_consumer_duration: number
}

interface PartnerAffiliation {
  id: string
  partner_name_en: string
  partner_name_ar: string
  affiliation_type: "Primary" | "Secondary" | "Agent"
  commission_type: "percentage" | "fixed"
  commission_value: number
  status: "active" | "disabled"
  created_at: string
}

interface RequiredDocument {
  id: string
  name_en: string
  name_ar: string
  type: "ID" | "Proof of Address" | "Bank Statement" | "Income Certificate" | "Business License" | "Other"
  required: boolean
  file_url?: string
  notes_en?: string
  notes_ar?: string
  created_by: string
  created_at: string
  status: "required" | "optional" | "deprecated"
  versions: DocumentVersion[]
}

interface DocumentVersion {
  id: string
  version: string
  file_url: string
  created_at: string
  created_by: string
  is_current: boolean
}

const subCategoriesMap: Record<string, string[]> = {
  Murabaha: ["Home Purchase", "Construction", "Vehicle Purchase", "Equipment Financing"],
  Ijarah: ["Equipment Leasing", "Vehicle Leasing", "Property Rental", "Working Capital"],
  BNPL: ["E-commerce", "Retail", "Healthcare", "Education"],
  "Crowd-Funding": ["Real Estate", "Business Ventures", "Technology Startups", "Social Impact"],
  Tawarruq: ["Personal Finance", "Business Finance", "Investment", "Emergency Funding"],
}

const wizardSteps = [
  { id: 1, name: "Basic Information", description: "Product details and categorization" },
  { id: 2, name: "Commodity Information", description: "Commodity details and specifications" },
  { id: 3, name: "Settings", description: "Application steps, fees, and configuration" },
  { id: 4, name: "Partner Affiliation", description: "Partner relationships and commissions" },
  { id: 5, name: "Required Documents", description: "Document requirements and templates" },
]

const defaultApplicationSteps: ApplicationStep[] = [
  {
    id: "1",
    key: "personal_info",
    name_en: "Personal Information",
    name_ar: "المعلومات الشخصية",
    visible: true,
    required: true,
    order: 1,
  },
  {
    id: "2",
    key: "financial_info",
    name_en: "Financial Information",
    name_ar: "المعلومات المالية",
    visible: true,
    required: true,
    order: 2,
  },
  {
    id: "3",
    key: "documents",
    name_en: "Document Upload",
    name_ar: "رفع المستندات",
    visible: true,
    required: true,
    order: 3,
  },
  {
    id: "4",
    key: "verification",
    name_en: "Verification",
    name_ar: "التحقق",
    visible: true,
    required: false,
    order: 4,
  },
  {
    id: "5",
    key: "approval",
    name_en: "Final Approval",
    name_ar: "الموافقة النهائية",
    visible: true,
    required: true,
    order: 5,
  },
]

export function AddProductWizard({ open, onOpenChange }: AddProductWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [activeSettingsTab, setActiveSettingsTab] = useState("application-steps")
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    name_ar: "",
    notification_email: "",
    country: "",
    master_category: "",
    sub_categories: [],
    customer_types: [],
    status: "draft",
    logo_url: "",
    short_desc_en: "",
    short_desc_ar: "",
    has_commodity: false,
    application_steps: defaultApplicationSteps,
    terms_conditions_en: "",
    terms_conditions_ar: "",
    fee_settings: {
      min_financing_amount: 0,
      max_financing_amount: 0,
      currency: "SAR",
      vat_percentage: 15,
      bi_annual_financing_percentage: 0,
      annual_financing_percentage: 0,
      bi_annual_to_annual_difference: 0,
    },
    admin_fee_slabs: [],
    api_configs: [],
    duration_settings: {
      application_submission_duration: 30,
      approved_factoring_application_gap: 7,
      application_auto_rejection_duration: 60,
      applied_application_idle_duration: 14,
      applied_application_department_idle_duration: 7,
      bayan_me_financial_duration: 3,
      bayan_credit_duration: 2,
      bayan_nae_duration: 1,
      simah_consumer_duration: 1,
    },
    partners: [],
    documents: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDraft, setIsDraft] = useState(false)
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false)
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false)
  const [selectedPartners, setSelectedPartners] = useState<string[]>([])

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Product name (English) is required"
      if (!formData.name_ar.trim()) newErrors.name_ar = "Product name (Arabic) is required"
      if (!formData.notification_email.trim()) {
        newErrors.notification_email = "Notification email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.notification_email)) {
        newErrors.notification_email = "Please enter a valid email address"
      }
      if (!formData.country) newErrors.country = "Country is required"
      if (!formData.master_category) newErrors.master_category = "Master category is required"
      if (formData.customer_types.length === 0) newErrors.customer_types = "At least one customer type is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, wizardSteps.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSaveDraft = () => {
    setIsDraft(true)
    onOpenChange(false)
  }

  const handlePublish = () => {
    if (validateStep(currentStep)) {
      onOpenChange(false)
    }
  }

  const handleSubCategoryToggle = (category: string) => {
    const newSubCategories = formData.sub_categories.includes(category)
      ? formData.sub_categories.filter((c) => c !== category)
      : [...formData.sub_categories, category]
    updateFormData("sub_categories", newSubCategories)
  }

  const handleCustomerTypeToggle = (type: string) => {
    const newCustomerTypes = formData.customer_types.includes(type)
      ? formData.customer_types.filter((t) => t !== type)
      : [...formData.customer_types, type]
    updateFormData("customer_types", newCustomerTypes)
  }

  const addApplicationStep = () => {
    const newStep: ApplicationStep = {
      id: Date.now().toString(),
      key: `step_${Date.now()}`,
      name_en: "New Step",
      name_ar: "خطوة جديدة",
      visible: true,
      required: false,
      order: formData.application_steps.length + 1,
    }
    updateFormData("application_steps", [...formData.application_steps, newStep])
  }

  const removeApplicationStep = (stepId: string) => {
    updateFormData(
      "application_steps",
      formData.application_steps.filter((step) => step.id !== stepId),
    )
  }

  const updateApplicationStep = (stepId: string, field: keyof ApplicationStep, value: any) => {
    const updatedSteps = formData.application_steps.map((step) =>
      step.id === stepId ? { ...step, [field]: value } : step,
    )
    updateFormData("application_steps", updatedSteps)
  }

  const addFeeSlab = () => {
    const newSlab: AdminFeeSlab = {
      id: Date.now().toString(),
      from_amount: 0,
      to_amount: 0,
      profit_percentage: 0,
      admin_slabs_label: "New Slab",
      processing_fee: 0,
      status: "active",
      partner_scope: "all",
      partner_ids: [],
    }
    updateFormData("admin_fee_slabs", [...formData.admin_fee_slabs, newSlab])
  }

  const removeFeeSlab = (slabId: string) => {
    updateFormData(
      "admin_fee_slabs",
      formData.admin_fee_slabs.filter((slab) => slab.id !== slabId),
    )
  }

  const updateFeeSlab = (slabId: string, field: keyof AdminFeeSlab, value: any) => {
    const updatedSlabs = formData.admin_fee_slabs.map((slab) =>
      slab.id === slabId ? { ...slab, [field]: value } : slab,
    )
    updateFormData("admin_fee_slabs", updatedSlabs)
  }

  const addApiConfig = () => {
    const newConfig: ApiConfig = {
      id: Date.now().toString(),
      name: "New API",
      base_url: "",
      endpoint: "",
      environment: "dev",
      method: "GET",
      credentials_type: "none",
      username: "",
      password: "",
      params: [],
      test_status: "untested",
    }
    updateFormData("api_configs", [...formData.api_configs, newConfig])
  }

  const removeApiConfig = (configId: string) => {
    updateFormData(
      "api_configs",
      formData.api_configs.filter((config) => config.id !== configId),
    )
  }

  const updateApiConfig = (configId: string, field: keyof ApiConfig, value: any) => {
    const updatedConfigs = formData.api_configs.map((config) =>
      config.id === configId ? { ...config, [field]: value } : config,
    )
    updateFormData("api_configs", updatedConfigs)
  }

  const testApiConnection = (configId: string) => {
    // Simulate API test
    setTimeout(() => {
      updateApiConfig(configId, "test_status", Math.random() > 0.5 ? "success" : "failed")
    }, 1000)
    updateApiConfig(configId, "test_status", "untested")
  }

  const addPartner = (partner: Omit<PartnerAffiliation, "id" | "created_at">) => {
    const newPartner: PartnerAffiliation = {
      ...partner,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    }
    updateFormData("partners", [...formData.partners, newPartner])
  }

  const removePartner = (partnerId: string) => {
    updateFormData(
      "partners",
      formData.partners.filter((partner) => partner.id !== partnerId),
    )
  }

  const updatePartner = (partnerId: string, field: keyof PartnerAffiliation, value: any) => {
    const updatedPartners = formData.partners.map((partner) =>
      partner.id === partnerId ? { ...partner, [field]: value } : partner,
    )
    updateFormData("partners", updatedPartners)
  }

  const togglePartnerSelection = (partnerId: string) => {
    setSelectedPartners((prev) =>
      prev.includes(partnerId) ? prev.filter((id) => id !== partnerId) : [...prev, partnerId],
    )
  }

  const setBulkCommission = (commissionType: "percentage" | "fixed", commissionValue: number) => {
    const updatedPartners = formData.partners.map((partner) =>
      selectedPartners.includes(partner.id)
        ? { ...partner, commission_type: commissionType, commission_value: commissionValue }
        : partner,
    )
    updateFormData("partners", updatedPartners)
    setSelectedPartners([])
  }

  const addDocument = (document: Omit<RequiredDocument, "id" | "created_at" | "created_by" | "versions">) => {
    const newDocument: RequiredDocument = {
      ...document,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      created_by: "current-user@example.com",
      versions: [],
    }
    updateFormData("documents", [...formData.documents, newDocument])
  }

  const removeDocument = (documentId: string) => {
    updateFormData(
      "documents",
      formData.documents.filter((doc) => doc.id !== documentId),
    )
  }

  const updateDocument = (documentId: string, field: keyof RequiredDocument, value: any) => {
    const updatedDocuments = formData.documents.map((doc) => (doc.id === documentId ? { ...doc, [field]: value } : doc))
    updateFormData("documents", updatedDocuments)
  }

  const availableSubCategories = formData.master_category ? subCategoriesMap[formData.master_category] || [] : []
  const progressPercentage = (currentStep / wizardSteps.length) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Create Product</DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Step {currentStep} of {wizardSteps.length}
              </span>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />

            {/* Step Navigation */}
            <div className="flex items-center justify-between mt-4 text-xs">
              {wizardSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center cursor-pointer transition-colors ${
                    step.id === currentStep
                      ? "text-primary"
                      : step.id < currentStep
                        ? "text-red-600"
                        : "text-muted-foreground"
                  }`}
                  onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                      step.id === currentStep
                        ? "bg-primary text-primary-foreground"
                        : step.id < currentStep
                          ? "bg-red-600 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.id}
                  </div>
                  <span className="text-center max-w-20">{step.name}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <TooltipProvider>
            {currentStep === 1 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Product Names */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="name">Product Nam (English) *</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Enter the primary product name in English (max 120 characters)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="name"
                          placeholder="e.g., Home Financing Plus"
                          value={formData.name}
                          onChange={(e) => updateFormData("name", e.target.value)}
                          maxLength={120}
                          className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="name_ar">Product Name (Arabic) *</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Enter the product name in Arabic (max 120 characters)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="name_ar"
                          placeholder="مثال: التمويل العقاري بلس"
                          value={formData.name_ar}
                          onChange={(e) => updateFormData("name_ar", e.target.value)}
                          maxLength={120}
                          dir="rtl"
                          className={errors.name_ar ? "border-destructive" : ""}
                        />
                        {errors.name_ar && <p className="text-sm text-destructive">{errors.name_ar}</p>}
                      </div>
                    </div>

                    {/* Notification Email */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="email">Notification Email *</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Email address for product-related notifications and alerts</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="product-notify@bank.com"
                        value={formData.notification_email}
                        onChange={(e) => updateFormData("notification_email", e.target.value)}
                        className={errors.notification_email ? "border-destructive" : ""}
                      />
                      {errors.notification_email && (
                        <p className="text-sm text-destructive">{errors.notification_email}</p>
                      )}
                    </div>

                    {/* Country and Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Country *</Label>
                        <Select value={formData.country} onValueChange={(value) => updateFormData("country", value)}>
                          <SelectTrigger className={errors.country ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockCountries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.flag} {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label>Master Category *</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Choose high-level product family (Murabaha, Ijarah, Tawarruq, BNPL, Crowd-Funding)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select
                          value={formData.master_category}
                          onValueChange={(value) => {
                            updateFormData("master_category", value)
                            updateFormData("sub_categories", [])
                          }}
                        >
                          <SelectTrigger className={errors.master_category ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {productCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.master_category && <p className="text-sm text-destructive">{errors.master_category}</p>}
                      </div>
                    </div>

                    {/* Sub-categories */}
                    {availableSubCategories.length > 0 && (
                      <div className="space-y-2">
                        <Label>Sub-categories</Label>
                        <div className="flex flex-wrap gap-2">
                          {availableSubCategories.map((category) => (
                            <Badge
                              key={category}
                              variant={formData.sub_categories.includes(category) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => handleSubCategoryToggle(category)}
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Click to select/deselect sub-categories</p>
                      </div>
                    )}

                    {/* Customer Types */}
                    <div className="space-y-2">
                      <Label>Customer Types *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {customerTypes.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={type}
                              checked={formData.customer_types.includes(type)}
                              onCheckedChange={() => handleCustomerTypeToggle(type)}
                            />
                            <Label htmlFor={type} className="text-sm font-normal cursor-pointer">
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {errors.customer_types && <p className="text-sm text-destructive">{errors.customer_types}</p>}
                    </div>

                    {/* Status and Logo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.status === "active"}
                            onCheckedChange={(checked) => updateFormData("status", checked ? "active" : "draft")}
                          />
                          <Label className="text-sm">{formData.status === "active" ? "Active" : "Draft"}</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">Draft products are not visible to customers</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Logo</Label>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={formData.logo_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {formData.name ? formData.name.substring(0, 2).toUpperCase() : "PR"}
                            </AvatarFallback>
                          </Avatar>
                          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                            <Upload className="h-4 w-4" />
                            Upload Logo
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Recommended: 200x200px, PNG or JPG</p>
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="desc_en">Short Description (English)</Label>
                        <Textarea
                          id="desc_en"
                          placeholder="Brief description of the product..."
                          value={formData.short_desc_en}
                          onChange={(e) => updateFormData("short_desc_en", e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="desc_ar">Short Description (Arabic)</Label>
                        <Textarea
                          id="desc_ar"
                          placeholder="وصف مختصر للمنتج..."
                          value={formData.short_desc_ar}
                          onChange={(e) => updateFormData("short_desc_ar", e.target.value)}
                          rows={3}
                          dir="rtl"
                        />
                      </div>
                    </div>

                    {/* Commodity Checkbox */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="has_commodity"
                          checked={formData.has_commodity}
                          onCheckedChange={(checked) => updateFormData("has_commodity", checked)}
                        />
                        <Label htmlFor="has_commodity" className="cursor-pointer">
                          This product involves a commodity
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Check this if the product involves physical or digital commodities</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        If checked, you'll configure commodity details in the next step
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Step 2: Commodity Information</h3>
                  <p className="text-muted-foreground">This step will be implemented in the next phase</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Settings Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab}>
                      <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="application-steps" className="text-xs">
                          Application Steps
                        </TabsTrigger>
                        <TabsTrigger value="terms-conditions" className="text-xs">
                          Terms & Conditions
                        </TabsTrigger>
                        <TabsTrigger value="fee-settings" className="text-xs">
                          Fee Settings
                        </TabsTrigger>
                        <TabsTrigger value="admin-fee-slabs" className="text-xs">
                          Fee Slabs
                        </TabsTrigger>
                        <TabsTrigger value="environment-config" className="text-xs">
                          Environment Config
                        </TabsTrigger>
                        <TabsTrigger value="duration-settings" className="text-xs">
                          Duration Settings
                        </TabsTrigger>
                      </TabsList>

                      {/* Application Steps Tab */}
                      <TabsContent value="application-steps" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium">Application Steps</h3>
                            <p className="text-sm text-muted-foreground">
                              Configure the steps customers go through when applying
                            </p>
                          </div>
                          <Button onClick={addApplicationStep} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Step
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {formData.application_steps.map((step, index) => (
                            <Card key={step.id} className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="cursor-move">
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div>
                                    <Label className="text-xs">Step Name (EN)</Label>
                                    <Input
                                      value={step.name_en}
                                      onChange={(e) => updateApplicationStep(step.id, "name_en", e.target.value)}
                                      placeholder="Step name"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Step Name (AR)</Label>
                                    <Input
                                      value={step.name_ar}
                                      onChange={(e) => updateApplicationStep(step.id, "name_ar", e.target.value)}
                                      placeholder="اسم الخطوة"
                                      dir="rtl"
                                    />
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`visible-${step.id}`}
                                        checked={step.visible}
                                        onCheckedChange={(checked) =>
                                          updateApplicationStep(step.id, "visible", checked)
                                        }
                                      />
                                      <Label htmlFor={`visible-${step.id}`} className="text-xs">
                                        Visible
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`required-${step.id}`}
                                        checked={step.required}
                                        onCheckedChange={(checked) =>
                                          updateApplicationStep(step.id, "required", checked)
                                        }
                                      />
                                      <Label htmlFor={`required-${step.id}`} className="text-xs">
                                        Required
                                      </Label>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeApplicationStep(step.id)}
                                      className="gap-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>

                      {/* Terms & Conditions Tab */}
                      <TabsContent value="terms-conditions" className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">Terms & Conditions</h3>
                          <p className="text-sm text-muted-foreground">
                            Configure legal terms and conditions for the product
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Terms & Conditions (English)</Label>
                              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                                <Eye className="h-4 w-4" />
                                Preview
                              </Button>
                            </div>
                            <Textarea
                              value={formData.terms_conditions_en}
                              onChange={(e) => updateFormData("terms_conditions_en", e.target.value)}
                              placeholder="Enter terms and conditions in English..."
                              rows={10}
                              className="text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                              Use placeholders: {`{{customer_name}}, {{product_name}}, {{amount}}`}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Terms & Conditions (Arabic)</Label>
                              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                                <Eye className="h-4 w-4" />
                                Preview
                              </Button>
                            </div>
                            <Textarea
                              value={formData.terms_conditions_ar}
                              onChange={(e) => updateFormData("terms_conditions_ar", e.target.value)}
                              placeholder="أدخل الشروط والأحكام باللغة العربية..."
                              rows={10}
                              dir="rtl"
                              className="text-sm"
                            />
                            <p className="text-xs text-muted-foreground" dir="rtl">
                              استخدم المتغيرات: {`{{customer_name}}, {{product_name}}, {{amount}}`}
                            </p>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Fee Settings Tab */}
                      <TabsContent value="fee-settings" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium">Fee Settings</h3>
                            <p className="text-sm text-muted-foreground">
                              Configure financing amounts and fee percentages
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                            <Calculator className="h-4 w-4" />
                            Test Calculator
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Min Financing Amount</Label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                value={formData.fee_settings.min_financing_amount}
                                onChange={(e) =>
                                  updateFormData("fee_settings", {
                                    ...formData.fee_settings,
                                    min_financing_amount: Number(e.target.value),
                                  })
                                }
                                placeholder="0"
                              />
                              <Select
                                value={formData.fee_settings.currency}
                                onValueChange={(value) =>
                                  updateFormData("fee_settings", { ...formData.fee_settings, currency: value })
                                }
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="SAR">SAR</SelectItem>
                                  <SelectItem value="AED">AED</SelectItem>
                                  <SelectItem value="USD">USD</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Max Financing Amount</Label>
                            <Input
                              type="number"
                              value={formData.fee_settings.max_financing_amount}
                              onChange={(e) =>
                                updateFormData("fee_settings", {
                                  ...formData.fee_settings,
                                  max_financing_amount: Number(e.target.value),
                                })
                              }
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>VAT Percentage</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={formData.fee_settings.vat_percentage}
                                onChange={(e) =>
                                  updateFormData("fee_settings", {
                                    ...formData.fee_settings,
                                    vat_percentage: Number(e.target.value),
                                  })
                                }
                                placeholder="15"
                                max="100"
                                min="0"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                %
                              </span>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-3">Revenue Eligibility for Financing</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Bi-Annual Financing %</Label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  value={formData.fee_settings.bi_annual_financing_percentage}
                                  onChange={(e) =>
                                    updateFormData("fee_settings", {
                                      ...formData.fee_settings,
                                      bi_annual_financing_percentage: Number(e.target.value),
                                    })
                                  }
                                  placeholder="0"
                                  max="100"
                                  min="0"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                  %
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Annual Financing %</Label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  value={formData.fee_settings.annual_financing_percentage}
                                  onChange={(e) =>
                                    updateFormData("fee_settings", {
                                      ...formData.fee_settings,
                                      annual_financing_percentage: Number(e.target.value),
                                    })
                                  }
                                  placeholder="0"
                                  max="100"
                                  min="0"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                  %
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Bi-Annual to Annual Difference %</Label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  value={
                                    formData.fee_settings.annual_financing_percentage -
                                    formData.fee_settings.bi_annual_financing_percentage
                                  }
                                  readOnly
                                  className="bg-muted"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                  %
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">Auto-calculated difference</p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Fee Slabs Tab */}
                      <TabsContent value="admin-fee-slabs" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium">Fee Slabs</h3>
                            <p className="text-sm text-muted-foreground">Configure fee slabs based on amount ranges</p>
                          </div>
                          <Button onClick={addFeeSlab} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add New Slab
                          </Button>
                        </div>

                        {formData.admin_fee_slabs.length > 0 ? (
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>From Amount</TableHead>
                                  <TableHead>To Amount</TableHead>
                                  <TableHead>Profit %</TableHead>
                                  <TableHead>Admin Slabs</TableHead>
                                  <TableHead>Processing Fee</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {formData.admin_fee_slabs.map((slab) => (
                                  <TableRow key={slab.id}>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        value={slab.from_amount}
                                        onChange={(e) => updateFeeSlab(slab.id, "from_amount", Number(e.target.value))}
                                        className="w-24"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        value={slab.to_amount}
                                        onChange={(e) => updateFeeSlab(slab.id, "to_amount", Number(e.target.value))}
                                        className="w-24"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          value={slab.profit_percentage}
                                          onChange={(e) =>
                                            updateFeeSlab(slab.id, "profit_percentage", Number(e.target.value))
                                          }
                                          className="w-20 pe-6"
                                          max="100"
                                          min="0"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                          %
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        value={slab.admin_slabs_label}
                                        onChange={(e) => updateFeeSlab(slab.id, "admin_slabs_label", e.target.value)}
                                        className="w-32"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        value={slab.processing_fee}
                                        onChange={(e) =>
                                          updateFeeSlab(slab.id, "processing_fee", Number(e.target.value))
                                        }
                                        className="w-24"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Select
                                        value={slab.status}
                                        onValueChange={(value: "active" | "disabled") =>
                                          updateFeeSlab(slab.id, "status", value)
                                        }
                                      >
                                        <SelectTrigger className="w-24">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="active">Active</SelectItem>
                                          <SelectItem value="disabled">Disabled</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeFeeSlab(slab.id)}
                                        className="gap-2"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No fee slabs configured yet</p>
                            <p className="text-sm">Click "Add New Slab" to get started</p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Environment Configuration Tab */}
                      <TabsContent value="environment-config" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium">Environment Configuration</h3>
                            <p className="text-sm text-muted-foreground">Configure API endpoints and credentials</p>
                          </div>
                          <Button onClick={addApiConfig} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add API Config
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {formData.api_configs.map((config) => (
                            <Card key={config.id} className="p-4">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{config.name || "New API Configuration"}</h4>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={
                                        config.test_status === "success"
                                          ? "default"
                                          : config.test_status === "failed"
                                            ? "destructive"
                                            : "secondary"
                                      }
                                    >
                                      {config.test_status === "success"
                                        ? "Connected"
                                        : config.test_status === "failed"
                                          ? "Failed"
                                          : "Untested"}
                                    </Badge>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => testApiConnection(config.id)}
                                      className="gap-2"
                                    >
                                      Test Connection
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeApiConfig(config.id)}
                                      className="gap-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label>API Name</Label>
                                    <Input
                                      value={config.name}
                                      onChange={(e) => updateApiConfig(config.id, "name", e.target.value)}
                                      placeholder="e.g., Payment Gateway"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Environment</Label>
                                    <Select
                                      value={config.environment}
                                      onValueChange={(value: "dev" | "staging" | "prod") =>
                                        updateApiConfig(config.id, "environment", value)
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="dev">Development</SelectItem>
                                        <SelectItem value="staging">Staging</SelectItem>
                                        <SelectItem value="prod">Production</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Method</Label>
                                    <Select
                                      value={config.method}
                                      onValueChange={(value: "GET" | "POST" | "PUT" | "DELETE") =>
                                        updateApiConfig(config.id, "method", value)
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="GET">GET</SelectItem>
                                        <SelectItem value="POST">POST</SelectItem>
                                        <SelectItem value="PUT">PUT</SelectItem>
                                        <SelectItem value="DELETE">DELETE</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Base URL</Label>
                                    <Input
                                      value={config.base_url}
                                      onChange={(e) => updateApiConfig(config.id, "base_url", e.target.value)}
                                      placeholder="https://api.example.com"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Endpoint</Label>
                                    <Input
                                      value={config.endpoint}
                                      onChange={(e) => updateApiConfig(config.id, "endpoint", e.target.value)}
                                      placeholder="/v1/payments"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Credentials Type</Label>
                                  <Select
                                    value={config.credentials_type}
                                    onValueChange={(value: "none" | "basic" | "bearer" | "custom") =>
                                      updateApiConfig(config.id, "credentials_type", value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">None</SelectItem>
                                      <SelectItem value="basic">Basic Auth</SelectItem>
                                      <SelectItem value="bearer">Bearer Token</SelectItem>
                                      <SelectItem value="custom">Custom Headers</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {(config.credentials_type === "basic" || config.credentials_type === "bearer") && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>{config.credentials_type === "basic" ? "Username" : "Token"}</Label>
                                      <Input
                                        value={config.username}
                                        onChange={(e) => updateApiConfig(config.id, "username", e.target.value)}
                                        placeholder={config.credentials_type === "basic" ? "username" : "bearer_token"}
                                        type={config.credentials_type === "bearer" ? "password" : "text"}
                                      />
                                    </div>
                                    {config.credentials_type === "basic" && (
                                      <div className="space-y-2">
                                        <Label>Password</Label>
                                        <Input
                                          value={config.password}
                                          onChange={(e) => updateApiConfig(config.id, "password", e.target.value)}
                                          placeholder="password"
                                          type="password"
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}

                          {formData.api_configs.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No API configurations yet</p>
                              <p className="text-sm">Click "Add API Config" to get started</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      {/* Duration Settings Tab */}
                      <TabsContent value="duration-settings" className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">Duration Settings</h3>
                          <p className="text-sm text-muted-foreground">
                            Configure various duration settings for application processes
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="p-4">
                            <h4 className="font-medium mb-3">Application Durations</h4>
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label>Application Submission Duration (days)</Label>
                                <Input
                                  type="number"
                                  value={formData.duration_settings.application_submission_duration}
                                  onChange={(e) =>
                                    updateFormData("duration_settings", {
                                      ...formData.duration_settings,
                                      application_submission_duration: Number(e.target.value),
                                    })
                                  }
                                  min="1"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Approved Factoring Application Gap (days)</Label>
                                <Input
                                  type="number"
                                  value={formData.duration_settings.approved_factoring_application_gap}
                                  onChange={(e) =>
                                    updateFormData("duration_settings", {
                                      ...formData.duration_settings,
                                      approved_factoring_application_gap: Number(e.target.value),
                                    })
                                  }
                                  min="1"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Application Auto Rejection Duration (days)</Label>
                                <Input
                                  type="number"
                                  value={formData.duration_settings.application_auto_rejection_duration}
                                  onChange={(e) =>
                                    updateFormData("duration_settings", {
                                      ...formData.duration_settings,
                                      application_auto_rejection_duration: Number(e.target.value),
                                    })
                                  }
                                  min="1"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Applied Application Idle Duration (days)</Label>
                                <Input
                                  type="number"
                                  value={formData.duration_settings.applied_application_idle_duration}
                                  onChange={(e) =>
                                    updateFormData("duration_settings", {
                                      ...formData.duration_settings,
                                      applied_application_idle_duration: Number(e.target.value),
                                    })
                                  }
                                  min="1"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Applied Application Department Idle Duration (days)</Label>
                                <Input
                                  type="number"
                                  value={formData.duration_settings.applied_application_department_idle_duration}
                                  onChange={(e) =>
                                    updateFormData("duration_settings", {
                                      ...formData.duration_settings,
                                      applied_application_department_idle_duration: Number(e.target.value),
                                    })
                                  }
                                  min="1"
                                />
                              </div>
                            </div>
                          </Card>

                          <Card className="p-4">
                            <h4 className="font-medium mb-3">External Service Durations</h4>
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label>Bayan ME Financial Duration (days)</Label>
                                <Input
                                  type="number"
                                  value={formData.duration_settings.bayan_me_financial_duration}
                                  onChange={(e) =>
                                    updateFormData("duration_settings", {
                                      ...formData.duration_settings,
                                      bayan_me_financial_duration: Number(e.target.value),
                                    })
                                  }
                                  min="1"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Bayan Credit Duration (days)</Label>
                                <Input
                                  type="number"
                                  value={formData.duration_settings.bayan_credit_duration}
                                  onChange={(e) =>
                                    updateFormData("duration_settings", {
                                      ...formData.duration_settings,
                                      bayan_credit_duration: Number(e.target.value),
                                    })
                                  }
                                  min="1"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Bayan NAE Duration (days)</Label>
                                <Input
                                  type="number"
                                  value={formData.duration_settings.bayan_nae_duration}
                                  onChange={(e) =>
                                    updateFormData("duration_settings", {
                                      ...formData.duration_settings,
                                      bayan_nae_duration: Number(e.target.value),
                                    })
                                  }
                                  min="1"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>SIMAH Consumer Duration (days)</Label>
                                <Input
                                  type="number"
                                  value={formData.duration_settings.simah_consumer_duration}
                                  onChange={(e) =>
                                    updateFormData("duration_settings", {
                                      ...formData.duration_settings,
                                      simah_consumer_duration: Number(e.target.value),
                                    })
                                  }
                                  min="1"
                                />
                              </div>
                            </div>
                          </Card>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Partner Affiliation</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Configure partner relationships and commission structures
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {selectedPartners.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{selectedPartners.length} selected</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const commission = prompt("Enter commission percentage:")
                                if (commission) {
                                  setBulkCommission("percentage", Number(commission))
                                }
                              }}
                              className="gap-2"
                            >
                              Set Bulk Commission
                            </Button>
                          </div>
                        )}
                      </div>
                      <Button onClick={() => setShowAddPartnerModal(true)} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Partner
                      </Button>
                    </div>

                    {formData.partners.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">
                                <Checkbox
                                  checked={selectedPartners.length === formData.partners.length}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedPartners(formData.partners.map((p) => p.id))
                                    } else {
                                      setSelectedPartners([])
                                    }
                                  }}
                                />
                              </TableHead>
                              <TableHead>Partner Name (EN)</TableHead>
                              <TableHead>Partner Name (AR)</TableHead>
                              <TableHead>Affiliation Type</TableHead>
                              <TableHead>Commission</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {formData.partners.map((partner) => (
                              <TableRow key={partner.id}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedPartners.includes(partner.id)}
                                    onCheckedChange={() => togglePartnerSelection(partner.id)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={partner.partner_name_en}
                                    onChange={(e) => updatePartner(partner.id, "partner_name_en", e.target.value)}
                                    className="w-40"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={partner.partner_name_ar}
                                    onChange={(e) => updatePartner(partner.id, "partner_name_ar", e.target.value)}
                                    className="w-40"
                                    dir="rtl"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={partner.affiliation_type}
                                    onValueChange={(value: "Primary" | "Secondary" | "Agent") =>
                                      updatePartner(partner.id, "affiliation_type", value)
                                    }
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Primary">Primary</SelectItem>
                                      <SelectItem value="Secondary">Secondary</SelectItem>
                                      <SelectItem value="Agent">Agent</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      value={partner.commission_value}
                                      onChange={(e) =>
                                        updatePartner(partner.id, "commission_value", Number(e.target.value))
                                      }
                                      className="w-20"
                                      min="0"
                                    />
                                    <Select
                                      value={partner.commission_type}
                                      onValueChange={(value: "percentage" | "fixed") =>
                                        updatePartner(partner.id, "commission_type", value)
                                      }
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="percentage">%</SelectItem>
                                        <SelectItem value="fixed">Fixed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={partner.status}
                                    onValueChange={(value: "active" | "disabled") =>
                                      updatePartner(partner.id, "status", value)
                                    }
                                  >
                                    <SelectTrigger className="w-24">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="disabled">Disabled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removePartner(partner.id)}
                                    className="gap-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground border rounded-lg">
                        <p>No partners configured yet</p>
                        <p className="text-sm">Click "Add Partner" to get started</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Add Partner Modal */}
                <Dialog open={showAddPartnerModal} onOpenChange={setShowAddPartnerModal}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Partner</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label>Partner Name (English)</Label>
                          <Input placeholder="e.g., ABC Financial Services" />
                        </div>
                        <div className="space-y-2">
                          <Label>Partner Name (Arabic)</Label>
                          <Input placeholder="مثال: شركة الخدمات المالية" dir="rtl" />
                        </div>
                        <div className="space-y-2">
                          <Label>Affiliation Type</Label>
                          <Select defaultValue="Secondary">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Primary">Primary</SelectItem>
                              <SelectItem value="Secondary">Secondary</SelectItem>
                              <SelectItem value="Agent">Agent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>Commission Value</Label>
                            <Input type="number" placeholder="5" min="0" />
                          </div>
                          <div className="space-y-2">
                            <Label>Commission Type</Label>
                            <Select defaultValue="percentage">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddPartnerModal(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            // Add partner logic would go here
                            addPartner({
                              partner_name_en: "New Partner",
                              partner_name_ar: "شريك جديد",
                              affiliation_type: "Secondary",
                              commission_type: "percentage",
                              commission_value: 5,
                              status: "active",
                            })
                            setShowAddPartnerModal(false)
                          }}
                        >
                          Add Partner
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Required Documents</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Configure document requirements and templates for applications
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {formData.documents.length} document(s) configured
                      </div>
                      <Button onClick={() => setShowAddDocumentModal(true)} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Document
                      </Button>
                    </div>

                    {formData.documents.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name (EN)</TableHead>
                              <TableHead>Name (AR)</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Required</TableHead>
                              <TableHead>Created By</TableHead>
                              <TableHead>Created Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {formData.documents.map((doc) => (
                              <TableRow key={doc.id}>
                                <TableCell>
                                  <Input
                                    value={doc.name_en}
                                    onChange={(e) => updateDocument(doc.id, "name_en", e.target.value)}
                                    className="w-40"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={doc.name_ar}
                                    onChange={(e) => updateDocument(doc.id, "name_ar", e.target.value)}
                                    className="w-40"
                                    dir="rtl"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={doc.type}
                                    onValueChange={(value: RequiredDocument["type"]) =>
                                      updateDocument(doc.id, "type", value)
                                    }
                                  >
                                    <SelectTrigger className="w-36">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ID">ID</SelectItem>
                                      <SelectItem value="Proof of Address">Proof of Address</SelectItem>
                                      <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                                      <SelectItem value="Income Certificate">Income Certificate</SelectItem>
                                      <SelectItem value="Business License">Business License</SelectItem>
                                      <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Switch
                                    checked={doc.required}
                                    onCheckedChange={(checked) => updateDocument(doc.id, "required", checked)}
                                  />
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{doc.created_by}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(doc.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={doc.status}
                                    onValueChange={(value: "required" | "optional" | "deprecated") =>
                                      updateDocument(doc.id, "status", value)
                                    }
                                  >
                                    <SelectTrigger className="w-24">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="required">Required</SelectItem>
                                      <SelectItem value="optional">Optional</SelectItem>
                                      <SelectItem value="deprecated">Deprecated</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeDocument(doc.id)}
                                      className="gap-1"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground border rounded-lg">
                        <p>No documents configured yet</p>
                        <p className="text-sm">Click "Add New Document" to get started</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Add Document Modal */}
                <Dialog open={showAddDocumentModal} onOpenChange={setShowAddDocumentModal}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label>Document Name (English)</Label>
                          <Input placeholder="e.g., National ID Copy" />
                        </div>
                        <div className="space-y-2">
                          <Label>Document Name (Arabic)</Label>
                          <Input placeholder="مثال: صورة الهوية الوطنية" dir="rtl" />
                        </div>
                        <div className="space-y-2">
                          <Label>Document Type</Label>
                          <Select defaultValue="ID">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ID">ID</SelectItem>
                              <SelectItem value="Proof of Address">Proof of Address</SelectItem>
                              <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                              <SelectItem value="Income Certificate">Income Certificate</SelectItem>
                              <SelectItem value="Business License">Business License</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="required-doc" defaultChecked />
                          <Label htmlFor="required-doc">Required Document</Label>
                        </div>
                        <div className="space-y-2">
                          <Label>Upload Sample/Template (Optional)</Label>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                              <Upload className="h-4 w-4" />
                              Choose File
                            </Button>
                            <span className="text-sm text-muted-foreground">No file selected</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Notes (English)</Label>
                          <Textarea placeholder="Additional instructions or notes..." rows={2} />
                        </div>
                        <div className="space-y-2">
                          <Label>Notes (Arabic)</Label>
                          <Textarea placeholder="تعليمات أو ملاحظات إضافية..." rows={2} dir="rtl" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddDocumentModal(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            // Add document logic would go here
                            addDocument({
                              name_en: "New Document",
                              name_ar: "مستند جديد",
                              type: "ID",
                              required: true,
                              notes_en: "",
                              notes_ar: "",
                              status: "required",
                            })
                            setShowAddDocumentModal(false)
                          }}
                        >
                          Add Document
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </TooltipProvider>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {/* <Button variant="outline" onClick={handleSaveDraft} className="gap-2 bg-transparent">
              Save Draft
            </Button> */}
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
            {currentStep < wizardSteps.length ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handlePublish} className="gap-2">
                Save & Publish
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
