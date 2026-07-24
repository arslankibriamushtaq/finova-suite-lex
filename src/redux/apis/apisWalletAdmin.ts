import axiosWalletService from "../../utils/axiosWalletService";

// ============================================================
// Transfer Charge Configs (per rail: FT, IBFT, SWIFT, REMITTANCE, RFP, TOPUP)
// ============================================================

export type ChargeMode = "PERCENTAGE" | "FIXED";

export interface ChargeConfig {
  rail: string;
  chargeMode: ChargeMode;
  percentValue: number;
  fixedAmount: number;
  fixedCurrency: string;
  minCharge: number;
  shaSenderShare: number;
  active: boolean;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

/** Only the mode-relevant fields are sent; the backend preserves the rest. */
export interface UpdateChargeConfigRequest {
  chargeMode: ChargeMode;
  percentValue?: number;
  fixedAmount?: number;
  fixedCurrency?: string;
  minCharge?: number;
  shaSenderShare?: number;
  active?: boolean;
}

export function listChargeConfigs() {
  return axiosWalletService.get(`/api/v1/admin/charge-configs`);
}

export function getChargeConfig(rail: string) {
  return axiosWalletService.get(`/api/v1/admin/charge-configs/${rail}`);
}

export function updateChargeConfig(rail: string, body: UpdateChargeConfigRequest) {
  return axiosWalletService.put(`/api/v1/admin/charge-configs/${rail}`, body);
}

export interface ChargePreviewRequest {
  type: string;
  amount: number;
}

export interface ChargePreviewResponse {
  type: string;
  amount: number;
  currency: string;
  chargeMode: ChargeMode;
  chargePercent: number;
  fixedAmount: number;
  chargeBearer: string | null;
  chargeAmount: number;
  senderCharge: number | null;
  receiverCharge: number | null;
  totalAmount: number;
  destAmount: number | null;
  destCurrency: string | null;
  beneficiaryReceives: number | null;
}

export function previewExternalTransferCharge(body: ChargePreviewRequest) {
  return axiosWalletService.post(
    `/api/v1/wallets/transfers/external/charges`,
    body
  );
}

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
  requestedSingleLimit: number;
  requestedDailyLimit: number;
  requestedWeeklyLimit: number;
  requestedMonthlyLimit: number;
  requestedYearlyLimit: number;
  currentSingleLimit: number;
  currentDailyLimit: number;
  currentWeeklyLimit: number;
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

export interface WalletDashboardSummary {
  totalWallets: number;
  activeWallets: number;
  pendingActivation: number;
  frozenWallets: number;
  suspendedWallets: number;
  closedWallets: number;
  totalCustomers: number;
  walletAccounts: number;
  totalBalance: number;
  currency: string;
}

export interface WalletsCreatedPoint {
  date: string;
  count: number;
}

export interface RecentWallet {
  id: string;
  walletNumber: string;
  accountNumber: string;
  name?: string | null;
  balance: number;
  currency: string;
  status: WalletStatus | string;
  createdAt?: string | null;
}

export interface WalletDashboardData {
  summary: WalletDashboardSummary;
  walletsCreated: WalletsCreatedPoint[];
  recentWallets: RecentWallet[];
}

export function getAdminWalletDashboard(params: {
  from?: string;
  to?: string;
  recentLimit?: number;
}) {
  return axiosWalletService.get(`/api/v1/admin/wallets/dashboard`, {
    params: {
      from: params.from || undefined,
      to: params.to || undefined,
      recentLimit: params.recentLimit ?? 8,
    },
  });
}

export function getWalletTransactions(walletId: string, page = 0, size = 20) {
  return axiosWalletService.get(`/api/v1/admin/wallets/${walletId}/transactions`, {
    params: { page, size },
  });
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

// ============================================================
// Admin · Exchange Top-Up
//   Providers shown in the customer "Choose exchange option" dropdown +
//   oversight of the exchange payments customers make (1 Bill / card).
//   Base path: /api/v1/admin/exchange  (casbin object: admin.exchange)
// ============================================================

export type ExchangeProviderStatus = "ACTIVE" | "INACTIVE";

export interface ExchangeProvider {
  providerId: string;
  code: string;
  name: string;
  logoUrl: string | null;
  fxMarginPercent: number;
  feePercent: number;
  minAmount: number | null;
  maxAmount: number | null;
  status: ExchangeProviderStatus;
  sortOrder: number;
  /** Countries this provider serves. Empty = available in every country. */
  countryCodes: string[];
}

export interface CreateExchangeProviderRequest {
  code: string;
  name: string;
  logoUrl?: string | null;
  fxMarginPercent: number;
  feePercent?: number;
  minAmount?: number | null;
  maxAmount?: number | null;
  sortOrder?: number;
  countryCodes?: string[];
}

/** Partial update — any omitted / null field keeps its current value. */
export interface UpdateExchangeProviderRequest {
  name?: string;
  logoUrl?: string | null;
  fxMarginPercent?: number;
  feePercent?: number;
  minAmount?: number | null;
  maxAmount?: number | null;
  status?: ExchangeProviderStatus;
  sortOrder?: number;
  /** Passing it replaces the whole set; omit/null keeps the current mapping. */
  countryCodes?: string[];
}

export function listExchangeProviders() {
  return axiosWalletService.get(`/api/v1/admin/exchange/providers`);
}

export function createExchangeProvider(body: CreateExchangeProviderRequest) {
  return axiosWalletService.post(`/api/v1/admin/exchange/providers`, body);
}

export function updateExchangeProvider(
  providerId: string,
  body: UpdateExchangeProviderRequest
) {
  return axiosWalletService.put(
    `/api/v1/admin/exchange/providers/${providerId}`,
    body
  );
}

export type ExchangePaymentStatus = "PENDING" | "COMPLETED" | "FAILED";
export type ExchangePaymentMethod = "ONE_BILL" | "CARD";

export interface ExchangePayment {
  paymentId: string;
  quoteId: string;
  walletId?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  method: ExchangePaymentMethod | string;
  status: ExchangePaymentStatus | string;
  receivingCurrency: string;
  receivingAmount: number;
  payingCurrency: string;
  payingAmount: number;
  feeAmount: number;
  totalPaying: number;
  billId: string | null;
  cardBrand: string | null;
  cardLastFour: string | null;
  providerReference: string | null;
  movementId?: string | null;
  errorMessage?: string | null;
  completedAt: string | null;
  createdAt?: string | null;
}

export interface ExchangeQuote {
  quoteId: string;
  providerCode: string;
  receivingCurrency: string;
  receivingAmount: number;
  payingCurrency: string;
  payingAmount: number;
  totalPaying: number;
  baseRate: number;
  effectiveRate: number;
  fxMarginPercent: number;
  feePercent: number;
  status: string;
  expiresAt: string | null;
  createdAt: string | null;
}

export interface ExchangeVerification {
  documentType: string | null;
  documentNumber: string | null;
  documentStatus: string | null;
  selfieStatus: string | null;
  faceMatchScore: number | null;
  fingerprintStatus: string | null;
  overallStatus: string | null;
  declineReason: string | null;
  sullisSessionId: string | null;
}

export interface ExchangeUploadedFiles {
  documentUrl: string | null;
  selfieUrl: string | null;
  fingerprintUrl: string | null;
  documentObjectKey: string | null;
  selfieObjectKey: string | null;
  fingerprintObjectKey: string | null;
}

/** One entry in the country-driven required-document set for a payment. */
export interface ExchangePaymentDocument {
  documentType: string;
  documentName: string;
  mandatory: boolean;
  status: string;
  /** UPLOADED = customer uploaded here; REUSED_PII = reused from onboarding. */
  source: string;
  documentNumber: string | null;
  url: string | null;
}

/** Shape returned by GET /admin/exchange/payments/{id} — payment + related data. */
export interface ExchangePaymentDetail {
  payment: ExchangePayment;
  quote: ExchangeQuote | null;
  verification: ExchangeVerification | null;
  documents: ExchangePaymentDocument[] | null;
  uploadedFiles: ExchangeUploadedFiles | null;
}

// ============================================================
// Admin · Exchange Countries
// ============================================================

export type ExchangeCountryStatus = "ACTIVE" | "INACTIVE";

export interface ExchangeCountry {
  id: string;
  countryCode: string;
  countryName: string;
  currencyCode: string | null;
  flagUrl: string | null;
  status: ExchangeCountryStatus;
  sortOrder: number;
}

export interface CreateExchangeCountryRequest {
  countryCode: string;
  countryName: string;
  currencyCode?: string | null;
  flagUrl?: string | null;
  sortOrder?: number;
}

export interface UpdateExchangeCountryRequest {
  countryName?: string;
  currencyCode?: string | null;
  flagUrl?: string | null;
  status?: ExchangeCountryStatus;
  sortOrder?: number;
}

export function listExchangeCountries() {
  return axiosWalletService.get(`/api/v1/admin/exchange/countries`);
}

export function createExchangeCountry(body: CreateExchangeCountryRequest) {
  return axiosWalletService.post(`/api/v1/admin/exchange/countries`, body);
}

export function updateExchangeCountry(
  id: string,
  body: UpdateExchangeCountryRequest
) {
  return axiosWalletService.put(`/api/v1/admin/exchange/countries/${id}`, body);
}

// ============================================================
// Admin · Exchange Document Types (KYC catalog)
// ============================================================

export type ExchangeDocumentTypeStatus = "ACTIVE" | "INACTIVE";

export interface ExchangeDocumentType {
  id: string;
  code: string;
  name: string;
  sullisVerify: boolean;
  sullisDocType: string | null;
  piiDocumentType: string | null;
  status: ExchangeDocumentTypeStatus;
  sortOrder: number;
}

export interface CreateExchangeDocumentTypeRequest {
  code: string;
  name: string;
  sullisVerify?: boolean;
  sullisDocType?: string | null;
  piiDocumentType?: string | null;
  sortOrder?: number;
}

export interface UpdateExchangeDocumentTypeRequest {
  name?: string;
  sullisVerify?: boolean;
  sullisDocType?: string | null;
  piiDocumentType?: string | null;
  status?: ExchangeDocumentTypeStatus;
  sortOrder?: number;
}

export function listExchangeDocumentTypes() {
  return axiosWalletService.get(`/api/v1/admin/exchange/document-types`);
}

export function createExchangeDocumentType(
  body: CreateExchangeDocumentTypeRequest
) {
  return axiosWalletService.post(`/api/v1/admin/exchange/document-types`, body);
}

export function updateExchangeDocumentType(
  id: string,
  body: UpdateExchangeDocumentTypeRequest
) {
  return axiosWalletService.put(
    `/api/v1/admin/exchange/document-types/${id}`,
    body
  );
}

// ============================================================
// Admin · Exchange Country Documents (per-country required set)
// ============================================================

export interface CountryDocument {
  id: string;
  countryCode: string;
  documentTypeId: string;
  documentTypeCode: string;
  documentTypeName: string;
  mandatory: boolean;
  sullisVerify: boolean;
  sortOrder: number;
}

export interface AddCountryDocumentRequest {
  documentTypeId: string;
  mandatory?: boolean;
  sortOrder?: number;
}

export function listCountryDocuments(countryCode: string) {
  return axiosWalletService.get(
    `/api/v1/admin/exchange/countries/${countryCode}/documents`
  );
}

export function addCountryDocument(
  countryCode: string,
  body: AddCountryDocumentRequest
) {
  return axiosWalletService.post(
    `/api/v1/admin/exchange/countries/${countryCode}/documents`,
    body
  );
}

export function removeCountryDocument(rowId: string) {
  return axiosWalletService.delete(
    `/api/v1/admin/exchange/countries/documents/${rowId}`
  );
}

// ============================================================
// Admin · Exchange Verification Approval (payment gate)
//   After KYC is VERIFIED the top-up is blocked until an admin approves.
// ============================================================

export type ExchangeApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ExchangeVerificationQueueItem {
  quoteId: string;
  customerId: string;
  customerName: string | null;
  countryCode: string;
  overallStatus: string;
  approvalStatus: ExchangeApprovalStatus;
  selfieStatus: string | null;
  faceMatchScore: number | null;
  receivingCurrency: string;
  receivingAmount: number;
  payingCurrency: string;
  totalPaying: number;
  approvedAt: string | null;
  createdAt: string | null;
}

export interface ExchangeVerificationQuote {
  providerCode: string;
  countryCode: string;
  receivingCurrency: string;
  receivingAmount: number;
  payingCurrency: string;
  totalPaying: number;
  effectiveRate: number;
  status: string;
}

export interface ExchangeVerificationDetail {
  quoteId: string;
  customerId: string;
  customerName: string | null;
  countryCode: string;
  overallStatus: string;
  approvalStatus: ExchangeApprovalStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  approvalNote: string | null;
  declineReason: string | null;
  selfieStatus: string | null;
  faceMatchScore: number | null;
  selfieUrl: string | null;
  documents: ExchangePaymentDocument[] | null;
  quote: ExchangeVerificationQuote | null;
}

export function listExchangeVerifications(params: {
  status?: string;
  limit?: number;
}) {
  return axiosWalletService.get(`/api/v1/admin/exchange/verifications`, {
    params: {
      status: params.status || undefined,
      limit: params.limit ?? 50,
    },
  });
}

export function getExchangeVerification(quoteId: string) {
  return axiosWalletService.get(
    `/api/v1/admin/exchange/verifications/${quoteId}`
  );
}

export function approveExchangeVerification(
  quoteId: string,
  body: { note?: string }
) {
  return axiosWalletService.post(
    `/api/v1/admin/exchange/verifications/${quoteId}/approve`,
    body
  );
}

export function rejectExchangeVerification(
  quoteId: string,
  body: { note: string }
) {
  return axiosWalletService.post(
    `/api/v1/admin/exchange/verifications/${quoteId}/reject`,
    body
  );
}

export function listExchangePayments(params: {
  status?: string;
  limit?: number;
}) {
  return axiosWalletService.get(`/api/v1/admin/exchange/payments`, {
    params: {
      status: params.status || undefined,
      limit: params.limit ?? 50,
    },
  });
}

export function getExchangePayment(paymentId: string) {
  return axiosWalletService.get(`/api/v1/admin/exchange/payments/${paymentId}`);
}

/** Ops confirmation that a 1 Bill payment was received. Idempotent. */
export function confirmExchangePayment(paymentId: string) {
  return axiosWalletService.post(
    `/api/v1/admin/exchange/payments/${paymentId}/confirm`
  );
}
