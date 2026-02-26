import { useState } from "react";
import { FaBars } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { createGlobalStyle } from "styled-components";
import { authSlice } from "../../redux/apis/apisSlice";
import type { RootState } from "../../redux/rootReducer";
import { Images } from "../Config/Images";
import SuperAdmin from "./SuperAdmin";
import { themeStyle } from "../Config/Theme";
import { useNavigate } from "react-router-dom";
import Notifications from "./NotificationModule";
import { Select } from "antd";
import { RiLogoutBoxRLine } from "react-icons/ri";

const DashboardHeaderLms = () => {
  const navigate = useNavigate();
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const dispatch = useDispatch();
  const themeBuilder = useSelector((state: RootState) => state.block.theme);

  const pathname = window.location.pathname;
  const parts = pathname.split("/");
  const view = parts[1];

  const GlobalStyle = createGlobalStyle`
    .header_layout {
      background: ${themeBuilder?.sideBarmenuBackgroundColor} !important;
    }
  `;

  const backgroundColorClass = themeStyle?.headerColor?.backgroundColor;
  const handleUserAction = (value: string) => {
    if (value === "logout") {
      localStorage.removeItem("awn-token");
      localStorage.removeItem("awn-los-data");
      localStorage.removeItem("awn-role-permissions");
      // navigate("/login");
      window.location.replace(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/dashboard`)
    }
  };
  return (
    <>
      <div
        className={
          view === "view"
            ? "border-bottom"
            : view === "account"
            ? ""
            : "header_layout"
        }
      >
        <div className="d-flex">
          {isMobile && (
            <div>
              <button
                className="bar-btn"
                onClick={() => dispatch(authSlice.actions.toggleSidebar())}
              >
                <FaBars />
              </button>
            </div>
          )}
          {(view === "view" || view === "account") && (
            <div
              className="border-left"
              style={{
                width: "290px",
                background: themeStyle?.dashboardSibeBarFlow.flowSideBarLogoBg,
              }}
            >
              <span
                onClick={() => navigate("/lms/dashboard")}
                className="d-flex justify-content-center p-2"
              >
                <img
                  src={Images.FactoringLogo || "/placeholder.svg"}
                  alt="logo"
                  height={80}
                />
              </span>
            </div>
          )}
          <div
            className={`d-flex col-md-12 ${backgroundColorClass}`}
            style={
              view === "view" || view === "account"
                ? { width: "calc(100% - 290px)" }
                : {}
            }
          >
            <div
              className="col-md-8 navbar-brand"
              style={{ color: themeBuilder?.color?.headingTextColor }}
            >
              <div className="col-md-7 d-flex">
                <div
                  className="col-md-4 d-flex justify-content-center"
                  style={{ color: themeStyle?.color?.headingTextColor }}
                >
                  {/* LMS */}
                </div>
                {/* <div className="col-md-4 d-flex justify-content-center">
                  LOS
                </div>
                <div className="col-md-4 d-flex justify-content-center">
                  Onboarding
                </div> */}
              </div>
            </div>
            <div
              className={
                view === "view"
                  ? "d-flex col-md-4 justify-content-end gap-4 p-2"
                  : "d-flex col-md-4 justify-content-end gap-4"
              }
              style={{ alignItems: "center" }}
            >
              <Notifications />
              <Select
                onChange={handleUserAction}
                value="admin"
                bordered={false}
                style={{ width: 150 }}
                dropdownStyle={{ minWidth: 120 }}
                suffixIcon={
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3 3.5L6 6.5L9 3.5L10 4.5L6 8.5L2 4.5L3 3.5Z"
                      fill="#A0A0A0"
                    />
                  </svg>
                }
                options={[
                  {
                    label: (
                      <div className="d-flex align-items-center gap-2">
                        <img
                          style={{
                            backgroundColor: "lightgray",
                            borderRadius: "50%",
                            padding: "4px",
                            width: 24,
                            height: 24,
                          }}
                          src={Images.userLogo || "/placeholder.svg"}
                          alt="User"
                        />
                        <span>Admin</span>
                      </div>
                    ),
                    value: "admin",
                    disabled: true,
                  },
                  {
                    label: (
                      <span style={{ color: "red" }}>
                        <RiLogoutBoxRLine /> Logout
                      </span>
                    ),
                    value: "logout",
                  },
                ]}
              />
            </div>
          </div>
        </div>
        {showSuperAdmin && (
          <div className="d-flex">
            <SuperAdmin />
          </div>
        )}
      </div>
      <GlobalStyle />
    </>
  );
};

export default DashboardHeaderLms;
