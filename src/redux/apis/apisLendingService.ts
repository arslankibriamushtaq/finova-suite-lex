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

const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return queryParams ? `?${queryParams}` : "";
};

export function getLoanApplications(page?: any, size?: any, search?: string, status?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  if (status && status !== "AllApplication") params.status = status;
  return axiosLendingService.get(`/api/v1/loan-applications${buildQueryString(params)}`);
}

export function getApplicationByNumber(applicationNumber: string) {
  return axiosLendingService.get(`/api/v1/loan-applications?applicationNumber=${applicationNumber}`);
}

export function getApplicationInstallments(applicationId: string) {
  return axiosLendingService.get(`/api/v1/loans/application/${applicationId}/installments`);
}

export function getEarlySettlementInvoices(loanId: string) {
  return axiosLendingService.get(`/api/v1/loans/${loanId}/early-settlement/invoices`);
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

export function getInvoiceDetailById(invoiceId: string) {
  return axiosLendingService.get(`/api/v1/loans/invoices/${invoiceId}`);
}

export function getPendingApprovals(page?: any, size?: any, search?: string) {
  const params: Record<string, any> = { status: "PENDING" };
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosLendingService.get(`/api/v1/manual-approvals${buildQueryString(params)}`);
}

export function approveManualApproval(taskId: string, body: { notes: string }) {
  return axiosLendingService.post(`/api/v1/manual-approvals/${taskId}/approve`, body);
}

export function rejectManualApproval(taskId: string, body: { rejectionReason: string; notes: string }) {
  return axiosLendingService.post(`/api/v1/manual-approvals/${taskId}/reject`, body);
}

// ============================================================
// Reschedule Configurations (Admin)
// ============================================================

export function getRescheduleConfigs() {
  return axiosLendingService.get(`/api/v1/admin/reschedule-configs`);
}

export function getRescheduleConfigById(id: string) {
  return axiosLendingService.get(`/api/v1/admin/reschedule-configs/${id}`);
}

export function updateRescheduleConfig(rescheduleType: string, body: any) {
  return axiosLendingService.put(
    `/api/v1/admin/reschedule-configs/${rescheduleType}`,
    body
  );
}
