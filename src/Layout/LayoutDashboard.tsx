import "./sidebar-hover.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import DasbhboardHeader from "../components/DashboardHeader/Header";
import DasbhboardSideBar from "../components/DashboardSideBar/DashboardSideBar";
import { RootState } from "../redux/rootReducer";
import { authSlice } from "../redux/apis/apisSlice";
import DashboardInfoSubHeader from "../components/DashboardHeader/DashboardSubheader";
import { filterUtils } from "../utils/const.utils";
const LayoutDashboard = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(true);
const location=window.location.pathname

   const themeBuilder = useSelector((state: RootState) => state.block.theme);
  const collapsed = useSelector((state: RootState) => state.block.collapsed);
  const [isHovered, setIsHovered] = useState(false);

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
      {/* {loading ? (
        <Loader />
      ) : ( */}
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
            paddingInlineStart: isMobile ? "0" : (collapsed && !isHovered ? "80px" : "290px"),
            transition: "padding-inline-start 0.3s ease"
          }}
          className={`flex ${isMobile ? "" : "colTwo"}`}
        >
          <DasbhboardHeader />
          <div
            className="page-content-area"
            style={location=="/profile"?{ backgroundColor: themeBuilder?.appBackgroundColor, height:"92vh", padding: "1rem" }:{backgroundColor: themeBuilder?.appBackgroundColor, padding: "1rem"}}
          >
            <Outlet />
          </div>
        </div>
      </div>
      {/* )} */}
    </>
  );
};
export default LayoutDashboard;
