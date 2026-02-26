import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { Activity_Loans_Header } from "../../components/Config/TableHeaders";
import TableView from "../../components/TableView/TableView";

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

const ApplicationDocumentView = () => {
  const checkReduxState = useSelector((state: RootState) => state.block.check);
  return (
    <>
      <div className="cs-table card">
        <div className="card-body">
          <div className="col-xl-12 col-12 d-flex align-items-center pb-3">
            <h2 className="col-xl-6 col-12 fs-6 fw-bold">
              Documents against this application:
            </h2>
            <div className="col-xl-6 col-12 d-flex justify-content-end align-items-center">
              <div className="theme-btn mt-1">View All Documents</div>
            </div>
          </div>
          <TableView header={Activity_Loans_Header} data={data} />
        </div>
      </div>
    </>
  );
};
export default ApplicationDocumentView;
