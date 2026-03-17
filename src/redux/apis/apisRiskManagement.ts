import axiosRiskService from "../../utils/axiosRiskService";

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
