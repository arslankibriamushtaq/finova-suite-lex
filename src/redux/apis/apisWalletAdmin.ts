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

// ============================================================
// Admin · Wallet Dashboard
// ============================================================

export type WalletStatus =
  | "PENDING_ACTIVATION"
  | "ACTIVE"
  | "FROZEN"
  | "SUSPENDED"
  | "CLOSED";

export interface WalletResponse {
  id: string;
  walletNumber: string;
  accountNumber: string;
  customerId: string;
  maskedName?: string | null;
  availableBalance: number;
  reservedBalance: number;
  totalBalance: number;
  currency: string;
  status: WalletStatus;
  autoDebitEnabled?: boolean;
  fineractSavingsAccountId?: number | null;
  ledgerSynced?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type WalletLifecycleAction =
  | "freeze"
  | "unfreeze"
  | "suspend"
  | "reactivate"
  | "close";

export function listAdminWallets(params: {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
  sort?: string;
}) {
  return axiosWalletService.get(`/api/v1/admin/wallets`, {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 20,
      status: params.status || undefined,
      search: params.search || undefined,
      sort: params.sort || undefined,
    },
  });
}

export function getAdminWalletDetail(walletId: string) {
  return axiosWalletService.get(`/api/v1/admin/wallets/${walletId}`);
}

export function changeWalletStatus(
  walletId: string,
  action: WalletLifecycleAction,
  body: { reason?: string }
) {
  return axiosWalletService.post(
    `/api/v1/admin/wallets/${walletId}/${action}`,
    body
  );
}

// ============================================================
// Admin · Customer Beneficiaries (IBAN + IBFT)
// ============================================================

export interface IbanBeneficiary {
  id: string;
  customerId?: string;
  walletId?: string;
  nickname?: string | null;
  beneficiaryName: string;
  iban: string;
  bankCode?: string | null;
  bankName?: string | null;
  verified?: boolean;
  active?: boolean;
  createdAt?: string | null;
}

export interface IbftBeneficiary {
  id: string;
  nickname?: string | null;
  beneficiaryName: string;
  institutionNumber: string;
  accountNumber: string;
  bankName?: string | null;
  currency?: string | null;
  active?: boolean;
  createdAt?: string | null;
}

export interface CustomerBeneficiariesResponse {
  customerId: string;
  totalCount: number;
  ibanCount: number;
  ibftCount: number;
  ibanBeneficiaries: IbanBeneficiary[];
  ibftBeneficiaries: IbftBeneficiary[];
}

export function getCustomerBeneficiaries(customerId: string) {
  return axiosWalletService.get(
    `/api/v1/admin/wallets/by-customer/${customerId}/beneficiaries`
  );
}

// ============================================================
// Admin · Send Money (FT / IBFT) — funds OUT of a wallet
// ============================================================

export interface AdminExternalFtRequest {
  senderMobile: string;
  counterpartyName: string;
  counterpartyAccount: string;
  counterpartyEmail?: string;
  counterpartyBankCode: string;
  amount: number;
  currency: string;
  purposeNote?: string;
  idempotencyKey: string;
}

export interface AdminIbftRequest {
  senderMobile: string;
  beneficiaryId?: string | null;
  institutionNumber: string;
  accountNumber: string;
  beneficiaryName: string;
  bankName?: string;
  amount: number;
  currency: string;
  purposeNote?: string;
  idempotencyKey: string;
}

export function adminSendExternalFt(body: AdminExternalFtRequest) {
  return axiosWalletService.post(`/api/v1/admin/transfers/external`, body);
}

export function adminGetExternalFt(transferId: string) {
  return axiosWalletService.get(`/api/v1/admin/transfers/external/${transferId}`);
}

export function adminListExternalFtByMobile(
  mobile: string,
  page = 0,
  size = 20
) {
  return axiosWalletService.get(`/api/v1/admin/transfers/external/by-mobile`, {
    params: { mobile, page, size },
  });
}

export function adminSendIbft(body: AdminIbftRequest) {
  return axiosWalletService.post(`/api/v1/admin/transfers/ibft`, body);
}

export function adminGetIbft(ibftTransferId: string) {
  return axiosWalletService.get(`/api/v1/admin/transfers/ibft/${ibftTransferId}`);
}

export function adminListIbftByMobile(mobile: string, page = 0, size = 20) {
  return axiosWalletService.get(`/api/v1/admin/transfers/ibft/by-mobile`, {
    params: { mobile, page, size },
  });
}

// ============================================================
// Admin · Internal Transfer (Wallet → Wallet, by mobile)
// ============================================================

export interface AdminInternalResolveRequest {
  senderMobile: string;
  receiverMobile: string;
  amount: number;
  currency: string;
}

export interface AdminInternalTransferRequest
  extends AdminInternalResolveRequest {
  purposeNote?: string;
  idempotencyKey: string;
}

export function adminResolveInternal(body: AdminInternalResolveRequest) {
  return axiosWalletService.post(
    `/api/v1/admin/transfers/internal/resolve`,
    body
  );
}

export function adminInitiateInternal(body: AdminInternalTransferRequest) {
  return axiosWalletService.post(`/api/v1/admin/transfers/internal`, body);
}

export function adminGetInternal(transferId: string) {
  return axiosWalletService.get(`/api/v1/admin/transfers/internal/${transferId}`);
}

export function adminListInternalByMobile(mobile: string, page = 0, size = 20) {
  return axiosWalletService.get(`/api/v1/admin/transfers/internal/by-mobile`, {
    params: { mobile, page, size },
  });
}
