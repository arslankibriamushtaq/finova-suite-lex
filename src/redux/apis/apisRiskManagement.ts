import axiosRiskService from "../../utils/axiosRiskService";

// ============================================================
// Credit Scoring Field Definitions
// ============================================================

export function getCreditScoringFieldDefinitions() {
  return axiosRiskService.get(`/api/v1/risk/credit-scoring/field-definitions`);
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

export function getAllBlacklistNid() {
  return axiosRiskService.get(`/api/v1/risk/blacklist/nid`);
}

export function getBlacklistNidStatus(nid: string) {
  return axiosRiskService.get(`/api/v1/risk/blacklist/nid/${nid}/status`);
}

export function createBlacklistNid(body: { nationalId: string; reason: string }) {
  return axiosRiskService.post(`/api/v1/risk/blacklist/nid`, body);
}

export function removeBlacklistNid(nid: string) {
  return axiosRiskService.post(`/api/v1/risk/blacklist/nid/${nid}/remove`);
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

export function createBlacklistMobile(body: { mobileNumber: string; reason: string }) {
  return axiosRiskService.post(`/api/v1/risk/blacklist/mobile`, body);
}

export function removeBlacklistMobile(mobile: string) {
  return axiosRiskService.post(`/api/v1/risk/blacklist/mobile/${mobile}/remove`);
}

// ============================================================
// Fraud Rule Management
// ============================================================

export function getAllFraudRules() {
  return axiosRiskService.get(`/api/v1/risk/fraud/rules`);
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

export function getAllDevices() {
  return axiosRiskService.get(`/api/v1/risk/devices`);
}

export function getBlockedDevices() {
  return axiosRiskService.get(`/api/v1/risk/devices/blocked`);
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
