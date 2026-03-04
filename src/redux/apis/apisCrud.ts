 
import axios from "../../utils/axios";
import Axios from "axios";
import { store } from "../store";

export function getApplicationData() {
  return axios.get(`/v1/dashboard/applicationData`);
}
export function getDeptWiseApplications() {
  return axios.get(`/v1/applications/department-wise`);
}
export function assignDepartment(body: any) {
  return axios.post(`/v1/applications/assignment`, body);
}
export function getMonthlyApplication(year: any, month: any, week: any) {
  return axios.get(`/v1/dashboard/monthlyApplication?year=${year}&month=${month}&week=${week}`);
}
export function getApplicationsCountMonthlyandYearly(
  year = "2025",
  month = "May",
  week = 1
) {
  return axios.get(
    `/v1/dashboard/applicationsCountMonthlyandYearly?year=${year}&month=${month}`
  );
}
export function getstatusWiseApplications(year = "2025", month = "May") {
  return axios.get(
    `/v1/dashboard/statusWiseApplications?year=${year}&month=${month}`
  );
}
export function getproducTypeApplications() {
  return axios.get(`/v1/dashboard/producTypeApplications`);
}
export function getcomplianceData() {
  return axios.get(`/v1/dashboard/complianceData`);
}
export function getdepartmentWiseApplications() {
  return axios.get(`/v1/dashboard/departmentWiseApplications`);
}
export function getRecentApplications(page: any, pageSize: any) {
  return axios.get(
    `/v1/dashboard/recent-applications?page=${page}&per_page=${pageSize}`
  );
}
export function getDashboardStatistics(fromDate?: string, toDate?: string) {
  let url = `/v1/dashboard/statistics`;
  const params = [];
  
  if (fromDate) {
    params.push(`from=${fromDate}`);
  }
  if (toDate) {
    params.push(`to=${toDate}`);
  }
  
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  
  return axios.get(url);
}
export function getdepartmentApplications(id = "") {
  return axios.get(`/v1/dashboard/departmentApplications?department_id=${id}`);
}
export function customerLogin(body: any) {
  return axios.post(`/los-login`, body);
}

// export function pendingFinancing() {
//   return axios.get(`/partner-admin/pending-applications`);
// }
export function inprogressApplication() {
  return axios.get(`/partner-admin/in-progress-applications`);
}
export function approvedApplication() {
  return axios.get(`/partner-admin/approve-applications`);
}
export function insuranceVendor() {
  return axios.get(`/insurance-vendors`);
}
export function getDepartmentsList() {
  return axios.get(`/departments`);
}
export function getDepartmentsPermission() {
  return axios.get(`/departments/permissions`);
}

export function addDepartmentPermissions(body: any) {
  return axios.post("/departments/store-department-permissions", body);
}

export function getDepartmentPermission(id: any) {
  return axios.get(
    `/departments/get-department-permissions?department_id=${id}`
  );
}

export function getLeadCustomers(page: number = 1, per_page: number = 20, search: string = '', pep: string = '', status: string = '') {
  return axios.get(`/crm/leads?page=${page}&per_page=${per_page}&search=${search}&pep=${pep}&status=${status}`);
}
export function getPepCustomers(page: number = 1, per_page: number = 20, search: string = '', pep: string = '', status: string = '') {
  return axios.get(`/crm/pep-customers?page=${page}&per_page=${per_page}&search=${search}&pep=${pep}&status=${status}`);
}
export function getHighRiskUsers(page: number = 1, per_page: number = 20, search: string = '', pep: string = '', status: string = '') {
  return axios.get(`/crm/high-risk-users?page=${page}&per_page=${per_page}&search=${search}&pep=${pep}&status=${status}`);
}
export function getUserDetails(id: number | string) {
  return axios.get(`/crm/user-details/${id}`);
}

export function getOpportunityDetails(id: number | string) {
  return axios.get(`/crm/opportunity-details/${id}`);
}

export function getRejectedLeadCustomers(page: number = 1, per_page: number = 20, search: string = '', pep: string = '', status: string = '') {
  return axios.get(`/crm/rejected-users?page=${page}&per_page=${per_page}&search=${search}&pep=${pep}&status=${status}`);
}
export function getOpportunitiesCustomers(page: number = 1, per_page: number = 20, search: string = '', pep: string = '', status: string = '', fromDate: string | null = null, toDate: string | null = null) {
  let url = `/crm/opportunities?page=${page}&per_page=${per_page}`;
  if (search) url += `&search=${search}`;
  if (pep) url += `&pep=${pep}`;
  if (status) url += `&status=${status}`;
  if (fromDate) url += `&from_date=${fromDate}`;
  if (toDate) url += `&to_date=${toDate}`;
  return axios.get(url);
}
export function getCustomers(page: number = 1, per_page: number = 20, search: string = '', pep: string = '', status: string = '') {
  return axios.get(`/crm/customers`);
}
export function getonboardCustomersCustomers(page: number = 1, per_page: number = 20, search: string = '', pep: string = '', status: string = '') {
  return axios.get(`/customers?customer_type=onboardCustomers&page=${page}&per_page=${per_page}&search=${search}&pep=${pep}&status=${status}`);
}

export function getRoles() {
  return axios.get(`/role`);
}
export function getEmployess() {
  return axios.get(`/employees`);
}

export function getDepartmentDefaultUpdate(id: any) {
  return axios.patch(`/departments/update-default-department/${id}`);
}

export function addVendor(formData: FormData) {
  return axios.post("/insurance-vendors/store", formData);
}

export function ViewVendor(id: any) {
  return axios.get(`/insurance-vendors/edit/${id}`);
}
export function editVendorInsurance(id: any, body: any) {
  return axios.post(`/insurance-vendors/update/${id}`, body);
}
export function deleteVendorInsurance(id: any) {
  return axios.post(`/insurance-vendors/delete/${id}`);
}
export function addDepartments(body: any) {
  return axios.post(`/departments/store`, body);
}
export function saveDepartment(body: any) {
  return axios.post(`https://devapi.awn-sa.com/cms/api/department/store`, body);
}
export function changeDepartments(body: any) {
  return axios.patch(`/departments/change-department-status`, body);
}
export function addEmployee(body: any) {
  return axios.post(`/store-employee`, body);
}

export function allCustomerStatusChange(body: any) {
  return axios.post(`/api/portal/customers/change-status`, body);
}
export function customersList(page: number = 1, per_page: number = 20, search: string = '', pep: string = '', status: string = '') {
  return axios.get(`/api/portal/customers?page=${page}&per_page=${per_page}&search=${search}&pep=${pep}&status=${status}`);
}
export function testapi() {
  return axios.get(`/v1/dashboard/applicationData`);
}
export function serviceDashboardList(filter: any, from: any, to: any) {
  return axios.get(
    `/api/service-report?filter_type=${
      from && to
        ? `custom&start_date=${from}&end_date=${to}`
        : filter
        ? filter
        : "today"
    }`
  );
}
export function gameCenterDashboardList() {
  return axios.get(`/api/game-center?filter_type=last_7_days`);
}
export function onboardingDashboardList(filter: any, from: any, to: any) {
  return axios.get(
    `/api/onboarding-report?filter_type=${
      from && to
        ? `custom&start_date=${from}&end_date=${to}`
        : filter
        ? filter
        : "today"
    }`
  );
}
export function incomingOutgoingDashboardList(filter: any, from: any, to: any) {
  return axios.get(
    `/api/fund-report?filter_type=${
      from && to
        ? `custom&start_date=${from}&end_date=${to}`
        : filter
        ? filter
        : "today"
    }`
  );
}

export function gamecenterLists(filter: any, from: any, to: any) {
  return axios.get(
    `/api/game-center/stats?filter_type=${
      from && to
        ? `custom&start_date=${from}&end_date=${to}`
        : filter
        ? filter
        : "today"
    }`
  );
}
export function mainDashboardList(filter: any, from: any, to: any) {
  return axios.get(
    `/api/main-dashboard?filter_type=${
      from && to
        ? `custom&start_date=${from}&end_date=${to}`
        : filter
        ? filter
        : "today"
    }`
  );
}
export function getAllRewards() {
  return axios.get(`api/portal/user-reward/list`);
}
export function getAllReferral() {
  return axios.get(`api/portal/referral`);
}
export function getAllFaq(page?: any, pageSize?: any) {
  return axios.get(`api/portal/faq?page=${page}&per_page=${pageSize}`);
}
export function getAllFaqCreate(body: any) {
  return axios.post(`api/portal/faq/create`, body);
}
export function updateFaqList(id: any, body: any) {
  return axios.post(`api/portal/faq/edit/${id}`, body);
}

export function deleteFaq(id: any) {
  return axios.delete(`/api/portal/faq/delete/${id}`);
}

export function getUsers(page: any, pageSize: any) {
  return axios.get(
    `/api/portal/user-management/users?page=${page}&per_page=${pageSize}`
  );
}
export function createUser(body: any) {
  return axios.post(`/api/portal/user-management/users`, body);
}
export function getRolesList(page?: any, pageSize?: any) {
  return axios.get(
    `/api/portal/role-management/direct-list?page=${page}&per_page=${pageSize}`
  );
}
export function activityLogsList(page: any, pageSize: any) {
  return axios.get(
    `/api/portal/logs/activity?page=${page}&per_page=${pageSize}`
  );
}
export function financialLogsList(page: any, pageSize: any) {
  return axios.get(
    `/api/portal/logs/financial?page=${page}&per_page=${pageSize}`
  );
}
export function digittLogsList(page: any, pageSize: any) {
  return axios.get(`/api/portal/logs/digitt?page=${page}&per_page=${pageSize}`);
}
export function systemAuditList(page: any, pageSize: any) {
  return axios.get(
    `/api/portal/logs/system_audit?page=${page}&per_page=${pageSize}`
  );
}
export function complaintTypeList(page: any, pageSize: any) {
  return axios.get(
    `/api/portal/complaint-type?page=${page}&per_page=${pageSize}`
  );
}
export function complaintID() {
  return axios.get(`/api/portal/complaint-type`);
}
export function createComplaintType(body: any) {
  return axios.post(`/api/portal/complaint-type/create`, body);
}
export function editComplaintType(body: any) {
  return axios.post(`/api/portal/complaint-type/edit/${body.id}`, body);
}
export function deleteComplaintType(id: any) {
  return axios.delete(`/api/portal/complaint-type/delete/${id}`);
}
export function leadsList(page: any, pageSize: any) {
  return axios.get(`/api/portal/leads?page=${page}&per_page=${pageSize}`);
}
export function getAllFinancingApplications(page: any, pageSize: any) {
  return axios.get(
    `/v1/applications/all?page=${page}&per_page=${pageSize}`
  );
}
export function getAllApprovedFinancingApplications(page: any, pageSize: any) {
  return axios.get(
    `/v1/applications/approved?page=${page}&per_page=${pageSize}`
  );
}
export function getAllRejectedFinancingApplications(page: any, pageSize: any) {
  return axios.get(
    `/v1/applications/rejected?page=${page}&per_page=${pageSize}`
  );
}
export function getReschedulingRequest(page: any, pageSize: any, status?: string, fromDate?: string, toDate?: string) {
  const statusParam = status ? `&status=${status}` : '';
  const fromDateParam = fromDate ? `&from_date=${fromDate}` : '';
  const toDateParam = toDate ? `&to_date=${toDate}` : '';
  return axios.get(
    `/mobile/loan-applications/rescheduled-list?page=${page}&per_page=${pageSize}${statusParam}${fromDateParam}${toDateParam}`
  );
}
export function getAllIncompleteFinancingApplications(page: any, pageSize: any) {
  return axios.get(
    `/v1/applications/incomplete?page=${page}&per_page=${pageSize}`
  );
}
export function getAllCanceledFinancingApplications(page: any, pageSize: any) {
  return axios.get(
    `/v1/applications/cancelled?page=${page}&per_page=${pageSize}`
  );
}
export function getAllPendingFinancingApplications(page: any, pageSize: any) {
  return axios.get(
    `/v1/applications/pending?page=${page}&per_page=${pageSize}`
  );
}
export function getAllInProgressFinancingApplications(page: any, pageSize: any) {
  return axios.get(
    `/v1/applications/in-progress?page=${page}&per_page=${pageSize}`
  );
}
export function getApplicationsByStatus(body: any,page: any, pageSize: any,) {
  return axios.post(
    `/v1/applications/applications-listing?page=${page}&per_page=${pageSize}`,body
  );
}
export function getAllComplaints(page: any, pageSize: any) {
  return axios.get(`/api/portal/complaints?page=${page}&per_page=${pageSize}`);
}
export function createComplaints(body: any) {
  return axios.post(`/api/portal/complaints/create`, body);
}
export function departmentList(page?: any, pageSize?: any) {
  return axios.get(
    `/api/portal/department-management/direct-list?page=${page}&per_page=${pageSize}`
  );
}
export function createComplaintSubType(body: any) {
  return axios.post(`/api/portal/complain-subtype/create`, body);
}
export function editComplaintSubType(body: any) {
  return axios.post(`/api/portal/complain-subtype/edit/${body.id}`, body);
}
export function deleteComplaintSubType(id: any) {
  return axios.delete(`/api/portal/complain-subtype/delete/${id}`);
}
export function getAllVendors() {
  return axios.get(`/api/portal/vendor`);
}
export function getAllVendorServices(page: any, pageSize: any) {
  return axios.get(
    `/api/portal/vendor-service?page=${page}&per_page=${pageSize}`
  );
}
export function createVendorService(body: any) {
  return axios.post(`/api/portal/vendor-service/create`, body);
}
export function editVendorService(body: any) {
  return axios.post(`/api/portal/vendor-service/edit/${body.id}`, body);
}
export function deleteVendorService(id: any) {
  return axios.delete(`/api/portal/vendor-service/delete/${id}`);
}
export function deleteComplaints(id: any) {
  return axios.delete(`/api/portal/complaints/delete/${id}`);
}
export function updateComplaints(id: any, body: any) {
  return axios.post(`api/portal/complaints/edit/${id}`, body);
}
export function getComplaintsSubType(page: any, pageSize: any = 15) {
  return axios.get(
    `api/portal/complain-subtype?page=${page}&per_page=${pageSize}`
  );
}
export function getGuestAccounts(page: any, pageSize: any) {
  return axios.get(
    `api/portal/customers/guest?page=${page}&per_page=${pageSize}`
  );
}
export function relationLovList(page: any, pageSize: any) {
  return axios.get(
    `/api/portal/relation-lov?page=${page}&per_page=${pageSize}`
  );
}
export function createRelationLov(body: any) {
  return axios.post(`/api/portal/relation-lov/create`, body);
}
export function editRelationLov(body: any) {
  return axios.post(`/api/portal/relation-lov/edit/${body.id}`, body);
}
export function deleteRelationLov(id: any) {
  return axios.delete(`/api/portal/relation-lov/delete/${id}`);
}
export function getIbft(page: any) {
  return axios.get(`api/portal/transactions/ibft?page=${page}`);
}
export function getMobileTopup(page: any) {
  return axios.get(`api/portal/transactions/topup?page=${page}`);
}
export function getMobileBundle(page: any) {
  return axios.get(`api/portal/transactions/bundle?page=${page}`);
}
export function getBusBooking(page: any) {
  return axios.get(`api/portal/transactions/bus-booking?page=${page}`);
}

export function getAirBooking(page: any) {
  return axios.get(`api/portal/transactions/air-booking?page=${page}`);
}
export function getBarqLiteAccounts(page: any, pageSize: any) {
  return axios.get(
    `api/portal/customers/barq-lite?page=${page}&per_page=${pageSize}`
  );
}
export function getBarqFlexAccounts(page: any, pageSize: any) {
  return axios.get(
    `api/portal/customers/barq-flex?page=${page}&per_page=${pageSize}`
  );
}
export function getBarqPrimeAccounts(page: any, pageSize: any) {
  return axios.get(
    `api/portal/customers/barq-prime?page=${page}&per_page=${pageSize}`
  );
}

export function getIncomeType(page: any, pageSize: any) {
  return axios.get(`/api/portal/income-type?page=${page}&per_page=${pageSize}`);
}
export function createIncomeType(body: any) {
  return axios.post(`/api/portal/income-type/create`, body);
}
export function editIncomeType(body: any) {
  return axios.post(`/api/portal/income-type/edit/${body.id}`, body);
}
export function deleteIncomeType(id: any) {
  return axios.delete(`/api/portal/income-type/delete/${id}`);
}

export function vendorList(page: any, pageSize: any) {
  return axios.get(`/api/portal/vendor?page=${page}&per_page=${pageSize}`);
}
export function createVendor(body: any) {
  return axios.post(`/api/portal/vendor/create`, body);
}
export function editVendor(body: any) {
  return axios.post(`/api/portal/vendor/edit/${body.id}`, body);
}
export function deleteVendor(id: any) {
  return axios.delete(`/api/portal/vendor/delete/${id}`);
}

export function getAllComplaintsAssign(page: any, pageSize: any, id: any) {
  return axios.get(
    `/api/portal/complaints-assign/${id}?page=${page}&per_page=${pageSize}`
  );
}
export function createComplaintsAssign(body: any) {
  return axios.post(`/api/portal/complaints-assign/create`, body);
}
export function getVendorCommissionList(page: any, pageSize: any) {
  return axios.get(
    `api/portal/vendor-commission?page=${page}&per_page=${pageSize}`
  );
}
export function getVendorCommissionForType() {
  return axios.get(`api/portal/vendor`);
}
export function createVendorCommission(body: any) {
  return axios.post(`api/portal/vendor-commission/create`, body);
}
export function editVendorCommission(id: any, body: any) {
  return axios.post(`api/portal/vendor-commission/edit/${id}`, body);
}
export function deleteVendorCommission(id: any) {
  return axios.delete(`api/portal/vendor-commission/delete/${id}`);
}
export function logOutApi() {
  return axios.post(`/identity-service/api/v1/auth/logout`);
}
export function getAppVersion(page: any, pageSize: any) {
  return axios.get(`api/portal/app-version?page=${page}&per_page=${pageSize}`);
}
export function createAppVersion(body: any) {
  return axios.post(`api/portal/app-version/create`, body);
}
export function editAppVersion(body: any) {
  return axios.post(`api/portal/app-version/edit/${body.id}`, body);
}
export function deleteAppVersion(id: any) {
  return axios.delete(`api/portal/app-version/delete/${id}`);
}
export function getVendorCommissionSlab(page: any, pageSize: any) {
  return axios.get(
    `api/portal/vendor-commission-slab?page=${page}&per_page=${pageSize}`
  );
}
export function createVendorCommissionSlab(body: any) {
  return axios.post(`api/portal/vendor-commission-slab/create`, body);
}
export function editVendorCommissionSlab(body: any) {
  return axios.post(`api/portal/vendor-commission-slab/edit/${body.id}`, body);
}
export function deleteVendorCommissionSlab(id: any) {
  return axios.delete(`api/portal/vendor-commission-slab/delete/${id}`);
}
export function getIncomeProof(page: any, pageSize: any) {
  return axios.get(`api/portal/income-proof?page=${page}&per_page=${pageSize}`);
}
export function createIncomeProof(body: any) {
  return axios.post(`api/portal/income-proof/create`, body);
}
export function editIncomeProof(body: any) {
  return axios.post(`api/portal/income-proof/edit/${body.id}`, body);
}
export function deleteIncomeProof(id: any) {
  return axios.delete(`api/portal/income-proof/delete/${id}`);
}
export function getCampaign(page: any, pageSize: any) {
  return axios.get(`api/portal/campaign?page=${page}&per_page=${pageSize}`);
}
export function createCampaign(body: any) {
  return axios.post(`api/portal/campaign/create`, body);
}
export function editCampaign(body: any) {
  return axios.post(`api/portal/campaign/edit/${body.id}`, body);
}
export function deleteCampaign(id: any) {
  return axios.delete(`api/portal/campaign/delete/${id}`);
}

// export function getAlldepartments(page?: any, pageSize?: any) {
//   return axios.get(`/api/portal/department?page=${page}&per_page=${pageSize}`);
// }

export function getAssignList(id: any) {
  return axios.get(`/api/portal/department/${id}/users`);
}
export function updateAssignList(id: any, body: any) {
  return axios.post(`api/portal/complaints-assign/edit/${id}`, body);
}
export function getAlldepartments(
  page: any,
  pageSize: any,
  searchTerm: any,
  selectedFilters: any
) {
  return axios.get(
    `/api/portal/department?${
      searchTerm
        ? `search=${searchTerm}&${
            selectedFilters
              ? `filter_type=${selectedFilters}`
              : `page=${page}&per_page=${pageSize}`
          }`
        : `page=${page}&per_page=${pageSize}`
    }`
  );
}

export function updateDepartments(id: any, body: any) {
  return axios.post(`api/portal/department/edit/${id}`, body);
}
export function updateEmployee(id: any, body: any) {
  return axios.post(`/update-employee/${id}`, body);
}
export function deleteDepartment(id: any) {
  return axios.delete(`api/portal/department/delete/${id}`);
}
export function deleteEmployess(id: any) {
  return axios.post(`/destroy-employee/${id}`);
}
export function resendLoginEmail(id: any) {
  return axios.get(`/resend-login-email/${id}`);
}
export function resendApplicationLoginEmail(applicationId: any) {
  return axios.post(`/v1/applications/resend-login-email`, {
    application_id: applicationId
  });
}
export function addRole(body: any) {
  return axios.post(`/role/save`, body);
}
export function editRole(id: any, body: any) {
  return axios.post(`/role/update/${id}`, body);
}
export function deleteRole(id: any) {
  return axios.post(`/role/delete/${id}`);
}
export function getRolePermission() {
  return axios.get(`/v1/permissions/get-modules-with-permissions`);
}
export function addRolePermissions(body: any) {
  return axios.post("/v1/permissions/save-permission", body);
}
export function getPermissionByRole(id: any) {
  return axios.get(`/v1/permissions?role_id=${id}`);
}
export function getProductsListing(page:any,pageSize:any) {
  return axios.get(`/product?page=${page}&per_page=${pageSize}`);
}
export function createProduct(fd: FormData) {
  return axios.post(`/product`, fd);
}
export function getProductCategories() {
  return axios.get(`/product/product-category-and-active-categories/13`);
}
export function UpdateProductCommodity(body: any, id: any) {
  return axios.post(`/product/${id}/commodity/update`, body);
}
export function getSourceOfRevenue() {
  return axios.get(`/source-of-revenue`);
}
export function getSourceOfRevenuePublic() {
  return axios.get(`/product/13/sor`);
}
export function createSourceOfRevenue(body: any) {
  return axios.post(`/source-of-revenue`, body);
}
export function updateSourceOfRevenue(id: any, body: any) {
  return axios.put(`/source-of-revenue/${id}`, body);
}
export function deleteSourceOfRevenue(id: any) {
  return axios.delete(`/source-of-revenue/${id}`);
}
export function updateSourceOfRevenueStatus(id: any, body: any) {
  return axios.post(`/source-of-revenue/status/${id}`, body);
}
export function getPurposeOfFinance() {
  return axios.get(`/purpose-of-finance`);
}
export function getPurposeOfFinancePublic() {
  return axios.get(`/product/13/pof`);
}
export function createPurposeOfFinance(body: any) {
  return axios.post(`/purpose-of-finance`, body);
}
export function updatePurposeOfFinance(id: any, body: any) {
  return axios.put(`/purpose-of-finance/${id}`, body);
}
export function deletePurposeOfFinance(id: any) {
  return axios.delete(`/purpose-of-finance/${id}`);
}
export function updatePurposeOfFinanceStatus(id: any, body: any) {
  return axios.post(`/purpose-of-finance/status/${id}`, body);
}
export function getTypeReasons() {
  return axios.get(`/type-reason`);
}
export function createTypeReasons(body: any) {
  return axios.post(`/type-reason`, body);
}
export function updateTypeReasons(id: any, body: any) {
  return axios.put(`/type-reason/${id}`, body);
}
export function deleteTypeReasons(id: any) {
  return axios.delete(`/type-reason/${id}`);
}
export function updateReasonTypeStatus(id: any, body: any) {
  return axios.post(`/type-reason/status/${id}`, body);
}
export function getProductCategoriesList() {
  return axios.get(`/category`);
}
export function updateCategoryStatus(id: any, body: any) {
  return axios.post(`/category/status/${id}`, body);
}
export function updateCategoryToDefault(id: any, body: any) {
  return axios.post(`/category/make-default/${id}`, body);
}
export function getProductTypes() {
  return axios.get(`/product-type`);
}
export function createProductType(body: any) {
  return axios.post(`/product-type`, body);
}
export function updateProductType(id: any, body: any) {
  return axios.put(`/product-type/${id}`, body);
}
export function deleteProductType(id: any) {
  return axios.delete(`/product-type/${id}`);
}
export function updateProductTypeStatus(id: any, body: any) {
  return axios.post(`/product-type/status/${id}`, body);
}
export function getCities(page?: number, per_page?: number,search?: string) {
  const params = new URLSearchParams();
  params.append('page', String(page || 1));
  params.append('per_page', String(per_page || 50));
  if (search) params.append('search', search);
  return axios.get(`/cities?${params.toString()}`);
  return axios.get(`/cities?page=${page || 1}&per_page=${per_page || 50}&search=${search}`);
}
export function getCountriesLov(page?: number, per_page?: number, search?: string) {
  const params = new URLSearchParams();
  params.append('page', String(page || 1));
  params.append('per_page', String(per_page || 50));
  if (search) params.append('search', search);
  return axios.get(`/countries?${params.toString()}`);
}
export function getProfessions(page?: number, per_page?: number, search?: string) {
  const params = new URLSearchParams();
  params.append('page', String(page || 1));
  params.append('per_page', String(per_page || 50));
  if (search) params.append('search', search);
  return axios.get(`/professions?${params.toString()}`);
}
export function createProfession(body: any) {
  return axios.post(`/professions`, body);
}
export function updateProfession(id: any, body: any) {
  return axios.put(`/professions/${id}`, body);
}
export function deleteProfession(id: any) {
  return axios.delete(`/professions/${id}`);
}
export function getCommodityTypes() {
  return axios.get(`/commodity`);
}
export function createCommodityType(body: any) {
  return axios.post(`/commodity`, body);
}
export function updateCommodityType(id: any, body: any) {
  return axios.put(`/commodity/${id}`, body);
}
export function deleteCommodityType(id: any) {
  return axios.delete(`/commodity/${id}`);
}
export function updateCommodityTypeStatus(id: any, body: any) {
  return axios.post(`/commodity/status/${id}`, body);
}
export function updateContractTemplateStatus(id: any, body: any) {
  return axios.put(`https://uat-v2-api.awn-sa.com/los/api/v2/contract-templates/${id}`, body);
}
export function getPartnerDashboard() {
  return axios.get(`/partner-admin/affiliate-dashboard`);
}
export function getCheckTypes() {
  return axios.get(`/check-type`);
}
export function getCheckTypeConstants() {
  return axios.get(`/check-type/constants`);
}
export function updateCheckTypesStatus(id: any, body: any) {
  return axios.post(`/check-type/status/${id}`, body);
}
export function deleteCheckType(id: any) {
  return axios.delete(`/check-type/${id}`);
}
export function updateCheckType(id: any, body: any) {
  return axios.put(`/check-type/${id}`, body);
}
export function createCheckType(body: any) {
  return axios.post(`/check-type`, body);
}
export function getUserProductsListing() {
  return axios.get("application/get-product-partners/13");
}
export function verifyCr(body: any) {
  return axios.post("application/business-verification", body);
}
export function getUserProductDetails(id: any) {
  return axios.get(`application/product-details?product_id=${id}`);
}
export function createBuisnessPartner(body: any) {
  return axios.post(`/application/business-info`, body);
}
export function createAuthorizedInfo(body: any) {
  return axios.post(`application/absher-otp`, body);
}

export function otpVerification(body: any) {
  return axios.post(`/application/otp-verification`, body);
}
export function complianceInfo(body: FormData) {
  return axios.post(`/application/compliance-info`, body);
}
export function uploadApplicationDoc(body: any) {
  return axios.post(`/application/application-documents`, body);
}
export function uploadSimahDocument(body: FormData) {
  return axios.post(`/application/simah-document`, body);
}
export function approveSimahInfo(body: any) {
  return axios.post(`/v1/applications/simah-approval`, body);
}
export function createNafathRequest(body: any) {
  return axios.post(`/application/nafath-request`, body);
}
export function nafathRequestStatus(body: any) {
  return axios.post(`/application/nafath-status`, body);
}
export function submitApplication(body: any) {
  return axios.post(`application/submit-application`, body);
}
export function generateUnifonicOtp(body: any) {
  return axios.post(`/application/unifonic-otp`, body);
}
export function verifyConsumer(body: any) {
  return axios.post(`/application/consumer-verification`, body);
}
export function disclaimerTextStep(body: any) {
  return axios.post(`application/product-disclaimer-text`, body);
}
export function getSummary(body: any) {
  return axios.post(`application/show-factoring-application-summary`, body);
}
export function createPartner(body: any) {
  return axios.post(`/partner`, body);
}
export function getCountries(page: number = 1, per_page: number = 100, search?: string) {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
  return axios.get(`/v1/countries?page=${page}&per_page=${per_page}${searchParam}`);
}
export function getProductTypeListing() {
  return axios.get(`application/product-type-listing`);
}
export function saveSteps(body: any, id: any) {
  return axios.put(`/products/${id}/settings/steps`, body);
}
export function UpdateProductStatus(body: any) {
  return axios.post(`product/updateproductstatus`, body);
}
export function getRejectedApplication(page:any,pageSize:any) {
  return axios.get(`/partner-admin/rejected-applications?page=${page}&per_page=${pageSize}`);
}
export function getIncompleteApplication(page:any,pageSize:any) {
  return axios.get(`/partner-admin/incomplete-applications?page=${page}&per_page=${pageSize}`);
}

export function TermsAndConditions(body: any, id: any) {
  return axios.put(`/products/${id}/settings/terms`, body);
}
export function FeesSettings(body: any, id: any) {
  return axios.put(`/products/${id}/settings/fees`, body);
}
export function adminFeeProducts(productId:any,partnerId:any) {
  return axios.get(`/processing-fee-slab?product_id=${productId}&partner_id=${partnerId}`);
}
export function UpdateProduct(body: any,id:any) {
  return axios.post(`product/${id}/update`, body);
}

export function getProductById(id: any, type: string = 'basic'){
  return axios.get(`/product/${id}?type=${type}`)
}

export function saveVerificationMethods(body: any,) {
  return axios.post(`/product/update-product-verification-methods`, body);
}
export function createFeeSlab(body: any) {
  return axios.post(`/processing-fee-slab/save`, body);
}
export function updateFeeSlab(body: any) {
  return axios.post(`/processing-fee-slab/update`, body);
}
export function deleteProcessingFeeSlab(id: any) {
  return axios.delete(`/processing-fee-slab/delete/${id}`);
}
export const updateFeeSlabStatus = (id: number, status: number) => {
  return axios.get(`/processing-fee-slab/updatestatus/${id}?status=${status}`);
};
export function getPartnerAffiliateDashboard(id:any){
  return axios.get(`/partner-admin/affiliate-dashboard?partner_id=${id}`)
}

export function getAdminList(productId: any, page: any, pageSize: any) {
  return axios.get(`/product/${productId}/admins?page=${page}&per_page=${pageSize}`);
}

export function getProductCategorie(productId: any) {
  return axios.get(`/product/product-category-and-active-categories/${productId}`);
}

export function updateProductCategory(productId: any, body: any) {
  return axios.put(`/product/update-product-category/${productId}`, body);
}

// Admin CRUD APIs
export function createAdmin(productId: any, body: any) {
  return axios.post(`/product-admin/${productId}/store`, body);
}

export function getProductAdminList(productId: any) {
  return axios.get(`/product/adminList/${productId}`);
}

export function updateAdmin(adminId: any, body: any) {
  return axios.put(`/product-admin/update/${adminId}`, body);
}

export function deleteAdmin(adminId: any, productId: any) {
  return axios.delete(`/product-admin/delete/${adminId}?product_id=${productId}`);
}


export function getBusinessInfoDetails(id: any, lang: any) {
  return axios.get(`/v1/applications/businessInfo/${id}?lang=${lang}`);
}
export function getManagerInfoDetails(id: any, lang: any) {
  return axios.get(`/v1/applications/managerInfo/${id}?lang=${lang}`);
}
export function getFactoringInfoDetails(id: any) {
  return axios.get(`/v1/applications/financingInfo/${id}`);
}
export function getRevenueDetails(id: any) {
  return axios.get(`/v1/applications/revenueDetails/${id}`);
}
export function getBayanVerfDetails(id: any) {
  return axios.get(`/v1/applications/bayanVerificationDetails/${id}`);
}
export function getBayanCreditDetails(id: any) {
  return axios.get(`/v1/applications/bayanCreditDetails/${id}`);
}
export function getBayanNaeDetails(id: any) {
  return axios.get(`/v1/applications/bayanNAEDetails/${id}`);
}
export function getComplianceCheck(id: any) {
  return axios.get(`/v1/applications/compliance/${id}`);
}
export function getApplicationStatuses(id: any) {
  return axios.get(`/v1/applications/get-status?application_no=${id}`);
}
export function getCreditCheck(id: any) {
  return axios.get(`/v1/applications/credit/${id}`);}
export function getReqDocument(id: any) {
  return axios.get(`/products/documents?product_id=${id}`);
}
export function updateReqDocument(id: any, body: any) {
  return axios.put(`/products/documents/update/${id}`, body);
}
export function storeReqDocument(body: any) {
  return axios.post(`/products/documents/store`, body);
}
export function storeRequestDuration(body: any) {
  return axios.post(`/product/store-request-duration-setting`, body);
}
export function calculateApplicationWeight(body: any) {
  return axios.post(`/v1/applications/save_application-weight`, body);
}
export function addComment(body: any) {
  return axios.post(`/v1/applications/addComment`, body);
}
export function applicationApprovalChecks(body: any) {
  return axios.post(`/v1/applications/applicationApprovalChecks`, body);
}
export function getUserList(id: any) {
  return axios.get(`/department/user/${id}`);
}

export function getApplicationDetailsByType(applicationNo: any, type: any) {
  return axios.get(`/v1/applications/view-application-details`, {
    params: {
      type: type,
      application_no: applicationNo
    }
  });
}

export function getComments(id: any) {
  return axios.get(`/v1/applications/comments/${id}`);
}
export function approveApplication(body: any) {
  return axios.post(`/v1/applications/approve`, body);
}
export function requestDoc(body: any) {
  return axios.post(`/v1/applications/request-document`, body);
}
export function getActivityLogs(from: any, to: any) {
  return axios.get(`/activity-logs?from=${from}&to=${to}`);
}
export function getApplicationActivityLogs(applicationId: string, fromDate?: string | null, toDate?: string | null) {
  const params: any = {};
  
  if (applicationId) {
    params.application_id = applicationId;
  }
  
  if (fromDate) {
    params.from = fromDate;
  }
  
  if (toDate) {
    params.to = toDate;
  }
  
  return axios.get(`/activity-logs`, { params });
}

export function getSimahCheckDetails(applicationNo: any, type: string, formData?: FormData) {
  if (type === 'upload_simah_document' && formData) {
    formData.append('application_no', applicationNo);
    formData.append('type', type);
    return axios.post(`/v1/applications/simah-check-details`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  return axios.post(`/v1/applications/simah-check-details`, {
    application_no: applicationNo,
    type: type
  });
}

export function getApplicationDocuments(applicationNo: any) {
  return axios.get(`/v1/applications/${applicationNo}/documents`);
}

export function requestApplicationDocuments(body: any) {
  return axios.post(`/v1/applications/request-document`, body);
}
  export function getAllApis() {
    return axios.get(`/apis-management/all-apis`);
  }
  export function getPartnerAllApis() {
    return axios.get(`/partner-admin/get-all-apis`);
  }

export function updateApiStatus(body: any) {
  return axios.post(`/apis-management/change-api-status`, body);
}
export function getPartnerApis() {
  return axios.get(`/apis-management/partner-apis`);
}
export function getPartnersList() {
  return axios.get(`/partner`);
}
export function addPartner(body: any) {
  return axios.post(`/partner`, body);
}
export function updatePartner(id: any, body: any) {
  return axios.put(`/partner/${id}`, body);
}
export function deletePartner(id: any) {
  return axios.delete(`/partner/${id}`);
}
export function getPartnerById(id: any) {
  return axios.get(`/partner/${id}`);
}
export function updatePartnerStatus(id: any, body: any) {
  return axios.patch(`/partner/status/${id}`, body);
}
export function updatePartnerAdminStatus(id: any, body: any) {
  return axios.post(`/partner-admin/status/${id}`, body);
}
export function getPartnerAdminList(id: any) {
  return axios.get(`/partner/${id}/admins`);
}
export function getPartnerAdminById(partnerId: any, adminId: any) {
  return axios.get(`partner-admin/show/${adminId}`);
}
export function addPartnerAdmin(partnerId: any, body: any) {
  return axios.post(`partner-admin/${partnerId}/store`, body);
}
export function updatePartnerAdmin(partnerId: any, adminId: any, body: any) {
  return axios.post(`partner-admin/update/${adminId}`, body);
}
export function getPartnerCommissions(id?: any) {
  const url = id ? `/partner/partner-commissions/?partner_id=${id}` : `/partner/partner-commissions`;
  return axios.get(url);
}
export function getPartnerAllApplications(page: any, pageSize: any) {
  return axios.get(`/partner-admin/all-applications?page=${page}&per_page=${pageSize}`);
}
export function getIncompletePartnerApplications(page: any, pageSize: any) {
  return axios.get(`/partner-admin/incomplete-applications?page=${page}&per_page=${pageSize}`);
}
export function getPendingPartnerApplications(page: any, pageSize: any) {
  return axios.get(`/partner-admin/pending-applications?page=${page}&per_page=${pageSize}`);
}
export function getInProgressPartnerApplications(page: any, pageSize: any) {
  return axios.get(`/partner-admin/in-progress-applications?page=${page}&per_page=${pageSize}`);
}
export function getRejectedPartnerApplications(page: any, pageSize: any) {
  return axios.get(`/partner-admin/rejected-applications?page=${page}&per_page=${pageSize}`);
}
export function getApprovedPartnerApplications(page: any, pageSize: any) {
  return axios.get(`/partner-admin/approve-applications?page=${page}&per_page=${pageSize}`);
}
export function getCustomerInvoices(page: any, pageSize: any) {
  return axios.get(`/user/my-invoices?page=${page}&per_page=${pageSize}`);
}
export function getCustomerDashboard() {
  return axios.get(`/user/dashboard`);
}
export function getCustomerApplications(page: any, pageSize: any) {
  return axios.get(`/user/my-applications?page=${page}&per_page=${pageSize}`);
}
export function getCustomerInvoiceByApplicationID(id: any, page: any, pageSize: any) {
  return axios.get(`/user/application-related-invoices/${id}?page=${page}&per_page=${pageSize}`);
}
export function getPartnerDashboardComission() {
  return axios.get(`/partner-admin/commissions`);
}
// export function getPermissionForAllWeb(id: any) {
//   return axios.get(`/permissions/get-modules-with-permissions-by-role?role_id=${id}`);
// }

// Factoring Valley Info APIs
export function getAwnInfo(page: number = 1, per_page: number = 20, search: string = '') {
  return axios.get(`/awn-info?page=${page}&per_page=${per_page}&search=${search}`);
}
export function createAwnInfo(data: any) {
  return axios.post(`/awn-info`, data);
}
export function updateAwnInfo(id: number, data: any) {
  return axios.put(`/awn-info/${id}`, data);
}
export function deleteAwnInfo(id: number) {
  return axios.delete(`/awn-info/${id}`);
}
export function updateAwnInfoStatus(id: number) {
  return axios.put(`/awn-info/${id}/status`);
}

// Compliance Requirement APIs
export function getComplianceRequirements(page: number = 1, per_page: number = 20, search: string = '', type: string = '', category: string = '') {
  return axios.get(`/compliance-questions?page=${page}&per_page=${per_page}&search=${search}&type=${type}&category=${category}`);
}
export function createComplianceRequirement(data: any) {
  return axios.post(`/compliance-questions`, data);
}
export function updateComplianceRequirement(id: number, data: any) {
  return axios.put(`/compliance-questions/${id}`, data);
}
export function deleteComplianceRequirement(id: number) {
  return axios.delete(`/compliance-questions/${id}`);
}
export function updateComplianceRequirementStatus(id: number) {
  return axios.put(`/compliance-requirements/${id}/status`);
}

// Block Code Management APIs
export function getBlockCodes(page: number = 1, per_page: number = 20, search: string = '', type: string = '', status: string = '') {
  return axios.get(`/block-codes?page=${page}&per_page=${per_page}&search=${search}&type=${type}&status=${status}`);
}
export function getBlockCodeById(id: number) {
  return axios.get(`/block-codes/${id}`);
}
export function getBlockCodesByType(type: string) {
  return axios.get(`/block-codes/type/${type}`);
}
export function createBlockCode(data: any) {
  return axios.post(`/block-codes`, data);
}
export function updateBlockCode(id: number, data: any) {
  return axios.put(`/block-codes/${id}`, data);
}
export function deleteBlockCode(id: number) {
  return axios.delete(`/block-codes/${id}`);
}

// Block Entities API
export function getBlockEntities(page: number = 1, per_page: number = 15) {
  return axios.get(`/block-entities?per_page=${per_page}&page=${page}`);
}

// Devices API
export function getDevices(page: number, per_page: number) {
  return axios.get(`https://uat-v2-api.awn-sa.com/los/api/v2/dashboard/devices?page=${page}&per_page=${per_page}`);
}
export function getWealthRanges(page?: number, per_page?: number, search?: string) {
  const params = new URLSearchParams();
  params.append('page', String(page || 1));
  params.append('per_page', String(per_page || 20));
  if (search) params.append('search', search);
  return axios.get(`/wealth-ranges?${params.toString()}`);
}
export function getWealthRangesById(id: any) {
  return axios.get(`/wealth-ranges/${id}`);
}
export function createWealthRange(body: any) {
  return axios.post(`/wealth-ranges`, body);
}
export function updateWealthRange(id: any, body: any) {
  return axios.put(`/wealth-ranges/${id}`, body);
}
export function deleteWealthRange(id: any) {
  return axios.delete(`/wealth-ranges/${id}`);
}
export function getWealthRangesTypes() {
  return axios.get(`/wealth-ranges/types`);
}
export function getListOfValues() {
  return axios.get(`/list-of-values?page=1&per_page=50`);
}
export function getListOfValueById(id: any) {
  return axios.get(`/list-of-values/${id}`);
}
export function deleteListOfValues(id: any) {
  return axios.delete(`/list-of-values/${id}`);
}
export function createListOfValue(body: any) {
  return axios.post(`/list-of-values`, body);
}
export function updateListOfValue(id: any, body: any) {
  return axios.put(`/list-of-values/${id}`, body);
}
export function changeStatusListOfValue(id: any, body: any) {
  return axios.post(`/list-of-values/status/${id}`, body);
}
export function blockUserWithBlockCode(body: any) {
  return axios.post(`/user-blocks/block`, body);
}
export function unblockUserWithBlockCode(body: any) {
  return axios.post(`/user-blocks/unblock`, body);
}
export function getUserBlocksByUserId(user_id: any) {
  return axios.get(`/user-blocks/user/${user_id}`);
}
export function getBlockHistory(page: number = 1, per_page: number = 15, search: string = '', action: string = '', from: string = '', to: string = '') {
  let url = `/user-blocks/history?page=${page}&per_page=${per_page}`;
  if (search) url += `&search=${search}`;
  if (action) url += `&action=${action}`;
  if (from) url += `&from=${from}`;
  if (to) url += `&to=${to}`;
  return axios.get(url);
}
export function changeUserStatus(userId: number, body: any) {
  return axios.patch(`/change-user-status`, body);
}
export function userActive(userId: number, body: any) {
  return axios.patch(`/update-user-status`, body);
}
export function updateKycRisk(body: any) {
  return axios.patch(`/update-kyc-risk`, body);
}

export function getLosDashboardStatistics(fromDate?: string, toDate?: string) {
return axios.get(`/v1/dashboard/stats?fromDate=${fromDate}&toDate=${toDate}`);
}
export function getContractTemplates() {
  return axios.get(`https://uat-v2-api.awn-sa.com/los/api/v2/contract-templates`);
  }
  export function createContractTemplate(body: any) {
    return axios.post(`https://uat-v2-api.awn-sa.com/los/api/v2/contract-templates`, body);
  }
  export function deleteContractTemplate(id: any) {
    return axios.delete(`https://uat-v2-api.awn-sa.com/los/api/v2/contract-templates/${id}`);
  }
  export function updateContractTemplate(id: any, body: any) {
    return axios.put(`https://uat-v2-api.awn-sa.com/los/api/v2/contract-templates/${id}`, body);
  }

  export function getLOVsByType(type: any, page?: number, per_page?: number, search?: string) {
    const params = new URLSearchParams();
    params.append('type', type);
    params.append('page', String(page || 1));
    params.append('per_page', String(per_page || 50));
    if (search) params.append('search', search);
    return axios.get(`/list-of-values?${params.toString()}`);
  }

  export function getComplianceQuestionTypes() {
    return axios.get(`/compliance-questions/types/list`);
  }
  export function getFactors(page: number = 1, per_page: number = 50) {
    return axios.get(`/factors?page=${page}&per_page=${per_page}`);
  }
  export function importProfessions(body: FormData) {
    // Create a custom axios instance for this request to bypass the interceptor's Content-Type
    const customAxios = Axios.create({
      baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL,
    });
    customAxios.interceptors.request.use((reqConfig) => {
      const config = { ...reqConfig };
      const token = (store.getState() as any).block.token;
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
        // Don't set Content-Type for FormData - let axios handle it automatically
      }
      return config;
    });
    return customAxios.post(`/professions/import`, body);
  }
  export function exportLeads() {
    return axios.get(`/crm/leads/export`, {
      responseType: 'blob',
    });
  }
  export function exportPepCustomers() {
    return axios.get(`/crm/pep-customers/export`, {
      responseType: 'blob',
    });
  }
  export function exportHighRiskUsers() {
    return axios.get(`/crm/high-risk-users/export`, {
      responseType: 'blob',
    });
  }
  export function exportRejectedUsers() {
    return axios.get(`/crm/rejected-users/export`, {
      responseType: 'blob',
    });
  }
  export function exportOpportunities() {
    return axios.get(`/crm/opportunities/export`, {
      responseType: 'blob',
    });
  }

  export function getAllCustomersWithStatuses(page: number = 1, per_page: number = 20, search: string = '') {
    let url = `/customers/users?page=${page}&per_page=${per_page}`;
    if (search) url += `&search=${search}`;
    return axios.get(url);
  }

  export function getReschedulingDocuments(product_id: number) {
    return axios.get(`/mobile/loan-application/product/${product_id}/required-documents`);
  }

  export function createBlockEntity(body: any) {
    return axios.post(`/block-entities/block`, body);
  }
  export function getBlockCodeTypes() {
    return axios.get(`/block-entities/types`);
  }
  export function getBlockEntityById(id: number) {
    return axios.get(`/block-entities/${id}`);
  }
  export function updateBlockEntity(id: number, body: any) {
    return axios.put(`/block-entities/${id}`, body);
  }
  export function deleteBlockEntity(id: number) {
    return axios.delete(`/block-entities/${id}`);
  }
  export function handleReschedulingRequest(loan_application_id: number, rescheduling_request_id: number,body: any) {
    return axios.post(`/mobile/loan-application/${loan_application_id}/rescheduling-request/${rescheduling_request_id}/action`, body);
  }
  export function getReschedulingRequestDetails(loan_application_id: number) {
    return axios.get(`/mobile/loan-application/${loan_application_id}/rescheduling-request`);
  }
  export function updateDocStatus(document_id: number, body: any) {
    return axios.put(`/mobile/loan-application/rescheduling-request/update-documents-status/${document_id}`, body);
  }
  const buildQueryString = (params: Record<string, any>): string => {
    const queryParams = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== "")
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    return queryParams ? `?${queryParams}` : "";
  };
  export function getAllProducts(page?: any, per_page?: any) {
    const params: Record<string, any> = {
      page,
      per_page,
    };
    return axios.get(`/v1/product${buildQueryString(params)}`);
  }