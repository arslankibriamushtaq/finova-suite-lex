import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createGlobalStyle } from "styled-components";
import { RootState } from "../../redux/rootReducer";

const DashboardHeaderTeanenetFlow = () => {
  const themeBuilder = useSelector((state: RootState) => state.block.theme);
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);
  const [viewLayout, setViewLayout] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const pathname = window.location.pathname;
  const parts = pathname.split("/"); // ["", "view", "customerservices"]
  const view = parts[1]; // "view"
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
      <div className="px-2 d-flex justify-content-end border-bottom">
        <div className="flex justify-between" style={{ padding: "10px" }}>
          <div className="d-flex items-center">
            <div
              className="p-3"
              style={{
                backgroundColor: " #1963b9",
                color: "white",
                borderTopLeftRadius: "10px",
                borderBottomLeftRadius: "10px",
              }}
            >
              EN
            </div>
            <div
              className="p-3"
              style={{
                backgroundColor: "rgba(236, 236, 236, 1)",
                color: "black",
                borderTopRightRadius: "10px",
                borderBottomRightRadius: "10px",
              }}
            >
              AR
            </div>
          </div>
        </div>
      </div>

      <GlobalStyle />
    </>
  );
};
export default DashboardHeaderTeanenetFlow;
