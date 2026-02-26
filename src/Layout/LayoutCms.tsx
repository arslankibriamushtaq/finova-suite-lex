import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import DasbhboardHeader from "../components/DashboardHeader/Header";
import DasbhboardSideBar from "../components/DashboardSideBar/DashboardSideBar";
import { RootState } from "../redux/rootReducer";
import SubHeaderFlow from "../components/DashboardHeader/SubHeaderFlow";
import { themeStyle } from "../components/Config/Theme";
import DasbhboardSidebarCms from "../components/DashboardSideBar/DashboardSideBarCms";
 
const LayoutCms = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(true);
  const themeBuilder = useSelector((state: RootState) => state.block.theme);
  const location=useLocation();
  const pathname=location.pathname;
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
 
  return (
    <>
      <div className={`flex ${isMobile ? "sidebar-mobile" : "side-bar"}`}>
        <div
          className={`flex ${isMobile ? "" : "colOne"}`}
          style={{
            background: themeStyle?.dashboardSibeBarFlow.flowDashboardSideBarBg,
            zIndex: 0,
          }}
        >
          <DasbhboardSidebarCms />
        </div>
        <div  style={{display:"block"}} className={`flex ${isMobile ? "" : "colTwo"}`}>
          <DasbhboardHeader />
          {/* <SubHeaderFlow /> */}
          <div
            className={pathname.includes("dashboard") ? "" : "p-3"}
            style={{ backgroundColor: themeBuilder?.appBackgroundColor }}
          >
            <Outlet />
          </div>
        </div>
      </div>
      {/* )} */}
    </>
  );
};
export default LayoutCms;