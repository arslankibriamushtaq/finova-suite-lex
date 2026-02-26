import axios from "../../utils/axiosWebPageManagement";

export function getPageData(pageSlug: string, locale: string = 'en') {
    return axios.get(`/api/public/cms/pages/${pageSlug}/sections?locale=${locale}`);
}

export function updatePageData(id: number, data: any) {
    return axios.put(`/api/cms/pages/${id}/update-sections`, data);
}

export function getGlobalSections() {
    return axios.get(`/api/public/cms/sections?is_global=1`);
}

export function updateGlobalSection(sectionId: number, locale: string, data: any) {
    return axios.put(`/api/cms/sections/${sectionId}/translations/${locale}`, {
        locale,
        ...data
    });
}

export function getFinanceCalculation(prodId: any) {
    return axios.get(`/api/v1/loan-application/finance-amount-options?product_id=${prodId}`);
}

export function implementWorkFlowAction(module_name: string, workflow_action_id: string, action: string) {
    return axios.patch(`api/v2/workflow/${module_name}/${workflow_action_id}/${action}`);
  }