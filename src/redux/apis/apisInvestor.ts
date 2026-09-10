// Simple API utility functions using fetch
import { v4 as uuidv4 } from 'uuid';
import { store } from '../store';
import { clearAdminSession } from '../../utils/adminSession';
import { redirectToLogin } from '../../utils/redirectToLogin';

/**
 * The bearer token lives in the persisted redux `block` slice — nothing in the
 * app ever writes a `localStorage.authToken`, so reading that key sent
 * `Bearer null` on every call from this file. Read it lazily (per request, not
 * at module load) so a login that happens after import is picked up.
 */
function getAuthToken(): string | null {
  return (store.getState() as any)?.block?.token ?? null;
}


/**
 * Every call in this file goes out over `fetch`, which has no interceptor — so
 * unlike the axios services (see utils/axios*.ts) an expired session here just
 * threw an "HTTP Error: 401" that each page swallowed into a toast, leaving the
 * user on a permanently empty Portfolio screen. Tear the admin session down and
 * send the browser to login, the same way the axios 401 handlers do.
 */
async function throwIfNotOk(response: Response): Promise<void> {
  if (response.ok) return;
  if (response.status === 401) {
    await clearAdminSession();
    redirectToLogin();
  }
  throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
}

const API_BASE_URL =`${import.meta.env.VITE_API_BASE_URL}/portfolio-service`;
const WalletAPI_BASE_URL = import.meta.env.VITE_REACT_APP_API_WALLET_URL;
const LEDGER_API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_LMS_URL;
const LOGS_API_BASE_URL = import.meta.env.VITE_REACT_APP_API_INVESTOR_URL;

// Generic API call function
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }


  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  await throwIfNotOk(response);

  return response.json();
}

// Dashboard API functions
export async function getDashboardInfo() {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: any;
    pageInfo: any;
  }>('/api/v1/AdminDashBoard/GetInformation');
}

export async function getApplicationData() {
  return apiCall('/dashboard/applicationData');
}

// Investor Dashboard API function
export async function getInvestorDashboard() {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: {
      totalInvestors: number;
      monthlyChangeInInvestors: number;
      activeInvestors: number;
      activeInvestorPercentage: number;
      totalAum: number;
      quaterlyChangeInAum: number;
      pendingKyc: number;
      investors: any;
    };
    pageInfo: any;
  }>('/api/v1/AdminDashBoard/GetInvestors');
}

// Product Dashboard API function
export async function getProductDashboard() {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: {
      totalProducts: number;
      currentQuaterProducts: number;
      activeProducts: number;
      activeProductPercentage: number;
      totalAum: number;
      quaterlyChangeInAum: number;
      outOfStockProducts: number;
    };
    pageInfo: any;
  }>('/api/v1/AdminDashBoard/GetProductDashboard');
}

// Income Range CRUD API functions
export interface IncomeRange {
  id: string;
  minimumAmount: number;
  maximumAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeRangeCreateRequest {
  minimumAmount: number;
  maximumAmount: number;
}

export interface IncomeRangeUpdateRequest {
  id: string;
  minimumAmount: number;
  maximumAmount: number;
}

export interface IncomeRangeListResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: IncomeRange[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Create Income Range
export async function createIncomeRange(data: IncomeRangeCreateRequest) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: IncomeRange;
    pageInfo: any;
  }>('/api/v1/IncomeRange/Create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update Income Range
export async function updateIncomeRange(data: IncomeRangeUpdateRequest) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: IncomeRange;
    pageInfo: any;
  }>('/api/v1/IncomeRange/Update', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Get All Income Ranges
export async function getAllIncomeRanges(page: number = 1, pageSize: number = 10) {
  return apiCall<IncomeRangeListResponse>(`/api/v1/IncomeRange/GetAll?page=${page}&pageSize=${pageSize}`);
}

// Get Income Range by ID
export async function getIncomeRangeById(id: string) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: IncomeRange;
    pageInfo: any;
  }>(`/api/v1/IncomeRange/GetById/${id}`);
}

// Delete Income Range by ID
export async function deleteIncomeRangeById(id: string) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: any;
    pageInfo: any;
  }>(`/api/v1/IncomeRange/Delete/${id}`, {
    method: 'DELETE',
  });
}

// Generic CRUD functions
export async function get<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint);
}

export async function post<T>(endpoint: string, data: any): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function put<T>(endpoint: string, data: any): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function del<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'DELETE',
  });
}

// Initial Invest CRUD API functions
export interface InitialInvest {
  id: string;
  minimumAmount: number;
  maximumAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InitialInvestCreateRequest {
  minimumAmount: number;
  maximumAmount: number;
}

export interface InitialInvestUpdateRequest {
  id: string;
  minimumAmount: number;
  maximumAmount: number;
}

export interface InitialInvestListResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: InitialInvest[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Create Initial Invest
export async function createInitialInvest(data: InitialInvestCreateRequest) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: InitialInvest;
    pageInfo: any;
  }>('/api/v1/InitialInvest/Create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update Initial Invest
export async function updateInitialInvest(data: InitialInvestUpdateRequest) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: InitialInvest;
    pageInfo: any;
  }>('/api/v1/InitialInvest/Update', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Get All Initial Invest
export async function getAllInitialInvest(page: number = 1, pageSize: number = 10) {
  return apiCall<InitialInvestListResponse>(`/api/v1/InitialInvest/GetAll?page=${page}&pageSize=${pageSize}`);
}

// Get Initial Invest by ID
export async function getInitialInvestById(id: string) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: InitialInvest;
    pageInfo: any;
  }>(`/api/v1/InitialInvest/GetById/${id}`);
}

// Delete Initial Invest by ID
export async function deleteInitialInvestById(id: string) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: any;
    pageInfo: any;
  }>(`/api/v1/InitialInvest/Delete/${id}`, {
    method: 'DELETE',
  });
}

// Investment Experience CRUD API functions
export interface InvestmentExperience {
  id: string;
  experience: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentExperienceCreateRequest {
  experience: string;
}

export interface InvestmentExperienceUpdateRequest {
  id: string;
  experience: string;
}

export interface InvestmentExperienceListResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: InvestmentExperience[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Create Investment Experience
export async function createInvestmentExperience(data: InvestmentExperienceCreateRequest) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: InvestmentExperience;
    pageInfo: any;
  }>('/api/v1/InvestmentExperience/Create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update Investment Experience
export async function updateInvestmentExperience(data: InvestmentExperienceUpdateRequest) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: InvestmentExperience;
    pageInfo: any;
  }>('/api/v1/InvestmentExperience/Update', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Get All Investment Experience
export async function getAllInvestmentExperience(page: number = 1, pageSize: number = 10) {
  return apiCall<InvestmentExperienceListResponse>(`/api/v1/InvestmentExperience/GetAll?page=${page}&pageSize=${pageSize}`);
}

// Get Investment Experience by ID
export async function getInvestmentExperienceById(id: string) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: InvestmentExperience;
    pageInfo: any;
  }>(`/api/v1/InvestmentExperience/GetById/${id}`);
}

// Delete Investment Experience by ID
export async function deleteInvestmentExperienceById(id: string) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: any;
    pageInfo: any;
  }>(`/api/v1/InvestmentExperience/Delete/${id}`, {
    method: 'DELETE',
  });
}

// Investment Timeline CRUD API functions
export interface InvestmentTimeline {
  id: string;
  timeline: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentTimelineCreateRequest {
  timeline: string;
}

export interface InvestmentTimelineUpdateRequest {
  id: string;
  timeline: string;
}

export interface InvestmentTimelineListResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: InvestmentTimeline[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Create Investment Timeline
export async function createInvestmentTimeline(data: InvestmentTimelineCreateRequest) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: InvestmentTimeline;
    pageInfo: any;
  }>('/api/v1/InvestmentTimeline/Create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update Investment Timeline
export async function updateInvestmentTimeline(data: InvestmentTimelineUpdateRequest) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: InvestmentTimeline;
    pageInfo: any;
  }>('/api/v1/InvestmentTimeline/Update', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Get All Investment Timeline
export async function getAllInvestmentTimeline(page: number = 1, pageSize: number = 10) {
  return apiCall<InvestmentTimelineListResponse>(`/api/v1/InvestmentTimeline/GetAll?page=${page}&pageSize=${pageSize}`);
}

// Get Investment Timeline by ID
export async function getInvestmentTimelineById(id: string) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: InvestmentTimeline;
    pageInfo: any;
  }>(`/api/v1/InvestmentTimeline/GetById/${id}`);
}

// Delete Investment Timeline by ID
export async function deleteInvestmentTimelineById(id: string) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: any;
    pageInfo: any;
  }>(`/api/v1/InvestmentTimeline/Delete/${id}`, {
    method: 'DELETE',
  });
}

// Product CRUD API functions
export interface Product {
  id: string;
  name: string;
  type: string;
  code: string;
  expectedReturn: number;
  minimumInvestment: number;
  productCategory: number;
  description: string;
  productStatus: number;
  launchDate: string;
  investmentDuration: number;
  segmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateRequest {
  name: string;
  type: string;
  code: string;
  expectedReturn: number;
  minimumInvestment: number;
  productCategory: number;
  description: string;
  productStatus: number;
  launchDate: string;
  investmentDuration: number;
  segmentId: string;
}

export interface ProductUpdateRequest {
  id: string;
  name: string;
  type: string;
  code: string;
  productCategory: number;
  description: string;
  productStatus: number;
  launchDate: string;
  investmentDuration: number;
  segmentId: string;
}

export interface ProductListResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: Product[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface ProductConfiguration {
  id: string;
  productId: string;
  configurationName: string;
  configurationValue: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductConfigurationListResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: ProductConfiguration[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Create Product
export async function createProduct(data: ProductCreateRequest) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: Product;
    pageInfo: any;
  }>('/api/v1/Product/Create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update Product
export async function updateProduct(data: ProductUpdateRequest) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: Product;
    pageInfo: any;
  }>('/api/v1/Product/Update', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Get All Products
export async function getAllProducts(page: number = 1, pageSize: number = 10) {
  return apiCall<ProductListResponse>(`/api/v1/Product/GetAll?page=${page}&pageSize=${pageSize}`);
}

// Get Product by ID
export async function getProductById(id: string) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: Product;
    pageInfo: any;
  }>(`/api/v1/Product/GetById/${id}`);
}

// Delete Product by ID
export async function deleteProductById(id: string) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: any;
    pageInfo: any;
  }>(`/api/v1/Product/Delete/${id}`, {
    method: 'DELETE',
  });
}


// Get Product Configuration by Product ID
export async function getProductConfigurationByProductId(productId: string) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: ProductConfiguration[];
    pageInfo: any;
  }>(`/api/v1/ProductConfiguration/GetProductConfigurationByProductId/${productId}`);
}

// Get Product Configuration by ID
export async function getProductConfigurationById(configurationId: string) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: ProductConfiguration;
    pageInfo: any;
  }>(`/api/v1/ProductConfiguration/GetById/${configurationId}`);
}

// Save Product Configuration
export interface ProductConfigurationSaveRequest {
  productId: string;
  configurations: {
    configurationName: string;
    configurationValue: string;
  }[];
}

export async function saveProductConfiguration(data: ProductConfigurationSaveRequest) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: any;
    pageInfo: any;
  }>('/api/v1/ProductConfiguration/Save', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update Product Configuration
export interface ProductConfigurationUpdateRequest {
  id: string;
  productId: string;
  segmentId: string;
  currencyId: string;
  minimumInvestmentAmount: number;
  maximumInvestmentAmount: number;
  fixedPercentageAmount: number;
  investmentIncrement: number;
  investmentLimit: number;
  availableBalance?: number;
  minimumInvestmentTenure: number;
  minimumInvestmentTenureUnit: number;
  maximumInvestmentTenure: number;
  maximumInvestmentTenureUnit: number;
  earlyWithdrawalPenalty: number;
  withdrawalPercentageAtMaturity: number;
  withdrawalProcessingDays: number;
  minimumExpectedReturnPercentage: number;
  maximumExpectedReturnPercentage: number;
  profitDistributionFrequency: number;
  maximumInvestors: number;
  minimumInvestors: number;
  minimumInvestmentsPerUser: number;
  riskLevel: number;
  processingFee: number;
  vat: number;
}

export async function updateProductConfiguration(data: ProductConfigurationUpdateRequest) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: ProductConfiguration;
    pageInfo: any;
  }>('/api/v1/ProductConfiguration/Update', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Create Product Configuration
export interface ProductConfigurationCreateRequest {
  productId: string;
  segmentId: string;
  currencyId: string;
  minimumInvestmentAmount: number;
  maximumInvestmentAmount: number;
  fixedPercentageAmount: number;
  investmentIncrement: number;
  investmentLimit: number;
  availableBalance?: number;
  minimumInvestmentTenure: number;
  minimumInvestmentTenureUnit: number;
  maximumInvestmentTenure: number;
  maximumInvestmentTenureUnit: number;
  earlyWithdrawalPenalty: number;
  withdrawalPercentageAtMaturity: number;
  withdrawalProcessingDays: number;
  minimumExpectedReturnPercentage: number;
  maximumExpectedReturnPercentage: number;
  profitDistributionFrequency: number;
  maximumInvestors: number;
  minimumInvestors: number;
  minimumInvestmentsPerUser: number;
  riskLevel: number;
  processingFee: number;
  vat: number;
}

export async function createProductConfiguration(data: ProductConfigurationCreateRequest) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: any;
    pageInfo: any;
  }>('/api/v1/ProductConfiguration/Create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface ProductConfiguration {
  id: string;
  productId: string;
  segmentId: string;
  currencyId: string;
  minimumInvestmentAmount: number;
  maximumInvestmentAmount: number;
  investmentIncrement: number;
  investmentLimit: number;
  availableBalance: number;
  minimumInvestmentTenure: number;
  minimumInvestmentTenureUnit: number;
  maximumInvestmentTenure: number;
  maximumInvestmentTenureUnit: number;
  earlyWithdrawalPenalty: number;
  withdrawalPercentageAtMaturity: number;
  withdrawalProcessingDays: number;
  minimumExpectedReturnPercentage: number;
  maximumExpectedReturnPercentage: number;
  fixedPercentageAmount: number;
  profitDistributionFrequency: number;
  riskLevel: number;
  maximumInvestors: number;
  minimumInvestors: number;
  minimumInvestmentsPerUser: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductConfigurationListResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: ProductConfiguration[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export async function getAllProductConfigurations(page: number = 1, pageSize: number = 10) {
  return apiCall<ProductConfigurationListResponse>(`/api/v1/ProductConfiguration/GetAll?page=${page}&pageSize=${pageSize}`);
}

export interface ProductPortfolioCreateRequest {
  maximumLimit: number;
  minimumLimit: number;
  availableBalance: number;
  status: number;
  withdrawalLimit: number;
  maximumInvestmentAmount: number;
  riskScore: string;
  segmentId: string;
  productId: string;
}

export async function createProductPortfolio(data: ProductPortfolioCreateRequest) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: any;
    pageInfo: any;
  }>('/api/v1/ProductPortfolio/Create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteProductConfiguration(id: string) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: any;
    pageInfo: any;
  }>(`/api/v1/ProductConfiguration/Delete/${id}`, {
    method: 'DELETE',
  });
}

// Country API functions
export interface Country {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface CountryListResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: Country[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Get All Countries
export async function getAllCountries(page: number = 1, pageSize: number = 10) {
  return apiCall<CountryListResponse>(`/api/v1/Country/GetAll?page=${page}&pageSize=${pageSize}`);
}

// Currency API functions
export interface Currency {
  id: string;
  name: string;
  currencyCode: string;
  symbol: string;
  decimalPlaces: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CurrencyListResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: Currency[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Get All Currencies
export async function getAllCurrencies(page: number = 1, pageSize: number = 100) {
  return apiCall<CurrencyListResponse>(`/api/v1/Currencies/GetAll?page=${page}&pageSize=${pageSize}`);
}

// KYC and KYB API functions
export interface InvestorKyc {
  id: string;
  investorId: string;
  firstNameInEnglish: string;
  lastNameInEnglish: string;
  firstNameInArabic: string;
  lastNameInArabic: string;
  nationalId: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  lastLogin: string;
  investorLevel: number;
  twoFactorEnabled: boolean;
  countryId: string;
  employmentStatus: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvestorKyb {
  id: string;
  investorId: string;
  firstNameInEnglish: string;
  lastNameInEnglish: string;
  firstNameInArabic: string;
  lastNameInArabic: string;
  nationalId: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  countryId: string;
  employeeDesignation: number;
  companyName: string;
  companyEmail: string;
  companyAddress: string;
  companyWebsite: string;
  crNumber: string;
  unn: string;
  isLegalEntityIdentifier: boolean;
  lei: number;
  addressLine2: string;
  city: string;
  state: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvestorKycListResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: InvestorKyc[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface InvestorKybListResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: InvestorKyb[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Get All KYC Investors
export async function getAllKycInvestors(page: number = 1, pageSize: number = 10) {
  return apiCall<InvestorKycListResponse>(`/api/v1/InvestorKyc/GetAll?page=${page}&pageSize=${pageSize}`);
}

// Get All KYB Investors
export async function getAllKybInvestors(page: number = 1, pageSize: number = 10) {
  return apiCall<InvestorKybListResponse>(`/api/v1/InvestorKyb/GetAll?page=${page}&pageSize=${pageSize}`);
}

// Get KYC by Investor ID
export interface GetKycByInvestorIdResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: any;
}

export async function getKycByInvestorId(investorId: string) {
  return apiCall<GetKycByInvestorIdResponse>(`/api/v1/InvestorKyc/GetByInvestorId/${investorId}`);
}

// Get KYB by Investor ID
export interface GetKybByInvestorIdResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: any;
}

export async function getKybByInvestorId(investorId: string) {
  return apiCall<GetKybByInvestorIdResponse>(`/api/v1/InvestorKyb/GetByInvestorId/${investorId}`);
}

// Get Transaction History by Investor ID
export interface Transaction {
  id: string;
  investorId: string;
  transactionType: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface GetTransactionHistoryResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: Transaction[];
}

export async function getTransactionHistoryByInvestorId(investorId: string) {
  return apiCall<GetTransactionHistoryResponse>(`/api/v1/TransactionHistory/GetTransactionsByInvestorId/${investorId}`);
}

// KYC/KYB Approval API interfaces
export interface ApproveKycRequest {
  investorId: string;
  verificationStatus: number; // 0: Pending, 1: Verified, 2: Rejected
}

export interface ApproveKybRequest {
  investorId: string;
  verificationStatus: number; // 0: Pending, 1: Verified, 2: Rejected
}

export interface ApproveKycResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: any;
}

export interface ApproveKybResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: any;
}

// Approve KYC API
export async function approveKyc(request: ApproveKycRequest) {
  return apiCall<ApproveKycResponse>('/api/v1/InvestorKyc/ApproveKyc', {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}

// Approve KYB API
export async function approveKyb(request: ApproveKybRequest) {
  return apiCall<ApproveKybResponse>('/api/v1/InvestorKyb/ApproveKyb', {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}

// Document interfaces
export interface Document {
  id: string;
  investorId: string;
  documentType: number;
  documentName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  documentNumber: number;
  issueDate: string;
  expiryDate: string;
  verificationStatus: number;
  createdAt: string;
  updatedAt: string;
}

// Investment interfaces
export interface Investment {
  id: string;
  investorId: string;
  investorName?: string;
  productId: string;
  productName?: string;
  amount: number;
  status: string;
  createdAt: string;
  [key: string]: any;
}

export interface InvestmentListResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: Investment[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount?: number;
    totalItems?: number;
    totalPages: number;
  };
}

// Get All Investments
export async function getAllInvestments(page: number = 1, pageSize: number = 10) {
  return apiCall<InvestmentListResponse>(`/api/v1/Investment/GetAll?page=${page}&pageSize=${pageSize}`);
}

// Logs interfaces
export interface LogSource {
  channel?: string;
  level?: string;
  message?: string;
  context?: {
    request?: any;
    response?: any;
  };
  traceId?: string | null;
  nid?: string | null;
  timestamp?: string;
  "@timestamp"?: string;
  trace_id?: string;
  transaction_id?: string;
  [key: string]: any;
}

export interface LogHit {
  _index?: string;
  _id?: string;
  _score?: number | null;
  _source?: LogSource;
  sort?: number[];
}

export interface LogListResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: {
    took?: number;
    timed_out?: boolean;
    _shards?: {
      total: number;
      successful: number;
      skipped: number;
      failed: number;
    };
    hits?: {
      total?: {
        value: number;
        relation: string;
      };
      max_score?: number | null;
      hits?: LogHit[];
    };
  };
  pageInfo?: {
    page: number;
    pageSize: number;
    totalCount?: number;
    totalItems?: number;
    totalPages: number;
  };
}

// Get All Logs
export async function getAllLogs(page: number = 1, pageSize: number = 10) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  const url = `${LOGS_API_BASE_URL}/api/v1/Logs/GetLogs?${params.toString()}`;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Request-Id': uuidv4(),
    'Authorization': `Bearer ${getAuthToken()}`,
  };


  const response = await fetch(url, {
    method: 'GET',
    headers: defaultHeaders,
  });

  await throwIfNotOk(response);

  return response.json() as Promise<LogListResponse>;
}

// Update Wallet Balance interfaces
export interface UpdateWalletBalanceData {
  userId: string;
  investment: number;
  [key: string]: any;
}

export interface UpdateWalletBalanceResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  notificationMessage?: string;
}

// Generate random UUID helper function
const generateUUID = (): string => {
  if (typeof globalThis !== 'undefined' && (globalThis as any)?.crypto?.randomUUID) {
    return (globalThis as any).crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Update Wallet Balance API
export async function updateWalletBalance(data: UpdateWalletBalanceData): Promise<UpdateWalletBalanceResponse> {
  try {
    const token = getAuthToken();
    const url = `${WalletAPI_BASE_URL}/api/UserWallet/UpdateWalletBalance`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Request-Id': data.userId || generateUUID(),
      'Authorization': `Bearer ${token}`,
    };

    // Add auth token if available

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });

    await throwIfNotOk(response);

    const responseData = await response.json();
    
    // Check if the API response indicates failure
    if (responseData.success === false) {
      return {
        success: false,
        error: responseData.notificationMessage || 'Failed to update wallet balance'
      };
    }
    
    // If successful
    return {
      success: true,
      data: responseData.data || responseData,
      message: responseData.notificationMessage || 'Wallet balance updated successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.notificationMessage || error?.message || 'Failed to update wallet balance'
    };
  }
}

// Approve Investment interfaces
export interface ApproveInvestmentRequest {
  investmentId: string;
  verificationStatus: number; // 1 = Approved
}

export interface ApproveInvestmentResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: any;
}

// Approve Investment API
export async function approveInvestment(request: ApproveInvestmentRequest) {
  return apiCall<ApproveInvestmentResponse>('/api/v1/Investment/ApproveInvestment', {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}

export interface DocumentListResponse {
  success: boolean;
  data: Document[];
  totalCount: number;
  page: number;
  pageSize: number;
  notificationMessage?: string;
}

// Get All Documents
export async function getAllDocuments(page: number = 1, pageSize: number = 10) {
  return apiCall<DocumentListResponse>(`/api/v1/Document/GetAll?page=${page}&pageSize=${pageSize}`);
}

// Get Documents by Investor ID
export async function getDocumentsByInvestorId(investorId: string) {
  return apiCall<DocumentListResponse>(`/api/v1/Document/GetDocumentByInvestorId/${investorId}`);
}

/**
 * What GetDocumentByInvestorId actually returns: not a list of documents but a
 * single record with one slot per required document, each holding the id of the
 * uploaded file plus its review state. The older `Document[]` shape above is
 * what the page was written against and is not what the service sends.
 */
export interface InvestorDocumentSlots {
  nationalIdFront: string | null;
  /** 0 pending / 1 approved / 2 rejected, though some slots send the word instead. */
  nationalIdFrontStatus: string | number | null;
  nationalIdFrontExpiryDate: string | null;
  nationalIdBack: string | null;
  nationalIdBackStatus: string | number | null;
  nationalIdBackExpiryDate: string | null;
  bankStatement: string | null;
  bankStatementStatus: string | number | null;
  bankStatementExpiryDate: string | null;
  salaryCertificate: string | null;
  salaryCertificateStatus: string | number | null;
  salaryCertificateExpiryDate: string | null;
  [key: string]: string | number | null;
}

export async function getInvestorDocumentSlots(investorId: string) {
  return apiCall<{
    success: boolean;
    responseCode: number;
    notificationMessage: string;
    errors: string[] | null;
    data: InvestorDocumentSlots | null;
    pageInfo: any;
  }>(`/api/v1/Document/GetDocumentByInvestorId/${investorId}`);
}

/**
 * The bytes of one uploaded document. The endpoint is authenticated, so the
 * file cannot be handed to an <img>/<iframe> as a URL — it is fetched here and
 * handed over as a blob for the caller to turn into an object URL (and revoke).
 */
export async function getInvestorDocumentContent(
  investorId: string,
  documentId: string
): Promise<Blob> {
  const url = `${API_BASE_URL}/api/v2/investors/${investorId}/documents/${documentId}/content`;
  const headers: Record<string, string> = { Accept: '*/*', 'Request-Id': uuidv4() };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { method: 'GET', headers });
  await throwIfNotOk(response);
  return response.blob();
}

/**
 * The download endpoint, which is a different thing from the content endpoint:
 * it serves the file as an attachment and carries the stored filename in
 * Content-Disposition, so that name is parsed out and returned alongside the
 * bytes rather than the caller inventing one.
 */
export async function downloadInvestorDocument(
  documentId: string
): Promise<{ blob: Blob; fileName: string | null }> {
  const url = `${API_BASE_URL}/api/v1/Document/Download/${documentId}`;
  const headers: Record<string, string> = { Accept: '*/*', 'Request-Id': uuidv4() };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { method: 'GET', headers });
  await throwIfNotOk(response);

  const disposition = response.headers.get('Content-Disposition') || '';
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  return {
    blob: await response.blob(),
    fileName: match ? decodeURIComponent(match[1]) : null,
  };
}

// Approve Document Request
export interface ApproveDocumentRequest {
  investorId: string;
  documentId: string;
  verificationStatus: number; // 0 = Pending, 1 = Approved, 2 = Rejected
}

export interface ApproveDocumentResponse {
  success: boolean;
  notificationMessage?: string;
  errors?: string[];
}

// Approve Document
export async function approveDocument(data: ApproveDocumentRequest) {
  return apiCall<ApproveDocumentResponse>('/api/v1/Document/ApproveDocument', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// Business Share interfaces
export interface BusinessShareItem {
  investorKybId: string;
  fullName: string;
  idOrPassport: string;
  sharePercentage: number;
  countryId: string;
  isPep: boolean;
  isDirector: boolean;
  isManager: boolean;
}

export interface CreateBusinessShareRequest {
  businessShares: BusinessShareItem[];
}

export interface CreateBusinessShareResponse {
  success: boolean;
  notificationMessage?: string;
  errors?: string[];
  data?: any;
}

// Create Business Share
export async function createBusinessShare(data: CreateBusinessShareRequest) {
  return apiCall<CreateBusinessShareResponse>('/api/v1/BusinessShare/Create', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// Investor Ledger API functions
export interface InvestorLedgerItem {
  id: string;
  customer?: string;
  customerNID?: string;
  transactionDate: string;
  voucherNo?: string;
  accountCode?: string;
  account?: string;
  debit?: number;
  credit?: number;
  applicationNumber?: string;
  [key: string]: any;
}

export interface InvestorLedgerListResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: {
    ledgerListDto?: InvestorLedgerItem[];
    totalDebitAmount?: number;
    toalCreditAmount?: number;
    [key: string]: any;
  };
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount?: number;
    totalItems?: number;
    totalPages: number;
  };
}

export interface InvestorAccount {
  accountCode: string;
  accountName: string;
  [key: string]: any;
}

export interface InvestorAccountListResponse {
  success: boolean;
  responseCode: number;
  notificationMessage: string;
  errors: string[] | null;
  data: InvestorAccount[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalCount?: number;
    totalItems?: number;
    totalPages: number;
  };
}

// Get Investor Ledger List
export async function getInvestorLedgerList(
  pageNo: number = 1,
  pageSize: number = 10,
  accountCode?: string,
  fromDate?: string,
  toDate?: string
) {
  const params = new URLSearchParams({
    pageNo: pageNo.toString(),
    pageSize: pageSize.toString(),
    Channel: 'LMS',
  });

  if (accountCode) {
    params.append('AccountCode', accountCode);
  }
  if (fromDate) {
    params.append('FromDate', fromDate);
  }
  if (toDate) {
    params.append('ToDate', toDate);
  }
  const token = getAuthToken();
  const url = `${LEDGER_API_BASE_URL}/api/AccountLedger/GetInvestorLedgerList?${params.toString()}`;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Request-Id': uuidv4(),
    'Authorization': `Bearer ${token}`,
  };


  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: defaultHeaders,
  });

  await throwIfNotOk(response);

  return response.json() as Promise<InvestorLedgerListResponse>;
}

// Get Investor Accounts for dropdown
export async function getInvestorAccounts(
  PageNo: number = 1,
  PageSize: number = 10
) {
  const params = new URLSearchParams({
    PageNo: PageNo.toString(),
    PageSize: PageSize.toString(),
    Channel: 'LMS',
  });

  const url = `${LEDGER_API_BASE_URL}/api/ChartOfAccounts/GetInvestorAccounts?${params.toString()}`;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Request-Id': uuidv4(),
  };

  const token = getAuthToken();
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: defaultHeaders,
  });

  await throwIfNotOk(response);

  return response.json() as Promise<InvestorAccountListResponse>;
}
