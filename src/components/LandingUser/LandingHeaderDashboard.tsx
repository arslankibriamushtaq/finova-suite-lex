import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createGlobalStyle } from "styled-components";
import { RootState } from "../../redux/rootReducer";
import { Images } from "../Config/Images";
// import SuperAdmin from "./SuperAdmin";
import { themeStyle } from "../Config/Theme";
import { useTranslation } from "react-i18next";

const LandingHeaderDashboard = () => {
  const { t } = useTranslation("landingUser");
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
    background: ${themeStyle?.headerColor.dashboardHeaderBgColor} !important;
  }
  `;
  return (
    <>
      <div className={"header_layout_Teanenet d-flex justify-content-center"}>
        <div className="col-11 d-flex justify-content-end">
          <div className="col-5 d-flex justify-content-end">
            <div
              style={{
                fontSize: "14px",
                fontWeight: "400",
                color: "#FFFFFF",
                lineHeight: "14px",
              }}
              className="col-2 d-flex justify-content-end simple-text"
            >
              {/* <img src={Images.searchIconWhite} alt="" width={13} height={13} /> */}
              <div className="ps-1">{t("common:search")}</div>
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "400",
                color: "#FFFFFF",
                lineHeight: "14px",
              }}
              className="col-2 d-flex justify-content-end simple-text"
            >
              {t("nav.support")}
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "400",
                color: "#FFFFFF",
                lineHeight: "14px",
              }}
              className="col-2 d-flex justify-content-end simple-text px-3"
            >
              {t("nav.about")}
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "400",
                color: "#FFFFFF",
                lineHeight: "14px",
              }}
              className="col-2 d-flex justify-content-end simple-text"
            >
              {t("nav.contactUs")}
            </div>
          </div>
        </div>
   
      </div>

      <GlobalStyle />
    </>
  );
};
export default LandingHeaderDashboard;
