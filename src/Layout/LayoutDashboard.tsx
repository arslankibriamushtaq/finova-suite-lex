import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import DasbhboardHeader from "../components/DashboardHeader/Header";
import DasbhboardSideBar from "../components/DashboardSideBar/DashboardSideBar";
import { RootState } from "../redux/rootReducer";
import DashboardInfoSubHeader from "../components/DashboardHeader/DashboardSubheader";
import { filterUtils } from "../utils/const.utils";
const LayoutDashboard = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(true);
const location=window.location.pathname

  const themeBuilder = useSelector((state: RootState) => state.block.theme);

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
      {/* {loading ? (
        <Loader />
      ) : ( */}
      <div className={`flex ${isMobile ? "sidebar-mobile" : "side-bar"}`}>
        <div
          className={`flex ${isMobile ? "" : "colOne"}`}
          style={{
            backgroundColor: "var(--theme-flow-dashboard-sidebar-bg)",
          }}
        >
          <DasbhboardSideBar />
        </div>
        <div style={{display:"block"}} className={`flex ${isMobile ? "" : "colTwo"}`}>
          <DasbhboardHeader />
          {/* {
            location!="/profile" &&  <DashboardInfoSubHeader />
          } */}
         

          <div
            className="p-3 pt-0"
            style={location=="/profile"?{ backgroundColor: themeBuilder?.appBackgroundColor,height:"92vh" }:{backgroundColor: themeBuilder?.appBackgroundColor}}
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
