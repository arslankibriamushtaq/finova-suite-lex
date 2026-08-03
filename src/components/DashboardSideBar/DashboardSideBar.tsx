import React, { useState, useEffect, useMemo } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import "./DashboardSideBar.css";
import { Images } from "../Config/Images";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { RootState } from "../../redux/rootReducer";
import { authSlice } from "../../redux/apis/apisSlice";
import { themeStyle } from "../Config/Theme";
import SubHeaderFlowLms from "../DashboardHeader/SubHeaderFlowLms";
import { useTranslation } from "react-i18next";
import { FaMobileAlt, FaTimes } from "react-icons/fa";
import {
  LayoutDashboard,
  Bell,
  Users,
  Package,
  CreditCard,
  ListChecks,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Landmark,
  Banknote,
  FileBarChart2,
  BarChart3,
  HandCoins,
  Settings as SettingsIcon,
  Plug,
  Wallet,
  ArrowLeftRight,
  SlidersHorizontal,
  Contact,
  ScrollText,
  Send,
  BookOpen,
  Gauge,
  type LucideIcon,
} from "lucide-react";

/* Per-module color + icon registry. Each sidebar module gets its own brand
   color (the same color-mix card mechanism, applied per row): the color drives
   the lucide icon and the active/hover pill via the inherited --mi-color var. */
const MODULE_THEME: Record<string, { Icon: LucideIcon; color: string }> = {
  los: { Icon: LayoutDashboard, color: "#3b82f6" },
  dashboard: { Icon: LayoutDashboard, color: "#3b82f6" },
  "notification orchestrator": { Icon: Bell, color: "#8b5cf6" },
  "customer management": { Icon: Users, color: "#8b5cf6" },
  "product management": { Icon: Package, color: "#f59e0b" },
  "card management": { Icon: CreditCard, color: "#3b82f6" },
  lov: { Icon: ListChecks, color: "#14b8a6" },
  "risk management": { Icon: ShieldAlert, color: "#f43f5e" },
  "access control management": { Icon: ShieldCheck, color: "#6366f1" },
  "block codes": { Icon: Ban, color: "#06b6d4" },
  lms: { Icon: Landmark, color: "#10b981" },
  "loan management": { Icon: Banknote, color: "#3b82f6" },
  reports: { Icon: FileBarChart2, color: "#0ea5e9" },
  "chart of account": { Icon: BarChart3, color: "#14b8a6" },
  collections: { Icon: HandCoins, color: "#22c55e" },
  setting: { Icon: SettingsIcon, color: "#64748b" },
  "connector management": { Icon: Plug, color: "#ec4899" },
  "environment settings": { Icon: SlidersHorizontal, color: "#0ea5e9" },
  "clients management": { Icon: Contact, color: "#8b5cf6" },
  "system logs": { Icon: ScrollText, color: "#f59e0b" },
  "wallet management": { Icon: Wallet, color: "#10b981" },
  transfers: { Icon: ArrowLeftRight, color: "#6366f1" },
  financing: { Icon: Landmark, color: "#0ea5e9" },
  "general setting": { Icon: SettingsIcon, color: "#0d9488" },
  "send money": { Icon: Send, color: "#8b5cf6" },
  "internal transfer": { Icon: ArrowLeftRight, color: "#6366f1" },
  "wallet transactions limits": { Icon: SlidersHorizontal, color: "#14b8a6" },
  ledger: { Icon: BookOpen, color: "#0ea5e9" },
  "general credit scoring": { Icon: Gauge, color: "#f59e0b" },
  "accounts limit setting": { Icon: SlidersHorizontal, color: "#14b8a6" },
  "exchange top-up": { Icon: ArrowLeftRight, color: "#f97316" },
};

const DEFAULT_MI_COLOR = "#10b981";
const getModuleTheme = (label?: string) =>
  label ? MODULE_THEME[label.trim().toLowerCase()] : undefined;

// Map each English sidebar label (kept as the item's stable identity — it drives
// icon/color lookup via MODULE_THEME, active-tab comparisons, and module reuse)
// to its translation key. Labels are translated ONLY at render time via tr()
// below, so none of that logic is affected.
const SIDEBAR_LABEL_KEYS: Record<string, string> = {
  Dashboard: "dashboard",
  "Notification Orchestrator": "notificationOrchestrator",
  "Customer Management": "customerManagement",
  Users: "users",
  Customers: "customers",
  Business: "business",
  "Risk Management": "riskManagement",
  "Blacklist NID": "blacklistNid",
  "Blacklist Mobile": "blacklistMobile",
  "Fraud Rule Management": "fraudRuleManagement",
  "Internal Checks Config": "internalChecksConfig",
  "Device Management": "deviceManagement",
  "Card Management": "cardManagement",
  Cards: "cards",
  "Card Products": "cardProducts",
  "Card Settings": "cardSettings",
  "Block Codes": "blockCodes",
  "All Block Codes": "allBlockCodes",
  Compliance: "compliance",
  AML: "aml",
  "Anti-Fraud": "antiFraud",
  Sanction: "sanction",
  "Access Control Management": "accessControlManagement",
  Employees: "employees",
  "Manage Roles": "manageRoles",
  "Manage Permissions": "managePermissions",
  "Send Money": "sendMoney",
  "Internal Transfer": "internalTransfer",
  "Wallet Transactions Limits": "walletTransactionsLimits",
  Ledger: "ledger",
  "General Credit Scoring": "generalCreditScoring",
  "Accounts Limit Setting": "accountsLimitSetting",
  Financing: "financing",
  LOS: "los",
  "Product Management": "productManagement",
  Products: "products",
  "Contract Template": "contractTemplate",
  "Product Category": "productCategory",
  "Product Sub Category": "productSubCategory",
  LOV: "lov",
  "Source Of Income": "sourceOfIncome",
  Occupation: "occupation",
  "Source Of Wealth": "sourceOfWealth",
  "Source Of Funds": "sourceOfFunds",
  "Template Types": "templateTypes",
  "Net Worth Ranges": "netWorthRanges",
  "Purpose of Financing": "purposeOfFinancing",
  "Credit Scoring Definitions": "creditScoringDefinitions",
  "Approval Conditions": "approvalConditions",
  LMS: "lms",
  "Loan Management": "loanManagement",
  "All Applications": "allApplications",
  Reports: "reports",
  "Account Report": "accountReport",
  "Simah Report": "simahReport",
  "Accounting & Financing": "accountingFinancing",
  "Loans Reports": "loansReports",
  "Chart of account": "chartOfAccount",
  Accounts: "accounts",
  "COA Configuration": "coaConfiguration",
  "Chart of accounts field": "chartOfAccountsField",
  Collections: "collections",
  "Waiver Requests": "waiverRequests",
  Setting: "setting",
  Delinquency: "delinquency",
  Rescheduling: "rescheduling",
  "Dunning Policy": "dunningPolicy",
  "Connector Management": "connectorManagement",
  "Environment Settings": "environmentSettings",
  Providers: "providers",
  "All Provider APIs": "allProviderApis",
  "Clients Management": "clientsManagement",
  Clients: "clients",
  "Client Request Prod": "clientRequestProd",
  "Client Request Dev": "clientRequestDev",
  "Client Request Test": "clientRequestTest",
  "Exchange Top-up": "exchangeTopup",
  Payments: "payments",
  Countries: "countries",
  "Document Types": "documentTypes",
  Verifications: "verifications",
};

/* Renders a colored lucide icon when the label is a known module; otherwise
   falls back to the legacy PNG icon (or nothing). */
const ModuleIcon: React.FC<{ label?: string; fallback?: string; size?: number }> = ({
  label,
  fallback,
  size = 18,
}) => {
  const theme = getModuleTheme(label);
  if (theme) {
    const Icon = theme.Icon;
    return <Icon size={size} style={{ color: theme.color }} strokeWidth={2} />;
  }
  if (fallback) return <img src={fallback} width={16} height={16} />;
  return null;
};

const DasbhboardSidebar = ({ effectiveCollapsed }: { effectiveCollapsed?: boolean }) => {
  const { t, i18n } = useTranslation("sidebar");
  // RTL for Arabic — react-pro-sidebar flips submenu expand arrows + padding.
  const isRTL = i18n.dir() === "rtl";
  const tr = (label?: string) =>
    label && SIDEBAR_LABEL_KEYS[label] ? t(SIDEBAR_LABEL_KEYS[label]) : label;
  const [openSubmenuIndices, setOpenSubmenuIndices] = useState<number[]>([]);
  const [openNestedSubmenus, setOpenNestedSubmenus] = useState<Record<string, boolean>>({});
  // Pages that live under BOTH tabs (Customers, General Setting). For these we
  // can't tell the tab from the URL, so we keep whichever tab the user last used.
  const isSharedPage = (p: string) =>
    p.includes("/CustomerList") ||
    p.includes("/CustomerDetails") ||
    p.includes("/CustomerManagement/Business") ||
    p.includes("/BusinessDetails") ||
    p.includes("/CostByCustomer") ||
    p.includes("/OnboardingCostByCustomer") ||
    p.includes("/Lms/Setting/GeneralCreditScoring");

  const [sidebarTab] = useState<"financing" | "wallet">(() => {
    if (typeof window === "undefined") return "financing";
    const p = window.location.pathname;
    // Wallet-exclusive page → always Wallet.
    if (
      p.includes("/WalletTransactionLimits") ||
      p.includes("/Wallet/") ||
      p.includes("/NotificationOrchestrator") ||
      p.includes("/RiskManagement") ||
      p.includes("/LOS/Setting") ||
      p.includes("/BlockCodes") ||
      p.includes("/Lms/Setting/GeneralCreditScoring") ||
      p.includes("/LOS/Dashboard") ||
      p.includes("/ProductManagement") ||
      p.includes("/LOV") ||
      p.includes("/Lms/") ||
      p.includes("/ThirdPartyManagement")
    )
      return "wallet";
    // Shared page → fall back to the last tab the user was on.
    if (isSharedPage(p)) {
      const saved = localStorage.getItem("sidebarTab");
      return saved === "wallet" ? "wallet" : "financing";
    }
    // Everything else (incl. the LOS dashboard) → Financing.
    return "financing";
  });

  // Remember the last tab so shared pages can restore it after a refresh /
  // layout remount. Tab-exclusive pages override this in the initializer above.
  useEffect(() => {
    localStorage.setItem("sidebarTab", sidebarTab);
  }, [sidebarTab]);

  // Match the sidebar logo header height to the project's top header so their
  // bottom borders line up exactly (measured at runtime — robust to padding).
  const [headerH, setHeaderH] = useState<number | null>(null);
  useEffect(() => {
    const measure = () => {
      const header = document.querySelector(
        ".header_layout"
      ) as HTMLElement | null;
      if (header && header.offsetHeight > 0) setHeaderH(header.offsetHeight);
    };
    measure();
    const t1 = setTimeout(measure, 150);
    const t2 = setTimeout(measure, 600);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const dispatch = useDispatch();
    const toggled = useSelector((state: RootState) => state.block.toggled);
  const reduxCollapsed = useSelector((state: RootState) => state.block.collapsed);
  const isCollapsed = effectiveCollapsed !== undefined ? effectiveCollapsed : reduxCollapsed;
  const location = useLocation();
  const pathname = location.pathname;

  // Force close on mount (bypasses persistence)
  useEffect(() => {
    dispatch(authSlice.actions.setToggled(false));
  }, [dispatch]);

  // Auto-open menu based on current route — scoped to the active tab's list.
  useEffect(() => {
    const items = walletItems;
    // Prefer the group that owns an active leaf (most specific); fall back to
    // matching the group's own top URL segment.
    const hasActiveLeaf = (item: any) =>
      Array.isArray(item?.menu) &&
      item.menu.some((sub: any) => {
        if (!sub) return false;
        if (sub.active) return true;
        const nested = sub.submenu || sub.menu;
        return Array.isArray(nested) && nested.some((c: any) => c?.active);
      });
    // Financing and Connector Management stay open by default so the primary
    // workflows are always visible regardless of the current route (their nested
    // submenus stay collapsed unless they own the active route).
    const financingIndex = items.findIndex(
      (it: any) => it && it.label === "Financing"
    );
    const connectorIndex = items.findIndex(
      (it: any) => it && it.label === "Connector Management"
    );
    const defaultOpen = [financingIndex, connectorIndex].filter((i) => i !== -1);

    const matchIndex = items.findIndex(hasActiveLeaf);
    // Open the route's owning group (if any) on top of the always-open defaults.
    const openIndices = Array.from(
      new Set([...defaultOpen, ...(matchIndex !== -1 ? [matchIndex] : [])])
    );
    setOpenSubmenuIndices(openIndices);

    // Nested submenus auto-open only for the group that owns the active route.
    const nestedStates: Record<string, boolean> = {};
    const parentItem = matchIndex !== -1 ? items[matchIndex] : null;
    if (parentItem && Array.isArray(parentItem.menu)) {
      // Filter Boolean to match renderSubmenu's `item.menu.filter(Boolean)`.
      // Without this, hasAccess-gated (falsy) entries shift the indices here
      // vs. at render time, so the wrong nested submenu (e.g. Access Control
      // Management instead of Risk Management) gets opened.
      parentItem.menu.filter(Boolean).forEach((submenuItem: any, subIndex: any) => {
        if (submenuItem) {
          const hasNestedSubmenu =
            (Array.isArray(submenuItem.submenu) && submenuItem.submenu.length > 0) ||
            (Array.isArray(submenuItem.menu) && submenuItem.menu.length > 0);
          if (hasNestedSubmenu) {
            const nestedItems = submenuItem.submenu || submenuItem.menu;
            const isAnyChildActive = nestedItems.some((child: any) => child.active);
            const nestedKey = `${matchIndex}-${subIndex}`;
            if (submenuItem.active || isAnyChildActive) {
              nestedStates[nestedKey] = true;
            }
          }
        }
      });
    }
    setOpenNestedSubmenus(nestedStates);
  }, [pathname]);

  // Force hide sidebar on mobile/zoom threshold
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        dispatch(authSlice.actions.setToggled(false));
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch]);

  const permissionData = useSelector(
    (state: RootState) => state.block.permissions
  );
  const token = useSelector((state: RootState) => state.block.token);

  // Super admin has no role/permissions assigned (SSOCallback stores empty
  // permissions for them) but carries the `super_admin` Keycloak realm role in the
  // JWT. Detect that so we can still show them everything, while a NORMAL role with
  // zero assigned permissions is hidden (fail-closed) rather than shown.
  const isSuperAdmin = useMemo(() => {
    if (!token || typeof token !== "string") return false;
    try {
      const payload = token.split(".")[1];
      if (!payload) return false;
      const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
      const roles = claims?.realm_access?.roles;
      return Array.isArray(roles) && roles.includes("super_admin");
    } catch {
      return false;
    }
  }, [token]);

  // Helper to check if user has access based on moduleCode, moduleName, subModule names, or permission names
  const hasAccess = (keys: string | string[]): boolean => {
    if (isSuperAdmin) return true; // super admin sees every module/page
    if (!permissionData || !Array.isArray(permissionData) || permissionData.length === 0) {
      // A real user with no assigned permissions: hide gated modules/pages.
      return false;
    }
    const keysToCheck = (Array.isArray(keys) ? keys : [keys]).map((k) => k.toLowerCase());
    const matchModule = (mod: any): boolean => {
      const code = (mod.moduleCode || "").toLowerCase();
      const name = (mod.moduleName || "").toLowerCase();
      if (keysToCheck.some((key) => code === key || name === key)) return true;
      // Check individual permissions — match only within the SAME module
      // Use word-boundary matching so "Product Category" matches "View Product Categories"
      // but NOT "View Product Credit Scoring Fields"
      const perms = mod.permissionsList || mod.permissions || [];
      if (Array.isArray(perms)) {
        for (const p of perms) {
          const permName = (p.name || p.permissionName || "").toLowerCase();
          if (keysToCheck.some((key) => {
            // Skip single-word module codes (e.g. "product", "lov", "risk") for permission name matching
            // These should only match moduleCode/moduleName above, not permission names across modules
            if (!key.includes(" ")) return false;
            // Word-boundary check: key must appear as complete words in the permission name
            // e.g. "product category" matches "view product categories" or "create product category"
            // but "product" alone won't match "view product credit scoring fields"
            const regex = new RegExp(`(^|\\s)${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
            return regex.test(permName);
          })) return true;
        }
      }
      // Check sub-modules recursively
      const subs = mod.subModulesList || mod.sub_modules || [];
      if (Array.isArray(subs)) {
        for (const sub of subs) {
          if (matchModule(sub)) return true;
        }
      }
      return false;
    };
    return permissionData.some((module: any) => matchModule(module));
  };
  const sidebarItems = [
    {
      label: "LOS",
      Link: "/LOS/Dashboard",
      img: Images.ApiManagementIcon,
      imgActive: Images.ApiManagementIconDark,
      active: pathname.split("/").includes("/LOS"),
      menu: [
       {
          label: "Dashboard",
          LinkLable: "LOS",
          Link: "Dashboard",
          img: Images.dashboardIcon,
          imgActive: Images.dashboardIconActive,
          active: pathname.includes("/LOS/Dashboard"),
        },
        // {
        //   label: "Universal Onboarding",
        //   LinkLable: "LOS",
        //   Link: "UniversalOnboarding",
        //   img: Images.ApiManagementIcon, // Using an appropriate icon
        //   imgActive: Images.ApiManagementIconDark,
        //   active: pathname.includes("/LOS/UniversalOnboarding"),
        // },
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
        // {
        //   label: "Leads",
        //   Link: "Leads",
        //   LinkLable: "/LOS/CustomerManagement",
        //   active: pathname.includes("/Leads")||pathname.includes("/LeadDetails"),
        // },
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
          label: "Individual",
          Link: "CustomerList",
              LinkLable: "/LOS/CustomerManagement",
          active: pathname.includes("/CustomerList") || pathname.includes("/CustomerDetails") || pathname.includes("/CostByCustomer") || pathname.includes("/OnboardingCostByCustomer"),
        },
        {
          label: "Business",
          Link: "Business",
          LinkLable: "/LOS/CustomerManagement",
          active:
            pathname.includes("/CustomerManagement/Business") ||
            pathname.includes("/BusinessDetails"),
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
        hasAccess("View Products") && {label: "Product Management",
          Link: "ProductManagement",
        LinkLable: "/LOS",
          img: Images.productManagementIcon,
          imgActive: Images.productManagementIconActive,
          active: pathname === "/LOS/ProductManagement"},
        hasAccess("Contract Template") && {
          label: "Contract Template",
          Link: "ContractTemplate",
          LinkLable: "/LOS/NotificationTemplate",
          active: pathname == "/LOS/NotificationTemplate/ContractTemplate",
        },
        hasAccess("Product Category") && {
          label: "Product Category",
          Link: "ProductCategory",
          LinkLable: "/LOS/ProductManagement",
          active: pathname == "/LOS/ProductManagement/ProductCategory",
        },
        hasAccess("Product Sub Category") && {
          label: "Product Sub Category",
          Link: "ProductSubCategory",
          LinkLable: "/LOS/ProductManagement",
          active: pathname == "/LOS/ProductManagement/ProductSubCategory",
        }
      ].filter(Boolean)
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
    hasAccess("LOV") && {
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
            hasAccess("Source Of Income") && {
               label: "Source Of Income",
               Link: "SourceOfIncome",
               LinkLable: "/LOS/LOV",
               active: pathname == "/LOS/LOV/SourceOfIncome",
            },
            {
              label: "Occupation",
              Link: "Occupation",
              LinkLable: "/LOS/LOV",
              active: pathname == "/LOS/LOV/Occupation",
            },
            hasAccess("Source Of Wealth") && {
              label: "Source Of Wealth",
              Link: "SourceOfWealth",
              LinkLable: "/LOS/LOV",
              active: pathname == "/LOS/LOV/SourceOfWealth",
            },
            hasAccess("Source Of Funds") && {
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
            hasAccess("Net Worth Range") && {
              label: "Net Worth Ranges",
              Link: "NetWorthRanges",
              LinkLable: "/LOS/LOV",
              active: pathname == "/LOS/LOV/NetWorthRanges",
            },
            hasAccess("Purpose Of Finance") && {
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
            hasAccess("Credit Scoring Field") && {
              label:"Credit Scoring Definitions",
              Link:"CreditScoringDefinitions",
              LinkLable:"/LOS/LOV",
              active: pathname.includes("/CreditScoringDefinitions"),
            },
            hasAccess("Approval Condition Field") && {
              label:"Approval Conditions",
              Link:"ApprovalConditions",
              LinkLable:"/LOS/LOV",
              active: pathname.includes("/ApprovalConditions"),
            }
          ].filter(Boolean),
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
              active: pathname.includes("/Lms/LoanManagement/ApplicationManagement") || pathname.includes("/CostByApplication"),
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
        hasAccess("reports_module") &&
        {
          label: "Reports",
          Link: "Reports",
          img: Images.reportsIconDark,
          active: pathname.split("/").includes("Reports"),
          submenu: [
            //  hasAccess("account_report_module") && 
             {
              label: "Account Report",
              Link: "AccountReportsList",
              LinkLable: "/Lms/Reports",
              active: pathname.includes("/Lms/Reports/AccountReportsList"),
    
            },
            //  hasAccess("simah_report_module") &&
              {
              label: "Simah Report",
              Link: "SimahReportsList",
              LinkLable: "/Lms/Reports",
              active: pathname.includes("/Lms/Reports/SimahReportsList"),
    
            },
            // hasAccess("accounting_financing_module") &&
             {
              label: "Accounting & Financing",
              Link: "AccountingFinancing",
              LinkLable: "/Lms/Reports",
              active: pathname.split("/").includes("AccountingFinancing"),
            },
            {
              label: "Loans Reports",
              Link: "loans",
              LinkLable: "/Lms/Reports",
              active: pathname.split("/").includes("loans"),
            },
          ].filter(Boolean),
        },
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
        hasAccess("accounting_financing_module") &&
        {
          label: "Chart of account",
          Link: "ChartOfAccount",
          active: pathname.split("/").includes("ChartOfAccount"),
          img: Images.accountCharts,
          submenu: [
            // hasAccess("chart_of_account_module") &&
             {
              label: "Accounts",
              Link: "ChartOfAccount",
              LinkLable: "/Lms/ChartOfAccount",
              active: pathname === "/Lms/ChartOfAccount/ChartOfAccount",
            },
            //hasAccess("coa_configuration_module") &&
             {
              label: "COA Configuration",
              Link: "CoaConfiguration",
              LinkLable: "/Lms/ChartOfAccount",
              active: pathname.includes("/Lms/ChartOfAccount/CoaConfiguration"),
            },
             {
              label: "Chart of accounts field",
              Link: "ChartOfAccountFields",
              LinkLable: "/Lms/ChartOfAccount",
              active: pathname.includes("/Lms/ChartOfAccount/ChartOfAccountFields"),
            },
          ].filter(Boolean),
        },
     
        {
          label: "Collections",
          Link: "Collections/WaiverRequests",
          img: Images.SettingsIcon,
          imgActive: Images.SettingsIconDark,
          active: pathname.split("/").includes("Collections"),
          submenu: [
            {
              label: "Waiver Requests",
              Link: "WaiverRequests",
              LinkLable: "/Lms/Collections",
              active: pathname.includes("/Lms/Collections/WaiverRequests"),
            },
          ].filter(Boolean),
        },

        {
          label: "Setting",
          Link: "notification",
          img: Images.SettingsIcon,
          // Scope to /Lms/Setting/* so it doesn't also match /LOS/Setting/*
          // (the Access Control Management group). Exclude GeneralCreditScoring —
          // that page belongs to the top-level "General Setting" item, so this
          // submenu must not claim it (which would auto-open the LMS dropdown).
          active:
            pathname.includes("/Lms/Setting") &&
            !pathname.includes("/Lms/Setting/GeneralCreditScoring"),
          submenu: [
            // {
            //   label: "Product Management",
            //   Link: "ProductManagement",
            //   LinkLable: "Setting",
            //   active: pathname == "/Lms/Setting/ProductManagement",
            // },
            // {
            //   label: "Product Fee",
            //   Link: "ProductFee",
            //   LinkLable: "/Lms/Setting",
            //   active: pathname.includes("/Lms/Setting/ProductFee"),
            // },
            // hasAccess("delinquency_module") &&
            {
              label: "Delinquency",
              Link: "Deliquency",
              LinkLable: "/Lms/Setting",
              active: pathname.includes("/Lms/Setting/Deliquency"),
            },
            {
              label: "Rescheduling",
              Link: "Rescheduling",
              LinkLable: "/Lms/Setting",
              active: pathname.includes("/Lms/Setting/Rescheduling"),
            },
            {
              label: "Dunning Policy",
              Link: "DunningPolicy",
              LinkLable: "/Lms/Setting",
              active: pathname.includes("/Lms/Setting/DunningPolicy"),
            },
            // hasAccess("workflow_mapping_module") &&
            // {
            //   label: "Work Flow Mapping",
            //   Link: "WorkFlowMapping",
            //   LinkLable: "/Lms/Setting",
            //   active: pathname.includes("/Lms/Setting/WorkFlowMapping"),
            // },
            // // hasAccess("invoice_management_admin_module") && 
            // {
            //   label: "Invoice Setting",
            //   Link: "InvoiceSetting",
            //   LinkLable: "/Lms/Setting",
            //   active: pathname.includes("/Lms/Setting/InvoiceSetting"),
            // },
            // {
            //   label: "Calculator",
            //   Link: "Calculator",
            //   LinkLable: "Setting",
            //   active: pathname == "/Lms/Setting/Calculator",
            // },
            // {
            //   label: "Search Function",
            //   Link: "pdcmanagement",
            //   LinkLable: "Setting",
            //   active: pathname == "/pdcmanagement",
            // },
    
            // {
            //   label: "Securization",
            //   Link: "escrowmanagement",
            //   LinkLable: "Setting",
            //   active: pathname == "/escrowmanagement",
            // },
            // {
            //   label: "Tools",
            //   Link: "transactionmanagement",
            //   LinkLable: "Setting",
            //   active: pathname == "/transactionmanagement",
            // },
            // {
            //   label: "Interface",
            //   Link: "pdcmanagement",
            //   LinkLable: "Setting",
            //   active: pathname == "/pdcmanagement",
            // },
            // {
            //   label: "Pending Event Actions",
            //   Link: "escrowmanagement",
            //   LinkLable: "Setting",
            //   active: pathname == "/escrowmanagement",
            // },
          ].filter(Boolean),
        },
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
          // {
          //   label: "Providers",
          //   Link: "Providers",
          //   LinkLable: "/ThirdPartyManagement",
          //   img: Images.PartnerManagementIcon,
          //   active: pathname.includes("/ThirdPartyManagement/Providers"),
          // },
          {
            label: "Environment Settings",
            Link: "EnvironmentSettings",
            LinkLable: "/ThirdPartyManagement",
            img: Images.SettingsIcon,
            active: pathname.split("/").includes("/ThirdPartyManagement/EnvironmentSettings"),
            submenu: [
              // {
              //   label: "Services List",
              //   Link: "EnvironmentSettings/ServicesList",
              //   LinkLable: "/ThirdPartyManagement",
              //   active: pathname.includes("/ThirdPartyManagement/EnvironmentSettings/ServicesList"),
              // },
                {
                label: "Providers",
                Link: "Providers",
                LinkLable: "/ThirdPartyManagement",
                active: pathname.includes("/ThirdPartyManagement/Providers"),
              },
              {
                label: "All Provider APIs",
                Link: "AllProviderApis",
                LinkLable: "/ThirdPartyManagement",
                active: pathname.includes("/ThirdPartyManagement/AllProviderApis"),
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
               {
                 label: "Client Request Test",
                 Link: "RequestHistory/ClientRequestTest",
                 LinkLable: "/ThirdPartyManagement",
                 active: pathname.includes("/ThirdPartyManagement/RequestHistory/ClientRequestTest"),
               },
               /* {
                 label: "Request Detail",
                 Link: "RequestHistory/RequestDetail",
                 LinkLable: "/ThirdPartyManagement",
                 active: pathname.split("/").includes("/ThirdPartyManagement/RequestHistory/RequestDetail"),
               }, */
              //  {
              //    label: "Request Service",
              //    Link: "RequestHistory/RequestService",
              //    LinkLable: "/ThirdPartyManagement",
              //    active: pathname.includes("/ThirdPartyManagement/RequestHistory/RequestService"),
              // },
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
          // {
          //   label: "Services Management",
          //   Link: "Services",
          //   LinkLable: "/ThirdPartyManagement",
          //   img: Images.logsIcon,
          //   active: pathname.split("/").includes("Services") || pathname.split("/").includes("EnvironmentSettings"),
          //   submenu: [
          //     {
          //       label: "All Services",
          //       Link: "Services",
          //       LinkLable: "/ThirdPartyManagement",
          //       active: pathname.includes("/ThirdPartyManagement/Services"),
          //     },
          //     {
          //       label: "Services API",
          //       Link: "Services/Apis",
          //       LinkLable: "/ThirdPartyManagement",
          //       active: pathname.includes("/ThirdPartyManagement/Services/Apis"),
          //     },
          //     {
          //       label: "Services Environment",
          //       Link: "Services/Environment",
          //       LinkLable: "/ThirdPartyManagement",
          //       active: pathname.includes("/ThirdPartyManagement/Services/Environment"),
          //     },
          //   ],
          // },
          // {
          //   label: "Environment APIs",
          //   Link: "AllEnvironment",
          //   LinkLable: "/ThirdPartyManagement",
          //   img: Images.logsIcon,
          //   active: pathname.split("/").includes("AllEnvironment") || pathname.split("/").includes("EnvConfig") || pathname.split("/").includes("ExportCsv"),
          //   submenu: [
          //     {
          //       label: "All Environment",
          //       Link: "AllEnvironment",
          //       LinkLable: "/ThirdPartyManagement",
          //       active: pathname.includes("/ThirdPartyManagement/AllEnvironment"),
          //     },
          //     {
          //       label: "Env Config",
          //       Link: "EnvConfig",
          //       LinkLable: "/ThirdPartyManagement",
          //       active: pathname.includes("/ThirdPartyManagement/EnvConfig"),
          //     },
          //     {
          //       label: "Export CSV",
          //       Link: "ExportCsv",
          //       LinkLable: "/ThirdPartyManagement",
          //       active: pathname.includes("/ThirdPartyManagement/ExportCsv"),
          //     },
          //   ],
          // },
          //  {
          //    label: "Request History",
          //    Link: "RequestHistory",
          //    LinkLable: "/ThirdPartyManagement",
          //    img: Images.logsIcon,
          //    active: pathname.split("/").includes("/ThirdPartyManagement/RequestHistory"),
          //    submenu: [
          //      {
          //        label: "Client Request Prod",
          //        Link: "RequestHistory/ClientRequestProd",
          //        LinkLable: "/ThirdPartyManagement",
          //        active: pathname.includes("/ThirdPartyManagement/RequestHistory/ClientRequestProd"),
          //      },
          //      {
          //        label: "Client Request Dev",
          //        Link: "RequestHistory/ClientRequestDev",
          //        LinkLable: "/ThirdPartyManagement",
          //        active: pathname.includes("/ThirdPartyManagement/RequestHistory/ClientRequestDev"),
          //      },
          //      /* {
          //        label: "Request Detail",
          //        Link: "RequestHistory/RequestDetail",
          //        LinkLable: "/ThirdPartyManagement",
          //        active: pathname.split("/").includes("/ThirdPartyManagement/RequestHistory/RequestDetail"),
          //      }, */
          //      {
          //        label: "Request Service",
          //        Link: "RequestHistory/RequestService",
          //        LinkLable: "/ThirdPartyManagement",
          //        active: pathname.includes("/ThirdPartyManagement/RequestHistory/RequestService"),
          //     },
          //   ],
          // },
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

  // Reference existing Financing-tab modules so they can be reused in the Wallet
  // tab without duplicating their (large) configs.
  const lmsModule = sidebarItems.find((x: any) => x && x.label === "LMS");
  const connectorModule = sidebarItems.find(
    (x: any) => x && x.label === "Connector Management"
  );

  const walletItems: any[] = [
    hasAccess("DASHBOARD") && {
      label: "Dashboard",
      Link: "/LOS/Wallet/Home",
      active: pathname.includes("/LOS/Wallet/Home"),
    },
    hasAccess("NOTIFICATION") && {
      label: "Notification Orchestrator",
      Link: "/LOS/NotificationOrchestrator",
      img: Images.ApiManagementIcon,
      imgActive: Images.ApiManagementIconDark,
      active: pathname.includes("/LOS/NotificationOrchestrator"),
    },
    
    hasAccess("CUSTOMER") && {
      label: "Customer Management",
      Link: "/CustomerManagement/CustomerList",
      img: Images.CustomerManagementIcon,
      imgActive: Images.CustomerManagementIconDark,
      active: pathname.split("/").includes("CustomerManagement"),
      menu: [
        {
          label: "Users",
          Link: "OnboardingUsers",
          LinkLable: "/LOS/CustomerManagement",
          active: pathname.includes("/OnboardingUsers"),
        },
        {
          label: "Individuals",
          Link: "CustomerList",
          LinkLable: "/LOS/CustomerManagement",
          active:
            pathname.includes("/CustomerList") ||
            pathname.includes("/CustomerDetails") ||
            pathname.includes("/CostByCustomer") ||
            pathname.includes("/OnboardingCostByCustomer"),
        },
        {
          label: "Business",
          Link: "Business",
          LinkLable: "/LOS/CustomerManagement",
          active:
            pathname.includes("/CustomerManagement/Business") ||
            pathname.includes("/BusinessDetails"),
        },
      ].filter(Boolean),
    },
    hasAccess("RISK") && {
      label: "Risk Management",
      Link: "/LOS/RiskManagement/BlacklistNid",
      img: Images.LovIcon,
      imgActive: Images.LovIconDark,
      active: pathname.includes("/RiskManagement"),
      menu: [
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
        {
          label: "Internal Checks Config",
          Link: "InternalChecksConfig",
          LinkLable: "/LOS/RiskManagement",
          active: pathname == "/LOS/RiskManagement/InternalChecksConfig",
        },
        {
          label: "Device Management",
          Link: "DeviceManagement",
          LinkLable: "/LOS/RiskManagement",
          active: pathname == "/LOS/RiskManagement/DeviceManagement",
        },
      ].filter(Boolean),
    },
     hasAccess("CARD") && {
      label: "Card Management",
      Link: "CardManagement/Dashboard",
      LinkLable: "",
      active: pathname.includes("/CardManagement"),
      menu: [
        {
          label: "Dashboard",
          Link: "Dashboard",
          LinkLable: "/CardManagement",
          active: pathname === "/CardManagement/Dashboard",
          noIcon: true,
        },
        {
          label: "Cards",
          Link: "Cards",
          LinkLable: "/CardManagement",
          active: pathname.includes("/CardManagement/Cards"),
        },
        {
          label: "Card Products",
          Link: "Products",
          LinkLable: "/CardManagement",
          active: pathname === "/CardManagement/Products",
        },
        {
          label: "Card Settings",
          Link: "Settings",
          LinkLable: "/CardManagement",
          active: pathname === "/CardManagement/Settings",
        },
      ],
    },
    hasAccess("block_code_module") && {
      label: "Block Codes",
      Link: "/LOS/BlockCodes/AllBlockCodes",
      img: Images.SettingsIcon,
      imgActive: Images.SettingsIconDark,
      active: pathname.split("/").includes("BlockCodes"),
      menu: [
        {
          label: "All Block Codes",
          Link: "AllBlockCodes",
          LinkLable: "/LOS/BlockCodes",
          active: pathname.includes("/LOS/BlockCodes/AllBlockCodes"),
        },
        {
          label: "Compliance",
          Link: "Compliance",
          LinkLable: "/LOS/BlockCodes",
          active: pathname.includes("/LOS/BlockCodes/Compliance"),
        },
        {
          label: "AML",
          Link: "AML",
          LinkLable: "/LOS/BlockCodes",
          active: pathname.includes("/LOS/BlockCodes/AML"),
        },
        {
          label: "Anti-Fraud",
          Link: "AntiFraud",
          LinkLable: "/LOS/BlockCodes",
          active: pathname.includes("/LOS/BlockCodes/AntiFraud"),
        },
        {
          label: "Sanction",
          Link: "Sanction",
          LinkLable: "/LOS/BlockCodes",
          active: pathname.includes("/LOS/BlockCodes/Sanction"),
        },
      ].filter(Boolean),
    },
    hasAccess(["ROLE", "PERMISSION", "EMPLOYEE"]) && {
      label: "Access Control Management",
      Link: "/LOS/Setting/Employees",
      img: Images.SettingsIcon,
      imgActive: Images.SettingsIconDark,
      active: pathname.includes("/LOS/Setting"),
      menu: [
        hasAccess("EMPLOYEE") && {
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
    /* Wallet Management — commented out
    {
      label: "Wallet Management",
      Link: "/Wallet/Dashboard",
      img: Images.CustomerManagementIcon,
      imgActive: Images.CustomerManagementIconDark,
      active:
        pathname.includes("/Wallet/Dashboard") ||
        pathname.includes("/WalletTransactionLimits"),
      menu: [
        {
          label: "Wallets",
          Link: "Dashboard",
          LinkLable: "/LOS/Wallet",
          active: pathname.includes("/Wallet/Dashboard"),
        },
        {
          label: "Wallet Transactions Limits",
          Link: "WalletTransactionLimits",
          LinkLable: "/LOS/CustomerManagement",
          active: pathname.includes("/WalletTransactionLimits"),
        },
      ].filter(Boolean),
    },
    */
    hasAccess("WALLET") && {
      label: "Send Money",
      Link: "/LOS/Wallet/SendMoney",
      img: Images.CustomerManagementIcon,
      imgActive: Images.CustomerManagementIconDark,
      active: pathname.includes("/Wallet/SendMoney"),
    },
    hasAccess("WALLET") && {
      label: "Internal Transfer",
      Link: "/LOS/Wallet/InternalTransfer",
      img: Images.CustomerManagementIcon,
      imgActive: Images.CustomerManagementIconDark,
      active: pathname.includes("/Wallet/InternalTransfer"),
    },
    hasAccess("WALLET") && {
      label: "Wallet Transactions Limits",
      Link: "/LOS/CustomerManagement/WalletTransactionLimits",
      img: Images.CustomerManagementIcon,
      imgActive: Images.CustomerManagementIconDark,
      active: pathname.includes("/WalletTransactionLimits"),
    },
    hasAccess("EXCHANGE") && {
      label: "Exchange Top-up",
      Link: "/LOS/Exchange/Providers",
      img: Images.CustomerManagementIcon,
      imgActive: Images.CustomerManagementIconDark,
      active: pathname.includes("/LOS/Exchange"),
      menu: [
        {
          label: "Countries",
          Link: "Countries",
          LinkLable: "/LOS/Exchange",
          active: pathname === "/LOS/Exchange/Countries",
        },
        {
          label: "Document Types",
          Link: "DocumentTypes",
          LinkLable: "/LOS/Exchange",
          active: pathname === "/LOS/Exchange/DocumentTypes",
        },
        {
          label: "Providers",
          Link: "Providers",
          LinkLable: "/LOS/Exchange",
          active: pathname === "/LOS/Exchange/Providers",
        },
        {
          label: "Verifications",
          Link: "Verifications",
          LinkLable: "/LOS/Exchange",
          active: pathname.startsWith("/LOS/Exchange/Verifications"),
        },
        {
          label: "Payments",
          Link: "Payments",
          LinkLable: "/LOS/Exchange",
          active: pathname.startsWith("/LOS/Exchange/Payments"),
        },
      ].filter(Boolean),
    },
    hasAccess("LEDGER") && {
      label: "Ledger",
      Link: "/LOS/Ledger",
      img: Images.reportsIconDark,
      imgActive: Images.reportsIconDark,
      active: pathname === "/LOS/Ledger",
    },
    hasAccess("RISK") && {
      label: "General Credit Scoring",
      Link: "/Lms/Setting/GeneralCreditScoring?tab=general-credit-scoring",
      img: Images.SettingsIcon,
      imgActive: Images.SettingsIconDark,
      active:
        pathname.includes("/Lms/Setting/GeneralCreditScoring") &&
        !location.search.includes("accounts-limit-setting"),
    },
    hasAccess("WALLET") && {
      label: "Accounts Limit Setting",
      Link: "/Lms/Setting/GeneralCreditScoring?tab=accounts-limit-setting",
      img: Images.SettingsIcon,
      imgActive: Images.SettingsIconDark,
      active:
        pathname.includes("/Lms/Setting/GeneralCreditScoring") &&
        location.search.includes("accounts-limit-setting"),
    },
    hasAccess(["DASHBOARD", "PRODUCT", "LOV", "LENDING", "COLLECTIONS", "LEDGER", "RISK"]) && {
      label: "Financing",
      Link: "/LOS/Dashboard",
      img: Images.ApiManagementIcon,
      imgActive: Images.ApiManagementIconDark,
      active:
        pathname.includes("/LOS/Dashboard") ||
        pathname.includes("/ProductManagement") ||
        pathname.includes("/LOV"),
      menu: [
        {
          label: "LOS",
          Link: "/LOS/Dashboard",
          img: Images.ApiManagementIcon,
          imgActive: Images.ApiManagementIconDark,
          active:
            pathname.includes("/LOS/Dashboard") ||
            pathname.includes("/ProductManagement") ||
            pathname.includes("/LOV"),
          menu: [
            {
              label: "Dashboard",
              Link: "Dashboard",
              LinkLable: "/LOS",
              img: Images.dashboardIcon,
              imgActive: Images.dashboardIconActive,
              active: pathname.includes("/LOS/Dashboard"),
            },
            hasAccess("PRODUCT") && {
              label: "Product Management",
              img: Images.productManagementIcon,
              imgActive: Images.productManagementIconActive,
              active: pathname.includes("/ProductManagement"),
              menu: [
                hasAccess("View Products") && {
                  label: "Products",
                  Link: "ProductManagement",
                  LinkLable: "/LOS",
                  active: pathname === "/LOS/ProductManagement",
                },
                hasAccess("Contract Template") && {
                  label: "Contract Template",
                  Link: "ContractTemplate",
                  LinkLable: "/LOS/NotificationTemplate",
                  active: pathname == "/LOS/NotificationTemplate/ContractTemplate",
                },
                hasAccess("Product Category") && {
                  label: "Product Category",
                  Link: "ProductCategory",
                  LinkLable: "/LOS/ProductManagement",
                  active: pathname == "/LOS/ProductManagement/ProductCategory",
                },
                hasAccess("Product Sub Category") && {
                  label: "Product Sub Category",
                  Link: "ProductSubCategory",
                  LinkLable: "/LOS/ProductManagement",
                  active: pathname == "/LOS/ProductManagement/ProductSubCategory",
                },
              ].filter(Boolean),
            },
            hasAccess("LOV") && {
              label: "LOV",
              img: Images.LovIcon,
              imgActive: Images.LovIconDark,
              active: pathname.includes("/LOV"),
              menu: [
                hasAccess("Source Of Income") && {
                  label: "Source Of Income",
                  Link: "SourceOfIncome",
                  LinkLable: "/LOS/LOV",
                  active: pathname == "/LOS/LOV/SourceOfIncome",
                },
                {
                  label: "Occupation",
                  Link: "Occupation",
                  LinkLable: "/LOS/LOV",
                  active: pathname == "/LOS/LOV/Occupation",
                },
                hasAccess("Source Of Wealth") && {
                  label: "Source Of Wealth",
                  Link: "SourceOfWealth",
                  LinkLable: "/LOS/LOV",
                  active: pathname == "/LOS/LOV/SourceOfWealth",
                },
                hasAccess("Source Of Funds") && {
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
                hasAccess("Net Worth Range") && {
                  label: "Net Worth Ranges",
                  Link: "NetWorthRanges",
                  LinkLable: "/LOS/LOV",
                  active: pathname == "/LOS/LOV/NetWorthRanges",
                },
                hasAccess("Purpose Of Finance") && {
                  label: "Purpose of Financing",
                  Link: "PurposeofFinancing",
                  LinkLable: "/LOS/LOV",
                  active: pathname == "/LOS/LOV/PurposeofFinancing",
                },
                hasAccess("Credit Scoring Field") && {
                  label: "Credit Scoring Definitions",
                  Link: "CreditScoringDefinitions",
                  LinkLable: "/LOS/LOV",
                  active: pathname.includes("/CreditScoringDefinitions"),
                },
                hasAccess("Approval Condition Field") && {
                  label: "Approval Conditions",
                  Link: "ApprovalConditions",
                  LinkLable: "/LOS/LOV",
                  active: pathname.includes("/ApprovalConditions"),
                },
              ].filter(Boolean),
            },
          ].filter(Boolean),
        },
        hasAccess(["LENDING", "COLLECTIONS", "LEDGER", "RISK", "PRODUCT", "POLICY"]) && lmsModule,
      ].filter(Boolean),
    },
    hasAccess("MIDDLEWARE") && connectorModule,
  ].filter(Boolean);

  // Recursively render menu items at any depth: an item with its own
  // `menu`/`submenu` becomes a (nested) dropdown; otherwise it's a leaf link.
  const renderMenuItems = (items: any[], keyPrefix: string): any =>
    (items || []).filter(Boolean).map((it: any, i: number) => {
      const key = `${keyPrefix}-${i}`;
      const nested =
        (Array.isArray(it.submenu) && it.submenu.length > 0 && it.submenu) ||
        (Array.isArray(it.menu) && it.menu.length > 0 && it.menu) ||
        null;
      if (nested) {
        const isAnyChildActive = nested.some((c: any) => c && c.active);
        const isOpen =
          openNestedSubmenus[key] !== undefined
            ? openNestedSubmenus[key]
            : it.active || isAnyChildActive;
        return (
          <SubMenu
            key={key}
            label={<span className="sidebar-label-text">{tr(it.label)}</span>}
            open={isOpen}
            className="nested-submenu"
            rootStyles={{ ["--mi-color" as any]: getModuleTheme(it.label)?.color }}
            onClick={(e: any) => {
              e.stopPropagation();
              setOpenNestedSubmenus((prev) => ({ ...prev, [key]: !isOpen }));
            }}
            icon={<ModuleIcon label={it.label} fallback={it.img} />}
          >
            {renderMenuItems(nested, key)}
          </SubMenu>
        );
      }
      return (
        <Link
          to={`${it.LinkLable || it.linkLable}/${it.Link || it.link}`}
          className={`sidebar-link ${it.active ? "is-active" : ""}`}
          key={key}
          onClick={(e) => e.stopPropagation()}
          style={{ ["--mi-color" as any]: getModuleTheme(it.label)?.color }}
        >
          <MenuItem
            active={it.active}
            style={{ fontSize: "12px", fontWeight: "400", textDecoration: "none" }}
            className={it.active ? "active" : ""}
            icon={
              !it.noIcon && (getModuleTheme(it.label) || it.img) ? (
                <ModuleIcon label={it.label} fallback={it.img} />
              ) : null
            }
          >
            <span className="sidebar-label-text">{tr(it.label)}</span>
          </MenuItem>
        </Link>
      );
    });

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
    <div
      className="menu-items css-12w9als"
      key={item.label}
      style={{ ["--mi-color" as any]: getModuleTheme(item.label)?.color || DEFAULT_MI_COLOR }}
    >
      <SubMenu
        label={<span className="sidebar-label-text">{tr(item.label)}</span>}
        icon={<ModuleIcon label={item.label} fallback={item.img} />}
        // defaultOpen={item.active}
        open={openSubmenuIndices.includes(index)}
        onClick={() => {
          // Toggle the submenu open/close (multiple can be open at once)
          setOpenSubmenuIndices((prev) =>
            prev.includes(index)
              ? prev.filter((i) => i !== index)
              : [...prev, index]
          );
        }}
      >
        {renderMenuItems(item.menu, String(index))}
      </SubMenu>
    </div>
  );

  return (
    <>
      <Sidebar
        rtl={isRTL}
        transitionDuration={0}
        onBackdropClick={() => dispatch(authSlice.actions.toggleSidebar())}
        toggled={toggled}
        collapsed={isCollapsed}
        customBreakPoint="768px"
        collapsedWidth="80px"
        width="290px"
        className={`col-12 fw-bold menu-items css-12w9als ${isCollapsed ? "is-collapsed" : ""}`}
        style={{
          fontSize: "13px",
          backgroundColor:
            themeStyle?.dashboardSibeBarFlow.flowDashboardSideBarBg,
          display: window.innerWidth <= 768 && !toggled ? "none" : "block",
        }}
      >
        <div
          className="d-flex align-items-center sidebar-logo-container px-3"
          style={{
            backgroundColor: themeStyle?.dashboardSibeBarFlow.flowSideBarLogoBg,
            paddingTop: "15px",
            paddingBottom: "8px",
            ...(headerH ? ({ ["--logo-h" as any]: `${headerH}px` } as any) : {}),
          }}
        >
          <img
            src={isCollapsed ? Images.SullisFavicon : Images.DashboardLogo}
            alt="logo"
            className="sidebar-logo sidebar-logo--light"
            style={{
              width: isCollapsed ? "40px" : "150px",
              height: "auto",
              cursor: "default",
              transition: "width 0.3s ease"
            }}
          />
          <img
            src={isCollapsed ? Images.SullisFavicon : Images.DashboardLogoWhite}
            alt="logo"
            className="sidebar-logo sidebar-logo--dark"
            style={{
              width: isCollapsed ? "40px" : "150px",
              height: "auto",
              cursor: "default",
              transition: "width 0.3s ease"
            }}
          />
          {window.innerWidth <= 768 && !isCollapsed && (
            <button
              className="ms-auto btn border-0 p-0"
              style={{ color: "var(--theme-heading-text-color)", fontSize: "20px" }}
              onClick={() => dispatch(authSlice.actions.toggleSidebar())}
            >
              <FaTimes />
            </button>
          )}
        </div>
        {/* transitionDuration=0: the open/close submenu HEIGHT animation is
            driven by <Menu> (react-pro-sidebar reads it from the Menu context,
            not the Sidebar). At 0 the height snaps instantly, so re-measuring an
            open submenu can't slide the items below it = no jerking. */}
        <Menu transitionDuration={0}>
          {(
            <div className="wallet-menu-scope">
              {walletItems.map((item, index) => (
                <React.Fragment key={index}>
                  {!item ? null : item.menu ? (
                    renderSubmenu(item, index)
                  ) : (
                    <div
                      className="menu-items css-12w9als"
                      style={{ ["--mi-color" as any]: getModuleTheme(item.label)?.color || DEFAULT_MI_COLOR }}
                    >
                      <Link
                        to={`${item.Link}`}
                        style={{
                          fontSize: "14px",
                        }}
                      >
                        <MenuItem
                          active={item.active}
                          icon={<ModuleIcon label={item.label} fallback={item.img} />}
                        >
                          {tr(item.label)}
                        </MenuItem>
                      </Link>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </Menu>
      </Sidebar>
      <style>
        {`
          /* Shared Sidebar Hover Logic */
          .ps-sidebar-container {
            overflow-x: hidden !important;
          }
          .ps-sidebar-root {
            border-right: 1px solid var(--surface-border) !important;
          }
          /* Pin the logo header so it stays put while the menu items scroll
             beneath it. The container itself is the scroll parent, so a sticky
             child sticks to its top. Solid bg (set inline) hides scrolled rows. */
          .sidebar-logo-container {
            position: sticky !important;
            top: 0 !important;
            z-index: 20 !important;
          }
          /* ===== Smooth, professional submenu open/close animation =====
             react-pro-sidebar's own height animation was killed (transitionDuration=0)
             because re-measuring an open submenu on re-render could slide the rows
             below it (the jerk). Instead we animate height purely in CSS via the
             grid 0fr→1fr trick: it's driven ONLY by the .ps-open class, never by JS
             measurement, so incidental re-renders can't cause that slide. The inline
             height react-pro-sidebar sets is overridden with height:auto. */
          .ps-sidebar-root:not([data-collapsed="true"]) .ps-submenu-content {
            display: grid !important;
            grid-template-rows: 0fr;
            height: auto !important;
            overflow: hidden !important;
            transition: grid-template-rows 0.32s cubic-bezier(0.33, 1, 0.68, 1) !important;
          }
          .ps-sidebar-root:not([data-collapsed="true"]) .ps-submenu-content > ul {
            min-height: 0;
            overflow: hidden;
            opacity: 0;
            transform: translateY(-6px);
            transition: opacity 0.28s ease 0.06s, transform 0.32s cubic-bezier(0.33, 1, 0.68, 1) 0.06s;
          }
          .ps-sidebar-root:not([data-collapsed="true"]) .ps-submenu-root.ps-open > .ps-submenu-content {
            grid-template-rows: 1fr;
          }
          .ps-sidebar-root:not([data-collapsed="true"]) .ps-submenu-root.ps-open > .ps-submenu-content > ul {
            opacity: 1;
            transform: translateY(0);
          }
          /* Smoothly rotate the expand chevron as the group opens/closes */
          .ps-sidebar-root:not([data-collapsed="true"]) .ps-submenu-expand-icon {
            transition: transform 0.32s cubic-bezier(0.33, 1, 0.68, 1) !important;
          }
          @media (prefers-reduced-motion: reduce) {
            .ps-sidebar-root:not([data-collapsed="true"]) .ps-submenu-content,
            .ps-sidebar-root:not([data-collapsed="true"]) .ps-submenu-content > ul {
              transition: none !important;
            }
          }
          /* Hover icon highlight — moved from JS (setHoveredItem) to CSS so
             hovering a group no longer re-renders the sidebar (the re-render
             re-ran react-pro-sidebar's expandContent and slid the rows below an
             open group). Filter is paint-only, so it never shifts layout. */
          .ps-menu-button:hover img {
            filter: brightness(0) contrast(100%) !important;
          }
          /* ===== Unified, user-friendly menu styling across ALL levels =====
             EVERY row shares the same left edge and the same icon column, so all
             icons line up vertically regardless of nesting depth. Rows without an
             icon (deep leaf items) indent their text into that same column. */
          /* Kill EVERY source of per-level indentation (content, its <ul>, and
             the <li> wrappers) so nesting depth never shifts a row right. */
          .css-12w9als:not(.is-collapsed) .ps-submenu-content,
          .css-12w9als:not(.is-collapsed) .ps-submenu-content > ul,
          .css-12w9als:not(.is-collapsed) .ps-menuitem-root,
          .css-12w9als:not(.is-collapsed) .ps-menuitem-root > ul {
            padding-left: 0 !important;
            padding-inline-start: 0 !important;
            margin-left: 0 !important;
          }
          /* Same height, full width, flush left, 12px text */
          .css-12w9als:not(.is-collapsed) .ps-menu-button {
            height: 44px !important;
            min-height: 44px !important;
            margin: 0 !important;
            width: 100% !important;
            font-size: 12px !important;
          }
          .css-12w9als:not(.is-collapsed) .ps-menu-button .ps-menu-label,
          .css-12w9als:not(.is-collapsed) .ps-menu-button .sidebar-label-text,
          .css-12w9als:not(.is-collapsed) .sidebar-link {
            font-size: 12px !important;
          }
          /* Icon column: locked to EXACTLY 32px (24px icon + 8px gap) so an
             icon row's label and an icon-less row's text land at the same x. */
          .css-12w9als:not(.is-collapsed) .ps-menu-icon {
            min-width: 24px !important;
            width: 24px !important;
            max-width: 24px !important;
            height: 24px !important;
            margin-right: 8px !important;
            margin-left: 0 !important;
          }
          /* No extra offset on the label itself */
          .css-12w9als:not(.is-collapsed) .ps-menu-label {
            margin-left: 0 !important;
            padding-left: 0 !important;
          }
          /* Collapse an EMPTY icon span (rendered for icon-less rows) so it
             takes no width — otherwise icon-less labels get pushed right and
             the no-icon padding can't align them with the parent's label. */
          .css-12w9als:not(.is-collapsed) .ps-menu-icon:not(:has(svg)):not(:has(img)) {
            display: none !important;
            width: 0 !important;
            min-width: 0 !important;
            margin: 0 !important;
          }
          /* Indentation: each nesting level steps in 10px so a child module/row
             sits a little right of its parent. Icon rows indent by their icon;
             icon-less leaf rows add the icon column (32px) so their text still
             lines up with the icon rows at the same level. */
          /* Level 0 */
          .css-12w9als:not(.is-collapsed) .ps-menu-button { padding-left: 10px !important; }
          .css-12w9als:not(.is-collapsed) .ps-menu-button:not(:has(.ps-menu-icon svg)):not(:has(.ps-menu-icon img)) { padding-left: 42px !important; }
          /* Level 1  (leaf text aligns with its level-0 parent's label) */
          .css-12w9als:not(.is-collapsed) .ps-submenu-content .ps-menu-button { padding-left: 20px !important; }
          .css-12w9als:not(.is-collapsed) .ps-submenu-content .ps-menu-button:not(:has(.ps-menu-icon svg)):not(:has(.ps-menu-icon img)) { padding-left: 42px !important; }
          /* Level 2  (leaf text aligns with its level-1 parent's label) */
          .css-12w9als:not(.is-collapsed) .ps-submenu-content .ps-submenu-content .ps-menu-button { padding-left: 30px !important; }
          .css-12w9als:not(.is-collapsed) .ps-submenu-content .ps-submenu-content .ps-menu-button:not(:has(.ps-menu-icon svg)):not(:has(.ps-menu-icon img)) { padding-left: 52px !important; }
          /* Level 3  (leaf text aligns with its level-2 parent's label) */
          .css-12w9als:not(.is-collapsed) .ps-submenu-content .ps-submenu-content .ps-submenu-content .ps-menu-button { padding-left: 40px !important; }
          .css-12w9als:not(.is-collapsed) .ps-submenu-content .ps-submenu-content .ps-submenu-content .ps-menu-button:not(:has(.ps-menu-icon svg)):not(:has(.ps-menu-icon img)) { padding-left: 62px !important; }
          /* Level 4  (leaf text aligns with its level-3 parent's label) */
          .css-12w9als:not(.is-collapsed) .ps-submenu-content .ps-submenu-content .ps-submenu-content .ps-submenu-content .ps-menu-button { padding-left: 50px !important; }
          .css-12w9als:not(.is-collapsed) .ps-submenu-content .ps-submenu-content .ps-submenu-content .ps-submenu-content .ps-menu-button:not(:has(.ps-menu-icon svg)):not(:has(.ps-menu-icon img)) { padding-left: 72px !important; }
          /* Labels: single line, not clipped */
          .css-12w9als:not(.is-collapsed) .ps-menu-button .ps-menu-label,
          .css-12w9als:not(.is-collapsed) .sidebar-label-text {
            overflow: visible !important;
            text-overflow: clip !important;
            white-space: nowrap !important;
          }
          /* Expand chevron pinned to the right at every level */
          .css-12w9als:not(.is-collapsed) .ps-submenu-expand-icon {
            right: 14px !important;
          }
          /* Each top-level module gets a bottom divider in its OWN icon colour
             (every module wrapper carries its colour via inline --mi-color;
             nested rows have no .menu-items wrapper, so they're untouched). */
          .css-12w9als:not(.is-collapsed) .menu-items[style*="--mi-color"] {
            border-bottom: 1px solid
              color-mix(in srgb, var(--mi-color, #10b981) 35%, transparent) !important;
          }

          /* ===== Final polish ===== */
          /* Brand/logo header: same height as the top header (40px avatar +
             10px×2 padding = 60px content + 1px border) so the two bottom
             borders line up exactly. */
          .ps-sidebar-root .sidebar-logo-container {
            height: var(--logo-h, 61px) !important;
            min-height: var(--logo-h, 61px) !important;
            box-sizing: border-box !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            margin-bottom: 0 !important;
            align-items: center !important;
            border-bottom: 1px solid var(--surface-border) !important;
          }
          /* A little breathing room around the menu list */
          .css-12w9als:not(.is-collapsed) .ps-menu-root {
            padding: 4px 8px !important;
          }
          /* Smooth hover/active transitions */
          .css-12w9als:not(.is-collapsed) .ps-menu-button {
            transition: background-color 0.15s ease, color 0.15s ease !important;
          }
          /* Subtle hover wash in the module's own colour (non-active rows) */
          .css-12w9als:not(.is-collapsed) .ps-menu-button:not(.ps-active):hover {
            background: color-mix(in srgb, var(--mi-color, #10b981) 8%, transparent) !important;
          }
          /* Group headers read a touch stronger than leaf rows */
          .css-12w9als:not(.is-collapsed) .ps-submenu-root > .ps-menu-button .ps-menu-label {
            font-weight: 400 !important;
          }
          /* Icons inherit the module colour; crisp sizing */
          .css-12w9als:not(.is-collapsed) .ps-menu-icon svg {
            width: 17px !important;
            height: 17px !important;
          }
          /* Tidy, thin scrollbar */
          .ps-sidebar-container::-webkit-scrollbar { width: 6px !important; }
          .ps-sidebar-container::-webkit-scrollbar-thumb {
            background: var(--surface-border) !important;
            border-radius: 6px !important;
          }
          /* Aggressively hide text labels when collapsed */
          .is-collapsed .sidebar-label-text,
          .is-collapsed .ps-menu-label,
          .is-collapsed .ps-submenu-expand-icon {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }
          .is-collapsed .ps-menu-button {
            font-size: 0 !important;
            line-height: 0 !important;
            justify-content: center !important;
            padding: 0 !important;
          }
          /* Hide ONLY the text labels — never recolor the icon. A blanket
             .ps-menu-button star-selector with color:transparent !important was
             overriding each icon's inline per-module color (the SVG stroke is
             currentColor), making every collapsed icon invisible. */
          .is-collapsed .ps-menu-label,
          .is-collapsed .sidebar-label-text {
            color: transparent !important;
          }
          /* Keep icons crisp, full-size, and their own colour in the rail */
          .is-collapsed .ps-menu-icon,
          .is-collapsed .ps-menu-icon * {
            font-size: initial !important;
            line-height: normal !important;
          }
          .is-collapsed .ps-menu-icon svg {
            width: 20px !important;
            height: 20px !important;
          }
          .is-collapsed .ps-menu-icon {
            margin-right: 0 !important;
            margin-left: 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
          }
          /* Center the favicon on the same vertical axis as the collapsed
             menu icons (drop the px-3 left padding, center the flex row). */
          .is-collapsed .sidebar-logo-container {
            justify-content: center !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .is-collapsed .sidebar-logo-container img {
            max-width: 40px !important;
            height: auto !important;
          }
        `}
      </style>
    </>
  );
};

/* Memoized so the sidebar does NOT re-render when the Layout flips its
   `isHovered` flag on mouse-enter (the prop `effectiveCollapsed` is unchanged
   while the sidebar is expanded). Re-renders on hover made react-pro-sidebar
   re-measure the open submenu and replay its height animation — a visible
   "jerk", most obvious on groups with a single page. It still re-renders for
   real changes: route, collapse/expand, and tab switches. */
export default React.memo(DasbhboardSidebar);
