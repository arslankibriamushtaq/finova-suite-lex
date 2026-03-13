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
