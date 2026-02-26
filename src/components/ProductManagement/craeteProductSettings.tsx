import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "../../lib/router"
import { ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"
import { Tab, Tabs } from "react-bootstrap"
import { useLanguage } from "../../hooks/use-language"
import toast from "react-hot-toast"
import { createProductSettings, createProductTermsAndConditions, createCreditScoringCriteria, createAdminFeeSlabs, createDurationSettings, createApprovalWorkflowScenarios, getProductSettings, addSelectedNationalities } from "../../redux/apis/apisCrudProductManagement"
import Loader from "../Loader/Loader"
import ProductCreateEditTabs from "./ProductCreateEditTabs"


import TermsConditionsTab from "./tabs/TermsConditionsTab"
import EligibilityTab from "./tabs/EligibilityTab"
import FeeSettingsTab from "./tabs/FeeSettingsTab"
import ProductRulesTab from "./tabs/ProductRulesTab"
import IncomeSlabsTab from "./tabs/IncomeSlabsTab"
import AdminFeeSlabsTab from "./tabs/AdminFeeSlabsTab"
import DurationSettingsTab from "./tabs/DurationSettingsTab"
import ApprovalWorkflowsTab from "./tabs/ApprovalWorkflowsTab"
import CreditScoringTab from "./tabs/CreditScoringTab"

interface ApplicationStep {
  id: string
  title: string
  title_ar: string
  description: string
  required: boolean
  order: number
}

interface FeeSlab {
  id: string
  min_amount: number
  max_amount: number
  min_tenure: number
  max_tenure: number
  profit_percentage: number
  profit_type: "percentage" | "fixed"
  admin_fee: number
  type: "monthly" | "amount"
  processing_fee: number
  partner_scope: string
  status: "active" | "inactive"
}

interface CreditScoringRule {
  id: string
  operator: string
  value: string
  weight: number
}

interface ApprovalScenario {
  id: string
  name: string
  type: "manual" | "auto" | "rejection"
  conditions: ApprovalCondition[]
  actions: ApprovalAction[]
  priority: number
  enabled: boolean
  creditScoringRules?: CreditScoringRule[]
  creditScoringField?: string
}

interface ApprovalCondition {
  id: string
  field: string
  operator: string
  value: string
  logic: "AND" | "OR"
}

interface ApprovalAction {
  id: string
  type: string
  value: string
  delay_hours?: number
}

interface CreditScoringCriteria {
  id: string
  field: string
  value: string
  weight: number
  enabled: boolean
}

const defaultApplicationSteps: ApplicationStep[] = [
  {
    id: "1",
    title: "Application Submission",
    title_ar: "تقديم الطلب",
    description: "Customer submits initial application with basic information",
    required: true,
    order: 1,
  },
]

const conditionFields = [
  "dbr",
  "loan_amount",
  "credit_score",
  "simah",
  "risk_type",
  "pep",
]

const conditionOperators = [
  "<=",
  ">=",
  "=",
  "<",
  ">",
]

const actionTypes = [
  "Auto Approval",
  "Manual Approval",
  "Reject",
]

const creditScoringOperators = [
  "<=",
  ">=",
  "=",
  "<",
  ">",
]

// Helper function to map operator symbols to API format
const mapOperatorToApiFormat = (operator: string): string => {
  const operatorMap: Record<string, string> = {
    "<=": "less_than_or_equal",
    ">=": "greater_than_or_equal",
    "=": "equals",
    "<": "less_than",
    ">": "greater_than",
  }
  return operatorMap[operator] || operator
}

const predefinedWorkflowTemplates = {
  manual: [
    {
      name: "High-Value Manual Review",
      description: "Manual review required for loans above 500,000 SAR",
      conditions: [{ field: "loan_amount", operator: "greater_than", value: "500000", logic: "AND" as const }],
      actions: [
        { type: "assign_reviewer", value: "senior_underwriter" },
        { type: "send_notification", value: "High value loan requires manual review" },
      ],
    },
    {
      name: "Low Credit Score Review",
      description: "Manual review for applicants with credit score below 650",
      conditions: [{ field: "credit_score", operator: "less_than", value: "650", logic: "AND" as const }],
      actions: [
        { type: "assign_reviewer", value: "credit_specialist" },
        { type: "request_documents", value: "Additional income verification required" },
      ],
    },
    {
      name: "Complex Application Review",
      description: "Manual review for applications with multiple risk factors",
      conditions: [
        { field: "existing_loans", operator: "greater_than", value: "3", logic: "AND" as const },
        { field: "debt_to_income_ratio", operator: "greater_than", value: "40", logic: "AND" as const },
      ],
      actions: [
        { type: "assign_reviewer", value: "risk_manager" },
        { type: "schedule_call", value: "Schedule detailed review call" },
      ],
    },
  ],
  auto: [
    {
      name: "Prime Customer Auto-Approval",
      description: "Automatic approval for high-credit, low-risk customers",
      conditions: [
        { field: "credit_score", operator: "greater_equal", value: "750", logic: "AND" as const },
        { field: "monthly_income", operator: "greater_than", value: "15000", logic: "AND" as const },
        { field: "debt_to_income_ratio", operator: "less_than", value: "30", logic: "AND" as const },
      ],
      actions: [
        { type: "approve", value: "Auto-approved based on excellent credit profile" },
        { type: "calculate_offer", value: "Premium rate offer" },
      ],
    },
    {
      name: "Standard Auto-Approval",
      description: "Automatic approval for qualified standard applications",
      conditions: [
        { field: "credit_score", operator: "greater_equal", value: "680", logic: "AND" as const },
        { field: "employment_duration", operator: "greater_equal", value: "24", logic: "AND" as const },
        { field: "loan_amount", operator: "less_equal", value: "200000", logic: "AND" as const },
      ],
      actions: [
        { type: "approve", value: "Auto-approved for standard financing" },
        { type: "send_notification", value: "Congratulations! Your application has been approved" },
      ],
    },
    {
      name: "SME Fast-Track Approval",
      description: "Quick approval for established SME customers",
      conditions: [
        { field: "monthly_income", operator: "greater_than", value: "25000", logic: "AND" as const },
        { field: "existing_loans", operator: "less_equal", value: "1", logic: "AND" as const },
        { field: "age", operator: "greater_equal", value: "25", logic: "AND" as const },
      ],
      actions: [
        { type: "approve", value: "SME fast-track approval" },
        { type: "update_status", value: "approved_sme_track" },
      ],
    },
  ],
  rejection: [
    {
      name: "Insufficient Income Rejection",
      description: "Automatic rejection for insufficient income applications",
      conditions: [
        { field: "monthly_income", operator: "less_than", value: "5000", logic: "OR" as const },
        { field: "debt_to_income_ratio", operator: "greater_than", value: "60", logic: "OR" as const },
      ],
      actions: [
        { type: "reject", value: "Application rejected due to insufficient income or high debt ratio" },
        { type: "send_notification", value: "We regret to inform you that your application cannot be processed" },
      ],
    },
    {
      name: "Poor Credit History Rejection",
      description: "Automatic rejection for poor credit scores",
      conditions: [{ field: "credit_score", operator: "less_than", value: "550", logic: "AND" as const }],
      actions: [
        { type: "reject", value: "Application rejected due to credit history concerns" },
        { type: "send_notification", value: "Please improve your credit score and reapply after 6 months" },
      ],
    },
    {
      name: "Age Eligibility Rejection",
      description: "Automatic rejection for age-related eligibility issues",
      conditions: [
        { field: "age", operator: "less_than", value: "21", logic: "OR" as const },
        { field: "age", operator: "greater_than", value: "65", logic: "OR" as const },
      ],
      actions: [
        { type: "reject", value: "Application rejected due to age eligibility criteria" },
        { type: "send_notification", value: "Age requirements not met for this product" },
      ],
    },
    {
      name: "High-Risk Profile Rejection",
      description: "Automatic rejection for high-risk customer profiles",
      conditions: [
        { field: "existing_loans", operator: "greater_than", value: "5", logic: "AND" as const },
        { field: "credit_score", operator: "less_than", value: "600", logic: "AND" as const },
      ],
      actions: [
        { type: "reject", value: "Application rejected due to high-risk profile" },
        { type: "update_status", value: "rejected_high_risk" },
      ],
    },
  ],
}

const creditScoringFields = [
  "customer_type",
  "age_of_customer",
  "number_of_active_credit_products",
  "salary",
  "monthly_average_wallet_balance",
  "monthly_average_balance",
  "transaction_history_wallet",
  "job_type",
  "monthly_expenses_external",
  "write_offs",
  "credit_utilization",
  "debt_burden_ratio",
  "employment_tenure",
  "region",
  "credit_consumption",
  "barq_wallet_age_in_months",
  "monthly_average_wallet_expense",
  "monthly_average_expense",
  "monthly_income",
  "employment_status",
  "simah_score",
  "credit_enquiries",
  "average_monthly_barq_balance",
  "current_employment_tenure",
  "simah_credit_score",
  "average_monthly_balance",
  "barq_wallet_txn_activity",
  "external_account_txn_activity",
  "transaction_history_external",
  "total_working_months",
  "average_savings_external",
  "dpd_30_plus",
  "new_loans_availed",
  "monthly_expenditure_barq",
  "test",
]

export default function CraeteProductSettings() {
  const { isRTL } = useLanguage()
  const router = useRouter()

  const [formData, setFormData] = useState<any>({
    application_steps: defaultApplicationSteps,
    terms_conditions_en: "",
    terms_conditions_ar: "",
    eligibility_criteria_en: "",
    eligibility_criteria_ar: "",
    min_financing_amount: 1000,
    max_financing_amount: 1000000,
    suggested_financing_amount: 1500,
    min_income: 0,
    stress_buffer: 0,
    max_dti: 0,
    max_outstanding_balance: 0,
    age_at_maturity: 0,
    max_internal_payable_amount: null,
    simah_cooling_off_days: null,
    cooling_off: [],
    employment_status_vendor: "",
    commodity_vendor: "",
    eligible_nationalities: [],
    min_tenure: 6,
    max_tenure: 12,
    vat_percentage: 8,
    revenue_eligibility_threshold: 50000,
    dbr_percentage: 10,
    dbr_calculation_method: "gross_income",
    dbr_exceptions: [],
    gdbr_percentage: 10,
    credit_line_percentage: 10,
    min_age: 18,
    max_age: 65,
    admin_fee_slabs: [],
    api_configurations: [],
    request_duration: 30,
    approval_duration: 7,
    disbursement_duration: 3,
    repayment_duration: 365,
    approval_scenarios: [],
    credit_scoring_criteria: [],
    credit_scoring_fields: [
      {
        id: Date.now().toString(),
        field_name: "",
        rules: []
      }
    ],
    // Simah Check Rules fields
    minimum_simah_score_allowed: null,
    delinquency_allowed: false,
    stage2_allowed_last_12: null,
    stage3_allowed_last_12: null,
    max_utility_writeoff_amount: null,
    max_telecom_writeoff_amount: null,
    partial_settlements_allowed_last_12: null,
    bounced_cheques_allowed: false,
    default_allowed_last_12: false,
    writeoff_allowed_last_12: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [creditScoringErrors, setCreditScoringErrors] = useState<Record<string, string>>({})
  const [applicationStepsErrors, setApplicationStepsErrors] = useState<Record<string, Record<string, string>>>({})
  const [termsConditionsErrors, setTermsConditionsErrors] = useState<Record<string, string>>({})
  const [eligibilityErrors, setEligibilityErrors] = useState<Record<string, string>>({})
  const [approvalWorkflowsErrors, setApprovalWorkflowsErrors] = useState<Record<string, Record<string, string>>>({})
  const [simahCheckRulesErrors, setSimahCheckRulesErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const [activeTab, setActiveTab] = useState("terms")
  const [previewTemplate, setPreviewTemplate] = useState<{
    template: any
    type: "manual" | "auto" | "rejection"
    index: number
  } | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const tabOrder = [
    "terms",  
    "fee-settings",
    "product-rules",
    "eligibility",
    "income-slabs",
    "duration",
    "approval-workflows",
    "credit-scoring",
    "fee-slabs"
  ]

  const loadProductSettings = async (productId: string) => {
    try {
      setIsLoadingSettings(true)
      const response = await getProductSettings(productId)
      
      if (response?.data?.success && response?.data?.data) {
        const settingsData = response.data.data
        
        // Map application steps from product.application_steps
        const applicationSteps = settingsData.product?.application_steps?.map((step: any, index: number) => ({
          id: Date.now().toString() + index,
          title: step.title_en || "",
          title_ar: step.title_ar || "",
          description: step.description || "",
          required: true,
          order: index + 1,
        })) || []
        
        // Map terms and conditions from settings or legal_content
        let termsConditionsEn = settingsData.settings?.terms_conditions_en || ""
        let termsConditionsAr = settingsData.settings?.terms_conditions_ar || ""
        let eligibilityEn = settingsData.settings?.eligibility_criteria_en || ""
        let eligibilityAr = settingsData.settings?.eligibility_criteria_ar || ""
        
        // Also check legal_content array for terms and eligibility (if stored there)
        if (settingsData.product?.legal_content && Array.isArray(settingsData.product.legal_content)) {
          settingsData.product.legal_content.forEach((content: any) => {
            if (content.type === "terms_and_conditions") {
              if (content.locale === "en") {
                termsConditionsEn = content.content || termsConditionsEn
              } else if (content.locale === "ar") {
                termsConditionsAr = content.content || termsConditionsAr
              }
            } else if (content.type === "eligibility_criteria") {
              if (content.locale === "en") {
                eligibilityEn = content.content || eligibilityEn
              } else if (content.locale === "ar") {
                eligibilityAr = content.content || eligibilityAr
              }
            }
          })
        }
        
        // Update formData with loaded settings
        setFormData((prev: any) => ({
          ...prev,
          application_steps: applicationSteps.length > 0 ? applicationSteps : prev.application_steps,
          terms_conditions_en: termsConditionsEn || prev.terms_conditions_en,
          terms_conditions_ar: termsConditionsAr || prev.terms_conditions_ar,
          eligibility_criteria_en: eligibilityEn || prev.eligibility_criteria_en,
          eligibility_criteria_ar: eligibilityAr || prev.eligibility_criteria_ar,
          // Also update other settings if available
          min_financing_amount: settingsData.min_financing_amount ? parseFloat(settingsData.min_financing_amount) : prev.min_financing_amount,
          max_financing_amount: settingsData.max_financing_amount ? parseFloat(settingsData.max_financing_amount) : prev.max_financing_amount,
          suggested_financing_amount: settingsData.suggested_financing_amount ? parseFloat(settingsData.suggested_financing_amount) : prev.suggested_financing_amount,
          min_tenure: settingsData.min_tenure || prev.min_tenure,
          max_tenure: settingsData.max_tenure || prev.max_tenure,
          vat_percentage: settingsData.vat_percentage ? parseFloat(settingsData.vat_percentage) : prev.vat_percentage,
          revenue_eligibility_threshold: settingsData.min_annual_revenue ? parseFloat(settingsData.min_annual_revenue) : prev.revenue_eligibility_threshold,
          dbr_percentage: settingsData.maximum_dbr_percentage ? parseFloat(settingsData.maximum_dbr_percentage) : prev.dbr_percentage,
          dbr_calculation_method: settingsData.dbr_calculation_method || prev.dbr_calculation_method,
          dbr_exceptions: settingsData.dbr_exceptions || prev.dbr_exceptions,
          gdbr_percentage: settingsData.gdbr_percentage ? parseFloat(settingsData.gdbr_percentage) : prev.gdbr_percentage,
          credit_line_percentage: settingsData.credit_line_percentage ? parseFloat(settingsData.credit_line_percentage) : prev.credit_line_percentage,
          min_age: settingsData.min_age || prev.min_age,
          max_age: settingsData.max_age || prev.max_age,
          // Map processing_fee_slabs from the response (located at product.processing_fee_slabs)
          admin_fee_slabs: (() => {
            const processingFeeSlabs = settingsData.product?.processing_fee_slabs || []
            if (processingFeeSlabs.length > 0) {
              return processingFeeSlabs.map((slab: any) => ({
                id: String(slab.id),
                min_amount: slab.from_amount ? parseFloat(slab.from_amount) : 0,
                max_amount: slab.to_amount ? parseFloat(slab.to_amount) : 0,
                min_tenure: slab.min_tenure !== null && slab.min_tenure !== undefined ? parseInt(String(slab.min_tenure)) : 1,
                max_tenure: slab.max_tenure !== null && slab.max_tenure !== undefined ? parseInt(String(slab.max_tenure)) : 6,
                profit_percentage: slab.profit ? parseFloat(slab.profit) : 0,
                profit_type: slab.profit_type || "percentage",
                admin_fee: slab.admin_fee ? parseFloat(slab.admin_fee) : 0,
                type: slab.type || "monthly",
                processing_fee: slab.processing_fee ? parseFloat(slab.processing_fee) : 0,
                partner_scope: slab.partner_scope === null ? "all" : slab.partner_scope,
                status: slab.status === 1 ? "active" : "inactive"
              }))
            }
            return prev.admin_fee_slabs
          })(),
          request_duration: settingsData.settings?.request_duration || prev.request_duration,
          approval_duration: settingsData.settings?.approval_duration || prev.approval_duration,
          disbursement_duration: settingsData.settings?.disbursement_duration || prev.disbursement_duration,
          repayment_duration: settingsData.settings?.repayment_duration || prev.repayment_duration,
          approval_scenarios: settingsData.settings?.approval_scenarios || prev.approval_scenarios,
          credit_scoring_criteria: settingsData.settings?.credit_scoring_criteria || prev.credit_scoring_criteria,
          min_income: settingsData.min_income || prev.min_income,
          stress_buffer: settingsData.stress_buffer || prev.stress_buffer,
          max_dti: settingsData.max_dti || prev.max_dti,
          max_outstanding_balance: settingsData.max_outstanding_balance || prev.max_outstanding_balance,
          age_at_maturity: settingsData.age_at_maturity || prev.age_at_maturity,
          max_internal_payable_amount: settingsData.max_internal_payable_amount ?? prev.max_internal_payable_amount,
          simah_cooling_off_days: settingsData.simah_cooling_off_days ?? prev.simah_cooling_off_days,
          // Map cooling_off from settings (if available) or initialize as empty array
          cooling_off: (() => {
            const coolingOffData = settingsData.settings?.cooling_off || []
            if (Array.isArray(coolingOffData) && coolingOffData.length > 0) {
              return coolingOffData.map((entry: any, index: number) => ({
                id: entry.id || Date.now().toString() + index,
                loan_type: entry.loan_type || "",
                loan_days: entry.loan_days || 0
              }))
            }
            return prev.cooling_off || []
          })(),
          employment_status_vendor: settingsData.settings?.employment_status_vendor || prev.employment_status_vendor,
          commodity_vendor: settingsData.settings?.commodity_vendor || prev.commodity_vendor,
          // eligible_nationalities will be loaded separately via getSelectedNationalities API
          eligible_nationalities: prev.eligible_nationalities || [],
          // Simah Check Rules fields
          minimum_simah_score_allowed: settingsData.minimum_simah_score_allowed ?? prev.minimum_simah_score_allowed,
          delinquency_allowed: settingsData.delinquency_allowed === true || settingsData.delinquency_allowed === 1 ? true : false,
          stage2_allowed_last_12: settingsData.stage2_allowed_last_12 ?? prev.stage2_allowed_last_12,
          stage3_allowed_last_12: settingsData.stage3_allowed_last_12 ?? prev.stage3_allowed_last_12,
          max_utility_writeoff_amount: settingsData.max_utility_writeoff_amount ?? prev.max_utility_writeoff_amount,
          max_telecom_writeoff_amount: settingsData.max_telecom_writeoff_amount ?? prev.max_telecom_writeoff_amount,
          partial_settlements_allowed_last_12: settingsData.partial_settlements_allowed_last_12 ?? prev.partial_settlements_allowed_last_12,
          bounced_cheques_allowed: settingsData.bounced_cheques_allowed === true || settingsData.bounced_cheques_allowed === 1 ? true : false,
          default_allowed_last_12: settingsData.default_allowed_last_12 === true || settingsData.default_allowed_last_12 === 1 ? true : false,
          writeoff_allowed_last_12: settingsData.writeoff_allowed_last_12 === true || settingsData.writeoff_allowed_last_12 === 1 ? true : false,
        }))
      }
    }  finally {
      setIsLoadingSettings(false)
    }
  }

  const [productId, setProductId] = useState<string | null>(null)
  const [productTypeName, setProductTypeName] = useState<string>("")
  const [searchParams] = useSearchParams()
  const productIdFromUrl = searchParams.get("id")

  useEffect(() => {
    const savedData = sessionStorage.getItem("settingsFormData")
    if (savedData) {
      setFormData(JSON.parse(savedData))
    }
    
    // Load product type from basic info form data
    const basicInfoData = localStorage.getItem("productBasicInfoFormData")
    if (basicInfoData) {
      try {
        const parsedBasicInfo = JSON.parse(basicInfoData)
        // Get product type name - check for stored product type name or derive from product_type_id
        if (parsedBasicInfo.product_type_name) {
          setProductTypeName(parsedBasicInfo.product_type_name.toLowerCase())
        } else if (parsedBasicInfo.product_type_id) {
          // Store the product type id and we'll use it to determine the type
          // Common pattern: 1 = Individual, 2 = Company (adjust based on actual data)
          const typeId = String(parsedBasicInfo.product_type_id)
          // We'll pass the ID and let the component handle the logic
          setProductTypeName(typeId)
        }
      } catch (e) {
        console.error("Error parsing basic info data:", e)
      }
    }
    
    // Load product settings if productId exists (from URL or sessionStorage)
    const effectiveProductId = productIdFromUrl || sessionStorage.getItem("productId")
    if (effectiveProductId) {
      setProductId(effectiveProductId)
      sessionStorage.setItem("productId", effectiveProductId)
      loadProductSettings(effectiveProductId)
    } else {
      toast.error("Product ID not found. Please start from Basic Information.")
      router.push("/Los/ProductManagement/Create/BasicInfo")
    }
  }, [productIdFromUrl])

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    // Clear credit scoring errors when user starts typing
    if (activeTab === "credit-scoring" && creditScoringErrors[field]) {
      const newErrors = { ...creditScoringErrors }
      delete newErrors[field]
      setCreditScoringErrors(newErrors)
    }
    // Clear terms conditions errors when user starts typing
    if (activeTab === "terms" && termsConditionsErrors[field]) {
      const newErrors = { ...termsConditionsErrors }
      delete newErrors[field]
      setTermsConditionsErrors(newErrors)
    }
    // Clear eligibility errors when user starts typing
    if (activeTab === "eligibility" && eligibilityErrors[field]) {
      const newErrors = { ...eligibilityErrors }
      delete newErrors[field]
      setEligibilityErrors(newErrors)
    }
    // Clear simah check rules errors when user starts typing (in product-rules tab)
    if (activeTab === "product-rules" && simahCheckRulesErrors[field]) {
      const newErrors = { ...simahCheckRulesErrors }
      delete newErrors[field]
      setSimahCheckRulesErrors(newErrors)
    }
  }

  const updateApplicationStep = (id: string, field: keyof ApplicationStep, value: any) => {
    const updatedSteps = formData.application_steps.map((step: any) =>
      step.id === id ? { ...step, [field]: value } : step
    )
    updateFormData("application_steps", updatedSteps)
    
    // Clear errors for this step's field when user starts typing
    if (activeTab === "application-steps") {
      const stepIndex = formData.application_steps.findIndex((s: any) => s.id === id)
      if (stepIndex !== -1 && applicationStepsErrors[stepIndex.toString()]?.[field]) {
        const newErrors = { ...applicationStepsErrors }
        if (newErrors[stepIndex.toString()]) {
          delete newErrors[stepIndex.toString()][field]
          if (Object.keys(newErrors[stepIndex.toString()]).length === 0) {
            delete newErrors[stepIndex.toString()]
          }
        }
        setApplicationStepsErrors(newErrors)
      }
    }
  }

  const addApplicationStep = () => {
    const newStep: ApplicationStep = {
      id: Date.now().toString(),
      title: "",
      title_ar: "",
      description: "",
      required: false,
      order: formData.application_steps.length + 1,
    }
    updateFormData("application_steps", [...formData.application_steps, newStep])
  }

  const removeApplicationStep = (id: string) => {
    updateFormData(
      "application_steps",
      formData.application_steps.filter((s: any) => s.id !== id),
    )
  }

  const addFeeSlab = () => {
    const newSlab: FeeSlab = {
      id: Date.now().toString(),
      min_amount: 0,
      max_amount: 10000,
      min_tenure: 1,
      max_tenure: 6,
      profit_percentage: 5,
      profit_type: "percentage",
      admin_fee: 0,
      type: "monthly",
      processing_fee: 100,
      partner_scope: "all",
      status: "active",
    }
    updateFormData("admin_fee_slabs", [...formData.admin_fee_slabs, newSlab])
  }

  const removeFeeSlab = (id: string) => {
    updateFormData(
      "admin_fee_slabs",
      formData.admin_fee_slabs.filter((s: any) => s.id !== id),
    )
  }

  const updateFeeSlab = (id: string, field: keyof FeeSlab, value: any) => {
    const updatedSlabs = formData.admin_fee_slabs.map((s: any) => (s.id === id ? { ...s, [field]: value } : s))
    updateFormData("admin_fee_slabs", updatedSlabs)
  }

  const addApprovalScenario = (type: "manual" | "auto" | "rejection") => {
    // Create default condition with first values
    const defaultCondition: ApprovalCondition = {
      id: Date.now().toString() + "-condition",
      field: conditionFields[0] || "dbr",
      operator: conditionOperators[0] || "<=",
      value: "",
      logic: "AND",
    }

    // Create default action with first value
    const defaultAction: ApprovalAction = {
      id: Date.now().toString() + "-action",
      type: actionTypes[0] || "Auto Approval",
      value: "",
    }

    const newScenario: ApprovalScenario = {
      id: Date.now().toString(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Scenario`,
      type,
      conditions: [defaultCondition],
      actions: [defaultAction],
      priority: formData.approval_scenarios.length + 1,
      enabled: true,
      creditScoringRules: type === "auto" ? [] : undefined,
      creditScoringField: type === "auto" ? "" : undefined,
    }
    updateFormData("approval_scenarios", [...formData.approval_scenarios, newScenario])
  }

  const loadPredefinedWorkflow = (type: "manual" | "auto" | "rejection", templateIndex: number) => {
    const template = predefinedWorkflowTemplates[type][templateIndex]
    if (!template) return

    const newScenario: ApprovalScenario = {
      id: Date.now().toString(),
      name: template.name,
      type,
      conditions: template.conditions.map((condition, index) => ({
        id: `${Date.now()}-${index}`,
        ...condition,
      })),
      actions: template.actions.map((action, index) => ({
        id: `${Date.now()}-${index}`,
        ...action,
      })),
      priority: formData.approval_scenarios.length + 1,
      enabled: true,
      creditScoringRules: type === "auto" ? [] : undefined,
      creditScoringField: type === "auto" ? "" : undefined,
    }
    updateFormData("approval_scenarios", [...formData.approval_scenarios, newScenario])
  }

  const openTemplatePreview = (type: "manual" | "auto" | "rejection", templateIndex: number) => {
    const template = predefinedWorkflowTemplates[type][templateIndex]
    if (!template) return

    setPreviewTemplate({ template, type, index: templateIndex })
    setIsPreviewOpen(true)
  }

  const applyTemplateFromPreview = () => {
    if (!previewTemplate) return

    loadPredefinedWorkflow(previewTemplate.type, previewTemplate.index)
    setIsPreviewOpen(false)
    setPreviewTemplate(null)
  }

  const addConditionToScenario = (scenarioId: string) => {
    const newCondition: ApprovalCondition = {
      id: Date.now().toString(),
      field: conditionFields[0] || "dbr",
      operator: conditionOperators[0] || "<=",
      value: "",
      logic: "AND",
    }

    const updatedScenarios = formData.approval_scenarios.map((s: any) =>
      s.id === scenarioId ? { ...s, conditions: [...s.conditions, newCondition] } : s,
    )
    updateFormData("approval_scenarios", updatedScenarios)
  }

  const addActionToScenario = (scenarioId: string) => {
    const newAction: ApprovalAction = {
      id: Date.now().toString(),
      type: actionTypes[0] || "Auto Approval",
      value: "",
    }

    const updatedScenarios = formData.approval_scenarios.map((s: any) =>
      s.id === scenarioId ? { ...s, actions: [...s.actions, newAction] } : s,
    )
    updateFormData("approval_scenarios", updatedScenarios)
  }

  const addCreditScoringCriteria = () => {
    const newCriteria: CreditScoringCriteria = {
      id: Date.now().toString(),
      field: "customer_type",
      value: "No data available",
      weight: 1,
      enabled: true,
    }
    updateFormData("credit_scoring_criteria", [...formData.credit_scoring_criteria, newCriteria])
  }

  const addCreditScoringField = () => {
    const newField = {
      id: Date.now().toString(),
      field_name: "",
      rules: []
    }
    const currentFields = Array.isArray(formData.credit_scoring_fields) 
      ? formData.credit_scoring_fields 
      : []
    updateFormData("credit_scoring_fields", [...currentFields, newField])
  }

  const removeCreditScoringField = (fieldId: string) => {
    const currentFields = Array.isArray(formData.credit_scoring_fields) 
      ? formData.credit_scoring_fields 
      : []
    if (currentFields.length > 1) {
      updateFormData(
        "credit_scoring_fields",
        currentFields.filter((f: any) => f.id !== fieldId),
      )
    }
  }

  const updateCreditScoringFieldName = (fieldId: string, fieldName: string) => {
    const currentFields = Array.isArray(formData.credit_scoring_fields) 
      ? formData.credit_scoring_fields 
      : []
    const updatedFields = currentFields.map((f: any) =>
      f.id === fieldId ? { ...f, field_name: fieldName } : f,
    )
    updateFormData("credit_scoring_fields", updatedFields)
  }

  const addCreditScoringRule = (fieldId: string) => {
    const newRule: CreditScoringRule = {
      id: Date.now().toString(),
      operator: creditScoringOperators[0] || "<=",
      value: "",
      weight: 1,
    }
    const currentFields = Array.isArray(formData.credit_scoring_fields) 
      ? formData.credit_scoring_fields 
      : []
    const updatedFields = currentFields.map((f: any) =>
      f.id === fieldId ? { ...f, rules: [...(f.rules || []), newRule] } : f,
    )
    updateFormData("credit_scoring_fields", updatedFields)
  }

  const removeCreditScoringRule = (fieldId: string, ruleId: string) => {
    const currentFields = Array.isArray(formData.credit_scoring_fields) 
      ? formData.credit_scoring_fields 
      : []
    const updatedFields = currentFields.map((f: any) =>
      f.id === fieldId
        ? { ...f, rules: (f.rules || []).filter((r: any) => r.id !== ruleId) }
        : f,
    )
    updateFormData("credit_scoring_fields", updatedFields)
  }

  const updateCreditScoringRule = (fieldId: string, ruleId: string, field: string, value: any) => {
    const currentFields = Array.isArray(formData.credit_scoring_fields) 
      ? formData.credit_scoring_fields 
      : []
    const updatedFields = currentFields.map((f: any) =>
      f.id === fieldId
        ? {
            ...f,
            rules: (f.rules || []).map((r: any) =>
              r.id === ruleId ? { ...r, [field]: value } : r,
            ),
          }
        : f,
    )
    updateFormData("credit_scoring_fields", updatedFields)
  }

  // const addCreditScoringRuleToScenario = (scenarioId: string) => {
  //   const newRule: CreditScoringRule = {
  //     id: Date.now().toString(),
  //     operator: "<=",
  //     value: "",
  //     weight: 1,
  //   }

  //   const updatedScenarios = formData.approval_scenarios.map((s: any) =>
  //     s.id === scenarioId
  //       ? {
  //           ...s,
  //           creditScoringRules: [...(s.creditScoringRules || []), newRule],
  //         }
  //       : s,
  //   )
  //   updateFormData("approval_scenarios", updatedScenarios)
  // }

  // const removeCreditScoringRuleFromScenario = (scenarioId: string, ruleId: string) => {
  //   const updatedScenarios = formData.approval_scenarios.map((s: any) =>
  //     s.id === scenarioId
  //       ? {
  //           ...s,
  //           creditScoringRules: (s.creditScoringRules || []).filter((r: any) => r.id !== ruleId),
  //         }
  //       : s,
  //   )
  //   updateFormData("approval_scenarios", updatedScenarios)
  // }

  // const updateCreditScoringRuleInScenario = (scenarioId: string, ruleId: string, field: string, value: any) => {
  //   const updatedScenarios = formData.approval_scenarios.map((s: any) =>
  //     s.id === scenarioId
  //       ? {
  //           ...s,
  //           creditScoringRules: (s.creditScoringRules || []).map((r: any) =>
  //             r.id === ruleId ? { ...r, [field]: value } : r,
  //           ),
  //         }
  //       : s,
  //   )
  //   updateFormData("approval_scenarios", updatedScenarios)
  // }

  const removeCreditScoringCriteria = (id: string) => {
    updateFormData(
      "credit_scoring_criteria",
      formData.credit_scoring_criteria.filter((c: any) => c.id !== id),
    )
  }

  const updateCreditScoringCriteria = (id: string, field: string, value: any) => {
    const updatedCriteria = formData.credit_scoring_criteria.map((c: any) => (c.id === id ? { ...c, [field]: value } : c))
    updateFormData("credit_scoring_criteria", updatedCriteria)
  }

  const buildApiPayload = (currentFormData: any) => {
    const applicationSteps = currentFormData.application_steps.map((step: any) => ({
      title_ar: step.title_ar,
      title_en: step.title,
      description: step.description
    }))
    
    const directFields = {
      application_steps: applicationSteps,
      min_financing_amount: currentFormData.min_financing_amount,
      max_financing_amount: currentFormData.max_financing_amount,
      suggested_financing_amount: currentFormData.suggested_financing_amount,
      min_tenure: currentFormData.min_tenure,
      max_tenure: currentFormData.max_tenure,
      maximum_dbr_percentage: currentFormData.dbr_percentage,
      dbr_calculation_method: currentFormData.dbr_calculation_method,
      dbr_exceptions: currentFormData.dbr_exceptions || [],
      vat_percentage: currentFormData.vat_percentage,
      min_annual_revenue: currentFormData.revenue_eligibility_threshold,
      gdbr_percentage: currentFormData.gdbr_percentage,
      credit_line_percentage: currentFormData.credit_line_percentage,
      min_age: currentFormData.min_age,
      max_age: currentFormData.max_age,
      min_income: currentFormData.min_income,
      stress_buffer: currentFormData.stress_buffer,
      max_dti: currentFormData.max_dti,
      max_outstanding_balance: currentFormData.max_outstanding_balance,
      age_at_maturity: currentFormData.age_at_maturity,
      max_internal_payable_amount: currentFormData.max_internal_payable_amount,
      simah_cooling_off_days: currentFormData.simah_cooling_off_days,
      // Simah Check Rules fields
      minimum_simah_score_allowed: currentFormData.minimum_simah_score_allowed,
      delinquency_allowed: currentFormData.delinquency_allowed,
      stage2_allowed_last_12: currentFormData.stage2_allowed_last_12,
      stage3_allowed_last_12: currentFormData.stage3_allowed_last_12,
      max_utility_writeoff_amount: currentFormData.max_utility_writeoff_amount,
      max_telecom_writeoff_amount: currentFormData.max_telecom_writeoff_amount,
      partial_settlements_allowed_last_12: currentFormData.partial_settlements_allowed_last_12,
      bounced_cheques_allowed: currentFormData.bounced_cheques_allowed,
      default_allowed_last_12: currentFormData.default_allowed_last_12,
      writeoff_allowed_last_12: currentFormData.writeoff_allowed_last_12,
      commodity_vendor: currentFormData.commodity_vendor,
      employment_status_vendor: currentFormData.employment_status_vendor,
    }

    const settingsFields = {
      terms_conditions_en: currentFormData.terms_conditions_en,
      terms_conditions_ar: currentFormData.terms_conditions_ar,
      eligibility_criteria_en: currentFormData.eligibility_criteria_en,
      eligibility_criteria_ar: currentFormData.eligibility_criteria_ar,
      admin_fee_slabs: currentFormData.admin_fee_slabs,
      api_configurations: currentFormData.api_configurations,
      request_duration: currentFormData.request_duration,
      approval_duration: currentFormData.approval_duration,
      disbursement_duration: currentFormData.disbursement_duration,
      repayment_duration: currentFormData.repayment_duration,
      approval_scenarios: currentFormData.approval_scenarios,
      credit_scoring_criteria: currentFormData.credit_scoring_criteria,
      cooling_off: Array.isArray(currentFormData.cooling_off) 
        ? currentFormData.cooling_off.map((entry: any) => ({
            loan_type: entry.loan_type || "",
            loan_days: entry.loan_days || 0
          }))
        : [],
     
     
      // Note: eligible_nationalities is NOT included here - it's sent separately via addSelectedNationalities API
    }

    return {
      ...directFields,
      settings: settingsFields
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (formData.application_steps.length === 0) {
      newErrors.application_steps = "At least one application step is required"
    }

    if (formData.min_financing_amount <= 0) {
      newErrors.min_financing_amount = "Minimum financing amount must be greater than 0"
    }

    if (formData.max_financing_amount <= formData.min_financing_amount) {
      newErrors.max_financing_amount = "Maximum financing amount must be greater than minimum"
    }

    if (formData.vat_percentage < 0 || formData.vat_percentage > 100) {
      newErrors.vat_percentage = "VAT percentage must be between 0 and 100"
    }

    if (formData.dbr_percentage < 0 || formData.dbr_percentage > 100) {
      newErrors.dbr_percentage = "DBR percentage must be between 0 and 100"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    // if (validateForm()) {
    //   try {
    //   setIsLoading(true)
        
    //     const productId = sessionStorage.getItem("productId")
        
    //     if (!productId) {
    //       toast.error("Product ID not found. Please complete Basic Information step first.")
    //     setIsLoading(false)
    //       return
    //     }

    //     const payload = buildApiPayload(formData)
        
    //     console.log("Final settings payload:", payload)

    //     const response = await createProductSettings(productId, payload)
        
    //     if (response?.data?.success) {
    //       const autoApprovalScenarios = formData.approval_scenarios.filter(
    //         (s: any) => s.type === "auto" && s.enabled && s.creditScoringRules && s.creditScoringRules.length > 0
    //       )
          
    //       if (autoApprovalScenarios.length > 0) {
    //         console.log("Saving credit scoring criteria from auto-approval workflows...")
            
    //         let successCount = 0
    //         let errorCount = 0
            
    //         for (const scenario of autoApprovalScenarios) {
    //           const criteriaPayload = {
    //             product_id: parseInt(productId),
    //             name: scenario.creditScoringField || scenario.name,
    //             rules: scenario.creditScoringRules.map((rule: any) => ({
    //               operator: rule.operator,
    //               value: rule.value,
    //               weight: rule.weight
    //             }))
    //           }
              
    //           console.log("Sending credit scoring criteria:", criteriaPayload)
              
    //           try {
    //             const criteriaResponse = await createCreditScoringCriteria(criteriaPayload)
    //             if (criteriaResponse?.data?.success) {
    //               successCount++
    //             } else {
    //               errorCount++
    //               console.warn(`Failed to save criteria for ${scenario.name}:`, criteriaResponse?.data?.message)
    //             }
    //           } catch (criteriaError: any) {
    //             errorCount++
    //             console.error(`Error saving criteria for ${scenario.name}:`, criteriaError)
    //           }
    //         }
            
    //         if (successCount > 0) {
    //           toast.success(`Settings saved! Credit scoring: ${successCount} successful${errorCount > 0 ? `, ${errorCount} failed` : ''}`)
    //         } else if (errorCount > 0) {
    //           toast.error("Settings saved but failed to save credit scoring criteria")
    //         } else {
    //           toast.success("Settings saved successfully!")
    //         }
    //       } else {
    //         toast.success("Settings saved successfully!")
    //       }
          
    //       sessionStorage.setItem("settingsFormData", JSON.stringify(formData))
          
    //     router.push("/Los/ProductManagement/Create/ProductAffiliation")
    //     } else {
    //       toast.error(response?.data?.message || "Failed to save settings")
    //     }
    //   } catch (error: any) {
    //     console.error("Error saving settings:", error)
    //     toast.error(error?.response?.data?.message || error?.message || "Failed to save settings")
    //   } finally {
    //     setIsLoading(false)
    //   }
    // }
  }

  const handlePrevious = async () => {
    try {
    sessionStorage.setItem("settingsFormData", JSON.stringify(formData))
      
      const productId = sessionStorage.getItem("productId")
      if (productId) {
        const payload = buildApiPayload(formData)
        await createProductSettings(productId, payload)
      }
    } catch (error) {
      console.error("Error saving settings on previous:", error)
    } finally {
    router.push("/Los/ProductManagement/Create/BasicInfo")
    }
  }

  // Handler for fee-settings tab - saves without navigation
  const handleFeeSettingsSave = async () => {
    try {
      setIsLoading(true)
      const productId = sessionStorage.getItem("productId")
      
      if (!productId) {
        toast.error("Product ID not found")
        return
      }

      const payload = buildApiPayload(formData)
      const response = await createProductSettings(productId, payload)
      
      if (response?.data?.success) {
        sessionStorage.setItem("settingsFormData", JSON.stringify(formData))
        toast.success("Fee settings saved successfully!")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save fee settings")
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for product-rules tab - saves without navigation
  const handleProductRulesSave = async () => {
    try {
      setIsLoading(true)
      const productId = sessionStorage.getItem("productId")
      
      if (!productId) {
        toast.error("Product ID not found")
        return
      }

      const payload = buildApiPayload(formData)
      const response = await createProductSettings(productId, payload)
      
      if (response?.data?.success) {
        // Save nationalities if any are selected
        if (formData.eligible_nationalities && formData.eligible_nationalities.length > 0) {
          const nationalitiesPayload = {
            product_id: parseInt(productId),
            country_ids: formData.eligible_nationalities.map((id: string) => parseInt(id))
          }
          await addSelectedNationalities(productId, nationalitiesPayload)
        }
        
        sessionStorage.setItem("settingsFormData", JSON.stringify(formData))
        toast.success("Product rules saved successfully!")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save product rules")
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for eligibility tab - saves and navigates to next tab
  const handleEligibilitySave = async () => {
    try {
      setIsLoading(true)
      const productId = sessionStorage.getItem("productId")
      
      if (!productId) {
        toast.error("Product ID not found")
        return
      }

      const eligibilityPayload = {
        product_content: [
          {
            locale: "en",
            content: formData.eligibility_criteria_en || "",
            type: "eligibility_criteria"
          },
          {
            locale: "ar",
            content: formData.eligibility_criteria_ar || "",
            type: "eligibility_criteria"
          }
        ]
      }
      
      const response = await createProductTermsAndConditions(productId, eligibilityPayload)
      
      if (response?.data?.success) {
        sessionStorage.setItem("settingsFormData", JSON.stringify(formData))
        toast.success("Eligibility criteria saved successfully!")
        
        // Navigate to next tab (income-slabs)
        const currentIndex = tabOrder.indexOf("eligibility")
        if (currentIndex < tabOrder.length - 1) {
          setActiveTab(tabOrder[currentIndex + 1])
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save eligibility criteria")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabNext = async () => {
    try {
      setIsLoading(true)
      
      const productId = sessionStorage.getItem("productId")
      
      if (!productId) {
        toast.error("Product ID not found. Please complete Basic Information step first.")
        setIsLoading(false)
        return
      }

      let response;

      if (activeTab === "terms") {
        // Clear previous errors
        setTermsConditionsErrors({})
        
        const termsPayload = {
          product_content: [
            {
              locale: "en",
              content: formData.terms_conditions_en || "",
              type: "terms_and_conditions"
            },
            {
              locale: "ar",
              content: formData.terms_conditions_ar || "",
              type: "terms_and_conditions"
            }
          ]
        }
        
       

        response = await createProductTermsAndConditions(productId, termsPayload)
      } else if (activeTab === "eligibility") {
        // Clear previous errors
        setEligibilityErrors({})
        
        const eligibilityPayload = {
          product_content: [
            {
              locale: "en",
              content: formData.eligibility_criteria_en || "",
              type: "eligibility_criteria"
            },
            {
              locale: "ar",
              content: formData.eligibility_criteria_ar || "",
              type: "eligibility_criteria"
            }
          ]
        }
        
       

        response = await createProductTermsAndConditions(productId, eligibilityPayload)
      } else if (activeTab === "admin-fees") {
        const adminFeeSlabsPayload = formData.admin_fee_slabs.map((slab: any) => ({
          partner_company_id:null,
          from_amount: String(slab.min_amount),
          to_amount: String(slab.max_amount),
          min_tenure: slab.min_tenure || 1,
          max_tenure: slab.max_tenure || 6,
          profit: String(slab.profit_percentage),
          profit_type: slab.profit_type || "percentage",
          processing_fee: String(slab.processing_fee),
          admin_fee: String(slab.admin_fee),
          type: slab.type,
          partner_scope: slab.partner_scope === "all" ? null : slab.partner_scope,
          // Backend expects boolean true/false for status
          status: slab.status === "active"
        }))
        
       

        response = await createAdminFeeSlabs({product_id: parseInt(productId),fee_slabs:adminFeeSlabsPayload})
      } else if (activeTab === "duration") {
        const durationPayload = {
          product_id: parseInt(productId),
          approval_duration_days: formData.approval_duration,
          disbursement_duration_days: formData.disbursement_duration,
          repayment_duration_days: formData.repayment_duration,
          request_duration_days: formData.request_duration
        }
        


        response = await createDurationSettings(durationPayload)
      } else if (activeTab === "approval-workflows") {
        // Clear previous errors
        setApprovalWorkflowsErrors({})
        
        let successCount = 0
        let errorCount = 0
        const scenarioErrors: Record<string, Record<string, string>> = {}
        
        for (const scenario of formData.approval_scenarios) {
          const scenarioPayload = {
            product_id: parseInt(productId),
            scenario_name: scenario.name,
            priority: scenario.priority,
            scenario_type: scenario.type =="auto" ? "approval" : scenario.name == "manual" ? "manual" : "rejection",
            is_active: scenario.enabled,
            conditions: scenario.conditions.map((condition: any, index: number) => ({
              field: condition.field,
              operator: mapOperatorToApiFormat(condition.operator),
              value: condition.value,
              logical_operator: index === scenario.conditions.length - 1 ? null : condition.logic
            })),
            actions: scenario.actions.map((action: any) => ({
              action_type: action.type =="Auto Approval" ? "approve" : scenario.name == "Manual Approval" ? "manual" : "reject",
              action_value: action.value,
              delay_hours: action.delay_hours || 0
            }))
          }
          
         

          try {
            const scenarioResponse = await createApprovalWorkflowScenarios(scenarioPayload)
            if (scenarioResponse?.data?.success) {
              successCount++
            } else {
              errorCount++
              // Parse errors for this scenario
              const apiErrors = scenarioResponse?.data?.errors || {}
              const errorsForScenario: Record<string, string> = {}
              
              Object.keys(apiErrors).forEach((errorKey) => {
                // Handle direct field errors like "scenario_name"
                if (!errorKey.includes('.')) {
                  const errorMessage = Array.isArray(apiErrors[errorKey]) ? apiErrors[errorKey][0] : apiErrors[errorKey]
                  errorsForScenario[errorKey] = errorMessage
                } else {
                  // Handle nested errors like "conditions.0.operator"
                  const match = errorKey.match(/^conditions\.(\d+)\.(.+)$/)
                  if (match) {
                    const conditionIndex = match[1]
                    const field = match[2]
                    const errorMessage = Array.isArray(apiErrors[errorKey]) ? apiErrors[errorKey][0] : apiErrors[errorKey]
                    errorsForScenario[`conditions.${conditionIndex}.${field}`] = errorMessage
                  }
                }
              })
              
              if (Object.keys(errorsForScenario).length > 0) {
                scenarioErrors[scenario.id] = errorsForScenario
              }
              
              console.warn(`Failed to save scenario ${scenario.name}:`, scenarioResponse?.data?.message)
            }
          } catch (scenarioError: any) {
            errorCount++
            // Parse errors from catch block
            const apiErrors = scenarioError?.response?.data?.errors || {}
            const errorsForScenario: Record<string, string> = {}
            
            Object.keys(apiErrors).forEach((errorKey) => {
              if (!errorKey.includes('.')) {
                const errorMessage = Array.isArray(apiErrors[errorKey]) ? apiErrors[errorKey][0] : apiErrors[errorKey]
                errorsForScenario[errorKey] = errorMessage
              } else {
                const match = errorKey.match(/^conditions\.(\d+)\.(.+)$/)
                if (match) {
                  const conditionIndex = match[1]
                  const field = match[2]
                  const errorMessage = Array.isArray(apiErrors[errorKey]) ? apiErrors[errorKey][0] : apiErrors[errorKey]
                  errorsForScenario[`conditions.${conditionIndex}.${field}`] = errorMessage
                }
              }
            })
            
            if (Object.keys(errorsForScenario).length > 0) {
              scenarioErrors[scenario.id] = errorsForScenario
            }
            
            console.error(`Error saving scenario ${scenario.name}:`, scenarioError)
          }
        }
        
        // Set errors for all scenarios
        if (Object.keys(scenarioErrors).length > 0) {
          setApprovalWorkflowsErrors(scenarioErrors)
        }
        
        if (successCount > 0) {
          response = { data: { success: true } }
          if (errorCount > 0) {
            toast.success(`Approval workflows saved! ${successCount} successful, ${errorCount} failed`)
          } else {
            toast.success(`All ${successCount} approval workflow scenarios saved successfully!`)
          }
        } else if (errorCount > 0) {
          // Show first error from first scenario
          const firstScenarioId = Object.keys(scenarioErrors)[0]
          if (firstScenarioId && scenarioErrors[firstScenarioId]) {
            const firstError = Object.values(scenarioErrors[firstScenarioId])[0]
            if (firstError) {
              toast.error(firstError)
            } else {
              toast.error("Failed to save approval workflow scenarios")
            }
          } else {
            toast.error("Failed to save approval workflow scenarios")
          }
          response = { data: { success: false } }
        } else {
          response = { data: { success: true } }
          toast.success("No approval scenarios to save")
        }
      } else if (activeTab === "product-rules") {
        // Clear previous errors
        setErrors({})
        setSimahCheckRulesErrors({})
        
        const payload = buildApiPayload(formData)
        
        // Save product rules first (includes Simah Check Rules)
        response = await createProductSettings(productId, payload)
        
        // Then save nationalities separately if any are selected
        if (response?.data?.success) {
          if (formData.eligible_nationalities && Array.isArray(formData.eligible_nationalities) && formData.eligible_nationalities.length > 0) {
            try {
              const nationalitiesPayload = {
                product_id: parseInt(productId),
                country_ids: formData.eligible_nationalities.map((id: string) => parseInt(id))
              }
              await addSelectedNationalities(productId, nationalitiesPayload)
            } catch (nationalitiesError: any) {
              console.error("Error saving nationalities:", nationalitiesError)
              // Don't fail the whole operation if nationalities save fails
              toast.error(nationalitiesError?.response?.data?.message || "Product rules saved but failed to save nationalities")
            }
          }
        }
      } else if (activeTab === "credit-scoring") {
        // Clear previous errors
        setCreditScoringErrors({})
        
        // Build Credit Scoring Criteria payload for each field
        const currentFields = Array.isArray(formData.credit_scoring_fields) 
          ? formData.credit_scoring_fields 
          : []
        
        // Filter out fields that don't have a name or rules
        const validFields = currentFields.filter((field: any) => {
          const hasName = field.field_name && field.field_name.trim() !== ""
          const hasRules = field.rules && Array.isArray(field.rules) && field.rules.length > 0
          return hasName && hasRules
        })
        
 
        
        if (validFields.length === 0) {
          toast.error("Please add at least one credit scoring field with a name and at least one rule")
          return
        }
        
        // Build single payload with all credit scoring fields
        const creditScoringPayload = {
          product_id: parseInt(productId),
          credit_scoring_fields: validFields.map((field: any) => ({
            name: field.field_name.trim(),
            rules: (field.rules || []).map((rule: any) => ({
              operator: mapOperatorToApiFormat(rule.operator),
              value: String(rule.value || ""),
              weight: Number(rule.weight) || 1
            }))
          }))
        }
        
    
        
        // Send single request with all fields
        response = await createCreditScoringCriteria(creditScoringPayload)
      }
       else {
        // Clear previous errors for application-steps
        if (activeTab === "application-steps") {
          setApplicationStepsErrors({})
        }
        
        const payload = buildApiPayload(formData)
        


        response = await createProductSettings(productId, payload)
      }
      
      if (response?.data?.success) {
        sessionStorage.setItem("settingsFormData", JSON.stringify(formData))
        
        const currentIndex = tabOrder.indexOf(activeTab)
        if (currentIndex < tabOrder.length - 1) {
          setActiveTab(tabOrder[currentIndex + 1])
          if (activeTab !== "approval-workflows" && activeTab !== "credit-scoring") {
            toast.success(`${activeTab.replace(/-/g, " ")} saved successfully!`)
          } else if (activeTab === "credit-scoring") {
            toast.success("Credit scoring criteria saved successfully!")
            router.push("/Los/ProductManagement/Create/ProductAffiliation")
          }
        } else {
          if (activeTab !== "approval-workflows" && activeTab !== "credit-scoring") {
            toast.success("Settings saved successfully!")
          } else if (activeTab === "credit-scoring") {
            toast.success("Credit scoring criteria saved successfully!")
            router.push("/Los/ProductManagement/Create/ProductAffiliation")
          }
        }
      } else {
        if (activeTab !== "approval-workflows" && activeTab !== "credit-scoring") {
          // Handle validation errors for application-steps, terms, and other tabs
          const apiErrors = response?.data?.errors || {}
          
          if (activeTab === "application-steps") {
            // Parse nested errors like "application_steps.0.title_en" -> { stepIndex: 0, field: "title_en", message: "..." }
            const stepErrors: Record<string, Record<string, string>> = {}
            
            Object.keys(apiErrors).forEach((errorKey) => {
              // Match pattern: application_steps.{index}.{field}
              const match = errorKey.match(/^application_steps\.(\d+)\.(.+)$/)
              if (match) {
                const stepIndex = match[1]
                const field = match[2]
                const errorMessage = Array.isArray(apiErrors[errorKey]) ? apiErrors[errorKey][0] : apiErrors[errorKey]
                
                if (!stepErrors[stepIndex]) {
                  stepErrors[stepIndex] = {}
                }
                stepErrors[stepIndex][field] = errorMessage
              }
            })
            
            setApplicationStepsErrors(stepErrors)
            
            // Show first error in toast
            const firstErrorKey = Object.keys(apiErrors)[0]
            if (firstErrorKey && Array.isArray(apiErrors[firstErrorKey]) && apiErrors[firstErrorKey].length > 0) {
              toast.error(apiErrors[firstErrorKey][0])
            } else {
              toast.error(response?.data?.message || "Failed to save settings")
            }
          } else if (activeTab === "terms") {
            // Parse errors like "product_content.0.content" -> terms_conditions_en, "product_content.1.content" -> terms_conditions_ar
            const termsErrors: Record<string, string> = {}
            
            Object.keys(apiErrors).forEach((errorKey) => {
              // Match pattern: product_content.{index}.content
              const match = errorKey.match(/^product_content\.(\d+)\.content$/)
              if (match) {
                const index = parseInt(match[1])
                const errorMessage = Array.isArray(apiErrors[errorKey]) ? apiErrors[errorKey][0] : apiErrors[errorKey]
                
                // Map index 0 to English, index 1 to Arabic
                if (index === 0) {
                  termsErrors.terms_conditions_en = errorMessage
                } else if (index === 1) {
                  termsErrors.terms_conditions_ar = errorMessage
                }
              }
            })
            
            setTermsConditionsErrors(termsErrors)
            
            // Show first error in toast
            const firstErrorKey = Object.keys(apiErrors)[0]
            if (firstErrorKey && Array.isArray(apiErrors[firstErrorKey]) && apiErrors[firstErrorKey].length > 0) {
              toast.error(apiErrors[firstErrorKey][0])
            } else {
              toast.error(response?.data?.message || "Failed to save terms and conditions")
            }
          } else if (activeTab === "eligibility") {
            // Parse errors like "product_content.0.content" -> eligibility_en, "product_content.1.content" -> eligibility_ar
            const eligibilityErrorsData: Record<string, string> = {}
            
            Object.keys(apiErrors).forEach((errorKey) => {
              // Match pattern: product_content.{index}.content
              const match = errorKey.match(/^product_content\.(\d+)\.content$/)
              if (match) {
                const index = parseInt(match[1])
                const errorMessage = Array.isArray(apiErrors[errorKey]) ? apiErrors[errorKey][0] : apiErrors[errorKey]
                
                // Map index 0 to English, index 1 to Arabic
                if (index === 0) {
                  eligibilityErrorsData.eligibility_criteria_en = errorMessage
                } else if (index === 1) {
                  eligibilityErrorsData.eligibility_criteria_ar = errorMessage
                }
              }
            })
            
            setEligibilityErrors(eligibilityErrorsData)
            
            // Show first error in toast
            const firstErrorKey = Object.keys(apiErrors)[0]
            if (firstErrorKey && Array.isArray(apiErrors[firstErrorKey]) && apiErrors[firstErrorKey].length > 0) {
              toast.error(apiErrors[firstErrorKey][0])
            } else {
              toast.error(response?.data?.message || "Failed to save eligibility")
            }
          } else if (activeTab === "admin-fees") {
            // Handle validation errors for admin fee slabs
            const errorMessages: string[] = []
          
            Object.keys(apiErrors).forEach((field) => {
              if (Array.isArray(apiErrors[field])) {
                apiErrors[field].forEach((errorMsg: string) => {
                 
                  errorMessages.push(errorMsg)
                })
              } else {
                errorMessages.push(apiErrors[field])
              }
            })
            
            // Show first error in toast
            if (errorMessages.length > 0) {
              toast.error(errorMessages[0])
            } else {
              toast.error(response?.data?.message || "Failed to save admin fee slabs")
            }
          } else if (activeTab === "product-rules") {
            // Handle validation errors for product rules (including simah check rules)
            const simahErrors: Record<string, string> = {}
            const productRulesErrors: Record<string, string> = {}
            
            Object.keys(apiErrors).forEach((field) => {
              // Check if it's a simah check rules field
              const simahFields = [
                "minimum_simah_score_allowed",
                "delinquency_allowed",
                "stage2_allowed_last_12",
                "stage3_allowed_last_12",
                "max_utility_writeoff_amount",
                "max_telecom_writeoff_amount",
                "partial_settlements_allowed_last_12",
                "bounced_cheques_allowed",
                "default_allowed_last_12",
                "writeoff_allowed_last_12"
              ]
              
              if (simahFields.includes(field)) {
                if (Array.isArray(apiErrors[field]) && apiErrors[field].length > 0) {
                  simahErrors[field] = apiErrors[field][0]
                } else if (typeof apiErrors[field] === "string") {
                  simahErrors[field] = apiErrors[field]
                }
              } else {
                if (Array.isArray(apiErrors[field]) && apiErrors[field].length > 0) {
                  productRulesErrors[field] = apiErrors[field][0]
                } else if (typeof apiErrors[field] === "string") {
                  productRulesErrors[field] = apiErrors[field]
                }
              }
            })
            
            if (Object.keys(simahErrors).length > 0) {
              setSimahCheckRulesErrors(simahErrors)
            }
            if (Object.keys(productRulesErrors).length > 0) {
              setErrors(productRulesErrors)
            }
            
            // Show first error in toast
            const firstError = Object.values(simahErrors)[0] || Object.values(productRulesErrors)[0]
            if (firstError) {
              toast.error(firstError)
            } else {
              toast.error(response?.data?.message || "Failed to save product rules")
            }
          } else {
            toast.error(response?.data?.message || "Failed to save settings")
          }
        } else if (activeTab === "credit-scoring") {
          // Handle validation errors for credit scoring
          const apiErrors = response?.data?.errors || {}
          const errorMessages: Record<string, string> = {}
          
          Object.keys(apiErrors).forEach((field) => {
            if (Array.isArray(apiErrors[field]) && apiErrors[field].length > 0) {
              errorMessages[field] = apiErrors[field][0]
            }
          })
          
          setCreditScoringErrors(errorMessages)
          
          const firstError = Object.values(errorMessages)[0]
          if (firstError) {
            toast.error(firstError)
          } else {
            toast.error(response?.data?.message || "Failed to save credit scoring criteria")
          }
        }
      }
    } catch (error: any) {
      console.error("Error saving settings:", error)
      
      if (activeTab === "credit-scoring") {
        // Handle validation errors from catch block for credit scoring
        const apiErrors = error?.response?.data?.errors || {}
        const errorMessages: Record<string, string> = {}
        
        Object.keys(apiErrors).forEach((field) => {
          if (Array.isArray(apiErrors[field]) && apiErrors[field].length > 0) {
            errorMessages[field] = apiErrors[field][0]
          }
        })
        
        if (Object.keys(errorMessages).length > 0) {
          setCreditScoringErrors(errorMessages)
          const firstError = Object.values(errorMessages)[0]
          toast.error(firstError)
        } else {
          toast.error(error?.response?.data?.message || error?.message || "Failed to save credit scoring criteria")
        }
      } else if (activeTab === "application-steps") {
        // Handle validation errors from catch block for application steps
        const apiErrors = error?.response?.data?.errors || {}
        const stepErrors: Record<string, Record<string, string>> = {}
        
        Object.keys(apiErrors).forEach((errorKey) => {
          const match = errorKey.match(/^application_steps\.(\d+)\.(.+)$/)
          if (match) {
            const stepIndex = match[1]
            const field = match[2]
            const errorMessage = Array.isArray(apiErrors[errorKey]) ? apiErrors[errorKey][0] : apiErrors[errorKey]
            
            if (!stepErrors[stepIndex]) {
              stepErrors[stepIndex] = {}
            }
            stepErrors[stepIndex][field] = errorMessage
          }
        })
        
        if (Object.keys(stepErrors).length > 0) {
          setApplicationStepsErrors(stepErrors)
          const firstErrorKey = Object.keys(apiErrors)[0]
          if (firstErrorKey && Array.isArray(apiErrors[firstErrorKey]) && apiErrors[firstErrorKey].length > 0) {
            toast.error(apiErrors[firstErrorKey][0])
          } else {
            toast.error(error?.response?.data?.message || error?.message || "Failed to save application steps")
          }
        } else {
          toast.error(error?.response?.data?.message || error?.message || "Failed to save application steps")
        }
      } else if (activeTab === "admin-fees") {
        // Handle validation errors from catch block for admin fee slabs
        const apiErrors = error?.response?.data?.errors || {}
        const errorMessages: string[] = []
     
        Object.keys(apiErrors).forEach((field) => {
          if (Array.isArray(apiErrors[field])) {
            apiErrors[field].forEach((errorMsg: string) => {
      
              errorMessages.push(errorMsg)
            })
          } else {
            errorMessages.push(apiErrors[field])
          }
        })
        
        // Show first error in toast
        if (errorMessages.length > 0) {
          toast.error(errorMessages[0])
        } else {
          toast.error(error?.response?.data?.message || error?.message || "Failed to save admin fee slabs")
        }
      } else if (activeTab === "terms") {
        // Handle validation errors from catch block for terms and conditions
        const apiErrors = error?.response?.data?.errors || {}
        const termsErrors: Record<string, string> = {}
        
        Object.keys(apiErrors).forEach((errorKey) => {
          const match = errorKey.match(/^product_content\.(\d+)\.content$/)
          if (match) {
            const index = parseInt(match[1])
            const errorMessage = Array.isArray(apiErrors[errorKey]) ? apiErrors[errorKey][0] : apiErrors[errorKey]
            
            if (index === 0) {
              termsErrors.terms_conditions_en = errorMessage
            } else if (index === 1) {
              termsErrors.terms_conditions_ar = errorMessage
            }
          }
        })
        
        if (Object.keys(termsErrors).length > 0) {
          setTermsConditionsErrors(termsErrors)
          const firstErrorKey = Object.keys(apiErrors)[0]
          if (firstErrorKey && Array.isArray(apiErrors[firstErrorKey]) && apiErrors[firstErrorKey].length > 0) {
            toast.error(apiErrors[firstErrorKey][0])
          } else {
            toast.error(error?.response?.data?.message || error?.message || "Failed to save terms and conditions")
          }
        } else {
          toast.error(error?.response?.data?.message || error?.message || "Failed to save terms and conditions")
        }
      } else if (activeTab === "eligibility") {
        // Handle validation errors from catch block for eligibility
        const apiErrors = error?.response?.data?.errors || {}
        const eligibilityErrorsData: Record<string, string> = {}
        
        Object.keys(apiErrors).forEach((errorKey) => {
          const match = errorKey.match(/^product_content\.(\d+)\.content$/)
          if (match) {
            const index = parseInt(match[1])
            const errorMessage = Array.isArray(apiErrors[errorKey]) ? apiErrors[errorKey][0] : apiErrors[errorKey]
            
            if (index === 0) {
              eligibilityErrorsData.eligibility_criteria_en = errorMessage
            } else if (index === 1) {
              eligibilityErrorsData.eligibility_criteria_ar = errorMessage
            }
          }
        })
        
        if (Object.keys(eligibilityErrorsData).length > 0) {
          setEligibilityErrors(eligibilityErrorsData)
          const firstErrorKey = Object.keys(apiErrors)[0]
          if (firstErrorKey && Array.isArray(apiErrors[firstErrorKey]) && apiErrors[firstErrorKey].length > 0) {
            toast.error(apiErrors[firstErrorKey][0])
          } else {
            toast.error(error?.response?.data?.message || error?.message || "Failed to save eligibility")
          }
        } else {
          toast.error(error?.response?.data?.message || error?.message || "Failed to save eligibility")
        }
      } else if (activeTab === "product-rules") {
        // Handle validation errors from catch block for product rules (including simah check rules)
        const apiErrors = error?.response?.data?.errors || {}
        const simahErrors: Record<string, string> = {}
        const productRulesErrors: Record<string, string> = {}
        
        Object.keys(apiErrors).forEach((field) => {
          // Check if it's a simah check rules field
          const simahFields = [
            "minimum_simah_score_allowed",
            "delinquency_allowed",
            "stage2_allowed_last_12",
            "stage3_allowed_last_12",
            "max_utility_writeoff_amount",
            "max_telecom_writeoff_amount",
            "partial_settlements_allowed_last_12",
            "bounced_cheques_allowed",
            "default_allowed_last_12",
            "writeoff_allowed_last_12"
          ]
          
          if (simahFields.includes(field)) {
            if (Array.isArray(apiErrors[field]) && apiErrors[field].length > 0) {
              simahErrors[field] = apiErrors[field][0]
            } else if (typeof apiErrors[field] === "string") {
              simahErrors[field] = apiErrors[field]
            }
          } else {
            if (Array.isArray(apiErrors[field]) && apiErrors[field].length > 0) {
              productRulesErrors[field] = apiErrors[field][0]
            } else if (typeof apiErrors[field] === "string") {
              productRulesErrors[field] = apiErrors[field]
            }
          }
        })
        
        if (Object.keys(simahErrors).length > 0) {
          setSimahCheckRulesErrors(simahErrors)
        }
        if (Object.keys(productRulesErrors).length > 0) {
          setErrors(productRulesErrors)
        }
        
        const firstError = Object.values(simahErrors)[0] || Object.values(productRulesErrors)[0]
        if (firstError) {
          toast.error(firstError)
        } else {
          toast.error(error?.response?.data?.message || error?.message || "Failed to save product rules")
        }
      } else {
        toast.error(error?.response?.data?.message || error?.message || "Failed to save settings")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabPrevious = () => {
    sessionStorage.setItem("settingsFormData", JSON.stringify(formData))
    
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1])
    }
  }

  useEffect(()=>{
  }, [activeTab])

  const updateApprovalScenario = (id: string, field: string, value: any) => {
    const updatedScenarios = formData.approval_scenarios.map((s: any) => (s.id === id ? { ...s, [field]: value } : s))
    updateFormData("approval_scenarios", updatedScenarios)
    
    // Clear errors for this scenario's field when user starts typing
    if (activeTab === "approval-workflows" && approvalWorkflowsErrors[id]?.[field]) {
      const newErrors = { ...approvalWorkflowsErrors }
      if (newErrors[id]) {
        delete newErrors[id][field]
        if (Object.keys(newErrors[id]).length === 0) {
          delete newErrors[id]
        }
      }
      setApprovalWorkflowsErrors(newErrors)
    }
  }

  const removeApprovalScenario = (id: string) => {
    updateFormData(
      "approval_scenarios",
      formData.approval_scenarios.filter((s: any) => s.id !== id),
    )
  }

  const productIdForTabs = productIdFromUrl || sessionStorage.getItem("productId") || productId

  return (
    <div className="min-h-screen bg-background">
      {isLoadingSettings && <Loader />}
      {/* Header - main tabs (no steps / progress) */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="max-w-8xl mx-auto">
            <div className={`flex items-center justify-between mb-4 ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
              <div className={`flex items-center gap-4 ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
                <Button variant="ghost" size="sm" onClick={() => router.push("/Los/ProductManagement")} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Products
                </Button>
              </div>
            </div>
            <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>
            <ProductCreateEditTabs
              activeTab="settings"
              productId={productIdForTabs}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Settings sub-tabs */}
      <div className="container mx-auto px-6 py-8">
        <div className="mx-auto">
          <div className="product-tabs-container product-settings-tabs">
            <Tabs
              id="controlled-tab-example"
              className="mt-30 mb-4 position-relative tabs-overflow"
              activeKey={activeTab}
              style={{ display: "flex", flexWrap: "nowrap" }}
              onSelect={(tab: any) => {
                setActiveTab(tab)
              }}
            >
              {/* <Tab eventKey="application-steps" title="Application Steps">
                {activeTab === "application-steps" && (
                  <ApplicationStepsTab
                    formData={formData}
                    updateFormData={updateFormData}
                    errors={applicationStepsErrors}
                    onNext={handleTabNext}
                    addApplicationStep={addApplicationStep}
                    removeApplicationStep={removeApplicationStep}
                    updateApplicationStep={updateApplicationStep}
                  />
                )}
              </Tab> */}

              <Tab eventKey="terms" title="Terms & Conditions">
                {activeTab === "terms" && (
                  <TermsConditionsTab
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={handleTabNext}
                    onPrevious={handleTabPrevious}
                    errors={termsConditionsErrors}
                  />
                )}
              </Tab>

              <Tab eventKey="fee-settings" title="Fee Settings">
                {activeTab === "fee-settings" && (
                  <>
                  <FeeSettingsTab
                    formData={formData}
                    updateFormData={updateFormData}
                    errors={errors}
                    onNext={handleFeeSettingsSave}
                    // onPrevious={handleTabPrevious}
                    productTypeName={productTypeName}
                  />
                  <AdminFeeSlabsTab
                  formData={formData}
                  onNext={handleTabNext}
                  onPrevious={handleTabPrevious}
                  addFeeSlab={addFeeSlab}
                  removeFeeSlab={removeFeeSlab}
                  updateFeeSlab={updateFeeSlab}
                />
                </>

                )}
              </Tab>

              <Tab eventKey="product-rules" title="Product Rules">
                {activeTab === "product-rules" && (
                  <>
                  <ProductRulesTab
                    formData={formData}
                    updateFormData={updateFormData}
                    errors={{ ...errors, ...simahCheckRulesErrors }}
                    onNext={handleProductRulesSave}
                    // onPrevious={handleTabPrevious}
                    productId={productId}
                  />
                  <EligibilityTab
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={handleEligibilitySave}
                  onPrevious={handleTabPrevious}
                  errors={eligibilityErrors}
                />
                </>
                )}
              </Tab>

              <Tab eventKey="income-slabs" title="Affordablity Income Slabs">
                {activeTab === "income-slabs" && (
                  <IncomeSlabsTab
                    formData={formData}
                    updateFormData={updateFormData}
                    errors={errors}
                    onNext={handleTabNext}
                    onPrevious={handleTabPrevious}
                    productId={productId}
                  />
                )}
              </Tab>

              {/* <Tab eventKey="admin-fees" title="Fee Slabs">
                {activeTab === "admin-fees" && (
                  <AdminFeeSlabsTab
                    formData={formData}
                    onNext={handleTabNext}
                    onPrevious={handleTabPrevious}
                    addFeeSlab={addFeeSlab}
                    removeFeeSlab={removeFeeSlab}
                    updateFeeSlab={updateFeeSlab}
                  />
                )}
              </Tab> */}

              <Tab eventKey="duration" title="Duration Settings">
                {activeTab === "duration" && (
                  <DurationSettingsTab
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={handleTabNext}
                    onPrevious={handleTabPrevious}
                  />
                )}
              </Tab>

              <Tab eventKey="approval-workflows" title="Approval Workflows">
                {activeTab === "approval-workflows" && (
                  <ApprovalWorkflowsTab
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={handleTabNext}
                    onPrevious={handleTabPrevious}
                    predefinedWorkflowTemplates={predefinedWorkflowTemplates}
                    conditionFields={conditionFields}
                    conditionOperators={conditionOperators}
                    actionTypes={actionTypes}
                    addApprovalScenario={addApprovalScenario}
                    updateApprovalScenario={updateApprovalScenario}
                    removeApprovalScenario={removeApprovalScenario}
                    addConditionToScenario={addConditionToScenario}
                    addActionToScenario={addActionToScenario}
                    loadPredefinedWorkflow={loadPredefinedWorkflow}
                    openTemplatePreview={openTemplatePreview}
                    previewTemplate={previewTemplate}
                    isPreviewOpen={isPreviewOpen}
                    setIsPreviewOpen={setIsPreviewOpen}
                    applyTemplateFromPreview={applyTemplateFromPreview}
                    errors={approvalWorkflowsErrors}
                  />
                )}
              </Tab>

              <Tab eventKey="credit-scoring" title="Credit Scoring Engine">
                {activeTab === "credit-scoring" && (
                  <CreditScoringTab
                    formData={formData}
                    creditScoringFields={creditScoringFields}
                    creditScoringOperators={creditScoringOperators}
                    isLoading={isLoading}
                    onComplete={handleTabNext}
                    onPrevious={handleTabPrevious}
                    addCreditScoringCriteria={addCreditScoringCriteria}
                    removeCreditScoringCriteria={removeCreditScoringCriteria}
                    updateCreditScoringCriteria={updateCreditScoringCriteria}
                    addCreditScoringField={addCreditScoringField}
                    removeCreditScoringField={removeCreditScoringField}
                    updateCreditScoringFieldName={updateCreditScoringFieldName}
                    addCreditScoringRule={addCreditScoringRule}
                    removeCreditScoringRule={removeCreditScoringRule}
                    updateCreditScoringRule={updateCreditScoringRule}
                    updateFormData={updateFormData}
                    errors={creditScoringErrors}
                  />
                )}
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
