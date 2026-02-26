import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createGlobalStyle } from "styled-components";
import { RootState } from "../../redux/rootReducer";
import { themeStyle } from "../Config/Theme";

const NameSubHeaderView = () => {
  const themeBuilder = useSelector((state: RootState) => state.block.theme);
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const customerId = localStorage.getItem("selectedCustomerID");

  const customerName = localStorage.getItem("selectedCustomerName");

  const dispatch = useDispatch();
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
      <div className="subheader_layout bg-black">
        <div className="d-flex align-items-center ">
          <div
            className="col-md-12 navbar-brand ms-3"
            style={{ color: themeBuilder?.color?.headingTextColor }}
          >
            <div className="col-md-12 d-flex">
              <div
                className="col-md-3 d-flex justify-content-start p-1"
                style={{
                  fontWeight: "600",
                  fontSize: "13px",
                  color: themeStyle.textColor,
                }}
              >
                Customer ID:12345
              </div>
              <div
                className="col-md-7 d-flex justify-content-start align-items-center p-1"
                style={{
                  fontWeight: "600",
                  fontSize: "13px",
                  color: themeStyle.textColor,
                }}
              >
                <div className="ps-4">Customer Name:{customerName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GlobalStyle />
    </>
  );
};
export default NameSubHeaderView;
