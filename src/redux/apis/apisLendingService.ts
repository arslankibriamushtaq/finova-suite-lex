import axiosLendingService from "../../utils/axiosLendingService";

// ============================================================
// Purpose of Finance
// ============================================================

export function getAllPurposeOfFinance() {
  return axiosLendingService.get(`/api/v1/purpose-of-finance?activeOnly=false`);
}

export function getActivePurposeOfFinance() {
  return axiosLendingService.get(`/api/v1/purpose-of-finance`);
}

export function getPurposeOfFinanceById(id: string) {
  return axiosLendingService.get(`/api/v1/purpose-of-finance/${id}`);
}

export function createPurposeOfFinance(body: any) {
  return axiosLendingService.post(`/api/v1/purpose-of-finance`, body);
}

export function updatePurposeOfFinance(id: string, body: any) {
  return axiosLendingService.put(`/api/v1/purpose-of-finance/${id}`, body);
}

export function deletePurposeOfFinance(id: string) {
  return axiosLendingService.delete(`/api/v1/purpose-of-finance/${id}`);
}

// ============================================================
// Loan Applications
// ============================================================

export function getLoanApplications() {
  return axiosLendingService.get(`/api/v1/loan-applications`);
}

export function getApplicationInstallments(applicationId: string) {
  return axiosLendingService.get(`/api/v1/loans/application/${applicationId}/installments`);
}
