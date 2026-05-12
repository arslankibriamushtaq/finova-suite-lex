import axiosMiddlewareThirdParty from "../../utils/axiosMiddlewareThirdParty";

// ============================================================
// Clients CRUD
// ============================================================

export function getAllClients() {
  return axiosMiddlewareThirdParty.get(`/api/v1/clients`);
}

export function getClientById(id: string) {
  return axiosMiddlewareThirdParty.get(`/api/v1/clients/${id}`);
}

export function createClient(body: any) {
  return axiosMiddlewareThirdParty.post(`/api/v1/clients`, body);
}

export function updateClient(id: string, body: any) {
  return axiosMiddlewareThirdParty.put(`/api/v1/clients/${id}`, body);
}

export function deleteClient(id: string) {
  return axiosMiddlewareThirdParty.delete(`/api/v1/clients/${id}`);
}

// ============================================================
// Client Access Control — Provider Access
// ============================================================

export function grantProviderAccess(clientId: string, body: any) {
  return axiosMiddlewareThirdParty.post(`/api/v1/clients/${clientId}/access/providers`, body);
}

export function listProviderAccess(clientId: string) {
  return axiosMiddlewareThirdParty.get(`/api/v1/clients/${clientId}/access/providers`);
}

export function revokeProviderAccess(clientId: string, providerId: string) {
  return axiosMiddlewareThirdParty.delete(`/api/v1/clients/${clientId}/access/providers/${providerId}`);
}

// ============================================================
// Client Access Control — API Access
// ============================================================

export function grantApiAccess(clientId: string, body: any) {
  return axiosMiddlewareThirdParty.post(`/api/v1/clients/${clientId}/access/apis`, body);
}

export function listApiAccess(clientId: string) {
  return axiosMiddlewareThirdParty.get(`/api/v1/clients/${clientId}/access/apis`);
}

export function listApiAccessByProvider(clientId: string, providerId: string) {
  return axiosMiddlewareThirdParty.get(`/api/v1/clients/${clientId}/access/apis/by-provider/${providerId}`);
}

export function revokeApiAccess(clientId: string, providerApiId: string) {
  return axiosMiddlewareThirdParty.delete(`/api/v1/clients/${clientId}/access/apis/${providerApiId}`);
}

// ============================================================
// Bulk Access Control
// ============================================================

export function bulkGrantAccess(clientId: string, body: any) {
  return axiosMiddlewareThirdParty.post(`/api/v1/clients/${clientId}/access/bulk`, body);
}

// ============================================================
// Providers CRUD
// ============================================================

export function getAllProviders() {
  return axiosMiddlewareThirdParty.get(`/api/v1/providers`);
}

export function getProviderById(id: string) {
  return axiosMiddlewareThirdParty.get(`/api/v1/providers/${id}`);
}

export function getProviderByCode(code: string) {
  return axiosMiddlewareThirdParty.get(`/api/v1/providers/code/${code}`);
}

export function createProvider(body: any) {
  return axiosMiddlewareThirdParty.post(`/api/v1/providers`, body);
}

export function updateProvider(id: string, body: any) {
  return axiosMiddlewareThirdParty.put(`/api/v1/providers/${id}`, body);
}

export function deleteProvider(id: string) {
  return axiosMiddlewareThirdParty.delete(`/api/v1/providers/${id}`);
}

// ============================================================
// Provider APIs
// ============================================================

export function getAllProviderApis() {
  return axiosMiddlewareThirdParty.get(`/api/v1/provider-apis`);
}

export function getProviderApisByProvider(providerId: string) {
  return axiosMiddlewareThirdParty.get(`/api/v1/provider-apis/by-provider/${providerId}`);
}

export function createProviderApi(body: any) {
  return axiosMiddlewareThirdParty.post(`/api/v1/provider-apis`, body);
}

export function getProviderApiById(id: string) {
  return axiosMiddlewareThirdParty.get(`/api/v1/provider-apis/${id}`);
}

export function updateProviderApi(id: string, body: any) {
  return axiosMiddlewareThirdParty.put(`/api/v1/provider-apis/${id}`, body);
}

export function deleteProviderApi(id: string) {
  return axiosMiddlewareThirdParty.delete(`/api/v1/provider-apis/${id}`);
}



// ============================================================
// Cost Reports
// ============================================================

export function getCostReportByCustomer(customerId: string, env: string = "test") {
  return axiosMiddlewareThirdParty.get(`/api/v1/cost-reports/by-customer/${customerId}`, {
    params: { env },
  });
}

export function getCostReportByApplication(applicationId: string, env: string = "test") {
  return axiosMiddlewareThirdParty.get(`/api/v1/cost-reports/by-application/${applicationId}`, {
    params: { env },
  });
}

export function getOnboardingCostByCustomer(customerId: string, env: string = "test") {
  return axiosMiddlewareThirdParty.get(`/api/v1/cost-reports/onboarding/${customerId}`, {
    params: { env },
  });
}

export function getEnvConfigsByApiId(apiId: string) {
  return axiosMiddlewareThirdParty.get(`/api/v1/env-configs/by-api/${apiId}`);
}

// ============================================================
// Environment Configs
// ============================================================

export function createEnvConfig(body: any) {
  return axiosMiddlewareThirdParty.post(`/api/v1/env-configs`, body);
}

export function getEnvConfigById(id: string) {
  return axiosMiddlewareThirdParty.get(`/api/v1/env-configs/${id}`);
}

export function updateEnvConfig(configId: string, body: any) {
  return axiosMiddlewareThirdParty.put(`/api/v1/env-configs/${configId}`, body);
}

export function deleteEnvConfig(id: string) {
  return axiosMiddlewareThirdParty.delete(`/api/v1/env-configs/${id}`);
}


export function updateProviderApiCostByCode(code: string, body: { costPerCall: string; costCurrency: string }) {
  return axiosMiddlewareThirdParty.put(`/api/v1/provider-apis/by-code/${code}/cost`, body);
}