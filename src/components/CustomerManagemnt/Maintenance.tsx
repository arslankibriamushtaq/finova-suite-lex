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
const Maintenance = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  return (
    <>
      <div className="cs-table p-3">
        <h2 className="col-md-12 pt-2 d-flex align-items-center  fs-6 fw-bold">
          {"Transaction Batch Information"}
        </h2>
        <TableHeaderFilter />

        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
          header={Customer_List_Header}
          data={data}
        />
      </div>
      <div className="cs-table">
        <DynamicHeaderStructure
          title={"Transaction Batch Information"}
          button={button}
        />
        <div className="col-md-12">
          <div className="col-md-6">
            <div className="col-md-12 d-flex">
              <div className="col-md-5 d-flex">
                <input type="checkbox" />

                <div className="ps-2 simple-text">Monetory</div>
              </div>
              <div className="col-md-7 d-flex">
                <input type="checkbox" />

                <div className="ps-2 simple-text">Batch</div>
              </div>
            </div>
          </div>
          <div className="col-md-6 pt-3">
            <div className="col-md-12 d-flex">
              <div className="col-md-5">
                <div className="simple-text">Date</div>
                <div className="pt-2">
                  <DatePicker className="col-11" />
                </div>
              </div>
              <div className="col-md-7">
                <div className="simple-text">Transaction</div>
                <div className="pt-2">
                  <Select style={{ width: "100%" }}>
                    <option value="1">Test</option>
                    <option value="1">Test</option>
                    <option value="1">Test</option>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <div className="border-bottom pt-4"></div>
          <h2 className="col-md-12 pt-4 d-flex align-items-center  fs-6 fw-bold">
            {"Parameters"}
          </h2>
          <TableHeaderFilter />
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            totalRows={totalRows}
            header={Customer_List_Header}
            data={data}
          />
          <h2 className="col-md-12 pt-4 d-flex align-items-center  fs-6 fw-bold">
            {"Results"}
          </h2>
          <TableHeaderFilter />
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            totalRows={totalRows}
            header={Customer_List_Header}
            data={data}
          />
        </div>
      </div>
    </>
  );
};
export default Maintenance;
