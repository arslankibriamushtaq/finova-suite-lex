import axiosLendingService from "../../utils/axiosLendingService";
import axiosCollectionsService from "../../utils/axiosCollectionsService";

// ============================================================
// Purpose of Finance
// ============================================================

export function getAllPurposeOfFinance(page?: any, size?: any, search?: string) {
  const params: Record<string, any> = { activeOnly: false };
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosLendingService.get(`/api/v1/purpose-of-finance${buildQueryString(params)}`);
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

// ============================================================
// Dunning Policies (Admin)
// ============================================================

export function getDunningPolicies(page?: any, size?: any, search?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosLendingService.get(`/api/v1/admin/dunning-policies${buildQueryString(params)}`);
}

export function getDunningPolicyById(id: string) {
  return axiosLendingService.get(`/api/v1/admin/dunning-policies/${id}`);
}

export function createDunningPolicy(body: any) {
  return axiosLendingService.post(`/api/v1/admin/dunning-policies`, body);
}

export function updateDunningPolicy(id: string, body: any) {
  return axiosLendingService.put(`/api/v1/admin/dunning-policies/${id}`, body);
}

export function deleteDunningPolicy(id: string) {
  return axiosLendingService.delete(`/api/v1/admin/dunning-policies/${id}`);
}

// ============================================================
// Waiver Requests (Collections)
// ============================================================

export function getWaiverRequests(page?: any, size?: any, status?: string, search?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (status && status !== "ALL") params.status = status;
  if (search) params.search = search;
  return axiosCollectionsService.get(`/api/v1/collections/waiver-requests${buildQueryString(params)}`);
}

export function getWaiverRequestsByApplication(applicationId: string) {
  return axiosCollectionsService.get(`/api/v1/collections/waiver-requests/application/${applicationId}`);
}

export function approveWaiverRequest(id: string) {
  return axiosCollectionsService.post(`/api/v1/collections/waiver-requests/${id}/approve`);
}

export function rejectWaiverRequest(id: string, body: { rejectionReason: string }) {
  return axiosCollectionsService.post(`/api/v1/collections/waiver-requests/${id}/reject`, body);
}

export function approveWaiverByInvoice(invoiceId: string, body: { reason: string; amount: number }) {
  return axiosCollectionsService.post(`/api/v1/collections/waiver-requests/invoice/${invoiceId}/approve`, body);
}

export function rejectWaiverByInvoice(invoiceId: string, body: { reason: string }) {
  return axiosCollectionsService.post(`/api/v1/collections/waiver-requests/invoice/${invoiceId}/reject`, body);
}
