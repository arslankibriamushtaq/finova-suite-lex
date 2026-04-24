import { useEffect, useState, useMemo } from "react";
import TableView from "../TableView/TableView";
import { DatePicker, Button } from "antd";
import toast from "react-hot-toast";
import {
  getDailyTransactionReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const DailyTransactionSummary = () => {
  const [targetDate, setTargetDate] = useState<string>("");
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const finalDate = targetDate || dayjs().format("YYYY-MM-DD");
      const res = await getDailyTransactionReport({ date: finalDate });

      if (res && res.data && res.data.data) {
        const responseData = res.data.data;
        const items = responseData.channels || [];
        setAllCallActivity(items);
        setTotalRows(items.length);
        setSummaryData(responseData);
        setPage(1);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch daily transaction summary");
      setAllCallActivity([]);
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: any) => {
    if (amount === null || amount === undefined) return "-";
    return typeof amount === "number"
      ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : amount;
  };

  const mappedData = (allCallActivity || []).map((item: any) => ({
    channel: item.channel?.replace(/_/g, " ") || "-",
    amount: formatCurrency(item.amount ?? 0),
    count: item.count ?? 0,
  }));

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return mappedData.slice(startIndex, startIndex + pageSize);
  }, [mappedData, page, pageSize]);

  useEffect(() => {
    handleSubmit();
  }, [targetDate]);

  const Call_Activity_Header = [
    {
      name: "Channel Name",
      selector: (row: any) => row.channel,
      cell: (row: any) => <span className="fw-bold">{row.channel}</span>
    },
    { name: "Transaction Count", selector: (row: any) => row.count },
    {
      name: "Total Amount",
      selector: (row: any) => row.amount,
      cell: (row: any) => <span className="text-primary fw-bold">{row.amount} SAR</span>
    },
  ];

  const exportToCSV = (data: any[], fileName: string) => {
    if (!data || data.length === 0) { toast.error("No data to export"); return; }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];
    data.forEach((row) => {
      csvRows.push(headers.map((h) => {
        const v = row[h];
        return typeof v === "string" && v.includes(",") ? `"${v}"` : v;
      }).join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
  };

  return (
    <>
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">Daily Transaction Summary</h3>
          <button className="invoice-btn bg-dark text-white" onClick={() => exportToCSV(mappedData, "DailyTransactions")}>
            Export CSV
          </button>
        </div>

        <div className="bg-white p-4 rounded border mb-4 shadow-sm">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="mb-1 fw-bold text-muted small text-uppercase">Select Transaction Date</label>
              <DatePicker
                className="w-100"
                onChange={(date) => setTargetDate(date ? date.format("YYYY-MM-DD") : "")}
              />
            </div>
            <div className="col-md-2">
              <Button className="theme-btn-next w-100" onClick={handleSubmit} loading={loading} style={{ height: "38px" }}>
                Generate Report
              </Button>
            </div>
          </div>
        </div>

        {summaryData && (
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="p-4 shadow-sm border bg-white rounded">
                <small className="text-uppercase opacity-75 fw-bold text-muted">Total Credits</small>
                <h4 className="mb-0 fw-bold text-success">{formatCurrency(summaryData.totalCredits)} SAR</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 shadow-sm border bg-white rounded">
                <small className="text-uppercase opacity-75 fw-bold text-muted">Total Debits</small>
                <h4 className="mb-0 fw-bold text-danger">{formatCurrency(summaryData.totalDebits)} SAR</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 shadow-sm border bg-white rounded">
                <small className="text-uppercase opacity-75 fw-bold text-muted">Transaction Count</small>
                <h4 className="mb-0 fw-bold">{summaryData.transactionCount}</h4>
              </div>
            </div>
            {/* <div className="col-md-3">
              <div className="p-4 shadow-sm border bg-white rounded">
                <small className="text-uppercase opacity-75 fw-bold text-muted">Net Volume</small>
                <h4 className="mb-0 fw-bold text-primary">{formatCurrency(summaryData.totalCredits - summaryData.totalDebits)} SAR</h4>
              </div>
            </div> */}
          </div>
        )}

        <div className="cs-table p-2">
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
    </>
  );
};

export default DailyTransactionSummary;
