import axiosFactoring from "../../utils/axiosFactoring";

export function getUserProductDetails(id: any) {
  return axiosFactoring.get(`v1/application/product-details?product_id=${id}`);
}
export function getProductsListing(){
  return axiosFactoring.get(`v1/application/products-listing`);
}
export function verifyBusiness(body: any) {
  return axiosFactoring.post("v1/application/verify-business", body);
}
export function verifyEmail(body: any) {
  return axiosFactoring.post("v1/application/email-verification", body);
}
export function verifyOtp(body: any) {
  return axiosFactoring.post("v1/application/verify-otp", body);
}
export function orbitSmsOtp(body: any) {
  return axiosFactoring.post("v1/application/send-orbit-sms-otp", body);
}
export function getComplianceQuestions(){
  return axiosFactoring.get("v1/compliance-questions");
}
export function storeComplianceAnswers(body: any) {
  return axiosFactoring.post("v1/compliance-answers/multiple", body);
}
export function validateFactoringAmount(body: any) {
  return axiosFactoring.post("v1/application/validate-factoring-amount", body);
}
export function storeFactoringInfo(body: any) {
  return axiosFactoring.post("v1/application/store-factoring-information", body);
}
export function getRequiredDocuments(id:any){
  return axiosFactoring.get(`v1/products/documents/application?product_id=${id}`)
}
export function storeRequiredDocuments(body: any) {
  return axiosFactoring.post("v1/products/documents/store", body);
}
export function verifyIBAN(body: any) {
  return axiosFactoring.post("v1/application/iban-verification", body);
}
export function submitApplication(body: any) {
  return axiosFactoring.post(`v1/application/submit-application`, body);
}
export function login(body: any) {
  return axiosFactoring.post(`v1/los-login`, body);
}
export function getDepartments(page: any, per_page: any){
  return axiosFactoring.get(`/v1/departments?page=${page}&records_per_page=${per_page}`);
}
export function storeDepartment(body: any) {
  return axiosFactoring.post(`/v1/departments/store`, body);
}
export function updateDefaultDepartment(id: any){
  return axiosFactoring.patch(`/v1/departments/update-default-department/${id}`);
}
export function updateDepartmenStatus(body: any){
  return axiosFactoring.patch(`/v1/departments/change-department-status`, body);
}
export function getDepartmentPermissions(){
  return axiosFactoring.get(`/v1/departments/permissions`);
}
export function getPermissionByDepartment(id: any){
  return axiosFactoring.get(`/v1/departments/get-department-permissions?department_id=${id}`);
}
export function storeDepartmentPermissions(body: any){
  return axiosFactoring.post(`/v1/departments/store-department-permissions`, body);
}
export function getRoles(page?: any, size?: any, search?: string){
  const parts: string[] = [];
  if (page !== undefined) parts.push(`page=${encodeURIComponent(page)}`);
  if (size !== undefined) parts.push(`size=${encodeURIComponent(size)}`);
  if (search) parts.push(`search=${encodeURIComponent(search)}`);
  const qs = parts.length ? `?${parts.join("&")}` : "";
  return axiosFactoring.get(`/identity-service/api/v1/roles${qs}`);
}
export function getRole(id: any){
  return axiosFactoring.get(`/identity-service/api/v1/roles/${id}`);
}
export function saveRole(body: any){
  return axiosFactoring.post(`/identity-service/api/v1/roles`, body);
}
export function updateRole(id: any, body: any){
  return axiosFactoring.put(`/identity-service/api/v1/roles/${id}`, body);
}
export function deleteRole(id: any){
  return axiosFactoring.delete(`/identity-service/api/v1/roles/${id}`);
}
export function getEmployees(page?: any, size?: any, search?: string){
  const parts: string[] = [];
  if (page !== undefined) parts.push(`page=${encodeURIComponent(page)}`);
  if (size !== undefined) parts.push(`size=${encodeURIComponent(size)}`);
  if (search) parts.push(`search=${encodeURIComponent(search)}`);
  const qs = parts.length ? `?${parts.join("&")}` : "";
  return axiosFactoring.get(`/identity-service/api/v1/employees${qs}`);
}
export function storeEmployee(body: any){
  return axiosFactoring.post(`/identity-service/api/v1/employees`, body);
}
export function updateEmployee(id: any, body: any){
  return axiosFactoring.put(`/identity-service/api/v1/employees/${id}`, body);
}
export function deleteEmployee(id: any){
  return axiosFactoring.delete(`/identity-service/api/v1/employees/${id}`);
}
export function getRolePermission() {
  return axiosFactoring.get(`/identity-service/api/v1/permissions`);
}
export function addRolePermissions(body: { role: string | number; permissions: (string | number)[] }) {
  return axiosFactoring.post("/v1/permissions/save-permission", body);
}
export function getPermissionByRole(id: any) {
  return axiosFactoring.get(`/identity-service/api/v1/permissions/role/${id}`);
}
/**
 * The caller's own effective permissions, resolved from the bearer token.
 *
 * Needed because not every user has a LOS role row: a Keycloak-only account
 * (the LEX underwriters) authenticates with `roleId: null`, and there is no id
 * to ask `/permissions/role/{id}` about. The server can still answer "what may
 * *you* do" from the token's realm roles.
 */
export function getPermissionsForCaller() {
  return axiosFactoring.get(`/identity-service/api/v1/permissions`);
}
export function assignPermissionToRole(roleId: string, permissionId: string) {
  return axiosFactoring.post(`/identity-service/api/v1/permissions/role/${roleId}/assign/${permissionId}`);
}
export function unassignPermissionFromRole(roleId: string, permissionId: string) {
  return axiosFactoring.delete(`/identity-service/api/v1/permissions/role/${roleId}/assign/${permissionId}`);
}
export function syncRolePermissions(roleId: string, permissionIds: string[]) {
  return axiosFactoring.put(`/identity-service/api/v1/permissions/role/${roleId}/sync`, { permissionIds });
}
export function forgetPassword(body: any) {
  return axiosFactoring.post(`/v1/forgot-password`, body);
}
export function resetPassword(body: FormData) {
  return axiosFactoring.post(`/v1/reset-password`, body);
}
export function getUserProductsListing(id: any) {
  return axiosFactoring.get(`application/get-product-partners/${id}`);
}
export function getProductTypeListing() {
  return axiosFactoring.get(`application/product-type-listing`);
}
export function createBuisnessPartner(body: any) {
  return axiosFactoring.post(`/application/business-info`, body);
}
export function createAuthorizedInfo(body: any) {
  return axiosFactoring.post(`application/absher-otp`, body);
}
export function otpVerification(body: any) {
  return axiosFactoring.post(`/application/otp-verification`, body);
}
export function complianceInfo(body: FormData) {
  return axiosFactoring.post(`/application/compliance-info`, body);
}
export function uploadApplicationDoc(body: any) {
  return axiosFactoring.post(`/application/application-documents`, body);
}
export function verifyConsumer(body: any) {
  return axiosFactoring.post(`/application/consumer-verification`, body);
}
export function disclaimerTextStep(body: any) {
  return axiosFactoring.post(`application/product-disclaimer-text`, body);
}
export function getSummary(body: any) {
  return axiosFactoring.post(`application/show-factoring-application-summary`, body);
}
export function createPartner(body: any) {
  return axiosFactoring.post(`/partner`, body);
}
export function getCountries(page: number = 1, per_page: number = 100, search?: string) {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
  return axiosFactoring.get(`/countries?page=${page}&per_page=${per_page}${searchParam}`);
}
export function generateUnifonicOtp(body: any) {
  return axiosFactoring.post(`/application/unifonic-otp`, body);
}
export function createNafathRequest(body: any) {
  return axiosFactoring.post(`/application/nafath-request`, body);
}
export function nafathRequestStatus(body: any) {
  return axiosFactoring.post(`/application/nafath-status`, body);
}