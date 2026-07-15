import React from "react";
import { useTranslation } from "react-i18next";

import TableView from "../../components/TableView/TableView";

const Approval = () => {
  const { t } = useTranslation("allApplication");
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
      name: t("approval.column.checks"),
      selector: (row: { Checks: any }) => row.Checks,
    },
    {
      name: t("common:status"),
      selector: (row: { Status: any }) => row.Status,
    },
    {
      name: t("approval.column.processedDate"),
      selector: (row: { Date: any }) => row.Date,
    },
    {
      name: t("approval.column.processedBy"),
      selector: (row: { ProcessedBy: any }) => row.ProcessedBy,
    },
    {
      name: t("approval.column.comment"),
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
