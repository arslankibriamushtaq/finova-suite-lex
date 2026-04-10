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

export function getApplicationFullDetail(applicationId: string) {
  return axiosLendingService.get(`/api/v1/loan-applications/${applicationId}/full-detail`);
}

// ============================================================
// Loan Reschedules
// ============================================================

export function getReschedulesByApplication(applicationId: string) {
  return axiosLendingService.get(`/api/v1/admin/loan-reschedules/by-application/${applicationId}`);
}

export function approveReschedule(applicationId: string, rescheduleId: string, body: { approverRole: string; approvalNotes: string }) {
  return axiosLendingService.post(`/api/v1/loans/${applicationId}/reschedules/${rescheduleId}/approve`, body);
}

export function rejectReschedule(applicationId: string, rescheduleId: string, body: { approverRole: string; approvalNotes: string }) {
  return axiosLendingService.post(`/api/v1/loans/${applicationId}/reschedules/${rescheduleId}/reject`, body);
}
