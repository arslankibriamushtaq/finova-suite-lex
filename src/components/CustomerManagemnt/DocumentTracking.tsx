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
const details = [
  { label: "Document Sub Type" },
  { label: "Status" },
  { label: "Deceived Date" },
  { label: "Version" },
  { label: "Tracker ID" },
  { label: "Effective Date" },
  { label: "Page No." },
  { label: "Docket" },
  { label: "Expiry Date" },
  { label: "Document File Type" },
  { label: "Location" },
  { label: "Comment" },
];
const button = [{ title: "View" }, { title: "Audit" }];
const buttonsub = [
  { title: "Save and Add" },

  { title: "Save and Return" },
  { title: "Return" },
];
const DocumentTracking = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  return (
    <>
      <div className="cs-table p-3">
        <TableHeaderFilter />
        <DynamicHeaderStructure title={"Documents"} button={button} />
        <TableView
          header={Customer_List_Header}
          data={data}
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
        />
      </div>
      <div className="cs-table p-3">
        <DynamicHeaderStructure title={"Account Document Details"} />
        <TableHeaderFilter />
        <TableView
          header={Customer_List_Header}
          data={data}
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
        />
        <DynamicHeaderStructure
          title={"Account Document Details"}
          button={buttonsub}
        />
        <div className="d-flex col-md-9 flex-wrap">
          {details.map((item: any) => (
            <div className="col-md-4 pt-2 pb-2">
              {" "}
              <div className="simple-text">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
export default DocumentTracking;
