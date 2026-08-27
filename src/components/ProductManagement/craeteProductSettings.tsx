import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "../../lib/router"
import { ArrowLeft, Package } from "lucide-react"
import { Button } from "../ui/button"
import { Tab, Tabs } from "react-bootstrap"
import { useLanguage } from "../../hooks/use-language"
import { useTranslation } from "react-i18next"
import toast from "react-hot-toast"
import { createProductSettings, createProductTermsAndConditions, createAdminFeeSlabs, createDurationSettings, createApprovalWorkflowScenarios, getProductSettings, addSelectedNationalities, updateFeeSettings, updateAdminFeeSlabs, updateDurationSettings, updateApprovalWorkflows } from "../../redux/apis/apisCrudProductManagement"
import { getProductCreditScoringCriteria, saveProductCreditScoringCriteria, deleteProductCreditScoringCriteria } from "../../redux/apis/apisRiskManagement"
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
  percentage: number
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

const defaultFormData = {
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
  request_duration: 0,
  approval_duration: 0,
  disbursement_duration: 0,
  repayment_duration: 0,
  approval_scenarios: [],
  credit_scoring_criteria: [],
  credit_scoring_fields: [
    {
      id: Date.now().toString(),
      field_name: "",
      rules: []
    }
  ],
  // Penalty Waiver Settings
  penalty_waiver_allowed: false,
  max_penalty_waivers_allowed: null,
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
}

export default function CraeteProductSettings() {
  const { isRTL } = useLanguage()
  const { t } = useTranslation("productManagement2")
  const router = useRouter()

  const [formData, setFormData] = useState<any>(defaultFormData)
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
    "admin-fees",
    // "product-rules",
    // "eligibility",
    // "income-slabs",
    "duration",
    "approval-workflows",
    // "credit-scoring",
  ]

  const loadProductSettings = async (productId: string) => {
    try {
      setIsLoadingSettings(true)
      const response = await getProductSettings(productId)

      if (response?.data?.message === "success" && response?.data?.data) {
        const product = response.data.data
        // Extract nested settings objects from unified product response
        const fee = product.feeSettings || {}
        const terms = product.termsConditions || {}
        const duration = product.durationSettings || {}
        const slabsArr = product.adminFeeSlabs || []
        const stepsArr = product.applicationSteps || []
        const workflowsArr = product.approvalWorkflows || []

        // Map application steps
        const applicationSteps = stepsArr.map((step: any, index: number) => ({
          id: step.id || (Date.now().toString() + index),
          title: step.titleEn || step.title_en || "",
          title_ar: step.titleAr || step.title_ar || "",
          description: step.description || "",
          required: step.required ?? true,
          order: step.sortOrder || step.stepNumber || index + 1,
        }))

        // Map terms and conditions
        const termsConditionsEn = terms.termsEn || ""
        const termsConditionsAr = terms.termsAr || ""

        // Update formData with loaded settings
        // Use defaultFormData as fallback instead of prev to avoid showing stale sessionStorage data
        setFormData(() => ({
          ...defaultFormData,
          application_steps: applicationSteps.length > 0 ? applicationSteps : defaultFormData.application_steps,
          terms_conditions_en: termsConditionsEn || defaultFormData.terms_conditions_en,
          terms_conditions_ar: termsConditionsAr || defaultFormData.terms_conditions_ar,
          // Fee settings — from nested feeSettings object
          min_financing_amount: parseFloat(fee.minFinancingAmount) || defaultFormData.min_financing_amount,
          max_financing_amount: parseFloat(fee.maxFinancingAmount) || defaultFormData.max_financing_amount,
          suggested_financing_amount: parseFloat(fee.suggestedFinancingAmount) || defaultFormData.suggested_financing_amount,
          min_tenure: product.minTenureMonths || defaultFormData.min_tenure,
          max_tenure: product.maxTenureMonths || defaultFormData.max_tenure,
          vat_percentage: parseFloat(fee.vatPercentage) || defaultFormData.vat_percentage,
          revenue_eligibility_threshold: parseFloat(fee.revenueEligibilityThreshold) || defaultFormData.revenue_eligibility_threshold,
          dbr_percentage: parseFloat(fee.maxDbrPercentage) || defaultFormData.dbr_percentage,
          dbr_calculation_method: fee.dbrCalculationMethod || defaultFormData.dbr_calculation_method,
          dbr_exceptions: fee.dbrExceptions || defaultFormData.dbr_exceptions,
          gdbr_percentage: parseFloat(fee.gdbrPercentage) || defaultFormData.gdbr_percentage,
          credit_line_percentage: parseFloat(fee.creditLinePercentage) || defaultFormData.credit_line_percentage,
          min_age: fee.minAge || defaultFormData.min_age,
          max_age: fee.maxAge || defaultFormData.max_age,
          // Admin fee slabs — from root-level adminFeeSlabs array
          admin_fee_slabs: slabsArr.length > 0
            ? slabsArr.map((slab: any) => ({
                id: String(slab.id || ""),
                min_amount: parseFloat(slab.minAmount) || 0,
                max_amount: parseFloat(slab.maxAmount) || 0,
                min_tenure: parseInt(String(slab.minTenure ?? 1)),
                max_tenure: parseInt(String(slab.maxTenure ?? 6)),
                profit_percentage: parseFloat(slab.profitPercentage) || 0,
                profit_type: slab.profitType || "percentage",
                admin_fee: parseFloat(slab.adminFee) || 0,
                type: slab.type || "monthly",
                processing_fee: parseFloat(slab.processingFee) || 0,
                partner_scope: slab.partnerScope === "ALL_PARTNERS" ? "all" : (slab.partnerScope || "all"),
                status: slab.status === "ACTIVE" ? "active" : "inactive"
              }))
            : defaultFormData.admin_fee_slabs,
          // Duration settings — from nested durationSettings object
          request_duration: duration.requestDurationDays || defaultFormData.request_duration,
          approval_duration: duration.approvalDurationDays || defaultFormData.approval_duration,
          disbursement_duration: duration.disbursementDurationDays || defaultFormData.disbursement_duration,
          repayment_duration: duration.repaymentDurationDays || defaultFormData.repayment_duration,
          // Approval workflows — from root-level approvalWorkflows array
          approval_scenarios: workflowsArr.length > 0
            ? workflowsArr.map((w: any, index: number) => ({
                id: w.id || String(Date.now() + index),
                name: w.nameEn || w.name || "",
                name_ar: w.nameAr || "",
                description: w.description || "",
                type: w.workflowType === "AUTO_APPROVAL" ? "auto"
                     : w.workflowType === "MANUAL_APPROVAL" || w.workflowType === "MANUAL_REVIEW" ? "manual"
                     : w.workflowType === "REJECTION_SCENARIO" || w.workflowType === "AUTO_REJECTION" ? "rejection"
                     : (w.type || "auto"),
                enabled: w.active ?? w.enabled ?? true,
                priority: w.priority || index + 1,
                conditions: (w.conditions || []).map((c: any) => ({
                  field: c.field || "",
                  operator: c.operator || "",
                  value: (c.value || "").replace(/^"|"$/g, ""),
                  logic: c.logicalOperator || "AND",
                })),
                actions: (w.actions || []).map((a: any) => ({
                  type: a.actionType === "APPROVE" ? "Auto Approval"
                       : a.actionType === "ASSIGN_REVIEWER" || a.actionType === "ESCALATE" ? "Manual Approval"
                       : a.actionType === "REJECT" ? "Reject"
                       : (a.actionType || a.type || ""),
                  value: a.configuration || "",
                  delay_hours: a.delay_hours || 0,
                  configuration: a.configuration || "",
                })),
              }))
            : defaultFormData.approval_scenarios,
          credit_scoring_criteria: defaultFormData.credit_scoring_criteria,
          credit_scoring_fields: defaultFormData.credit_scoring_fields,
          min_income: product.minAmount || defaultFormData.min_income,
          stress_buffer: defaultFormData.stress_buffer,
          max_dti: defaultFormData.max_dti,
          max_outstanding_balance: defaultFormData.max_outstanding_balance,
          age_at_maturity: defaultFormData.age_at_maturity,
          max_internal_payable_amount: defaultFormData.max_internal_payable_amount,
          simah_cooling_off_days: defaultFormData.simah_cooling_off_days,
          cooling_off: defaultFormData.cooling_off,
          employment_status_vendor: defaultFormData.employment_status_vendor,
          commodity_vendor: defaultFormData.commodity_vendor,
          eligible_nationalities: defaultFormData.eligible_nationalities,
          // Penalty Waiver Settings
          penalty_waiver_allowed: fee.penaltyWaiverAllowed ?? product.penaltyWaiverAllowed ?? defaultFormData.penalty_waiver_allowed,
          max_penalty_waivers_allowed: fee.maxPenaltyWaiversAllowed ?? product.maxPenaltyWaiversAllowed ?? defaultFormData.max_penalty_waivers_allowed,
          // Simah Check Rules fields — not yet in new API, keep defaults
          minimum_simah_score_allowed: defaultFormData.minimum_simah_score_allowed,
          delinquency_allowed: defaultFormData.delinquency_allowed,
          stage2_allowed_last_12: defaultFormData.stage2_allowed_last_12,
          stage3_allowed_last_12: defaultFormData.stage3_allowed_last_12,
          max_utility_writeoff_amount: defaultFormData.max_utility_writeoff_amount,
          max_telecom_writeoff_amount: defaultFormData.max_telecom_writeoff_amount,
          partial_settlements_allowed_last_12: defaultFormData.partial_settlements_allowed_last_12,
          bounced_cheques_allowed: defaultFormData.bounced_cheques_allowed,
          default_allowed_last_12: defaultFormData.default_allowed_last_12,
          writeoff_allowed_last_12: defaultFormData.writeoff_allowed_last_12,
        }))
      }

      // Load credit scoring criteria from risk-service
      await loadCreditScoringCriteria(productId)
    }  finally {
      setIsLoadingSettings(false)
    }
  }

  const loadCreditScoringCriteria = async (pid: string) => {
    try {
      const csResponse = await getProductCreditScoringCriteria(pid)
      // Response: { data: [...criteria], message: "success" }
      const criteriaList = csResponse?.data?.data || csResponse?.data || []
      const criteriaArr = Array.isArray(criteriaList) ? criteriaList : []
      if (criteriaArr.length > 0) {
        const mappedFields = criteriaArr.map((c: any, index: number) => ({
          id: c.id || (Date.now().toString() + index),
          field_name: c.customName || c.fieldDefinition?.nameEn || "",
          fieldDefinitionId: c.fieldDefinitionId || c.fieldDefinition?.id || null,
          enabled: c.enabled ?? true,
          rules: (c.rules || []).map((r: any, rIdx: number) => ({
            id: r.id || (Date.now().toString() + index + "_" + rIdx),
            operator: r.operator || "EQ",
            value: r.value || "",
            weight: r.weight || 0,
            percentage: r.percentage || 0,
          })),
        }))
        setFormData((prev: any) => ({
          ...prev,
          credit_scoring_fields: mappedFields,
        }))
      }
    } catch (csError: any) {
      console.log("No credit scoring criteria found:", csError?.response?.status)
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
      toast.error(t("createDocs.startFromBasicInfo"))
      router.push("/Los/ProductManagement/Create/BasicInfo")
    }
  }, [productIdFromUrl])

  // Reload credit scoring criteria when user navigates to the credit-scoring tab
  useEffect(() => {
    const effectiveProductId = productId || productIdFromUrl || sessionStorage.getItem("productId")
    if (activeTab === "credit-scoring" && effectiveProductId) {
      loadCreditScoringCriteria(effectiveProductId)
    }
  }, [activeTab])

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
      operator: "EQ",
      value: "",
      weight: 1,
      percentage: 0,
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
        
    //     if (response?.data?.message === "success") {
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
        toast.error(t("requiredDoc.productIdNotFound"))
        return
      }

      const feePayload = {
        minFinancingAmount: formData.min_financing_amount || 0,
        maxFinancingAmount: formData.max_financing_amount || 0,
        vatPercentage: formData.vat_percentage || 0,
        revenueEligibilityThreshold: formData.revenue_eligibility_threshold || 0,
        maxDbrPercentage: formData.dbr_percentage || 0,
        dbrCalculationMethod: (formData.dbr_calculation_method || "GROSS_INCOME").toUpperCase(),
        dbrExceptions: Array.isArray(formData.dbr_exceptions) ? formData.dbr_exceptions.join("\n") : (formData.dbr_exceptions || ""),
        penaltyWaiverAllowed: formData.penalty_waiver_allowed ?? false,
        maxPenaltyWaiversAllowed: formData.penalty_waiver_allowed ? (formData.max_penalty_waivers_allowed ?? null) : null,
      }
      const response = await updateFeeSettings(productId, feePayload)

      if (response?.data?.message === "success") {
        sessionStorage.setItem("settingsFormData", JSON.stringify(formData))
        toast.success(t("productSettings.feeSaved"))
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("productSettings.feeSaveFailed"))
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
        toast.error(t("requiredDoc.productIdNotFound"))
        return
      }

      const payload = buildApiPayload(formData)
      const response = await createProductSettings(productId, payload)
      
      if (response?.data?.message === "success") {
        // Save nationalities if any are selected
        if (formData.eligible_nationalities && formData.eligible_nationalities.length > 0) {
          const nationalitiesPayload = {
            product_id: parseInt(productId),
            country_ids: formData.eligible_nationalities.map((id: string) => parseInt(id))
          }
          await addSelectedNationalities(productId, nationalitiesPayload)
        }
        
        sessionStorage.setItem("settingsFormData", JSON.stringify(formData))
        toast.success(t("productSettings.rulesSaved"))
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("productSettings.rulesSaveFailed"))
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
        toast.error(t("requiredDoc.productIdNotFound"))
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
      
      if (response?.data?.message === "success") {
        sessionStorage.setItem("settingsFormData", JSON.stringify(formData))
        toast.success(t("productSettings.eligibilitySaved"))
        
        // Navigate to next tab (income-slabs)
        const currentIndex = tabOrder.indexOf("eligibility")
        if (currentIndex < tabOrder.length - 1) {
          setActiveTab(tabOrder[currentIndex + 1])
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("productSettings.eligibilityCriteriaFailed"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabNext = async () => {
    try {
      setIsLoading(true)
      
      const productId = sessionStorage.getItem("productId")
      
      if (!productId) {
        toast.error(t("incomeSlabs.noProductId"))
        setIsLoading(false)
        return
      }

      let response;

      if (activeTab === "terms") {
        // Clear previous errors
        setTermsConditionsErrors({})

        const termsPayload = {
          termsEn: formData.terms_conditions_en || "",
          termsAr: formData.terms_conditions_ar || "",
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
        const slabs = formData.admin_fee_slabs.map((slab: any, index: number) => ({
          minAmount: Number(slab.min_amount) || 0,
          maxAmount: Number(slab.max_amount) || 0,
          profitPercentage: Number(slab.profit_percentage) || 0,
          processingFee: Number(slab.processing_fee) || 0,
          adminFee: Number(slab.admin_fee) || 0,
          partnerScope: slab.partner_scope === "all" ? "ALL_PARTNERS" : (slab.partner_scope || "ALL_PARTNERS"),
          status: slab.status === "active" ? "ACTIVE" : "INACTIVE",
          sortOrder: index + 1,
          minTenure: Number(slab.min_tenure) || 6,
          maxTenure: Number(slab.max_tenure) || 24,
        }))

        response = await updateAdminFeeSlabs(productId, { slabs })
      } else if (activeTab === "duration") {
        const durationPayload = {
          requestDurationDays: formData.request_duration || 0,
          approvalDurationDays: formData.approval_duration || 0,
          disbursementDurationDays: formData.disbursement_duration || 0,
          repaymentDurationDays: formData.repayment_duration || 0,
        }

        response = await updateDurationSettings(productId, durationPayload)
      } else if (activeTab === "approval-workflows") {
        // Clear previous errors
        setApprovalWorkflowsErrors({})

        const workflows = formData.approval_scenarios.map((scenario: any) => ({
          workflowType: scenario.type === "auto" ? "AUTO_APPROVAL" : scenario.type === "manual" ? "MANUAL_REVIEW" : "AUTO_REJECTION",
          nameEn: scenario.name || "",
          nameAr: scenario.name_ar || "",
          description: scenario.description || "",
          active: scenario.enabled ?? true,
          priority: scenario.priority || 1,
          conditions: (scenario.conditions || []).map((condition: any, idx: number) => ({
            field: condition.field || "",
            operator: mapOperatorToApiFormat(condition.operator),
            value: String(condition.value ?? ""),
            sortOrder: idx + 1,
          })),
          actions: (scenario.actions || []).map((action: any, idx: number) => ({
            actionType: action.type === "Auto Approval" ? "APPROVE" : action.type === "Manual Review" ? "ESCALATE" : "REJECT",
            configuration: action.configuration || action.value || "{}",
            sortOrder: idx + 1,
          })),
        }))

        response = await updateApprovalWorkflows(productId, { workflows })
      } else if (activeTab === "product-rules") {
        // Clear previous errors
        setErrors({})
        setSimahCheckRulesErrors({})
        
        const payload = buildApiPayload(formData)
        
        // Save product rules first (includes Simah Check Rules)
        response = await createProductSettings(productId, payload)
        
        // Then save nationalities separately if any are selected
        if (response?.data?.message === "success") {
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
              toast.error(nationalitiesError?.response?.data?.message || t("productSettings.rulesSavedNationalitiesFailed"))
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
          toast.error(t("productSettings.addCreditField"))
          return
        }

        // Build payload for risk-service save (replace-all strategy)
        const creditScoringPayload = {
          criteria: validFields.map((field: any, index: number) => ({
            fieldDefinitionId: field.fieldDefinitionId || null,
            customName: field.field_name.trim(),
            custom: !field.fieldDefinitionId,
            enabled: field.enabled ?? true,
            sortOrder: index + 1,
            rules: (field.rules || []).map((rule: any) => ({
              operator: rule.operator || "EQ",
              value: String(rule.value || ""),
              weight: Number(rule.weight) || 0,
              percentage: Number(rule.percentage) || 0,
            }))
          }))
        }

        // Send to risk-service (PUT replace-all)
        response = await saveProductCreditScoringCriteria(productId, creditScoringPayload)
      } else if (activeTab === "fee-settings") {
        // Save fee settings
        const feePayload = {
          minFinancingAmount: formData.min_financing_amount || 0,
          maxFinancingAmount: formData.max_financing_amount || 0,
          vatPercentage: formData.vat_percentage || 0,
          revenueEligibilityThreshold: formData.revenue_eligibility_threshold || 0,
          maxDbrPercentage: formData.dbr_percentage || 0,
          dbrCalculationMethod: (formData.dbr_calculation_method || "GROSS_INCOME").toUpperCase(),
          dbrExceptions: Array.isArray(formData.dbr_exceptions) ? formData.dbr_exceptions.join("\n") : (formData.dbr_exceptions || ""),
          penaltyWaiverAllowed: formData.penalty_waiver_allowed ?? false,
          maxPenaltyWaiversAllowed: formData.penalty_waiver_allowed ? (formData.max_penalty_waivers_allowed ?? null) : null,
        }
        response = await updateFeeSettings(productId, feePayload)
      } else {
        // Clear previous errors for application-steps
        if (activeTab === "application-steps") {
          setApplicationStepsErrors({})
        }

        const payload = buildApiPayload(formData)

        response = await createProductSettings(productId, payload)
      }
      
      if (response?.data?.message === "success") {
        sessionStorage.setItem("settingsFormData", JSON.stringify(formData))
        
        const currentIndex = tabOrder.indexOf(activeTab)
        if (currentIndex < tabOrder.length - 1) {
          setActiveTab(tabOrder[currentIndex + 1])
          toast.success(`${activeTab.replace(/-/g, " ")} saved successfully!`)
        } else {
          toast.success(t("productSettings.settingsSaved"))
          router.push("/Los/ProductManagement/Create/ProductAffiliation")
        }
      } else {
        if (activeTab !== "credit-scoring") {
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
              toast.error(response?.data?.message || t("productSettings.saveSettingsFailed"))
            }
          } else if (activeTab === "terms") {
            const termsErrors: Record<string, string> = {}

            Object.keys(apiErrors).forEach((errorKey) => {
              const errorMessage = Array.isArray(apiErrors[errorKey]) ? apiErrors[errorKey][0] : apiErrors[errorKey]
              if (errorKey === "termsEn") {
                termsErrors.terms_conditions_en = errorMessage
              } else if (errorKey === "termsAr") {
                termsErrors.terms_conditions_ar = errorMessage
              }
            })

            setTermsConditionsErrors(termsErrors)
            
            // Show first error in toast
            const firstErrorKey = Object.keys(apiErrors)[0]
            if (firstErrorKey && Array.isArray(apiErrors[firstErrorKey]) && apiErrors[firstErrorKey].length > 0) {
              toast.error(apiErrors[firstErrorKey][0])
            } else {
              toast.error(response?.data?.message || t("productSettings.termsSaveFailed"))
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
              toast.error(response?.data?.message || t("productSettings.eligibilityFailed"))
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
              toast.error(response?.data?.message || t("productSettings.adminFeeSaveFailed"))
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
              toast.error(response?.data?.message || t("productSettings.rulesSaveFailed"))
            }
          } else {
            toast.error(response?.data?.message || t("productSettings.saveSettingsFailed"))
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
            toast.error(response?.data?.message || t("productSettings.creditSaveFailed"))
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
          toast.error(error?.response?.data?.message || error?.message || t("productSettings.creditSaveFailed"))
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
            toast.error(error?.response?.data?.message || error?.message || t("productSettings.appStepsSaveFailed"))
          }
        } else {
          toast.error(error?.response?.data?.message || error?.message || t("productSettings.appStepsSaveFailed"))
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
          toast.error(error?.response?.data?.message || error?.message || t("productSettings.adminFeeSaveFailed"))
        }
      } else if (activeTab === "terms") {
        // Handle validation errors from catch block for terms and conditions
        const apiErrors = error?.response?.data?.errors || {}
        const termsErrors: Record<string, string> = {}

        Object.keys(apiErrors).forEach((errorKey) => {
          const errorMessage = Array.isArray(apiErrors[errorKey]) ? apiErrors[errorKey][0] : apiErrors[errorKey]
          if (errorKey === "termsEn") {
            termsErrors.terms_conditions_en = errorMessage
          } else if (errorKey === "termsAr") {
            termsErrors.terms_conditions_ar = errorMessage
          }
        })
        
        if (Object.keys(termsErrors).length > 0) {
          setTermsConditionsErrors(termsErrors)
          const firstErrorKey = Object.keys(apiErrors)[0]
          if (firstErrorKey && Array.isArray(apiErrors[firstErrorKey]) && apiErrors[firstErrorKey].length > 0) {
            toast.error(apiErrors[firstErrorKey][0])
          } else {
            toast.error(error?.response?.data?.message || error?.message || t("productSettings.termsSaveFailed"))
          }
        } else {
          toast.error(error?.response?.data?.message || error?.message || t("productSettings.termsSaveFailed"))
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
            toast.error(error?.response?.data?.message || error?.message || t("productSettings.eligibilityFailed"))
          }
        } else {
          toast.error(error?.response?.data?.message || error?.message || t("productSettings.eligibilityFailed"))
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
          toast.error(error?.response?.data?.message || error?.message || t("productSettings.rulesSaveFailed"))
        }
      } else {
        toast.error(error?.response?.data?.message || error?.message || t("productSettings.saveSettingsFailed"))
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
    <div className="min-h-screen bg-background pm-create-page">
      {isLoadingSettings && <Loader />}
      {/* Header - main tabs (no steps / progress) */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="px-3 py-3">
          <div className="max-w-8xl mx-auto">
            <div className={`flex items-center justify-between mb-4 ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
              <div className={`flex items-center gap-4 ${isRTL ? "rtl:flex-row-reverse" : ""}`}>
                <Button variant="ghost" size="sm" onClick={() => router.push("/Los/ProductManagement")} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t("createCategories.backToProducts")}
                </Button>
              </div>
            </div>
            <h1 className="text-xl font-semibold mb-4 flex items-center gap-2.5">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-red-500/10 text-red-600 ring-1 ring-red-500/15">
                <Package className="h-4 w-4" />
              </span>
              {t("createDocs.editProduct")}
            </h1>
            <ProductCreateEditTabs
              activeTab="settings"
              productId={productIdForTabs}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Settings sub-tabs */}
      <div className="px-3 py-4">
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

              <Tab eventKey="terms" title={t("terms.title")}>
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

              <Tab eventKey="fee-settings" title={t("fee.title")}>
                {activeTab === "fee-settings" && (
                  <FeeSettingsTab
                    formData={formData}
                    updateFormData={updateFormData}
                    errors={errors}
                    onNext={handleTabNext}
                    onPrevious={handleTabPrevious}
                    productTypeName={productTypeName}
                  />
                )}
              </Tab>

              {/* Hidden: Product Rules & Affordability Income Slabs tabs
              <Tab eventKey="product-rules" title="Product Rules">
                {activeTab === "product-rules" && (
                  <>
                  <ProductRulesTab
                    formData={formData}
                    updateFormData={updateFormData}
                    errors={{ ...errors, ...simahCheckRulesErrors }}
                    onNext={handleProductRulesSave}
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
              */}

              <Tab eventKey="admin-fees" title={t("feeSlabs.title")}>
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
              </Tab>

              <Tab eventKey="duration" title={t("duration.title")}>
                {activeTab === "duration" && (
                  <DurationSettingsTab
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={handleTabNext}
                    onPrevious={handleTabPrevious}
                  />
                )}
              </Tab>

              <Tab eventKey="approval-workflows" title={t("workflows.title")}>
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

               {/* Credit Scoring Engine tab */}
              <Tab eventKey="credit-scoring" title={t("creditScoring.title")}>
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
