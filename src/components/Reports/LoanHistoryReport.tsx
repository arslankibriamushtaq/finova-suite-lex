import { useEffect, useState, useMemo } from "react";
import TableView from "../TableView/TableView";
import { DatePicker, Input, Button } from "antd";
import toast from "react-hot-toast";
import {
  getLoanHistoryReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const LoanHistoryReport = () => {
  const [loanId, setLoanId] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [loanSummary, setLoanSummary] = useState<any>(null);

  const handleSubmit = async (targetId?: string) => {
    const idToUse = targetId || loanId;
    if (!idToUse) {
      toast.error("Please enter a Loan ID to view history");
      return;
    }

    try {
      setLoading(true);
      const params: any = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      params.loanId = idToUse;

      const res = await getLoanHistoryReport(params);

      if (res && res.data) {
        const responseData = res.data.data;
        
        // Handle Detail View (Loan Events)
        const events = responseData.events || (Array.isArray(responseData) ? responseData : []);
        setAllCallActivity(events);
        setTotalRows(events.length);
        setLoanSummary(responseData.summary || responseData.loanDetails || null);
        setViewMode("detail");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch loan history");
      setAllCallActivity([]);
      setLoanSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: any) => {
    if (!isoString) return "-";
    return dayjs(isoString).format("YYYY-MM-DD HH:mm");
  };

  const formatCurrency = (amount: any) => {
    if (amount === null || amount === undefined) return "-";
    return typeof amount === "number"
      ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : amount;
  };

  const mappedData = useMemo(() => {
    return (allCallActivity || []).map((item: any) => ({
      eventDate: formatDate(item.eventDate || item.timestamp || item.date),
      eventType: item.eventType || item.type || "-",
      description: item.description || item.message || "-",
      amount: formatCurrency(item.amount),
      balanceAfter: formatCurrency(item.balanceAfter || item.remainingBalance),
      performer: item.performer || item.user || "System",
    }));
  }, [allCallActivity]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return mappedData.slice(startIndex, startIndex + pageSize);
  }, [mappedData, page, pageSize]);

  const Detail_Header = [
    { name: "Event Date", selector: (row: any) => row.eventDate, sortable: true },
    { 
      name: "Event Type", 
      selector: (row: any) => row.eventType,
      cell: (row: any) => (
        <span className="badge bg-light text-dark border fw-bold text-uppercase" style={{ fontSize: "10px" }}>
          {row.eventType}
        </span>
      )
    },
    { name: "Description", selector: (row: any) => row.description, grow: 2 },
    { name: "Amount", selector: (row: any) => row.amount },
    { name: "Balance After", selector: (row: any) => row.balanceAfter },
    { name: "Performer", selector: (row: any) => row.performer },
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
    <div className="service loan-history-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Loan History Timeline</h3>
      </div>

      <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 6,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            placeholder="Enter Loan UUID — e.g. 550e8400-e29b-41d4-a716-446655440000"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            style={{ flex: "1 1 280px", minWidth: 220, height: 40, borderRadius: 6 }}
          />
          <DatePicker
            placeholder="From"
            onChange={(date) => setFromDate(date ? date.format("YYYY-MM-DD") : "")}
            style={{ flex: "1 1 180px", minWidth: 160, height: 40, borderRadius: 6, background: "#fff" }}
          />
          <DatePicker
            placeholder="To"
            onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : "")}
            style={{ flex: "1 1 180px", minWidth: 160, height: 40, borderRadius: 6, background: "#fff" }}
          />
          <Button
            className="theme-btn-next"
            onClick={() => handleSubmit()}
            loading={loading}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            View History
          </Button>
          <button
            type="button"
            className="theme-btn-next"
            onClick={() => exportToCSV(mappedData, "LoanHistory")}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {loanSummary && (
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="p-4 shadow-sm border bg-light rounded d-flex justify-content-between align-items-center">
              <div>
                <small className="text-uppercase opacity-75 fw-bold text-muted d-block">Customer Name</small>
                <h5 className="mb-0 fw-bold">{loanSummary.customerName || "-"}</h5>
              </div>
              <div className="text-end">
                <small className="text-uppercase opacity-75 fw-bold text-muted d-block">Loan Status</small>
                <span className="badge bg-success">{loanSummary.status || "ACTIVE"}</span>
              </div>
              <div className="text-end">
                <small className="text-uppercase opacity-75 fw-bold text-muted d-block">Total Disbursed</small>
                <h5 className="mb-0 fw-bold">{formatCurrency(loanSummary.disbursedAmount)} SAR</h5>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="bg-white"
        style={{
          borderRadius: 6,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
          header={Detail_Header}
          data={paginatedData}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default LoanHistoryReport;
