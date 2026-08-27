import React, { useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Images } from "../Config/Images";
import BrandLogo from "../shared/BrandLogo";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RootState } from "../../redux/rootReducer";
import { authSlice } from "../../redux/apis/apisSlice";
import { themeStyle } from "../Config/Theme";
import { link } from "fs";
import { getPermissionsByRolename } from "../../redux/apis/apisCrudLms";

// Map each English sidebar label (kept as the item's stable identity, used for
// permission filtering / active-state logic) to its translation key so labels
// are translated only at render time without altering any logic.
const SIDEBAR_LABEL_KEYS: Record<string, string> = {
  Dashboard: "dashboard",
  "All Tickets": "allTickets",
  Tickets: "tickets",
  "My Tickets": "myTickets",
  Reports: "reports",
  Priorities: "priorities",
  Categories: "categories",
  "Sub Categories": "subCategories",
  Escalation: "escalation",
  Customers: "customers",
  Logs: "logs",
  LOS: "los",
};

const DasbhboardSidebarCms = () => {
  const { t } = useTranslation("sidebar");
  const tr = (label?: string) =>
    label && SIDEBAR_LABEL_KEYS[label] ? t(SIDEBAR_LABEL_KEYS[label]) : label;
  const dispatch = useDispatch();
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
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
      active: pathname == "/cms/dashboard",
    },
    {
      label: "All Tickets",
      Link: "Tickets/AllTickets",
      img: Images.allTickets,
      active: pathname.split("/").includes("AllTickets"),
    },
    {
      label: "Tickets",
      Link: "Tickets/GetTickets",
      img: Images.tickets,
      active: pathname.split("/").includes("GetTickets") && !pathname.includes("AllTickets") && !pathname.includes("MyTickets"),
    },
    {
      label: "My Tickets",
      Link: "Tickets/MyTickets",
      img: Images.myTickets,
      active: pathname.split("/").includes("MyTickets"),
    },
    {
      label: "Reports",
      Link: "Reports",
      img: Images.reportsIconDark,
      active: pathname.split("/").includes("Reports"),
    },
    {
      label: "Priorities",
      Link: "Priorities",
      img: Images.priorities,
      active: pathname.split("/").includes("Priorities"),
    },
    {
      label: "Categories",
      Link: "Categories",
      img: Images.categories,
      active: pathname.split("/").includes("Categories") && !pathname.includes("SubCategories"),
    },
    {
      label: "Sub Categories",
      Link: "SubCategories",
      img: Images.categories,
      active: pathname.split("/").includes("SubCategories"),
    },
    {
      label: "Escalation",
      Link: "Escalation",
      img: Images.escalation,
      active: pathname.split("/").includes("Escalation"),
    },
    {
      label: "Customers",
      Link: "Customers",
      img: Images.CustomerManagementIcon,
      active: pathname.split("/").includes("Customers"),
    },
    {
      label: "Logs",
      Link: "Logs",
      img: Images.logsIcon,
      active: pathname.split("/").includes("Logs"),
    },
    {
      label: "LOS",
      Link: "/Dashboard",
      img: Images.HomePageManagementIcon,
      imgActive: Images.HomePageManagementIconActive,
      active: pathname.split("/").includes("/Dashboard"),
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
        label={tr(item.label)}
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
              label={tr(submenuItem.label)}
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
                    {tr(nestedItem.label)}
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
                {tr(submenuItem.label)}
              </MenuItem>
            </Link>
          );
        })}
      </SubMenu>
    </div>
  );
  const filteredSidebarItems = filterSidebarItems(
    sidebarItems,
    [...allowedPermissions,"All Tickets","Tickets","My Tickets","Reports","Priorities","Categories","Sub Categories","Escalation","Customers","Logs","LOS"]
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
            navigate("/cms/dashboard");
          }}
          className="d-flex justify-content-center "
          style={{
            backgroundColor: themeStyle?.dashboardSibeBarFlow.flowSideBarLogoBg,
            padding: "0.6rem",
          }}
        >
          <BrandLogo height={80} />
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
                        {tr(item.label)}
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
 
export default DasbhboardSidebarCms;