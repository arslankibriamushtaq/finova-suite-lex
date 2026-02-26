import React, { useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Images } from "../Config/Images";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RootState } from "../../redux/rootReducer";
import { authSlice } from "../../redux/apis/apisSlice";
import { themeStyle } from "../Config/Theme";
import { link } from "fs";
import { getPermissionsByRolename } from "../../redux/apis/apisCrudLms";

const DasbhboardSidebarLms = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const tokenValue = localStorage.getItem("accessToken");
  localStorage.setItem("activeBar", `Dashboard`);
  localStorage.setItem("activeSubBar", "All Customers");

  const [activeSubBar, setActiveSubBar] = useState(
    localStorage.getItem("activeSubBar") || ""
  );
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const toggled = useSelector((state: RootState) => state.block.toggled);
  const [allowedPermissions, setAllowedPermissions] = useState<any[]>([]);
  const extractAllowedPermissions = (data:any) => {
    const permissions = new Set();

    data.forEach((module:any) => {
      if (module.permissionLists && module.permissionLists.length > 0) {
        // Add moduleName
        permissions.add(module.moduleName);

        // Add individual permission names
        module.permissionLists.forEach((perm:any) => {
          permissions.add(perm.name);
        });
      }
    });

    return Array.from(permissions);
  };

 useEffect(() => {
  const fetchPermissions = async () => {
    try {
      const losData = JSON.parse(localStorage.getItem("awn-los-data") || "{}");

      // Check if permissions are already stored
      const storedPermissions = localStorage.getItem("awn-role-permissions");
      if (storedPermissions) {
        setAllowedPermissions(JSON.parse(storedPermissions));
        return;
      }

      // Fetch if not found in localStorage
      // const role = { roleName: losData?.role };
      const role = { roleName: "super_admin" };
      const response = await getPermissionsByRolename(role);
      const flatPermissions = extractAllowedPermissions(response?.data?.data);

      // Save in localStorage
      localStorage.setItem("awn-role-permissions", JSON.stringify(flatPermissions));
      setAllowedPermissions(flatPermissions);
    } catch (err) {
      console.error("Error fetching permissions", err);
    }
  };

  fetchPermissions();
}, []);

  function filterSidebarItems(items:any, allowedPermissions:any) {
    return items
      .map((item:any) => {
        // Handle nested menu recursively
        if (item.menu) {
          const filteredMenu = filterSidebarItems(
            item.menu,
            allowedPermissions
          );

          if (
            allowedPermissions.includes(item.label) ||
            filteredMenu.length > 0
          ) {
            return {
              ...item,
              menu: filteredMenu,
            };
          }
          return null;
        }

        // For single-level items
        return allowedPermissions.includes(item.label) ? item : null;
        // return item;
      })
      .filter(Boolean); // Remove nulls
  }

  const sidebarItems = [
    {
      label: "Dashboard",
      Link: `dashboard`,
      img: Images.dashboardIcon,
      active: pathname == "/lms/dashboard",
      // == "/lms/dashboard",
    },

    {
      label: "Customers",
      Link: "Customers/AllCustomers",
      img: Images.CustomerManagementIcon,
      active: pathname.split("/").includes("Customers"),
      // menu: [
      //   {
      //     label: "All Customers",
      //     Link: "AllCustomers",
      //     LinkLable: "Customers",
      //     active: pathname == "/lms/Customers/AllCustomers",
      //   },
      //   {
      //     label: "Individuals",
      //     Link: "Individuals",
      //     LinkLable: "Customers",
      //     active: pathname == "/lms/Customers/Individuals",
      //   },
      //   {
      //     label: "Business",
      //     Link: "Business",
      //     LinkLable: "Customers",
      //     active: pathname == "/lms/Customers/Business",
      //   },
      //   // {
      //   //   label: "KYC / KYB",
      //   //   Link: "kyc-kyb",
      //   //   LinkLable: "Customers",
      //   //   active: pathname == "/lms/Customers/kyc-kyb",
      //   // },
      // ],
    },

    {
      label: "Loan Management",
      Link: "loanmanagement",
      img: Images.loanIcon,
      active: pathname.split("/").includes("LoanManagement"),
      menu: [
        {
          label: "All Applications",
          Link: "ApplicationManagement",
          LinkLable: "LoanManagement",
          active: pathname == "/lms/LoanManagement/ApplicationManagement",
        },

        // {
        //   label: "Invoice Management",
        //   Link: "invoicemanagement",
        //   LinkLable: "LoanManagement",
        //   active: pathname == "/lms/LoanManagement/invoicemanagement",
        // },

        {
          label: "Other Fees/Charges",
          Link: "OtherFee",
          LinkLable: "LoanManagement",
          active: pathname == "/lms/LoanManagement/OtherFee",
        },
      ],
    },
 
    {
      label: "Department Management",
      Link: "departmentmanagement",
      img: Images.DepartmentManagementIcon,
      active: pathname.split("/").includes("DepartmentManagement"),
      menu: [
        {
          label: "Department",
          Link: "all-departments",
          LinkLable: "DepartmentManagement",
          active: pathname == "/lms/DepartmentManagement/all-departments",
        },
        {
          label: "Department Permissions",
          Link: "permission",
          LinkLable: "DepartmentManagement",
          active: pathname == "/lms/DepartmentManagement/permission",
        },
      ],
    },
    {
      label: "Reports",
      Link: "Reports",
      img: Images.reportsIconDark,
      active: pathname.split("/").includes("Reports"),
      menu: [
         {
          label: "Account Report",
          Link: "AccountReportsList",
          LinkLable: "Reports",
          active: pathname == "/lms/Reports/AccountReportsList",

        },
       
        {
          label: "Accounting & Financing",
          Link: "AccountingFinancing",
          LinkLable: "Reports",
          active: pathname.split("/").includes("AccountingFinancing"),
          menu: [
            {
              label: "Voucher",
              link: "vouchers",
              linkLable: "AccountingFinancing",
              active: pathname.split("/").includes("vouchers"),
            },
            {
              label: "Day Book",
              link: "daybook",
              linkLable: "AccountingFinancing",
              active: pathname.split("/").includes("daybook"),
            },
            {
              label: "Trial Balance",
              link: "trialbalance",
              linkLable: "AccountingFinancing",
              active: pathname.split("/").includes("trialbalance"),
            },
            {
              label: "Ledger",
              link: "ledger",
              linkLable: "AccountingFinancing",
              active: pathname.split("/").includes("ledger"),
            },
          ],
        },
        {
          label: "Loans Reports",
          Link: "loans",
          LinkLable: "Reports",
          active: pathname.split("/").includes("loans"),
          menu: [
            {
              label: "Overdue Loan",
              link: "overdue",
              linkLable: "loans",
              active: pathname.split("/").includes("overdue"),
            },
            {
              label: "Non Performing Loan",
              link: "performingLoans",
              linkLable: "loans",
              active: pathname.split("/").includes("performingLoans"),
            },
            {
              label: "Due Loan",
              link: "due",
              linkLable: "loans",
              active: pathname.split("/").includes("due"),
            },
            {
              label: "Early Settlement",
              link: "earlySettlement",
              linkLable: "loans",
              active: pathname.split("/").includes("earlySettlement"),
            },
            {
              label: "Write Off Loan",
              link: "writeOff",
              linkLable: "loans",
              active: pathname.split("/").includes("writeOff"),
            },
          ],
        },
      ],
    },
    {
      label: "Chart of account",
      Link: "ChartOfAccount",
      active: pathname.split("/").includes("ChartOfAccount"),
      img: Images.accountCharts,
      menu: [
        {
          label: "Chart of account",
          Link: "ChartOfAccount",
          LinkLable: "ChartOfAccount",
          active: pathname == "/lms/ChartOfAccount/ChartOfAccount",
        },
        {
          label: "COA Configuration",
          Link: "CoaConfiguration",
          LinkLable: "ChartOfAccount",
          active: pathname == "/lms/ChartOfAccount/CoaConfiguration",
        },
      ],
    },
 
    {
      label: "Setting",
      Link: "notification",
      img: Images.SettingsIcon,
      active: pathname.split("/").includes("Setting"),
      menu: [
        // {
        //   label: "Product Management",
        //   Link: "ProductManagement",
        //   LinkLable: "Setting",
        //   active: pathname == "/lms/Setting/ProductManagement",
        // },
        {
          label: "Product Fee",
          Link: "ProductFee",
          LinkLable: "Setting",
          active: pathname == "/lms/Setting/ProductFee",
        },
        {
          label: "Delinquency",
          Link: "Deliquency",
          LinkLable: "Setting",
          active: pathname == "/lms/Setting/Deliquency",
        },
        {
          label: "Work Flow Mapping",
          Link: "WorkFlowMapping",
          LinkLable: "Setting",
          active: pathname == "/lms/Setting/WorkFlowMapping",
        },
        {
          label: "Invoice Setting",
          Link: "InvoiceSetting",
          LinkLable: "Setting",
          active: pathname == "/lms/Setting/InvoiceSetting",
        },
        // {
        //   label: "Calculator",
        //   Link: "Calculator",
        //   LinkLable: "Setting",
        //   active: pathname == "/lms/Setting/Calculator",
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
      ],
    },
    {
      label: "Logs",
      Link: "Logs",
      img: Images.logsIcon,
      active: pathname.split("/").includes("Logs"),
      menu: [
         {
          label: "Logs",
          Link: "AllLogs",
          LinkLable: "Logs",
          active: pathname == "/lms/Logs/AllLogs",
        },
         {
          label: "Api Logs",
          Link: "ApiLogs",
          LinkLable: "Logs",
          active: pathname == "/lms/Logs/ApiLogs",
        },
        {
          label: "Disburse Amount Api Logs",
          Link: "DisburseApprovedAmountApiLogs",
          LinkLable: "Logs",
          active: pathname == "/lms/Logs/DisburseApprovedAmountApiLogs",
        },
      ],
    },
       {
      label: "Reconciliation",
      Link: "Reconciliation/Dashboard",
      active: pathname.split("/").includes("Reconciliation"),
      img: Images.LovIcon,
      menu: [
        {
          label: "Reconciliation Dashboard",
          Link: "Dashboard",
          LinkLable: "Reconciliation",
          active: pathname == "/lms/Reconciliation/Dashboard",
        },
        {
          label: "Transactions Logs",
          Link: "Transactions",
          LinkLable: "Reconciliation",
          active: pathname == "/lms/Reconciliation/Transactions",
        },
        {
          label: "Operational Expenses",
          Link: "OperationalExpenses",
          LinkLable: "Reconciliation",
          active: pathname == "/lms/Reconciliation/OperationalExpenses",
        },
        {
          label: "Reconciliation Summary",
          Link: "ReconciliationSummary",
          LinkLable: "Reconciliation",
          active: pathname == "/lms/Reconciliation/ReconciliationSummary",
        },
        {
          label: "Error Report",
          Link: "ErrorReport",
          LinkLable: "Reconciliation",
          active: pathname == "/lms/Reconciliation/ErrorReport",
        },
        {
          label: "Transaction Accounts",
          Link: "TransactionAccounts",
          LinkLable: "Reconciliation",
          active: pathname == "/lms/Reconciliation/TransactionAccounts",
        },
      ],
    },
    {
      label: "LOS",
      Link: "/Dashboard",
      img: Images.HomePageManagementIcon,
      imgActive: Images.HomePageManagementIconActive,
      active: pathname.split("/").includes("/Dashboard"),
    },
    {
      label: "Expenses",
      Link: `Expenses`,
      img: Images.LovIcon,
      active:pathname.split("/").includes("Expenses"),
       menu: [
        {
           label: "Third Party Expense",
           Link: `ThirdPartyExpense`,
           LinkLable: "Expenses",
           img: "",
           active: pathname == "/lms/Expenses/ThirdPartyExpense",
        },
        {
           label: "Loan Application Expenses",
           Link: `LoanApplicationExpenses`,
           LinkLable: "Expenses",
           img: "",
           active: pathname == "/lms/Expenses/LoanApplicationExpenses",
        },
        {
           label: "Onboarding Expenses",
           Link: `OnboardingExpenses`,
           LinkLable: "Expenses",
           img: "",
           active: pathname == "/lms/Expenses/OnboardingExpenses",
        },

      
      ],
    },
  ];
  const [activeBar, setActiveBar] = useState(
    () => sidebarItems.find((item) => pathname.includes(item.Link))?.label || ""
  );

  // Persist activeBar in localStorage when it changes
  useEffect(() => {
    const currentItem = sidebarItems.find((item) =>
      pathname.includes(item.Link)
    );
    if (currentItem) {
      setActiveBar(currentItem.label);
    }
  }, [pathname]);

  const onSmash = (itemLabel:any) => {
    setActiveBar(itemLabel);
    setActiveSubBar("");
  };

  const renderSubmenu = (item:any) => (
    <div className="menu-items css-12w9als" key={item.label}>
      <SubMenu
        style={{ fontSize: "12px", fontWeight: 500 }}
        prefix={
          <img
            src={item.img}
            style={{
              background: "none",
              color: themeStyle?.dashboardSibeBarFlow.flowSideBarLogoBg,
              filter: hoveredItem === item.label ? "brightness(0) contrast(100%)" : "none",
            }}
            width={16}
            height={16}
          />
        }
        label={item.label}
        defaultOpen={item.active}
        onClick={() => setActiveBar(item.label)}
        onMouseEnter={() => setHoveredItem(item.label)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        {item.menu.map((submenuItem:any, subIndex:any) => {
          const hasNestedMenu =
            Array.isArray(submenuItem.menu) && submenuItem.menu.length > 0;

          return hasNestedMenu ? (
            <SubMenu
              key={subIndex}
              label={submenuItem.label}
              style={{ fontSize: "12px" }}
              defaultOpen={submenuItem.active}
            >
              {submenuItem.menu.map((nestedItem:any, nestedIndex:any) => (
                <Link
                  to={`${submenuItem.LinkLable}/${submenuItem.Link}/${nestedItem.link}`}
                  style={{
                    textDecoration: "none",
                    color: nestedItem.active
                      ? themeStyle?.dashboardSibeBarFlow.activeTextColor
                      : themeStyle?.dashboardSibeBarFlow.inActiveTextColor,
                    backgroundColor: nestedItem.active
                      ? themeStyle?.dashboardSibeBarFlow.activeColorBg
                      : themeStyle?.dashboardSibeBarFlow.inActiveColorBg,
                    fontSize: "13px",
                  }}
                  key={nestedIndex}
                >
                  <MenuItem
                    active={nestedItem.active}
                    onClick={() => setActiveSubBar(nestedItem.label)}
                    style={{
                      fontSize: "11px",
                      fontWeight: "400",
                      textDecoration: "none",
                      height: "36px",
                    }}
                    className={nestedItem.active ? "active" : ""}
                  >
                    {nestedItem.label}
                  </MenuItem>
                </Link>
              ))}
            </SubMenu>
          ) : (
            <Link
              to={`${submenuItem.LinkLable}/${submenuItem.Link}`}
              style={{
                textDecoration: "none",
                color: submenuItem.active
                  ? themeStyle?.dashboardSibeBarFlow.activeTextColor
                  : themeStyle?.dashboardSibeBarFlow.inActiveTextColor,
                backgroundColor: submenuItem.active
                  ? themeStyle?.dashboardSibeBarFlow.activeColorBg
                  : themeStyle?.dashboardSibeBarFlow.inActiveColorBg,
                fontSize: "13px",
              }}
              key={subIndex}
            >
              <MenuItem
                active={submenuItem.active}
                onClick={() => setActiveSubBar(submenuItem.label)}
                style={{
                  fontSize: "11px",
                  fontWeight: "400",
                  textDecoration: "none",
                  height: "36px",
                }}
                className={submenuItem.active ? "active" : ""}
              >
                {submenuItem.label}
              </MenuItem>
            </Link>
          );
        })}
      </SubMenu>
    </div>
  );
  const filteredSidebarItems = filterSidebarItems(
    sidebarItems,
    [...allowedPermissions,'Invoice Setting','Reconciliation Dashboard','Transactions Logs','Operational Expenses','Reconciliation Summary','Error Report','Transaction Accounts','Product Fee','Api Logs']
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
        {/* {pathname} */}
        <span
          // href={`flow/dashboard`}
          onClick={() => {
            navigate("/lms/dashboard");
          }}
          className="d-flex justify-content-center "
          style={{
            backgroundColor: themeStyle?.dashboardSibeBarFlow.flowSideBarLogoBg,
            padding: "0.6rem",
          }}
        >
          <img src={Images.FactoringLogo} alt="logo" height={80} />
        </span>
        <Menu>
          {filteredSidebarItems.map((item:any, index:any) => (
            <React.Fragment key={index}>
              {item.menu ? (
                renderSubmenu(item)
              ) : (
                <div className="menu-items css-12w9als">
              
                    <Link
                      to={item.Link}
                      style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        textDecoration: "none",
                        backgroundColor: item.active
                          ? "#E6E6E6"
                          : "transparent",
                      }}
                      className={item.active ? "active" : ""}
                    >
                      <MenuItem
                        active={item.active}
                        onClick={() => onSmash(item.label)}
                        onMouseEnter={() => setHoveredItem(index)}
                        onMouseLeave={() => setHoveredItem(null)}
                        prefix={
                          <img
                            width={16}
                            height={16}
                            src={item.img ? item.img : Images.BlackIcon}
                            style={{ 
                              background: "none",
                              filter: (hoveredItem === index || item.active) ? "brightness(0) contrast(100%)" : "none"
                            }}
                          />
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

export default DasbhboardSidebarLms;
