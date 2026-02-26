import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import DashboardHeader from "../SuperAdmin/DashboardHeader";

const LayoutTeanenett = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(true);

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
      <div className="col-md-12">
        <DashboardHeader />
        <Outlet />
      </div>
      {/* )} */}
    </>
  );
};
export default LayoutTeanenett;
