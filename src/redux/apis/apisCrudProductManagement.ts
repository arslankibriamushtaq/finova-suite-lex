import axiosProductManagement from "../../utils/axiosProductManagment";

const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return queryParams ? `?${queryParams}` : "";
};

export function getAllProducts(page?: any, per_page?: any) {
  const params: Record<string, any> = {
    page,
    per_page,
  };
  return axiosProductManagement.get(`/v1/product${buildQueryString(params)}`);
}

export function getProductById(productId: string) {
  return axiosProductManagement.get(`/v1/product/${productId}?type=BasicInfo`);
}

export function getAllCategories() {
  return axiosProductManagement.get(`/v1/category`);
}

export function getAllProductTypes() {
  return axiosProductManagement.get(`/v1/application/product-type-listing`);
}
export function createProductSettings(productId: string, body: any) {
  return axiosProductManagement.post(`/v1/product-settings/${productId}`,body);
}
export function createProductTermsAndConditions(productId: string, body: any) {
  return axiosProductManagement.post(`/v1/product/${productId}/settings/terms`, body);
}
export function createAdminFeeSlabs(body: any) {
  return axiosProductManagement.post(`/v1/processing-fee-slabs`, body);
}
export function createCreditScoringCriteria(body: any) {
  return axiosProductManagement.post(`/v1/credit-scoring-criteria`, body);
}
export function createDurationSettings(body: any) {
  return axiosProductManagement.post(`/v1/product/duration-settings`, body);
}
export function createApprovalWorkflowScenarios(body: any) {
  return axiosProductManagement.post(`/v1/scenarios`, body);
}
export function getApprovalWorkflowScenarios(productId: string) {
  return axiosProductManagement.get(`/v1/scenarios?product_id=${productId}`);
}

export function getProductDocuments(productId: string) {
  return axiosProductManagement.get(`/v1/products/documents?product_id=${productId}`);
}
export function storeProductDocuments(body: any) {
  return axiosProductManagement.post(`/v1/products/documents/store`, body);
}
export function updateProductDocument(docId: string, body: any) {
  return axiosProductManagement.put(`/v1/products/documents/update/${docId}`, body);
}
export function getProductSettings(productId: string) {
  return axiosProductManagement.get(`/v1/product-settings/product/${productId}`);
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
  return axiosProductManagement.get(`/v1/product-nationality-eligibility?product_id=${productId}`);
}
export function addSelectedNationalities(productId: string, body: any) {
  return axiosProductManagement.post(`/v1/product-nationality-eligibility?product_id=${productId}`, body);
}
