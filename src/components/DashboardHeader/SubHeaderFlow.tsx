import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";

import { RootState } from "../../redux/rootReducer";
import { Images } from "../Config/Images";
import { themeStyle } from "../Config/Theme";

const SubHeaderFlow = () => {
  const navigate = useNavigate();
  const themeBuilder = useSelector((state: RootState) => state.block.theme);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const pathname = window.location.pathname;
  const parts = pathname.split("/"); // ["", "view", "customerservices"]
  const view = parts[1]; // "view"
  const location = window.location.pathname;
  // Get the desired parts
  const active = parts[2]; // This would be "LoanManagement"
  const subActive = parts[3];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const GlobalStyle = createGlobalStyle`
  .subheader_layout{
    background: ${themeStyle?.headerColor.subHeaderBgColor} !important;
      color: ${themeStyle?.headerColor.subheaderTextColor} !important;
  }
  `;
  const addSpaceBeforeCapital = (str: string) => {
    return str?.replace(/([a-z])([A-Z])/g, "$1 $2");
  };

  return (
    <>
      <div className="subheader_layout">
        <div className="d-flex align-items-center ">
          <div className="col-md-12 navbar-brand" style={{ color: "black" }}>
            <div className="col-md-11 d-flex">
              <div
                className={
                  "" + view == "view"
                    ? "d-flex justify-content-start align-items-center border-left p-2"
                    : "col-md-3 d-flex justify-content-start align-items-center border-left p-2"
                }
                style={
                  view == "view"
                    ? {
                        fontWeight: "600",
                        fontSize: "16px",
                        width: "286px",
                        cursor: "pointer",
                      }
                    : { fontWeight: "600", fontSize: "18px", cursor: "pointer",color: "#fff" }
                }
                onClick={() => {
                  // navigate("/lms/dashboard");
                  navigate(-1);
                }}
              >
                {view == "view" && (
                  <div className="px-2">
                    {" "}
                    <img
                      src={Images.leftArrow}
                      style={{ filter: "invert(1)" }}
                      alt=""
                      width={24}
                      height={24}
                      // onClick={() => {
                      //     navigate("");
                      // }}
                    />
                  </div>
                )}
                {/* {active == "Reports" && (
                  <div className="px-2">
                    {" "}
                    <img
                      src={Images.leftArrow}
                      style={{ filter: "invert(1)" }}
                      alt=""
                      width={24}
                      height={24}
                      // onClick={() => {
                      //     navigate("");
                      // }}
                    />
                  </div>
                )} */}
                {view == "account" && (
                  <div className="px-2">
                    {" "}
                    <img
                      src={Images.leftArrow}
                      style={{ filter: "invert(1)" }}
                      alt=""
                      width={24}
                      height={24}
                      // onClick={() => {
                      //     navigate("");
                      // }}
                    />
                  </div>
                )}
                {view == "flow" && (
                  <div className="px-2">
                    {" "}
                    <img
                      src={Images.leftArrow}
                      style={{ filter: "invert(1)" }}
                      alt=""
                      width={24}
                      height={24}
                      // onClick={() => {
                      //     navigate("");
                      // }}
                    />
                  </div>
                )}
                {view == "lms" && (
                  <div className="px-2">
                    {" "}
                    <img
                      src={Images.leftArrow}
                      style={{ filter: "invert(1)" }}
                      alt=""
                      width={24}
                      height={24}
                      // onClick={() => {
                      //     navigate("");
                      // }}
                    />
                  </div>
                )}
                {addSpaceBeforeCapital(active)}
              </div>
              <div
                className={
                  view == "view"
                    ? "col-md-12 d-flex justify-content-start align-items-center p-2"
                    : "col-md-9 d-flex justify-content-start align-items-center p-2"
                }
                style={
                  view == "view"
                    ? {
                        fontSize: "14px",
                        color: "#A0A0A0",
                        width: "calc(100% - 286px)",
                      }
                    : { fontSize: "14px", color: "#A0A0A0" }
                }
              >
                <div
                  className="ps-4"
                  style={{ color: themeStyle?.headerColor.subheaderTextColor }}
                >
                  LMS
                </div>
                <div
                  className="ps-2"
                  style={{ color: themeStyle?.headerColor.subheaderTextColor }}
                >
                  {">"}
                </div>
                <div
                  className="ps-2"
                  style={{ color: themeStyle?.headerColor.subheaderTextColor }}
                >
                  {addSpaceBeforeCapital(active)}
                </div>
                <div
                  className="ps-2"
                  style={{ color: themeStyle?.headerColor.subheaderTextColor }}
                >
                  {">"}
                </div>
                <div
                  className="ps-2"
                  style={{
                    color: themeStyle.breadCrumActiveTextColor,
                    fontWeight: "600",
                  }}
                >
                  {addSpaceBeforeCapital(subActive)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GlobalStyle />
    </>
  );
};
export default SubHeaderFlow;