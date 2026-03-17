import axiosProductManagement from "../../utils/axiosProductManagment";

// ============================================================
// Template Types CRUD
// ============================================================

export function getAllTemplateTypes() {
  return axiosProductManagement.get(`/api/v1/template-types`);
}

export function getTemplateTypesByCategory(category: string) {
  return axiosProductManagement.get(`/api/v1/template-types/category/${category}`);
}

export function getTemplateTypeById(id: string) {
  return axiosProductManagement.get(`/api/v1/template-types/${id}`);
}

export function createTemplateType(body: { name: string; category: string }) {
  return axiosProductManagement.post(`/api/v1/template-types`, body);
}

export function updateTemplateType(id: string, body: { name: string; category: string; active?: boolean }) {
  return axiosProductManagement.put(`/api/v1/template-types/${id}`, body);
}

export function deleteTemplateType(id: string) {
  return axiosProductManagement.delete(`/api/v1/template-types/${id}`);
}
