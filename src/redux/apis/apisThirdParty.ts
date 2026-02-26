import axios from "axios";
import axiosThirdParty from "../../utils/axiosThirdParty";

const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return queryParams ? `?${queryParams}` : "";
};

// Dashboard APIs
export function getDashboardStats() {
  return axiosThirdParty.get(`/api/dashboard/stats`);
}

// Client APIs
export function getClients() {
  return axiosThirdParty.get(`/api/client/create`);
}

export function getClientsList(records: number, page: number) {
  return axiosThirdParty.get(`/api/client?records=${records}&page=${page}`);
}
export function getServiceStats() {
  return axiosThirdParty.get(`/api/dashboard/service-stats/Yakeen`);
}

// Dashboard APIs
export function getDashboardData(from: string, to: string, clientId?: string) {
  let url = `/api/dashboard?from=${from}&to=${to}`;
  if (clientId) {
    url += `&client_id=${clientId}`;
  }
  return axiosThirdParty.get(url);
}

export function getDashboardCharts(params?: { startDate?: string; endDate?: string; clientId?: string }) {
  const queryString = params ? buildQueryString(params) : "";
  return axiosThirdParty.get(`/api/dashboard/charts${queryString}`);
}

export function getClientStatsGraph() {
  return axiosThirdParty.get(`/api/dashboard/client-requests`);
}

// Services Management APIs
export function getAllServices(page?: number, perPage?: number, searchTerm?: string) {
  const params: Record<string, any> = {
    page,
    per_page: perPage,
    search_term: searchTerm,
  };
  return axiosThirdParty.get(`/api/services${buildQueryString(params)}`);
}

export function getServicesList(records: number, page: number) {
  return axiosThirdParty.get(`/api/services?records=${records}&page=${page}`);
}

export function getServiceById(id: string) {
  return axiosThirdParty.get(`/api/services/${id}`);
}

export function getServiceApis(serviceId: number) {
  return axiosThirdParty.get(`/api/services/${serviceId}/apis`);
}

export function getServicesApisWithEnvironments(apiId: number) {
  return axiosThirdParty.get(`/api/services/apis-with-environments?api_id=${apiId}`);
}

// Environment APIs
export function getAllApis() {
  return axiosThirdParty.get(`/api/apis`);
}
export function getCountriesThirdParty() {
  return axios.get(`/countries?page=1&per_page=50`);
}
export function getEnvironmentConfig() {
  return axiosThirdParty.get(`/api/environment`);
}

export function exportEnvironmentCsv() {
  return axiosThirdParty.get(`/api/environment/export`);
}

export function createService(data: any) {
  return axiosThirdParty.post(`/api/services`, data);
}

export function updateService(id: string, data: any) {
  return axiosThirdParty.put(`/api/services/${id}`, data);
}

export function deleteService(id: string) {
  return axiosThirdParty.delete(`/api/services/${id}`);
}

export function toggleServiceStatus(id: string, status: boolean) {
  return axiosThirdParty.patch(`/api/services/${id}/status`, { is_active: status });
}

// Clients Management APIs
export function getAllClients(page?: number, perPage?: number, searchTerm?: string, environment?: string) {
  const params: Record<string, any> = {
    page,
    per_page: perPage,
    search_term: searchTerm,
    environment,
  };
  return axiosThirdParty.get(`/api/clients${buildQueryString(params)}`);
}

export function getClientById(id: string) {
  return axiosThirdParty.get(`/api/clients/${id}`);
}

export function getClientEdit(id: number) {
  return axiosThirdParty.get(`/api/client/edit/${id}`);
}

export function createClient(data: any) {
  return axiosThirdParty.post(`/api/client/store`, data);
}

export function updateClient(id: number, data: any) {
  return axiosThirdParty.post(`/api/client/update/${id}`, data);
}

// Client Admin APIs
export function getClientAdmins(clientId: number, records: number, page: number) {
  return axiosThirdParty.get(`/api/client/${clientId}/admin/list?records=${records}&page=${page}`);
}

export function createClientAdmin(clientId: number, data: any) {
  return axiosThirdParty.post(`/api/client/${clientId}/admin/store`, data);
}

export function getClientAdminEdit(adminId: number) {
  return axiosThirdParty.get(`/api/client/admin/edit/${adminId}`);
}

export function updateClientAdmin(data: any) {
  return axiosThirdParty.post(`/api/client/admin/update`, data);
}

export function deleteClientAdmin(adminId: number) {
  return axiosThirdParty.delete(`/api/client/admin/delete/${adminId}`);
}

// Request History APIs
export function getClientRequestProd(params: {
  records?: number;
  client_id?: number | string;
  service_id?: number | string;
  api_id?: number | string;
  from?: string;
  to?: string;
  page?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params.records) queryParams.append("records", params.records.toString());
  if (params.client_id) queryParams.append("client_id", params.client_id.toString());
  if (params.service_id) queryParams.append("service_id", params.service_id.toString());
  if (params.api_id) queryParams.append("api_id", params.api_id.toString());
  if (params.from) queryParams.append("from", params.from);
  if (params.to) queryParams.append("to", params.to);
  if (params.page) queryParams.append("page", params.page.toString());
  
  return axiosThirdParty.get(`/api/requests/prod?${queryParams.toString()}`);
}

export function getClientRequestDev(records: number = 10, page: number = 1) {
  return axiosThirdParty.get(`/api/requests/dev?records=${records}&page=${page}`);
}

export function getRequestDetail(requestId: number) {
  return axiosThirdParty.get(`/api/requests/detail/${requestId}`);
}

export function getRequestService(serviceId: number) {
  return axiosThirdParty.get(`/api/requests/apis?service_id=${serviceId}`);
}

export function deleteClient(id: string) {
  return axiosThirdParty.delete(`/api/clients/${id}`);
}

export function toggleClientStatus(id: string, status: boolean) {
  return axiosThirdParty.patch(`/api/clients/${id}/status`, { is_active: status });
}

export function regenerateClientSecret(id: string) {
  return axiosThirdParty.post(`/api/clients/${id}/regenerate-secret`);
}

// Client Request History APIs
export function getClientRequests(params: {
  page?: number;
  perPage?: number;
  environment?: string;
  clientId?: string;
  serviceId?: string;
  apiType?: string;
  crNo?: string;
  contractNo?: string;
  nid?: string;
  requestNumber?: string;
  startDate?: string;
  endDate?: string;
}) {
  const queryParams: Record<string, any> = {
    page: params.page,
    per_page: params.perPage,
    environment: params.environment,
    client_id: params.clientId,
    service_id: params.serviceId,
    api_type: params.apiType,
    cr_no: params.crNo,
    contract_no: params.contractNo,
    nid: params.nid,
    request_number: params.requestNumber,
    start_date: params.startDate,
    end_date: params.endDate,
  };
  return axiosThirdParty.get(`/api/requests${buildQueryString(queryParams)}`);
}

export function getRequestById(id: string) {
  return axiosThirdParty.get(`/api/requests/${id}`);
}

export function getRequestDetails(id: string) {
  return axiosThirdParty.get(`/api/requests/${id}/details`);
}

// Logs APIs
export function getLaravelLogs(page?: number, perPage?: number, level?: string, searchTerm?: string) {
  const params: Record<string, any> = {
    page,
    per_page: perPage,
    level,
    search_term: searchTerm,
  };
  return axiosThirdParty.get(`/api/logs/laravel${buildQueryString(params)}`);
}

export function downloadLaravelLogs(date?: string) {
  const params = date ? { date } : {};
  return axiosThirdParty.get(`/api/logs/laravel/download${buildQueryString(params)}`, {
    responseType: 'blob',
  });
}

// Employees Management APIs
export function getAllEmployees(page?: number, perPage?: number, searchTerm?: string) {
  const params: Record<string, any> = {
    page,
    per_page: perPage,
    search_term: searchTerm,
  };
  return axiosThirdParty.get(`/api/employees${buildQueryString(params)}`);
}

export function getEmployeeById(id: string) {
  return axiosThirdParty.get(`/api/employees/${id}`);
}

export function createEmployee(data: any) {
  return axiosThirdParty.post(`/api/employees`, data);
}

export function updateEmployee(id: string, data: any) {
  return axiosThirdParty.put(`/api/employees/${id}`, data);
}

export function deleteEmployee(id: string) {
  return axiosThirdParty.delete(`/api/employees/${id}`);
}

export function toggleEmployeeStatus(id: string, status: boolean) {
  return axiosThirdParty.patch(`/api/employees/${id}/status`, { is_active: status });
}

// Roles Management APIs
export function getAllRoles(page?: number, perPage?: number, searchTerm?: string) {
  const params: Record<string, any> = {
    page,
    per_page: perPage,
    search_term: searchTerm,
  };
  return axiosThirdParty.get(`/api/roles${buildQueryString(params)}`);
}

export function getRoleById(id: string) {
  return axiosThirdParty.get(`/api/roles/${id}`);
}

export function createRole(data: any) {
  return axiosThirdParty.post(`/api/roles`, data);
}

export function updateRole(id: string, data: any) {
  return axiosThirdParty.put(`/api/roles/${id}`, data);
}

export function deleteRole(id: string) {
  return axiosThirdParty.delete(`/api/roles/${id}`);
}

// Permissions Management APIs
export function getAllPermissions() {
  return axiosThirdParty.get(`/api/permissions`);
}

export function getRolePermissions(roleId: string) {
  return axiosThirdParty.get(`/api/roles/${roleId}/permissions`);
}

export function assignPermissions(roleId: string, permissionIds: string[]) {
  return axiosThirdParty.post(`/api/roles/${roleId}/permissions`, {
    permission_ids: permissionIds,
  });
}

export function revokePermission(roleId: string, permissionId: string) {
  return axiosThirdParty.delete(`/api/roles/${roleId}/permissions/${permissionId}`);
}

// Environment Settings APIs
export function getEnvironmentSettings() {
  return axiosThirdParty.get(`/api/settings/environment`);
}

export function updateEnvironmentSettings(data: any) {
  return axiosThirdParty.put(`/api/settings/environment`, data);
}

// API Statistics
export function getAPIStatistics(params?: { clientId?: string; serviceId?: string; startDate?: string; endDate?: string }) {
  const queryString = params ? buildQueryString(params) : "";
  return axiosThirdParty.get(`/api/statistics${queryString}`);
}

// Audit Logs
export function getAuditLogs(page?: number, perPage?: number, userId?: string, action?: string, startDate?: string, endDate?: string) {
  const params: Record<string, any> = {
    page,
    per_page: perPage,
    user_id: userId,
    action,
    start_date: startDate,
    end_date: endDate,
  };
  return axiosThirdParty.get(`/api/audit-logs${buildQueryString(params)}`);
}

