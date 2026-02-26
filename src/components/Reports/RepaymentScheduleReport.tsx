import { useEffect, useState, useMemo } from "react";
import TableView from "../TableView/TableView";
import { DatePicker } from "antd";
import toast from "react-hot-toast";
import {
  getRepaymentScheduleReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
const RepaymentScheduleReport = () => {
  const [fromDate, setFromDate] = useState<any>("");
  const [toDate, setToDate] = useState<any>("");
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await getRepaymentScheduleReport(
        fromDate || undefined,
        toDate || undefined
      );
      if (res && res.data) {
        const data = res.data.data || [];
        setAllCallActivity(data);
        setTotalRows(data.length);
        setPage(1); // Reset to first page when data changes
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch repayment schedule report");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: any) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatCurrency = (amount: any) => {
    if (amount === null || amount === undefined) return "-";
    return typeof amount === "number" ? amount.toFixed(2) : amount;
  };

  const mappedData = allCallActivity && allCallActivity.map((item: any) => {
      return {
        installmentNo: item.installmentNo ? item.installmentNo : "-",
        dueDate: item.dueDate ? formatDate(item.dueDate) : "-",
        principalDue: item.principalDue || item.principalDue == 0 ? formatCurrency(item.principalDue) : "-",
        profitOrInterestDue: item.profitOrInterestDue || item.profitOrInterestDue == 0 ? formatCurrency(item.profitOrInterestDue) : "-",
        installmentAmount: item.installmentAmount || item.installmentAmount == 0 ? formatCurrency(item.installmentAmount) : "-",
        remainingPrincipal: item.remainingPrincipal || item.remainingPrincipal == 0 ? formatCurrency(item.remainingPrincipal) : "-",
        status: item.status ? item.status : "-",
        paymentDate: item.paymentDate ? formatDate(item.paymentDate) : "-",
        penalty: item.penalty || item.penalty == 0 ? formatCurrency(item.penalty) : "-",
      };
    });
  

  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return mappedData.slice(startIndex, endIndex);
  }, [mappedData, page, pageSize]);

  useEffect(() => {
    handleSubmit();
    return () => { };
  }, []);

  const Call_Activity_Header = [
    {
      name: "Installment No.",
      selector: (row: { installmentNo: any }) => row.installmentNo,
    },
    {
      name: "Principal Due",
      selector: (row: { principalDue: any }) => row.principalDue,
    },
    {
      name: "Profit/Interest Due",
      selector: (row: { profitOrInterestDue: any }) => row.profitOrInterestDue,
    },
    {
      name: "Installment Amount",
      selector: (row: { installmentAmount: any }) => row.installmentAmount,
    },
    {
      name: "Remaining Principal",
      selector: (row: { remainingPrincipal: any }) => row.remainingPrincipal,
    },
    {
      name: "Penalty",
      selector: (row: { penalty: any }) => row.penalty,
    },
    {
      name: "Due Date",
      selector: (row: { dueDate: any }) => row.dueDate,
    },
    {
      name: "Status",
      cell: (row: { status: any }) => {
        const getStatusColor = (status: string) => {
          switch (status?.toLowerCase()) {
            case "paid":
              return "rgba(63, 195, 128, 0.9)";
            case "unpaid":
              return "#F84D4D";
            case "pending":
              return "#FFC107";
            case "approved":
              return "rgba(63, 195, 128, 0.9)";
            case "rejected":
            case "reject":
              return "#F84D4D";
            default:
              return "#6c757d";
          }
        };
        
        const getStatusLabel = (status: string) => {
          switch (status?.toLowerCase()) {
            case "paid":
              return "Paid";
            case "unpaid":
              return "Unpaid";
            case "pending":
              return "Pending";
            case "approved":
              return "Approved";
            case "rejected":
            case "reject":
              return "Rejected";
            default:
              return status || "-";
          }
        };
        
        return (
          <div
            style={{
              padding: "8px 10px",
              borderRadius: "32px",
              fontSize: "12px",
              backgroundColor: getStatusColor(row.status),
              color: "white",
              display: "inline-block",
              textTransform: "capitalize",
              fontWeight: "500"
            }}
          >
            {getStatusLabel(row.status)}
          </div>
        );
      },
    },
    {
      name: "Payment Date",
      selector: (row: { paymentDate: any }) => row.paymentDate,
    },
    
  ];

  useEffect(() => {
    handleSubmit();
  }, [fromDate, toDate]);
  const exportToCSV = (data: any[], fileName: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }
    const csvRows = [];
    const headers = Object.keys(data[0]); // Assuming all objects have the same keys
    csvRows.push(headers.join(",")); // Join header row with commas

    // Loop through the data and generate CSV rows
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        // Handle values that might contain commas
        return typeof value === "string" && value.includes(",") ? `"${value}"` : value;
      });
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
      setFromDate(""); // Handle case when date is cleared
    }
  };

  // Handle "to" date change
  const handleToDateChange = (date: any | null) => {
    const dateTo = dayjs(date);
    if (dateTo) {
      const formattedDate = dateTo.format("YYYY-MM-DDTHH:mm:ss");
      setToDate(formattedDate);
    } else {
      setToDate(""); // Handle case when date is cleared
    }
  };
  return (
    <>
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center">
          <div className="col-10">
            <h5 className="mb-0">Repayment Schedule Report</h5>
          </div>
          {/* <div className="col-2 text-end">
            <button
              className="theme-btn-next"
              onClick={() => {
                setModal(true);
              }}
            >
              Create Voucher
            </button>
          </div> */}
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
                  handleSubmit();
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
                exportToCSV(mappedData, "RepaymentScheduleReport");
              }}
            >
              Export CSV
            </button>
          </div>
        </div>
        <div className="cs-table p-2 mt-3">
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            totalRows={totalRows}
            header={Call_Activity_Header}
            data={paginatedData}
            isLoading={loading}
          />
        </div>
      </div>

      {/* <TableView /> */}
    </>
  );
};

export default RepaymentScheduleReport;
