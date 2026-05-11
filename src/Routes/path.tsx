import { createBrowserRouter } from "react-router-dom";
import Layout from "../Layout/Layout";
import NotFound from "../components/NotFound/NotFound";
import LayoutDashboard from "../Layout/LayoutDashboard";
import LayoutInvestor from "../Layout/LayoutInvestor";
import RoutetoDash from "../components/DashboardHeader/RoutetoDash";
import LandingDashboardPage from "../components/Dashboard/LandingDashboardPage";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import ThirdPartyDashboard from "../pages/ThirdPartyDashboard/ThirdPartyDashboard";
import ServicesList from "../pages/ThirdPartyDashboard/ServicesList";
import ServicesApis from "../pages/ThirdPartyDashboard/ServicesApis";
import ServicesEnvironment from "../pages/ThirdPartyDashboard/ServicesEnvironment";
import AllEnvironment from "../pages/ThirdPartyDashboard/AllEnvironment";
import EnvConfig from "../pages/ThirdPartyDashboard/EnvConfig";
import ExportCsv from "../pages/ThirdPartyDashboard/ExportCsv";
import ClientsList from "../pages/ThirdPartyDashboard/ClientsList";
import ClientRequestHistory from "../pages/ThirdPartyDashboard/ClientRequestHistory";
import AddEditClient from "../pages/ThirdPartyDashboard/AddEditClient";
import ClientAdminList from "../pages/ThirdPartyDashboard/ClientAdminList";
import AddEditClientAdmin from "../pages/ThirdPartyDashboard/AddEditClientAdmin";
import ClientRequestProd from "../pages/ThirdPartyDashboard/ClientRequestProd";
import ClientRequestDev from "../pages/ThirdPartyDashboard/ClientRequestDev";
import ClientRequestTest from "../pages/ThirdPartyDashboard/ClientRequestTest";
import ClientRequestTestDetail from "../pages/ThirdPartyDashboard/ClientRequestTestDetail";
import RequestDetail from "../pages/ThirdPartyDashboard/RequestDetail";
import RequestService from "../pages/ThirdPartyDashboard/RequestService";
import ProvidersList from "../pages/ThirdPartyDashboard/ProvidersList";
import AllProviderApis from "../pages/ThirdPartyDashboard/AllProviderApis";
import ProviderApiEnvConfig from "../pages/ThirdPartyDashboard/ProviderApiEnvConfig";
import DashboardOnboarding from "../components/DashboardHeader/DashboardOnboarding";
import AllCustomers from "../components/Customer/AllCustomers";
import LmsAllCustomers from "../pages/lmsPages/Customers/AllCustomers";
import Login from "../components/Login/login";
import VerifyOtp from "../components/Login/VerifyOtp";
import ResetPassword from "../components/Login/ResetPassword";
import SSOCallback from "../components/Login/SSOCallback";
import LayoutLogin from "../Layout/LayoutLogin";
import Leads from "../components/Customer/Leads";
import Users from "../components/UserAndRoleManagement/Users";
import Role from "../components/UserAndRoleManagement/Role";
import AddRole from "../components/UserAndRoleManagement/AddRole";
import AllRewards from "../components/Dashboard/AllRewards";
import ActivityLogs from "../components/System/Logs/ActivityLogs";
import FinancialLogs from "../components/System/Logs/FinancialLogs";
import DigittLogs from "../components/System/Logs/DigittLogs";
import SystemAudit from "../components/System/Logs/SystemAudit";
import DepartmentList from "../components/DepartmentManagement/DepartmentList";
import VendorServices from "../components/System/CommissionSlabs/VendorServices";
import Guests from "../components/UserAccountTypes/Guest";
import RelationLov from "../components/System/RelationLov";
import IBFT from "../components/Sales/IBFT";
import MobileTopup from "../components/Sales/MobileTopup";
import MobileBundle from "../components/Sales/MobileBundle";
import BusBooking from "../components/Sales/BusBooking";
import IncomeType from "../components/System/IncomeType";
import BarqLite from "../components/UserAccountTypes/BarqLite";
import BarqFlex from "../components/UserAccountTypes/BarqFlex";
import BarqPrime from "../components/UserAccountTypes/BarqPrime";
import Vendor from "../components/System/CommissionSlabs/Vendor";
import AirBooking from "../components/Sales/AirBooking";
import Referral from "../components/Dashboard/Referral";
import Faq from "../components/Campaign/Faq";
import AppVersion from "../components/System/AppVersion";
import VendorCommission from "../components/System/CommissionSlabs/VendorCommission";
import VendorComissionSlab from "../components/System/CommissionSlabs/VendorCommissionSlab";
import IncomeProof from "../components/System/IncomeProof";
import DashboardProfile from "../components/DashboardHeader/DashboardProfile";
import CampaignList from "../components/Campaign/CampaignList";
import Opportunity from "../components/Customer/Opportunity";
import OnboardCustomers from "../components/Customer/OnboardCustomers";
import ProductManagement from "../components/ProductManagement/productManagement";
import AddProduct from "../components/ProductManagement/addProduct";
import ProductCategory from "../pages/lmsPages/ProductCategory/ProductCategory";
import ProductSubCategory from "../pages/lmsPages/ProductSubCategory/ProductSubCategory";
import DepartmentsPermissions from "../components/DepartmentManagement/DepartmentsPermissions";
import RevenueSource from "../components/LOV/RevenueSource";
import MandatoryReasonRescheduling from "../components/LOV/MandatoryReasonRescheduling";
import InsuranceVendor from "../components/Dashboard/InsuranceVendor";
import AllApplication from "../components/Dashboard/AllApplications";
import AllApplicationView from "../components/Dashboard/AllApplicationView";
import ApplicationDocuments from "../components/Dashboard/ApplicationDocuments";
import ReschedulingRequest from "../components/Dashboard/ReschedulingRequest";
import ApprovedRescheduledApplications from "../components/Dashboard/ApprovedRescheduledApplications";
import FinancingPurpose from "../components/LOV/FinancingPurpose";
import ChecksTypes from "../components/LOV/ChecksTypes";
import ReasonsTypes from "../components/LOV/ReasonsTypes";
import ProductCategories from "../components/LOV/ProductCategories";
import ProductTypes from "../components/LOV/ProductTypes";
import CommodityTypes from "../components/LOV/CommodityTypes";
import PartnerList from "../components/PartnerManagement/PartnersList";
import PartnerAdminList from "../components/PartnerManagement/PartnerAdminList";
import PartnersCommission from "../components/PartnerManagement/PartnersCommission";
import AddPartner from "../components/PartnerManagement/AddPartner";
import UpdatePartner from "../components/PartnerManagement/UpdatePartner";
import AddPartnerAdmin from "../components/PartnerManagement/AddPartnerAdmin";
import UpdatePartnerAdmin from "../components/PartnerManagement/UpdatePartnerAdmin";
import PendingFinancing from "../components/Dashboard/PendingFinancing";
import InProgressFinancing from "../components/Dashboard/InProgressFinanncing";
import IncompleteFinancing from "../components/Dashboard/IncompleteFinancing";
import ApprovedFinancing from "../components/Dashboard/ApprovedFinancing";
import RejectedFinancing from "../components/Dashboard/RejectedFinancing";
import CanceledFinancing from "../components/Dashboard/CanceledFinancing";
import ActivityLogFinancing from "../components/Dashboard/ActivityLogFinancing";
import ApplicationActivityLogs from "../components/Dashboard/ApplicationActivityLogs";
import Employees from "../components/Settings/Employees";
import RoleList from "../components/Settings/RoleList";
import AssignPermissions from "../components/Settings/AssignPermissions";
import AwnInfo from "../components/Settings/AwnInfo";
import ComplianceRequirement from "../components/Settings/ComplianceRequirement";
import BlockHistory from "../components/Settings/BlockHistory";
import AllBlockCodes from "../components/BlockCodes/AllBlockCodes";
import ComplianceBlockCodes from "../components/BlockCodes/Compliance";
import AMLBlockCodes from "../components/BlockCodes/AML";
import AntiFraudBlockCodes from "../components/BlockCodes/AntiFraud";
import SanctionBlockCodes from "../components/BlockCodes/Sanction";
import AllApis from "../components/ApiManagement/AllApis";
import Logs from "../components/SystemLogs/Logs";
import LogsCms from "../pages/cmsPages/Logs/Logs";
import Dashboard from "../components/SystemLogs/Dashboard";
import LandingUserLayout from "../Layout/LandingUserLayout";
import DashboardPartner from "../components/PartnerDashboard/DashboardPartner";
import PartnerLayout from "../components/PartnerDashboard/PartnerLayout";
import PartnerApplicationView from "../components/PartnerDashboard/PartnerApplicationView";
import SupplierLayout from "../components/CustomerVerification/CustomerVerificationLayout";
import NafathVerification from "../components/CustomerVerification/NafathVerification";
import FirstTimeLogin from "../components/CustomerVerification/FirstTimeLogin";
import SelectProduct from "../components/LandingUser/SelectProduct";
import CustomerLayout from "../components/CustomerDashboard/CustomerLayout";
import DashboardCustomer from "../components/CustomerDashboard/DashboardCustomer";
import PartnerInvoice from "../components/PartnerDashboard/PartnerInvoice";
import PartnerAllApplication from "../components/PartnerDashboard/PartnerAllApplication";
import IncompletePartner from "../components/PartnerDashboard/IncompletePartner";
import InprogressApplication from "../components/PartnerDashboard/InprogressApplication";
import RejectedApplication from "../components/PartnerDashboard/RejectedApplication";
import PendingApplication from "../components/PartnerDashboard/PendingApplications";
import PendingTabs from "../components/PartnerDashboard/PendingTabs";
import PartnerApprovedApplication from "../components/PartnerDashboard/PartnerApprovedApplication";
import BusinessDetails from "../components/LandingUser/BusinessDetails";
import UserTermsandCondition from "../components/LandingUser/UserTarmsandCondition";
import FactoringInfo from "../components/LandingUser/FactoringInfo";
import PartnerApiManagement from "../components/PartnerDashboard/PartnerApiManagement";
import PartnerComission from "../components/PartnerDashboard/PartnerComission";
import PartnerOnboarding from "../components/PartnerDashboard/PartnerOnboarding";
import OtpVerification from "../components/LandingUser/Otp";
import OrbitSms from "../components/LandingUser/OrbitSms";
import ComplianceInfo from "../components/LandingUser/ComplianceInfo";
import BankingInfo from "../components/LandingUser/BankingInfo";
import Finish from "../components/LandingUser/Finish";
import PartnerManagementTabs from "../components/Dashboard/PartnerManagementTabs";
import SettingsTermsConditions from "../components/ProductManagement/settingTermsConditions";
import Settings from "../components/ProductManagement/settings";
import CommodityInfo from "../components/ProductManagement/commodityInformation";
import FeeSettings from "../components/ProductManagement/feeSettings";
import AdminFeeSlabs from "../components/ProductManagement/adminFeeSlabs";
import RequiredDoc from "../components/ProductManagement/requiredDoc";
import AdminList from "../components/ProductManagement/adminList";
import Categories from "../pages/cmsPages/Categories/Categories";
import AddAdmin from "../components/ProductManagement/addAdmin";
import CustomerApplications from "../components/CustomerDashboard/CustomerApplications";
import CompleteApplication from "../components/CustomerDashboard/CompleteApplication";
import ContractRequest from "../components/CustomerDashboard/ContractRequest";
import InvoiceByApplicationID from "../components/CustomerDashboard/InvoiceByApplicationID";
import HomePageManage from "../components/HomePageManagement/HomePageManage";
import ManagementForm from "../components/HomePageManagement/ManagementForm";
import LandingPageManage from "../components/LandinPageManagement/LandingPageManagement";
import PurposeOfFinancing from "../components/LOV/PurposeOfFinancing";
import EmploymentSector from "../components/LOV/EmploymentSector";
import SourceOfIncome from "../components/LOV/SourceOfIncome";
import SourceOfWealth from "../components/LOV/SourceOfWealth";
import SourceOfFunds from "../components/LOV/SourceOfFunds";
import TemplateTypes from "../components/LOV/TemplateTypes";
import NetWorthRanges from "../components/LOV/NetWorthRanges";
import WealthValue from "../components/LOV/WealthValue";
import ProfessionValue from "../components/LOV/ProfessionValue";
import CitiesList from "../components/LOV/CitiesList";
import MonthlyIncome from "../components/LOV/MonthlyIncome";
import BlacklistNid from "../pages/lmsPages/RiskManagement/BlacklistNid";
import BlacklistMobile from "../pages/lmsPages/RiskManagement/BlacklistMobile";
import FraudRuleManagement from "../pages/lmsPages/RiskManagement/FraudRuleManagement";
import RejectedCustomers from "../components/Customer/SanctionedCustomers";
import SmsTemplate from "../components/NotificationTemplate/SmsTemplate";
import PushTemplate from "../components/NotificationTemplate/PushTemplate";
import EmailTemplate from "../components/NotificationTemplate/EmailTemplate";
import ContractTemplate from "../components/NotificationTemplate/ContractTemplate";
import ComplianceBlock from "../components/UserBlock/ComplianceBlock";
import AntiFraud from "../components/UserBlock/AntiFraud";
import AML from "../components/UserBlock/AML";
import Sanction from "../components/UserBlock/Sanction";
import Notification from "../components/Notification/Notification";

import WorkFlowMapping from "../components/Setting/workflowMaping";
import InvoiceSetting from "../components/Setting/InvoiceSetting";
import ProductFee from "../components/Setting/ProductFee";
import Calculator from "../components/Calculator";
import LateInvoice from "../components/Loans/LateInvoice";
import ViewApplication from "../components/AllApplication/ViewApplication";
import OtherFee from "../pages/lmsPages/LoanManagement/OtherFee";
import EditProduct from "../components/Products/EditProduct";
import InvoiceManagement from "../components/Loans/InvoiceManagement";
import PayInvoices from "../components/Loans/PayInvoices";
import AccountInvoices from "../components/Loans/AccountInvoices";
import OtherInvoices from "../components/OtherInvoices/OtherInvoices";
import Invoices from "../components/Loans/Invoices";
import RetryTransaction from "../pages/lmsPages/LoanManagement/RetryTransaction";
import ApplicationManagement from "../pages/lmsPages/LoanManagement/ApplicationManagement";
import BrokenPromises from "../pages/lmsPages/LoanManagement/BrokenPromises";
import RescheduleHistory from "../pages/lmsPages/LoanManagement/RescheduleHistory";
import WaiveOffDetails from "../pages/lmsPages/LoanManagement/WaiveOffDetails";
import CreateInvoice from "../components/Loans/CreateInvoice";
import DeliquencyManagement from "../components/Products/Deliquency/DeliquencyManagement";
import RescheduleConfigManagement from "../pages/lmsPages/Settings/RescheduleConfigManagement";
import DunningPolicyManagement from "../pages/lmsPages/Settings/DunningPolicyManagement";
import WaiverRequestsManagement from "../pages/lmsPages/Collections/WaiverRequestsManagement";
import DayBook from "../components/Reports/DayBook";
import TransactionTabs from "../components/Transaction History/TransactionTabs";
import ExcessPayment from "../components/Transaction History/ExcessPayment";
import CustomerServices from "../components/Transaction History/TransactionTabs";
import AccountDocuments from "../components/CustomerManagemnt/AccountDocuments";
import CollateralManagement from "../pages/lmsPages/LoanManagement/CollateralManagement";
import CollateralManagementView from "../pages/lmsPages/LoanManagement/CollateralManagementView";
import CollateralManagementEdit from "../pages/lmsPages/LoanManagement/CollectrolManagementEdit";
import CollateralAllocation from "../pages/lmsPages/LoanManagement/CollateralAllocation";
import AccountMapping from "../components/ChartOfAccount/accountMapping";
import Coa from "../components/ChartOfAccount/coa";
import ChartOfAccountFields from "../components/ChartOfAccount/ChartOfAccountFields";
import GenerateInvoice from "../components/Loans/GenerateInvoice";
// import Days from "../components/Reports/Days";
import Buisness from "../components/Customers/Buisness";
import Individuals from "../components/Customers/Individuals";
import KycKyb from "../components/Customers/KycKyb";
import AccountLogs from "../components/Customers/AccountLogs";
import LoanPaymentSchedule from "../pages/lmsPages/LoanManagement/ViewPaymentSchedule";
import LoanDetailView from "../pages/lmsPages/LoanManagement/LoanDetailView";
import LoanInvoice from "../pages/lmsPages/LoanManagement/LoanInvoice";
import TrialBalance from "../components/Reports/TrialBalance";
import AccountFinancing from "../components/Reports/AccountFinancing";
import CollectionReport from "../components/Reports/CollectionReport";
import ProfitRevenueReport from "../components/Reports/ProfitRevenueReport";
import CashFlowReport from "../components/Reports/CashFlowReport";
import CustomerStatementReport from "../components/Reports/CustomerStatementReport";
import Loans from "../components/Reports/Loans";
import Vouchers from "../components/Reports/Vouchers";
import Ledger from "../components/Reports/Ledger";
import OverDue from "../components/Reports/OverDue";
import PerformingLoans from "../components/Reports/PerformingLoans";
import Due from "../components/Reports/Due";
import EarlySettlement from "../components/Reports/EarlySettlement";
import LoanDisbursementReport from "../components/Reports/LoanDisbursementReport";
import WriteOff from "../components/Reports/WriteOff";
import AccountReport from "../components/Reports/AccountReport";
import AccountReportsList from "../components/Reports/AccountReportsList";
import AllLogs from "../components/Logs/AllLogs";
import ApiLogs from "../components/Logs/ApiLogs";
import LogsByDate from "../components/Logs/LogsByDate";
import DisburseApprovedAmountApiLogs from "../components/Logs/DisburseApprovedAmountApiLogs";
import ThirdPartyExpense from "../components/ThirdPartyExpense/ThirdPartyExpense";
import LoanApplicationExpenses from "../components/Expenses/LoanApplicationExpenses";
import LoanApplicationExpenseDetail from "../components/Expenses/ViewLoanApplicationExpenses";
import OnboardingExpensesDetail from "../components/Expenses/ViewOnboardingExpenses";
import OnboardingExpenses from "../components/Expenses/OnboardingExpenses";
import ReconciliationDashboard from "../components/Reconciliation/ReconciliationDashboard";
import Transactions from "../components/Reconciliation/Transactions";
import OperationalExpenseTab from "../components/Reconciliation/OprationalExpensesTabs";
import ReconciliationSummary from "../components/Reconciliation/ReconciliationSummary";
import TransactionAccounts from "../components/Reconciliation/TransactionAccounts";
import ErrorReport from "../components/Reconciliation/ErrorReport";
import LayoutLms from "../Layout/LayoutLms";
import DashboardInfoGraphics from "../pages/lmsPages/Dashboard/DashboardInfoGraphics";
import DashboardInfoGraphicsCms from "../pages/cmsPages/Dashboard/DashboardInfoGraphics";
import AllTickets from "../pages/cmsPages/Tickets/AllTickets";
import Tickets from "../pages/cmsPages/Tickets/Tickets";
import MyTickets from "../pages/cmsPages/Tickets/MyTickets";
import Reports from "../pages/cmsPages/Reports/Reports";
import Priorities from "../pages/cmsPages/Priorities/Priorities";
import SubCategories from "../pages/cmsPages/SubCategories/SubCategories";
import Escalation from "../pages/cmsPages/Escalation/Escalation";
import Customers from "../pages/cmsPages/Customers/Customers";
import Application from "../pages/lmsPages/LoanManagement/Application";
import Bureau from "../pages/lmsPages/LoanManagement/Bureau";
import CommodityManagement from "../components/LMS/ComodityManagement";
import CommoditySupplier from "../components/LMS/ComoditySupplier";
import ViewCommoditySupplierData from "../components/LMS/ViewCommoditySupplierData";
import Channels from "../components/LMS/NotificationSystem/Channels";
import Languages from "../components/LMS/NotificationSystem/Languages";
import Templates from "../components/LMS/NotificationSystem/Templates";
import UsersNotification from "../components/LMS/NotificationSystem/Users";
import UserPreferences from "../components/LMS/NotificationSystem/UserPreferences";
import SystemPreferences from "../components/LMS/NotificationSystem/SystemPreferences";

import TemplateChannels from "../components/LMS/NotificationSystem/TemplateChannels";
import CalculatorSettings from "../components/WebpageManagement/CalculatorSettings";
import CalculatorTemplatePage from "../components/WebpageManagement/Calculator";
import HomePageTemplate from "../components/WebpageManagement/HomePage";
import HomePageSettings from "../components/WebpageManagement/HomePageSettings";
import CareerPage from "../components/WebpageManagement/CareerPage";
import CareerPageSettings from "../components/WebpageManagement/CareerPageSettings";
import AboutPageTemplate from "../components/WebpageManagement/AboutPage";
import AboutPageSettings from "../components/WebpageManagement/AboutPageSettings";
import LandingPage from "../components/WebPages/LandingPage";
import AboutPage from "../components/WebPages/AboutPage";
import PrivacyPolicy from "../components/WebPages/PrivacyPolicy";
import PrivacyPolicyManagement from "../components/WebpageManagement/PrivacyPolicyPage";
import PrivacyPolicySettings from "../components/WebpageManagement/PrivacyPolicySettings";
import TermsConditionsPage from "../components/WebpageManagement/TermsConditionsPage";
import TermsConditionsSettings from "../components/WebpageManagement/TermsConditionsSettings";
import TermsConditions from "../components/WebPages/TermsConditions";
//import LandingPageSettings from "../components/WebpageManagement/LandingPageSettings";

// Investor Dashboard Components
import DashboardOverview from "../pages/InvestorPages/admin/DashboardOverview";
import InvestorsList from "../pages/InvestorPages/admin/investors/InvestorsList";
import AddInvestor from "../pages/InvestorPages/admin/investors/AddInvestor";
import InvestorDetail from "../pages/InvestorPages/admin/investors/InvestorDetail";
import KycDocuments from "../pages/InvestorPages/admin/investors/KycDocuments";
import InvestorDocuments from "../pages/InvestorPages/admin/investors/InvestorDocuments";
import DocumentPreview from "../pages/InvestorPages/admin/investors/DocumentPreview";
import KycKybDetail from "../pages/InvestorPages/admin/investors/KycKybDetail";
import ProductsList from "../pages/InvestorPages/admin/products/ProductsListNew";
import ProductView from "../pages/InvestorPages/admin/products/ProductView";
import ProductConfiguration from "../pages/InvestorPages/admin/products/ProductConfiguration";
import IncomeRangeList from "../pages/InvestorPages/admin/income-ranges/IncomeRangeList";
import IncomeRangeView from "../pages/InvestorPages/admin/income-ranges/IncomeRangeView";
import InitialInvestList from "../pages/InvestorPages/admin/initial-invest/InitialInvestList";
import InvestmentExperienceList from "../pages/InvestorPages/admin/investment-experience/InvestmentExperienceList";
import InvestmentTimelineList from "../pages/InvestorPages/admin/investment-timeline/InvestmentTimelineList";
import InvestmentsList from "../pages/InvestorPages/admin/investments/InvestmentsList";
import InvestmentAdjust from "../pages/InvestorPages/admin/investments/InvestmentAdjust";
import ApproveInvestment from "../pages/InvestorPages/admin/investments/ApproveInvestment";
import InvestorLedger from "../pages/InvestorPages/admin/ledger/InvestorLedger";

import ReportsMain from "../pages/InvestorPages/admin/reports/ReportsMain";
import PLSummary from "../pages/InvestorPages/admin/reports/PLSummary";
import PortfolioAnalytics from "../pages/InvestorPages/admin/reports/PortfolioAnalytics";
import BenchmarkComparison from "../pages/InvestorPages/admin/reports/BenchmarkComparison";
import RiskMetrics from "../pages/InvestorPages/admin/reports/RiskMetrics";
import BalanceSheet from "../pages/InvestorPages/admin/reports/BalanceSheet";
import IncomeStatement from "../pages/InvestorPages/admin/reports/IncomeStatement";
import CashFlowStatement from "../pages/InvestorPages/admin/reports/CashFlowStatement";
import FeeAnalysis from "../pages/InvestorPages/admin/reports/FeeAnalysis";
import InvestorStatements from "../pages/InvestorPages/admin/reports/InvestorStatements";
import AllocationReports from "../pages/InvestorPages/admin/reports/AllocationReports";
import TransactionSummary from "../pages/InvestorPages/admin/reports/TransactionSummary";
import RegulatoryFilings from "../pages/InvestorPages/admin/reports/RegulatoryFilings";
import AllocationDashboard from "../pages/InvestorPages/admin/allocation/AllocationDashboard";
import StrategiesList from "../pages/InvestorPages/admin/allocation/StrategiesList";
import CreateStrategy from "../pages/InvestorPages/admin/allocation/CreateStrategy";
import SimulationResults from "../pages/InvestorPages/admin/allocation/SimulationResults";
import AllocationAudit from "../pages/InvestorPages/admin/allocation/AllocationAudit";
import RiskProfiles from "../pages/InvestorPages/admin/allocation/RiskProfiles";
import TicketDetails from "../pages/cmsPages/Tickets/TicketDetails";
import LeadDetails from "../components/CustomerManagemnt/LeadDetails";
import CustomerDetails from "../components/CustomerManagemnt/CustomerDetails";
import MerchantList from "../components/Merchant Management/MerchantList";
import CreateCategories from "../components/ProductManagement/createCategories";
import CreateWizerd from "../components/ProductManagement/createWizerd";
import CreateBasicInfo from "../components/ProductManagement/createBasicInfo";
import CreateComodityInfo from "../components/ProductManagement/createComodityInfo";
import CraeteProductSettings from "../components/ProductManagement/craeteProductSettings";
import CreateProductAffiliation from "../components/ProductManagement/createProductAffiliation";
import CreateRequiredDocuments from "../components/ProductManagement/createRequiredDocuments";
// import AuditLogs from "../pages/InvestorPages/admin/audit-logs/AuditLogs";
// import Notifications from "../pages/InvestorPages/admin/notifications/Notifications";
// import AdminUsers from "../pages/InvestorPages/admin/admin-users/AdminUsers";
// import SystemSettings from "../pages/InvestorPages/admin/system-settings/SystemSettings";


// Investor Dashboard Components
// import AuditLogs from "../pages/InvestorPages/admin/audit-logs/AuditLogs";
// import Notifications from "../pages/InvestorPages/admin/notifications/Notifications";
// import AdminUsers from "../pages/InvestorPages/admin/admin-users/AdminUsers";
// import SystemSettings from "../pages/InvestorPages/admin/system-settings/SystemSettings";

import CreateTicket from "../pages/cmsPages/Tickets/CreateTicket";
import ContactUs from "../components/WebPages/ContactUs";
import FinancialStatements from "../components/WebPages/FinancialStatements";
import Faqs from "../components/WebPages/Faqs";
import FaqPageManagement from "../components/WebpageManagement/FaqPage";
import FaqPageSettings from "../components/WebpageManagement/FaqPageSettings";
import FinancialStatementsPageManagement from "../components/WebpageManagement/FinancialStatementsPage";
import FinancialStatementsSettings from "../components/WebpageManagement/FinancialStatementsSettings";
import ContactUsPageManagement from "../components/WebpageManagement/ContactUsPage";
import ContactUsSettings from "../components/WebpageManagement/ContactUsSettings";
import GlobalSections from "../components/WebpageManagement/GlobalSections";
import GlobalSectionsSettings from "../components/WebpageManagement/GlobalSectionSettings";
import CountriesList from "../components/LOV/CountriesList";
import HighRiskUsers from "../components/Customer/HighRiskUsers";
import WealthRanges from "../components/LOV/WealthRanges";
import ViewWealthRanges from "../components/LOV/ViewWealthRanges";
import ListOfValues from "../components/LOV/ListOfValues";
import ViewListOfValues from "../components/LOV/ViewListOfValues";
import InvestorLogs from "../pages/InvestorPages/admin/logs/InvestorLogs";
import SimahReport from "../components/Reports/SimahReport";
import PepBlockCodes from "../components/Customer/PepBlockCodes";
import BlockedDevices from "../components/CustomerManagemnt/BlockedDevices";
import Devices from "../components/CustomerManagemnt/Devices";
import LoanTimeline from "../components/Customers/LoanTimeline";
import SanctionedCustomers from "../components/Customer/SanctionedCustomers";
import FactorsList from "../components/LOV/FactorsList";
import LoanDisbursmentReport from "../components/Reports/LoanDisbursmentReport";
import RepaymentScheduleReport from "../components/Reports/RepaymentScheduleReport";
import DailyTransactionSummary from "../components/Reports/DailyTransactionSummary";
import LoanBalanceReport from "../components/Reports/LoanBalanceReport";
import LoanHistoryReport from "../components/Reports/LoanHistoryReport";
import CustomerAccountStatement from "../components/Reports/CustomerAccountStatement";
import CollectionsDueReport from "../components/Reports/CollectionsDueReport";
import SkippedInstallmentsReport from "../components/Reports/SkippedInstallmentsReport";
import ProductPerformanceReport from "../components/Reports/ProductPerformanceReport";
import TopBorrowersReport from "../components/Reports/TopBorrowersReport";
import ProductWiseProfitLoss from "../components/Reports/ProductWiseProfitLoss";
import CustomerWiseProfitLoss from "../components/Reports/CustomerWiseProfitLoss";
import AllCustomerStatus from "../components/Customer/AllCustomerStatus";
import OptionalReasonRescheduling from "../components/LOV/OptionalReasonRescheduling";
import CustomerVerificationLayout from "../components/CustomerVerification/CustomerVerificationLayout";
import DeviceManagement from "../pages/lmsPages/RiskManagement/DeviceManagement";
import CreditScoringDefinitions from "../components/LOV/CreditScoringDefinitions";
import ApprovalConditions from "../components/LOV/ApprovalConditions";

// import AuditLogs from "../pages/InvestorPages/admin/audit-logs/AuditLogs";
// import Notifications from "../pages/InvestorPages/admin/notifications/Notifications";
// import AdminUsers from "../pages/InvestorPages/admin/admin-users/AdminUsers";
// import SystemSettings from "../pages/InvestorPages/admin/system-settings/SystemSettings";


// Investor Dashboard Components
// import AuditLogs from "../pages/InvestorPages/admin/audit-logs/AuditLogs";
// import Notifications from "../pages/InvestorPages/admin/notifications/Notifications";
// import AdminUsers from "../pages/InvestorPages/admin/admin-users/AdminUsers";
// import SystemSettings from "../pages/InvestorPages/admin/system-settings/SystemSettings";

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: "login",
        element: <LayoutLogin />,
        children: [{ path: "", element: <Login /> }],
      },
      {
        path: "verify-otp",
        element: <LayoutLogin />,
        children: [{ path: "", element: <VerifyOtp /> }],
      },
      {
        path: "reset-password",
        element: <LayoutLogin />,
        children: [{ path: "", element: <ResetPassword /> }],
      },
      {
        path: "callback",
        element: <LayoutLogin />,
        children: [{ path: "", element: <SSOCallback /> }],
      },
    ],
  },
  // {
  //   path: "",
  //   element: <LandingPage />,
  // },
  {
    path: "",
    element: <ManagementForm />,
  },

  {
    path: "/About",
    element: <AboutPage />,
  },
  {
    path: "/Contact",
    element: <ContactUs />,
  },
  {
    path: "/privacy-policy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/Terms",
    element: <TermsConditions />,
  },
  {
    path: "/Faq",
    element: <Faqs />,
  },
  {
    path: "/financial-statements",
    element: <FinancialStatements />,
  },


  {
    element: <PrivateRoute />,
    children: [
      {
        path: "",
        element: <LayoutDashboard />,
        children: [
          { path: "", element: <RoutetoDash /> },
          { path: "/LOS/Dashboard", element: <LandingDashboardPage /> },
         
          // { path: "/LOS/ApplicationBoard", element: <ApplicationBoard /> },
          { path: "/LOS/ProductManagement", element: <ProductManagement /> },
          { path: "/LOS/ProductManagement/Categories", element: <CreateCategories /> },
          { path: "/LOS/ProductManagement/Wizerd", element: <CreateWizerd /> },
          { path: "/LOS/ProductManagement/Create/BasicInfo", element: <CreateBasicInfo /> },
          { path: "/LOS/ProductManagement/Create/CommodityInfo", element: <CreateComodityInfo /> },
          { path: "/LOS/ProductManagement/Create/ProductSettings", element: <CraeteProductSettings /> },
          { path: "/LOS/ProductManagement/Create/RequiredDocuments", element: <CreateRequiredDocuments /> },
          { path: "/LOS/ProductManagement/Create/ProductAffiliation", element: <CreateProductAffiliation /> },
          { path: "/LOS/ProductManagement/ProductCategory", element: <ProductCategory /> },
          { path: "/LOS/ProductManagement/ProductSubCategory", element: <ProductSubCategory /> },
          { path: "/LOS/InsuranceVendors", element: <InsuranceVendor /> },
          { path: "/LOS/Notification", element: <Notification /> },
{
            path: "/LOS/UserBlock/Compliance",
            element: <ComplianceBlock />,
          },
          {
            path: "/LOS/UserBlock/AntiFraud",
            element: <AntiFraud />,
          },
          {
            path: "/LOS/UserBlock/AML",
            element: <AML />,
          },
    
          {
            path: "/LOS/UserBlock/Sanction",
            element: <Sanction     />,
          },
          {
            path: "/LOS/ProductManagement/AddProduct",
            element: <PartnerManagementTabs />,
          },
          {
            path: "ProductManagement/Commodity",
            element: <CommodityInfo />,
          },
          {
            path: "/ProductManagement/termsandconditions",
            element: <SettingsTermsConditions />,
          },
    
          {
            path: "ProductManagement/applicationSteps",
            element: <Settings
             />,
          },
          {
            path: "ProductManagement/feeSettings",
            element: <FeeSettings
             />,
          },
          {
            path: "ProductManagement/adminFeeSlabs",
            element: <AdminFeeSlabs
             />,
          },
          {
            path: "ProductManagement/RequiredDoc",
            element: <RequiredDoc />,
          },
          {
            path: "ProductManagement/AdminList",
            element: <AdminList />,
          },
          {
            path: "ProductManagement/Categories",
            element: <Categories />,
          },
          {
            path: "ProductManagement/AddAdmin",
            element: <AddAdmin />,
          },
          {
            path: "ProductManagement/EditAdmin",
            element: <AddAdmin />,
          },
        
          { path: "Dashboard/Onboarding", element: <DashboardOnboarding /> },
          { path: "Profile", element: <DashboardProfile /> },
          { path: "*", element: <NotFound /> },
        ],
      },
      {
        path: "CustomerVerification",
        element: <CustomerVerificationLayout />,
        children: [
          /* {
            path: "nafath-verification",
            element: <NafathVerification />,
          }, */
          {
            path: "first-time-login",
            element: <FirstTimeLogin />,
          },
          { path: "*", element: <NotFound /> },
        ],
      },
      {
        path: "partner",
        element: <PartnerLayout />,
        children: [
          {
            path: "",
            element: <DashboardPartner />,
          },
          {
            path: "View/:id",
            element: <PartnerApplicationView />,
          },
          {
            path: "PendingApplication/:id",
            element: <PendingTabs />,
          },
          {
            path: "AllApplications",
            element: <PartnerAllApplication />,
          },
          {
            path: "IncompletePartner",
            element: <IncompletePartner />,
          },
          {
            path: "InProgressApplications",
            element: <InprogressApplication />,
          },
          {
            path: "RejectedApplications",
            element: <RejectedApplication />,
          },
          {
            path: "ApprovedApplications",
            element: <PartnerApprovedApplication />,
          },
          {
            path: "comission",
            element: <PartnerComission />,
          },
          {
            path: "PendingApplications",
            element: <PendingApplication />,
          },
          {
            path: "invoice/:id",
            element: <PartnerInvoice />,
          },
          {
            path: "apimanagement",
            element: <PartnerApiManagement />,
          },
          {
            path: "onboarding",
            element: <PartnerOnboarding />,
          },
          {
            path: "landingpage",
            element: <LandingPageManage />,
          },
          { path: "*", element: <NotFound /> },
        ],
      },
      {
        path: "customer",
        element: <CustomerLayout />,
        children: [
          {
            path: "",
            element: <DashboardCustomer />,
          },
          {
            path: "Applications",
            element: <CustomerApplications />,
          },
          {
            path: "CompleteApplication/:id",
            element: <CompleteApplication />,
          },
          {
            path: "ContractRequest/:id",
            element: <ContractRequest />,
          },
          {
            path: "InvoiceByApplicationID",
            element: <InvoiceByApplicationID/>,
          },
          { path: "*", element: <NotFound /> },
        ],
      },
      {
        path: "",
        element: <Layout />,
        children: [
          { path: "/LOS/sales/IBFT", element: <IBFT /> },
          { path: "/LOS/sales/MobileTopup", element: <MobileTopup /> },
          { path: "/LOS/sales/BusBooking", element: <BusBooking /> },
          { path: "/LOS/sales/MobileBundle", element: <MobileBundle /> },
          { path: "/LOS/System/Settings/AppVersion", element: <AppVersion /> },
          {
            path: "/LOS/System/CommissionSlabs/VendorCommissionType",
            element: <VendorComissionSlab />,
          },
          {
            path: "/LOS/FinancingApplications/AllApplications",
            element: <AllApplication />,
          },
          {
            path: "/LOS/FinancingApplications/AllApplications/ActivityLogs/:id",
            element: <ApplicationActivityLogs />,
          },
          {
            path: "/LOS/FinancingApplications/PendingFinancing",
            element: <PendingFinancing />,
          },
          {
            path: "/LOS/FinancingApplications/InProgressFinancing",
            element: <InProgressFinancing />,
          },
          {
            path: "/LOS/FinancingApplications/ApprovedFinancing",
            element: <ApprovedFinancing />,
          },
          {
            path: "/LOS/FinancingApplications/RejectedFinancing",
            element: <RejectedFinancing />,
          },
          {
            path: "/LOS/FinancingApplications/CanceledFinancing",
            element: <CanceledFinancing />,
          },
          {
            path: "/LOS/FinancingApplications/ActivityLogsFinancing",
            element: <ActivityLogFinancing />,
          },
          {
            path: "/LOS/FinancingApplications/IncompleteFinancing",
            element: <IncompleteFinancing />,
          },
          {
            path: "/LOS/FinancingApplications/ReschedulingRequest",
            element: <ReschedulingRequest />,
          },
          {
            path: "/LOS/FinancingApplications/ApprovedRescheduledApplications",
            element: <ApprovedRescheduledApplications />,
          },
          {
            path: "/FinancingApplications/AllApplications/View/:id",
            element: <AllApplicationView />,
          },
          {
            path: "/FinancingApplications/AllApplications/Documents/:id",
            element: <ApplicationDocuments />,
          },
          {
            path: `/LOS/sales/airbooking`,
            element: <AirBooking />,
          },
          {
            path: "/LOS/CustomerManagement/CustomerList",
            element: <AllCustomers />,
          },
          { path: "/LOS/CustomerManagement/Leads", element: <Leads /> },
          { path: "/LOS/CustomerManagement/HighRiskUsers", element: <HighRiskUsers /> },
          { path: "/LOS/CustomerManagement/Opportunity", element: <Opportunity /> },
          { path: "/LOS/CustomerManagement/AllCustomerStatus", element: <AllCustomerStatus /> },
          {
            path: "/LOS/CustomerManagement/OnboardCustomers",
            element: <OnboardCustomers />,
          },
          { path: "/LOS/UserAccountType/Guest", element: <Guests /> },
          { path: "/LOS/UserAccountType/barqLite", element: <BarqLite /> },
          { path: "/LOS/UserAccountType/barqFlex", element: <BarqFlex /> },
          { path: "/LOS/UserAccountType/barqPrime", element: <BarqPrime /> },
          { path: "/LOS/GameCenter/AllRewards", element: <AllRewards /> },
          { path: "/LOS/GameCenter/Referral", element: <Referral /> },
          { path: "/LOS/Campaign/Faqs", element: <Faq /> },
          {
            path: "/LOS/DepartmentManagement/Departments",
            element: <DepartmentList />,
          },
          {
          path: "/LOS/LOV/EmploymentSector",
            element: <EmploymentSector />,
          },
          {
            path: "/LOS/LOV/SourceOfIncome",
            element: <SourceOfIncome />,
          },
          {
            path: "/LOS/LOV/SourceOfWealth",
            element: <SourceOfWealth />,
          },
          {
            path: "/LOS/LOV/SourceOfFunds",
            element: <SourceOfFunds />,
          },
          {
            path: "/LOS/LOV/TemplateTypes",
            element: <TemplateTypes />,
          },
          {
            path: "/LOS/LOV/NetWorthRanges",
            element: <NetWorthRanges />,
          },
          {
            path: "/LOS/LOV/WealthValue",
            element: <WealthValue />,
          },
          {
            path: "/LOS/LOV/PurposeofFinancing",
            element: <PurposeOfFinancing />,
          },
          {
            path: "/LOS/LOV/CreditScoringDefinitions",
            element: <CreditScoringDefinitions/>,
          },
          {
            path: "/LOS/LOV/ApprovalConditions",
            element: <ApprovalConditions/>,
          },
          {
            path: "/LOS/LOV/ProfessionValue",
            element: <ProfessionValue />,
          },
          {
            path: "/LOS/LOV/CitiesList",
            element: <CitiesList />,
          },
          {
            path: "/Los/LOV/CountriesList",
            element: <CountriesList />,
          },
          {
            path: "/Los/LOV/MonthlyIncome",
            element: <MonthlyIncome />,
          },
          {
            path: "/Los/LOV/WealthRanges",
            element: <WealthRanges />,
          },
          {
            path: "/Los/LOV/ListOfValues",
            element: <ListOfValues />,
          },
          {
            path: "/Los/LOV/ListOfValues/:id",
            element: <ViewListOfValues />,
          },
          {
            path: "/Los/LOV/WealthRanges/:id",
            element: <ViewWealthRanges />,
          },
          {
            path: "/Los/LOV/FactorsList",
            element: <FactorsList/>,
          },
          {
            path: "/LOS/RiskManagement/BlacklistNid",
            element: <BlacklistNid />,
          },
          {
            path: "/LOS/RiskManagement/BlacklistMobile",
            element: <BlacklistMobile />,
          },
          {
            path: "/LOS/RiskManagement/FraudRuleManagement",
            element: <FraudRuleManagement />,
          },
          {
            path: "/LOS/RiskManagement/DeviceManagement",
            element: <DeviceManagement/>,
          },
          {
            path: "/LOS/CustomerManagement/LeadDetails/:id",
            element: <LeadDetails/>,
          },
          {
            path: "/LOS/CustomerManagement/OpportunityDetails/:id",
            element: <LeadDetails/>,
          },
          {
            path: "/LOS/CustomerManagement/CustomerDetails/:id",
            element: <CustomerDetails/>,
          },
          {
            path: "/LOS/CustomerManagement/HighRiskUsers/:id",
            element: <LeadDetails/>,
          },
          {
            path: "/LOS/CustomerManagement/RejectedCustomers/:id",
            element: <LeadDetails/>,
          },
          {
            path: "/LOS/CustomerManagement/PepCustomers/:id",
            element: <LeadDetails/>,
          },
          // {
          //   path: "/LOS/CustomerManagement/OpportunityDetails/:id",
          //   element: <OpportunityDetails/>,
          // },
          {
            path: "/Los/LOV/WealthRanges",
            element: <WealthRanges />,
          },
          {
            path: "/Los/LOV/ListOfValues",
            element: <ListOfValues />,
          },
          {
            path: "/Los/LOV/ListOfValues/:id",
            element: <ViewListOfValues />,
          },
          {
            path: "/Los/LOV/WealthRanges/:id",
            element: <ViewWealthRanges />,
          },
          {
            path: "/Los/LOV/MandatoryReasonRescheduling",
            element: <MandatoryReasonRescheduling />,
          },
          {
            path: "/Los/LOV/OptionalReasonRescheduling",
            element: <OptionalReasonRescheduling />,
          },
        
          { path: "/LOS/CustomerManagement/Leads", element: <Leads /> },
          { path: "/LOS/CustomerManagement/Opportunity", element: <Opportunity /> },
           {
            path: "/LOS/CustomerManagement/SanctionedCustomers",
            element: <SanctionedCustomers />,
          },
          {
            path: "/LOS/NotificationTemplate/SmsTemplate",
            element: <SmsTemplate />,
          },
           {
            path: "/LOS/NotificationTemplate/PushTemplate",
            element: <PushTemplate />,
          },
           {
            path: "/LOS/NotificationTemplate/EmailTemplate",
            element: <EmailTemplate />,
          },
          {
            path: "/LOS/MerchantManagement/MerchantList",
            element: <MerchantList />,
          },
           {
            path: "/LOS/NotificationTemplate/ContractTemplate",
            element: <ContractTemplate />,
          },
          {
            path: "/LOS/DepartmentManagement/DepartmentsPermissions",
            element: <DepartmentsPermissions />,
          },
          {
            path: "/LOS/LOV/ChecksTypes",
            element: <ChecksTypes />,
          },
          {
            path: "/LOS/LOV/ReasonsTypes",
            element: <ReasonsTypes />,
          },
          {
            path: "/LOS/LOV/ProductCategories",
            element: <ProductCategories />,
          },
          {
            path: "/LOS/LOV/ProductTypes",
            element: <ProductTypes />,
          },
          {
            path: "/LOS/LOV/CommodityTypes",
            element: <CommodityTypes />,
          },
          {
            path: "/LOS/PartnerManagement/PartnersList",
            element: <PartnerList />,
          },
          {
            path: "/LOS/PartnerManagement/AddPartner",
            element: <AddPartner />,
          },
         
          {
            path: "/LOS/PartnerManagement/UpdatePartner",
            element: <UpdatePartner />,
          },
          {
            path: "/LOS/PartnerManagement/PartnerAdminList",
            element: <PartnerAdminList />,
          },
          {
            path: "/LOS/PartnerManagement/AddPartnerAdmin",
            element: <AddPartnerAdmin />,
          },
          {
            path: "/LOS/PartnerManagement/UpdatePartnerAdmin",
            element: <UpdatePartnerAdmin />,
          },
          {
            path: "/LOS/PartnerManagement/AllPartners",
            element: <PartnersCommission />,
          },
          {
            path: "/LOS/Setting/Employees",
            element: <Employees />,
          },
          {
            path: "/LOS/Setting/RoleList",
            element: <RoleList />,
          },
          {
            path: "/LOS/Setting/AssignPermissions",
            element: <AssignPermissions />,
          },
          {
            path: "/LOS/Settings/AwnInfo",
            element: <AwnInfo />,
          },
          {
            path: "/LOS/Settings/ComplianceRequirement",
            element: <ComplianceRequirement />,
          },
          {
            path: "/LOS/Settings/BlockHistory",
            element: <BlockHistory />,
          },
          {
            path: "/LOS/BlockCodes/AllBlockCodes",
            element: <AllBlockCodes />,
          },
          {
            path: "/LOS/BlockCodes/Compliance",
            element: <ComplianceBlockCodes />,
          },
          {
            path: "/LOS/BlockCodes/AML",
            element: <AMLBlockCodes />,
          },
          {
            path: "/LOS/BlockCodes/AntiFraud",
            element: <AntiFraudBlockCodes />,
          },
          {
            path: "/LOS/BlockCodes/Sanction",
            element: <SanctionBlockCodes />,
          },
          {
            path: "/LOS/CustomerManagement/PepCustomers",
            element: <PepBlockCodes />,
          },
          {
            path: "/LOS/CustomerManagement/BlockedDevices",
            element: <BlockedDevices />,
          },
          {
            path: "/LOS/CustomerManagement/Devices",
            element: <Devices />,
          },
          {
            path: "/LOS/APIManagement/AllAPIs",
            element: <AllApis />,
          },
          /* {
            path: "APIManagement/PartnerAPIs",
            element: <PartnerApis />,
          }, */
          {
            path: "/LOS/SystemLogs/Dashboard",
            element: <Dashboard />,
          },
          {
            path: "/LOS/SystemLogs/Logs",
            element: <Logs />,
          },
          { path: "/LOS/UserRoleManagement/Users", element: <Users /> },
          { path: "/LOS/UserRoleManagement/Role", element: <Role /> },
          { path: "/LOS/UserRoleManagement/AddRole", element: <AddRole /> },
          { path: "/LOS/System/Logs/ActivityLogs", element: <ActivityLogs /> },
          { path: "/LOS/System/Logs/FinancialLogs", element: <FinancialLogs /> },
          { path: "/LOS/System/Logs/DigittLogs", element: <DigittLogs /> },
          { path: "/LOS/System/Logs/SystemAudit", element: <SystemAudit /> },
          {
            path: "System/CommissionSlabs/VendorServices",
            element: <VendorServices />,
          },
          {
            path: "/LOS/System/CommissionSlabs/VendorServices",
            element: <VendorServices />,
          },
          {
            path: "LOS/LOV/RevenueSource",
            element: <RevenueSource />,
          },
          {
            path: "LOS/LOV/FinancingPurpose",
            element: <FinancingPurpose />,
          },
          {
            path: "/LOS/System/CommissionSlabs/VendorCommission",
            element: <VendorCommission />,
          },
          { path: "/LOS/System/IncomeType", element: <IncomeType /> },
          { path: "/LOS/System/IncomeProof", element: <IncomeProof /> },
          { path: "/LOS/System/CommissionSlabs/Vendor", element: <Vendor /> },

          { path: "/LOS/System/RelationLov", element: <RelationLov /> },
          { path: "/LOS/Campaign/CampaignList", element: <CampaignList /> },
          { path: "/LOS/HomePageManagement", element: <HomePageManage /> },
          { path: "/LOS/HomePageManagement/home-page/setting", element: <ManagementForm /> },
                    { path: "/LOS/LandingPageManagement", element: <LandingPageManage /> },
                    {
                      path: "/LOS/WebPageManagement/GlobalSections",
                      element: <GlobalSections />,
                    },
                    {
                      path: "/LOS/WebPageManagement/GlobalSections/Settings",
                      element: <GlobalSectionsSettings />,
                    },
                    {
                      path: "/LOS/WebPageManagement/CalculatorTemplatePage",
                      element: <CalculatorTemplatePage />,
                    },
                    {
                      path: "/LOS/WebPageManagement/CalculatorTemplatePage/Settings",
                      element: <CalculatorSettings />,
                    },
                    {
                      path: "/LOS/WebPageManagement/CareerPage",
                      element: <CareerPage />,
                    },
                    {
                      path: "/LOS/WebPageManagement/CareerPage/Settings",
                      element: <CareerPageSettings />,
                    },
                    {
                      path: "/LOS/WebPageManagement/HomePage",
                      element: <HomePageTemplate />,
                    },
                    {
                      path: "/LOS/WebPageManagement/HomePage/Settings",
                      element: <HomePageSettings />,
                    },
                    {
                      path: "/LOS/WebPageManagement/AboutPage",
                      element: <AboutPageTemplate />,
                    },
                    {
                      path: "/LOS/WebPageManagement/AboutPage/Settings",
                      element: <AboutPageSettings />,
                    },
                    {
                      path: "/LOS/WebPageManagement/PrivacyPolicyTemplatePage",
                      element: <PrivacyPolicyManagement />,
                    },
                    {
                      path: "/LOS/WebPageManagement/PrivacyPolicyTemplatePage/Settings",
                      element: <PrivacyPolicySettings />,
                    },
                    {
                      path: "/LOS/WebPageManagement/TermsConditionsTemplatePage",
                      element: <TermsConditionsPage />,
                    },
                    {
                      path: "/LOS/WebPageManagement/TermsConditionsTemplatePage/Settings",
                      element: <TermsConditionsSettings />,
                    },
                    {
                      path: "/LOS/WebPageManagement/FaqsTemplatePage",
                      element: <FaqPageManagement />,
                    },
                    {
                      path: "/LOS/WebPageManagement/FaqsTemplatePage/Settings",
                      element: <FaqPageSettings />,
                    },
                    {
                      path: "/LOS/WebPageManagement/FinancialStatementsTemplatePage",
                      element: <FinancialStatementsPageManagement />,
                    },
                    {
                      path: "/LOS/WebPageManagement/FinancialStatementsTemplatePage/Settings",
                      element: <FinancialStatementsSettings />,
                    },
                    {
                      path: "/LOS/WebPageManagement/ContactUsTemplatePage",
                      element: <ContactUsPageManagement />,
                    },
                    {
                      path: "/LOS/WebPageManagement/ContactUsTemplatePage/Settings",
                      element: <ContactUsSettings />,
                    },



                  //cms routesss list
                    {
                      path: `cms/dashboard`,
                      element: <DashboardInfoGraphicsCms />,
                    },
                    {
                      path: "cms/Tickets/AllTickets",
                      element: <AllTickets />,
                    },
                    {
                      path: "cms/Tickets/GetTickets",
                      element: <Tickets />,
                    },
                    {
                      path: "cms/Tickets/TicketDetails/:id",
                      element: <TicketDetails/>,
                    },
                    {
                      path: "cms/Tickets/MyTickets",
                      element: <MyTickets />,
                    },
                    {
                      path: "cms/Tickets/Create",
                      element: <CreateTicket/>,
                    },
                    {
                      path: "cms/Reports",
                      element: <Reports />,
                    },
                    {
                      path: "cms/Priorities",
                      element: <Priorities/>,
                    },
                    {
                      path: "cms/Categories",
                      element: <Categories/>,
                    },
                    {
                      path: "cms/SubCategories",
                      element: <SubCategories/>,
                    },
                    {
                      path: "cms/Escalation",
                      element: <Escalation/>,
                    },
                    {
                      path: "cms/Customers",
                      element: <Customers/>,
                    },
                    {
                      path: "cms/Logs",
                      element: <LogsCms/>,
                    },
        ///// Lms routes
        {
          path: `Lms/dashboard`,
          element: <DashboardInfoGraphics/>,
        },
        {
          path: "Lms/Setting/WorkFlowMapping",
          element: <WorkFlowMapping />,
        },
        {
          path: "Lms/Setting/InvoiceSetting",
          element: <InvoiceSetting/>,
        },
        {
          path: "Lms/Setting/ProductFee",
          element: <ProductFee/>,
        },
        {
          path: "Lms/Setting/Calculator",
          element: <Calculator />,
        },
        {
          path: "Lms/loanmanagement/lateInvoice/:id",
          element: <LateInvoice />,
        },
        {
          path: "Lms/allapplications/viewapplication",
          element: <ViewApplication />,
        },
        {
          path: "Lms/LoanManagement/OtherFee",
          element: <OtherFee />,
        },
        {
          path: "Lms/ProductManagement/AddProduct",
          element: <AddProduct />,
        },
        {
          path: "Lms/ProductManagement/EditProduct/:id",
          element: <EditProduct />,
        },
        {
          path: "Lms/LoanManagement/invoicemanagement",
          element: <InvoiceManagement />,
        },
        {
          path: "Lms/LoanManagement/payinvoice",
          element: <PayInvoices />,
        },
        {
          path: "Lms/LoanManagement/AccountInvoices/:id",
          element: <AccountInvoices />,
        },
        {
          path: "Lms/LoanManagement/OtherInvoices",
          element: <OtherInvoices />,
        },
        {
          path: "Lms/LoanManagement/invoicemanagement/:id/:type",
          element: <Invoices />,
        },
        {
          path: "Lms/LoanManagement/RetryTransaction/:id/:type",
          element: <RetryTransaction/>,
        },
        {
          path: "Lms/Customers/InvoiceManagement/:accountNumber",
          element: <ApplicationManagement />,
        },
        {
          path: "Lms/LoanManagement/createInvoice",
          element: <CreateInvoice />,
        },
        {
          path: "Lms/Setting/ProductManagement",
          element: <ProductManagement />,
        },
        {
          path: "Lms/Setting/Deliquency",
          element: <DeliquencyManagement />,
        },
        {
          path: "Lms/Setting/Rescheduling",
          element: <RescheduleConfigManagement />,
        },
        {
          path: "Lms/Setting/DunningPolicy",
          element: <DunningPolicyManagement />,
        },
        {
          path: "Lms/Collections/WaiverRequests",
          element: <WaiverRequestsManagement />,
        },
        {
          path: "Lms/accountingFinancing/daybook",
          element: <DayBook />,
        },
        {
          path: "Lms/transactionHistory",
          element: <TransactionTabs />,
        },
        {
          path: "Lms/excessPayment",
          element: <ExcessPayment />,
        },
        {
          path: "Lms/customerServices",
          element: <CustomerServices />,
        },
   
        {
          path: "Lms/CustomerManagement/AccountDocuments",
          element: <AccountDocuments />,
        },
        {
          path: "Lms/LoanManagement/CollateralManagement",
          element: <CollateralManagement />,
        },
        {
          path: "Lms/addcollateral/CollateralManagement",
          element: <CollateralManagementView />,
        },
        {
          path: "Lms/viewdetails/CollateralManagement/Edit/:id",
          element: <CollateralManagementEdit />,
        },
        {
          path: "Lms/viewdetails/collateralmanagement/allocation/:id",
          element: <CollateralAllocation />,
        },
        {
          path: "Lms/viewdetails/collateralmanagement/:customerId",
          element: <CollateralManagementView />,
        },
        {
          path: "Lms/ChartOfAccount/CoaConfiguration",
          element: <AccountMapping />,
        },
        {
          path: "Lms/ChartOfAccount/ChartOfAccount",
          element: <Coa />,
        },
        {
          path: "Lms/ChartOfAccount/ChartOfAccountFields",
          element: <ChartOfAccountFields />,
        },
        {
          path: "Lms/Customers/AllCustomers",
          element: <LmsAllCustomers/>,
        },
        {
          path: "Lms/loanmanagement/generateInvoice/:id",
          element: <GenerateInvoice />,
        },
        {
          path: "Lms/Customers/Business",
          element: <Buisness />,
        },
        {
          path: "Lms/customers/individuals",
          element: <Individuals />,
        },
        {
          path: "Lms/kyc-kyb",
          element: <KycKyb />,
        },
        {
          path: "Lms/accountLogs/:id",
          element: <AccountLogs />,
        },
        {
          path: "Lms/callActivity",
          element: <CustomerServices />,
        },
        {
          path: "Lms/LoanManagement/ApplicationManagement",
          element: <ApplicationManagement />,
        },
        {
          path: "Lms/LoanManagement/BrokenPromises/:id",
          element: <BrokenPromises />,
        },
        {
          path: "Lms/LoanManagement/RescheduleHistory/:id",
          element: <RescheduleHistory />,
        },
        {
          path: "Lms/LoanManagement/WaiveOffDetails/:applicationId",
          element: <WaiveOffDetails />,
        },
        {
          path: "Lms/LoanManagement/ViewSchedule/:id",
          element: <LoanPaymentSchedule />,
        },
        {
          path: "Lms/loandetailview",
          element: <LoanDetailView />,
        },
        {
          path: "Lms/Customers/kyc-kyb",
          element: <KycKyb />,
        },
        {
          path: "Lms/LoanManagement/ApplicationManagement/loanInvoice",
          element: <LoanInvoice />,
        },
   
        {
          path: "Lms/LoanManagement/createInvoice",
          element: <CreateInvoice />,
        },
        {
          path: "Lms/LoanManagement/LoanTimeline/:applicationNo/:id",
          element: <LoanTimeline />,
        },
        // {
        //   path: "accountingFinancing/vouchers",
        //   element: <Vouchers />,
        // },
   
        {
          path: "Lms/accountingFinancing/trialbalance",
          element: <TrialBalance />,
        },
   
        {
          path: "Lms/transactionHistory",
          element: <TransactionTabs />,
        },
        {
          path: "Lms/excessPayment",
          element: <ExcessPayment />,
        },
        {
          path: "Lms/Reports/AccountingFinancing",
          element: <AccountFinancing />,
        },
        {
          path: "Lms/Reports/loans",
          element: <Loans />,
        },
        {
          path: "Lms/Reports/AccountingFinancing/vouchers",
          element: <Vouchers />,
        },
        {
          path: "Lms/Reports/AccountingFinancing/ledger",
          element: <Ledger />,
        },
        {
          path: "Lms/Reports/AccountingFinancing/trialbalance",
          element: <TrialBalance />,
        },
        {
          path: "Lms/Reports/AccountingFinancing/daybook",
          element: <DayBook />,
        },
        {
          path: "Lms/Reports/AccountingFinancing/collection",
          element: <CollectionReport />,
        },
        {
          path: "Lms/Reports/AccountingFinancing/profit-revenue",
          element: <ProfitRevenueReport />,
        },
        {
          path: "Lms/Reports/AccountingFinancing/cash-flow",
          element: <CashFlowReport />,
        },
        {
          path: "Lms/Reports/AccountingFinancing/customer-statement",
          element: <CustomerStatementReport />,
        },
        {
          path: "Lms/Reports/loans/overdue",
          element: <OverDue />,
        },
        {
          path: "Lms/Reports/loans/performingLoans",
          element: <PerformingLoans />,
        },
        {
          path: "Lms/Reports/loans/due",
          element: <Due />,
        },
        {
          path: "Lms/Reports/loans/earlySettlement",
          element: <EarlySettlement />,
        },
        {
          path: "Lms/Reports/loans/disbursement",
          element: <LoanDisbursementReport />,
        },
        {
          path: "Lms/Reports/loans/writeOff",
          element: <WriteOff />,
        },
        {
          path: "Lms/Reports/loans/loanDisbursementReport",
          element: <LoanDisbursmentReport />,
        },
        {
          path: "Lms/Reports/loans/repaymentScheduleReport",
          element: <RepaymentScheduleReport />,
        },
        {
          path: "Lms/Reports/loans/dailyTransactionSummary",
          element: <DailyTransactionSummary />,
        },
        {
          path: "Lms/Reports/loans/loanBalanceReport",
          element: <LoanBalanceReport />,
        },
        {
          path: "Lms/Reports/loans/loanHistoryReport",
          element: <LoanHistoryReport />,
        },
        {
          path: "Lms/Reports/loans/productWiseProfitLoss",
          element: <ProductWiseProfitLoss />,
        },
        {
          path: "Lms/Reports/loans/customerWiseProfitLoss",
          element: <CustomerWiseProfitLoss />,
        },
        {
          path: "Lms/Reports/loans/customerAccountStatement",
          element: <CustomerAccountStatement />,
        },
        {
          path: "Lms/Reports/loans/collectionsDueReport",
          element: <CollectionsDueReport />,
        },
        {
          path: "Lms/Reports/loans/skippedInstallmentsReport",
          element: <SkippedInstallmentsReport />,
        },
        {
          path: "Lms/Reports/loans/productPerformanceReport",
          element: <ProductPerformanceReport />,
        },
        {
          path: "Lms/Reports/loans/topBorrowersReport",
          element: <TopBorrowersReport />,
        },
        {
          path: "Lms/Reports/AccountReport",
          element:<AccountReport/>,
        },
        {
          path: "Lms/Reports/AccountReportsList",
          element:<AccountReportsList/>,
        },
        {
          path: "Lms/Logs/AllLogs",
          element: <AllLogs/>,
        },
        {
          path: "Lms/Logs/ApiLogs",
          element: <ApiLogs/>,
        },
        {
          path: "Lms/Logs/ApiLogsByDate/:customerId/:type",
          element: <LogsByDate/>,
        },
        {
          path: "Lms/Logs/DisburseApprovedAmountApiLogs",
           element: <DisburseApprovedAmountApiLogs/>,
        },
        {
          path: "Lms/Expenses/ThirdPartyExpense",
          element: <ThirdPartyExpense/>,
        },
        {
          path: "Lms/Expenses/LoanApplicationExpenses",
          element: <LoanApplicationExpenses/>,
        },
        {
          path: "Lms/Expenses/LoanApplicationExpenseDetail/:nationalId",
          element: <LoanApplicationExpenseDetail/>,
        },
        {
          path: "Lms/Expenses/OnboardingExpensesDetail/:nationalId",
          element: <OnboardingExpensesDetail/>,
        },
        {
          path: "Lms/Expenses/OnboardingExpenses",
          element: <OnboardingExpenses/>,
        },
        {
          path: "Lms/CommodityManagement/CommodityList",
          element: <CommodityManagement />,
        },
        {
          path: "Lms/CommodityManagement/CommoditySupplier",
          element: <CommoditySupplier />,
        },
        {
          path: "Lms/CommodityManagement/CommoditySupplier/View/:id",
          element: <ViewCommoditySupplierData />,
        },
        { path: "Lms/Reconciliation/Dashboard", element: <ReconciliationDashboard /> },
        { path: "Lms/Reconciliation/Transactions", element: <Transactions /> },
        { path: "Lms/Reconciliation/OperationalExpenses", element: <OperationalExpenseTab/> },
        { path: "Lms/Reconciliation/ReconciliationSummary", element: <ReconciliationSummary/> },
        { path: "Lms/Reconciliation/TransactionAccounts", element: <TransactionAccounts/> },
        { path: "Lms/Reconciliation/ErrorReport", element: <ErrorReport/> },
           {
          path: "Lms/Reports/SimahReportsList",
          element:<SimahReport/>,
        },
        {
          path: "Lms/LoanManagement/application",
          element: <Application />,
        },
        {
          path: "Lms/account/LoanManagement/Bureau",
          element: <Bureau />,
        },
        { path: "LOS/Notification/Channels", element: <Channels/> },
        { path: "LOS/Notification/Languages", element: <Languages/> },
        { path: "LOS/Notification/Templates", element: <Templates/> },
        { path: "LOS/Notification/TemplateChannels", element: <TemplateChannels/> },
        { path: "LOS/Notification/Users", element: <UsersNotification/> },
        { path: "LOS/Notification/UserPreferences", element: <UserPreferences/> },
        { path: "LOS/Notification/SystemPreferences", element: <SystemPreferences/> },
         { path: "ThirdPartyManagement/Dashboard", element: <ThirdPartyDashboard /> },
         { path: "ThirdPartyManagement/Services", element: <ServicesList /> },
         { path: "ThirdPartyManagement/Services/Apis", element: <ServicesApis /> },
         { path: "ThirdPartyManagement/Services/Environment", element: <ServicesEnvironment /> },
         { path: "ThirdPartyManagement/EnvironmentSettings/ServicesList", element: <ServicesList /> },
         { path: "ThirdPartyManagement/Clients", element: <ClientsList /> },
         { path: "ThirdPartyManagement/Clients/Add", element: <AddEditClient /> },
         { path: "ThirdPartyManagement/Clients/Edit/:id", element: <AddEditClient /> },
         { path: "ThirdPartyManagement/Clients/:id/Admins", element: <ClientAdminList /> },
         { path: "ThirdPartyManagement/Clients/:clientId/Admins/Add", element: <AddEditClientAdmin /> },
         { path: "ThirdPartyManagement/Clients/:clientId/Admins/Edit/:id", element: <AddEditClientAdmin /> },
         { path: "ThirdPartyManagement/RequestHistory/ClientRequestProd", element: <ClientRequestProd /> },
         { path: "ThirdPartyManagement/RequestHistory/ClientRequestDev", element: <ClientRequestDev /> },
         { path: "ThirdPartyManagement/RequestHistory/ClientRequestTest", element: <ClientRequestTest /> },
         { path: "ThirdPartyManagement/RequestHistory/ClientRequestTest/:id", element: <ClientRequestTestDetail /> },
         { path: "ThirdPartyManagement/RequestHistory/RequestDetail/:id", element: <RequestDetail /> },
         { path: "ThirdPartyManagement/RequestHistory/RequestService", element: <RequestService /> },
         { path: "ThirdPartyManagement/DevClientRequests", element: <ClientRequestHistory environment="dev" /> },
         { path: "ThirdPartyManagement/ProdClientRequests", element: <ClientRequestHistory environment="prod" /> },
         { path: "ThirdPartyManagement/ClientServiceRequests", element: <ClientRequestHistory environment="service" /> },
         { path: "ThirdPartyManagement/AllEnvironment", element: <AllEnvironment /> },
         { path: "ThirdPartyManagement/EnvConfig", element: <EnvConfig /> },
         { path: "ThirdPartyManagement/ExportCsv", element: <ExportCsv /> },
         { path: "ThirdPartyManagement/Providers", element: <ProvidersList /> },
         { path: "ThirdPartyManagement/AllProviderApis", element: <AllProviderApis /> },
         { path: "ThirdPartyManagement/AllProviderApis/EnvConfig/:apiId", element: <ProviderApiEnvConfig /> },
         { path: "ThirdPartyManagement/Setting/Employees", element: <Employees /> },
         { path: "ThirdPartyManagement/Setting/RoleList", element: <RoleList /> },
         { path: "ThirdPartyManagement/Setting/AssignPermissions", element: <AssignPermissions /> },
        ],
      },
      {
        path: "/",
        element: <LayoutDashboard />,
        children: [
         /* Investor Dashboard Routes - Wrapped with LayoutInvestor for Tailwind CSS scoping */
         { 
           path: "InvestorDashboard",
           element: <LayoutInvestor />,
           children: [
             { path: "Overview", element: <DashboardOverview /> },
         
         /* Investors Module */
         { path: "Investors", element: <InvestorsList /> },
         { path: "Investors/new", element: <AddInvestor /> },
         { path: "Investors/:id", element: <InvestorDetail /> },
         { path: "Investors/kyc-documents/:investorId", element: <KycDocuments /> },
         { path: "Investors/documents/:investorId", element: <InvestorDocuments /> },
         { path: "Investors/document-preview/:investorId", element: <DocumentPreview /> },
         { path: "Investors/kyc-kyb-detail/:investorId", element: <KycKybDetail /> },

         /* Products & Rates */
         { path: "Products", element: <ProductsList /> },
         { path: "Products/View/:productId", element: <ProductView /> },
         { path: "Products/:productId/config", element: <ProductConfiguration /> },
         { path: "SystemSettings/IncomeRanges", element: <IncomeRangeList /> },
         { path: "SystemSettings/IncomeRanges/View/:incomeRangeId", element: <IncomeRangeView /> },
         { path: "SystemSettings/InitialInvest", element: <InitialInvestList /> },
         { path: "SystemSettings/InvestmentExperience", element: <InvestmentExperienceList /> },
         { path: "SystemSettings/InvestmentTimeline", element: <InvestmentTimelineList /> },

         /* Investments */
         { path: "Investments", element: <InvestmentsList /> },
         { path: "Investments/:id/adjust", element: <InvestmentAdjust /> },
         { path: "ApproveInvestment", element: <ApproveInvestment /> },
         { path: "Logs", element: <InvestorLogs /> },
         { path: "Ledger", element: <InvestorLedger /> },

         /* Reports */
         { path: "Reports", element: <ReportsMain /> },
         
         /* Performance Reports */
         { path: "Reports/pl", element: <PLSummary /> },
         { path: "Reports/pl-summary", element: <PLSummary /> },
         { path: "Reports/analytics", element: <PortfolioAnalytics /> },
         { path: "Reports/portfolio-analytics", element: <PortfolioAnalytics /> },
         { path: "Reports/benchmark-comparison", element: <BenchmarkComparison /> },
         { path: "Reports/risk-metrics", element: <RiskMetrics /> },

         /* Financial Reports */
         { path: "Reports/balance-sheet", element: <BalanceSheet /> },
         { path: "Reports/income-statement", element: <IncomeStatement /> },
         { path: "Reports/cash-flow", element: <CashFlowStatement /> },
         { path: "Reports/fee-analysis", element: <FeeAnalysis /> },

         /* Investor Reports */
         { path: "Reports/investor-statements", element: <InvestorStatements /> },
         { path: "Reports/allocation-reports", element: <AllocationReports /> },
         { path: "Reports/transaction-summary", element: <TransactionSummary /> },
         { path: "Reports/tax-reports", element: <InvestorStatements /> },

         /* Compliance Reports */
         { path: "Reports/regulatory-filing", element: <RegulatoryFilings /> },
         { path: "Reports/audit-trail", element: <RegulatoryFilings /> },
         { path: "Reports/compliance-monitoring", element: <RegulatoryFilings /> },
         { path: "Reports/risk-compliance", element: <RegulatoryFilings /> },

         /* Allocation Engine */
         { path: "AllocationEngine", element: <AllocationDashboard /> },
         { path: "AllocationEngine/strategies", element: <StrategiesList /> },
         { path: "AllocationEngine/strategies/new", element: <CreateStrategy /> },
         { path: "AllocationEngine/strategies/:id", element: <SimulationResults /> },
         { path: "AllocationEngine/strategies/:id/simulate", element: <SimulationResults /> },
         { path: "AllocationEngine/schedules", element: <AllocationDashboard /> },
         { path: "AllocationEngine/audit", element: <AllocationAudit /> },
         { path: "AllocationEngine/settings", element: <AllocationDashboard /> },
         { path: "AllocationEngine/risk-profiles", element: <RiskProfiles /> },

         /* Other Admin Pages */
        //  { path: "AuditLogs", element: <AuditLogs /> },
        //  { path: "Notifications", element: <Notifications /> },
        //  { path: "AdminUsers", element: <AdminUsers /> },
        //  { path: "SystemSettings", element: <SystemSettings /> },
           ],
         },
        ],
      },
      {
        path: "applyloan",
        element: <LandingUserLayout />,
        children: [
          { path: "partner", element: <SelectProduct /> },
          { path: "Terms", element: <UserTermsandCondition /> },
          // { path: "Dashboard", element: <LandingDashboardPage /> },
          { path: "businessdetails", element: <BusinessDetails /> },
          { path: "otpVerification", element: <OtpVerification /> },
          { path: "orbitSms", element: <OrbitSms /> },
          { path: "factoringInfo", element: <FactoringInfo /> },
          { path: "ComplianceInfo", element: <ComplianceInfo /> },
          { path: "bankingInfo", element: <BankingInfo /> },
          { path: "finish", element: <Finish /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "lms",
        element: <LayoutLms />,
        children: [

                  //cms routesss list
                    {
                      path: `cms/dashboard`,
                      element: <DashboardInfoGraphicsCms />,
                    },
                    {
                      path: "cms/Tickets/AllTickets",
                      element: <AllTickets />,
                    },
                    {
                      path: "cms/Tickets/GetTickets",
                      element: <Tickets />,
                    },
                    {
                      path: "cms/Tickets/TicketDetails/:id",
                      element: <TicketDetails/>,
                    },
                    {
                      path: "cms/Tickets/MyTickets",
                      element: <MyTickets />,
                    },
                    {
                      path: "cms/Reports",
                      element: <Reports />,
                    },
                    {
                      path: "cms/Priorities",
                      element: <Priorities/>,
                    },
                    {
                      path: "cms/Categories",
                      element: <Categories/>,
                    },
                    {
                      path: "cms/SubCategories",
                      element: <SubCategories/>,
                    },
                    {
                      path: "cms/Escalation",
                      element: <Escalation/>,
                    },
                    {
                      path: "cms/Customers",
                      element: <Customers/>,
                    },
                    {
                      path: "cms/Logs",
                      element: <LogsCms/>,
                    },
        ///// Lms routes
        {
          path: `Lms/dashboard`,
          element: <DashboardInfoGraphics/>,
        },
        {
          path: "Lms/Setting/WorkFlowMapping",
          element: <WorkFlowMapping />,
        },
        {
          path: "Lms/Setting/InvoiceSetting",
          element: <InvoiceSetting/>,
        },
        {
          path: "Lms/Setting/ProductFee",
          element: <ProductFee/>,
        },
        {
          path: "Lms/Setting/Calculator",
          element: <Calculator />,
        },
        {
          path: "Lms/loanmanagement/lateInvoice/:id",
          element: <LateInvoice />,
        },
        {
          path: "Lms/allapplications/viewapplication",
          element: <ViewApplication />,
        },
        {
          path: "Lms/LoanManagement/OtherFee",
          element: <OtherFee />,
        },
        {
          path: "Lms/ProductManagement/AddProduct",
          element: <AddProduct />,
        },
        {
          path: "Lms/ProductManagement/EditProduct/:id",
          element: <EditProduct />,
        },
        {
          path: "Lms/LoanManagement/invoicemanagement",
          element: <InvoiceManagement />,
        },
        {
          path: "Lms/LoanManagement/payinvoice",
          element: <PayInvoices />,
        },
        {
          path: "Lms/LoanManagement/AccountInvoices/:id",
          element: <AccountInvoices />,
        },
        {
          path: "Lms/LoanManagement/OtherInvoices",
          element: <OtherInvoices />,
        },
        {
          path: "Lms/LoanManagement/invoicemanagement/:id/:type",
          element: <Invoices />,
        },
        {
          path: "Lms/LoanManagement/RetryTransaction/:id/:type",
          element: <RetryTransaction/>,
        },
        {
          path: "Lms/Customers/InvoiceManagement/:accountNumber",
          element: <ApplicationManagement />,
        },
        {
          path: "Lms/LoanManagement/createInvoice",
          element: <CreateInvoice />,
        },
        {
          path: "Lms/Setting/ProductManagement",
          element: <ProductManagement />,
        },
        {
          path: "Lms/Setting/Deliquency",
          element: <DeliquencyManagement />,
        },
        {
          path: "Lms/Setting/Rescheduling",
          element: <RescheduleConfigManagement />,
        },
        {
          path: "Lms/accountingFinancing/daybook",
          element: <DayBook />,
        },
        {
          path: "Lms/transactionHistory",
          element: <TransactionTabs />,
        },
        {
          path: "Lms/excessPayment",
          element: <ExcessPayment />,
        },
        {
          path: "Lms/customerServices",
          element: <CustomerServices />,
        },
   
        {
          path: "Lms/CustomerManagement/AccountDocuments",
          element: <AccountDocuments />,
        },
        {
          path: "Lms/LoanManagement/CollateralManagement",
          element: <CollateralManagement />,
        },
        {
          path: "Lms/addcollateral/CollateralManagement",
          element: <CollateralManagementView />,
        },
        {
          path: "Lms/viewdetails/CollateralManagement/Edit/:id",
          element: <CollateralManagementEdit />,
        },
        {
          path: "Lms/viewdetails/collateralmanagement/allocation/:id",
          element: <CollateralAllocation />,
        },
        {
          path: "Lms/viewdetails/collateralmanagement/:customerId",
          element: <CollateralManagementView />,
        },
        {
          path: "Lms/ChartOfAccount/CoaConfiguration",
          element: <AccountMapping />,
        },
        {
          path: "Lms/ChartOfAccount/ChartOfAccount",
          element: <Coa />,
        },
        {
          path: "Lms/Customers/AllCustomers",
          element: <LmsAllCustomers/>,
        },
        {
          path: "Lms/loanmanagement/generateInvoice/:id",
          element: <GenerateInvoice />,
        },
        {
          path: "Lms/Customers/Business",
          element: <Buisness />,
        },
        {
          path: "Lms/customers/individuals",
          element: <Individuals />,
        },
        {
          path: "Lms/kyc-kyb",
          element: <KycKyb />,
        },
        {
          path: "Lms/accountLogs/:id",
          element: <AccountLogs />,
        },
        {
          path: "Lms/callActivity",
          element: <CustomerServices />,
        },
        {
          path: "Lms/LoanManagement/ApplicationManagement",
          element: <ApplicationManagement />,
        },
        {
          path: "Lms/LoanManagement/BrokenPromises/:id",
          element: <BrokenPromises />,
        },
        {
          path: "Lms/LoanManagement/RescheduleHistory/:id",
          element: <RescheduleHistory />,
        },
        {
          path: "Lms/LoanManagement/ViewSchedule/:id",
          element: <LoanPaymentSchedule />,
        },
        {
          path: "Lms/loandetailview",
          element: <LoanDetailView />,
        },
        {
          path: "Lms/Customers/kyc-kyb",
          element: <KycKyb />,
        },
        {
          path: "Lms/LoanManagement/ApplicationManagement/loanInvoice",
          element: <LoanInvoice />,
        },
   
        {
          path: "Lms/LoanManagement/createInvoice",
          element: <CreateInvoice />,
        },
        // {
        //   path: "accountingFinancing/vouchers",
        //   element: <Vouchers />,
        // },
   
        {
          path: "Lms/accountingFinancing/trialbalance",
          element: <TrialBalance />,
        },
   
        {
          path: "Lms/transactionHistory",
          element: <TransactionTabs />,
        },
        {
          path: "Lms/excessPayment",
          element: <ExcessPayment />,
        },
        {
          path: "Lms/Reports/AccountingFinancing",
          element: <AccountFinancing />,
        },
        {
          path: "Lms/Reports/loans",
          element: <Loans />,
        },
        {
          path: "Lms/Reports/AccountingFinancing/vouchers",
          element: <Vouchers />,
        },
        {
          path: "Lms/Reports/AccountingFinancing/ledger",
          element: <Ledger />,
        },
        {
          path: "Lms/Reports/AccountingFinancing/trialbalance",
          element: <TrialBalance />,
        },
        {
          path: "Lms/Reports/AccountingFinancing/daybook",
          element: <DayBook />,
        },
        {
          path: "Lms/Reports/AccountingFinancing/collection",
          element: <CollectionReport />,
        },
        {
          path: "Lms/Reports/AccountingFinancing/profit-revenue",
          element: <ProfitRevenueReport />,
        },
        {
          path: "Lms/Reports/AccountingFinancing/cash-flow",
          element: <CashFlowReport />,
        },
        {
          path: "Lms/Reports/AccountingFinancing/customer-statement",
          element: <CustomerStatementReport />,
        },
        {
          path: "Lms/Reports/loans/overdue",
          element: <OverDue />,
        },
        {
          path: "Lms/Reports/loans/performingLoans",
          element: <PerformingLoans />,
        },
        {
          path: "Lms/Reports/loans/due",
          element: <Due />,
        },
        {
          path: "Lms/Reports/loans/earlySettlement",
          element: <EarlySettlement />,
        },
        {
          path: "Lms/Reports/loans/disbursement",
          element: <LoanDisbursementReport />,
        },
        {
          path: "Lms/Reports/loans/writeOff",
          element: <WriteOff />,
        },
        {
          path: "Lms/Reports/AccountReport",
          element:<AccountReport/>,
        },
        {
          path: "Lms/Reports/AccountReportsList",
          element:<AccountReportsList/>,
        },
     
        {
          path: "Lms/Logs/AllLogs",
          element: <AllLogs/>,
        },
        {
          path: "Lms/Logs/ApiLogs",
          element: <ApiLogs/>,
        },
        {
          path: "Lms/Logs/ApiLogsByDate/:customerId/:type",
          element: <LogsByDate/>,
        },
        {
          path: "Lms/Logs/DisburseApprovedAmountApiLogs",
           element: <DisburseApprovedAmountApiLogs/>,
        },
        {
          path: "Lms/Expenses/ThirdPartyExpense",
          element: <ThirdPartyExpense/>,
        },
        {
          path: "Lms/Expenses/LoanApplicationExpenses",
          element: <LoanApplicationExpenses/>,
        },
        {
          path: "Lms/Expenses/LoanApplicationExpenseDetail/:nationalId",
          element: <LoanApplicationExpenseDetail/>,
        },
        {
          path: "Lms/Expenses/OnboardingExpensesDetail/:nationalId",
          element: <OnboardingExpensesDetail/>,
        },
        {
          path: "Lms/Expenses/OnboardingExpenses",
          element: <OnboardingExpenses/>,
        },
        {
          path: "Lms/CommodityManagement/CommodityList",
          element: <CommodityManagement />,
        },
        {
          path: "Lms/CommodityManagement/CommoditySupplier",
          element: <CommoditySupplier />,
        },
        {
          path: "Lms/CommodityManagement/CommoditySupplier/View/:id",
          element: <ViewCommoditySupplierData />,
        },
        { path: "Lms/Reconciliation/Dashboard", element: <ReconciliationDashboard /> },
        { path: "Lms/Reconciliation/Transactions", element: <Transactions /> },
        { path: "Lms/Reconciliation/OperationalExpenses", element: <OperationalExpenseTab/> },
        { path: "Lms/Reconciliation/ReconciliationSummary", element: <ReconciliationSummary/> },
        { path: "Lms/Reconciliation/TransactionAccounts", element: <TransactionAccounts/> },
        { path: "Lms/Reconciliation/ErrorReport", element: <ErrorReport/> },
        {
          path: "Lms/LoanManagement/application",
          element: <Application />,
        },
        {
          path: "Lms/account/LoanManagement/Bureau",
          element: <Bureau />,
        },
       
        // { path: "LOS/Notification/Users", element: <UsersNotification/> },
        // { path: "LOS/Notification/UserPreferences", element: <UserPreferences/> },
        // { path: "LOS/Notification/SystemPreferences", element: <SystemPreferences/> },
        //  { path: "ThirdPartyManagement/Dashboard", element: <ThirdPartyDashboard /> },
        //  { path: "ThirdPartyManagement/EnvironmentSettings/ServicesList", element: <ServicesList /> },
        //  { path: "ThirdPartyManagement/Clients", element: <ClientsList /> },
        //  { path: "ThirdPartyManagement/DevClientRequests", element: <ClientRequestHistory environment="dev" /> },
        //  { path: "ThirdPartyManagement/ProdClientRequests", element: <ClientRequestHistory environment="prod" /> },
        //  { path: "ThirdPartyManagement/ClientServiceRequests", element: <ClientRequestHistory environment="service" /> },
        //  { path: "ThirdPartyManagement/Setting/Employees", element: <Employees /> },
        //  { path: "ThirdPartyManagement/Setting/RoleList", element: <RoleList /> },
        //  { path: "ThirdPartyManagement/Setting/AssignPermissions", element: <AssignPermissions /> },
        ],
      },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/",
        element: <LayoutDashboard />,
        children: [
         /* Investor Dashboard Routes - Wrapped with LayoutInvestor for Tailwind CSS scoping */
         { 
           path: "InvestorDashboard",
           element: <LayoutInvestor />,
           children: [
             { path: "Overview", element: <DashboardOverview /> },
         
         /* Investors Module */
         { path: "Investors", element: <InvestorsList /> },
         { path: "Investors/new", element: <AddInvestor /> },
         { path: "Investors/:id", element: <InvestorDetail /> },
         { path: "Investors/kyc-documents/:investorId", element: <KycDocuments /> },
         { path: "Investors/documents/:investorId", element: <InvestorDocuments /> },
         { path: "Investors/document-preview/:investorId", element: <DocumentPreview /> },
         { path: "Investors/kyc-kyb-detail/:investorId", element: <KycKybDetail /> },

         /* Products & Rates */
         { path: "Products", element: <ProductsList /> },
         { path: "Products/View/:productId", element: <ProductView /> },
         { path: "Products/:productId/config", element: <ProductConfiguration /> },
         { path: "SystemSettings/IncomeRanges", element: <IncomeRangeList /> },
         { path: "SystemSettings/IncomeRanges/View/:incomeRangeId", element: <IncomeRangeView /> },
         { path: "SystemSettings/InitialInvest", element: <InitialInvestList /> },
         { path: "SystemSettings/InvestmentExperience", element: <InvestmentExperienceList /> },
         { path: "SystemSettings/InvestmentTimeline", element: <InvestmentTimelineList /> },

         /* Investments */
         { path: "Investments", element: <InvestmentsList /> },
         { path: "Investments/:id/adjust", element: <InvestmentAdjust /> },
         { path: "ApproveInvestment", element: <ApproveInvestment /> },
         { path: "Logs", element: <Logs /> },
         { path: "Ledger", element: <InvestorLedger /> },

         /* Reports */
         { path: "Reports", element: <ReportsMain /> },
         
         /* Performance Reports */
         { path: "Reports/pl", element: <PLSummary /> },
         { path: "Reports/pl-summary", element: <PLSummary /> },
         { path: "Reports/analytics", element: <PortfolioAnalytics /> },
         { path: "Reports/portfolio-analytics", element: <PortfolioAnalytics /> },
         { path: "Reports/benchmark-comparison", element: <BenchmarkComparison /> },
         { path: "Reports/risk-metrics", element: <RiskMetrics /> },

         /* Financial Reports */
         { path: "Reports/balance-sheet", element: <BalanceSheet /> },
         { path: "Reports/income-statement", element: <IncomeStatement /> },
         { path: "Reports/cash-flow", element: <CashFlowStatement /> },
         { path: "Reports/fee-analysis", element: <FeeAnalysis /> },

         /* Investor Reports */
         { path: "Reports/investor-statements", element: <InvestorStatements /> },
         { path: "Reports/allocation-reports", element: <AllocationReports /> },
         { path: "Reports/transaction-summary", element: <TransactionSummary /> },
         { path: "Reports/tax-reports", element: <InvestorStatements /> },

         /* Compliance Reports */
         { path: "Reports/regulatory-filing", element: <RegulatoryFilings /> },
         { path: "Reports/audit-trail", element: <RegulatoryFilings /> },
         { path: "Reports/compliance-monitoring", element: <RegulatoryFilings /> },
         { path: "Reports/risk-compliance", element: <RegulatoryFilings /> },

         /* Allocation Engine */
         { path: "AllocationEngine", element: <AllocationDashboard /> },
         { path: "AllocationEngine/strategies", element: <StrategiesList /> },
         { path: "AllocationEngine/strategies/new", element: <CreateStrategy /> },
         { path: "AllocationEngine/strategies/:id", element: <SimulationResults /> },
         { path: "AllocationEngine/strategies/:id/simulate", element: <SimulationResults /> },
         { path: "AllocationEngine/schedules", element: <AllocationDashboard /> },
         { path: "AllocationEngine/audit", element: <AllocationAudit /> },
         { path: "AllocationEngine/settings", element: <AllocationDashboard /> },
         { path: "AllocationEngine/risk-profiles", element: <RiskProfiles /> },

         /* Other Admin Pages */
        //  { path: "AuditLogs", element: <AuditLogs /> },
        //  { path: "Notifications", element: <Notifications /> },
        //  { path: "AdminUsers", element: <AdminUsers /> },
        //  { path: "SystemSettings", element: <SystemSettings /> },
           ],
         },
        ],
      },
      {
        path: "applyloan",
        element: <LandingUserLayout />,
        children: [
          { path: "partner", element: <SelectProduct /> },
          { path: "Terms", element: <UserTermsandCondition /> },
          // { path: "Dashboard", element: <LandingDashboardPage /> },
          { path: "businessdetails", element: <BusinessDetails /> },
          { path: "otpVerification", element: <OtpVerification /> },
          { path: "orbitSms", element: <OrbitSms /> },
          { path: "factoringInfo", element: <FactoringInfo /> },
          { path: "ComplianceInfo", element: <ComplianceInfo /> },
          { path: "bankingInfo", element: <BankingInfo /> },
          { path: "finish", element: <Finish /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
