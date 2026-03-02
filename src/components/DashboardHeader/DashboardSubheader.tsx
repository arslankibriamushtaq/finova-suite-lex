import { useState } from "react";
import { useDispatch } from "react-redux";
import { DatePicker } from "antd"; // Import necessary components from Ant Design
import { authSlice } from "../../redux/apis/apisSlice";
import { formatDate } from "../../App";

const DashboardInfoSubHeader = () => {
  const dispatch = useDispatch();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedValue, setSelectedValue] = useState("today");

  return (
    <>
      <div className="dashboard-subheader-layout">
        <div className="d-flex align-items-center justify-content-between">
          <div
            className="d-flex align-items-center ms-2"
            style={{ fontWeight: "600", fontSize: "20px" }}
          >
            Overview
          </div>
          <div className="d-flex align-items-center">
            <div
              className="d-flex gap-1 p-2"
              style={{ paddingLeft: "0px !important" }}
            >
              {/* <DatePicker
                className="date-picker"
                placeholder="From"
                value={fromDate}
                onChange={(date) => {
                  setFromDate(date);
                  dispatch(
                    authSlice.actions.setFromFilter({
                      fromFilter: formatDate(date ? date : null),
                    })
                  );
                }}
                allowClear
              />
              <DatePicker
                className="date-picker"
                placeholder="To"
                value={toDate}
                onChange={(date) => {
                  setToDate(date);
                  dispatch(
                    authSlice.actions.setToFilter({
                      toFilter: formatDate(date),
                    })
                  );
                  setSelectedValue(!toDate ? "" : "today");
                  dispatch(authSlice.actions.setTheme({ theme: "" }));
                }}
                allowClear
              /> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default DashboardInfoSubHeader;
