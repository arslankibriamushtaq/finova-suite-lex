import axiosCustomerService from "../../utils/axiosCustomerService";

// ============================================================
// Source of Wealth
// ============================================================

export function getAllSourceOfWealth(page?: any, size?: any, search?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosCustomerService.get(`/api/v1/reference-data/source-of-wealth${buildQueryString(params)}`);
}

export function getActiveSourceOfWealth() {
  return axiosCustomerService.get(`/api/v1/reference-data/source-of-wealth/active`);
}

export function getSourceOfWealthById(id: string) {
  return axiosCustomerService.get(`/api/v1/reference-data/source-of-wealth/${id}`);
}

export function createSourceOfWealth(body: any) {
  return axiosCustomerService.post(`/api/v1/reference-data/source-of-wealth`, body);
}

export function updateSourceOfWealth(id: string, body: any) {
  return axiosCustomerService.put(`/api/v1/reference-data/source-of-wealth/${id}`, body);
}

export function deleteSourceOfWealth(id: string) {
  return axiosCustomerService.delete(`/api/v1/reference-data/source-of-wealth/${id}`);
}

// ============================================================
// Source of Funds
// ============================================================

export function getAllSourceOfFunds(page?: any, size?: any, search?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosCustomerService.get(`/api/v1/reference-data/source-of-funds${buildQueryString(params)}`);
}

export function getActiveSourceOfFunds() {
  return axiosCustomerService.get(`/api/v1/reference-data/source-of-funds/active`);
}

export function getSourceOfFundsById(id: string) {
  return axiosCustomerService.get(`/api/v1/reference-data/source-of-funds/${id}`);
}

export function createSourceOfFunds(body: any) {
  return axiosCustomerService.post(`/api/v1/reference-data/source-of-funds`, body);
}

export function updateSourceOfFunds(id: string, body: any) {
  return axiosCustomerService.put(`/api/v1/reference-data/source-of-funds/${id}`, body);
}

export function deleteSourceOfFunds(id: string) {
  return axiosCustomerService.delete(`/api/v1/reference-data/source-of-funds/${id}`);
}

// ============================================================
// Net Worth Ranges
// ============================================================

export function getAllNetWorthRanges(page?: any, size?: any, search?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosCustomerService.get(`/api/v1/reference-data/net-worth-ranges${buildQueryString(params)}`);
}

export function getActiveNetWorthRanges() {
  return axiosCustomerService.get(`/api/v1/reference-data/net-worth-ranges/active`);
}

export function getNetWorthRangeById(id: string) {
  return axiosCustomerService.get(`/api/v1/reference-data/net-worth-ranges/${id}`);
}

export function createNetWorthRange(body: any) {
  return axiosCustomerService.post(`/api/v1/reference-data/net-worth-ranges`, body);
}

export function updateNetWorthRange(id: string, body: any) {
  return axiosCustomerService.put(`/api/v1/reference-data/net-worth-ranges/${id}`, body);
}

export function deleteNetWorthRange(id: string) {
  return axiosCustomerService.delete(`/api/v1/reference-data/net-worth-ranges/${id}`);
}

// ============================================================
// Source of Income
// ============================================================

const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return queryParams ? `?${queryParams}` : "";
};

export function getAllSourceOfIncome(page?: any, size?: any, search?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosCustomerService.get(`/api/v1/reference-data/source-of-income${buildQueryString(params)}`);
}

export function getActiveSourceOfIncome() {
  return axiosCustomerService.get(`/api/v1/reference-data/source-of-income/active`);
}

export function getSourceOfIncomeById(id: string) {
  return axiosCustomerService.get(`/api/v1/reference-data/source-of-income/${id}`);
}

export function createSourceOfIncome(body: any) {
  return axiosCustomerService.post(`/api/v1/reference-data/source-of-income`, body);
}

export function updateSourceOfIncome(id: string, body: any) {
  return axiosCustomerService.put(`/api/v1/reference-data/source-of-income/${id}`, body);
}

export function deleteSourceOfIncome(id: string) {
  return axiosCustomerService.delete(`/api/v1/reference-data/source-of-income/${id}`);
}

// ============================================================
// Occupation
// ============================================================

export function getAllOccupations(page?: any, size?: any, search?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosCustomerService.get(`/api/v1/reference-data/occupation${buildQueryString(params)}`);
}

export function getActiveOccupations() {
  return axiosCustomerService.get(`/api/v1/reference-data/occupation/active`);
}

export function getOccupationById(id: string) {
  return axiosCustomerService.get(`/api/v1/reference-data/occupation/${id}`);
}

export function createOccupation(body: any) {
  return axiosCustomerService.post(`/api/v1/reference-data/occupation`, body);
}

export function updateOccupation(id: string, body: any) {
  return axiosCustomerService.put(`/api/v1/reference-data/occupation/${id}`, body);
}

export function deleteOccupation(id: string) {
  return axiosCustomerService.delete(`/api/v1/reference-data/occupation/${id}`);
}

export function activateOccupation(id: string) {
  return axiosCustomerService.post(`/api/v1/reference-data/occupation/${id}/activate`);
}

export function deactivateOccupation(id: string) {
  return axiosCustomerService.post(`/api/v1/reference-data/occupation/${id}/deactivate`);
}

// ============================================================
// Customers
// ============================================================

/**
 * List customers.
 * `filter` is the backend's generic criteria syntax, e.g. "customerType:eq:SME"
 * (used by the Business list to show SME customers only).
 */
export function getCustomers(
  page?: any,
  size?: any,
  search?: string,
  pep?: string,
  status?: string,
  filter?: string
) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  if (pep) params.pep = pep;
  if (status) params.status = status;
  if (filter) params.filter = filter;
  return axiosCustomerService.get(`/api/v1/customers${buildQueryString(params)}`);
}

export function updateKycRisk(customerId: string, riskGrade: string) {
  return axiosCustomerService.patch(`/api/v1/customers/${customerId}/risk-grade`, {
    riskGrade: riskGrade.toUpperCase()
  });
}

// ============================================================
// Admin Businesses (SME) — document review
// ============================================================

/** Business detail + all uploaded onboarding documents (incl. reviewStatus). */
export function getBusinessDetail(customerId: string) {
  return axiosCustomerService.get(`/api/v1/admin/businesses/${customerId}`);
}

/** Approve a business document. Description is an optional note. */
export function approveBusinessDocument(
  customerId: string,
  documentId: string,
  description?: string
) {
  return axiosCustomerService.post(
    `/api/v1/admin/businesses/${customerId}/documents/${documentId}/approve`,
    description ? { description } : {}
  );
}

/** Reject a business document. Description is required and is emailed to the applicant. */
export function rejectBusinessDocument(
  customerId: string,
  documentId: string,
  description: string
) {
  return axiosCustomerService.post(
    `/api/v1/admin/businesses/${customerId}/documents/${documentId}/reject`,
    { description }
  );
}

export function getLeadCustomers(search: string = '', pep: string = '', status: string = '') {
  const params: Record<string, any> = { search, pep, status, lifecycleStage: 'LEAD' };
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return axiosCustomerService.get(`/api/v1/customers${queryString ? `?${queryString}` : ""}`);
}

