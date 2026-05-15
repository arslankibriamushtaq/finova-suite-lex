import axiosLms from "../../utils/axiosLms";
import axios from "../../utils/axiosNotifications";

/**
 * Notification Orchestrator API Service (Refined)
 * Base Path: /api/v1/notifications
 */

const BASE_PATH = "/notification-service/api/v1/notifications";
const DEFAULT_TENANT_ID = "550e8400-e29b-41d4-a716-446655440000";

const getHeaders = () => ({
  "X-Tenant-Id": DEFAULT_TENANT_ID,
});

// 1. Fetch Event Types
export function getEventTypes() {
  return axiosLms.get(`${BASE_PATH}/event-types`, { headers: getHeaders() });
}

// 2. Fetch Novu Templates
export function getNovuTemplates() {
  return axiosLms.get(`${BASE_PATH}/templates`, { headers: getHeaders() });
}

// 3. Fetch Existing Rules
export function getNotificationRules() {
  return axiosLms.get(`${BASE_PATH}/rules`, { headers: getHeaders() });
}

// 4. Create New Rule
export function createNotificationRule(data: {
  tenantId: string;
  ruleCode: string;
  ruleName: string;
  eventType: string;
  channel: string;
  novuTemplateId: string;
  priority: string;
}) {
  return axiosLms.post(`${BASE_PATH}/rules`, data, { headers: getHeaders() });
}

// 5. Update Rule (Assuming similar structure for Put)
export function updateNotificationRule(id: string, data: any) {
  return axiosLms.put(`${BASE_PATH}/rules/${id}`, data, { headers: getHeaders() });
}

// 6. Delete Rule
export function deleteNotificationRule(id: string) {
  return axiosLms.delete(`${BASE_PATH}/rules/${id}`, { headers: getHeaders() });
}

// 7. Customer Preferences (Retaining from previous if needed, but the prompt focused on Rules)
export function getCustomerPreferences(customerId: string) {
  return axiosLms.get(`${BASE_PATH}/preferences/${customerId}`, { headers: getHeaders() });
}

export function updateCustomerPreferences(data: any) {
  return axiosLms.put(`${BASE_PATH}/preferences`, data, { headers: getHeaders() });
}
