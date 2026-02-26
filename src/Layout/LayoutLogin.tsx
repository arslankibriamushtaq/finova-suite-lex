import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import DasbhboardHeader from "../components/DashboardHeader/Header";
import DasbhboardSideBar from "../components/DashboardSideBar/DashboardSideBar";
import { RootState } from "../redux/rootReducer";
import SubHeaderFlow from "../components/DashboardHeader/SubHeaderFlow";
import { themeStyle } from "../components/Config/Theme";

const LayoutLogin = () => {
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
      <div>
        <Outlet />
      </div>
    </>
  );
};
export default LayoutLogin;
