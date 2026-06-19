import React, { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import { getAllTransaction, getCallAction } from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import { NumberFormatter } from "../../App";
const PaymentMode: any = {
  0: 'Cheque',
  1: 'Online',
  2: 'Cash',
  3: 'Gateway',
};
const TransactionHistory = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [allDataTransaction, setAllDataTransaction] = useState<any>();
  const [totalRows, setTotalRows] = useState(0);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const id = localStorage.getItem(`customerId`);
  const handleAllTransactionHistory = async () => {
    setSkelitonLoading(true);
    try {
      const res = await getAllTransaction(id, page, pageSize);
      if (res) {
        const data = res.data.data;
        setTotalRows(res?.data?.pageInfo?.totalItems);
        setAllDataTransaction(data || []);
        setSkelitonLoading(false);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    }
  };
  useEffect(() => {
    handleAllTransactionHistory();
  }, [id, page, pageSize]);
  const data = {
    label: "name",
  };
  const History_List_Header = [
    {
      name: "Application No",
      selector: (row: any) => row.applicationNo,
    },

    {
      name: " Transaction ID",
      selector: (row: any) => row.transactionId,
    },
    {
      name: "Transaction Date",
      selector: (row: any) => row.transactionDate,
      width: "120px",
    },
    {
      name: "Description",
      selector: (row: any) => row.description,
      // width: "400px",
    },

    {
      name: "Debit Amount",
      selector: (row: any) => <NumberFormatter value={row.debitAmount} />,
    },
    {
      name: "Credit Amount",
      selector: (row: any) => <NumberFormatter value={row.creditAmount} />,
    },

    {
      name: "Currency",
      selector: (row: any) => row.currency,
    },
    // {
    //   name: "Currency",
    //   selector: (row: any) => row.currency,
    // },
    {
      name: "Posted By",
      selector: (row: any) => "System Admin",
    },
    {
      name: "Mode",
      selector: (row: any) => row.mode,
    },
    {
      name: "Status",
      width: "150px",
      cell: (row: any) => (
        <div
          style={{
            whiteSpace: "nowrap",
            padding: "0.4rem 1rem",
            borderRadius: "6px",
            backgroundColor: "#92BC83",
            color: "rgba(255, 255, 255, 1)",
            cursor: row.Status === "Active" ? "pointer" : "default",
          }}
        >
          {"Approved"}
        </div>
      ),
    },
  ];
  function formatDate(dateString: any) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based in JS
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
  const filteredData =
    searchQuery.trim() === ""
      ? allDataTransaction // Show all data if search is empty
      : allDataTransaction?.filter((item: any) =>
          item.applicationNo?.toLowerCase().includes(searchQuery.toLowerCase())
        );

  // Transform Data for Table Display
  const mappedData =
    filteredData?.map((item: any) => ({
      id: item.id,
      applicationNo: item.applicationNo,
      transactionId: item.transactionId,
      creditAmount: item.creditAmount,
      debitAmount: item.debitAmount,
      description: item.description || "-",
      transactionDate: formatDate(item.transactionDate) || "-",
      amount: item.amount || "-",
      currency: item.currency == 1 ? "SAR" : "-",
      postedBy: item.postedBy || "-",
      mode:PaymentMode[item?.paymentMode],
      Status: item.status || "-",
    })) || [];

  return (
    <>
      {" "}
      <div className="cs-table p-2 mt-2">
        {/* <div className="d-flex justify-content-end">
          <Input
            placeholder="Search by Application No"
            value={searchQuery}
            prefix={<SearchOutlined />}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            style={{ width: "250px", marginBottom: "10px" }}
          />
        </div> */}
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          header={History_List_Header}
          data={mappedData}
          isLoading={skelitonLoading}
        />

        {filteredData?.length === 0 && !skelitonLoading && (
          <div
            className="d-flex justify-content-center mt-5"
            style={{ color: "red" }}
          >
            No data found
          </div>
        )}
      </div>
    </>
  );
};

export default TransactionHistory;
