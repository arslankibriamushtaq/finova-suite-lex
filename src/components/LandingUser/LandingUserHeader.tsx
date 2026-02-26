import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createGlobalStyle } from "styled-components";
import { RootState } from "../../redux/rootReducer";
import { Images } from "../Config/Images";

const LandingUserHeader = () => {
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
      <div style={{backgroundColor:"#f8f9fa"}}>
      <div className="container px-2 d-flex justify-content-between">
      <img 
            src={Images.FactoringLogo} 
            alt="logo" 
            style={{
              width: "140px",
              height: "auto",
              maxHeight: "90px",
              paddingBlock:"21px"
            }}
          />
       
      </div>
      </div>

      <GlobalStyle />
    </>
  );
};
export default LandingUserHeader;
