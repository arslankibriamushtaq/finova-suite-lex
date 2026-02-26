export interface ApisState {
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
  theme: any;
  dashboardStructure: any;
  compilanceDashboard: any;
  actionBoard: any;
  notificationStructure: any;
  toggled: boolean;
  subscribeData: any;
  product: boolean;
  business: boolean;
  payment: boolean;
  password: boolean;
  individualCustomer: any;
  prodId: any;
  payInvoices: any;
  cities: any;
  countries: any;
  languages: any;
  relations: any;
  states: any;
  fromFilter: any;
  toFilter: any;
  token: any;
  productData?: any | null;
  userProductData:any;
  crResponse: any;
  dob: any;
  productDetails: any;
  businessDetails: any;
  businessFormData: any;
  applicationNo: any;
  userId: any;
  requiredDocuments: any;
  nid: any;
  crNumber: any;
  refreshToken: any;
  permissions: any;
  /**
   * Temporary storage for the selected Application row when user clicks "Broken Promise"
   * in Application Management, so Broken Promises page can use these IDs without
   * calling Application APIs on mount.
   */
  selectedPromiseApplication?: any | null;
}
