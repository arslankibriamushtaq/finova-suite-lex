import { Customer_List_Header } from "../../components/Config/TableHeaders";
import TableView from "../../components/TableView/TableView";
import { DatePicker } from "antd";
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
const button = [{ title: "Edit" }, { title: "View" }, { title: "Audit" }];
const buttonSub = [{ title: "Add" }];
const TrackingAttributes = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  return (
    <>
      <div className="cs-table p-2">
        <DynamicHeaderStructure title={"Tracking Attributes"} button={button} />
        <TableHeaderFilter />
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
          header={Customer_List_Header}
          data={data}
        />
      </div>
    </>
  );
};
export default TrackingAttributes;
