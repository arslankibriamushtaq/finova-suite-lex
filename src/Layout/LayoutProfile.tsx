import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import DasbhboardHeader from "../components/DashboardHeader/Header";
import DasbhboardSideBar from "../components/DashboardSideBar/DashboardSideBar";
import { RootState } from "../redux/rootReducer";
import { themeStyle } from "../components/Config/Theme";
import DashboardInfoSubHeader from "../components/DashboardHeader/DashboardSubheader";
import { filterUtils } from "../utils/const.utils";
const LayoutProfile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(true);

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
            backgroundColor:
              themeStyle?.dashboardSibeBarFlow.flowDashboardSideBarBg,
          }}
        >
          <DasbhboardSideBar />
        </div>
        <div  style={{display:"block"}}  className={`flex ${isMobile ? "" : "colTwo"}`}>
          <DasbhboardHeader />
          {/* <DashboardInfoSubHeader /> */}

          <div
            className="p-3"
            style={{ backgroundColor: themeBuilder?.appBackgroundColor,height:"92vh" }}
          >
            <Outlet />
          </div>
        </div>
      </div>
      {/* )} */}
    </>
  );
};
export default LayoutProfile;
