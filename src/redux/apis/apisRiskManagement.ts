import axiosRiskService from "../../utils/axiosRiskService";

// ============================================================
// Credit Scoring Field Definitions
// ============================================================

const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return queryParams ? `?${queryParams}` : "";
};

export function getCreditScoringFieldDefinitions(page?: any, size?: any, search?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosRiskService.get(`/api/v1/risk/credit-scoring/field-definitions${buildQueryString(params)}`);
}

export function createCreditScoringFieldDefinition(body: any) {
  return axiosRiskService.post(`/api/v1/risk/credit-scoring/field-definitions`, body);
}

export function updateCreditScoringFieldDefinition(fieldDefinitionId: string, body: any) {
  return axiosRiskService.put(`/api/v1/risk/credit-scoring/field-definitions/${fieldDefinitionId}`, body);
}

export function deleteCreditScoringFieldDefinition(fieldDefinitionId: string) {
  return axiosRiskService.delete(`/api/v1/risk/credit-scoring/field-definitions/${fieldDefinitionId}`);
}

// ============================================================
// Product Credit Scoring Criteria
// ============================================================

export function getProductCreditScoringCriteria(productId: string) {
  return axiosRiskService.get(`/api/v1/risk/credit-scoring/products/${productId}/criteria`);
}

export function saveProductCreditScoringCriteria(productId: string, body: any) {
  return axiosRiskService.put(`/api/v1/risk/credit-scoring/products/${productId}/criteria`, body);
}

export function deleteProductCreditScoringCriteria(productId: string) {
  return axiosRiskService.delete(`/api/v1/risk/credit-scoring/products/${productId}/criteria`);
}

// ============================================================
// Blacklist NID
// ============================================================

export function getAllBlacklistNid(page?: any, size?: any, search?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosRiskService.get(`/api/v1/risk/blacklist/nid${buildQueryString(params)}`);
}

export function getBlacklistNidStatus(nid: string) {
  return axiosRiskService.get(`/api/v1/risk/blacklist/nid/${nid}/status`);
}

export function createBlacklistNid(body: { nationalId: string; reason: string; blockCodeId?: string | null }) {
  return axiosRiskService.post(`/api/v1/risk/blacklist/nid`, body);
}

export function removeBlacklistNid(nid: string) {
  return axiosRiskService.post(`/api/v1/risk/blacklist/nid/${nid}/remove`);
}

export function assignBlockCodeToNid(nationalId: string, blockCodeId: string) {
  return axiosRiskService.put(`/api/v1/risk/blacklist/nid/${nationalId}/block-code`, { blockCodeId });
}

// ============================================================
// Blacklist Mobile
// ============================================================

export function getAllBlacklistMobile() {
  return axiosRiskService.get(`/api/v1/risk/blacklist/mobile`);
}

export function getBlacklistMobileStatus(mobile: string) {
  return axiosRiskService.get(`/api/v1/risk/blacklist/mobile/${mobile}/status`);
}

export function createBlacklistMobile(body: { mobileNumber: string; reason: string; blockCodeId?: string | null }) {
  return axiosRiskService.post(`/api/v1/risk/blacklist/mobile`, body);
}

export function removeBlacklistMobile(mobile: string) {
  return axiosRiskService.post(`/api/v1/risk/blacklist/mobile/${mobile}/remove`);
}

export function assignBlockCodeToMobile(mobileNumber: string, blockCodeId: string) {
  return axiosRiskService.put(`/api/v1/risk/blacklist/mobile/${mobileNumber}/block-code`, { blockCodeId });
}

// ============================================================
// Fraud Rule Management
// ============================================================

export function getAllFraudRules(page?: any, size?: any, search?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosRiskService.get(`/api/v1/risk/fraud/rules${buildQueryString(params)}`);
}

export function getActiveFraudRules() {
  return axiosRiskService.get(`/api/v1/risk/fraud/rules/active`);
}

export function getFraudRuleById(ruleId: string) {
  return axiosRiskService.get(`/api/v1/risk/fraud/rules/${ruleId}`);
}

export function enableFraudRule(ruleId: string) {
  return axiosRiskService.put(`/api/v1/risk/fraud/rules/${ruleId}/enable`);
}

export function disableFraudRule(ruleId: string) {
  return axiosRiskService.put(`/api/v1/risk/fraud/rules/${ruleId}/disable`);
}

export function updateFraudRuleParameters(ruleId: string, body: any) {
  return axiosRiskService.put(`/api/v1/risk/fraud/rules/${ruleId}/parameters`, body);
}

// ============================================================
// Device Management
// ============================================================

export function getAllDevices(page?: any, size?: any, search?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosRiskService.get(`/api/v1/risk/devices${buildQueryString(params)}`);
}

export function getBlockedDevices(page?: any, size?: any, search?: string) {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (search) params.search = search;
  return axiosRiskService.get(`/api/v1/risk/devices/blocked${buildQueryString(params)}`);
}

export function blockDevice(body: { deviceId: string; reason: string }) {
  return axiosRiskService.post(`/api/v1/risk/devices/block`, body);
}

export function unblockDevice(deviceId: string) {
  return axiosRiskService.post(`/api/v1/risk/devices/${deviceId}/unblock`);
}

export function deleteDevice(deviceId: string) {
  return axiosRiskService.delete(`/api/v1/risk/devices/${deviceId}`);
}

const TENANT_HEADER = { "X-Tenant-Id": "00000000-0000-0000-0000-000000000001" };

export function getRiskBlockCodes() {
  return axiosRiskService.get(`/api/v1/admin/risk/block-codes`, { headers: TENANT_HEADER });
}

export function createRiskBlockCode(data: { code: string; description: string; type: string }) {
  return axiosRiskService.post(`/api/v1/admin/risk/block-codes`, data, { headers: TENANT_HEADER });
}

export function updateRiskBlockCode(id: string | number, data: { description: string; type: string; active: boolean }) {
  return axiosRiskService.put(`/api/v1/admin/risk/block-codes/${id}`, data, { headers: TENANT_HEADER });
}

export function assignBlockCodeToFraudRule(ruleId: string, blockCodeId: string) {
  return axiosRiskService.put(`/api/v1/admin/risk/block-codes/${blockCodeId}`, { ruleId }, { headers: TENANT_HEADER });
}

export function getInternalChecksConfigs() {
  return axiosRiskService.get(`/api/v1/admin/risk/internal-checks/configs`, { headers: TENANT_HEADER });
}

export function updateInternalCheckConfig(id: string | number, data: { active?: boolean; blockCodeId?: string | null }) {
  return axiosRiskService.put(`/api/v1/admin/risk/internal-checks/configs/${id}`, data, { headers: TENANT_HEADER });
}
