import { useRef, useState } from "react";
import { FaBars, FaTimes, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { createGlobalStyle } from "styled-components";
import { authSlice, setToken } from "../../redux/apis/apisSlice";
import type { RootState } from "../../redux/rootReducer";
import { Images } from "../Config/Images";
import BrandLogo from "../shared/BrandLogo";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { RiArrowDropDownFill } from "react-icons/ri";
import toast from "react-hot-toast";
import { logOutApi } from "../../redux/apis/apisCrud";
import { store } from "../../redux/store";
import NotificationInbox from "../NotificationInbox";
import ThemeToggle from "../ThemeToggle";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../language-switcher";
import { AdminNotificationBell } from "../notifications/AdminNotificationBell";

// Defined outside the component so styled-components doesn't recreate it on
// every render (avoids the "created dynamically" warning). The dynamic theme
// colour is passed in as a prop instead.
const HeaderGlobalStyle = createGlobalStyle<{ $bg?: string }>`
  .header_layout {
    background: ${(props) => props.$bg} !important;
  }
`;

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const themeBuilder = useSelector((state: RootState) => state.block.theme);
  const collapsed = useSelector((state: RootState) => state.block.collapsed);

  const pathname = window.location.pathname;
  const parts = pathname.split("/");
  const view = parts[1];
  const storedUserData = localStorage.getItem("userData");
  const user = storedUserData ? JSON.parse(storedUserData) : null;

  const backgroundColorClass = "header-background-color";
  const toggleMenu = () => {
    setOpen(!open);
  };

  const logOut = async () => {
    try {
      // Try to call logout API, but don't fail if it doesn't work
      await logOutApi().catch((err) => {
        console.warn("Logout API failed, but proceeding with local logout:", err);
      });

      // Always clear local data regardless of API success
      dispatch(setToken({ token: "" }));
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("permissions");
      navigate("/login");
      toast.success(t("loggedOutSuccess"));
    } catch (error: any) {
      console.error("Error during log out", error);
      // Even if there's an error, clear local data and redirect
      dispatch(setToken({ token: "" }));
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("permissions");
      navigate("/login");
      toast.error(t("loggedOutWithErrors"));
    }
  };
  function splitCamelCase(str: string) {
    return (
      str
        // Preserve acronyms like API, UI, etc.
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // Split before non-acronym uppercase-lowercase transition
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Split camelCase
        .trim()
    );
  }
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
          <div className="d-flex align-items-center ps-0">
            <button
              className="bar-btn"
              type="button"
              aria-label={t("toggleSidebar")}
              title={t("toggleSidebar")}
              aria-expanded={!collapsed}
              style={{ position: "relative", zIndex: 1001 }}
              onClick={() => {
                if (window.innerWidth <= 768) {
                  dispatch(authSlice.actions.toggleSidebar());
                } else {
                  dispatch(authSlice.actions.setCollapsed(!collapsed));
                }
              }}
            >
              {collapsed ? <FaTimes /> : <FaBars />}
            </button>
          </div>
          {(view === "view" || view === "account") && (
            <div
              className="border-left"
              style={{
                width: "290px",
                background: "var(--theme-flow-sidebar-logo-bg)",
              }}
            >
              <span
                onClick={() => navigate("/lms/dashboard")}
                className="d-flex justify-content-center p-2"
              >
                <BrandLogo />
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
                  className="col-md-4 d-flex fs-20 fw-600 gap-3 ps-3"
                  style={{ color: "var(--theme-heading-text-color)" }}
                >
                  {/* <img src={Images.HeaderIcon} alt="Header Icon" /> */}

                  {/* {splitCamelCase(view)} */}
                </div>
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
              <div className="d-flex align-items-center">
                <a
                  style={{ justifySelf: "left", marginRight: "4px" }}
                  href={`/flow/dashboard`}
                >
                  {/* <img src={Images.notification} alt="Notifications" /> */}
                </a>
                <LanguageSwitcher />
                <ThemeToggle />
                <AdminNotificationBell />
                <div className="user-profile-trigger d-flex align-items-center" onClick={toggleMenu} style={{ cursor: "pointer" }}>
                  <img
                    src={Images.userIcon}
                    alt="User Icon"
                    className="user-avatar"
                  />
                  <span className="user-name d-flex align-items-center ps-1">
                    <div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "var(--foreground)",
                        }}
                      >
                        {user?.name || user?.user?.name || user?.fullName || user?.user?.fullName || user?.displayName || user?.user?.displayName || user?.userName || user?.user?.userName}
                      </div>
                      {/* Removed email display as requested */}
                      {/* <div
                        className="mt-1"
                        style={{
                          fontSize: "14px",
                          fontWeight: "400",
                          color: "#999797",
                        }}
                      >
                        {user?.email || user?.user?.email}
                      </div> */}
                    </div>

                    <RiArrowDropDownFill />
                  </span>
                </div>
              </div>
              {open && (
                <div ref={menuRef} className="profile-dropdown">
                  {/* Close Button */}
                  <Button
                    variant="light"
                    className="close-btn"
                    onClick={() => setOpen(false)}
                  >
                    ✕
                  </Button>

                  {/* Profile Picture */}
                  <div className="profile-picture d-flex justify-content-center">
                    <img src={Images.userIcon} alt={user?.name || user?.user?.name || user?.fullName || user?.user?.fullName || user?.displayName || user?.user?.displayName || user?.userName || user?.user?.userName || "User"} />
                    {/* <span className="edit-icon">✎</span> */}
                  </div>

                  {/* User Name */}
                  <h4 className="profile-name">
                    {" "}
                    {t("welcome")} , {user?.name || user?.user?.name || user?.fullName || user?.user?.fullName || user?.displayName || user?.user?.displayName || user?.userName || user?.user?.userName}
                  </h4>

                  {/* Profile Actions */}
                  <div className="profile-actions">
                    <button
                      className="profile-btn left"
                      onClick={() => navigate("/profile")}
                    >
                      <FaCog className="icon" /> {t("settings")}
                    </button>
                    <div className="divider"></div>
                    <button
                      className="profile-btn right"
                      onClick={() => {
                        logOut();
                      }}
                    >
                      <FaSignOutAlt className="icon" /> {t("logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <HeaderGlobalStyle $bg={themeBuilder?.sideBarmenuBackgroundColor} />
    </>
  );
};

export default DashboardHeader;
