import axiosWalletService from "../../utils/axiosWalletService";

// ============================================================
// Wallet Limit Bounds (Accounts Limit Setting)
// ============================================================

export interface WalletLimitBounds {
  minSingleLimit: number;
  maxSingleLimit: number;
  minDailyLimit: number;
  maxDailyLimit: number;
  minWeeklyLimit: number;
  maxWeeklyLimit: number;
  minMonthlyLimit: number;
  maxMonthlyLimit: number;
  minYearlyLimit: number;
  maxYearlyLimit: number;
  defaultSingleLimit: number;
  defaultDailyLimit: number;
  defaultWeeklyLimit: number;
  defaultMonthlyLimit: number;
  defaultYearlyLimit: number;
}

export function getWalletLimitBounds() {
  return axiosWalletService.get(`/api/v1/admin/wallets/limit-bounds`);
}

export function updateWalletLimitBounds(body: WalletLimitBounds) {
  return axiosWalletService.put(`/api/v1/admin/wallets/limit-bounds`, body);
}

// ============================================================
// Wallet Transaction Limit Requests
// ============================================================

export interface WalletLimitRequest {
  id: string;
  walletId: string;
  customerId: string;
  requestedDailyLimit: number;
  requestedMonthlyLimit: number;
  requestedYearlyLimit: number;
  currentDailyLimit: number;
  currentMonthlyLimit: number;
  currentYearlyLimit: number;
  reason: string | null;
  status: string;
  requestedBy: string | null;
  requestedAt: string | null;
  decisionBy: string | null;
  decisionAt: string | null;
  decisionNotes: string | null;
  rejectionReason: string | null;
}

export function getWalletLimitRequests(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return axiosWalletService.get(`/api/v1/admin/wallets/limit-requests${query}`);
}

export function approveWalletLimitRequest(requestId: string, body: { notes?: string }) {
  return axiosWalletService.post(
    `/api/v1/admin/wallets/limit-requests/${requestId}/approve`,
    body
  );
}

export function rejectWalletLimitRequest(
  requestId: string,
  body: { rejectionReason: string; notes?: string }
) {
  return axiosWalletService.post(
    `/api/v1/admin/wallets/limit-requests/${requestId}/reject`,
    body
  );
}
