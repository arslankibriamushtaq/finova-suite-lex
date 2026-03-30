import axiosOnboardingService from "../../utils/axiosOnboardingService";
import axiosCustomerService from "../../utils/axiosCustomerService";

// ============================================================
// Onboarding
// ============================================================

export function getActiveOnboardings() {
  return axiosOnboardingService.get(`/api/v1/onboarding/active`);
}

// ============================================================
// Customers
// ============================================================

export function getCustomersByLifecycleStage(lifecycleStage: string) {
  return axiosCustomerService.get(`/api/v1/customers?lifecycleStage=${lifecycleStage}`);
}
