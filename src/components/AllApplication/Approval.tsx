import React from "react";

import TableView from "../../components/TableView/TableView";

const Approval = () => {
  const data = [
    {
      Checks: "jhdbfs",
      ProductName: "kajbdsf",
      ApplicationNo: "2235",
      CrNumber: "1234",
      Email: "11@gmail.com",
      Phone: "123456",
      Date: "12.34.2044",
      ParentStatus: "---",
      Status: "active",
      ProcessedBy: "--",
    },
    {
      Checks: "jhdbfs",
      ProductName: "kajbdsf",
      ApplicationNo: "2235",
      CrNumber: "1234",
      Email: "11@gmail.com",
      Phone: "123456",
      Date: "12.34.2044",
      ParentStatus: "---",
      Status: "inactive",
      ProcessedBy: "--",
    },
  ];
  const Leads_Header = [
    {
      name: "Checks",
      selector: (row: { Checks: any }) => row.Checks,
    },
    {
      name: "Status",
      selector: (row: { Status: any }) => row.Status,
    },
    {
      name: "Processed Date",
      selector: (row: { Date: any }) => row.Date,
    },
    {
      name: "Processed By",
      selector: (row: { ProcessedBy: any }) => row.ProcessedBy,
    },
    {
      name: "Comment",
      selector: (row: { Comment: any }) => row.Comment,
    },
  ];

  return (
    <>
      <div className="cs-table pt-2">
        <TableView header={Leads_Header} data={data} />
      </div>
    </>
  );
};
export default Approval;
