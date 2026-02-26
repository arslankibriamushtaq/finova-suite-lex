import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { DatePicker } from "antd"; // Import necessary components from Ant Design
import { RootState } from "../../redux/rootReducer";

const { RangePicker } = DatePicker;

const DashboardInfoSubHeader = () => {
  const navigate = useNavigate();
  const themeBuilder = useSelector((state: RootState) => state.block.theme);
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
    .header_layout {
      background: ${themeBuilder?.sideBarmenuBackgroundColor} !important;
    }
  `;
  const onChange = (date: any, dateString: string) => {
  };

  return (
    <>
      <div className="p-3">
        <div className="d-flex align-items-center col-12 mt-3 justify-content-between mb-2">
          <div
            className="d-flex align-items-center col-5"
            style={{ fontWeight: "bold" }}
          >
            Account Timeline
          </div>
          <div className="d-flex align-items-center col-7 justify-content-end gap-2 ">
            <div className="month-picker-container w-100">
              <label className="" htmlFor="">
                Select Month
              </label>
              <DatePicker size="large" picker="month" onChange={onChange} />
            </div>
            <div className="month-picker-container w-100">
              <label htmlFor="">Select Year</label>
              <DatePicker
                picker="year"
                size="large"
                onChange={(e: any) => (date: any, dateString: string) => {
                }}
              />
            </div>
            <div className="month-picker-container w-100">
              <label htmlFor="">From </label>
              <DatePicker
                size="large"
                onChange={(e: any) => (date: any, dateString: string) => {
                }}
              />
            </div>
            <div className="month-picker-container w-100">
              <label htmlFor="">To</label>
              <DatePicker
                size="large"
                onChange={(e: any) => (date: any, dateString: string) => {
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <GlobalStyle />
    </>
  );
};

export default DashboardInfoSubHeader;
