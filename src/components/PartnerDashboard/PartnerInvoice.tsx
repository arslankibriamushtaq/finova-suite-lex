import React from "react";
import { useParams } from "react-router-dom";
import TableView from "../TableView/TableView";

const PartnerInvoice = () => {
  const invoiceNumber = useParams();

  const Activity_Loans_Header = [
    {
      name: "Invoice No",
      selector: (row: any) => row.invoiceNo,
    },
    {
      name: "Amount",
      selector: (row: any) => row.amount,
    },
    {
      name: "Discount",
      selector: (row: any) => row.discount,
    },
    {
      name: "Document",
      selector: (row: any) => row.document,
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            backgroundColor:
              row.status === "Approved"
                ? "#4CAF50"
                : row.status === "Processed"
                ? "#ffc107"
                : "#6c757d",
            padding: "4px 12px",
            borderRadius: "2px",
            color: "#fff",
            fontWeight: 500,
            fontSize: "12px",
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Processed By",
      selector: (row: any) => row.processedBy,
    },
    {
      name: "Uploaded Date",
      selector: (row: any) => row.uploadedDate,
    },
    {
      name: "Action",
      cell: (row: any) => row.action,
    },
  ];

  const data = [
    {
      invoiceNo: "INV-001",
      amount: "SR 12,500.00",
      discount: "SR 0.00",
      document: <a href="#">inv_001.pdf</a>,
      status: "Approved",
      processedBy: "Muhammad Ali",
      uploadedDate: "22 October, 2024 10:21 AM",
      action: <button>View</button>,
    },
    // more rows...
  ];

  return (
    <div className="p-2  mt-3 container-fluid custom-table-wrapper">
      <h4>{invoiceNumber.id}</h4>
      <TableView
        paginationShow={false}
        header={Activity_Loans_Header}
        data={data}
      />
    </div>
  );
};

export default PartnerInvoice;
