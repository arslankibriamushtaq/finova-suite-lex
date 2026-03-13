import axiosMiddlewareThirdParty from "../../utils/axiosMiddlewareThirdParty";

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

// ============================================================
// Environment Configs
// ============================================================

export function updateEnvConfig(configId: string, body: any) {
  return axiosMiddlewareThirdParty.put(`/api/v1/env-configs/${configId}`, body);
}
