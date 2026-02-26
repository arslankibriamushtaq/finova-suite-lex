import axios from "../../utils/axiosNotifications";

export function getChannels() {
  return axios.get(`/channels`);
}

export function createChannels(data: any) {
  return axios.post(`/channels`, data);
}

export function updateChannels(id: any, data: any) {
  return axios.put(`/channels/${id}`, data);
}

export function deleteChannels(id: any) {
  return axios.delete(`/channels/${id}`);
}

export function getLanguages() {
  return axios.get(`/languages`);
}

export function createLanguages(data: any) {
  return axios.post(`/languages`, data);
}

export function updateLanguages(id: any, data: any) {
  return axios.put(`/languages/${id}`, data);
}

export function deleteLanguages(id: any) {
  return axios.delete(`/languages/${id}`);
}

export function getTemplates() {
  return axios.get(`/templates`);
}

export function createTemplates(data: any) {
  return axios.post(`/templates`, data);
}

export function updateTemplates(id: any, data: any) {
  return axios.put(`/templates/${id}`, data);
}

export function deleteTemplates(id: any) {
  return axios.delete(`/templates/${id}`);
}

export function getSystemNotificationPrefs() {
  return axios.get(`/system-notification-prefs`);
}

export function getTemplateChannels() {
  return axios.get(`/template-channels`);
}

export function createTemplateChannels(data: any) {
  return axios.post(`/template-channels`, data);
}

export function updateTemplateChannels(id: any, data: any) {
  return axios.put(`/template-channels/${id}`, data);
}

export function deleteTemplateChannels(id: any) {
  return axios.delete(`/template-channels/${id}`);
}

// Users CRUD Operations
export function createUser(data: any) {
  return axios.post(`/users`, data);
}

export function getAllUsers() {
  return axios.get(`/users`);
}

export function getUserById(userId: any) {
  return axios.get(`/users/${userId}`);
}

export function getUserByEmail(email: any) {
  return axios.get(`/users/email/${email}`);
}

export function updateUser(userId: any, data: any) {
  return axios.put(`/users/${userId}`, data);
}

export function deleteUser(userId: any) {
  return axios.delete(`/users/${userId}`);
}

// User Notification Preferences CRUD Operations
export function createUserNotificationPreference(data: any) {
  return axios.post(`/user-notification-prefs`, data);
}

export function getUserNotificationPreferences(userId: any) {
  return axios.get(`/user-notification-prefs/user/${userId}`);
}

export function getUserNotificationPreferenceById(prefId: any) {
  return axios.get(`/user-notification-prefs/${prefId}`);
}

export function updateUserNotificationPreference(prefId: any, data: any) {
  return axios.put(`/user-notification-prefs/${prefId}`, data);
}

export function deleteUserNotificationPreference(prefId: any) {
  return axios.delete(`/user-notification-prefs/${prefId}`);
}

// System Notification Preferences CRUD Operations
export function createSystemNotificationPreference(data: any) {
  return axios.post(`/system-notification-prefs`, data);
}

export function getAllSystemNotificationPreferences() {
  return axios.get(`/system-notification-prefs`);
}

export function getSystemNotificationPreferenceById(systemPrefId: any) {
  return axios.get(`/system-notification-prefs/${systemPrefId}`);
}

export function updateSystemNotificationPreference(systemPrefId: any, data: any) {
  return axios.put(`/system-notification-prefs/${systemPrefId}`, data);
}

export function deleteSystemNotificationPreference(systemPrefId: any) {
  return axios.delete(`/system-notification-prefs/${systemPrefId}`);
}

// Template Variables CRUD Operations
export function createTemplateVariable(data: any) {
  return axios.post(`/template-variables`, data);
}

export function getTemplateVariablesByTemplateId(templateId: any) {
  return axios.get(`/template-variables/template/${templateId}`);
}

export function updateTemplateVariable(variableId: any, data: any) {
  return axios.put(`/template-variables/${variableId}`, data);
}

export function deleteTemplateVariable(variableId: any) {
  return axios.delete(`/template-variables/${variableId}`);
}
