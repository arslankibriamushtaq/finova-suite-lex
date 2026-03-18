import axiosCustomerService from "../../utils/axiosCustomerService";

// ============================================================
// Source of Wealth
// ============================================================

export function getAllSourceOfWealth() {
  return axiosCustomerService.get(`/api/v1/reference-data/source-of-wealth`);
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

export function getAllSourceOfFunds() {
  return axiosCustomerService.get(`/api/v1/reference-data/source-of-funds`);
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

export function getAllNetWorthRanges() {
  return axiosCustomerService.get(`/api/v1/reference-data/net-worth-ranges`);
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

export function getAllSourceOfIncome() {
  return axiosCustomerService.get(`/api/v1/reference-data/source-of-income`);
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
// Customers
// ============================================================

export function getCustomers(page: number = 1, per_page: number = 20, search: string = '', pep: string = '', status: string = '') {
  const params: Record<string, any> = { page, per_page, search, pep, status };
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return axiosCustomerService.get(`/api/v1/customers${queryString ? `?${queryString}` : ""}`);
}

export function getLeadCustomers(search: string = '', pep: string = '', status: string = '') {
  const params: Record<string, any> = { search, pep, status, lifecycleStage: 'LEAD' };
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return axiosCustomerService.get(`/api/v1/customers${queryString ? `?${queryString}` : ""}`);
}

