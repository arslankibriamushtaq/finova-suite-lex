import "./sidebar-hover.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import DasbhboardHeader from "../components/DashboardHeader/Header";
import { RootState } from "../redux/rootReducer";
import DashboardSideBar from "../components/DashboardSideBar/DashboardSideBar";
import { authSlice } from "../redux/apis/apisSlice";

const LayoutLms = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const themeBuilder = useSelector((state: RootState) => state.block.theme);
  const collapsed = useSelector((state: RootState) => state.block.collapsed);
  const [isHovered, setIsHovered] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) {
        dispatch(authSlice.actions.setToggled(false));
      }
    };
    handleResize(); // Call on mount
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch]);

  return (
    <>
      <div className={`flex ${isMobile ? "sidebar-mobile" : "side-bar"}`}>
        <div
          className={`flex ${isMobile ? "" : "colOne"}`}
          onMouseEnter={() => !isMobile && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            backgroundColor: "var(--theme-flow-dashboard-sidebar-bg)",
            width: isMobile ? "0" : (collapsed && !isHovered ? "80px" : "290px"),
            minWidth: isMobile ? "0" : undefined,
            overflow: isMobile ? "hidden" : undefined,
            transition: "width 0.3s ease",
            zIndex: 1005,
            boxShadow: isHovered && collapsed ? "4px 0 15px rgba(0,0,0,0.15)" : "none"
          }}
        >
          <DashboardSideBar effectiveCollapsed={isMobile ? false : (collapsed && !isHovered)} />
        </div>
        <div
          style={{
            display: "block",
            width: "100%",
            paddingLeft: isMobile ? "0" : (collapsed && !isHovered ? "80px" : "290px"),
            transition: "padding-left 0.3s ease"
          }}
          className={`flex ${isMobile ? "" : "colTwo"}`}
        >
          <DasbhboardHeader />
          <div
            className="page-content-area"
            style={{ backgroundColor: themeBuilder?.appBackgroundColor, padding: "1rem" }}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};
export default LayoutLms;