import axios from "../../utils/axios";
import axiosLms from "../../utils/axiosLms";



const tenantId = localStorage.getItem("tenantId");

export function getAllCustomerIndividual(body: any) {
  return axiosLms.post(`/api/Individual/getall`, body);
}

export function getAllKycKyb(page: any, pageSize: any) {
  return axios.get(
    `/api/Onboarding/GetAll?pageNo=${page}&pageSize=${pageSize}`
  );
}

export function getAllInvoices(body: any) {
  return axios.get(
    `/api/Loan/GetAll?pageNo=${body?.pageNo}&pageSize=${body?.pageSize}`,
    body
  );
}
export function getAllInvoiceList(applicationNo: any, type: any) {
  return axios.get(
    `/api/Invoice/GetByApplicationId?applicationid=${applicationNo}&InvoiceType=${type}`
  );
}
export function getAccountInvoiceList(applicationNo: any) {
  return axios.get(`/api/Invoice/GetByCustomerId/${applicationNo}`);
}
export function createIndividualsEmployee(body: any) {
  return axios.post(`/api/Individual/Create`, body);
}
export function createAdress(body: any) {
  return axios.post(`/api/Address/Create`, body);
}
export function createEmployement(body: any) {
  return axios.post(`/api/Employement/Create`, body);
}
export function createPartner(body: any) {
  return axios.post(`/api/Partner/Create`, body);
}
export function getIndividualCustomerByDateRange(dateRange: any) {
  return axios.get(
    `/api/IndividualCustomer/GetIndiviualCustomersByDate?tenantId=${tenantId}&dateRange=${dateRange}`
  );
}
export function getBuisnessAndIndividualCustomerGraph() {
  return axios.get(
    `/api/Customer/GetAllBusinessAndIndividualForGraph?tenantId=${tenantId}`
  );
}
export function updateCustomerEmployment(body: any) {
  return axios.post(`/api/Employement/UpdateByIndividualId`, body);
}
export function updateCustomerAddress(body: any) {
  return axios.post(`/api/Address/UpdateByCustomerId`, body);
}
export function getDashboardInformation(body: any) {
  let url = `/api/Dashboard/GetInformation`;
  const params = [];

  if (body?.from && body.from !== 'null') {
    params.push(`from=${body.from}`);
  }
  if (body?.to && body.to !== 'null') {
    params.push(`to=${body.to}`);
  }

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  return axios.get(url);
}

export function createBussinessEmployee(body: any) {
  return axios.post(`/api/Business/Create`, body);
}

export function getAllBussinessCustomer(body: any) {
  return axiosLms.post(`/api/Business/GetAll`, body);
}

export function updateBusinessCustomerName(customerId: any, name: any) {
  return axios.put(`/api/NonMonetaryTransaction/UpdateCustomerName`, {
    customerId,
    name,
  });
}
export function updateBusinessStopCorrespondance(value: any) {
  return axios.put(
    `/api/NonMonetaryTransaction/UpdateStopCorreSpondenceStatus`,
    {
      value,
    }
  );
}

export function updateLoanInvoiceDueDate(
  invoiceId: any,
  accountID: any,
  dueDate: any
) {
  return axios.put(`/api/MonetaryTransaction/UpdateInvoiceDueDate`, {
    invoiceId,
    accountID,
    dueDate,
  });
}

export function getAllBusinessAndIndividualCustomer(page: any, pageSize: any) {
  return axios.get(
    `/api/Customer/GetAllBusinessAndIndividual?pageNo=${page}&pageSize=${pageSize}`
  );
}

// export function getAllProducts(page: any, pageSize: any) {
//   return axios.get(
//     `/api/Product/GetProducts?pageNo=${page}&pageSize=${pageSize}`
//   );
// }
export function getAllProducts(page: any, pageSize: any) {
  return axios.get(`/api/Product/GetById/${tenantId}`);
}

export function getAllCategoryType(type: any) {
  return axios.get(
    `/api/Operations/GetByTransactiontype?transactionCategory=${type}`
  );
}
export function addAccount(body: any) {
  return axios.post(`/api/AccountDetail/Create`, body);
}
export function getAllAccountDetails() {
  return axios.get(`/api/AccountDetail/GetAll`);
}
export function getIndividualByCustomerId(CustomerId: any) {
  return axios.get(`/api/Individual/getbycustomerid/${CustomerId}`);
}
export function getBussinessByCustomerId(CustomerId: any) {
  return axios.get(`/api/Business/GetByCustomerId/${CustomerId}`);
}

// export function updateIndividualCustomer(CustomerId: any, body: any) {
//   return axios.post(
//     `/api/IndividualCustomer/UpdateIndividualCustomerByCustomerId/${CustomerId}`,
//     body
//   );
// }
export function updateIndividualCustomer(CustomerId: any, body: any) {
  return axios.put(
    `/api/NonMonetaryTransaction/UpdateIndividualCustomerDetails`,
    body
  );
}
// export function updateBussinessCustomer(CustomerId: any, body: any) {
//   return axios.post(
//     `/api/BusinessCustomer/UpdateBusinessCustomerByCustomerId`,
//     body
//   );
// }

export function updateBussinessCustomer(CustomerId: any, body: any) {
  return axios.put(
    `api/NonMonetaryTransaction/UpdateBusinessCustomerDetails`,
    body
  );
}
export function getCallActivity(page: any, pageSize: any) {
  return axios.get(
    `/api/CallActivity/GetAll?pageNo=${page}&pageSize=${pageSize}`
  );
}

export function getAllComments(page: any, pageSize: any) {
  return axios.get(`/api/Comment/GetAll?pageNo=${page}&pageSize=${pageSize}`);
}

export function getAllPromises(page: any, pageSize: any) {
  return axios.get(`/api/Promise/GetAll?pageNo=${page}&pageSize=${pageSize}`);
}
export function getLanguage() {
  return axios.get(`/api/General/GetLanguage`);
}
export function getCities() {
  return axios.get(`/api/General/GetCities`);
}
export function addCallActivity(body: any) {
  return axios.post(`/api/CallActivity/Create`, body);
}

export function updateCallActivity(body: any) {
  return axios.put(`/api/CallActivity/Update`, body);
}

export function getAllReasons(page: any, pageSize: any) {
  return axios.get(
    `/api/CallReason/GetAll?pageNo=${page}&pageSize=${pageSize}`
  );
}

export function getAllResult(page: any, pageSize: any) {
  return axios.get(
    `/api/CallResult/GetAll?pageNo=${page}&pageSize=${pageSize}`
  );
}

export function getCallActivityById(id: any) {
  return axios.get(`/api/CallActivity/GetById/${id}`);
}
export function updateCallActivityById(id: any, body: any) {
  return axios.put(`/api/CallActivity/UpdateCallActivity`, body);
}

export function deleteCallActivityById(id: any) {
  return axios.post(`/api/CallActivity/Delete?id=${id}`, {});
}

export function getFieldInvastigation(page: any, pageSize: any) {
  return axios.get(
    `/api/FieldInvestigation/GetAll?pageNo=${page}&pageSize=${pageSize}`
  );
}
export function addFieldInvestigation(body: any) {
  return axios.post(`/api/FieldInvestigation/Create`, body);
}

export function getAllVerificationAgenecy() {
  return axios.get(`/api/VerificationAgency/GetAll`);
}
export function updateFieldData(body: any) {
  return axios.put(`/api/FieldInvestigation/Update`, body);
}

export function getFieldId(id: any) {
  return axios.get(`/api/FieldInvestigation/GetById/${id}`);
}
export function deleteFieldInvestigationById(id: any) {
  return axios.post(`/api/FieldInvestigation/Delete?id=${id}`, {});
}
export function getCommentById(id: any) {
  return axios.get(`/api/Comment/GetById/${id}`);
}
export function addComment(body: any) {
  return axios.post(`/api/Comment/Create`, body);
}
export function updateComment(id: any, body: any) {
  return axios.put(`/api/Comment/Update`, body);
}

export function deleteComment(id: any) {
  return axios.post(`/api/Comment/Delete?id=${id}`, {});
}
export function allState() {
  return axios.get(`/api/General/GetStates`);
}

export function addPromise(body: any) {
  return axios.post(`/api/Promise/Create`, body);
}
export function updatePromise(body: any) {
  return axios.put(`/api/Promise/Update`, body);
}
export function getPromiseById(id: any) {
  return axios.get(`/api/Promise/GetById/${id}`);
}

// Promise service (port 6009) - GetById with Request-Id = id (as per curl)
export function getAllPromisesCustomer(page: any, pageSize: any) {
  return axios.get(`/api/Promise/GetAll?pageNo=${page}&pageSize=${pageSize}`);

}
export function getPromiseDeleteId(id: any) {
  return axios.delete(`/api/Promise/Delete?id=${id}`);
}
export function getAllCountries() {
  return axios.get(`/api/General/GetCountries`);
}
export function getAccessHistory(page: any, pageSize: any) {
  return axios.get(
    `/api/AccessHistory/GetAll?pageNo=${page}&pageSize=${pageSize}`
  );
}

export function AddRefrence(body: any) {
  return axios.post(`/api/Reference/Create`, body);
}

export function getAllReference(page: any, pageSize: any) {
  return axios.get(`/api/Reference/GetAll?pageNo=${page}&pageSize=${pageSize}`);
}

export function updateRefrence(body: any) {
  return axios.put(`/api/Reference/Update`, body);
}

export function getReferenceById(Id: any) {
  return axios.get(`/api/Reference/GetById/${Id}`);
}

export function delReference(id: any) {
  return axios.delete(`/api/Reference/Delete?id=${id}`);
}
export function getAllRealations(page: any, pageSize: any) {
  return axios.get(`/api/Relation/GetAll?pageNo=${page}&pageSize=${pageSize}`);
}
/* export function createAllRelations(body: any) {
  return axios.post(`/api/Relation/CreateRelation`, body);
} */
export function createAllRelations(body: any) {
  return axios.post(`/api/Relation/Create`, body);
}
export function updateAllRelations(body: any) {
  return axios.put(`/api/Relation/Update`, body);
}
export function getAllRealationsById(id: any) {
  return axios.get(`/api/Relation/GetById?id=${id}`);
}

export function deleteRelation(id: any) {
  return axios.delete(`/api/Relation/Delete?id=${id}`);
}

export function deleteOccupation(id: any) {
  return axios.delete(`/api/Occupation/Delete?id=${id}`);
}

export function GetAllOccupations(page: any, pageSize: any) {
  return axios.get(
    `/api/Occupation/GetAll?pageNo=${page}&pageSize=${[pageSize]}`
  );
}
/* export function GetAllOccupation() {
  return axios.get(`/api/Occupation/GetAllOccupation}`);
} */
export function createOccupation(body: any) {
  return axios.post(`/api/Occupation/Create`, body);
}
export function updateOccupation(body: any) {
  return axios.put(`/api/Occupation/Update`, body);
}
export function getAllOccupationById(id: any) {
  return axios.get(`/api/Occupation/GetById/${id}`);
}
export function GetAllBusinessCategory(page: any, pageSize: any) {
  return axios.get(
    `/api/BusinessCategory/GetAll?pageNo=${page}&pageSize=${pageSize}`
  );
}
export function getAllBusinessById(id: any) {
  return axios.get(`/api/BusinessCategory/GetById/${id}`);
}
export function updateAllBusiness(body: any) {
  return axios.put(`/api/BusinessCategory/Update`, body);
}
export function createBusinessCategory(body: any) {
  return axios.post(`/api/BusinessCategory/Create`, body);
}
export function deleteBusinessCategory(id: any) {
  return axios.delete(`/api/BusinessCategory/Delete?id=${id}`);
}
export function GetAllBusinessType(page: any, pageSize: any) {
  return axios.get(
    `/api/BusinessType/GetAll?pageNo=${page}&pageSize=${pageSize}`
  );
}
export function getAllBusinessTypeById(id: any) {
  return axios.get(`/api/BusinessType/GetById/${id}`);
}
export function updateAllBusinessType(body: any) {
  return axios.put(`/api/BusinessType/Update`, body);
}
export function createBusinessType(body: any) {
  return axios.post(`/api/BusinessType/Create`, body);
}
export function deleteBusinessType(id: any) {
  return axios.delete(`/api/BusinessType/Delete?id=${id}`);
}

export function GetTotalEPF(page: any, pageSize: any) {
  return axios.get(
    `/api/BusinessTotalEPF/GetAll?pageNo=${page}&pageSize=${pageSize}`
  );
}

export function createTotalEPF(body: any) {
  return axios.post(`/api/BusinessTotalEPF/Create`, body);
}
export function getTotalEFPById(id: any) {
  return axios.get(`/api/BusinessTotalEPF/GetById/${id}`);
}
export function updateTotalEFP(body: any) {
  return axios.put(`/api/BusinessTotalEPF/Update`, body);
}
export function deleteTotalEFP(id: any) {
  return axios.delete(`/api/BusinessTotalEPF/Delete?id=${id}`);
}
export function getCallAction(page: any, pageSize: any) {
  return axios.get(
    `/api/CallAction/GetAll?pageNo=${page}&pageSize=${pageSize}`
  );
}

export function createCallAction(body: any) {
  return axios.post(`/api/CallAction/Create`, body);
}
export function getCallActionById(id: any) {
  return axios.get(`/api/CallAction/GetById/${id}`);
}
export function updateCallAction(body: any) {
  return axios.put(`/api/CallAction/Update`, body);
}

export function deleteCallAction(id: any) {
  return axios.delete(`/api/CallAction/Delete?id=${id}`);
}

export function createCallReason(body: any) {
  return axios.post(`/api/CallReason/Create`, body);
}
export function getCallReasonById(id: any) {
  return axios.get(`/api/CallReason/GetById/${id}`);
}
export function updateCallReason(body: any) {
  return axios.put(`/api/CallReason/Update`, body);
}
export function deleteCallReason(id: any) {
  return axios.delete(`/api/CallReason/Delete?id=${id}`);
}
export function createCallResult(body: any) {
  return axios.post(`/api/CallResult/Create`, body);
}
export function getCallResultById(id: any) {
  return axios.get(`/api/CallResult/GetById/${id}`);
}
export function updateCallResult(body: any) {
  return axios.put(`/api/CallResult/Update`, body);
}
export function deleteCallResult(id: any) {
  return axios.delete(`/api/CallResult/Delete?id=${id}`);
}

export function createCustomerBusinessPreferences(body: any) {
  return axios.post(
    `/api/TelecomInfo/CreateCustomerAndBussinessPreference`,
    body
  );
}

export function getAllPreferences(page: any, pageSize: any) {
  return axios.get(
    `/api/TelecomInfo/GetCustomerAndBussinessPreferences?pageNo=${page}&pageSize=${pageSize}`
  );
}

export function updateBusinessPreferneces(body: any) {
  return axios.put(
    `/api/TelecomInfo/UpdateCustomerAndBussinessPreference`,
    body
  );
}

export function createContract(body: any) {
  return axios.post(`/api/Contract/Create`, body);
}

export function getContractById(Id: any) {
  return axios.get(`/api/Contract/GetByLoanId?LoanId=${Id}`);
}

export function updateContract(id: any, body: any) {
  return axios.put(`/api/Contract/Update`, id);
}

export function getPreferencesById(id: any) {
  return axios.get(
    `/api/TelecomInfo/GetCustomerAndBussinessPrefferenceById?Id=${id}`
  );
}

export function deletePreference(id: any) {
  return axios.post(
    `/api/TelecomInfo/DeleteCustomerAndBussinessPreference?Id=${id}`
  );
}

export function getLedgerAccount(page: any, pageSize: any, searchParam: any, dates?: any) {
  const params = new URLSearchParams({
    PageNo: page,
    PageSize: pageSize,
    searchQuery: searchParam,
  });

  if (dates?.from) {
    params.append("Date", dates.from);
  }

  // if (dates?.to) {
  //   params.append("toDate", dates.to);
  // }

  return axios.get(`/ledger-service/api/v1/accounts?${params.toString()}`);
}
export function getSimahReport(period: string) {
  return axios.get(`/ledger-service/api/v1/reports/simah?period=${period}`);
}
export function getOverdueLoansReport(asOfDate: string, minDaysPastDue: number = 1, productCode: string = 'MICROFINANCE') {
  return axios.get(`/ledger-service/api/v1/reports/overdue-loans?asOfDate=${asOfDate}&minDaysPastDue=${minDaysPastDue}&productCode=${productCode}`);
}
export function getDueLoansReport(fromDate: string, toDate: string) {
  return axios.get(`/ledger-service/api/v1/reports/due-loans?fromDate=${fromDate}&toDate=${toDate}`);
}
export function getEarlySettlementReport(params?: any) {
  const filteredParams: any = {};
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key] !== "" && params[key] !== null && params[key] !== undefined) {
        filteredParams[key] = params[key];
      }
    });
  }
  const query = Object.keys(filteredParams).length > 0 ? `?${new URLSearchParams(filteredParams).toString()}` : "";
  return axios.get(`/ledger-service/api/v1/reports/early-settlement${query}`);
}
export function getWriteOffLoansReport(period: string) {
  return axios.get(`/ledger-service/api/v1/reports/write-off-loans?period=${period}`);
}
export function getTrialBalanceReport(date: string) {
  return axios.get(`/ledger-service/api/v1/reports/trial-balance?date=${date}`);
}
export function getNplReport(asOfDate: string) {
  return axios.get(`/ledger-service/api/v1/reports/npl?asOfDate=${asOfDate}`);
}
export function getJournalVouchersReport(fromDate: string, toDate: string, referenceType: string = "", status: string = "POSTED") {
  return axios.get(`/ledger-service/api/v1/reports/journal-vouchers?fromDate=${fromDate}&toDate=${toDate}&referenceType=${referenceType}&status=${status}`);
}
export function getDaybookReport(date: string) {
  return axios.get(`/ledger-service/api/v1/reports/day-book?date=${date}`);
}
export function getLedgerReport(fromDate: string, toDate: string, accountCode: string = "", accountId: string = "") {
  return axios.get(`/ledger-service/api/v1/reports/ledger?fromDate=${fromDate}&toDate=${toDate}&accountCode=${accountCode}&accountId=${accountId}`);
}
export function getCollectionsReport(fromDate: string, toDate: string) {
  return axios.get(`/ledger-service/api/v1/reports/collections?from=${fromDate}&to=${toDate}`);
}
export function getProfitRevenueReport(period: string) {
  return axios.get(`/ledger-service/api/v1/reports/profit-revenue?period=${period}`);
}
export function getCashFlowReport(date: string) {
  return axios.get(`/ledger-service/api/v1/reports/cash-flow?date=${date}`);
}
export function getCustomerStatementReport(customerId: string, paramsOrFromDate?: any, toDate?: string) {
  let queryString = "";
  if (typeof paramsOrFromDate === "string") {
    // Legacy support: getCustomerStatementReport(id, from, to)
    const p: any = {};
    if (paramsOrFromDate) p.fromDate = paramsOrFromDate;
    if (toDate) p.toDate = toDate;
    queryString = new URLSearchParams(p).toString();
  } else if (paramsOrFromDate && typeof paramsOrFromDate === "object") {
    // New style: getCustomerStatementReport(id, { fromDate, toDate })
    queryString = new URLSearchParams(paramsOrFromDate).toString();
  }
  return axios.get(`/ledger-service/api/v1/reports/customer-statement/${customerId.trim()}${queryString ? `?${queryString}` : ""}`);
}
export function getLoanDisbursementReport(paramsOrFromDate?: any, toDate?: string) {
  let query = "";
  if (typeof paramsOrFromDate === "string") {
    // Old signature: getLoanDisbursementReport(fromDate, toDate)
    const params: any = {};
    if (paramsOrFromDate) params.fromDate = paramsOrFromDate;
    if (toDate) params.toDate = toDate;
    query = new URLSearchParams(params).toString();
  } else if (paramsOrFromDate && typeof paramsOrFromDate === "object") {
    // New signature: getLoanDisbursementReport({ fromDate, toDate, productCode, ... })
    query = new URLSearchParams(paramsOrFromDate).toString();
  }
  return axios.get(`/ledger-service/api/v1/reports/loan-disbursement${query ? `?${query}` : ""}`);
}
export function getChartOfAccounts(productId?: number | string) {
  const url = productId
    ? `/api/MapChartOfAccounts/GetAll?productId=${productId}`
    : `/api/MapChartOfAccounts/GetAll`;
  return axios.get(url);
}

// COA Fields CRUD
export function getCoaFields(activeOnly: boolean = false) {
  return axios.get(`/ledger-service/api/v1/lovs/coa-fields${activeOnly ? '?activeOnly=true' : ''}`);
}

export function getCoaFieldById(id: string) {
  return axios.get(`/ledger-service/api/v1/lovs/coa-fields/${id}`);
}

export function createCoaField(data: any) {
  return axios.post(`/ledger-service/api/v1/lovs/coa-fields`, data);
}

export function updateCoaField(id: string, data: any) {
  return axios.put(`/ledger-service/api/v1/lovs/coa-fields/${id}`, data);
}

export function deactivateCoaField(id: string) {
  return axios.post(`/ledger-service/api/v1/lovs/coa-fields/${id}/deactivate`);
}

export function activateCoaField(id: string) {
  return axios.post(`/ledger-service/api/v1/lovs/coa-fields/${id}/activate`);
}
export function getGroupLedger(page: any, pageSize: any) {
  return axios.get(
    `/api/AccountLedger/GetLedgerAccountsGroups?pageNo=${page}&pageSize=${pageSize}`
  );
}

export function addGroupLedger(body: any) {
  return axios.post(`/api/AccountLedger/AddLedgerAccountGroup`, body);
}

export function addAccountLedger(body: any) {
  return axios.post(`/ledger-service/api/v1/accounts`, body);
}

export function addInvoice(body: any) {
  return axios.post(`/api/Invoice/Create`, body);
}

export function getNextInvoiceNumber() {
  return axios.get(`/api/Invoice/GetNextInvoiceNumber`);
}

export function getAccountNumber(number: any) {
  return axios.get(`/api/Invoice/GetApplicationsByAccountNumber/${number}`);
}

export function getInvoicesByApplicationID(id: any) {
  return axios.get(`/api/Invoice/GetById/${id}`);
}

export function createPaymentAdjustment(body: any) {
  return axios.post(`/api/PaymentAdjustment/Create`, body);
}

export function getAllPaymentAdjustment(page: any, pageSize: any) {
  return axios.get(
    `/api/PaymentAdjustment/GetAll?pageNo=${page}&pageSize=${pageSize}`
  );
}

export function getLoanByAccountNumber(number: any) {
  return axios.get(`/api/PaymentAdjustment//GetLoanByAccountNumber/${number}`);
}

export function getAccountLogs(CustomerId: any, page: any, pageSize: any) {
  return axios.get(
    `/api/AccountLogs/GetByCustomerId?CustomerId=${CustomerId}&PageNumber=${page}&PageSize=${pageSize}`
  );
}

export function repayManually(body: any) {
  return axios.post(`/api/Repayment/RepayInvoice`, body);
}
export function getDayBookReport(page: any, pageSize: any) {
  return axios.get(
    `/api/Reports/GetDayBook?pageNo=${page}&pageSize=${pageSize}`
  );
}

export function getLedgerList(
  page: any,
  pageSize: any,
  accountCode: any,
  fromDate: string,
  toDate: string,
  productId: any = null
) {
  const productIdParam = productId ? `&productId=${productId}` : '';
  return axios.get(
    `/api/AccountLedger/GetList?pageNo=${page}&pageSize=${pageSize}&LedgerAccountCode=${accountCode}&From=${fromDate}&To=${toDate}${productIdParam}`
  );
}
export function getTrialList(page: any, pageSize: any) {
  return axios.get(
    `/api/Reports/GetTrailBalance?pageNo=${page}&pageSize=${pageSize}`
  );
}
export function getAllReports(
  page: any,
  pageSize: any,
  status: any,
  fromdate: any,
  todate: any
) {
  return axios.get(
    `ledger-service/api/v1/reports/trial-balance?date=2026-03-30`
  );
}
export function getVauchers(body: any) {
  const params = new URLSearchParams();

  if (body.pageNo != null) params.append("pageNo", body.pageNo);
  if (body.pageSize != null) params.append("pageSize", body.pageSize);
  if (body.from) params.append("from", body.from);
  if (body.to) params.append("to", body.to);

  return axios.get(`/api/Voucher/GetAll?${params.toString()}`);
}
export function createVoucher(body: any) {
  return axios.post(`/api/Voucher/CreateVoucher`, body);
}
export function updateVoucher(body: any) {
  return axios.put(`/api/Voucher/EditVoucher`, body);
}
export function getVoucherById(id: any) {
  return axios.get(`/api/Voucher/GetVoucherById/${id}`);
}
export function deleteVoucherById(id: any) {
  return axios.get(`/api/Voucher/DeleteVoucherById/${id}`);
}
export function getAccountNumberForCollectral(id: any) {
  return axios.get(`/api/Application/GetApplicationByAccountNumber/${id}`);
}
export function getCollectrolData(page: any, pageSize: any) {
  return axios.get(
    `/api/Collateral/GetAll?pageNo=${page}&pageSize=${pageSize}`
  );
}
export function getCollectrolDataByID(id: any) {
  return axios.get(`/api/Collateral/GetById/${id}`);
}
export function createDeliquency(body: any) {
  return axios.put(`/api/Delinquency/Update`, body);
}
export function getDeliquency(id: any) {
  return axios.get(`/api/Delinquency/GetByProductId/${id}`);
}
export function updateDeliquency(body: any) {
  return axios.put(`/api/Delinquency/Update`, body);
}

// Principle based early settlement configuration
export function principleEarlySettlement(body: any) {
  return axios.post(`/api/Delinquency/PrincipleEarlySettlement`, body);
}
export function getEarlySettlement(productId: string, delinquencyId: string) {
  return axios.get(`/api/Delinquency/GetEarlySettlement?productId=${productId}&delinquencyId=${delinquencyId}`);
}
export function getNextAccountNumber() {
  return axios.get(`/api/Application/GetNextAccountNumber`);
}
export function createApplication(body: any) {
  return axios.post(`/api/Application/Create`, body);
}
export function createLoan(body: any) {
  return axios.post(`/api/Loan/Create`, body);
}
export function createLoanSchedule(body: any) {
  return axios.post(`/api/LoanSchedule/Create`, body);
}
export function getProducts() {
  return axios.get(`/api/Product/GetAll`);
}
export function getProductIndividual() {
  return axios.get(`/api/Application/GetAllIndividualUser`);
}
export function getProductBusiness() {
  return axios.get(`/api/Application/GetAllBusinessUser`);
}
export function getAllApplication(body: any) {
  const params = new URLSearchParams({
    pageNo: body?.pageNo?.toString() || "1",
    pageSize: body?.pageSize?.toString() || "10",
  });

  if (body?.searchTypes) {
    params.append("SearchTypes", body.searchTypes);
  }

  if (body?.searchQuery) {
    params.append("SearchQuery", body.searchQuery);
  }

  return axios.get(`/api/Application/GetAll?${params.toString()}`);
}


export function getLoanPaymentSchedule(loanId: any) {
  return axios.get(`/api/Application/GetLaonPaymentSchedule?LaonId=${loanId}`);
}
export function doApprove(id: any, tanent: any, status: any) {
  return axios.post(
    `/api/Invoice/ApproveLaonAndGenerateInvocies?LoanId=${id}&TenantName=${tanent}&isApproved=${status}`
  );
}
export function modifyLoanStatus(id: any, tanent: any, status: any) {
  return axios.put(
    `/api/Loan/ModifyStatus?LoanId=${id}&TenantName=${tanent}&isApproved=${status}`
  );
}
export function generateInvoices(id: any, tanent: any, status: any) {
  return axios.post(
    `/api/Invoice/GenerateInvoices?LoanId=${id}&TenantName=${tanent}&isApproved=${status}`
  );
}
export function updateApplication(body: any) {
  return axios.put(`/api/Application/UpdateLoanApplicationInLMS`, body);
}

export function MapLedgerAccount(body: any) {
  return axios.post(`/api/MapChartOfAccounts/Map`, body);
}

export function ApproveDisburseAmount(body: any) {
  return axios.post(`/api/MonetaryTransaction/DisburseApprovedAmount`, body);
}
export function waiveAmount(body: any) {
  return axios.post(`/api/MonetaryTransaction/AdjustLateFeeCharges`, body);
}
export function getLoanTimeLineDetail(loanId: any) {
  return axios.get(`/api/Application/GetLoanTimeline?LoanId=${loanId}`);
}
export function getAccountTimeLineDetail(id: any) {
  return axios.get(`/api/Customer/GetCustomerTimeline?CustomerId=${id}`);
}
export function getAllFee(body: any) {
  return axios.get(
    `/api/Fee/GetAll?pageNo=${body?.pageNo}&pageSize=${body?.pageSize}`,
    body
  );
}
export function getFeeInfo(id: any) {
  return axios.get(`/api/Fee/GetById/${id}`);
}
export function productDelete(id: any) {
  return axios.delete(`/api/Product/Delete?Id=${id}`);
}
export function updateFee(body: any) {
  return axios.put(`/api/Fee/Update`, body);
}
export function addFeeApi(body: any) {
  return axios.post(`/api/Fee/Create`, body);
}
export function getAllNotifications(id: any) {
  return axios.get(
    `/api/Notification/GetAll?UserId=${id}&PageNo=1&PageSize=1000`
  );
}
export function getAllNotificationsCount(tenantId: any) {
  return axios.get(`/api/Notification/GetUnreadCount?UserId=${tenantId}`);
}
export function updateNotification(body: any) {
  return axios.put(`/api/Notification/UpdateStatus`, body);
}
export function detailDataCustomer(id: any) {
  return axios.get(
    `/api/Notification/GetCustomerNotificationInfo?TransactionId=${id}`
  );
}
export function detailDataCustomerDisbursement(id: any) {
  return axios.get(
    `/api/Notification/GetDisburseNotificationInfo?TransactionId=${id}`
  );
}
export function getAllTransaction(id: any, page: any, pageSize: any) {
  return axios.get(
    `/api/TransactionHistory/GetAll?CustomerId=${id}&PageNo=${page}&PageSize=${pageSize}`
  );
}
export function addFeeWorkFlowApi(body: any) {
  return axios.post(`/api/WorkFlowMapping/Create`, body);
}
export function getAllWorkFlow(page: any, pageSize: any) {
  return axios.get(
    `/api/WorkFlowMapping/GetAll?PageNo=${page}&PageSize=${pageSize}`
  );
}

export function getWorkFlowInfo(id: any) {
  return axios.get(`/api/WorkFlowMapping/GetById?Id=${id}`);
}
export function deleteWorkFlowInfo(id: any) {
  return axios.delete(`/api/WorkFlowMapping/Delete?id=${id}`);
}
export function updateFWorkFlow(body: any) {
  return axios.put(`/api/WorkFlowMapping/Update`, body);
}
export function notificationApproveReject(url: any, status: any, body: any) {
  return axios.put(`${url}&IsApproved=${status}`, body);
}
export function uploadAccounts(body: any) {
  return axios.post(`/api/ChartOfAccounts/ImportFromFile`, body);
}
export function deleteChartOfAccount(id: any) {
  return axios.post(`/ledger-service/api/v1/accounts/${id}/deactivate`, {});
}
export function activateChartOfAccount(id: any) {
  return axios.post(`/ledger-service/api/v1/accounts/${id}/activate`, {});
}
export function updateAccountLedger(id: any, body: any) {
  return axios.put(`/ledger-service/api/v1/accounts/${id}`, body);
}

export function getCustomerInformation(customerType: any, searchString: any) {
  return axios.get(
    `/api/Customer/GetInformation?customerType=${customerType}&searchString=${searchString}`
  );
}
export function calculateApi(body: any) {
  return axios.post(`/api/LoanCalculator/Calculate`, body);
}
export function updateEarlySettlement(body: any) {
  return axios.put(`/api/Delinquency/Update`, body);
}
export function updateEarlySettlementconfig(body: any) {
  return axios.post(`/api/Delinquency/ConfigEarlySettlement`, body);
}
export function createDelinquencyNotifications(body: any) {
  return axios.post(`/api/DelinquencyNotifications/Create`, body);
}
export function getDeliquencybyID(productId: number | string) {
  return axios.get(`/api/DelinquencyNotifications/GetNotificationsByProductId/${productId}`);
}


export function deleteEarlySettlementConfig(body: any) {
  return axios.delete(
    `/api/Delinquency/DeleteEarlySettlementConfigration?rangeNo=${body.rangeNo}&invoiceNo=${body.invoiceNo}`
  );
}
export function getDynamicInvoiceCreation(body: any) {
  return axios.post(`/api/Repayment/GetDynamicInvoiceCreation`, body);
}
export function payDynamicInvoice(body: any) {
  return axios.post(`/api/Repayment/PayDynamicInvoice`, body);
}
export function GetProductsById(ProductId: string) {
  return axios.get(`/api/Product/GetById?ProductId=${ProductId}`);
}
export function createEmployeeRole(body: any) {
  return axios.post(`/api/Role/AddRole`, body);
}
export function editEmployeeRole(body: any) {
  return axios.post(`/api/Role/UpdateRole`, body);
}
export function getAllEmployeeRole() {
  return axios.get(`/api/Role/GetAll`);
}
export function createEmployee(body: any) {
  return axios.post(`/api/User/Create`, body);
}
export function editEmployee(body: any) {
  return axios.post(`/api/Users/EditEmployee`, body);
}
export function employeeEmailSend(email: any) {
  return axios.post(`/api/Users/SendPasswordLink?email=${email}`);
}
export function getAllEmployee() {
  return axios.get(`/api/User/GetAll`);
}
export function getSpecificEmployee(id: any) {
  return axios.get(`/api/Users/GetEmployeeById?id=${id}
  `);
}
export function deleteEmployee(id: any) {
  return axios.post(`/api/Users/DeleteEmployee?id=${id}`);
}
export function getDepartments() {
  return axios.get(`/api/Department/GetAll`);
}
export function getAllPermission() {
  return axios.get(`/api/Permission/GetAll`);
}
export function assignPermissionToRole(body: any) {
  return axios.post(`/api/AssignPermisison/AssignToRole`, JSON.stringify(body));
}
export function assignPermissionToDepartment(body: any) {
  return axios.post(
    `/api/DepartmentPermission/Assign`,
    JSON.stringify(body)
  );
}
export function updatePermissionToRole(body: any) {
  return axios.put(`/api/AssignPermisison/Update`, body);
}
export function getAllModules(page: any, pageSize: any) {
  return axios.get(`/api/Module/GetAll?pageNo=${page}&pageSize=${pageSize}`);
}
export function getPermissionsForRole(id: any) {
  return axios.get(`/api/AssignPermisison/GetById/${id}`);
}
export function createDepartment(body: any) {
  return axios.post(`/api/Department/Create`, body);
}
export function editDepartment(body: any) {
  return axios.post(`/api/Department/EditDepartment`, body);
}
export function getPermissionsForDepartment(id: any) {
  return axios.get(
    `/api/DepartmentPermission/GetById/${id}`
  );
}
export function getDepatmentRoleId(id: any) {
  return axios.get(`/api/Department/GetById/${id}`);
}
export function editDepartmentPermission(body: any) {
  return axios.put(
    `/api/DepartmentPermission/Update`,
    body
  );
}
export function getPermissionsRoleId(id: any) {
  return axios.get(`/api/Role/GetById/${id}`);
}
export function getPermissionsByRolename(body: any) {
  return axios.post(`/api/Permission/GetPermissionByRoleName`, body);
}
export function getDisburseApprovedAmountApiLogs() {
  return axios.get(`/api/DisburseApprovedAmountApiLogs/GetAll`);
}
export function postDisburseApprovedAmount(body: any) {
  return axios.post(`/api/MonetaryTransaction/DisburseApprovedAmount`, body);
}
export function deleteDisburseApprovedAmountApiLog(id: any) {
  return axios.delete(`/api/DisburseApprovedAmountApiLogs/Delete?id=${id}`);
}
export function GetAssignedPermissionByLosId(id: any) {
  return axios.get(`/api/AssignPermisison/GetAssignedPermissionByLosId${id && `/${id}`}`);
}
export function GetAllThirdPartyExpense(page: any, pageSize: any, expenseCategory: string) {
  return axios.get(`/api/ThirdPartyServicesExpense/GetAll?pageNo=${page}&pageSize=${pageSize}&expenseCategory=${expenseCategory}`);
}
export function createThirdPartyServicesExpense(body: any) {
  return axios.post(`/api/ThirdPartyServicesExpense/Create`, body);
}
export function updateThirdPartyServicesExpense(body: any) {
  return axios.put(`/api/ThirdPartyServicesExpense/Update`, body);
}

export function deleteThirdPartyServicesExpense(id: any) {
  return axios.delete(`/api/ThirdPartyServicesExpense/Delete?id=${id}`);
}

export function GetAllIndividualCustomer(page: any, pageSize: any) {
  return axios.get(`/api/Individual/GetAllIndividualCustomer?pageNo=${page}&pageSize=${pageSize}`);
}
export function GetLoanApprovalExpensesByNationalId(body: any) {
  return axios.post(`/api/ThirdPartyServicesExpense/GetLoanApprovalExpensesByNationalId`, body);
}
export function GetOnboardingExpensesByNationalId(body: any) {
  return axios.post(`/api/ThirdPartyServicesExpense/GetOnboardingExpensesByNationalId`, body);
}
export function GetAccountBlanceReport(body: any) {
  return axios.post(`/api/AccountBlanceReport/GetReport`, body);
}
export function GetCompanyData() {
  return axios.get(`/api/Company/GetAll`);
}
export function GetVatNumberData() {
  return axios.get(`/api/Vat/GetAll`);
}
export function updateVatNumber(body: any) {
  return axios.put(`/api/Vat/Update`, body);
}
export function updateCompanyData(body: any) {
  return axios.put(`/api/Company/Update`, body);
}
export function GetAvailableLogDates(page: any, pageSize: any) {
  return axios.get(`/api/ApiLogs/GetLogs?pageNo=${page}&pageSize=${pageSize}`);
}
export function getLogsBydate(date: any) {
  return axios.get(`/api/Logs/GetByDate?date=${date}`);
}
export function GetAvailableApiLogDates(page: any, pageSize: any) {
  return axios.get(`/api/ApiLogs/GetAvailableLogDates?pageNo=${page}&pageSize=${pageSize}`);
}
export function getApiLogsBydate(date: any) {
  return axios.get(`/api/ApiLogs/GetByDate?date=${date}`);
}
export function getAllApiLogs(page: number = 1, pageSize: number = 10, filters?: any) {
  let url = `/api/ApiLogs/GetLogs?pageNo=${page}&pageSize=${pageSize}`;
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        url += `&${key}=${filters[key]}`;
      }
    });
  }
  return axios.get(url);
}
export function getReconciliationStatus() {
  return axios.get('/api/Reconciliation/GetReconciliation')
}
export function GetAccountBalance() {
  return axios.get('/api/Reconciliation/GetAccountBalance')
}
export function getReconciliationAccounts() {
  return axios.get('/api/Reconciliation/GetAccounts')
}
export function getReconciliationByAccount(accountNumber: string) {
  return axios.get(`/api/Reconciliation/GetReconciliationByAccount?accountNumber=${accountNumber}`)
}
export function GetRetryByApplicationId(applicationId: any, transactionType: any) {
  return axios.get(`/api/Retry/GetByApplicationId?applicationId=${applicationId}&transactionType=${transactionType}`)
}
export function GetRetryTransaction(paymentId: any) {
  return axios.get(`/api/Retry/Retry?paymentId=${paymentId}`)
}
export function updateProductDelinquency(body: any) {
  return axios.put(`/api/Product/UpdateProductDelinquency`, body);
}
export function GetTokenFromCode(code: string) {
  return axios.get(`/api/Auth/GetToken?code=${code}`);
}
export function GetReconciliationSummary(pageData: any, body: any) {

  return axios.post(`/api/Reconciliation/GetReconciliationSummary?pageNo=${pageData.pageNo}&pageSize=${pageData.pageSize}`, body);
}
export function getPoolAcount(body: any) {
  const params = new URLSearchParams();

  if (body.pageNo != null) params.append("pageNo", body.pageNo);
  if (body.pageSize != null) params.append("pageSize", body.pageSize);
  if (body.from) params.append("from", body.from);
  if (body.to) params.append("to", body.to);

  return axios.get(`/api/Reconciliation/GetPoolAccountsReport?${params.toString()}`);
}
export function getCollectionAccount(body: any) {
  const params = new URLSearchParams();

  if (body.pageNo != null) params.append("pageNo", body.pageNo);
  if (body.pageSize != null) params.append("pageSize", body.pageSize);
  if (body.from) params.append("from", body.from);
  if (body.to) params.append("to", body.to);

  return axios.get(`/api/Reconciliation/GetCollectionReport?${params.toString()}`);
}
export function GetVatReport(body: any) {
  const params = new URLSearchParams();

  if (body.pageNo != null) params.append("pageNo", body.pageNo);
  if (body.pageSize != null) params.append("pageSize", body.pageSize);
  if (body.from) params.append("from", body.from);
  if (body.to) params.append("to", body.to);

  return axios.get(`/api/Reconciliation/GetVatReport?${params.toString()}`);
}
export function GetRevenueTransactions(body: any) {
  const params = new URLSearchParams();
  if (body.pageNo != null) params.append("pageNo", body.pageNo);
  if (body.pageSize != null) params.append("pageSize", body.pageSize);
  if (body.from) params.append("from", body.from);
  if (body.to) params.append("to", body.to);
  return axios.get(`/api/Reconciliation/GetRevenueTransactions?${params.toString()}`);
}
export function GetAllTransactionLogs(body: any) {
  const params = new URLSearchParams();
  if (body.pageNo != null) params.append("pageNo", body.pageNo);
  if (body.pageSize != null) params.append("pageSize", body.pageSize);
  if (body.from) params.append("FromDate", body.from);
  if (body.to) params.append("ToDate", body.to);
  return axios.get(`/api/Reconciliation/GetAllTransactionLogs?${params.toString()}`);
}
export function GetErrorReport(body: any) {
  const params = new URLSearchParams();
  if (body.pageNo != null) params.append("pageNo", body.pageNo);
  if (body.pageSize != null) params.append("pageSize", body.pageSize);
  if (body.from) params.append("FromDate", body.from);
  if (body.to) params.append("ToDate", body.to);
  return axios.get(`/api/Reconciliation/GetErrorReport?${params.toString()}`);
}

export function getLoanFees() {
  return axios.get(`/api/LoanFee/GetAll`);
}
export function getProductFeeByProductId(productId: string) {
  return axios.get(`/api/ProductFee/GetByProductId?productId=${productId}`)
}
export function DeleteProductFee(id: any) {
  return axios.delete(`/api/ProductFee/DeleteByProductLoanFeeId?productLoanFeeId=${id}`);
}
export function AddProductFee(body: any) {
  return axios.post(`/api/ProductFee/Create`, body);
}
export function getCommodityList(page: any, pageSize: any) {
  return axios.get(`/api/Commodity/GetAll?pageNo=${page}&pageSize=${pageSize}`);
}
export function getCommoditySupplierList(page?: number, pageSize?: number) {
  return axios.get(`api/CommoditySupplier/GetAll`);
}
export function addCommoditySupplier(body: any) {
  return axios.post(`api/CommoditySupplier/Create`, body);
}
export function updateCommoditySupplier(body: any) {
  return axios.put(`api/CommoditySupplier/Update`, body);
}
export function deleteCommoditySupplier(id: any) {
  return axios.delete(`api/CommoditySupplier/Delete/${id}`);
}
export function getCommoditySupplierById(id: any) {
  return axios.get(`api/CommoditySupplier/GetSupplierById/${id}`);
}
export function modifyPaymentStatus(body: any) {
  return axios.put(
    `/api/Loan/ModifyStatus`,
    body
  );
}
export function getRepaymentScheduleReport(params?: any) {
  // If params is a string (legacy/direct ID usage), handle it
  if (typeof params === "string") {
    if (params.includes("-") && params.length > 20) {
      return axios.get(`/ledger-service/api/v1/reports/repayment-schedule/${params}`);
    }
    // Fallback for old fromDate string
    return axios.get(`/ledger-service/api/v1/reports/repayment-schedule?fromDate=${params}`);
  }

  // New standard: Pass object with params (fromDate, toDate, page, etc.)
  const query = params ? new URLSearchParams(params).toString() : "";
  return axios.get(`/ledger-service/api/v1/reports/repayment-schedule${query ? `?${query}` : ""}`);
}
export function getDailyTransactionReport(params?: any) {
  const query = params ? new URLSearchParams(params).toString() : "";
  return axios.get(`/ledger-service/api/v1/reports/daily-transaction-summary${query ? `?${query}` : ""}`);
}
// Consolidated Loan History Report API
export function getLoanHistoryReport(params?: any) {
  // 1. Handle Legacy String ID usage
  if (typeof params === "string") {
    if (params.includes("-") && params.length > 20) {
      return axios.get(`/ledger-service/api/v1/reports/loan-history/${params}`);
    }
    return axios.get(`/ledger-service/api/v1/reports/loan-history?fromDate=${params}`);
  }

  // 2. Handle Object-based Params
  const loanId = params?.loanId;
  const filteredParams = { ...params };
  if (loanId) delete (filteredParams as any).loanId;
  
  const queryString = Object.keys(filteredParams).length > 0 
    ? `?${new URLSearchParams(filteredParams as any).toString()}` 
    : "";
    
  const endpoint = loanId 
    ? `/ledger-service/api/v1/reports/loan-history/${loanId.trim()}` 
    : `/ledger-service/api/v1/reports/loan-history`;
    
  return axios.get(`${endpoint}${queryString}`);
}
export function getLoanBalanceReport(params?: any) {
  const query = params ? new URLSearchParams(params).toString() : "";
  return axios.get(`/ledger-service/api/v1/reports/loan-balance-outstanding${query ? `?${query}` : ""}`);
}
export function getCollectionsDueReport(fromDate?: string, toDate?: string) {
  let url = `/api/Reports/CollectionsDue`;
  const params: string[] = [];
  if (fromDate) params.push(`fromDate=${fromDate}`);
  if (toDate) params.push(`toDate=${toDate}`);
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }
  return axios.get(url);
}
export function getSkippedInstallmentsReport(fromDate?: string, toDate?: string) {
  let url = `/api/Reports/SkippedInstallments`;
  const params: string[] = [];
  if (fromDate) params.push(`fromDate=${fromDate}`);
  if (toDate) params.push(`toDate=${toDate}`);
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }
  return axios.get(url);
}
export function getTopBorrowersReport(fromDate?: string, toDate?: string) {
  let url = `/api/Reports/TopBorrowers`;
  const params: string[] = [];
  if (fromDate) params.push(`fromDate=${fromDate}`);
  if (toDate) params.push(`toDate=${toDate}`);
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }
  return axios.get(url);
}
export function getCustomerAccountStatementReport(fromDate?: string, toDate?: string) {
  let url = `/api/Reports/GetCustomerStatement`;
  const params: string[] = [];
  if (fromDate) params.push(`fromDate=${fromDate}`);
  if (toDate) params.push(`toDate=${toDate}`);
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }
  return axios.get(url);
}
export function getProductWiseProfitLossReport(fromDate?: string, toDate?: string) {
  let url = `/api/Reports/ProductWiseProfitAndLoss`;
  const params: string[] = [];
  if (fromDate) params.push(`fromDate=${fromDate}`);
  if (toDate) params.push(`toDate=${toDate}`);
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }
  return axios.get(url);
}
export function getCustomerWiseProfitLossReport(fromDate?: string, toDate?: string) {
  let url = `/api/Reports/CustomerWiseProfitAndLoss`;
  const params: string[] = [];
  if (fromDate) params.push(`fromDate=${fromDate}`);
  if (toDate) params.push(`toDate=${toDate}`);
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }
  return axios.get(url);
}
export function getProductById(id: any) {
  return axios.get(`/api/Product/GetById/${id}`);
}

export function createLatePayment(body: any) {
  return axios.post(`/api/Delinquency/CreateLatePayment`, body);
}

export function createDefaultPayment(body: any) {
  return axios.post(`/api/Delinquency/CreateDefaultPayment`, body);
}
export function getDelinquencyByStatus(type: any, productId: any) {
  return axios.get(`/api/Delinquency/GetDelinquencyByStatus?DelinquencyType=${type}&ProductId=${productId}`);
}
export function updateLatePayment(body: any) {
  return axios.put(`/api/Delinquency/UpdateLatePayment`, body);
}
export function updateDefaultPayment(body: any) {
  return axios.put(`/api/Delinquency/UpdateDefaultPayment`, body);
}
export function deleteLatePayment(id: any) {
  return axios.delete(`/api/Delinquency/DeleteLatePayment?id=${id}`);
}
export function deleteDefaultPayment(id: any) {
  return axios.delete(`/api/Delinquency/DeleteDefaultPayment?id=${id}`);
}