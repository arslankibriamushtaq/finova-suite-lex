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
