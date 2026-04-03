import axiosOnboardingService from "../../utils/axiosOnboardingService";
import axiosCustomerService from "../../utils/axiosCustomerService";

// ============================================================
// Onboarding
// ============================================================

export function getActiveOnboardings() {
  return axiosOnboardingService.get(`/api/v1/onboarding/active`);
}

export function getCustomersByLifecycleStage(lifecycleStage: string) {
  return axiosOnboardingService.get(`/api/v1/onboarding/active?lifecycleStage=${lifecycleStage}`);
}
