import { useSelector } from "react-redux";
import { RootState } from "../redux/rootReducer";
import { implementWorkFlowAction } from "../redux/apis/apisCrudWebPageManagement";
import toast from "react-hot-toast";
import { isSuperAdminFromToken } from "../utils/getLandingRoute";

/** Decode a JWT and return true if it carries the `super_admin` Keycloak realm role. */
function tokenIsSuperAdmin(token?: string): boolean {
  if (!token || typeof token !== "string") return false;
  try {
    const payload = token.split(".")[1];
    if (!payload) return false;
    const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return isSuperAdminFromToken(claims);
  } catch {
    return false;
  }
}

interface Permission {
  id: number;
  name?: string;
  permissionName?: string;
  permissionCode?: string;
  code?: string;
  moduleId?: number;
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
    .map((v) => v.trim().toLowerCase());

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
};

// ============================================
// PERMISSION CONSTANTS - Add all module permissions here
// ============================================

/**
 * GL entry enquiry and corrections (ledger-service).
 * `READ` gates every enquiry screen; the two write actions are admin and
 * head_of_accounts only, so gate the buttons rather than letting the call 403.
 *
 * These were Casbin object:act strings (`gl.entries:read`) until the
 * identity-service registered the LEDGER module — the catalog cannot express
 * that shape, so the codes below are what `/permissions/role/{id}` returns.
 */
export const LEDGER_GL_PERMISSIONS = {
  READ: "GL_ENTRY_READ",
  RETRY: "GL_ENTRY_RETRY",
  REVERSE: "GL_ENTRY_REVERSE",
  RECONCILIATION_READ: "GL_RECONCILIATION_READ",
};

/** The Ledger module itself: the standalone ledger view and journal entries. */
export const LEDGER_PERMISSIONS = {
  MODULE: "LEDGER",
  READ: "LEDGER_READ",
  /**
   * Wallet-side account statements. NOT `LEDGER_ACCOUNT_READ` — the backend
   * gave that name to the chart of accounts, so statements are prefixed.
   */
  ACCOUNT_READ: "WALLET_LEDGER_ACCOUNT_READ",
  ENTRY_READ: "LEDGER_ENTRY_READ",
  ENTRY_CREATE: "LEDGER_ENTRY_CREATE",
  RECONCILIATION_READ: "LEDGER_RECONCILIATION_READ",
  RECONCILIATION_MANAGE: "LEDGER_RECONCILIATION_MANAGE",
};

/**
 * Chart of accounts, its configuration, and the custom field definitions.
 *
 * The backend models the chart of accounts as *ledger accounts*, so the codes
 * are `LEDGER_ACCOUNT_*` rather than the `COA_*` we proposed. Only the config
 * pair kept the COA prefix.
 */
export const COA_PERMISSIONS = {
  LIST: "LEDGER_ACCOUNT_READ",
  CREATE: "LEDGER_ACCOUNT_CREATE",
  EDIT: "LEDGER_ACCOUNT_UPDATE",
  /**
   * There is no delete endpoint — accounts are activated/deactivated, and that
   * is what MANAGE authorizes. Callers wanting "remove" get the same gate.
   */
  DELETE: "LEDGER_ACCOUNT_MANAGE",
  MANAGE: "LEDGER_ACCOUNT_MANAGE",
  CONFIG_READ: "COA_CONFIG_READ",
  CONFIG_UPDATE: "COA_CONFIG_UPDATE",
  FIELD_LIST: "LEDGER_COA_FIELD_READ",
  FIELD_CREATE: "LEDGER_COA_FIELD_CREATE",
  FIELD_EDIT: "LEDGER_COA_FIELD_UPDATE",
  FIELD_DELETE: "LEDGER_COA_FIELD_DELETE",
};

/**
 * Which GL account each wallet rail posts to.
 * Read goes to most back-office roles; write is admin / head_of_accounts only,
 * because the blast radius is every wallet transaction from then on.
 */
export const WALLET_GL_ACCOUNT_PERMISSIONS = {
  READ: "WALLET_GL_ACCOUNT_READ",
  WRITE: "WALLET_GL_ACCOUNT_WRITE",
};

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
};

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
} as const;

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
};

// ============================================
// MODULE 3-4: Application Board Module
// ============================================
export const BOARD_ACTIONS_PERMISSIONS = {
  CREATE_CHAT: "create_chat",
  DEPARTMENT_ASSIGNMENT: "department_assignment",
  USER_ASSIGNMENT: "user_assignment",
};

// ============================================
// MODULE 5-9: Customer Management Module
// ============================================
// Leads/Opportunities have no dedicated backend module — they are customer-domain
// read views, so gate them behind the Customer module's READ permission.
export const LEAD_PERMISSIONS = {
  LIST: "CUSTOMER_READ",
  EXPORT: "CUSTOMER_READ",
};

export const CUSTOMER_PERMISSIONS = {
  LIST: "CUSTOMER_READ",
  EXPORT: "CUSTOMER_READ",
};

// Business (SME) lives under Customer Management but has its own codes, so a
// role can hold retail-customer access without also getting SME access.
export const BUSINESS_PERMISSIONS = {
  LIST: "BUSINESS_READ",
  EXPORT: "BUSINESS_READ",
  VIEW: "BUSINESS_READ",
  /** Approve / reject business documents, manage block codes. */
  REVIEW: "BUSINESS_WRITE",
};

export const OPPORTUNITY_PERMISSIONS = {
  LIST: "CUSTOMER_READ",
  EXPORT: "CUSTOMER_READ",
};

export const ONBOARD_CUSTOMERS_PERMISSIONS = {
  LIST: "ONBOARDING_READ",
  RESEND_EMAIL: "ONBOARDING_WRITE",
};

// ============================================
// MODULE 10-22: Product Management (already defined above)
// Additional sub-module permissions
// ============================================
export const ASSIGNED_PRODUCT_CATEGORY_PERMISSIONS = {
  LIST: "list_assigned_product_category",
  UPDATE: "update_assigned_product_category",
};

export const PRODUCT_PARTNERS_PERMISSIONS = {
  LIST: "list_product_partner",
  UPDATE: "update_product_partner",
};

export const PRODUCT_INSURANCE_VENDORS_PERMISSIONS = {
  LIST: "list_product_insurance_vendor",
  UPDATE: "update_product_insurance_vendor",
};

export const PRODUCT_SETTING_PERMISSIONS = {
  LIST: "list_product_setting",
};

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
};

export const PRODUCT_VERIFICATION_METHODS_PERMISSIONS = {
  LIST: "product_verification_methods",
  UPDATE: "update_product_verification_methods",
};

export const APPLICATION_STEPS_PERMISSIONS = {
  VIEW: "application_steps",
};

export const TERMS_CONDITIONS_PERMISSIONS = {
  VIEW: "terms_&_conditions",
};

export const FEE_SETTING_PERMISSIONS = {
  VIEW: "application_fee",
};

export const API_REQUEST_DURATION_PERMISSIONS = {
  VIEW: "api_request_duration",
  UPDATE: "update_api_request_duration",
};

export const DEPARTMENT_PERMISSION_MODULE_PERMISSIONS = {
  VIEW: "department_permission",
};

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
};

// ============================================
// MODULE 24-26: Department Management
// ============================================
export const DEPARTMENT_PERMISSIONS_MODULE = {
  LIST: "list_department_permissions",
  UPDATE: "update_department_permissions",
  SHOW_ASSIGNED: "show_assigned_department_permissions",
};

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
};

// ============================================
// MODULE 27-35: LOV Management
// ============================================
export const LOV_PERMISSIONS = {
  MANAGEMENT: "lov_management",
};

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
};

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
};

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
};

export const TYPES_REASONS_PERMISSIONS = {
  LIST: "list_types_reason",
  CREATE: "create_types_reason",
  EDIT: "edit_types_reason",
  DELETE: "delete_types_reason",
  SHOW: "show_types_reason",
  UPDATE_STATUS: "update_types_reason_status",
};

export const PRODUCT_CATEGORIES_PERMISSIONS = {
  LIST: "PRODUCT_CATEGORY_READ",
  CREATE: "PRODUCT_CATEGORY_CREATE",
  EDIT: "PRODUCT_CATEGORY_UPDATE",
  DELETE: "PRODUCT_CATEGORY_DELETE",
  UPDATE_STATUS: "PRODUCT_CATEGORY_UPDATE",
  SET_DEFAULT: "PRODUCT_CATEGORY_UPDATE",
};

export const PRODUCT_SUB_CATEGORIES_PERMISSIONS = {
  LIST: "PRODUCT_SUB_CATEGORY_READ",
  CREATE: "PRODUCT_SUB_CATEGORY_CREATE",
  EDIT: "PRODUCT_SUB_CATEGORY_UPDATE",
  DELETE: "PRODUCT_SUB_CATEGORY_DELETE",
  UPDATE_STATUS: "PRODUCT_SUB_CATEGORY_UPDATE",
};

/** The contract document a product issues — distinct from TEMPLATE_TYPE_*. */
export const CONTRACT_TEMPLATE_PERMISSIONS = {
  LIST: "CONTRACT_TEMPLATE_READ",
  CREATE: "CONTRACT_TEMPLATE_CREATE",
  EDIT: "CONTRACT_TEMPLATE_UPDATE",
  DELETE: "CONTRACT_TEMPLATE_DELETE",
};

export const PRODUCT_TYPES_PERMISSIONS = {
  LIST: "list_product_type",
  CREATE: "create_product_type",
  UPDATE_STATUS: "update_product_type_status",
  SHOW: "show_product_type",
  DELETE: "delete_product_type",
};

export const COMMODITY_TYPES_PERMISSIONS = {
  LIST: "list_commodity_type",
  CREATE: "create_commodity_type",
  EDIT: "edit_commodity_type",
  SHOW: "show_commodity_type",
  DELETE: "delete_commodity_type",
  UPDATE_STATUS: "update_commodity_type_status",
};

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
};

// ============================================
// MODULE 36-39: Loan Management
// ============================================
export const LOAN_PERMISSIONS = {
  MANAGEMENT: "loan_management",
  RESEND_LOGIN_EMAIL: "resend_login_email",
  EXPORT_CSV: "export_csv",
  RETRY_KASTLE: "retry_kastle_entry",
};

export const LOAN_APPLICATION_PERMISSIONS = {
  LIST: "list_application",
};

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
};

export const ACTIVITY_LOGS_PERMISSIONS = {
  LIST: "list_activity_logs",
};

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
};

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
};

// ============================================
// MODULE 42-45: Settings Management
// ============================================
export const SETTING_PERMISSIONS = {
  MANAGEMENT: "setting_management",
};

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
};

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
};

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
};

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
};

// ============================================
// RISK Management — identity-service RISK_* codes
// ============================================
export const RISK_BLACKLIST_PERMISSIONS = {
  LIST: "RISK_BLACKLIST_READ",
  CREATE: "RISK_BLACKLIST_CREATE",
  DELETE: "RISK_BLACKLIST_DELETE",
  CHECK: "RISK_BLACKLIST_CHECK",
};

export const RISK_DEVICES_PERMISSIONS = {
  LIST: "RISK_DEVICES_READ",
  CREATE: "RISK_DEVICES_CREATE",
  EDIT: "RISK_DEVICES_UPDATE",
  DELETE: "RISK_DEVICES_DELETE",
};

export const RISK_FRAUD_PERMISSIONS = {
  LIST: "RISK_FRAUD_RULES_READ",
  CREATE: "RISK_FRAUD_RULES_CREATE",
  EDIT: "RISK_FRAUD_RULES_UPDATE",
  DELETE: "RISK_FRAUD_RULES_DELETE",
};

// Internal checks / risk parameters / thresholds config
export const RISK_CONFIG_PERMISSIONS = {
  LIST: "RISK_PARAMETERS_READ",
  EDIT: "RISK_PARAMETERS_UPDATE",
  MANAGE: "RISK_PARAMETERS_MANAGE",
};

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
};

// ============================================
// WALLET admin (transfer charges, account limits) — identity-service WALLET_*
// ============================================
export const WALLET_PERMISSIONS = {
  LIST: "WALLET_READ",
  CREATE: "WALLET_CREATE",
  EDIT: "WALLET_WRITE", // backend Wallet has CREATE/READ/WRITE/MANAGE (no UPDATE/DELETE)
  MANAGE: "WALLET_MANAGE",
  /** Admin-initiated money movement — deliberately not plain WALLET_READ. */
  TRANSFER_CREATE: "WALLET_TRANSFERS_CREATE",
  INTERNAL_TRANSFER_CREATE: "WALLET_INTERNAL_TRANSFER_CREATE",
  /** Per-account and per-transaction ceilings. Backend name is limit-bounds. */
  LIMIT_READ: "WALLET_LIMIT_BOUNDS_READ",
  LIMIT_UPDATE: "WALLET_LIMIT_UPDATE",
};

/** Publishing a QR code and paying one are separate acts. */
export const WALLET_QR_PERMISSIONS = {
  LIST: "WALLET_QR_READ",
  CREATE: "WALLET_QR_CREATE",
  PAY: "WALLET_QR_PAY",
};

// ============================================
// NOTIFICATION — notification-service (channels, languages, templates)
// ============================================
export const NOTIFICATION_PERMISSIONS = {
  MODULE: "NOTIFICATION",
  LIST: "NOTIFICATION_READ",
  CREATE: "NOTIFICATION_CREATE",
  EDIT: "NOTIFICATION_UPDATE",
  /**
   * Registered but enforces nothing: notification-service has no channel /
   * language / template controllers, so this gates the button only.
   */
  DELETE: "NOTIFICATION_DELETE",
};

// ============================================
// CARD — card-management service (/admin/cards, /admin/card-products)
// ============================================
export const CARD_PERMISSIONS = {
  MODULE: "CARD",
  LIST: "CARD_READ",
  CREATE: "CARD_CREATE",
  EDIT: "CARD_UPDATE",
  /** Reversible holds and the terminal state are separate acts on purpose. */
  FREEZE: "CARD_FREEZE",
  BLOCK: "CARD_BLOCK",
  CANCEL: "CARD_CANCEL",
  PRODUCT_LIST: "CARD_PRODUCT_READ",
  PRODUCT_CREATE: "CARD_PRODUCT_CREATE",
  PRODUCT_EDIT: "CARD_PRODUCT_UPDATE",
  PRODUCT_DELETE: "CARD_PRODUCT_DELETE",
  SETTINGS_READ: "CARD_SETTINGS_READ",
  SETTINGS_UPDATE: "CARD_SETTINGS_UPDATE",
};

// ============================================
// BLOCK_CODE — /block-codes catalog + /user-blocks application
// The Compliance / AML / Anti-Fraud / Sanction pages are filtered views of one
// resource, so they share these codes.
// ============================================
export const BLOCK_CODE_PERMISSIONS = {
  MODULE: "BLOCK_CODE",
  LIST: "BLOCK_CODE_READ",
  CREATE: "BLOCK_CODE_CREATE",
  EDIT: "BLOCK_CODE_UPDATE",
  DELETE: "BLOCK_CODE_DELETE",
  /** Applying a code to a user is a different act from editing the catalog. */
  USER_BLOCK: "USER_BLOCK_APPLY",
  USER_UNBLOCK: "USER_BLOCK_REMOVE",
};

// ============================================
// LENDING — LMS dashboard and the loan application book
// ============================================
export const LENDING_PERMISSIONS = {
  MODULE: "LENDING",
  READ: "LENDING_READ",
  // No DASHBOARD_READ: the delivery note listed LENDING_DASHBOARD_READ but it
  // was never registered — verified against the live catalog 2026-08-18. The
  // LMS dashboard is gated on LENDING_READ instead.
  APPLICATION_LIST: "LENDING_APPLICATION_READ",
  /** Manual-approval task endpoints back the approve/reject pair. */
  MANUAL_APPROVAL_READ: "LENDING_MANUAL_APPROVAL_READ",
  MANUAL_APPROVAL_ACTION: "LENDING_MANUAL_APPROVAL_ACTION",
  /** Backed by the manual-approval task endpoints, not by loan-applications. */
  APPLICATION_APPROVE: "LENDING_APPLICATION_APPROVE",
  APPLICATION_REJECT: "LENDING_APPLICATION_REJECT",
  /**
   * Registered but enforces nothing: lending-service has no disburse endpoint,
   * so this is a UI-only gate until one exists.
   */
  APPLICATION_DISBURSE: "LENDING_APPLICATION_DISBURSE",
};

// ============================================
// COLLECTIONS — collections-service waiver requests
// ============================================
export const COLLECTIONS_PERMISSIONS = {
  MODULE: "COLLECTIONS",
  READ: "COLLECTIONS_READ",
  WAIVER_LIST: "WAIVER_REQUEST_READ",
  WAIVER_APPROVE: "WAIVER_REQUEST_APPROVE",
  WAIVER_REJECT: "WAIVER_REQUEST_REJECT",
};

// ============================================
// REPORT — every report screen. Read-only plus the download.
// ============================================
export const REPORT_PERMISSIONS = {
  MODULE: "REPORT",
  /** Covers all 27 report objects; the sidebar categories are views over them. */
  READ: "REPORT_READ",
  /**
   * Registered but enforces nothing: export is the same GET as the report, so
   * the server cannot separate them. Use it to hide the button, not to secure
   * the data — anyone who can read a report can already export it.
   */
  EXPORT: "REPORT_EXPORT",
};

// ============================================
// MIDDLEWARE sub-resources — Connector Management children
// ============================================
export const MIDDLEWARE_PERMISSIONS = {
  MODULE: "MIDDLEWARE",
  READ: "MIDDLEWARE_READ",
  PROVIDER_LIST: "MIDDLEWARE_PROVIDERS_READ",
  API_LIST: "MIDDLEWARE_PROVIDER_APIS_READ",
  CLIENT_LIST: "MIDDLEWARE_CLIENT_READ",
  /** One object covers prod/dev/test — a per-environment gate is not expressible. */
  CLIENT_REQUEST_LIST: "MIDDLEWARE_CLIENT_REQUEST_READ",
};

// ============================================
// EXCHANGE — Exchange Top-up (providers + payments). Module code: EXCHANGE.
// Adjust these codes if the backend's identity-service catalog uses different ones.
// ============================================
export const EXCHANGE_PERMISSIONS = {
  MODULE: "EXCHANGE",
  PROVIDER_LIST: "EXCHANGE_PROVIDER_READ",
  PROVIDER_CREATE: "EXCHANGE_PROVIDER_CREATE",
  PROVIDER_EDIT: "EXCHANGE_PROVIDER_UPDATE",
  // No PROVIDER_DELETE: AdminExchangeController exposes no delete-provider
  // endpoint, so a code for it would gate a button on nothing.
  PAYMENT_LIST: "EXCHANGE_PAYMENT_READ",
  PAYMENT_CONFIRM: "EXCHANGE_PAYMENT_CONFIRM",
  COUNTRY_LIST: "EXCHANGE_COUNTRY_READ",
  COUNTRY_CREATE: "EXCHANGE_COUNTRY_CREATE",
  COUNTRY_EDIT: "EXCHANGE_COUNTRY_UPDATE",
  COUNTRY_DELETE: "EXCHANGE_COUNTRY_DELETE",
  DOCUMENT_TYPE_LIST: "EXCHANGE_DOCUMENT_TYPE_READ",
  DOCUMENT_TYPE_CREATE: "EXCHANGE_DOCUMENT_TYPE_CREATE",
  DOCUMENT_TYPE_EDIT: "EXCHANGE_DOCUMENT_TYPE_UPDATE",
  VERIFICATION_LIST: "EXCHANGE_VERIFICATION_READ",
  VERIFICATION_REVIEW: "EXCHANGE_VERIFICATION_REVIEW", // approve/reject
};

// ============================================
// BNPL — wallet-service, Casbin object `wallet.bnpl.admin-categories`
// (acts: create / update / delete / read). Deliberately separate from the
// customer-facing `wallet.bnpl.categories` object, so browse-only access can
// never reach the admin catalog.
// ============================================
export const BNPL_PERMISSIONS = {
  MODULE: "BNPL",
  CATEGORY_LIST: "BNPL_CATEGORY_READ",
  CATEGORY_CREATE: "BNPL_CATEGORY_CREATE",
  CATEGORY_EDIT: "BNPL_CATEGORY_UPDATE",
  CATEGORY_DELETE: "BNPL_CATEGORY_DELETE",
  // Casbin object `wallet.bnpl.admin-currency-limits` (acts: read / update).
  CURRENCY_LIMIT_READ: "BNPL_CURRENCY_LIMIT_READ",
  CURRENCY_LIMIT_UPDATE: "BNPL_CURRENCY_LIMIT_UPDATE",
};

// ============================================
// SullisCash — wallet-service, Casbin object `wallet.sullis-cash.admin-config`
// (acts: read / update). Separate from the customer-facing
// `wallet.sullis-cash.offer` / `.loans` objects.
// ============================================
export const SULLIS_CASH_PERMISSIONS = {
  MODULE: "SULLIS_CASH",
  CONFIG_READ: "SULLIS_CASH_CONFIG_READ",
  CONFIG_UPDATE: "SULLIS_CASH_CONFIG_UPDATE",
  /**
   * The loan book, read-only and deliberately separate from the config acts so
   * support staff can see customer loans without being able to re-price the
   * product. Casbin object `wallet.sullis-cash.admin-loans`.
   */
  LOANS_READ: "SULLIS_CASH_LOAN_READ",
};

// ============================================
// CRYPTO admin — crypto-service (treasury, transfers)
// ============================================
/**
 * Casbin authorizes crypto-service on objects (`crypto.admin.treasury:create`),
 * but this hook matches identity-service `permissionCode`s, so the gates are
 * written in that vocabulary.
 *
 * TREASURY_CREATE is separate from READ because that one endpoint attaches the
 * signing handle for the wallet funding every payout — `developer` reads the
 * treasury but cannot register one. TRANSFERS has no CREATE at all: there is no
 * admin send endpoint, and a constant for one would advertise a capability the
 * system does not have.
 */
export const CRYPTO_PERMISSIONS = {
  MODULE: "CRYPTO",
  TREASURY_READ: "CRYPTO_TREASURY_READ",
  TREASURY_CREATE: "CRYPTO_TREASURY_CREATE",
  TRANSFERS_READ: "CRYPTO_TRANSFER_READ",
  /** Reconcile and abandon. Neither moves coin. */
  TRANSFERS_UPDATE: "CRYPTO_TRANSFER_UPDATE",
};

// ============================================
// LEX — the agentic decisioning layer
// ============================================

/**
 * LEX authorization is Casbin, object + act, checked server-side on every
 * endpoint. The UI reads the identity-service catalogue to decide what to
 * *show* and lets the server decide what to *allow*.
 *
 * `V104__add_lex_module_permissions_and_roles.sql` registered LEX in that
 * catalogue: five modules, eleven permissions, and 43 `permission_casbin_map`
 * rows linking each one to the obj/act pairs its screens call. So the codes
 * below are now the real registrations rather than the shape we proposed —
 * **the catalogue is coarser than Casbin is.** One `LEX_CONFIG_MANAGE` covers
 * authoring *and* publishing every configurator; the finer distinction lives in
 * Casbin and is enforced there.
 *
 * The keys are unchanged, so each screen still names the act it means
 * (`PROCESS_PUBLISH` vs `PROCESS_WRITE`) even where both map to one code — the
 * intent stays readable, and a future finer permission is a one-line edit here.
 *
 * **What no permission can tell you:** all three underwriter levels hold
 * `LEX_CASES_DECIDE`. What separates them is the authority ladder, checked
 * against the case's `assignedLevelCode` when the decision is recorded. Casbin
 * answers "may this role call this endpoint"; the ladder asks "may this person
 * approve this value". See `useLexAuthority`.
 *
 * Hiding a button the server would refuse is good UX. Showing one it would
 * refuse is a bug — and showing one it would *allow* but that we hid is worse,
 * because the feature is invisible and nobody files a ticket.
 */
export const LEX_PERMISSIONS = {
  MODULE: "LEX",

  /**
   * `LEX_CONFIG` — every configurator: the Reason Code rulebook, the delegation
   * matrices, the authority ladder and the SLA targets. Read is granted to
   * underwriters; MANAGE is the Company Admin's and is what the separation of
   * duties rests on — an underwriter never authors the rules they are judged
   * against.
   */
  PROCESS_READ: "LEX_CONFIG_READ",
  PROCESS_WRITE: "LEX_CONFIG_MANAGE",
  PROCESS_PUBLISH: "LEX_CONFIG_MANAGE",

  DELEGATION_READ: "LEX_CONFIG_READ",
  DELEGATION_WRITE: "LEX_CONFIG_MANAGE",
  DELEGATION_PUBLISH: "LEX_CONFIG_MANAGE",

  LEVEL_READ: "LEX_CONFIG_READ",
  LEVEL_WRITE: "LEX_CONFIG_MANAGE",

  /**
   * `lex.config.sectors` — the other half of every scope. Product comes from
   * LOS; sector is governed in LEX, and like the ladder it is data rather than
   * an enum, so read is granted wherever a scope picker renders.
   */
  SECTOR_READ: "LEX_CONFIG_READ",
  SECTOR_WRITE: "LEX_CONFIG_MANAGE",

  SLA_CONFIG_READ: "LEX_CONFIG_READ",
  SLA_CONFIG_WRITE: "LEX_CONFIG_MANAGE",
  SLA_CONFIG_PUBLISH: "LEX_CONFIG_MANAGE",

  /** `LEX_DOCUMENTS` — the verification sequence and the analyses it produced. */
  CHECK_READ: "LEX_DOCUMENTS_READ",
  CHECK_WRITE: "LEX_DOCUMENTS_MANAGE",
  /** Read-only in Casbin too: no act writes an analysis. */
  ANALYSIS_READ: "LEX_DOCUMENTS_READ",

  /**
   * `LEX_CASES` — the queue, the work on a case, and the two acts that are
   * separate Casbin objects (`lex.cases.messages`, `lex.cases.decision`). The
   * catalogue keeps them apart as WORK / DECIDE, so granting the queue no
   * longer implies granting the decision.
   */
  CASE_READ: "LEX_CASES_READ",
  CASE_UPDATE: "LEX_CASES_WORK",
  CASE_ESCALATE: "LEX_CASES_ESCALATE",
  /** `lex.cases.messages` / `create` — posting a note is working the case. */
  CASE_MESSAGE_CREATE: "LEX_CASES_WORK",
  /** `lex.cases.decision` / `create`. Held by every underwriter level alike. */
  CASE_DECISION_CREATE: "LEX_CASES_DECIDE",

  /** The SLA operations board is served by lex-case-service and reads with the queue. */
  SLA_BOARD_READ: "LEX_CASES_READ",

  /**
   * `LEX_KNOWLEDGE` — policy library, the Approved Employer List, and the
   * governance mirror. `compliance_officer` holds MANAGE here without holding
   * it anywhere else: refreshing the mirror is a compliance duty.
   */
  KNOWLEDGE_DOC_READ: "LEX_KNOWLEDGE_READ",
  KNOWLEDGE_DOC_WRITE: "LEX_KNOWLEDGE_MANAGE",
  KNOWLEDGE_DOC_RETIRE: "LEX_KNOWLEDGE_MANAGE",

  EMPLOYER_READ: "LEX_KNOWLEDGE_READ",
  /** Delist is the only write a person gets — there is no create and no update. */
  EMPLOYER_DELIST: "LEX_KNOWLEDGE_MANAGE",

  GOVERNANCE_READ: "LEX_KNOWLEDGE_READ",
  GOVERNANCE_REFRESH: "LEX_KNOWLEDGE_MANAGE",

  /** `LEX_BI` — the gallery and the reports, plus the schedules that mail them. */
  BI_READ: "LEX_BI_READ",
  BI_WRITE: "LEX_BI_MANAGE",
  SCHEDULE_READ: "LEX_BI_READ",
  SCHEDULE_WRITE: "LEX_BI_MANAGE",
};

// ============================================
// KYC — identity-service KYC_*
// ============================================
export const KYC_PERMISSIONS = {
  LIST: "KYC_READ",
  EDIT: "KYC_WRITE",
};

// ============================================
// LOV entities (EDD reference data) — identity-service LOV_* codes
// ============================================
export const LOV_SOURCE_OF_FUNDS_PERMISSIONS = {
  LIST: "LOV_SOF_READ",
  CREATE: "LOV_SOF_CREATE",
  EDIT: "LOV_SOF_UPDATE",
  DELETE: "LOV_SOF_DELETE",
};
export const LOV_SOURCE_OF_INCOME_PERMISSIONS = {
  LIST: "LOV_SOI_READ",
  CREATE: "LOV_SOI_CREATE",
  EDIT: "LOV_SOI_UPDATE",
  DELETE: "LOV_SOI_DELETE",
};
export const LOV_SOURCE_OF_WEALTH_PERMISSIONS = {
  LIST: "LOV_SOW_READ",
  CREATE: "LOV_SOW_CREATE",
  EDIT: "LOV_SOW_UPDATE",
  DELETE: "LOV_SOW_DELETE",
};
export const LOV_PURPOSE_OF_FINANCE_PERMISSIONS = {
  LIST: "LOV_POF_READ",
  CREATE: "LOV_POF_CREATE",
  EDIT: "LOV_POF_UPDATE",
  DELETE: "LOV_POF_DELETE",
};
export const LOV_OCCUPATION_PERMISSIONS = {
  LIST: "LOV_OCCUPATION_READ",
  CREATE: "LOV_OCCUPATION_CREATE",
  EDIT: "LOV_OCCUPATION_UPDATE",
  DELETE: "LOV_OCCUPATION_DELETE",
};
export const LOV_NET_WORTH_RANGE_PERMISSIONS = {
  LIST: "LOV_NWR_READ",
  CREATE: "LOV_NWR_CREATE",
  EDIT: "LOV_NWR_UPDATE",
  DELETE: "LOV_NWR_DELETE",
};
export const LOV_RELATIONSHIP_PERMISSIONS = {
  LIST: "LOV_RELATIONSHIP_READ",
  CREATE: "LOV_RELATIONSHIP_CREATE",
  EDIT: "LOV_RELATIONSHIP_UPDATE",
  DELETE: "LOV_RELATIONSHIP_DELETE",
};
export const LOV_APPROVAL_CONDITION_PERMISSIONS = {
  LIST: "APPROVAL_CONDITION_FIELD_READ",
  CREATE: "APPROVAL_CONDITION_FIELD_CREATE",
  EDIT: "APPROVAL_CONDITION_FIELD_UPDATE",
  DELETE: "APPROVAL_CONDITION_FIELD_DELETE",
};
export const RISK_CREDIT_SCORING_FIELDS_PERMISSIONS = {
  LIST: "RISK_CREDIT_SCORING_FIELDS_READ",
  CREATE: "RISK_CREDIT_SCORING_FIELDS_CREATE",
  EDIT: "RISK_CREDIT_SCORING_FIELDS_UPDATE",
  DELETE: "RISK_CREDIT_SCORING_FIELDS_DELETE",
};
// PRODUCT-module reference data (countries, template types) live under the Product module.
export const PRODUCT_COUNTRY_PERMISSIONS = {
  LIST: "COUNTRY_READ",
  CREATE: "COUNTRY_CREATE",
  EDIT: "COUNTRY_UPDATE",
  DELETE: "COUNTRY_DELETE",
};
export const PRODUCT_TEMPLATE_TYPE_PERMISSIONS = {
  LIST: "TEMPLATE_TYPE_READ",
  CREATE: "TEMPLATE_TYPE_CREATE",
  EDIT: "TEMPLATE_TYPE_UPDATE",
  DELETE: "TEMPLATE_TYPE_DELETE",
};

/**
 * Get all modules array from Redux permission data (los or direct array).
 *
 * Exported because the sidebar reads the same slice and must agree about the
 * shape: `/v1/permissions` answers as a bare array for some roles and as
 * `{ los: [...] }` for others, and a consumer that only understands one of the
 * two fails closed — it hides every gated module and looks exactly like "this
 * role has no permissions".
 */
export function getAllModulesFromPermissionData(permissionData: any): any[] {
  if (!permissionData) return [];
  if (permissionData?.los && Array.isArray(permissionData.los)) return permissionData.los;
  if (Array.isArray(permissionData)) return permissionData;
  return [];
}

export const useProductPermissions = () => {
  const permissionData = useSelector((state: RootState) => state.block.permissions);
  const token = useSelector((state: RootState) => state.block.token);
  const allModules = getAllModulesFromPermissionData(permissionData);
  // Super admin has no role/permissions assigned but carries the `super_admin`
  // Keycloak realm role — grant them every permission so gated actions stay visible.
  const isSuperAdmin = tokenIsSuperAdmin(token);

  /**
   * Check if user has a specific permission
   * @param permissionName - The name of the permission to check (e.g. 'create_product' or 'product.maker.submit')
   * @returns boolean indicating if user has the permission
   */
  const hasPermission = (permissionName: string): boolean => {
    if (isSuperAdmin) return true;
    if (!permissionName || allModules.length === 0) return false;

    const target = permissionName.trim().toLowerCase();
    const matches = (p: Permission) => getPermissionKeys(p).includes(target);

    const findPermissionInModule = (module: any): boolean => {
      if (module.permissionsList && Array.isArray(module.permissionsList)) {
        if (module.permissionsList.some(matches)) return true;
      }
      if (module.permissions && Array.isArray(module.permissions)) {
        if (module.permissions.some(matches)) return true;
      }
      if (module.sub_modules && Array.isArray(module.sub_modules)) {
        for (const subModule of module.sub_modules) {
          if (findPermissionInModule(subModule)) return true;
        }
      }
      if (module.subModulesList && Array.isArray(module.subModulesList)) {
        for (const subModule of module.subModulesList) {
          if (findPermissionInModule(subModule)) return true;
        }
      }
      return false;
    };

    return allModules.some((module: any) => findPermissionInModule(module));
  };

  /**
   * Get all permission names for a module (and its submodules) by moduleName.
   * Useful for custom checks when using the new LOS module structure.
   */
  const getModulePermissionNames = (moduleName: string): string[] => {
    const names: string[] = [];
    const collect = (module: any) => {
      if (module.permissionsList && Array.isArray(module.permissionsList)) {
        module.permissionsList.forEach((p: Permission) => names.push(...getPermissionKeys(p)));
      }
      if (module.permissions && Array.isArray(module.permissions)) {
        module.permissions.forEach((p: Permission) => names.push(...getPermissionKeys(p)));
      }
      if (module.subModulesList && Array.isArray(module.subModulesList)) {
        module.subModulesList.forEach((sub: any) => collect(sub));
      }
      if (module.sub_modules && Array.isArray(module.sub_modules)) {
        module.sub_modules.forEach((sub: any) => collect(sub));
      }
    };
    const module = allModules.find((m: any) => m.moduleName === moduleName);
    if (module) collect(module);
    return names;
  };

  /**
   * Check if user has any of the given permissions
   * @param permissionNames - Array of permission names to check
   * @returns boolean indicating if user has any of the permissions
   */
  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some((name) => hasPermission(name));
  };

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
    ]);
  };

  /**
   * Check if user can verify (checker permissions)
   */
  const canVerify = (): boolean => {
    return hasAnyPermission([
      PRODUCT_PERMISSIONS.CHECKER_VERIFY,
      PRODUCT_PERMISSIONS.ADMIN_CHECKER_VERIFY,
    ]);
  };

  /**
   * Check if user can reject as checker
   */
  const canCheckerReject = (): boolean => {
    return hasAnyPermission([
      PRODUCT_PERMISSIONS.CHECKER_REJECT,
      PRODUCT_PERMISSIONS.ADMIN_CHECKER_REJECT,
    ]);
  };

  /**
   * Check if user can approve (approver permissions)
   */
  const canApprove = (): boolean => {
    return hasAnyPermission([
      PRODUCT_PERMISSIONS.APPROVER_APPROVE,
      PRODUCT_PERMISSIONS.ADMIN_APPROVER_APPROVE,
    ]);
  };

  /**
   * Check if user can reject as approver
   */
  const canApproverReject = (): boolean => {
    return hasAnyPermission([
      PRODUCT_PERMISSIONS.APPROVER_REJECT,
      PRODUCT_PERMISSIONS.ADMIN_APPROVER_REJECT,
    ]);
  };

  // Alias methods
  const canAdd = (): boolean => canMakeChanges();
  const canEdit = (): boolean => canMakeChanges();
  const canDelete = (): boolean => canMakeChanges();

  // ============================================
  // GENERIC PERMISSION HELPERS - Use for any module
  // ============================================

  /**
   * Generic helper to check if user can perform CRUD operations
   * @param permissionObj - Permission constants object (e.g., DOCUMENT_PERMISSIONS, PRODUCT_PERMISSIONS)
   */
  const canCreate = (permissionObj: Record<string, string>): boolean => {
    return hasAnyPermission(
      [
        permissionObj.CREATE,
        permissionObj.MAKER_SUBMIT,
        permissionObj.MAKER_RESUBMIT,
        permissionObj.ADMIN_MAKER_SUBMIT,
        permissionObj.ADMIN_MAKER_RESUBMIT,
      ].filter(Boolean)
    );
  };

  const canUpdate = (permissionObj: Record<string, string>): boolean => {
    return hasAnyPermission(
      [
        permissionObj.EDIT,
        permissionObj.MAKER_SUBMIT,
        permissionObj.MAKER_RESUBMIT,
        permissionObj.ADMIN_MAKER_SUBMIT,
        permissionObj.ADMIN_MAKER_RESUBMIT,
      ].filter(Boolean)
    );
  };

  const canRemove = (permissionObj: Record<string, string>): boolean => {
    return hasAnyPermission(
      [
        permissionObj.DELETE,
        permissionObj.MAKER_SUBMIT,
        permissionObj.MAKER_RESUBMIT,
        permissionObj.ADMIN_MAKER_SUBMIT,
        permissionObj.ADMIN_MAKER_RESUBMIT,
      ].filter(Boolean)
    );
  };

  const canView = (permissionObj: Record<string, string>): boolean => {
    return hasAnyPermission([permissionObj.LIST, permissionObj.VIEW].filter(Boolean));
  };

  const canVerifyModule = (permissionObj: Record<string, string>): boolean => {
    return hasAnyPermission(
      [permissionObj.CHECKER_VERIFY, permissionObj.ADMIN_CHECKER_VERIFY].filter(Boolean)
    );
  };

  const canRejectAsChecker = (permissionObj: Record<string, string>): boolean => {
    return hasAnyPermission(
      [permissionObj.CHECKER_REJECT, permissionObj.ADMIN_CHECKER_REJECT].filter(Boolean)
    );
  };

  const canApproveModule = (permissionObj: Record<string, string>): boolean => {
    return hasAnyPermission(
      [permissionObj.APPROVER_APPROVE, permissionObj.ADMIN_APPROVER_APPROVE].filter(Boolean)
    );
  };

  const canRejectAsApprover = (permissionObj: Record<string, string>): boolean => {
    return hasAnyPermission(
      [permissionObj.APPROVER_REJECT, permissionObj.ADMIN_APPROVER_REJECT].filter(Boolean)
    );
  };

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
  };
};

// Also export a simpler hook for generic use
export const usePermissions = useProductPermissions;

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
    [WORKFLOW_ACTIONS.CHECK]: [
      "Verify",
      "Check",
      "Checker Verify",
      "verify",
      "check",
      "Auto Approval",
    ],
    [WORKFLOW_ACTIONS.CHECK_REJECT]: [
      "Reject",
      "Checker Reject",
      "Check Reject",
      "reject",
      "check-reject",
    ],
    [WORKFLOW_ACTIONS.APPROVE]: ["Approve", "Approver Approve", "approve"],
    [WORKFLOW_ACTIONS.APPROVE_REJECT]: ["Approver Reject", "Approve Reject", "approve-reject"],
  };

  const possibleTypes = actionTypeMap[actionType] || [];
  console.log(`Looking for action types:`, possibleTypes);

  // Find action that matches any of the possible type names
  const action = row.actions.find((act: any) => {
    const actType = act?.type || "";
    const matches = possibleTypes.some(
      (type) =>
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
};

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
        body,
      });

      const response = await implementWorkFlowAction(moduleName, workflowActionId, actionString);
      console.log(`Workflow API response:`, response);

      if (response?.data?.success) {
        toast.success(response?.data?.message || `${actionString} action completed successfully`);
        return { success: true, data: response.data };
      } else {
        toast.error(response?.data?.message || `Failed to execute ${actionString} action`);
        return { success: false, data: response.data };
      }
    } catch (error: any) {
      console.error(`Workflow action error (${action}):`, error);
      console.error(`Error details:`, {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      toast.error(error?.response?.data?.message || `Failed to execute ${action} action`);
      return { success: false, error };
    }
  };

  // Convenience methods for specific actions

  /**
   * Verify/Check an item (Checker role)
   * @param moduleName - The module name
   * @param row - Row data containing actions array (or workflowActionId string)
   * @param body - Optional request body
   */
  const verifyItem = async (moduleName: string, row: any, body: any = {}) => {
    const workflowActionId =
      typeof row === "string" ? row : getWorkflowActionId(row, WORKFLOW_ACTIONS.CHECK);
    return executeWorkflowAction(moduleName, workflowActionId || "1", WORKFLOW_ACTIONS.CHECK, body);
  };

  /**
   * Reject as Checker
   * @param moduleName - The module name
   * @param row - Row data containing actions array (or workflowActionId string)
   * @param body - Optional request body
   */
  const rejectAsChecker = async (moduleName: string, row: any, body: any = {}) => {
    const workflowActionId =
      typeof row === "string" ? row : getWorkflowActionId(row, WORKFLOW_ACTIONS.CHECK_REJECT);
    return executeWorkflowAction(
      moduleName,
      workflowActionId || "1",
      WORKFLOW_ACTIONS.CHECK_REJECT,
      body
    );
  };

  /**
   * Approve an item (Approver role)
   * @param moduleName - The module name
   * @param row - Row data containing actions array (or workflowActionId string)
   * @param body - Optional request body
   */
  const approveItem = async (moduleName: string, row: any, body: any = {}) => {
    const workflowActionId =
      typeof row === "string" ? row : getWorkflowActionId(row, WORKFLOW_ACTIONS.APPROVE);
    return executeWorkflowAction(
      moduleName,
      workflowActionId || "1",
      WORKFLOW_ACTIONS.APPROVE,
      body
    );
  };

  /**
   * Reject as Approver
   * @param moduleName - The module name
   * @param row - Row data containing actions array (or workflowActionId string)
   * @param body - Optional request body
   */
  const rejectAsApprover = async (moduleName: string, row: any, body: any = {}) => {
    const workflowActionId =
      typeof row === "string" ? row : getWorkflowActionId(row, WORKFLOW_ACTIONS.APPROVE_REJECT);
    return executeWorkflowAction(
      moduleName,
      workflowActionId || "1",
      WORKFLOW_ACTIONS.APPROVE_REJECT,
      body
    );
  };

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
  };
};

export default useProductPermissions;
