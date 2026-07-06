import axiosOnboardingService from "../../utils/axiosOnboardingService";

/**
 * Universal Onboarding Admin API Service
 */

const BASE_PATH = "/api/v1/onboarding/admin";

// 1. Workflow Management
export function getWorkflows() {
  return axiosOnboardingService.get(`${BASE_PATH}/workflows`);
}

export function registerCountry(payload: { 
  countryCode: string; 
  workflowName: string; 
  isActive: boolean 
}) {
  return axiosOnboardingService.post(`${BASE_PATH}/workflows`, payload);
}

// 2. Step Configuration
export function getSteps(countryCode: string) {
  return axiosOnboardingService.get(`${BASE_PATH}/steps/${countryCode}`);
}

export function createStep(payload: {
  countryCode: string;
  stepName: string;
  orderIndex: number;
  apiUrl: string;
  apiMethod: string;
  apiHeaders?: any;
  apiParamsMapping?: any;
  apiBodyMapping?: any;
}) {
  return axiosOnboardingService.post(`${BASE_PATH}/steps`, payload);
}

export function deleteStep(id: string | number) {
  return axiosOnboardingService.delete(`${BASE_PATH}/steps/${id}`);
}

// 3. Field Management
export function addFieldToStep(payload: {
  stepId: number | string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  isMandatory: boolean;
  isPii: boolean;
  validationRegex: string | null;
  orderIndex: number;
}) {
  return axiosOnboardingService.post(`${BASE_PATH}/fields`, payload);
}

export function deleteField(id: string | number) {
  return axiosOnboardingService.delete(`${BASE_PATH}/fields/${id}`);
}

// 4. Submission Inspection
export function getSubmissionData(sessionId: string) {
  return axiosOnboardingService.get(`${BASE_PATH}/submissions/${sessionId}`);
}

// 5. Lifecycle Management
export function publishWorkflow(countryCode: string) {
  return axiosOnboardingService.post(`${BASE_PATH}/workflows/${countryCode}/publish`);
}

// 6. Onboarding Sessions (users currently going through onboarding)

export interface OnboardingSessionStep {
  stepId?: number | string;
  stepName?: string;
  label?: string;
  labelAr?: string;
  currentStepLabel?: string;
  orderIndex?: number;
  status?: string;
  completedAt?: string | null;
  startedAt?: string | null;
  occurredAt?: string | null;
  data?: any;
}

export interface OnboardingSession {
  workflowId?: string;
  flowType?: string;
  status?: string;
  currentStep?: string;
  currentStepLabel?: string;
  currentStepLabelAr?: string;
  rawStep?: string;
  totalSteps?: number;
  completedSteps?: number;
  progressPercent?: number;
  customerName?: string | null;
  maskedEmail?: string | null;
  maskedMobile?: string | null;
  customerId?: string | null;
  failureReason?: string | null;
  startedAt?: string | null;
  updatedAt?: string | null;

  // Legacy / fallback keys (older payload shapes)
  sessionId?: string;
  userId?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  flow?: string;
  countryCode?: string;
  currentStepName?: string;
  currentStepIndex?: number;
  progress?: number;
  createdAt?: string | null;
  steps?: OnboardingSessionStep[];
  [key: string]: any;
}

export interface OnboardingSessionsParams {
  page?: number;
  size?: number;
  status?: string;
  flow?: string;
  search?: string;
}

/** LIST — all onboarding users + current step + progress (Spring pageable). */
export function getOnboardingSessions(params: OnboardingSessionsParams = {}) {
  return axiosOnboardingService.get(`${BASE_PATH}/sessions`, {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 20,
      status: params.status || undefined,
      flow: params.flow || undefined,
      search: params.search || undefined,
    },
  });
}

/** DETAIL — full first→last step timeline for one user. */
export function getOnboardingSessionDetail(workflowId: string) {
  return axiosOnboardingService.get(`${BASE_PATH}/sessions/${workflowId}`);
}
