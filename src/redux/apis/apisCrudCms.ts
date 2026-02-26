import axiosCms from "../../utils/axiosCms";

const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return queryParams ? `?${queryParams}` : "";
};

export function getAllTickets(page?: any, per_page?: any, search_term?: any) {
  const params: Record<string, any> = {
    user_id: 1,
    page,
    per_page,
    search_term,
  };
  return axiosCms.get(`/api/tickets${buildQueryString(params)}`);
}

export function getMyTickets(page?: any, per_page?: any, search_term?: any) {
  const params: Record<string, any> = {
    user_id: 1,
    my_tickets: 1,
    page,
    per_page,
    search_term,
  };
  return axiosCms.get(`/api/tickets${buildQueryString(params)}`);
}

export function getTicketsByContactNo(page?: any, per_page?: any, contactNo?: any) {
  const params: Record<string, any> = {
    page,
    per_page,
  };
  return axiosCms.get(`/api/tickets/contact/${contactNo}${buildQueryString(params)}`);
}
export function updateTicket(id: any, body: any) {
  return axiosCms.put(`/api/tickets/${id}`, body);
}
export function escalateTicket(id: any, body: any) {
  return axiosCms.post(`/api/tickets/${id}/escalate`, body);
}
export function getTicketDetails(id: any) {
  return axiosCms.get(`/api/tickets/${id}`);
}
export function createTicket(body: any) {
  return axiosCms.post(`/api/tickets/store`, body);
}
export function getReports(page?: any, per_page?: any, companyId?: any, search_term?: any) {
  const params: Record<string, any> = {
    user_id: 1,
    company_id: companyId,
    page,
    per_page,
    search_term,
  };
  return axiosCms.get(`/api/reports${buildQueryString(params)}`);
}

export function getPriorities(page?: any, per_page?: any, search_term?: any) {
  const params: Record<string, any> = {
    page,
    per_page,
    search_term,
  };
  return axiosCms.get(`/api/priorities${buildQueryString(params)}`);
}
export function createPriority(body: any) {
  return axiosCms.post(`/api/priorities/store`, body);
}
export function updatePriority(id: any, body: any) {
  return axiosCms.put(`/api/priorities/${id}`, body);
}
export function deletePriority(id: any) {
  return axiosCms.delete(`/api/priorities/${id}`);
}
export function getCategories(page?: any, per_page?: any, search_term?: any) {
  const params: Record<string, any> = {
    page,
    per_page,
    search_term,
  };
  return axiosCms.get(`/api/categories${buildQueryString(params)}`);
}
export function createCategory(body: any) {
  return axiosCms.post(`/api/categories/store`, body);
}
export function updateCategory(id: any, body: any) {
  return axiosCms.put(`/api/categories/${id}`, body);
}
export function deleteCategory(id: any) {
  return axiosCms.delete(`/api/categories/${id}`);
}
export function getSubCategories(page?: any, per_page?: any, search_term?: any,category_id?: any) {
  const params: Record<string, any> = {
    page,
    per_page,
    search_term,
    category_id,
  };
  return axiosCms.get(`/api/sub-categories${buildQueryString(params)}`);
}
export function deleteSubCategory(id: any) {
  return axiosCms.delete(`/api/sub-categories/${id}`);
}
export function createSubCategory(body: any) {
  return axiosCms.post(`/api/sub-categories/store`, body);
}
export function updateSubCategory(id: any, body: any) {
  return axiosCms.put(`/api/sub-categories/${id}`, body);
}
export function getCustomers(page?: any, per_page?: any, search_term?: any) {
  const params: Record<string, any> = {
    page,
    per_page,
    search_term,
  };
  return axiosCms.get(`/api/customers${buildQueryString(params)}`);
}
export function getEscalations(page?: any, per_page?: any, search_term?: any) {
  const params: Record<string, any> = {
    page,
    per_page,
    search_term,
  };
  return axiosCms.get(`/api/escalations${buildQueryString(params)}`);
}
export function createEscalation(body: any) {
  return axiosCms.post(`/api/escalations/store`, body);
}
export function updateEscalation(id: any, body: any) {
  return axiosCms.put(`/api/escalations/${id}`, body);
}

export function getLogs(page?: any, per_page?: any, search_term?: any) {
  const params: Record<string, any> = {
    page,
    per_page,
    search_term,
  };
  return axiosCms.get(`/api/logs${buildQueryString(params)}`);
}
export function getDepartments(page?: any, per_page?: any, search_term?: any) {
  const params: Record<string, any> = {
    page,
    per_page,
    search_term,
  };
  return axiosCms.get(`/api/departments${buildQueryString(params)}`);
}
export function getUserInfo(contact_no: any) {
  return axiosCms.get(`/api/tickets/user-info?contact_no=${contact_no}`);
}
export function getStatusSummary(radioValue: any) {
  const params: Record<string, any> = {
    value: radioValue,
  };
  return axiosCms.get(`/api/dashboard/status-summary${buildQueryString(params)}`);
}
export function getRecentTickets() {
  return axiosCms.get(`/api/dashboard/recent-tickets`);
}
export function getMonthlyChart(month: any) {
  return axiosCms.get(`/api/dashboard/monthly-chart?monthly_records=${month}`);
}
export function getDailyChart(month: any) {
  return axiosCms.get(`/api/dashboard/daily-chart?selected_month=${month}`);
}