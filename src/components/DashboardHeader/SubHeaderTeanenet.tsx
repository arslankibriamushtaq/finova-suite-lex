import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { RootState } from "../../redux/rootReducer";
import { Images } from "../Config/Images";
import SuperAdmin from "./SuperAdmin";

const SubHeaderTeanenet = () => {
  const navigate = useNavigate();
  const themeBuilder = useSelector((state: RootState) => state.block.theme);
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const dispatch = useDispatch();
  const pathname = window.location.pathname;
  const parts = pathname.split("/"); // ["", "view", "customerservices"]
  const view = parts[1]; // "view"
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
  .header_layout{
    background: ${themeBuilder?.sideBarmenuBackgroundColor} !important;
  }
  `;
  return (
    <>
      <div
        className={"subHeader_layout_Teanenet d-flex justify-content-center"}
      >
        <div className="col-11 d-flex justify-content-end">
          <div className="col-4 d-flex justify-content-start align-items-center">
            <img src={Images.FactoringLogo} alt="" height={80}/>
          </div>
          <div className="col-4 d-flex justify-content-end align-items-center">
            <div
              style={{
                fontSize: "18px",
                fontWeight: "400",
                color: "#000000",
                lineHeight: "18px",
              }}
              className="col-3 d-flex justify-content-center simple-text"
            >
              Home
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "400",
                color: "#000000",
                lineHeight: "18px",
              }}
              className="col-3 d-flex justify-content-center"
            >
              Products
            </div>
          </div>
          <div className="col-4 d-flex justify-content-start align-items-center">
            <div
              style={{
                fontSize: "18px",
                fontWeight: "400",
                color: "#000000",
                lineHeight: "18px",
              }}
              className="col-5 d-flex justify-content-center simple-text"
            >
              Products Guide
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "400",
                color: "#000000",
                lineHeight: "18px",
              }}
              className="col-3 d-flex justify-content-center"
            >
              Packages
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "400",
                color: "#000000",
                lineHeight: "16px",
                cursor: "pointer",
              }}
              className="col-3 d-flex justify-content-center pt-3 pb-3 px-3 sign-in"
              onClick={() => {
                navigate("/login");
              }}
            >
              Sign In
            </div>
          </div>
        </div>
        {showSuperAdmin && (
          <>
            <div className="d-flex">
              <SuperAdmin />
            </div>
          </>
        )}
      </div>

      <GlobalStyle />
    </>
  );
};
export default SubHeaderTeanenet;
