import axiosOnboardingService from "../../utils/axiosOnboardingService";

// ============================================================
// Onboarding
// ============================================================

export function getActiveOnboardings() {
  return axiosOnboardingService.get(`/api/v1/onboarding/active`);
}
