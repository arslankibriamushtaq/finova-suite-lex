import React, { useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Images } from "../Config/Images";
import BrandLogo from "../shared/BrandLogo";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RootState } from "../../redux/rootReducer";
import { authSlice } from "../../redux/apis/apisSlice";
import { themeStyle } from "../Config/Theme";

// Map each English sidebar label (kept as the item's stable identity, used for
// active/comparison logic) to its translation key so labels can be translated
// only at render time without altering any logic.
const SIDEBAR_LABEL_KEYS: Record<string, string> = {
  "Accounting & Financing": "accountingFinancing",
  "Loan Reports": "loanReports",
};

const DasbhboardSidebar = () => {
  const { t } = useTranslation("sidebar");
  const tr = (label?: string) =>
    label && SIDEBAR_LABEL_KEYS[label] ? t(SIDEBAR_LABEL_KEYS[label]) : label;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let tokenValue = localStorage.getItem("accessToken");
  const [activeBar, setActiveBar] = useState<string | null>(
    "Accounting & Financing"
  );
  const [activeSubBar, setActiveSubBar] = useState<string | null>(null);
  const [sidebarLinksApi, setSidebarLinksApi] = useState([]);
  const [sidebarLinksApiCompliance, setSidebarLinksApiCompliance] = useState(
    []
  );
  const [sidebarLinks, setSidebarLinks] = useState([]);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const toggled = useSelector((state: RootState) => state.block.toggled);
  const location = useLocation();
  const pathname = location.pathname;
  const sidebarItems = [
    {
      label: "Accounting & Financing",
      Link: "AccountingFinancing",
      active: pathname == "/AccountingFinancing",
    },

    {
      label: "Loan Reports",
      Link: "loans",
      active: pathname == "/loans",
    },
    // {
    //   label: "Expense Reports",
    //   Link: "",
    //   active: pathname == "/accountingFinancing",
    // },
    // {
    //   label: "Receivable",
    //   Link: "",
    //   active: pathname == "/accountingFinancing",
    // },
    // {
    //   label: "Payable",
    //   Link: "",
    //   active: pathname == "/accountingFinancing",
    // },
  ];

  // useEffect(() => {
  //   sidebarmenu();
  // }, []);

  // const handleRetry = () => {
  //   setFullscreenError(null);
  //   sidebarmenu();
  // };

  const onSmash = (item: any) => {
    setActiveBar(item);
    setActiveSubBar(null);
    item === "Compliance Dashboard"
      ? setSidebarLinksApi(sidebarLinksApiCompliance)
      : setSidebarLinksApi(sidebarLinks);
  };

  // const GlobalStyle = createGlobalStyle`
  //   .menu-items{
  //     background:${themeBuilder?.sideBarmenuBackgroundColor}!important;
  //     color:${themeBuilder?.sidebarTextColor}!important;
  //   }
  //   .css-1654oxy > .ps-menu-button{
  //     background:${themeBuilder?.table?.backgroundColor}!important;
  //   }
  //   .ps-menu-button:hover {
  //     background:${themeBuilder?.table?.backgroundColor}!important;
  //   }
  //   .active {
  //     .css-1tqrhto > .ps-menu-button {
  //       background:${themeBuilder?.table?.backgroundColor}!important;
  //       color:#fff!important;
  //     }
  //   }
  // `;

  const renderSubmenu = (item: any) => (
    <div className="menu-items" key={item.label}>
      <SubMenu label={tr(item.label)} onClick={() => setActiveBar(item.label)}>
        {item.menu.map((submenuItem: any, subIndex: any) => (
          <Link
            to={`${submenuItem.Link}`}
            style={{
              textDecoration: "none",
              color: submenuItem.active ? "#ffff" : "Black",
              backgroundColor: submenuItem.active
                ? "#EB0D0D"
                : themeStyle?.dashboardSibeBarFlow.flowSideBarLogoBg,
              fontSize: "12px",
            }}
          >
            <MenuItem
              style={{
                fontSize: "12px",
                fontWeight: "400",
                color: "#000000",
                textDecoration: "none",
              }}
              className={submenuItem.label === activeSubBar ? "active" : ""}
              key={subIndex}
              onClick={() => setActiveSubBar(submenuItem.label)}
            >
              {tr(submenuItem.label)}
            </MenuItem>
          </Link>
        ))}
      </SubMenu>
    </div>
  );

  return (
    <>
      <div>
        <Sidebar
          transitionDuration={1000}
          onBackdropClick={() => dispatch(authSlice.actions.toggleSidebar())}
          toggled={toggled}
          customBreakPoint="768px"
          collapsedWidth="80px"
          width="100%"
          className="col-12 fw-bold menu-items"
          style={{ fontSize: "14px", color: "black" }}
        >
          <span
            // href={`flow/dashboard`}
            onClick={() => {
              navigate("/lms/dashboard");
            }}
            className="d-flex justify-content-center p-2"
            style={{
              backgroundColor:
                themeStyle?.dashboardSibeBarFlow.flowSideBarLogoBg,
            }}
          >
            <BrandLogo height={80} />
          </span>
          <Menu>
            {sidebarItems.map((item: any, index: any) => (
              <React.Fragment key={index}>
                {item.menu ? (
                  renderSubmenu(item)
                ) : (
                  <div className="menu-items">
                    <Link
                      to={`${item.Link}`}
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        textDecoration: "none",
                        backgroundColor: item.label.active
                          ? "#EB0D0D"
                          : "transparent",
                        color: item.label.active ? "#fff" : "black",
                      }}
                      className={item.label === activeBar ? "active" : ""}
                    >
                      <MenuItem
                        active={item.label === activeBar}
                        onClick={() => onSmash(item.label)}
                        prefix={
                          <img
                            width={20}
                            height={20}
                            src={item.img ? item.img : Images.BlackIcon}
                            style={{ background: "none" }}
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
      </div>
      {fullscreenError && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backdropFilter: "blur(12px)",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: "61px",
          }}
        >
          <div className="not-found-error">
            <img src={Images.errorEmoji} alt="" />
          </div>
          {fullscreenError}
          <button className="retry-button mt-3">Reload</button>
        </div>
      )}
      {/* 
      <GlobalStyle /> */}
    </>
  );
};

export default DasbhboardSidebar;
