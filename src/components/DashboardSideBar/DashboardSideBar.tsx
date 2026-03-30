import React, { useState, useEffect } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Images } from "../Config/Images";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RootState } from "../../redux/rootReducer";
import { authSlice } from "../../redux/apis/apisSlice";
import { themeStyle } from "../Config/Theme";
import SubHeaderFlowLms from "../DashboardHeader/SubHeaderFlowLms";
import { FaMobileAlt } from "react-icons/fa";

const DasbhboardSidebar = () => {
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState<number | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toggled = useSelector((state: RootState) => state.block.toggled);
  const location = useLocation();
  const pathname = location.pathname;

  // Auto-open menu based on current route
  useEffect(() => {
    if (pathname.includes("/LOS")) {
      setOpenSubmenuIndex(0); // LOS menu is at index 0
    } else if (pathname.includes("/Lms")) {
      setOpenSubmenuIndex(1); // LMS menu is at index 1
    } else if (pathname.includes("/cms")) {
      setOpenSubmenuIndex(2); // CMS menu is at index 2
    } else if (pathname.includes("/ThirdPartyManagement")) {
      setOpenSubmenuIndex(3); // Third Party Management menu is at index 3
    } else if (pathname.includes("/InvestorDashboard")) {
      setOpenSubmenuIndex(4); // Investor Dashboard menu is at index 4
    }
  }, [pathname]);

  const permissionData = useSelector(
    (state: RootState) => state.block.permissions
  );

  // Helper to check if user has access based on permissionCode or permissionName
  const hasAccess = (keys: string | string[]): boolean => {
    if (!permissionData || !Array.isArray(permissionData) || permissionData.length === 0) {
      return true; // No permissions loaded yet — show all
    }
    const keysToCheck = (Array.isArray(keys) ? keys : [keys]).map((k) => k.toLowerCase());

    // permissionData is array of modules: [{ moduleCode, moduleName, permissions: [...] }]
    return permissionData.some((module: any) => {
      const moduleCode = (module.moduleCode || "").toLowerCase();
      const moduleName = (module.moduleName || "").toLowerCase();
      return keysToCheck.some((key) => moduleCode === key || moduleName === key);
    });
  };
  const sidebarItems = [
    {
      label: "LOS",
      Link: "/LOS/Dashboard",
      img: Images.ApiManagementIcon,
      imgActive: Images.ApiManagementIconDark,
      active: pathname.split("/").includes("/LOS"),
      menu: [
      hasAccess("ADMIN") && {
         label: "Dashboard",
         LinkLable: "LOS",
         Link: "Dashboard",
         img: Images.dashboardIcon,
         imgActive: Images.dashboardIconActive,
         active: pathname.includes("/LOS/Dashboard"),
       },
    // {
    //   label: "Application Board",
    //   Link: "ApplicationBoard",
    //       LinkLable: "LOS",
    //   img: Images.applicationBoard,
    //   imgActive: Images.applicationBoardActive,
    //   active: pathname.split("/").includes("ApplicationBoard"),
    // },
    hasAccess("CUSTOMER") && {
      label: "Customer Management",
      Link: "/CustomerManagement/Leads",
      active: pathname.split("/").includes("CustomerManagement/Leads"),
      img: Images.CustomerManagementIcon,
      imgActive: Images.CustomerManagementIconDark,
          submenu: [
       
        // hasAccess("lead_module") && 
        {
          label: "Leads",
          Link: "Leads",
          LinkLable: "/LOS/CustomerManagement",
          active: pathname.includes("/Leads")||pathname.includes("/LeadDetails"),
        },
        // {
        //   label: "PEP Customers",
        //   Link: "PepCustomers",
        //   LinkLable: "/LOS/CustomerManagement",
        //   active: pathname.includes("/PepCustomers"),
        // },
        // {
        //   label: "All Customer Status",
        //   Link: "AllCustomerStatus",
        //   LinkLable: "/LOS/CustomerManagement",
        //   active: pathname.includes("/AllCustomerStatus"),
        // },
        // hasAccess("lead_module") && {
        //       label: "Leads Details",
        //       Link: "LeadDetails",
        //       LinkLable: "/LOS/CustomerManagement",
        //       active: pathname == "/LOS/CustomerManagement/LeadDetails",
        // },
        // {
        //   label: "Risk Customers",
        //   Link: "HighRiskUsers",
        //   LinkLable: "/LOS/CustomerManagement",
        //   active: pathname.includes("/HighRiskUsers"),
        // },
        // hasAccess("opportunity_module") && {
        //   label: "Opportunities",
        //   Link: "Opportunity",
        //       LinkLable: "/LOS/CustomerManagement",
        //   active: pathname.includes("/Opportunity"),
        //     },
        //     {
        //       label: "Sanctioned Customers",
        //       Link: "SanctionedCustomers",
        //       LinkLable: "/LOS/CustomerManagement",
        //       active: pathname.includes("/SanctionedCustomers"),
        // },
    
      
        // hasAccess("onboard_customers_module") && {
        //   label: "Onboard Customers",
        //   Link: "OnboardCustomers",
        //       LinkLable: "/LOS/CustomerManagement",
        //       active: pathname == "/LOS/CustomerManagement/OnboardCustomers",
        // },
        // hasAccess("customer_module") &&
         {
          label: "Customers",
          Link: "CustomerList",
              LinkLable: "/LOS/CustomerManagement",
          active: pathname.includes("/CustomerList") || pathname.includes("/CustomerDetails"),
        },
   
      ].filter(Boolean),
    },
  //  {
  //     label: "Devices",
  //     Link: "Devices",
  //     LinkLable: "/LOS/CustomerManagement",
  //     img: Images.CustomerManagementIcon,
  //     active: pathname.includes("/Devices"),
  //     submenu: [
  //       {
  //         label: "Devices",
  //         Link: "Devices",
  //         LinkLable: "/LOS/CustomerManagement",
  //         active: pathname.includes("/Devices"),
  //       },
  //       {
  //         label: "Blocked Devices",
  //         Link: "BlockedDevices",
  //         LinkLable: "/LOS/CustomerManagement",
  //         active: pathname.includes("/BlockedDevices"),
  //       },
  //     ],
  //   },
    hasAccess("PRODUCT") && {
      label: "Product Management",
      Link: "ProductManagement",
    LinkLable: "LOS",
      img: Images.productManagementIcon,
      imgActive: Images.productManagementIconActive,
      active: pathname.includes("/ProductManagement"),
      submenu: [
        {label: "Product Management",
          Link: "ProductManagement",
        LinkLable: "LOS",
          img: Images.productManagementIcon,
          imgActive: Images.productManagementIconActive},
        {
          label: "Contract Template",
          Link: "ContractTemplate",
          LinkLable: "/LOS/NotificationTemplate",
          active: pathname == "/LOS/NotificationTemplate/ContractTemplate",
        }
      ]
    },
    // hasAccess("department_management_module") &&
    // {
    //   label: "Department Management",
    //   Link: "DepartmentManagement/Departments",
    //       LinkLable: "LOS",
    //   img: Images.DepartmentManagementIcon,
    //   imgActive: Images.DepartmentManagementIconDark,
    //   active: pathname.includes("/DepartmentManagement"),
    //       submenu: [
    //     hasAccess("department_module") && {
    //       label: "Departments",
    //       Link: "Departments",
    //           LinkLable: "/LOS/DepartmentManagement",
    //           active: pathname.includes("/Departments"),
    //     },
    //     // hasAccess("department_permissions_module") && {
    //     //   label: "Department Permissions",
    //     //   Link: "DepartmentsPermissions",
    //     //       LinkLable: "/LOS/DepartmentManagement",
    //     //       active: pathname == "/LOS/DepartmentManagement/DepartmentsPermissions",
    //     // },
    //   ].filter(Boolean),
    // },
    hasAccess("WORKFLOW") && {
      label: "LOV",
      Link: "LOV/RevenueSource",
          LinkLable: "LOS",
      img: Images.LovIcon,
      imgActive: Images.LovIconDark,
      active: pathname.includes("/LOV"),
          submenu: [
        // {
        //   label: "Revenue Source",
        //   Link: "RevenueSource",
        //       LinkLable: "/LOS/LOV",
        //       active: pathname == "/LOS/LOV/RevenueSource",
        // },
        // {
        //   label: "Financing Purpose",
        //   Link: "FinancingPurpose",
        //   LinkLable: "/LOS/LOV",
        //       active: pathname == "/LOS/LOV/FinancingPurpose",
        // },
        // {
        //   label: "Checks Types",
        //   Link: "ChecksTypes",
        //       LinkLable: "/LOS/LOV",
        //       active: pathname == "/LOS/LOV/ChecksTypes",
        // },
        // {
        //   label: "Reasons Types",
        //   Link: "ReasonsTypes",
        //       LinkLable: "/LOS/LOV",
        //       active: pathname == "/LOS/LOV/ReasonsTypes",
        // },
        // {
        //   label: "Product Categories",
        //   Link: "ProductCategories",
        //       LinkLable: "/LOS/LOV",
        //       active: pathname == "/LOS/LOV/ProductCategories",
        // },
        // {
        //   label: "Product Types",
        //   Link: "ProductTypes",
        //       LinkLable: "/LOS/LOV",
        //       active: pathname == "/LOS/LOV/ProductTypes",
        // },
        // {
        //   label: "Commodity Types",
        //   Link: "CommodityTypes",
        //       LinkLable: "/LOS/LOV",
        //       active: pathname == "/LOS/LOV/CommodityTypes",
        //     },
            {
               label: "Source Of Income",
               Link: "SourceOfIncome",
               LinkLable: "/LOS/LOV",
               active: pathname == "/LOS/LOV/SourceOfIncome",
            },
            {
              label: "Source Of Wealth",
              Link: "SourceOfWealth",
              LinkLable: "/LOS/LOV",
              active: pathname == "/LOS/LOV/SourceOfWealth",
            },
            {
              label: "Source Of Funds",
              Link: "SourceOfFunds",
              LinkLable: "/LOS/LOV",
              active: pathname == "/LOS/LOV/SourceOfFunds",
            },
            {
              label: "Template Types",
              Link: "TemplateTypes",
              LinkLable: "/LOS/LOV",
              active: pathname == "/LOS/LOV/TemplateTypes",
            },
            {
              label: "Net Worth Ranges",
              Link: "NetWorthRanges",
              LinkLable: "/LOS/LOV",
              active: pathname == "/LOS/LOV/NetWorthRanges",
            },
            {
              label: "Purpose of Financing",
              Link: "PurposeofFinancing",
              LinkLable: "/LOS/LOV",
              active: pathname == "/LOS/LOV/PurposeofFinancing",
            },
            // {
            //   label: "Wealth Value",
            //   Link: "WealthValue",
            //   LinkLable: "/LOS/LOV",
            //   active: pathname == "/LOS/LOV/WealthValue",
            // },
            // {
            //   label: "Employment Sector",
            //   Link: "EmploymentSector",
            //   LinkLable: "/LOS/LOV",
            //   active: pathname == "/LOS/LOV/EmploymentSector",
            // },
            //  {
            //   label: "Profession Value",
            //   Link: "ProfessionValue",
            //   LinkLable: "/LOS/LOV",
            //   active: pathname.includes("/ProfessionValue"),
            // },
            // {
            //   label: "Cities List",
            //   Link: "CitiesList",
            //   LinkLable: "/LOS/LOV",
            //   active: pathname.includes("/CitiesList"),
            // },
            //  {
            //    label: "Countries List",
            //    Link: "CountriesList",
            //    LinkLable: "/LOS/LOV",
            //    active: pathname.includes("/CountriesList"),
            //  },
            /* {
              label: "Monthly Income",
              Link: "MonthlyIncome",
              LinkLable: "/LOS/LOV",
              active: pathname == "/LOS/LOV/MonthlyIncome",
            }, */
            // {
            //   label: "Wealth Ranges",
            //   Link: "WealthRanges",
            //   LinkLable: "/LOS/LOV",
            //   active: pathname.includes("/WealthRanges"),
            // },
            // {
            //   label: "Mandatory Reason Rescheduling",
            //   Link: "MandatoryReasonRescheduling",
            //   LinkLable: "/LOS/LOV",
            //   active: pathname.includes("/MandatoryReasonRescheduling"),
            // },
            // {
            //   label: "Optional Reason Rescheduling",
            //   Link: "OptionalReasonRescheduling",
            //   LinkLable: "/LOS/LOV",
            //   active: pathname.includes("/OptionalReasonRescheduling"),
            // },
            /* {
              label: "List Of Values",
              Link: "ListOfValues",
              LinkLable: "/LOS/LOV",
              active: pathname.includes("/ListOfValues"),
            } */
          ],
        },

    {
      label: "Risk Management",
      Link: "RiskManagement/BlacklistNid",
      LinkLable: "LOS",
      img: Images.LovIcon,
      imgActive: Images.LovIconDark,
      active: pathname.includes("/RiskManagement"),
      submenu: [
        {
          label: "Blacklist NID",
          Link: "BlacklistNid",
          LinkLable: "/LOS/RiskManagement",
          active: pathname == "/LOS/RiskManagement/BlacklistNid",
        },
        {
          label: "Blacklist Mobile",
          Link: "BlacklistMobile",
          LinkLable: "/LOS/RiskManagement",
          active: pathname == "/LOS/RiskManagement/BlacklistMobile",
        },
        {
          label: "Fraud Rule Management",
          Link: "FraudRuleManagement",
          LinkLable: "/LOS/RiskManagement",
          active: pathname == "/LOS/RiskManagement/FraudRuleManagement",
        },
      ],
    },

        // {
        //   label: "Notification",
        //   Link: "Notification",
        //   LinkLable: "LOS",
        //   img: Images.productManagementIcon,
        //   imgActive: Images.productManagementIconActive,
        //   active: pathname.split("/").includes("Notification"),
        // },
        //  {
        //   label: "Notification Template",
        //   Link: "/NotificationTemplate/SmsTemplate",
        //   active: pathname.split("/").includes("NotificationTemplate"),
        //   img: Images.CustomerManagementIcon,
        //   LinkLable: "LOS",
        //   imgActive: Images.CustomerManagementIconDark,
        //   menu: [
        //     {
        //       label: "SMS Template",
        //       Link: "SmsTemplate",
        //       LinkLable: "/LOS/NotificationTemplate",
        //       active: pathname == "/LOS/NotificationTemplate/SmsTemplate",
        //     },
        //     {
        //       label: "Push Template",
        //       Link: "PushTemplate",
        //       LinkLable: "/LOS/NotificationTemplate",
        //       active: pathname == "/LOS/NotificationTemplate/PushTemplate",
        //     },
        //     {
        //       label: "Email Template",
        //       Link: "EmailTemplate",
        //       LinkLable: "/LOS/NotificationTemplate",
        //       active: pathname == "/NotificationTemplate/EmailTemplate",
        //     },
        //     {
        //       label: "Contract Template",
        //       Link: "ContractTemplate",
        //       LinkLable: "/LOS/NotificationTemplate",
        //       active: pathname == "/LOS/NotificationTemplate/ContractTemplate",
        //     }
        //   ],
        // },
      
    // hasAccess("WORKFLOW") && {
    //   label: "Factoring Management",
    //   Link: "FinancingApplications/AllApplications",
    //       LinkLable: "LOS",
    //   img: Images.FinancingApplicationsIcon,
    //   imgActive: Images.FinancingApplicationsIconDark,
    //   active: pathname.includes("/FinancingApplications"),
    //       submenu: [
    //     // hasAccess("loan_application_module") &&
    //      {
    //       label: "All Applications",
    //       Link: "AllApplications",
    //           LinkLable: "/LOS/FinancingApplications",
    //           active: pathname.includes("/AllApplications"),
    //     },
    //     // hasAccess("loan_application_module") && 
    //     {
    //       label: "Pending Factoring",
    //       Link: "PendingFinancing",
    //           LinkLable: "/LOS/FinancingApplications",
    //           active: pathname.includes("/PendingFinancing"),
    //     },
    //     // hasAccess("loan_application_module") && 
    //     {
    //       label: "In Progress Factoring",
    //       Link: "InProgressFinancing",
    //           LinkLable: "/LOS/FinancingApplications",
    //           active: pathname.includes("/InProgressFinancing"),
    //     },
    //     // hasAccess("loan_application_module") && 
    //     {
    //       label: "Approved Factoring",
    //       Link: "ApprovedFinancing",
    //           LinkLable: "/LOS/FinancingApplications",
    //           active: pathname.includes("/ApprovedFinancing"),
    //     },
    //     // hasAccess("loan_application_module") && 
    //     {
    //       label: "Rejected Factoring",
    //       Link: "RejectedFinancing",
    //           LinkLable: "/LOS/FinancingApplications",
    //       active: pathname.includes("/RejectedFinancing"),
    //     },
    //     // hasAccess("loan_application_module") && 
    //     {
    //       label: "Incomplete Factoring",
    //       Link: "IncompleteFinancing",
    //           LinkLable: "/LOS/FinancingApplications",
    //       active: pathname.includes("/IncompleteFinancing"),
    //     },
    //     // hasAccess("loan_application_module") && 
    //     {
    //       label: "Canceled Factoring",
    //       Link: "CanceledFinancing",
    //           LinkLable: "/LOS/FinancingApplications",
    //           active: pathname.includes("/CanceledFinancing"),
    //     },
    //     // hasAccess("loan_application_module") && {
    //     //   label: "Rescheduling Request",
    //     //   Link: "ReschedulingRequest",
    //     //       LinkLable: "/LOS/FinancingApplications",
    //     //       active: pathname.includes("/ReschedulingRequest"),
    //     // },
    //     // hasAccess("loan_application_module") && {
    //     //   label: "Approved Rescheduled Applications",
    //     //   Link: "ApprovedRescheduledApplications",
    //     //       LinkLable: "/LOS/FinancingApplications",
    //     //       active: pathname.includes("/ApprovedRescheduledApplications"),
    //     // },
    //     // hasAccess("activity_logs_module") && {
    //     //   label: "Activity Logs",
    //     //   Link: "ActivityLogsFinancing",
    //     //       LinkLable: "/LOS/FinancingApplications",
    //     //       active: pathname == "/LOS/FinancingApplications/ActivityLogsFinancing",
    //     // },
    //   ].filter(Boolean),
    // },
    // {
    //   label: "Web Page Management",
    //   Link: "WebPageManagement/HeaderFooter",
    //   img: Images.HomePageManagementIcon,
    //   imgActive: Images.HomePageManagementIcon,
    //   LinkLable: "LOS",
    //   active: pathname.includes("/WebPageManagement"),
    //   menu: [
    //     {
    //       label: "Global Sections",
    //       Link: "GlobalSections",
    //       LinkLable: "/LOS/WebPageManagement",
    //       active: pathname.includes("/GlobalSections"),
    //     },
    //     {
    //       label: "Home Page",
    //       Link: "HomePage",
    //       LinkLable: "/LOS/WebPageManagement",
    //       active: pathname.includes("/HomePage"),
    //     },
    //     /* {
    //       label: "Career Page",
    //       Link: "CareerPage",
    //       LinkLable: "/LOS/WebPageManagement",
    //       active: pathname == "/LOS/WebPageManagement/CareerPage",
    //     }, */
    //     {
    //       label: "About Page",
    //       Link: "AboutPage",
    //       LinkLable: "/LOS/WebPageManagement",
    //       active: pathname.includes("/AboutPage"),
    //     },
    //     {
    //       label: "Privacy Policy Page",
    //       Link: "PrivacyPolicyTemplatePage",
    //       LinkLable: "/LOS/WebPageManagement",
    //       active: pathname.includes("/PrivacyPolicyTemplatePage"),
    //     },
    //     {
    //       label: "Terms Conditions Page",
    //       Link: "TermsConditionsTemplatePage",
    //       LinkLable: "/LOS/WebPageManagement",
    //       active: pathname.includes("/TermsConditionsTemplatePage"),
    //     },
    //     {
    //       label: "Faqs Page",
    //       Link: "FaqsTemplatePage",
    //       LinkLable: "/LOS/WebPageManagement",
    //       active: pathname.includes("/FaqsTemplatePage"),
    //     },
    //     {
    //       label: "Contact Us Page",
    //       Link: "ContactUsTemplatePage",
    //       LinkLable: "/LOS/WebPageManagement",
    //       active: pathname.includes("/ContactUsTemplatePage"),
    //     },
    //     {
    //       label: "Financial Statements Page",
    //       Link: "FinancialStatementsTemplatePage",
    //       LinkLable: "/LOS/WebPageManagement",
    //       active: pathname.includes("/FinancialStatementsTemplatePage"),
    //     },
    //   ],
    // },
    //     {
    //       label: "Merchant Management",
    //       Link: "MerchantManagement/MerchantList",
    //       LinkLable: "LOS",
    //       img: Images.DepartmentManagementIcon,
    //       imgActive: Images.DepartmentManagementIconDark,
    //       active: pathname.includes("/MerchantManagement"),
    //       menu: [
    //         {
    //           label: "Merchant List",
    //           Link: "MerchantList",
    //           LinkLable: "/LOS/MerchantManagement",
    //           active: pathname.includes("/MerchantList"),
    //         }
    //   ],
    // },
    // hasAccess("PARTNER") && {
    //   label: "Partner Management",
    //   Link: "PartnerManagement/PartnersList",
    //       LinkLable: "LOS",
    //   img: Images.PartnerManagementIcon,
    //   imgActive: Images.PartnerManagementIconDark,
    //   active: pathname.split("/").includes("PartnerManagement"),
    //       submenu: [
    //     // hasAccess("partner_module") &&
    //      {
    //       label: "Partners List",
    //       Link: "PartnersList",
    //           LinkLable: "/LOS/PartnerManagement",
    //           active: ["/LOS/PartnerManagement/PartnersList", "/PartnerManagement/PartnerAdminList"].includes(pathname),
    //     },
    //     // hasAccess("partner_module") && 
    //     {
    //       label:'Partners Commission',
    //       Link:"AllPartners",
    //           LinkLable: "/LOS/PartnerManagement",
    //           active: pathname.includes("/LOS/PartnerManagement/AllPartners"),
    //     }
    //   ].filter(Boolean),
    // },
    hasAccess(["ROLE", "PERMISSION"]) && {
      label: "Access Control Management",
      Link: "Setting/Employees",
          LinkLable: "LOS",
      img: Images.SettingsIcon,
      imgActive: Images.SettingsIconDark,
      active: pathname.split("/").includes("Setting"),
          submenu: [
            // {
            //   label: "Departments",
            //   Link: "Departments",
            //       LinkLable: "/LOS/DepartmentManagement",
            //       active: pathname.includes("/Departments"),
            // },
            // {
            //   label: "Department Permissions",
            //   Link: "DepartmentsPermissions",
            //       LinkLable: "/LOS/DepartmentManagement",
            //       active: pathname.includes("/LOS/DepartmentManagement/DepartmentsPermissions"),
            // },
            {
              label: "Employees",
              Link: "Employees",
              LinkLable: "/LOS/Setting",
              active: pathname.includes("/LOS/Setting/Employees"),
            },
            hasAccess("ROLE") && {
              label: "Manage Roles",
              Link: "RoleList",
              LinkLable: "/LOS/Setting",
              active: pathname.includes("/LOS/Setting/RoleList"),
            },
            hasAccess("PERMISSION") && {
              label: "Manage Permissions",
              Link: "AssignPermissions",
              LinkLable: "/LOS/Setting",
              active: pathname.includes("/LOS/Setting/AssignPermissions"),
            },
      ].filter(Boolean),
    },
    // hasAccess("setting_module") &&
    // {
    //   label: "Settings",
    //   Link: "Settings/AwnInfo",
    //   LinkLable: "LOS",
    //   img: Images.SettingsIcon,
    //   imgActive: Images.SettingsIconDark,
    //   active: pathname.split("/").includes("Settings"),
    //   submenu: [
    //     // hasAccess("awn_info_module") && 
    //     {
    //       label: "Factoring Valley Info",
    //       Link: "AwnInfo",
    //       LinkLable: "/LOS/Settings",
    //       active: pathname.includes("/LOS/Settings/AwnInfo"),
    //     },
    //     // hasAccess("compliance_module") &&
    //      {
    //       label: "Compliance Requirement",
    //       Link: "ComplianceRequirement",
    //       LinkLable: "/LOS/Settings",
    //       active: pathname.includes("/LOS/Settings/ComplianceRequirement"),
    //     },
    //      {
    //       label: "Block History",
    //       Link: "BlockHistory",
    //       LinkLable: "/LOS/Settings",
    //       active: pathname.includes("/LOS/Settings/BlockHistory"),
    //     },
    //   ].filter(Boolean),
    // },
    // hasAccess("block_code_module") &&
    // {
    //   label: "Block Codes",
    //   Link: "BlockCodes",
    //   LinkLable: "/LOS",
    //   img: Images.SettingsIcon,
    //   imgActive: Images.SettingsIconDark,
    //   active: pathname.split("/").includes("BlockCodes"),
    //   submenu: [
    //     {
    //       label: "All Block Codes",
    //       Link: "AllBlockCodes",
    //       LinkLable: "/LOS/BlockCodes",
    //       active: pathname.includes("/LOS/BlockCodes/AllBlockCodes"),
    //     },
    //     {
    //       label: "Compliance",
    //       Link: "Compliance",
    //       LinkLable: "/LOS/BlockCodes",
    //       active: pathname.includes("/LOS/BlockCodes/Compliance"),
    //     },
    //     {
    //       label: "AML",
    //       Link: "AML",
    //       LinkLable: "/LOS/BlockCodes",
    //       active: pathname.includes("/LOS/BlockCodes/AML"),
    //     },
    //     {
    //       label: "Anti-Fraud",
    //       Link: "AntiFraud",
    //       LinkLable: "/LOS/BlockCodes",
    //       active: pathname.includes("/LOS/BlockCodes/AntiFraud"),
    //     },
    //     {
    //       label: "Sanction",
    //       Link: "Sanction",
    //       LinkLable: "/LOS/BlockCodes",
    //       active: pathname.includes("/LOS/BlockCodes/Sanction"),
    //     },
    //   ].filter(Boolean),
    // },
    // {
    //   label: "Home Page Management",
    //   Link: "HomePageManagement",
    //       LinkLable: "LOS",
    //   img: Images.HomePageManagementIcon,
    //   imgActive: Images.HomePageManagementIconActive,
    //   active: pathname.split("/").includes("HomePageManagement"),
    // },
    // {
    //   label: "Landing Page Management",
    //   Link: "LandingPageManagement",
    //       LinkLable: "LOS",
    //   img: Images.HomePageManagementIcon,
    //   imgActive: Images.HomePageManagementIconActive,
    //   active: pathname.split("/").includes("LandingPageManagement"),
    // },
    // hasAccess("api_module") &&
    // {
    //   label: "API Management",
    //   Link: "APIManagement/AllAPIs",
    //       LinkLable: "LOS",
    //   img: Images.ApiManagementIcon,
    //   imgActive: Images.ApiManagementIconDark,
    //   active: pathname.split("/").includes("APIManagement"),
    //       submenu: [
    //     hasAccess("api_module") && {
    //       label: "All APIs",
    //       Link: "AllAPIs",
    //           LinkLable: "/LOS/APIManagement",
    //           active: pathname.includes("/LOS/APIManagement/AllAPIs"),
    //         },
    //       ].filter(Boolean),
    //     },
        // {
        //   label: "Notification System",
        //   Link: "Notification/Channels",
        //   img: Images.notification,
        //   imgActive: Images.notification,
        //   active: pathname.split("/").includes("Notification"),
        //   submenu: [
        //     {
        //       label: "Channels",
        //       Link: "Channels",
        //       LinkLable: "/LOS/Notification",
        //       active: pathname.includes("/LOS/Notification/Channels"),
        //     },
        //     {
        //       label: "Languages",
        //       Link: "Languages",
        //       LinkLable: "/LOS/Notification",
        //       active: pathname.includes("/LOS/Notification/Languages"),
        //     },
        //     {
        //       label: "Templates",
        //       Link: "Templates",
        //       LinkLable: "/LOS/Notification",
        //       active: pathname.includes("/LOS/Notification/Templates"),
        //     },
        //     {
        //       label: "Template Channels",
        //       Link: "TemplateChannels",
        //       LinkLable: "/LOS/Notification",
        //       active: pathname.includes("/LOS/Notification/TemplateChannels"),
        //     },
        //     {
        //       label: "Users",
        //       Link: "Users",
        //       LinkLable: "/LOS/Notification",
        //       active: pathname.includes("/LOS/Notification/Users"),
        //     },
        //     {
        //       label: "User Preferences",
        //       Link: "UserPreferences",
        //       LinkLable: "/LOS/Notification",
        //       active: pathname.includes("/LOS/Notification/UserPreferences"),
        //     },
        //     {
        //       label: "System Preferences",
        //       Link: "SystemPreferences",
        //       LinkLable: "/LOS/Notification",
        //       active: pathname.includes("/LOS/Notification/SystemPreferences"),
        //     },
        //     {
        //       label: "Template Variables",
        //       Link: "TemplateVariables",
        //       LinkLable: "/LOS/Notification",
        //       active: pathname.includes("/LOS/Notification/TemplateVariables"),
        //     },
        //   ],
        // },
      ],
    },


  
    {
      label: "LMS",
      Link: "Lms/dashboard",
      img: Images.HomePageManagementIcon,
      imgActive: Images.HomePageManagementIconActive,
      active: pathname.split("/").includes("Lms/dashboard"),
      menu: [
        {
          label: "Dashboard",
          Link: `dashboard`,
          LinkLable: "Lms",
          img: Images.dashboardIcon,
          active: pathname.includes("/Lms/dashboard"),
          // == "/Lms/dashboard",
        },
    
        // hasAccess("customer_dashboard_module") &&
        // {
        //   label: "Customers",
        //   Link: "Customers/AllCustomers",
        //   LinkLable: "/Lms",
        //   img: Images.CustomerManagementIcon,
        //   active: pathname.split("/").includes("Customers"),
      
        // },
    
        // hasAccess("loan_module") &&
        {
          label: "Loan Management",
          Link: "loanmanagement",
          img: Images.loanIcon,
          LinkLable: "/Lms",
          active: pathname.split("/").includes("LoanManagement"),
          submenu: [
            // hasAccess("loan_application_module") && 
            {
              label: "All Applications",
              Link: "ApplicationManagement",
              LinkLable: "/Lms/LoanManagement",
              active: pathname.includes("/Lms/LoanManagement/ApplicationManagement"),
            },
    
            // {
            //   label: "Invoice Management",
            //   Link: "invoicemanagement",
            //   LinkLable: "LoanManagement",
            //   active: pathname == "/Lms/LoanManagement/invoicemanagement",
            // },
    
            // {
            //   label: "Other Fees/Charges",
            //   Link: "OtherFee",
            //   LinkLable: "/Lms/LoanManagement",
            //   active: pathname.includes("/Lms/LoanManagement/OtherFee"),
            // },
          ].filter(Boolean),
        },
     
        // {
        //   label: "Department Management",
        //   Link: "departmentmanagement",
        //   img: Images.DepartmentManagementIcon,
        //   active: pathname.split("/").includes("DepartmentManagement"),
        //   submenu: [
        //     {
        //       label: "Department",
        //       Link: "all-departments",
        //       LinkLable: "/Lms/DepartmentManagement",
        //       active: pathname == "/Lms/DepartmentManagement/all-departments",
        //     },
        //     // {
        //     //   label: "Department Permissions",
        //     //   Link: "permission",
        //     //   LinkLable: "/Lms/DepartmentManagement",
        //     //   active: pathname == "/Lms/DepartmentManagement/permission",
        //     // },
        //   ],
        // },
        // hasAccess("reports_module") &&
        // {
        //   label: "Reports",
        //   Link: "Reports",
        //   img: Images.reportsIconDark,
        //   active: pathname.split("/").includes("Reports"),
        //   submenu: [
        //     //  hasAccess("account_report_module") && 
        //      {
        //       label: "Account Report",
        //       Link: "AccountReportsList",
        //       LinkLable: "/Lms/Reports",
        //       active: pathname.includes("/Lms/Reports/AccountReportsList"),
    
        //     },
        //     //  hasAccess("simah_report_module") &&
        //       {
        //       label: "Simah Report",
        //       Link: "SimahReportsList",
        //       LinkLable: "/Lms/Reports",
        //       active: pathname.includes("/Lms/Reports/SimahReportsList"),
    
        //     },
        //     // hasAccess("accounting_financing_module") && {
        //     //   label: "Accounting & Financing",
        //     //   Link: "AccountingFinancing",
        //     //   LinkLable: "/Lms/Reports",
        //     //   active: pathname.split("/").includes("AccountingFinancing"),
        //     //   menu: [
        //     //     hasAccess("voucher_module") && {
        //     //       label: "Voucher",
        //     //       link: "vouchers",
        //     //       linkLable: "AccountingFinancing",
        //     //       active: pathname.split("/").includes("vouchers"),
        //     //     },
        //     //     hasAccess("day_book_module") && {
        //     //       label: "Day Book",
        //     //       link: "daybook",
        //     //       linkLable: "AccountingFinancing",
        //     //       active: pathname.split("/").includes("daybook"),
        //     //     },
        //     //     hasAccess("trial_balance_module") && {
        //     //       label: "Trial Balance",
        //     //       link: "trialbalance",
        //     //       linkLable: "AccountingFinancing",
        //     //       active: pathname.split("/").includes("trialbalance"),
        //     //     },
        //     //     hasAccess("ledger_module") && {
        //     //       label: "Ledger",
        //     //       link: "ledger",
        //     //       linkLable: "AccountingFinancing",
        //     //       active: pathname.split("/").includes("ledger"),
        //     //     },
        //     //   ].filter(Boolean),
        //     // },
        //     // {
        //     //   label: "Loans Reports",
        //     //   Link: "loans",
        //     //   LinkLable: "/Lms/Reports",
        //     //   active: pathname.split("/").includes("loans"),
        //     //   submenu: [
        //     //     hasAccess("overdue_loan_module") && {
        //     //       label: "Overdue Loan",
        //     //       link: "overdue",
        //     //       linkLable: "loans",
        //     //       active: pathname.split("/").includes("overdue"),
        //     //     },
        //     //     hasAccess("non_performing_loan_module") && {
        //     //       label: "Non Performing Loan",
        //     //       link: "performingLoans",
        //     //       linkLable: "loans",
        //     //       active: pathname.split("/").includes("performingLoans"),
        //     //     },
        //     //     hasAccess("due_loan_module") && {
        //     //       label: "Due Loan",
        //     //       link: "due",
        //     //       linkLable: "loans",
        //     //       active: pathname.split("/").includes("due"),
        //     //     },
        //     //     hasAccess("early_settlement_module") && {
        //     //       label: "Early Settlement",
        //     //       link: "earlySettlement",
        //     //       linkLable: "loans",
        //     //       active: pathname.split("/").includes("earlySettlement"),
        //     //     },
        //     //     hasAccess("write_off_loan_module") && {
        //     //       label: "Write Off Loan",
        //     //       link: "writeOff",
        //     //       linkLable: "loans",
        //     //       active: pathname.split("/").includes("writeOff"),
        //     //     },
        //     //   ].filter(Boolean),
        //     // },
        //   ].filter(Boolean),
        // },
        // hasAccess("accounting_financing_module") &&
        // {
        //   label: "Accounting & Financing",
        //   Link: "AccountingFinancing",
        //   img: Images.reportsIconDark,
        //   active: pathname.split("/").includes("AccountingFinancing"),
        //   submenu: [
        //         // hasAccess("voucher_module") && 
        //         {
        //           label: "Voucher",
        //           link: "vouchers",
        //           linkLable: "/Lms/Reports/AccountingFinancing",
        //           active: pathname.split("/").includes("vouchers"),
        //         },
        //         // hasAccess("day_book_module") &&
        //          {
        //           label: "Day Book",
        //           link: "daybook",
        //           linkLable: "/Lms/Reports/AccountingFinancing",
        //           active: pathname.split("/").includes("daybook"),
        //         },
        //         // hasAccess("trial_balance_module") &&
        //          {
        //           label: "Trial Balance",
        //           link: "trialbalance",
        //           linkLable: "/Lms/Reports/AccountingFinancing",
        //           active: pathname.split("/").includes("trialbalance"),
        //         },
        //         // hasAccess("ledger_module") &&
        //          {
        //           label: "Ledger",
        //           link: "ledger",
        //           linkLable: "/Lms/Reports/AccountingFinancing",
        //           active: pathname.split("/").includes("ledger"),
        //         },
              
        //   ].filter(Boolean),
        // },
        // hasAccess("accounting_financing_module") &&
        // {
        //   label: "Loans Reports",
        //   Link: "loans",
        //   img: Images.reportsIconDark,
        //   active: pathname.split("/").includes("loans"),
        //   submenu: [ 
        //     // {
        //       // label: "Loans Reports",
        //       // Link: "loans",
        //       // LinkLable: "/Lms/Reports",
        //       // active: pathname.split("/").includes("loans"),
        //       // submenu: [
        //         // hasAccess("overdue_loan_module") &&
        //          {
        //           label: "Overdue Loan",
        //           link: "overdue",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("overdue"),
        //         },
        //         // hasAccess("non_performing_loan_module") &&
        //          {
        //           label: "Non Performing Loan",
        //           link: "performingLoans",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("performingLoans"),
        //         },
        //         // hasAccess("due_loan_module") &&
        //          {
        //           label: "Due Loan",
        //           link: "due",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("due"),
        //         },
        //         // hasAccess("early_settlement_module") &&
        //          {
        //           label: "Early Settlement",
        //           link: "earlySettlement",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("earlySettlement"),
        //         },
        //         // hasAccess("write_off_loan_module") &&
        //          {
        //           label: "Write Off Loan",
        //           link: "writeOff",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("writeOff"),
        //         },
        //         {
        //           label: "Loan Disbursement Report",
        //           link: "loanDisbursementReport",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("loanDisbursementReport"),
        //         },
        //         {
        //           label: "Repayment Schedule Report",
        //           link: "repaymentScheduleReport",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("repaymentScheduleReport"),
        //         },
        //         {
        //           label: "Daily Transaction Summary",
        //           link: "dailyTransactionSummary",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("dailyTransactionSummary"),
        //         },
        //         {
        //           label: "Loan Balance & Outstanding Report",
        //           link: "loanBalanceReport",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("loanBalanceReport"),
        //         },
        //         {
        //           label: "Product Wise Profit & Loss",
        //           link: "productWiseProfitLoss",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("productWiseProfitLoss"),
        //         },
        //         {
        //           label: "Loan History Report",
        //           link: "loanHistoryReport",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("loanHistoryReport"),
        //         },
        //         {
        //           label: "Customer Statement of Account",
        //           link: "customerAccountStatement",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("customerAccountStatement"),
        //         },
        //         {
        //           label: "Customer Wise Profit & Loss",
        //           link: "customerWiseProfitLoss",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("customerWiseProfitLoss"),
        //         },
        //         {
        //           label: "Collections Due Report",
        //           link: "collectionsDueReport",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("collectionsDueReport"),
        //         },
        //         {
        //           label: "Skipped Installments Report",
        //           link: "skippedInstallmentsReport",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("skippedInstallmentsReport"),
        //         },
        //         /* {
        //           label: "Product Performance Report",
        //           link: "productPerformanceReport",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("productPerformanceReport"),
        //         }, */
        //         {
        //           label: "Top Borrowers Report",
        //           link: "topBorrowersReport",
        //           linkLable: "/Lms/Reports/loans",
        //           active: pathname.split("/").includes("topBorrowersReport"),
        //         },
        //       // ].filter(Boolean),
        //     // },
        //   ].filter(Boolean),
        // },
        // hasAccess("accounting_financing_module") &&
        // {
        //   label: "Chart of account",
        //   Link: "ChartOfAccount",
        //   active: pathname.split("/").includes("ChartOfAccount"),
        //   img: Images.accountCharts,
        //   submenu: [
        //     // hasAccess("chart_of_account_module") &&
        //      {
        //       label: "Chart of account",
        //       Link: "ChartOfAccount",
        //       LinkLable: "/Lms/ChartOfAccount",
        //       active: pathname.includes("/Lms/ChartOfAccount/ChartOfAccount"),
        //     },
        //     //hasAccess("coa_configuration_module") &&
        //      {
        //       label: "COA Configuration",
        //       Link: "CoaConfiguration",
        //       LinkLable: "/Lms/ChartOfAccount",
        //       active: pathname.includes("/Lms/ChartOfAccount/CoaConfiguration"),
        //     },
        //   ].filter(Boolean),
        // },
     
        // {
        //   label: "Setting",
        //   Link: "notification",
        //   img: Images.SettingsIcon,
        //   active: pathname.split("/").includes("Setting"),
        //   submenu: [
        //     // {
        //     //   label: "Product Management",
        //     //   Link: "ProductManagement",
        //     //   LinkLable: "Setting",
        //     //   active: pathname == "/Lms/Setting/ProductManagement",
        //     // },
        //     {
        //       label: "Product Fee",
        //       Link: "ProductFee",
        //       LinkLable: "/Lms/Setting",
        //       active: pathname.includes("/Lms/Setting/ProductFee"),
        //     },
        //     // hasAccess("delinquency_module") && 
        //     {
        //       label: "Delinquency",
        //       Link: "Deliquency",
        //       LinkLable: "/Lms/Setting",
        //       active: pathname.includes("/Lms/Setting/Deliquency"),
        //     },
        //     // hasAccess("workflow_mapping_module") && 
        //     {
        //       label: "Work Flow Mapping",
        //       Link: "WorkFlowMapping",
        //       LinkLable: "/Lms/Setting",
        //       active: pathname.includes("/Lms/Setting/WorkFlowMapping"),
        //     },
        //     // hasAccess("invoice_management_admin_module") && 
        //     {
        //       label: "Invoice Setting",
        //       Link: "InvoiceSetting",
        //       LinkLable: "/Lms/Setting",
        //       active: pathname.includes("/Lms/Setting/InvoiceSetting"),
        //     },
        //     // {
        //     //   label: "Calculator",
        //     //   Link: "Calculator",
        //     //   LinkLable: "Setting",
        //     //   active: pathname == "/Lms/Setting/Calculator",
        //     // },
        //     // {
        //     //   label: "Search Function",
        //     //   Link: "pdcmanagement",
        //     //   LinkLable: "Setting",
        //     //   active: pathname == "/pdcmanagement",
        //     // },
    
        //     // {
        //     //   label: "Securization",
        //     //   Link: "escrowmanagement",
        //     //   LinkLable: "Setting",
        //     //   active: pathname == "/escrowmanagement",
        //     // },
        //     // {
        //     //   label: "Tools",
        //     //   Link: "transactionmanagement",
        //     //   LinkLable: "Setting",
        //     //   active: pathname == "/transactionmanagement",
        //     // },
        //     // {
        //     //   label: "Interface",
        //     //   Link: "pdcmanagement",
        //     //   LinkLable: "Setting",
        //     //   active: pathname == "/pdcmanagement",
        //     // },
        //     // {
        //     //   label: "Pending Event Actions",
        //     //   Link: "escrowmanagement",
        //     //   LinkLable: "Setting",
        //     //   active: pathname == "/escrowmanagement",
        //     // },
        //   ].filter(Boolean),
        // },
        // hasAccess("system_logs_module") &&
        // {
        //   label: "Logs",
        //   Link: "Logs",
        //   img: Images.logsIcon,
        //   active: pathname.split("/").includes("Logs"),
        //   submenu: [
        //      // hasAccess("system_logs_module") && 
        //      {
        //       label: "Logs",
        //       Link: "AllLogs",
        //       LinkLable: "/Lms/Logs",
        //       active: pathname.includes("/Lms/Logs/AllLogs"),
        //     },
        //      // hasAccess("system_logs_module") && 
        //      {
        //       label: "Api Logs",
        //       Link: "ApiLogs",
        //       LinkLable: "/Lms/Logs",
        //       active: pathname.includes("/Lms/Logs/ApiLogs"),
        //     },
        //     // hasAccess("disburse_api_logs_module") && 
        //     {
        //       label: "Disburse Amount Api Logs",
        //       Link: "DisburseApprovedAmountApiLogs",
        //       LinkLable: "/Lms/Logs",
        //       active: pathname.includes("/Lms/Logs/DisburseApprovedAmountApiLogs"),
        //     },
        //   ].filter(Boolean),
        // },
        // {
        //   label: "Commodity Management",
        //   Link: "CommodityManagement",
        //   img: Images.logsIcon,
        //   active: pathname.split("/").includes("CommodityManagement"),
        //   submenu: [
        //       {
        //         label: "Commodity List",
        //         Link: "CommodityList",
                
        //         LinkLable: "/Lms/CommodityManagement",
        //         active: pathname.includes("/Lms/CommodityManagement/CommodityList"),
        //       },
        //       {
        //         label: "Commodity Supplier",
        //         Link: "CommoditySupplier",
        //         LinkLable: "/Lms/CommodityManagement",
        //         active: pathname.includes("/Lms/CommodityManagement/CommoditySupplier"),
        //     },
        //   ],
        // },
        //    {
        //   label: "Reconciliation",
        //   Link: "Reconciliation/Dashboard",
        //   active: pathname.split("/").includes("Reconciliation"),
        //   img: Images.LovIcon,
        //   submenu: [
        //     {
        //       label: "Reconciliation Dashboard",
        //       Link: "Dashboard",
        //       LinkLable: "/Lms/Reconciliation",
        //       active: pathname.includes("/Lms/Reconciliation/Dashboard"),
        //     },
        //     {
        //       label: "Transactions Logs",
        //       Link: "Transactions",
        //       LinkLable: "/Lms/Reconciliation",
        //       active: pathname.includes("/Lms/Reconciliation/Transactions"),
        //     },
        //     {
        //       label: "Operational Expenses",
        //       Link: "OperationalExpenses",
        //       LinkLable: "/Lms/Reconciliation",
        //       active: pathname.includes("/Lms/Reconciliation/OperationalExpenses"),
        //     },
        //     {
        //       label: "Reconciliation Summary",
        //       Link: "ReconciliationSummary",
        //       LinkLable: "/Lms/Reconciliation",
        //       active: pathname.includes("/Lms/Reconciliation/ReconciliationSummary"),
        //     },
        //     {
        //       label: "Error Report",
        //       Link: "ErrorReport",
        //       LinkLable: "/Lms/Reconciliation",
        //       active: pathname.includes("/Lms/Reconciliation/ErrorReport"),
        //     },
        //     {
        //       label: "Transaction Accounts",
        //       Link: "TransactionAccounts",
        //       LinkLable: "/Lms/Reconciliation",
        //       active: pathname.includes("/Lms/Reconciliation/TransactionAccounts"),
        //     },
        //   ],
        // },
     
        // {
        //   label: "Expenses",
        //   Link: `/Lms/Expenses/ThirdPartyExpense`,
        //   img: Images.LovIcon,
        //   active:pathname.split("/").includes("Expenses"),
        //   submenu: [
        //     {
        //        label: "Third Party Expense",
        //        Link: `ThirdPartyExpense`,
        //        LinkLable: "/Lms/Expenses",
        //        img: "",
        //        active: pathname == "/Lms/Expenses/ThirdPartyExpense",
        //     },
        //     {
        //        label: "Loan Application Expenses",
        //        Link: `LoanApplicationExpenses`,
        //        LinkLable: "/Lms/Expenses",
        //        img: "",
        //        active: pathname == "/Lms/Expenses/LoanApplicationExpenses",
        //     },
        //     {
        //        label: "Onboarding Expenses",
        //        Link: `OnboardingExpenses`,
        //        LinkLable: "/Lms/Expenses",
        //        img: "",
        //        active: pathname == "/Lms/Expenses/OnboardingExpenses",
        //     },
    
          
        //   ],
        // },
      ],
    },
  
    // {
    //   label: "CMS",
    //   Link: "cms/dashboard",
    //   img: Images.HomePageManagementIcon,
    //   imgActive: Images.HomePageManagementIconActive,
    //   active: pathname.split("/").includes("cms/dashboard"),
    //   menu: [
    //     {
    //       label: "Dashboard",
    //       Link: `dashboard`,
    //       LinkLable: "cms",
    //       img: Images.dashboardIcon,
    //       active: pathname.includes("/cms/dashboard"),
    //     },
    //     {
    //       label: "All Tickets",
    //       Link: "Tickets/AllTickets",
    //       LinkLable: "cms",
    //       img: Images.allTickets,
    //       active: pathname.split("/").includes("AllTickets"),
    //     },
    //     {
    //       label: "Tickets",
    //       Link: "Tickets/GetTickets",
    //       LinkLable: "cms",
    //       img: Images.tickets,
    //       active: pathname.split("/").includes("GetTickets") && !pathname.includes("AllTickets") && !pathname.includes("MyTickets"),
    //     },
    //     {
    //       label: "My Tickets",
    //       Link: "Tickets/MyTickets",
    //       LinkLable: "cms",
    //       img: Images.myTickets,
    //       active: pathname.split("/").includes("MyTickets"),
    //     },
    //     {
    //       label: "Reports",
    //       Link: "Reports",
    //       LinkLable: "cms",
    //       img: Images.reportsIconDark,
    //       active: pathname.split("/").includes("Reports"),
    //     },
    //     {
    //       label: "Priorities",
    //       Link: "Priorities",
    //       LinkLable: "cms",
    //       img: Images.priorities,
    //       active: pathname.split("/").includes("Priorities"),
    //     },
    //     {
    //       label: "Categories",
    //       Link: "Categories",
    //       LinkLable: "cms",
    //       img: Images.categories,
    //       active: pathname.split("/").includes("Categories") && !pathname.includes("SubCategories"),
    //     },
    //     {
    //       label: "Sub Categories",
    //       Link: "SubCategories",
    //       LinkLable: "cms",
    //       img: Images.categories,
    //       active: pathname.split("/").includes("SubCategories"),
    //     },
    //     {
    //       label: "Escalation",
    //       Link: "Escalation",
    //       LinkLable: "cms",
    //       img: Images.escalation,
    //       active: pathname.split("/").includes("Escalation"),
    //     },
    //     {
    //       label: "Customers",
    //       Link: "Customers",
    //       LinkLable: "cms",
    //       img: Images.CustomerManagementIcon,
    //       active: pathname.split("/").includes("Customers"),
    //     },
    //     {
    //       label: "Logs",
    //       Link: "Logs",
    //       LinkLable: "cms",
    //       img: Images.logsIcon,
    //       active: pathname.split("/").includes("Logs"),
    //     },
      
    //   ],
      
    // },
      {
        label: "Connector Management",
        Link: "/ThirdPartyManagement/Providers",
        img: Images.ApiManagementIcon,
        imgActive: Images.ApiManagementIconDark,
        active: pathname.split("/").includes("/ThirdPartyManagement"),
        menu: [
          // {
          //   label: "Dashboard",
          //   Link: "Dashboard",
          //   LinkLable: "/ThirdPartyManagement",
          //   img: Images.dashboardIcon,
          //   active: pathname.includes("/ThirdPartyManagement/Dashboard"),
          // },
          {
            label: "Providers",
            Link: "Providers",
            LinkLable: "/ThirdPartyManagement",
            img: Images.PartnerManagementIcon,
            active: pathname.includes("/ThirdPartyManagement/Providers"),
          },
          {
            label: "Environment Settings",
            Link: "EnvironmentSettings",
            LinkLable: "/ThirdPartyManagement",
            img: Images.SettingsIcon,
            active: pathname.split("/").includes("/ThirdPartyManagement/EnvironmentSettings"),
            submenu: [
              {
                label: "Services List",
                Link: "EnvironmentSettings/ServicesList",
                LinkLable: "/ThirdPartyManagement",
                active: pathname.includes("/ThirdPartyManagement/EnvironmentSettings/ServicesList"),
              },
            ],
          },
          {
            label: "Clients Management",
            Link: "Clients",
            LinkLable: "/ThirdPartyManagement",
            img: Images.CustomerManagementIcon,
            active: pathname.split("/").includes("Clients") || pathname.split("/").includes("ClientRequests"),
            submenu: [
              {
                label: "Clients",
                Link: "Clients",
                LinkLable: "/ThirdPartyManagement",
                active: pathname.includes("/ThirdPartyManagement/Clients"),
              },
              // {
              //   label: "Dev Client Requests",
              //   Link: "DevClientRequests",
              //   LinkLable: "/ThirdPartyManagement",
              //   active: pathname == "/ThirdPartyManagement/DevClientRequests",
              // },
              // {
              //   label: "Prod Client Requests",
              //   Link: "ProdClientRequests",
              //   LinkLable: "/ThirdPartyManagement",
              //   active: pathname == "/ThirdPartyManagement/ProdClientRequests",
              // },
              // {
              //   label: "Client Service Requests",
              //   Link: "ClientServiceRequests",
              //   LinkLable: "/ThirdPartyManagement",
              //   active: pathname == "/ThirdPartyManagement/ClientServiceRequests",
              // },
            ],
          },
          {
            label: "Services Management",
            Link: "Services",
            LinkLable: "/ThirdPartyManagement",
            img: Images.logsIcon,
            active: pathname.split("/").includes("Services") || pathname.split("/").includes("EnvironmentSettings"),
            submenu: [
              {
                label: "All Services",
                Link: "Services",
                LinkLable: "/ThirdPartyManagement",
                active: pathname.includes("/ThirdPartyManagement/Services"),
              },
              {
                label: "Services API",
                Link: "Services/Apis",
                LinkLable: "/ThirdPartyManagement",
                active: pathname.includes("/ThirdPartyManagement/Services/Apis"),
              },
              {
                label: "Services Environment",
                Link: "Services/Environment",
                LinkLable: "/ThirdPartyManagement",
                active: pathname.includes("/ThirdPartyManagement/Services/Environment"),
              },
            ],
          },
          {
            label: "Environment APIs",
            Link: "AllEnvironment",
            LinkLable: "/ThirdPartyManagement",
            img: Images.logsIcon,
            active: pathname.split("/").includes("AllEnvironment") || pathname.split("/").includes("EnvConfig") || pathname.split("/").includes("ExportCsv"),
            submenu: [
              {
                label: "All Environment",
                Link: "AllEnvironment",
                LinkLable: "/ThirdPartyManagement",
                active: pathname.includes("/ThirdPartyManagement/AllEnvironment"),
              },
              {
                label: "Env Config",
                Link: "EnvConfig",
                LinkLable: "/ThirdPartyManagement",
                active: pathname.includes("/ThirdPartyManagement/EnvConfig"),
              },
              {
                label: "Export CSV",
                Link: "ExportCsv",
                LinkLable: "/ThirdPartyManagement",
                active: pathname.includes("/ThirdPartyManagement/ExportCsv"),
              },
            ],
          },
           {
             label: "Request History",
             Link: "RequestHistory",
             LinkLable: "/ThirdPartyManagement",
             img: Images.logsIcon,
             active: pathname.split("/").includes("/ThirdPartyManagement/RequestHistory"),
             submenu: [
               {
                 label: "Client Request Prod",
                 Link: "RequestHistory/ClientRequestProd",
                 LinkLable: "/ThirdPartyManagement",
                 active: pathname.includes("/ThirdPartyManagement/RequestHistory/ClientRequestProd"),
               },
               {
                 label: "Client Request Dev",
                 Link: "RequestHistory/ClientRequestDev",
                 LinkLable: "/ThirdPartyManagement",
                 active: pathname.includes("/ThirdPartyManagement/RequestHistory/ClientRequestDev"),
               },
               /* {
                 label: "Request Detail",
                 Link: "RequestHistory/RequestDetail",
                 LinkLable: "/ThirdPartyManagement",
                 active: pathname.split("/").includes("/ThirdPartyManagement/RequestHistory/RequestDetail"),
               }, */
               {
                 label: "Request Service",
                 Link: "RequestHistory/RequestService",
                 LinkLable: "/ThirdPartyManagement",
                 active: pathname.includes("/ThirdPartyManagement/RequestHistory/RequestService"),
              },
            ],
          },
           /* {
             label: "System Logs",
             Link: "SystemLogs",
             LinkLable: "/ThirdPartyManagement",
             img: Images.logsIcon,
             active: pathname.split("/").includes("/ThirdPartyManagement/SystemLogs"),
             submenu: [
               {
                 label: "Laravel Logs",
                 Link: "LaravelLogs",
                 LinkLable: "/ThirdPartyManagement/SystemLogs",
                 active: pathname == "/ThirdPartyManagement/SystemLogs/LaravelLogs",
               },
             ],
           }, */
          //  {
          //    label: "Settings",
          //    Link: "Setting/Employees",
          //    LinkLable: "/ThirdPartyManagement",
          //    img: Images.SettingsIcon,
          //    imgActive: Images.SettingsIconDark,
          //    active: pathname.split("/").includes("/ThirdPartyManagement/Setting"),
          //    submenu: [
          //      {
          //        label: "Employees",
          //        Link: "Employees",
          //        LinkLable: "/ThirdPartyManagement/Setting",
          //        active: pathname == "/ThirdPartyManagement/Setting/Employees",
          //      },
          //      {
          //        label: "Manage Roles",
          //        Link: "RoleList",
          //        LinkLable: "/ThirdPartyManagement/Setting",
          //        active: pathname == "/ThirdPartyManagement/Setting/RoleList",
          //      },
          //      {
          //        label: "Manage Permissions",
          //        Link: "AssignPermissions",
          //        LinkLable: "/ThirdPartyManagement/Setting",
          //        active: pathname == "/ThirdPartyManagement/Setting/AssignPermissions",
          //      },
          //    ],
          //  },
      ],
    },
    // {
    //   label: "Porfolio Management",
    //   Link: "/InvestorDashboard/Overview",
    //   img: Images.dashboardIcon,
    //   imgActive: Images.dashboardIconActive,
    //   active: pathname.split("/").includes("/InvestorDashboard"),
    //   menu: [
    //     {
    //       label: "Dashboard Overview",
    //       Link: "Overview",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.dashboardIcon,
    //       active: pathname.includes("/InvestorDashboard/Overview"),
    //     },
    //     {
    //       label: "Investors",
    //       Link: "Investors",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.CustomerManagementIcon,
    //       active: pathname.includes("/InvestorDashboard/Investors"),
    //     },
    //     {
    //       label: "Products & Rates",
    //       Link: "Products",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.productManagementIcon,
    //       active: pathname.includes("/InvestorDashboard/Products"),
    //     },
    //     {
    //       label: "Income Ranges",
    //       Link: "IncomeRanges",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.LovIcon,
    //       active: pathname == "/InvestorDashboard/IncomeRanges",
    //     },
    //     {
    //       label: "Initial Invest",
    //       Link: "InitialInvest",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.FinancingApplicationsIcon,
    //       active: pathname == "/InvestorDashboard/InitialInvest",
    //     },
    //     {
    //       label: "Investment Experience",
    //       Link: "InvestmentExperience",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.PartnerManagementIcon,
    //       active: pathname == "/InvestorDashboard/InvestmentExperience",
    //     },
    //     {
    //       label: "Investment Timeline",
    //       Link: "InvestmentTimeline",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.applicationBoard,
    //       active: pathname == "/InvestorDashboard/InvestmentTimeline",
    //     },
    //     {
    //       label: "System Settings",
    //       Link: "SystemSettings",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.SettingsIcon,
    //       active: pathname.includes("/InvestorDashboard/SystemSettings"),
    //       submenu: [
           
    //         {
    //           label: "Income Ranges",
    //           Link: "IncomeRanges",
    //           LinkLable: "/InvestorDashboard/SystemSettings",
    //           img: Images.LovIcon,
    //           active: pathname.includes("/InvestorDashboard/SystemSettings/IncomeRanges"),
    //         },
    //         {
    //           label: "Initial Invest",
    //           Link: "InitialInvest",
    //           LinkLable: "/InvestorDashboard/SystemSettings",
    //           img: Images.FinancingApplicationsIcon,
    //           active: pathname.includes("/InvestorDashboard/SystemSettings/InitialInvest"),
    //         },
    //         {
    //           label: "Investment Experience",
    //           Link: "InvestmentExperience",
    //           LinkLable: "/InvestorDashboard/SystemSettings",
    //           img: Images.PartnerManagementIcon,
    //           active: pathname.includes("/InvestorDashboard/SystemSettings/InvestmentExperience"),
    //         },
    //         {
    //           label: "Investment Timeline",
    //           Link: "InvestmentTimeline",
    //           LinkLable: "/InvestorDashboard/SystemSettings",
    //           img: Images.applicationBoard,
    //           active: pathname.includes("/InvestorDashboard/SystemSettings/InvestmentTimeline"),
    //         },
              
    //       ],
    //     },
    //     {
    //       label: "Investment",
    //       Link: "ApproveInvestment",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.logsIcon,
    //       active: pathname.includes("/InvestorDashboard/ApproveInvestment"),
    //     },
    //     {
    //       label: "Logs",
    //       Link: "Logs",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.logsIcon,
    //       active: pathname.includes("/InvestorDashboard/Logs"),
    //     },
    //     {
    //       label: "Ledger",
    //       Link: "Ledger",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.reportsIconDark,
    //       active: pathname.includes("/InvestorDashboard/Ledger"),
    //     },
    //     {
    //       label: "Investments",
    //       Link: "Investments",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.loanIcon,
    //       active: pathname == "/InvestorDashboard/Investments",
    //     },
    //     {
    //       label: "Allocation Engine",
    //       Link: "AllocationEngine",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.ApiManagementIcon,
    //       active: pathname == "/InvestorDashboard/AllocationEngine",
    //     },
    //     {
    //       label: "Reports",
    //       Link: "Reports",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.reportsIconDark,
    //       active: pathname == "/InvestorDashboard/Reports",
    //     },
    //     {
    //       label: "Audit Logs",
    //       Link: "AuditLogs",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.logsIcon,
    //       active: pathname == "/InvestorDashboard/AuditLogs",
    //     },
    //     {
    //       label: "Notifications",
    //       Link: "Notifications",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.notification,
    //       active: pathname == "/InvestorDashboard/Notifications",
    //     },
    //     {
    //       label: "Admin Users & Roles",
    //       Link: "AdminUsers",
    //       LinkLable: "/InvestorDashboard",
    //       img: Images.DepartmentManagementIcon,
    //       active: pathname == "/InvestorDashboard/AdminUsers",
    //     },
     
    //   ],
    // },
  ];
  
  const renderSubmenu = (
    item: {
      label: any;
      Link: any;
      active: any;
      menu: any;
      img?: any;
      imgActive?: any;
    },
    index: any
  ) => (
    <div className="menu-items css-12w9als" key={item.label}>
      <SubMenu
        label={item.label}
        icon={
          item.img ? (
            <img
              style={{
                filter: hoveredItem === index ? "brightness(0) contrast(100%)" : "none",
              }}
              src={item.img}
            />
          ) : (
            ""
          )
        }
        // defaultOpen={item.active}
        open={openSubmenuIndex === index || item.active}
        onClick={() => {
          // Toggle the submenu open/close
          setOpenSubmenuIndex((prevIndex) =>
            prevIndex === index ? null : index
          );
        }}
        onMouseEnter={() => setHoveredItem(index)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        {item.menu.filter(Boolean).map((submenuItem: any, subIndex: any) => {
          // Check for both 'submenu' and 'menu' properties for nested items
          const hasNestedSubmenu =
            (Array.isArray(submenuItem.submenu) && submenuItem.submenu.length > 0) ||
            (Array.isArray(submenuItem.menu) && submenuItem.menu.length > 0);

          if (hasNestedSubmenu) {
            const nestedItems = submenuItem.submenu || submenuItem.menu;
            return (
              <SubMenu
                key={subIndex}
                label={submenuItem.label}
                defaultOpen={submenuItem.active}
                className="nested-submenu"
                onClick={(e) => {
                  // Prevent parent menu from closing when clicking nested submenu
                  e.stopPropagation();
                }}
                prefix={
                  submenuItem.img ? (
                  <img
                      src={submenuItem.img}
                    style={{
                      background: "none",
                      color: themeStyle?.dashboardSibeBarFlow.flowSideBarLogoBg,
                        display: "block",
                    }}
                    width={16}
                    height={16}
                  />
                  ) : null
                }
              >
                {nestedItems.map(
                  (nestedItem: any, nestedIndex: any) => (
                    <Link
                      to={`${nestedItem.LinkLable || nestedItem.linkLable}/${nestedItem.Link || nestedItem.link}`}
                      style={{
                        textDecoration: "none",
                        color: nestedItem.active
                          ? themeStyle?.dashboardSibeBarFlow.activeTextColor
                          : themeStyle?.dashboardSibeBarFlow.inActiveTextColor,
                        backgroundColor: nestedItem.active
                          ? themeStyle?.dashboardSibeBarFlow.activeColorBg
                          : themeStyle?.dashboardSibeBarFlow.subMenuSideBarBg,
                        fontSize: "14px",
                      }}
                      key={nestedIndex}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MenuItem
                        active={nestedItem.active}
                        style={{
                          fontSize: "11px",
                          fontWeight: "400",
                          textDecoration: "none",
                        }}
                        className={nestedItem.active ? "active" : ""}
                      >
                        {nestedItem.label}
                      </MenuItem>
                    </Link>
                  )
                )}
              </SubMenu>
            );
          } else {
            return (
              <Link
                to={`${submenuItem.LinkLable}/${submenuItem.Link}`}
                style={{
                  textDecoration: "none",
                  color: submenuItem.active
                    ? themeStyle?.dashboardSibeBarFlow.activeTextColor
                    : themeStyle?.dashboardSibeBarFlow.inActiveTextColor,
                  backgroundColor: submenuItem.active
                    ? themeStyle?.dashboardSibeBarFlow.activeColorBg
                    : themeStyle?.dashboardSibeBarFlow.subMenuSideBarBg,
                  fontSize: "14px",
                }}
                key={subIndex}
                onClick={(e) => e.stopPropagation()}
              >
                <MenuItem
                  active={submenuItem.active}
                  style={{
                    fontSize: "12px",
                    fontWeight: "400",
                    textDecoration: "none",
                  }}
                  className={submenuItem.active ? "active" : ""}
                  prefix={
                    <img
                      src={submenuItem.img}
                      style={{
                        background: "none",
                        color:
                          themeStyle?.dashboardSibeBarFlow.flowSideBarLogoBg,
                        display: submenuItem.img ? "" : "none",
                      }}
                      width={16}
                      height={16}
                    />
                  }
                >
                  {submenuItem.label}
                </MenuItem>
              </Link>
            );
          }
        })}
      </SubMenu>
    </div>
  );

  return (
    <>
      <Sidebar
        transitionDuration={1000}
        onBackdropClick={() => dispatch(authSlice.actions.toggleSidebar())}
        toggled={toggled}
        customBreakPoint="768px"
        collapsedWidth="80px"
        width="290px"
        className="col-12 fw-bold menu-items css-12w9als"
        style={{
          fontSize: "13px",
          backgroundColor:
            themeStyle?.dashboardSibeBarFlow.flowDashboardSideBarBg,
        }}
      >
        <span
          onClick={() => {
            navigate("/LOS/Dashboard");
          }}
          className="d-flex justify-content-center "
          style={{
            backgroundColor: themeStyle?.dashboardSibeBarFlow.flowSideBarLogoBg,
            paddingTop: "15px",
            paddingBottom: "8px",
          }}
        >
          <img 
            src={Images.FactoringLogo} 
            alt="logo" 
            style={{
              width: "150px",
              height: "auto",
              maxHeight: "60px"
            }}
          />
        </span>
        <Menu>
          {sidebarItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.menu ? (
                renderSubmenu(item, index)
              ) : (
                <div className="menu-items css-12w9als">
                  <Link
                    to={`${item.Link}`}
                    style={{
                      fontSize: "14px",
                    }}
                  >
                    <MenuItem
                      active={item.active}
                      onMouseEnter={() => setHoveredItem(index)}
                      onMouseLeave={() => setHoveredItem(null)}
                      prefix={
                        item.img ? (
                          <img
                            src={item.img}
                            style={{
                              filter: (hoveredItem === index || item.active) ? "brightness(0) contrast(100%)" : "none"
                            }}
                          />
                        ) : null
                      }
                    >
                      {item.label}
                    </MenuItem>
                  </Link>
                </div>
              )}
            </React.Fragment>
          ))}
        </Menu>
      </Sidebar>
    </>
  );
};

export default DasbhboardSidebar;
