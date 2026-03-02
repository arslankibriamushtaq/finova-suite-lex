import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import DasbhboardHeader from "../components/DashboardHeader/Header";
import { RootState } from "../redux/rootReducer";
import SubHeaderFlow from "../components/DashboardHeader/SubHeaderFlow";
import DasbhboardSideBarLms from "../components/DashboardSideBar/DasbhboardSideBarLms";
import HeadingHeader from "../components/HeadingHeader";
import DashboardSideBar from "../components/DashboardSideBar/DashboardSideBar";
 
const LayoutLms = () => {
  const location=useLocation();
  const pathname=location.pathname;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // const [loading, setLoading] = useState(true);
  const themeBuilder = useSelector((state: RootState) => state.block.theme);
 
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    // setTimeout(() => {
    //   setLoading(false);
    // }, 2000);
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
            background: "var(--theme-flow-dashboard-sidebar-bg)",
            zIndex: 0,
          }}
        >
          <DashboardSideBar />
        </div>
        <div  style={{display:"block"}} className={`flex ${isMobile ? "" : "colTwo"}`}>
          <DasbhboardHeader />
          {/* <SubHeaderFlow /> */}
          {/* <HeadingHeader/> */}
          <div
            className={pathname.includes("dashboard") ? "" : "p-3"}
            style={{ backgroundColor: themeBuilder?.appBackgroundColor }}
          >
            {/* <div className="service" style={{background: "white" ,padding: '1rem', borderRadius: "10px"}}> */}
            <Outlet />
            {/* </div> */}
          </div>
        </div>
      </div>
      {/* )} */}
    </>
  );
};
export default LayoutLms;