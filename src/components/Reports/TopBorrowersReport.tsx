import { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import { DatePicker } from "antd";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getTopBorrowersReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
const TopBorrowersReport = () => {
  const [fromDate, setFromDate] = useState<any>("");
  const [toDate, setToDate] = useState<any>("");
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const id = useParams();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await getTopBorrowersReport(
        fromDate || undefined,
        toDate || undefined
      );
      if (res) {
        const data = res.data.data;
        setAllCallActivity(data || []);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatCurrency = (amount: any) => {
    if (amount === null || amount === undefined) return "-";
    return typeof amount === "number"? amount.toFixed(2) : amount;
  };

  const mappedData =
    allCallActivity &&
    allCallActivity.map((item: any) => {
      return {
        customerName: item.customerName ? item.customerName : "-",
        numberOfLoans: item.numberOfLoans || item.numberOfLoans == 0 ? item.numberOfLoans : "-",
        totalDisbursedAmount: item.totalDisbursedAmount || item.totalDisbursedAmount == 0 ? formatCurrency(item.totalDisbursedAmount) : "-",
        lastTransactionDate: formatDate(item.lastTransactionDate ? item.lastTransactionDate : "-"),
        totalOutstandingAmount: item.totalOutstandingAmount || item.totalOutstandingAmount == 0 ? formatCurrency(item.totalOutstandingAmount) : "-",
        riskCategory: item.riskCategory ? item.riskCategory : "-",
        totalProfitPaid: item.totalProfitPaid || item.totalProfitPaid == 0 ? formatCurrency(item.totalProfitPaid) : "-",
        penaltiesPaid: item.penaltiesPaid || item.penaltiesPaid == 0 ? formatCurrency(item.penaltiesPaid) : "-",

      };
    });

  useEffect(() => {
    handleSubmit();
    return () => { };
  }, [id, page, pageSize, fromDate]);
  const Call_Activity_Header = [
    {
      name: "Customer",
      cell: (row: any) => row.customerName,
    },
    {
      name: "Number of Loans",
      selector: (row: { numberOfLoans: any }) => row.numberOfLoans,
    },
    {
      name: "Total Disbursed Amount",
      selector: (row: { totalDisbursedAmount: any }) => row.totalDisbursedAmount,
    },
    {
      name: "Total Profit Paid",
      selector: (row: { totalProfitPaid: any }) => row.totalProfitPaid,
    },
    {
      name: "Penalties Paid",
      selector: (row: { penaltiesPaid: any }) => row.penaltiesPaid,
    },
    {
      name: "Total Outstanding Amount",
      selector: (row: { totalOutstandingAmount: any }) => row.totalOutstandingAmount,
    },
    {
      name: "Last Transaction Date",
      selector: (row: { lastTransactionDate: any }) => row.lastTransactionDate,
    },
    {
      name: "Risk Category",
      selector: (row: { riskCategory: any }) => row.riskCategory,
    },
  ];

  useEffect(() => {
    if (fromDate && toDate) {
      handleSubmit();
    }
  }, [fromDate, toDate]);
  const exportToCSV = (data: any[], fileName: string) => {
    const csvRows = [];
    const headers = Object.keys(data[0]); // Assuming all objects have the same keys
    csvRows.push(headers.join(",")); // Join header row with commas

    // Loop through the data and generate CSV rows
    data.forEach((row) => {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(","));
    });

    // Create CSV string
    const csvString = csvRows.join("\n");

    // Create a Blob from the CSV string and trigger a download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
  };
  const handleFromDateChange = (date: any) => {
    const dateFrom = dayjs(date);
    if (dateFrom) {
      const formattedDate = dateFrom.format("YYYY-MM-DDTHH:mm:ss");
      setFromDate(formattedDate);
    } else {
      setFromDate(null); // Handle case when date is cleared
    }
  };

  // Handle "to" date change
  const handleToDateChange = (date: any | null) => {
    const dateTo = dayjs(date);
    if (dateTo) {
      const formattedDate = dateTo.format("YYYY-MM-DDTHH:mm:ss");
      setToDate(formattedDate);
    } else {
      setToDate(null); // Handle case when date is cleared
    }
  };

  return (
    <>
      <div className="col-12">
        <div className="mb-3 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">Loan Disbursment Report</h3>
        </div>
        <div className="d-flex mt-3 justify-content-between align-items-center">
          <div className="row align-items-center">
            {/* From Date */}
            <div className="col-md-4">
              <label htmlFor="fromDate" className="form-label">
                From
              </label>
              <DatePicker
                onChange={(e: any) => {
                  handleFromDateChange(e);
                }}
                placeholder="Select From Date"
              />
            </div>

            {/* To Date */}
            <div className="col-md-4">
              <label htmlFor="toDate" className="form-label">
                To
              </label>
              <DatePicker
                onChange={handleToDateChange}
                placeholder="Select To Date"
              />
            </div>

            {/* Voucher Type Select */}
            <div className="col-md-2">
              {/* <label htmlFor="voucherType" className="form-label">
                Voucher Type
              </label>
                    <Select id="voucherType" /> */}
              <button
                className="invoice-btn bg-dark mt-4 "
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
              >
                Clear
              </button>
            </div>

            {/* Account Select */}
            <div className="col-md-2">
              {/* <label htmlFor="account" className="form-label">
                Account
              </label>
              <Select id="account" /> */}
            </div>
          </div>
          <div className="col-md-3 mt-3">
            {/* <button
              className="mt-2 theme-btn-next bg-dark"
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
            >
              Clear
            </button> */}
          </div>
          <div className="col-2 text-end">
            <button
              className="invoice-btn mt-4 bg-dark"
              onClick={() => {
                exportToCSV(allCallActivity, "OverDueLoans");
              }}
            >
              Export CSV
            </button>
          </div>
        </div>
        <div
          className="bg-white"
          style={{
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            totalRows={totalRows}
            header={Call_Activity_Header}
            data={mappedData}
            isLoading={loading}
          />
        </div>
      </div>

      {/* <TableView /> */}
    </>
  );
};

export default TopBorrowersReport;
