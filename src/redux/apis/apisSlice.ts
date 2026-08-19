import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { ApisState } from "./apisInterface";

const initialState: ApisState = {
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  fromFilter: "",
  toFilter: "",
  theme: "today",
  dashboardStructure: {},
  compilanceDashboard: {},
  actionBoard: [],
  notificationStructure: {},
  toggled: false,
  subscribeData: {},
  product: false,
  business: false,
  payment: false,
  password: false,
  prodId: null,
  individualCustomer: [],
  payInvoices: {},
  cities: {},
  countries: {},
  languages: {},
  relations: {},
  states: {},
  token:"",
  productData: null,
  userProductData:"",
  crResponse: [],
  dob: "",
  productDetails: [],
  businessDetails: {
    // Supplier Information (BusinessDetails page)
    supplier_company_unn: "",
    supplier_email: "",
    supplier_national_id: "",
    supplier_dob: "",
    supplier_mobile_no: "",
    supplier_aoa: null,
    supplier_cr_document: null,
    // Buyer Information (BusinessDetails page)
    buyer_company_unn: "",
    buyer_email: "",
    buyer_national_id: "",
    buyer_dob: "",
    buyer_mobile_no: "",
    buyer_aoa: null,
    buyer_cr_document: null,
  },
  businessFormData: {
    partner_id: "",
    loan_type_id: "",
    cr_number: "",
    lei_radio: "",
    company_unn: "",
    lei: "",
    email: "",
    mobile_no: "",
  },
  applicationNo: "",
  userId: null,
  requiredDocuments: [],
  nid: "",
  crNumber: "",
  refreshToken: "",
  permissions: [],
  collapsed: false,
  selectedPromiseApplication: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initiateRequest: (state: any) => {
      state.isLoading = true;
    },
    setTheme: (state, action) => {
      state.theme = action.payload.theme;
    },
    setFromFilter: (state, action) => {
      state.fromFilter = action.payload.fromFilter;
    },
    setToFilter: (state, action) => {
      state.toFilter = action.payload.toFilter;
    },
    setDashboardStructure: (state, action) => {
      state.dashboardStructure = action.payload.data;
    },
    setIndividualCustomer: (state, action) => {
      state.individualCustomer = action.payload.individualCustomer;
    },
    setCompilanceDashboard: (state, action) => {
      state.compilanceDashboard = action.payload.compilanceData;
    },
    setSubscriptionData: (state, action) => {
      state.subscribeData = action.payload.data;
    },
    setProduct: (state, action) => {
      state.product = action.payload.product;
    },
    setPayment: (state, action) => {
      state.payment = action.payload.payment;
    },
    setPassword: (state, action) => {
      state.password = action.payload.password;
    },
    setBusiness: (state, action) => {
      state.business = action.payload.business;
    },
    setActionBoard: (state, action) => {
      state.actionBoard = action.payload.actionBoard;
    },
    setNotificationStructure: (state, action) => {
      state.notificationStructure = action.payload.notificationStructure;
    },
    setPayInvoices: (state, action) => {
      state.payInvoices = action.payload;
    },
    setProdId: (state, action) => {
      state.prodId = action.payload.prodId;
    },
    setCities: (state, action) => {
      state.cities = action.payload.cities;
    },
    setCountries: (state, action) => {
      state.countries = action.payload.countries;
    },
    setLanguages: (state, action) => {
      state.languages = action.payload.languages;
    },
    setRelations: (state, action) => {
      state.relations = action.payload.relations;
    },
    setStates: (state, action) => {
      state.states = action.payload.states;
    },
    toggleSidebar: (state) => {
      state.toggled = !state.toggled;
    },
    setToggled: (state, action) => {
      state.toggled = action.payload;
    },
    setCollapsed: (state, action) => {
      state.collapsed = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload.token;
    },
    catchError: (state: any, action: PayloadAction<any>) => {
      state.isError = true;
      state.isLoading = false;
      state.message = action.payload.message;
    },
    setProductData: (state, action: PayloadAction<any | null>) => {
      state.productData = action.payload;   
    },
    setUserProduct: (state, action) => {
      state.userProductData = action.payload;
    },
    setCrResponse: (state, action) => {
      state.crResponse = action.payload.crResponse;
    },
    setDob: (state, action: PayloadAction<string | null>) => {
    state.dob = action.payload;
  },
    setProductDetails: (state, action: PayloadAction<string | null>) => {
    state.productDetails = action.payload;
  },
    setBusinessDetails: (state, action) => {
    state.businessDetails = { ...state.businessDetails, ...action.payload };
  },
    setBusinessFormData: (state, action) => {
    state.businessFormData = { ...state.businessFormData, ...action.payload };
  },
    setApplicationNumber: (state, action) => {
    state.applicationNo = action.payload.applicationNo;
  },
    setUserId: (state, action) => {
    state.userId = action.payload.userId;
  },
    setRequiredDocuments: (state, action) => {
    state.requiredDocuments = action.payload;
  },
    setNationID: (state, action) => {
    state.nid = action.payload.nid;
  },
  setCRNumber: (state, action) => {
    state.crNumber = action.payload.crNumber;
  },
  setRefreshToken: (state, action) => {
    state.refreshToken = action.payload.refreshToken;
  },
  setPermissions: (state, action) => {
    state.permissions = action.payload;
  },
  setSelectedPromiseApplication: (state, action: PayloadAction<any | null>) => {
    state.selectedPromiseApplication = action.payload;
  },
  // Wipe the slice back to its initial values. Logout used to only clear a
  // few ad-hoc localStorage keys, leaving tokens, permissions and applicant
  // PII (nid, dob, crNumber, businessDetails) live in the store and in the
  // persisted session — readable by the next person on a shared machine.
  // Prefer `clearSession()` in src/utils/session.ts over dispatching this
  // directly; it also purges the persisted copy.
  resetSession: () => initialState,
  },
});

export const {
  catchError,
  toggleSidebar,
  initiateRequest,
  setTheme,
  setIndividualCustomer,
  setProdId,
  setPayInvoices,
  setDashboardStructure,
  setSubscriptionData,
  setProduct,
  setBusiness,
  setPassword,
  setCities,
  setCountries,
  setLanguages,
  setRelations,
  setStates,
  setFromFilter,
  setToFilter,
  setToken,
  setProductData,
  setUserProduct,
  setCrResponse,
  setDob,
  setProductDetails,
  setBusinessDetails,
  setBusinessFormData,
  setApplicationNumber,
  setUserId,
  setRequiredDocuments,
  setNationID,
  setCRNumber,
  setRefreshToken,
  setPermissions,
  setSelectedPromiseApplication,
  setCollapsed,
  resetSession,
} = authSlice.actions;

export default authSlice.reducer;
