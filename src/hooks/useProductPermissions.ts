import { useSelector } from "react-redux"
import { RootState } from "../redux/rootReducer"
import { implementWorkFlowAction } from "../redux/apis/apisCrudWebPageManagement"
import toast from "react-hot-toast"
import { isSuperAdminFromToken } from "../utils/getLandingRoute"

/** Decode a JWT and return true if it carries the `super_admin` Keycloak realm role. */
function tokenIsSuperAdmin(token?: string): boolean {
  if (!token || typeof token !== "string") return false
  try {
    const payload = token.split(".")[1]
    if (!payload) return false
    const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
    return isSuperAdminFromToken(claims)
  } catch {
    return false
  }
}

interface Permission {
  id: number
  name?: string
  permissionName?: string
  permissionCode?: string
  code?: string
  moduleId?: number
}

/**
 * All identifier strings a permission object exposes, regardless of backend shape.
 * The identity-service `/permissions/role/{id}` payload (SSO login path) exposes
 * `permissionCode` (e.g. "PRODUCT_CREATE") and `permissionName` (e.g. "Create
 * Product"); the OTP v2 payload uses `name`. A caller's key may match ANY of these,
 * so `hasPermission` must test all of them — not just the first present one.
 */
const getPermissionKeys = (p: Permission): string[] =>
  [p?.permissionCode, p?.code, p?.name, p?.permissionName]
    .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    .map((v) => v.trim().toLowerCase())

// ============================================
// WORKFLOW ACTION TYPES
// ============================================
export enum WORKFLOW_ACTIONS {
  CHECK = "check",
  CHECK_REJECT = "check-reject",
  APPROVE = "approve",
  APPROVE_REJECT = "approve-reject",
}

// ============================================
// MODULE NAME MAPPING FOR WORKFLOW API
// Module names should be singular with underscores
// ============================================
export const WORKFLOW_MODULE_NAMES = {
  // Product Management
  PRODUCT: "product",
  PRODUCT_ADMIN: "product_admin",
  DOCUMENT: "document",
  PROCESSING_FEE_SLAB: "processing_fee_slab",
  
  // Department Management
  DEPARTMENT: "department",
  
  // LOV Management
  PURPOSE_OF_FINANCE: "purpose_of_finance",
  SOURCE_OF_REVENUE: "source_of_revenue",
  SUB_COMMODITY_TYPE: "sub_commodity_type",
  
  // Partner Management
  PARTNER: "partner",
  PARTNER_ADMIN: "partner_admin",
  
  // Settings
  EMPLOYEE: "employee",
  ROLE: "role",
  PERMISSION: "permission",
  
  // API Management
  API: "api",
  
  // Block Codes (for future use)
  USER_BLOCK_COMPLIANCE: "user_block_compliance",
  USER_BLOCK_AML: "user_block_aml",
  USER_BLOCK_ANTI_FRAUD: "user_block_anti_fraud",
  USER_BLOCK_SANCTION: "user_block_sanction",
  BLOCK_ENTITY: "block_entity",
  
  // Write Off
  WRITE_OFF: "write_off",
  
  // Workflow
  WORKFLOW: "workflow",
  
  // Invoice
  INVOICE_ADMIN: "invoice_admin",
}

// ============================================
// PERMISSION CONSTANTS - Add all module permissions here
// ============================================

// Product Management Module permission names (legacy / workflow)
export const PRODUCT_PERMISSIONS = {
  // Product permissions
  MAKER_SUBMIT: "product.maker.submit",
  MAKER_RESUBMIT: "product.maker.resubmit",
  CHECKER_VERIFY: "product.checker.verify",
  CHECKER_REJECT: "product.checker.reject",
  APPROVER_APPROVE: "product.approver.approve",
  APPROVER_REJECT: "product.approver.reject",
  // Product Admin permissions
  ADMIN_MAKER_SUBMIT: "product_admin.maker.submit",
  ADMIN_MAKER_RESUBMIT: "product_admin.maker.resubmit",
  ADMIN_CHECKER_VERIFY: "product_admin.checker.verify",
  ADMIN_CHECKER_REJECT: "product_admin.checker.reject",
  ADMIN_APPROVER_APPROVE: "product_admin.approver.approve",
  ADMIN_APPROVER_REJECT: "product_admin.approver.reject",
}

// New LOS API permission names (product_management_module permissionsList)
// Use these with hasPermission() when your API returns this structure
export const PRODUCT_PERMISSIONS_LOS = {
  MODULE: "product_management",
  LIST: "PRODUCT_READ",
  CREATE: "PRODUCT_CREATE",
  EDIT: "PRODUCT_UPDATE",
  DELETE: "PRODUCT_DELETE",
  SHOW: "PRODUCT_READ",
  PRODUCT_FEE_SETTING: "PRODUCT_SETTINGS_UPDATE",
  UPDATE_STATUS: "PRODUCT_UPDATE",
  // Product Admin (sub-module) — backend has no separate product-admin module
  LIST_ADMIN: "PRODUCT_READ",
  CREATE_ADMIN: "PRODUCT_CREATE",
  EDIT_ADMIN: "PRODUCT_UPDATE",
  DELETE_ADMIN: "PRODUCT_DELETE",
} as const

// Document Module permission names (moduleId: 14)
// Required documents live under the backend PRODUCT module as PRODUCT_DOCUMENT_*.
export const DOCUMENT_PERMISSIONS = {
  LIST: "PRODUCT_DOCUMENT_READ",
  CREATE: "PRODUCT_DOCUMENT_CREATE",
  EDIT: "PRODUCT_DOCUMENT_UPDATE",
  DELETE: "PRODUCT_DOCUMENT_DELETE",
  // Workflow keys below have no backend permission — gates stay hidden as before
  MAKER_SUBMIT: "document.maker.submit",
  MAKER_RESUBMIT: "document.maker.resubmit",
  CHECKER_VERIFY: "document.checker.verify",
  CHECKER_REJECT: "document.checker.reject",
  APPROVER_APPROVE: "document.approver.approve",
  APPROVER_REJECT: "document.approver.reject",
}

// ============================================
// MODULE 3-4: Application Board Module
// ============================================
export const BOARD_ACTIONS_PERMISSIONS = {
  CREATE_CHAT: "create_chat",
  DEPARTMENT_ASSIGNMENT: "department_assignment",
  USER_ASSIGNMENT: "user_assignment",
}

// ============================================
// MODULE 5-9: Customer Management Module
// ============================================
// Leads/Opportunities have no dedicated backend module — they are customer-domain
// read views, so gate them behind the Customer module's READ permission.
export const LEAD_PERMISSIONS = {
  LIST: "CUSTOMER_READ",
  EXPORT: "CUSTOMER_READ",
}

export const CUSTOMER_PERMISSIONS = {
  LIST: "CUSTOMER_READ",
  EXPORT: "CUSTOMER_READ",
}

export const OPPORTUNITY_PERMISSIONS = {
  LIST: "CUSTOMER_READ",
  EXPORT: "CUSTOMER_READ",
}

export const ONBOARD_CUSTOMERS_PERMISSIONS = {
  LIST: "ONBOARDING_READ",
  RESEND_EMAIL: "ONBOARDING_WRITE",
}

// ============================================
// MODULE 10-22: Product Management (already defined above)
// Additional sub-module permissions
// ============================================
export const ASSIGNED_PRODUCT_CATEGORY_PERMISSIONS = {
  LIST: "list_assigned_product_category",
  UPDATE: "update_assigned_product_category",
}

export const PRODUCT_PARTNERS_PERMISSIONS = {
  LIST: "list_product_partner",
  UPDATE: "update_product_partner",
}

export const PRODUCT_INSURANCE_VENDORS_PERMISSIONS = {
  LIST: "list_product_insurance_vendor",
  UPDATE: "update_product_insurance_vendor",
}

export const PRODUCT_SETTING_PERMISSIONS = {
  LIST: "list_product_setting",
}

export const PROCESSING_FEE_SLAB_PERMISSIONS = {
  LIST: "list_processing_fee_slab",
  CREATE: "create_processing_fee_slab",
  EDIT: "edit_processing_fee_slab",
  DELETE: "delete_processing_fee_slab",
  MAKER_SUBMIT: "processing_fee_slab.maker.submit",
  MAKER_RESUBMIT: "processing_fee_slab.maker.resubmit",
  CHECKER_VERIFY: "processing_fee_slab.checker.verify",
  CHECKER_REJECT: "processing_fee_slab.checker.reject",
  APPROVER_APPROVE: "processing_fee_slab.approver.approve",
  APPROVER_REJECT: "processing_fee_slab.approver.reject",
}

export const PRODUCT_VERIFICATION_METHODS_PERMISSIONS = {
  LIST: "product_verification_methods",
  UPDATE: "update_product_verification_methods",
}

export const APPLICATION_STEPS_PERMISSIONS = {
  VIEW: "application_steps",
}

export const TERMS_CONDITIONS_PERMISSIONS = {
  VIEW: "terms_&_conditions",
}

export const FEE_SETTING_PERMISSIONS = {
  VIEW: "application_fee",
}

export const API_REQUEST_DURATION_PERMISSIONS = {
  VIEW: "api_request_duration",
  UPDATE: "update_api_request_duration",
}

export const DEPARTMENT_PERMISSION_MODULE_PERMISSIONS = {
  VIEW: "department_permission",
}

// ============================================
// MODULE 23: Insurance Vendors Management
// ============================================
// NOTE(permissions): Insurance vendors are served by the LEGACY backend
// (VITE_REACT_APP_API_BASE_URL, endpoints under insurance-vendor), which is NOT
// covered by the identity-service permission catalog. No real code exists to gate
// these, so the keys below never match and the gates stay hidden. Either add a
// backend permission, or ungate these actions (they predate the identity ACL).
export const VENDOR_PERMISSIONS = {
  LIST: "list_vendor",
  CREATE: "create_vendor",
  EDIT: "edit_vendor",
  SHOW: "show_vendor",
  DELETE: "delete_vendor",
  UPDATE_STATUS: "update_vendor_status",
}

// ============================================
// MODULE 24-26: Department Management
// ============================================
export const DEPARTMENT_PERMISSIONS_MODULE = {
  LIST: "list_department_permissions",
  UPDATE: "update_department_permissions",
  SHOW_ASSIGNED: "show_assigned_department_permissions",
}

export const DEPARTMENT_PERMISSIONS = {
  CREATE: "create_department",
  EDIT: "edit_department",
  DELETE: "delete_department",
  SHOW: "show_department",
  LIST: "list_department",
  UPDATE_STATUS: "update_department_status",
  SET_DEFAULT: "set_default_department",
  MAKER_SUBMIT: "department.maker.submit",
  MAKER_RESUBMIT: "department.maker.resubmit",
  CHECKER_VERIFY: "department.checker.verify",
  CHECKER_REJECT: "department.checker.reject",
  APPROVER_APPROVE: "department.approver.approve",
  APPROVER_REJECT: "department.approver.reject",
}

// ============================================
// MODULE 27-35: LOV Management
// ============================================
export const LOV_PERMISSIONS = {
  MANAGEMENT: "lov_management",
}

export const PURPOSE_OF_FINANCE_PERMISSIONS = {
  CREATE: "create_purpose_of_finance",
  DELETE: "delete_purpose_of_finance",
  EDIT: "edit_purpose_of_finance",
  SHOW: "show_purpose_of_finance",
  LIST: "list_purpose_of_finance",
  UPDATE_STATUS: "update_purpose_of_finance_status",
  MAKER_SUBMIT: "purpose_of_finance.maker.submit",
  MAKER_RESUBMIT: "purpose_of_finance.maker.resubmit",
  CHECKER_VERIFY: "purpose_of_finance.checker.verify",
  CHECKER_REJECT: "purpose_of_finance.checker.reject",
  APPROVER_APPROVE: "purpose_of_finance.approver.approve",
  APPROVER_REJECT: "purpose_of_finance.approver.reject",
}

// NOTE(permissions): "Source of Revenue" is served by the LEGACY backend
// (VITE_REACT_APP_API_BASE_URL, /source-of-revenue) and is distinct from the new
// identity-service LOV entities Source of Funds/Income/Wealth (LOV_SOF/SOI/SOW).
// No real code exists for it, so keys below never match and gates stay hidden.
// Add a backend permission or ungate; do NOT map to LOV_SOF/SOI/SOW.
export const SOURCE_OF_REVENUE_PERMISSIONS = {
  CREATE: "create_source_of_revenue",
  DELETE: "delete_source_of_revenue",
  EDIT: "edit_source_of_revenue",
  SHOW: "show_source_of_revenue",
  LIST: "list_source_of_revenue",
  UPDATE_STATUS: "update_source_of_revenue_status",
  MAKER_SUBMIT: "source_of_revenue.maker.submit",
  MAKER_RESUBMIT: "source_of_revenue.maker.resubmit",
  CHECKER_VERIFY: "source_of_revenue.checker.verify",
  CHECKER_REJECT: "source_of_revenue.checker.reject",
  APPROVER_APPROVE: "source_of_revenue.approver.approve",
  APPROVER_REJECT: "source_of_revenue.approver.reject",
}

// NOTE(permissions): Check-Types are served by the LEGACY backend
// (VITE_REACT_APP_API_BASE_URL, /check-type), not the identity-service. The new LOV
// module only covers POF / Source-of-Funds / Income / Wealth / NWR — there is no
// "check type" code. Keys below never match, so gates stay hidden. Add a backend
// permission or ungate; do NOT map to an unrelated LOV entity.
export const CHECKS_TYPES_PERMISSIONS = {
  LIST: "list_checks_type",
  CREATE: "create_checks_type",
  EDIT: "edit_checks_type",
  DELETE: "delete_checks_type",
  SHOW: "show_checks_type",
  UPDATE_STATUS: "update_checks_type_status",
  LIST_CONSTANT: "list_constant_checks_type",
}

export const TYPES_REASONS_PERMISSIONS = {
  LIST: "list_types_reason",
  CREATE: "create_types_reason",
  EDIT: "edit_types_reason",
  DELETE: "delete_types_reason",
  SHOW: "show_types_reason",
  UPDATE_STATUS: "update_types_reason_status",
}

export const PRODUCT_CATEGORIES_PERMISSIONS = {
  LIST: "PRODUCT_CATEGORY_READ",
  CREATE: "PRODUCT_CATEGORY_CREATE",
  EDIT: "PRODUCT_CATEGORY_UPDATE",
  DELETE: "PRODUCT_CATEGORY_DELETE",
  UPDATE_STATUS: "PRODUCT_CATEGORY_UPDATE",
  SET_DEFAULT: "PRODUCT_CATEGORY_UPDATE",
}

export const PRODUCT_TYPES_PERMISSIONS = {
  LIST: "list_product_type",
  CREATE: "create_product_type",
  UPDATE_STATUS: "update_product_type_status",
  SHOW: "show_product_type",
  DELETE: "delete_product_type",
}

export const COMMODITY_TYPES_PERMISSIONS = {
  LIST: "list_commodity_type",
  CREATE: "create_commodity_type",
  EDIT: "edit_commodity_type",
  SHOW: "show_commodity_type",
  DELETE: "delete_commodity_type",
  UPDATE_STATUS: "update_commodity_type_status",
}

export const SUB_COMMODITY_TYPES_PERMISSIONS = {
  LIST: "list_sub_commodity_type",
  CREATE: "create_sub_commodity_type",
  EDIT: "edit_sub_commodity_type",
  MAKER_SUBMIT: "sub_commodity_type.maker.submit",
  MAKER_RESUBMIT: "sub_commodity_type.maker.resubmit",
  CHECKER_VERIFY: "sub_commodity_type.checker.verify",
  CHECKER_REJECT: "sub_commodity_type.checker.reject",
  APPROVER_APPROVE: "sub_commodity_type.approver.approve",
  APPROVER_REJECT: "sub_commodity_type.approver.reject",
}

// ============================================
// MODULE 36-39: Loan Management
// ============================================
export const LOAN_PERMISSIONS = {
  MANAGEMENT: "loan_management",
  RESEND_LOGIN_EMAIL: "resend_login_email",
  EXPORT_CSV: "export_csv",
  RETRY_KASTLE: "retry_kastle_entry",
}

export const LOAN_APPLICATION_PERMISSIONS = {
  LIST: "list_application",
}

export const VIEW_LOAN_APPLICATION_PERMISSIONS = {
  VIEW: "view_application",
  APPROVE_LOAN_AMOUNT: "approve_loan_amount",
  APPROVE_APPLICATION: "approve_application",
  REJECT_APPLICATION: "reject_application",
  SUBMIT_REVENUE: "submit_revenue",
  VIEW_DOCUMENTS: "view_application_documents",
  REQUEST_DOCUMENTS: "request_application_documents",
  APPROVE_REVENUE: "approve_revenue",
  REJECT_REVENUE: "reject_revenue",
  UPLOAD_SIMAH: "upload_simmah_document",
  APPROVE_BAYAN: "approve_bayan_info",
  REJECT_BAYAN: "reject_bayan_info",
  APPROVE_COMPLIANCE: "approve_compliance_check",
  REJECT_COMPLIANCE: "reject_compliance_check",
  CALCULATE_WEIGHTAGE: "calculate_weightage",
  APPROVE_CREDIT: "approve_credit_check",
  REJECT_CREDIT: "reject_credit_check",
}

export const ACTIVITY_LOGS_PERMISSIONS = {
  LIST: "list_activity_logs",
}

// ============================================
// MODULE 40-41: Partner Management
// ============================================
export const PARTNER_PERMISSIONS = {
  MANAGEMENT: "partner_management",
  LIST: "PARTNER_READ",
  CREATE: "PARTNER_CREATE",
  EDIT: "PARTNER_UPDATE",
  UPDATE: "PARTNER_UPDATE",
  DELETE: "PARTNER_MANAGE", // backend has no PARTNER_DELETE; MANAGE is the closest
  UPDATE_STATUS: "PARTNER_UPDATE",
  // Workflow keys below have no backend permission — gates stay hidden as before
  MAKER_SUBMIT: "partner.maker.submit",
  MAKER_RESUBMIT: "partner.maker.resubmit",
  CHECKER_VERIFY: "partner.checker.verify",
  CHECKER_REJECT: "partner.checker.reject",
  APPROVER_APPROVE: "partner.approver.approve",
  APPROVER_REJECT: "partner.approver.reject",
  LIST_COMMISSION: "PARTNER_READ",
}

// Backend has no separate partner-admin module — gate under the Partner module.
export const PARTNER_ADMIN_PERMISSIONS = {
  LIST: "PARTNER_READ",
  CREATE: "PARTNER_CREATE",
  EDIT: "PARTNER_UPDATE",
  DELETE: "PARTNER_MANAGE",
  UPDATE_STATUS: "PARTNER_UPDATE",
  RESEND_EMAIL: "PARTNER_WRITE",
  // Workflow keys below have no backend permission — gates stay hidden as before
  MAKER_SUBMIT: "partner_admin.maker.submit",
  MAKER_RESUBMIT: "partner_admin.maker.resubmit",
  CHECKER_VERIFY: "partner_admin.checker.verify",
  CHECKER_REJECT: "partner_admin.checker.reject",
  APPROVER_APPROVE: "partner_admin.approver.approve",
  APPROVER_REJECT: "partner_admin.approver.reject",
}

// ============================================
// MODULE 42-45: Settings Management
// ============================================
export const SETTING_PERMISSIONS = {
  MANAGEMENT: "setting_management",
}

export const EMPLOYEE_PERMISSIONS = {
  CREATE: "EMPLOYEE_CREATE",
  EDIT: "EMPLOYEE_UPDATE",
  DELETE: "EMPLOYEE_DELETE",
  SHOW: "EMPLOYEE_READ",
  LIST: "EMPLOYEE_READ",
  ASSIGN_PERMISSION: "EMPLOYEE_UPDATE",
  REVOKE_PERMISSION: "EMPLOYEE_UPDATE",
  RESEND_EMAIL: "EMPLOYEE_UPDATE",
  UPDATE_STATUS: "EMPLOYEE_UPDATE",
  // Workflow keys below have no backend permission — gates stay hidden as before
  MAKER_SUBMIT: "employee.maker.submit",
  MAKER_RESUBMIT: "employee.maker.resubmit",
  CHECKER_VERIFY: "employee.checker.verify",
  CHECKER_REJECT: "employee.checker.reject",
  APPROVER_APPROVE: "employee.approver.approve",
  APPROVER_REJECT: "employee.approver.reject",
}

export const ROLE_PERMISSIONS = {
  LIST: "ROLE_READ",
  CREATE: "ROLE_WRITE", // backend Role module exposes READ / WRITE / DELETE only
  DELETE: "ROLE_DELETE",
  EDIT: "ROLE_WRITE",
  SHOW: "ROLE_READ",
  ASSIGN_PERMISSION: "ROLE_WRITE",
  REVOKE_PERMISSION: "ROLE_WRITE",
  UPDATE_STATUS: "ROLE_WRITE",
  // Workflow keys below have no backend permission — gates stay hidden as before
  MAKER_SUBMIT: "role.maker.submit",
  MAKER_RESUBMIT: "role.maker.resubmit",
  CHECKER_VERIFY: "role.checker.verify",
  CHECKER_REJECT: "role.checker.reject",
  APPROVER_APPROVE: "role.approver.approve",
  APPROVER_REJECT: "role.approver.reject",
}

export const PERMISSION_PERMISSIONS = {
  LIST: "PERMISSION_READ",
  CREATE: "PERMISSION_WRITE", // backend Permission module exposes READ / WRITE / DELETE only
  DELETE: "PERMISSION_DELETE",
  EDIT: "PERMISSION_WRITE",
  SHOW: "PERMISSION_READ",
  // Workflow keys below have no backend permission — gates stay hidden as before
  MAKER_SUBMIT: "permission.maker.submit",
  MAKER_RESUBMIT: "permission.maker.resubmit",
  CHECKER_VERIFY: "permission.checker.verify",
  CHECKER_REJECT: "permission.checker.reject",
  APPROVER_APPROVE: "permission.approver.approve",
  APPROVER_REJECT: "permission.approver.reject",
}

// ============================================
// MODULE 50: API Management
// ============================================
// NOTE(permissions): Partner-API management is served by the LEGACY backend
// (VITE_REACT_APP_API_BASE_URL, /apis-management/partner-apis), not the
// identity-service. The new MIDDLEWARE module's Provider-APIs are a different
// concept. No real code exists here, so keys below never match and the enable/status
// button stays disabled. Add a backend permission or ungate.
export const API_PERMISSIONS = {
  MANAGEMENT: "api_management",
  LIST_PARTNER_API: "list_partner_api",
  ENABLE_PARTNER_API: "enable_partner_api",
  LIST: "list_api",
  CREATE: "create_api",
  EDIT: "edit_api",
  DELETE: "delete_api",
  UPDATE_STATUS: "update_api_status",
  MAKER_SUBMIT: "api.maker.submit",
  MAKER_RESUBMIT: "api.maker.resubmit",
  CHECKER_VERIFY: "api.checker.verify",
  CHECKER_REJECT: "api.checker.reject",
  APPROVER_APPROVE: "api.approver.approve",
  APPROVER_REJECT: "api.approver.reject",
}

// ============================================
// RISK Management — identity-service RISK_* codes
// ============================================
export const RISK_BLACKLIST_PERMISSIONS = {
  LIST: "RISK_BLACKLIST_READ",
  CREATE: "RISK_BLACKLIST_CREATE",
  DELETE: "RISK_BLACKLIST_DELETE",
  CHECK: "RISK_BLACKLIST_CHECK",
}

export const RISK_DEVICES_PERMISSIONS = {
  LIST: "RISK_DEVICES_READ",
  CREATE: "RISK_DEVICES_CREATE",
  EDIT: "RISK_DEVICES_UPDATE",
  DELETE: "RISK_DEVICES_DELETE",
}

export const RISK_FRAUD_PERMISSIONS = {
  LIST: "RISK_FRAUD_RULES_READ",
  CREATE: "RISK_FRAUD_RULES_CREATE",
  EDIT: "RISK_FRAUD_RULES_UPDATE",
  DELETE: "RISK_FRAUD_RULES_DELETE",
}

// Internal checks / risk parameters / thresholds config
export const RISK_CONFIG_PERMISSIONS = {
  LIST: "RISK_PARAMETERS_READ",
  EDIT: "RISK_PARAMETERS_UPDATE",
  MANAGE: "RISK_PARAMETERS_MANAGE",
}

// ============================================
// POLICY (lending policies: dunning, reschedule, waivers) — identity-service POLICY_*
// ============================================
export const POLICY_PERMISSIONS = {
  LIST: "POLICY_READ",
  CREATE: "POLICY_CREATE",
  EDIT: "POLICY_WRITE", // backend Policy has CREATE/READ/DELETE/WRITE/MANAGE/AUTHORIZE (no UPDATE)
  DELETE: "POLICY_DELETE",
  MANAGE: "POLICY_MANAGE",
  AUTHORIZE: "POLICY_AUTHORIZE",
}

// ============================================
// WALLET admin (transfer charges, account limits) — identity-service WALLET_*
// ============================================
export const WALLET_PERMISSIONS = {
  LIST: "WALLET_READ",
  CREATE: "WALLET_CREATE",
  EDIT: "WALLET_WRITE", // backend Wallet has CREATE/READ/WRITE/MANAGE (no UPDATE/DELETE)
  MANAGE: "WALLET_MANAGE",
}

// ============================================
// EXCHANGE — Exchange Top-up (providers + payments). Module code: EXCHANGE.
// Adjust these codes if the backend's identity-service catalog uses different ones.
// ============================================
export const EXCHANGE_PERMISSIONS = {
  MODULE: "EXCHANGE",
  PROVIDER_LIST: "EXCHANGE_PROVIDER_READ",
  PROVIDER_CREATE: "EXCHANGE_PROVIDER_CREATE",
  PROVIDER_EDIT: "EXCHANGE_PROVIDER_UPDATE",
  PROVIDER_DELETE: "EXCHANGE_PROVIDER_DELETE",
  PAYMENT_LIST: "EXCHANGE_PAYMENT_READ",
  COUNTRY_LIST: "EXCHANGE_COUNTRY_READ",
  COUNTRY_CREATE: "EXCHANGE_COUNTRY_CREATE",
  COUNTRY_EDIT: "EXCHANGE_COUNTRY_UPDATE",
  DOCUMENT_TYPE_LIST: "EXCHANGE_DOCUMENT_TYPE_READ",
  DOCUMENT_TYPE_CREATE: "EXCHANGE_DOCUMENT_TYPE_CREATE",
  DOCUMENT_TYPE_EDIT: "EXCHANGE_DOCUMENT_TYPE_UPDATE",
  VERIFICATION_LIST: "EXCHANGE_VERIFICATION_READ",
  VERIFICATION_REVIEW: "EXCHANGE_VERIFICATION_REVIEW", // approve/reject
}

// ============================================
// KYC — identity-service KYC_*
// ============================================
export const KYC_PERMISSIONS = {
  LIST: "KYC_READ",
  EDIT: "KYC_WRITE",
}

// ============================================
// LOV entities (EDD reference data) — identity-service LOV_* codes
// ============================================
export const LOV_SOURCE_OF_FUNDS_PERMISSIONS = {
  LIST: "LOV_SOF_READ", CREATE: "LOV_SOF_CREATE", EDIT: "LOV_SOF_UPDATE", DELETE: "LOV_SOF_DELETE",
}
export const LOV_SOURCE_OF_INCOME_PERMISSIONS = {
  LIST: "LOV_SOI_READ", CREATE: "LOV_SOI_CREATE", EDIT: "LOV_SOI_UPDATE", DELETE: "LOV_SOI_DELETE",
}
export const LOV_SOURCE_OF_WEALTH_PERMISSIONS = {
  LIST: "LOV_SOW_READ", CREATE: "LOV_SOW_CREATE", EDIT: "LOV_SOW_UPDATE", DELETE: "LOV_SOW_DELETE",
}
export const LOV_PURPOSE_OF_FINANCE_PERMISSIONS = {
  LIST: "LOV_POF_READ", CREATE: "LOV_POF_CREATE", EDIT: "LOV_POF_UPDATE", DELETE: "LOV_POF_DELETE",
}
export const LOV_NET_WORTH_RANGE_PERMISSIONS = {
  LIST: "LOV_NWR_READ", CREATE: "LOV_NWR_CREATE", EDIT: "LOV_NWR_UPDATE", DELETE: "LOV_NWR_DELETE",
}
export const LOV_RELATIONSHIP_PERMISSIONS = {
  LIST: "LOV_RELATIONSHIP_READ", CREATE: "LOV_RELATIONSHIP_CREATE", EDIT: "LOV_RELATIONSHIP_UPDATE", DELETE: "LOV_RELATIONSHIP_DELETE",
}
export const LOV_APPROVAL_CONDITION_PERMISSIONS = {
  LIST: "APPROVAL_CONDITION_FIELD_READ", CREATE: "APPROVAL_CONDITION_FIELD_CREATE", EDIT: "APPROVAL_CONDITION_FIELD_UPDATE", DELETE: "APPROVAL_CONDITION_FIELD_DELETE",
}
export const RISK_CREDIT_SCORING_FIELDS_PERMISSIONS = {
  LIST: "RISK_CREDIT_SCORING_FIELDS_READ", CREATE: "RISK_CREDIT_SCORING_FIELDS_CREATE", EDIT: "RISK_CREDIT_SCORING_FIELDS_UPDATE", DELETE: "RISK_CREDIT_SCORING_FIELDS_DELETE",
}
// PRODUCT-module reference data (countries, template types) live under the Product module.
export const PRODUCT_COUNTRY_PERMISSIONS = {
  LIST: "COUNTRY_READ", CREATE: "COUNTRY_CREATE", EDIT: "COUNTRY_UPDATE", DELETE: "COUNTRY_DELETE",
}
export const PRODUCT_TEMPLATE_TYPE_PERMISSIONS = {
  LIST: "TEMPLATE_TYPE_READ", CREATE: "TEMPLATE_TYPE_CREATE", EDIT: "TEMPLATE_TYPE_UPDATE", DELETE: "TEMPLATE_TYPE_DELETE",
}

/** Get all modules array from Redux permission data (los or direct array) */
function getAllModulesFromPermissionData(permissionData: any): any[] {
  if (!permissionData) return []
  if (permissionData?.los && Array.isArray(permissionData.los)) return permissionData.los
  if (Array.isArray(permissionData)) return permissionData
  return []
}

export const useProductPermissions = () => {
  const permissionData = useSelector((state: RootState) => state.block.permissions)
  const token = useSelector((state: RootState) => state.block.token)
  const allModules = getAllModulesFromPermissionData(permissionData)
  // Super admin has no role/permissions assigned but carries the `super_admin`
  // Keycloak realm role — grant them every permission so gated actions stay visible.
  const isSuperAdmin = tokenIsSuperAdmin(token)

  /**
   * Check if user has a specific permission
   * @param permissionName - The name of the permission to check (e.g. 'create_product' or 'product.maker.submit')
   * @returns boolean indicating if user has the permission
   */
  const hasPermission = (permissionName: string): boolean => {
    if (isSuperAdmin) return true
    if (!permissionName || allModules.length === 0) return false

    const target = permissionName.trim().toLowerCase()
    const matches = (p: Permission) => getPermissionKeys(p).includes(target)

    const findPermissionInModule = (module: any): boolean => {
      if (module.permissionsList && Array.isArray(module.permissionsList)) {
        if (module.permissionsList.some(matches)) return true
      }
      if (module.permissions && Array.isArray(module.permissions)) {
        if (module.permissions.some(matches)) return true
      }
      if (module.sub_modules && Array.isArray(module.sub_modules)) {
        for (const subModule of module.sub_modules) {
          if (findPermissionInModule(subModule)) return true
        }
      }
      if (module.subModulesList && Array.isArray(module.subModulesList)) {
        for (const subModule of module.subModulesList) {
          if (findPermissionInModule(subModule)) return true
        }
      }
      return false
    }

    return allModules.some((module: any) => findPermissionInModule(module))
  }

  /**
   * Get all permission names for a module (and its submodules) by moduleName.
   * Useful for custom checks when using the new LOS module structure.
   */
  const getModulePermissionNames = (moduleName: string): string[] => {
    const names: string[] = []
    const collect = (module: any) => {
      if (module.permissionsList && Array.isArray(module.permissionsList)) {
        module.permissionsList.forEach((p: Permission) => names.push(...getPermissionKeys(p)))
      }
      if (module.permissions && Array.isArray(module.permissions)) {
        module.permissions.forEach((p: Permission) => names.push(...getPermissionKeys(p)))
      }
      if (module.subModulesList && Array.isArray(module.subModulesList)) {
        module.subModulesList.forEach((sub: any) => collect(sub))
      }
      if (module.sub_modules && Array.isArray(module.sub_modules)) {
        module.sub_modules.forEach((sub: any) => collect(sub))
      }
    }
    const module = allModules.find((m: any) => m.moduleName === moduleName)
    if (module) collect(module)
    return names
  }

  /**
   * Check if user has any of the given permissions
   * @param permissionNames - Array of permission names to check
   * @returns boolean indicating if user has any of the permissions
   */
  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some((name) => hasPermission(name))
  }

  // Convenience methods for common permission checks

  /**
   * Check if user can add/edit/delete (maker permissions or new LOS CRUD permissions)
   */
  const canMakeChanges = (): boolean => {
    return hasAnyPermission([
      PRODUCT_PERMISSIONS.MAKER_SUBMIT,
      PRODUCT_PERMISSIONS.MAKER_RESUBMIT,
      PRODUCT_PERMISSIONS.ADMIN_MAKER_SUBMIT,
      PRODUCT_PERMISSIONS.ADMIN_MAKER_RESUBMIT,
      PRODUCT_PERMISSIONS_LOS.CREATE,
      PRODUCT_PERMISSIONS_LOS.EDIT,
      PRODUCT_PERMISSIONS_LOS.DELETE,
      PRODUCT_PERMISSIONS_LOS.CREATE_ADMIN,
      PRODUCT_PERMISSIONS_LOS.EDIT_ADMIN,
      PRODUCT_PERMISSIONS_LOS.DELETE_ADMIN,
    ])
  }

  /**
   * Check if user can verify (checker permissions)
   */
  const canVerify = (): boolean => {
    return hasAnyPermission([
      PRODUCT_PERMISSIONS.CHECKER_VERIFY,
      PRODUCT_PERMISSIONS.ADMIN_CHECKER_VERIFY,
    ])
  }

  /**
   * Check if user can reject as checker
   */
  const canCheckerReject = (): boolean => {
    return hasAnyPermission([
      PRODUCT_PERMISSIONS.CHECKER_REJECT,
      PRODUCT_PERMISSIONS.ADMIN_CHECKER_REJECT,
    ])
  }

  /**
   * Check if user can approve (approver permissions)
   */
  const canApprove = (): boolean => {
    return hasAnyPermission([
      PRODUCT_PERMISSIONS.APPROVER_APPROVE,
      PRODUCT_PERMISSIONS.ADMIN_APPROVER_APPROVE,
    ])
  }

  /**
   * Check if user can reject as approver
   */
  const canApproverReject = (): boolean => {
    return hasAnyPermission([
      PRODUCT_PERMISSIONS.APPROVER_REJECT,
      PRODUCT_PERMISSIONS.ADMIN_APPROVER_REJECT,
    ])
  }

  // Alias methods
  const canAdd = (): boolean => canMakeChanges()
  const canEdit = (): boolean => canMakeChanges()
  const canDelete = (): boolean => canMakeChanges()

  // ============================================
  // GENERIC PERMISSION HELPERS - Use for any module
  // ============================================
  
  /**
   * Generic helper to check if user can perform CRUD operations
   * @param permissionObj - Permission constants object (e.g., DOCUMENT_PERMISSIONS, PRODUCT_PERMISSIONS)
   */
  const canCreate = (permissionObj: Record<string, string>): boolean => {
    return hasAnyPermission([
      permissionObj.CREATE,
      permissionObj.MAKER_SUBMIT,
      permissionObj.MAKER_RESUBMIT,
      permissionObj.ADMIN_MAKER_SUBMIT,
      permissionObj.ADMIN_MAKER_RESUBMIT,
    ].filter(Boolean))
  }

  const canUpdate = (permissionObj: Record<string, string>): boolean => {
    return hasAnyPermission([
      permissionObj.EDIT,
      permissionObj.MAKER_SUBMIT,
      permissionObj.MAKER_RESUBMIT,
      permissionObj.ADMIN_MAKER_SUBMIT,
      permissionObj.ADMIN_MAKER_RESUBMIT,
    ].filter(Boolean))
  }

  const canRemove = (permissionObj: Record<string, string>): boolean => {
    return hasAnyPermission([
      permissionObj.DELETE,
      permissionObj.MAKER_SUBMIT,
      permissionObj.MAKER_RESUBMIT,
      permissionObj.ADMIN_MAKER_SUBMIT,
      permissionObj.ADMIN_MAKER_RESUBMIT,
    ].filter(Boolean))
  }

  const canView = (permissionObj: Record<string, string>): boolean => {
    return hasAnyPermission([
      permissionObj.LIST,
      permissionObj.VIEW,
    ].filter(Boolean))
  }

  const canVerifyModule = (permissionObj: Record<string, string>): boolean => {
    return hasAnyPermission([
      permissionObj.CHECKER_VERIFY,
      permissionObj.ADMIN_CHECKER_VERIFY,
    ].filter(Boolean))
  }

  const canRejectAsChecker = (permissionObj: Record<string, string>): boolean => {
    return hasAnyPermission([
      permissionObj.CHECKER_REJECT,
      permissionObj.ADMIN_CHECKER_REJECT,
    ].filter(Boolean))
  }

  const canApproveModule = (permissionObj: Record<string, string>): boolean => {
    return hasAnyPermission([
      permissionObj.APPROVER_APPROVE,
      permissionObj.ADMIN_APPROVER_APPROVE,
    ].filter(Boolean))
  }

  const canRejectAsApprover = (permissionObj: Record<string, string>): boolean => {
    return hasAnyPermission([
      permissionObj.APPROVER_REJECT,
      permissionObj.ADMIN_APPROVER_REJECT,
    ].filter(Boolean))
  }

  return {
    // Core permission check functions
    hasPermission,
    hasAnyPermission,
    getModulePermissionNames,

    // Generic helpers (pass permission object)
    canCreate,
    canUpdate,
    canRemove,
    canView,
    canVerifyModule,
    canRejectAsChecker,
    canApproveModule,
    canRejectAsApprover,

    // Product-specific helpers (backward compatibility + new LOS)
    canMakeChanges,
    canVerify,
    canCheckerReject,
    canApprove,
    canApproverReject,
    canAdd,
    canEdit,
    canDelete,
  }
}

// Also export a simpler hook for generic use
export const usePermissions = useProductPermissions

// ============================================
// WORKFLOW ACTION HELPER FUNCTIONS
// ============================================

/**
 * Extract workflow action ID from row data based on action type
 * @param row - Row data from API response (should have actions array)
 * @param actionType - The workflow action type (WORKFLOW_ACTIONS enum value)
 * @returns The action ID or null if not found
 */
export const getWorkflowActionId = (row: any, actionType: WORKFLOW_ACTIONS): string | null => {
  console.log(`Getting workflow action ID for type: ${actionType}`, { row, actions: row?.actions });
  
  if (!row?.actions || !Array.isArray(row.actions)) {
    console.warn(`No actions array found in row data`, row);
    return null;
  }

  // Map action types to possible type names in the API response
  const actionTypeMap: Record<WORKFLOW_ACTIONS, string[]> = {
    [WORKFLOW_ACTIONS.CHECK]: ["Verify", "Check", "Checker Verify", "verify", "check", "Auto Approval"],
    [WORKFLOW_ACTIONS.CHECK_REJECT]: ["Reject", "Checker Reject", "Check Reject", "reject", "check-reject"],
    [WORKFLOW_ACTIONS.APPROVE]: ["Approve", "Approver Approve", "approve"],
    [WORKFLOW_ACTIONS.APPROVE_REJECT]: ["Approver Reject", "Approve Reject", "approve-reject"],
  };

  const possibleTypes = actionTypeMap[actionType] || [];
  console.log(`Looking for action types:`, possibleTypes);
  
  // Find action that matches any of the possible type names
  const action = row.actions.find((act: any) => {
    const actType = act?.type || "";
    const matches = possibleTypes.some(type => 
      actType.toLowerCase().includes(type.toLowerCase()) ||
      type.toLowerCase().includes(actType.toLowerCase())
    );
    if (matches) {
      console.log(`Found matching action:`, { type: actType, id: act?.id });
    }
    return matches;
  });

  const actionId = action?.id || null;
  console.log(`Extracted workflow action ID:`, actionId);
  return actionId;
}

// ============================================
// WORKFLOW ACTION HOOK
// ============================================
export const useWorkflowActions = () => {
  /**
   * Execute a workflow action (check, check-reject, approve, approve-reject)
   * @param moduleName - The module name (use WORKFLOW_MODULE_NAMES constants)
   * @param workflowActionId - The workflow action ID from module API (or from getWorkflowActionId helper)
   * @param action - The action type (use WORKFLOW_ACTIONS enum)
   * @param body - Optional request body
   * @returns Promise with the API response
   */
  const executeWorkflowAction = async (
    moduleName: string,
    workflowActionId: string,
    action: WORKFLOW_ACTIONS,
    body: any = {}
  ) => {
    if (!workflowActionId) {
      toast.error(`Workflow action ID not found for ${action} action`);
      return { success: false, error: "Workflow action ID not found" };
    }

    try {
      // Convert enum to string explicitly
      const actionString = String(action);
      console.log(`Calling workflow API:`, {
        moduleName,
        workflowActionId,
        action: actionString,
        body
      });
      
      const response = await implementWorkFlowAction(moduleName, workflowActionId, actionString)
      console.log(`Workflow API response:`, response);
      
      if (response?.data?.success) {
        toast.success(response?.data?.message || `${actionString} action completed successfully`)
        return { success: true, data: response.data }
      } else {
        toast.error(response?.data?.message || `Failed to execute ${actionString} action`)
        return { success: false, data: response.data }
      }
    } catch (error: any) {
      console.error(`Workflow action error (${action}):`, error)
      console.error(`Error details:`, {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      toast.error(error?.response?.data?.message || `Failed to execute ${action} action`)
      return { success: false, error }
    }
  }

  // Convenience methods for specific actions
  
  /**
   * Verify/Check an item (Checker role)
   * @param moduleName - The module name
   * @param row - Row data containing actions array (or workflowActionId string)
   * @param body - Optional request body
   */
  const verifyItem = async (moduleName: string, row: any, body: any = {}) => {
    const workflowActionId = typeof row === 'string' ? row : getWorkflowActionId(row, WORKFLOW_ACTIONS.CHECK);
    return executeWorkflowAction(moduleName, workflowActionId || "1", WORKFLOW_ACTIONS.CHECK, body)
  }

  /**
   * Reject as Checker
   * @param moduleName - The module name
   * @param row - Row data containing actions array (or workflowActionId string)
   * @param body - Optional request body
   */
  const rejectAsChecker = async (moduleName: string, row: any, body: any = {}) => {
    const workflowActionId = typeof row === 'string' ? row : getWorkflowActionId(row, WORKFLOW_ACTIONS.CHECK_REJECT);
    return executeWorkflowAction(moduleName, workflowActionId || "1", WORKFLOW_ACTIONS.CHECK_REJECT, body)
  }

  /**
   * Approve an item (Approver role)
   * @param moduleName - The module name
   * @param row - Row data containing actions array (or workflowActionId string)
   * @param body - Optional request body
   */
  const approveItem = async (moduleName: string, row: any, body: any = {}) => {
    const workflowActionId = typeof row === 'string' ? row : getWorkflowActionId(row, WORKFLOW_ACTIONS.APPROVE);
    return executeWorkflowAction(moduleName, workflowActionId || "1", WORKFLOW_ACTIONS.APPROVE, body)
  }

  /**
   * Reject as Approver
   * @param moduleName - The module name
   * @param row - Row data containing actions array (or workflowActionId string)
   * @param body - Optional request body
   */
  const rejectAsApprover = async (moduleName: string, row: any, body: any = {}) => {
    const workflowActionId = typeof row === 'string' ? row : getWorkflowActionId(row, WORKFLOW_ACTIONS.APPROVE_REJECT);
    return executeWorkflowAction(moduleName, workflowActionId || "1", WORKFLOW_ACTIONS.APPROVE_REJECT, body)
  }

  return {
    executeWorkflowAction,
    verifyItem,
    rejectAsChecker,
    approveItem,
    rejectAsApprover,
    getWorkflowActionId, // Export helper function
    // Export constants for easy access
    WORKFLOW_ACTIONS,
    WORKFLOW_MODULE_NAMES,
  }
}

export default useProductPermissions

