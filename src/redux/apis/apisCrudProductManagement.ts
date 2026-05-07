import axiosProductManagement from "../../utils/axiosProductManagment";

const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return queryParams ? `?${queryParams}` : "";
};

// ============================================================
// Products CRUD
// ============================================================

export function getAllProducts(page?: any, size?: any, search?: string, status?: string, country?: string, master_category?: string) {
  const params: Record<string, any> = {};
  
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  if (status && status !== "all") params.status = status;
  if (country && country !== "all") params.country = country;
  if (master_category && master_category !== "all") params.master_category = master_category;

  return axiosProductManagement.get(`/api/v1/products${buildQueryString(params)}`);
}

export function getProductById(productId: string) {
  return axiosProductManagement.get(`/api/v1/products/${productId}`);
}

export function createProduct(body: any) {
  return axiosProductManagement.post(`/api/v1/products`, body);
}

export function updateProductBasicInfo(productId: string, body: any) {
  return axiosProductManagement.put(`/api/v1/products/${productId}/basic-info`, body);
}

export function activateProduct(productId: string) {
  return axiosProductManagement.post(`/api/v1/products/${productId}/activate`);
}

export function deactivateProduct(productId: string) {
  return axiosProductManagement.post(`/api/v1/products/${productId}/deactivate`);
}

export function deleteProduct(productId: string) {
  return axiosProductManagement.delete(`/api/v1/products/${productId}`);
}

// ============================================================
// Categories
// ============================================================

export function getAllCategories(page?: any, size?: any, search?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosProductManagement.get(`/api/v1/product-categories${buildQueryString(params)}`);
}

export function getSubCategories(masterCategoryId: string, page?: any, size?: any, search?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosProductManagement.get(`/api/v1/product-categories/${masterCategoryId}/sub-categories${buildQueryString(params)}`);
}

export function createMasterCategory(body: any) {
  return axiosProductManagement.post(`/api/v1/product-categories`, body);
}

export function updateMasterCategory(id: string, body: any) {
  return axiosProductManagement.put(`/api/v1/product-categories/${id}`, body);
}

export function deleteMasterCategory(id: string) {
  return axiosProductManagement.delete(`/api/v1/product-categories/${id}`);
}

export function createSubCategory(body: any) {
  return axiosProductManagement.post(`/api/v1/product-categories/sub-categories`, body);
}

export function updateSubCategory(id: string, body: any) {
  return axiosProductManagement.put(`/api/v1/product-categories/sub-categories/${id}`, body);
}

export function deleteSubCategory(id: string) {
  return axiosProductManagement.delete(`/api/v1/product-categories/sub-categories/${id}`);
}

// ============================================================
// Product Settings (Step 3 — 7 Tabs)
// ============================================================

export function updateApplicationSteps(productId: string, body: any) {
  return axiosProductManagement.put(`/api/v1/products/${productId}/settings/application-steps`, body);
}

export function updateTermsConditions(productId: string, body: any) {
  return axiosProductManagement.put(`/api/v1/products/${productId}/settings/terms-conditions`, body);
}

export function updateFeeSettings(productId: string, body: any) {
  return axiosProductManagement.put(`/api/v1/products/${productId}/settings/fee-settings`, body);
}

export function updateAdminFeeSlabs(productId: string, body: any) {
  return axiosProductManagement.put(`/api/v1/products/${productId}/settings/admin-fee-slabs`, body);
}

export function updateEnvironmentConfigs(productId: string, body: any) {
  return axiosProductManagement.put(`/api/v1/products/${productId}/settings/environment-configs`, body);
}

export function updateDurationSettings(productId: string, body: any) {
  return axiosProductManagement.put(`/api/v1/products/${productId}/settings/duration-settings`, body);
}

export function updateApprovalWorkflows(productId: string, body: any) {
  return axiosProductManagement.put(`/api/v1/products/${productId}/settings/approval-workflows`, body);
}

// ============================================================
// Product Partners (Step 4 — Affiliations)
// ============================================================

export function addPartnerAffiliation(productId: string, body: any) {
  return axiosProductManagement.post(`/api/v1/products/${productId}/partners`, body);
}

export function removePartnerAffiliation(productId: string, partnerId: string) {
  return axiosProductManagement.delete(`/api/v1/products/${productId}/partners/${partnerId}`);
}

// ============================================================
// Product Documents (Step 5)
// ============================================================

export function addProductDocument(productId: string, body: any) {
  return axiosProductManagement.post(`/api/v1/products/${productId}/documents`, body);
}

export function editProductDocument(productId: string, documentId: string, body: any) {
  return axiosProductManagement.put(`/api/v1/products/${productId}/documents/${documentId}`, body);
}

export function removeProductDocument(productId: string, documentId: string) {
  return axiosProductManagement.delete(`/api/v1/products/${productId}/documents/${documentId}`);
}

// ============================================================
// Partner Admin CRUD
// ============================================================

export function createPartnerAdmin(body: any) {
  return axiosProductManagement.post(`/api/v1/partners`, body);
}

export function listPartners() {
  return axiosProductManagement.get(`/api/v1/partners`);
}

export function getPartnerAdminById(id: string) {
  return axiosProductManagement.get(`/api/v1/partners/${id}`);
}

export function updatePartnerAdmin(id: string, body: any) {
  return axiosProductManagement.put(`/api/v1/partners/${id}`, body);
}

export function activatePartner(id: string) {
  return axiosProductManagement.post(`/api/v1/partners/${id}/activate`);
}

export function deactivatePartner(id: string) {
  return axiosProductManagement.post(`/api/v1/partners/${id}/deactivate`);
}

export function suspendPartner(id: string) {
  return axiosProductManagement.post(`/api/v1/partners/${id}/suspend`);
}

// ============================================================
// Legacy endpoints (kept for backward compatibility)
// TODO: Verify if these are still needed with the new backend
// ============================================================

export function getAllProductTypes() {
  return axiosProductManagement.get(`/api/v1/application/product-type-listing`);
}

export function createCreditScoringCriteria(body: any) {
  return axiosProductManagement.post(`/api/v1/credit-scoring-criteria`, body);
}

export function getAllIncomeSlabs(page: any, per_page: any) {
  return axiosProductManagement.get(`/api/v1/income-slabs?page=${page}&per_page=${per_page}`);
}

export function getIncomeSlabById(id: string) {
  return axiosProductManagement.get(`/api/v1/income-slabs/${id}`);
}

export function getIncomeSlabByProductId(productId: string) {
  return axiosProductManagement.get(`/api/v1/income-slabs?product_id=${productId}`);
}

export function createIncomeSlab(body: any) {
  return axiosProductManagement.post(`/api/v1/income-slabs`, body);
}

export function updateIncomeSlab(id: string, body: any) {
  return axiosProductManagement.put(`/api/v1/income-slabs/${id}`, body);
}

export function deleteIncomeSlab(id: string) {
  return axiosProductManagement.delete(`/api/v1/income-slabs/${id}`);
}

export function getSelectedNationalities(productId: string) {
  return axiosProductManagement.get(`/api/v1/product-nationality-eligibility?product_id=${productId}`);
}

export function addSelectedNationalities(productId: string, body: any) {
  return axiosProductManagement.post(`/api/v1/product-nationality-eligibility?product_id=${productId}`, body);
}

// ============================================================
// Backward-compatible aliases for renamed functions
// (prevents breaking existing component imports)
// ============================================================

/** @deprecated Use updateApplicationSteps instead */
export const createProductSettings = updateApplicationSteps;

/** @deprecated Use updateTermsConditions instead */
export const createProductTermsAndConditions = updateTermsConditions;

/** @deprecated Use updateAdminFeeSlabs instead */
export const createAdminFeeSlabs = (body: any) => {
  // Old API didn't require productId — callers need to be updated
  console.warn("createAdminFeeSlabs is deprecated. Use updateAdminFeeSlabs(productId, body) instead.");
  return axiosProductManagement.put(`/api/v1/products/unknown/settings/admin-fee-slabs`, body);
};

/** @deprecated Use updateDurationSettings instead */
export const createDurationSettings = (body: any) => {
  console.warn("createDurationSettings is deprecated. Use updateDurationSettings(productId, body) instead.");
  return axiosProductManagement.put(`/api/v1/products/unknown/settings/duration-settings`, body);
};

/** @deprecated Use updateApprovalWorkflows instead */
export const createApprovalWorkflowScenarios = (body: any) => {
  console.warn("createApprovalWorkflowScenarios is deprecated. Use updateApprovalWorkflows(productId, body) instead.");
  return axiosProductManagement.put(`/api/v1/products/unknown/settings/approval-workflows`, body);
};

/** @deprecated Use getProductById instead — approval workflows are part of product details */
export const getApprovalWorkflowScenarios = (productId: string) => {
  return axiosProductManagement.get(`/api/v1/products/${productId}`);
};

/** @deprecated Use getProductById instead — documents are part of product details */
export const getProductDocuments = (productId: string) => {
  return axiosProductManagement.get(`/api/v1/products/${productId}`);
};

/** @deprecated Use addProductDocument instead */
export const storeProductDocuments = (body: any) => {
  console.warn("storeProductDocuments is deprecated. Use addProductDocument(productId, body) instead.");
  return axiosProductManagement.post(`/api/v1/products/unknown/documents`, body);
};

/** @deprecated Use getProductById instead — settings are part of product details */
export const getProductSettings = (productId: string) => {
  return axiosProductManagement.get(`/api/v1/products/${productId}`);
};

/** @deprecated Use editProductDocument instead */
export const updateProductDocument = (docId: string, body: any) => {
  console.warn("updateProductDocument is deprecated. Use editProductDocument(productId, documentId, body) instead.");
  return axiosProductManagement.put(`/api/v1/products/unknown/documents/${docId}`, body);
};

// ============================================================
// Template Types CRUD
// ============================================================

export function getAllTemplateTypes(page?: any, size?: any, search?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosProductManagement.get(`/api/v1/template-types${buildQueryString(params)}`);
}

export function getTemplateTypesByCategory(category: string) {
  return axiosProductManagement.get(`/api/v1/template-types/category/${category}`);
}

export function getTemplateTypeById(id: string) {
  return axiosProductManagement.get(`/api/v1/template-types/${id}`);
}

export function createTemplateType(body: { nameEn: string; category: string }) {
  return axiosProductManagement.post(`/api/v1/template-types`, body);
}

export function updateTemplateType(id: string, body: { nameEn: string; category: string; isActive?: boolean }) {
  return axiosProductManagement.put(`/api/v1/template-types/${id}`, body);
}

export function deleteTemplateType(id: string) {
  return axiosProductManagement.delete(`/api/v1/template-types/${id}`);
}

// ============================================================
// Contract Templates CRUD
// ============================================================

export function getAllContractTemplates() {
  return axiosProductManagement.get(`/api/v1/contract-templates`);
}

export function getContractTemplatesByProduct(productId: string) {
  return axiosProductManagement.get(`/api/v1/contract-templates/product/${productId}`);
}

export function getContractTemplatesByType(typeId: string) {
  return axiosProductManagement.get(`/api/v1/contract-templates/type/${typeId}`);
}

export function getContractTemplateById(id: string) {
  return axiosProductManagement.get(`/api/v1/contract-templates/${id}`);
}

export function createContractTemplate(body: any) {
  return axiosProductManagement.post(`/api/v1/contract-templates`, body);
}

export function updateContractTemplate(id: string, body: any) {
  return axiosProductManagement.put(`/api/v1/contract-templates/${id}`, body);
}

export function deleteContractTemplate(id: string) {
  return axiosProductManagement.delete(`/api/v1/contract-templates/${id}`);
}

export function getProductsList() {
  return axiosProductManagement.get(`/api/v1/products`);
}

// ============================================================
// Approval Condition Fields CRUD
// ============================================================

export function getApprovalConditionFields(page?: any, size?: any, search?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosProductManagement.get(`/api/v1/approval-condition-fields${buildQueryString(params)}`);
}

export function createApprovalConditionField(body: any) {
  return axiosProductManagement.post(`/api/v1/approval-condition-fields`, body);
}

export function updateApprovalConditionField(fieldId: string, body: any) {
  return axiosProductManagement.put(`/api/v1/approval-condition-fields/${fieldId}`, body);
}

export function deleteApprovalConditionField(fieldId: string) {
  return axiosProductManagement.delete(`/api/v1/approval-condition-fields/${fieldId}`);
}
