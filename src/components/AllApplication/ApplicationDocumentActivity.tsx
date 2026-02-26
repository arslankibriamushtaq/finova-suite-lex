import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { Activity_Loans_Header } from "../../components/Config/TableHeaders";
import TableView from "../../components/TableView/TableView";
import { DatePicker } from "antd";

const data = [
  {
    Id: "kajbdsf",
    ApplicationNo: "2235",
    Time: "--",
    Date: "--",
    UpdatedBy: "11@gmail.com",
    Event: "--",
    Changes: "11@gmail.com",
  },
];

const ApplicationDocumentActivity = () => {
  const checkReduxState = useSelector((state: RootState) => state.block.check);
  return (
    <>
      <div className="cs-table card">
        <div className="card-body">
          <div className="col-xl-12 col-12 d-flex align-items-center pb-3">
            <h2 className="col-xl-6 col-12 fs-6 fw-bold">Activity Log</h2>
            <form
              action="search-bar"
              className="col-lg-6 col-12 d-flex justify-content-end pb-2"
            >
              <div className="d-flex justify-content-between ">
                <div className="d-grid">
                  <label htmlFor="" className="label-theme">
                    From
                  </label>
                  <DatePicker
                    style={{
                      width: "200px",
                      height: "36px",
                      marginRight: "10px",
                    }}
                  />
                </div>

                <div className="d-grid">
                  <label htmlFor="" className="label-theme">
                    To
                  </label>
                  <DatePicker
                    style={{
                      width: "200px",
                      height: "36px",
                    }}
                  />
                </div>
              </div>
            </form>
          </div>
          <h2 className="col-xl-6 col-12 fs-6 fw-bold">
            Application# ALAN-9913715516
          </h2>
          <TableView header={Activity_Loans_Header} data={data} />
        </div>
      </div>
    </>
  );
};
export default ApplicationDocumentActivity;
