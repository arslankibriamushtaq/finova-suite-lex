import { useEffect, useState } from "react";
import { Input } from "antd";
import TableView from "../TableView/TableView";

const PartnerOnboarding = () => {
  const [data, setData] = useState<any>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const Activity_Loans_Header = [
    {
      name: "Customer Name",
      selector: (row: any) => row.customerName,
    },
    {
      name: "Product Name",
      selector: (row: any) => row.productName,
    },
    {
      name: "Cr Number",
      selector: (row: any) => row.crNumber,
    },
    {
      name: "Email",
      selector: (row: any) => row.email,
    },
    {
      name: "Phone",
      selector: (row: any) => row.phone,
    },
    {
      name: "Date",
      selector: (row: any) => row.date,
    },
    {
      name: "Action",
      selector: (row: any) => row.action,
    },
  ];

  const mappedData =
    data &&
    data?.map((item: any) => {
      return {
        id: item?.id,
        customerName: item?.customer_name || "-",
        productName: item?.product_name || "-",
        crNumber: item?.cr_number || "-",
        email: item?.email || "-",
        phone: item?.phone || "-",
        date: item?.date || "-",
        action: item?.action || "-",
      };
    });

  return (
    <>
      <div className="container-fluid px-4 p-2 mt-2">
        <div className="row">
          <div className="col-12">
            <div className="row mt-3">
              <div className="col-12 mb-3 d-flex justify-content-between align-items-center">
                <div className="col-6">
                  <h3>OnBoard Customers</h3>
                </div>
                <div className="col-6 d-flex justify-content-end align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <label style={{ whiteSpace: "nowrap", marginBottom: 0 }}>
                      From
                    </label>
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      style={{
                        width: "180px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <label style={{ whiteSpace: "nowrap", marginBottom: 0 }}>
                      To
                    </label>
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      style={{
                        width: "180px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-12 custom-table-wrapper">
                <TableView
                  header={Activity_Loans_Header}
                  data={mappedData}
                  paginationShow={false}
                  locale={{ emptyText: "No Data Found" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerOnboarding;

