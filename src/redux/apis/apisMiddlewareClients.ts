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
