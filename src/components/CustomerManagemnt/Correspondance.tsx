import { Customer_List_Header } from "../../components/Config/TableHeaders";
import TableView from "../../components/TableView/TableView";
import { DatePicker, Select } from "antd";
import DynamicHeaderStructure from "../../components/DynamicHeaderStructure";
import TableHeaderFilter from "../TableHeaderFilter";
import { useState } from "react";

const data = [
  {
    Customer: "jhdbfs",
    ProductName: "kajbdsf",
    ApplicationNo: "2235",
    CrNumber: "1234",
    Email: "11@gmail.com",
    Phone: "123456",
    Date: "12.34.2044",
    ParentStatus: "---",
    Status: "active",
    Action: "--",
  },
];
const button = [
  { title: "Save and Add" },
  { title: "Save and Stay" },
  { title: "Save and Return" },
  { title: "Return" },
];
const buttonSub = [{ title: "Add" }];
const Correspondance = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  return (
    <>
      <div className="cs-table p-3">
        <h2 className="col-md-12 pt-2 d-flex align-items-center  fs-6 fw-bold">
          {"Correspondance"}
        </h2>
        <TableHeaderFilter />

        <TableView header={Customer_List_Header} data={data} />
      </div>
      <div className="cs-table">
        <DynamicHeaderStructure
          title={"Transaction Batch Information"}
          button={button}
        />
        <div className="col-md-12">
          <div className="col-md-6 pt-3">
            <div className="col-md-12 d-flex">
              <div className="col-md-6 px-1">
                <div className="simple-text">Correspondance</div>
                <div className="pt-2">
                  <Select style={{ width: "100%" }}>
                    <option value="1">Test</option>
                    <option value="1">Test</option>
                    <option value="1">Test</option>
                  </Select>
                </div>
              </div>
              <div className="col-md-6 px-1">
                <div className="simple-text">Date</div>
                <div className="pt-2">
                  <DatePicker className="col-11" />
                </div>
              </div>
            </div>
          </div>
          <div className="border-bottom pt-5"></div>
          <div className="p-3">
            <h2 className="col-md-12 pt-4 d-flex align-items-center  fs-6 fw-bold">
              {"Documents"}
            </h2>
            <TableHeaderFilter />
            <TableView header={Customer_List_Header} data={data} />
            <h2 className="col-md-12 pt-4 d-flex align-items-center  fs-6 fw-bold">
              {"Documents Elements"}
            </h2>
            <TableHeaderFilter />
            <TableView header={Customer_List_Header} data={data} />
          </div>
        </div>
      </div>
    </>
  );
};
export default Correspondance;
