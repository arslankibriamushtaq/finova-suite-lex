import "./sidebar-hover.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import DasbhboardHeader from "../components/DashboardHeader/Header";
import DasbhboardSideBar from "../components/DashboardSideBar/DashboardSideBar";

import { RootState } from "../redux/rootReducer";
import HeadingHeader from "../components/HeadingHeader";
import { authSlice } from "../redux/apis/apisSlice";

const Layout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(true);
  const themeBuilder = useSelector((state: RootState) => state.block.theme);
  const collapsed = useSelector((state: RootState) => state.block.collapsed);
  const [isHovered, setIsHovered] = useState(false);
  const location = window.location.pathname.split("/")[1];

  const dispatch = useDispatch();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        dispatch(authSlice.actions.setToggled(false));
      }
    };
    handleResize(); // Call on mount
    setTimeout(() => {
      setLoading(false);
    }, 2000);
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
          <DasbhboardSideBar effectiveCollapsed={isMobile ? false : (collapsed && !isHovered)} />
        </div>
        <div
          style={{
            display: "block",
            width: "100%",
            // Logical property so the reserved sidebar gutter mirrors in RTL
            // (Arabic): start = left in LTR, right in RTL.
            paddingInlineStart: isMobile ? "0" : (collapsed && !isHovered ? "80px" : "290px"),
            transition: "padding-inline-start 0.3s ease"
          }}
          className={`flex ${isMobile ? "" : "colTwo"}`}
        >
          <DasbhboardHeader />
          {location == "Los" && <HeadingHeader />}
          <div
            className="page-content-area pt-0"
            style={{
              backgroundColor: themeBuilder?.appBackgroundColor,
              padding: "1rem",
              minHeight: "94vh",
            }}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};
export default Layout;
