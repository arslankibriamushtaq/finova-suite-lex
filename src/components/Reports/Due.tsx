import { useEffect, useState, useMemo } from "react";
import TableView from "../TableView/TableView";
import { DatePicker } from "antd";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getDueLoansReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const Due = () => {
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const id = useParams();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const start = fromDate ? fromDate.format("YYYY-MM-DD") : "2000-01-01";
      const end = toDate ? toDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
      const res = await getDueLoansReport(start, end);
      if (res) {
        const data = res.data.data?.items;
        setAllCallActivity(Array.isArray(data) ? data : []);
        setTotalRows(Array.isArray(data) ? data.length : 0);
      }
    } catch (error: any) {
      console.error("Error fetching due loans:", error);
      toast.error(error?.message || "Failed to fetch due loans");
      setAllCallActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const mappedData = useMemo(() => {
    return (Array.isArray(allCallActivity) ? allCallActivity : []).map((item: any) => {
      return {
        loanAccountNumber: item.loanAccountNumber || "-",
        customerName: item.customerName || "-",
        productName: item.productName || "-",
        installmentNumber: item.installmentNumber != null ? item.installmentNumber : "-",
        dueDate: item.dueDate ? formatDate(item.dueDate) : "-",
        principalDue: item.principalDue != null ? `${Number(item.principalDue).toFixed(2)} SAR` : "-",
        profitDue: item.profitDue != null ? `${Number(item.profitDue).toFixed(2)} SAR` : "-",
        installmentAmount: item.installmentAmount != null ? `${Number(item.installmentAmount).toFixed(2)} SAR` : "-",
        daysUntilDue: item.daysUntilDue != null ? item.daysUntilDue : "-",
        status: item.status || "-",
      };
    });
  }, [allCallActivity]);

  useEffect(() => {
    handleSubmit();
  }, [id, page, pageSize, fromDate, toDate]);

  const Call_Activity_Header = [
    {
      name: "Loan Account No.",
      selector: (row: any) => row.loanAccountNumber,
      width: "180px",
    },
    {
      name: "Customer Name",
      selector: (row: any) => row.customerName,
      width: "160px",
    },
    {
      name: "Product",
      selector: (row: any) => row.productName,
      width: "140px",
    },
    {
      name: "Installment #",
      selector: (row: any) => row.installmentNumber,
      width: "120px",
    },
    {
      name: "Due Date",
      selector: (row: any) => row.dueDate,
      width: "130px",
    },
    {
      name: "Principal Due",
      selector: (row: any) => row.principalDue,
      width: "150px",
    },
    {
      name: "Profit Due",
      selector: (row: any) => row.profitDue,
      width: "140px",
    },
    {
      name: "Installment Amount",
      selector: (row: any) => row.installmentAmount,
      width: "170px",
    },
    {
      name: "Days Until Due",
      selector: (row: any) => row.daysUntilDue,
      width: "140px",
    },
    {
      name: "Status",
      selector: (row: any) => row.status,
      width: "120px",
    },
  ];

  const exportToCSV = (data: any[], fileName: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }
    const csvRows: string[] = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));
    data.forEach((row) => {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
  };

  return (
    <>
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center">
          <div className="col-10">
            <h5 className="mb-0">Due Loans</h5>
          </div>
        </div>
        <div className="d-flex mt-3 justify-content-between align-items-center">
          <div className="row align-items-center">
            {/* From Date */}
            <div className="col-md-4">
              <label htmlFor="fromDate" className="form-label">
                From
              </label>
              <DatePicker
                value={fromDate}
                onChange={(date) => setFromDate(date)}
                placeholder="Select From Date"
              />
            </div>

            {/* To Date */}
            <div className="col-md-4">
              <label htmlFor="toDate" className="form-label">
                To
              </label>
              <DatePicker
                value={toDate}
                onChange={(date) => setToDate(date)}
                placeholder="Select To Date"
              />
            </div>

            <div className="col-md-2">
              <button
                className="mt-4 invoice-btn bg-dark text-white"
                onClick={() => {
                  setFromDate(null);
                  setToDate(null);
                }}
              >
                Clear
              </button>
            </div>

            <div className="col-md-2"></div>
          </div>
          <div className="col-2 text-end">
            <button
              className="mt-4 invoice-btn bg-dark text-white"
              onClick={() => {
                exportToCSV(mappedData, "OverDueLoans");
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
            data={mappedData}
            isLoading={loading}
          />
        </div>
      </div>
    </>
  );
};

export default Due;
