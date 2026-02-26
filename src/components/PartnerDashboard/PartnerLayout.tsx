import React, { useEffect, useState } from "react";

import { Outlet } from "react-router-dom";

import PartnerHeader from "./PartnerHeader";

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
      <div className="col-12">
        <PartnerHeader />
        <Outlet />
      </div>
      {/* )} */}
    </>
  );
};
export default LayoutTeanenett;
