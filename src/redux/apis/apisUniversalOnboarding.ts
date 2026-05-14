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
