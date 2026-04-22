import { useEffect, useState, useMemo } from "react";
import TableView from "../TableView/TableView";
import { DatePicker, Button } from "antd";
import toast from "react-hot-toast";
import {
  getEarlySettlementReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const EarlySettlement = () => {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Use a wide range if dates are empty to avoid backend 500 errors
      const finalFrom = fromDate || "2000-01-01";
      const finalTo = toDate || dayjs().format("YYYY-MM-DD");
      
      const res = await getEarlySettlementReport({ fromDate: finalFrom, toDate: finalTo });
      
      if (res && res.data) {
        const responseData = res.data.data;
        // Handle both paginated and direct array responses
        const items = responseData.items || (Array.isArray(responseData) ? responseData : []);
        setAllCallActivity(items);
        setTotalRows(responseData.totalElements || items.length);
        setSummary(responseData.summary || null);
        setPage(1);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch early settlement report");
      setAllCallActivity([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: any) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toISOString().split('T')[0];
  };

  const formatCurrency = (amount: any) => {
    if (amount === null || amount === undefined) return "-";
    return typeof amount === "number"
      ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : amount;
  };

  const mappedData = (allCallActivity || []).map((item: any) => ({
    loanId: item.loanId || "-",
    customerName: item.customerName || "-",
    facilityType: item.facilityType || "-",
    originalAmount: formatCurrency(item.originalAmount ?? 0),
    settlementAmount: formatCurrency(item.settlementAmount ?? 0),
    rebateAmount: formatCurrency(item.rebateAmount ?? 0),
    profitSaved: formatCurrency(item.profitSaved ?? 0),
    settlementDate: item.settlementDate ? formatDate(item.settlementDate) : "-",
    status: item.status || "-",
  }));

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return mappedData.slice(startIndex, startIndex + pageSize);
  }, [mappedData, page, pageSize]);

  useEffect(() => {
    handleSubmit();
  }, [fromDate, toDate]);

  const Call_Activity_Header = [
    { name: "Customer Name", selector: (row: any) => row.customerName },
    { name: "Original Amount", selector: (row: any) => row.originalAmount },
    { name: "Settlement Amount", selector: (row: any) => row.settlementAmount },
    { name: "Rebate/Discount", selector: (row: any) => row.rebateAmount, cell: (row: any) => <span className="text-success">{row.rebateAmount}</span> },
    { name: "Profit Saved", selector: (row: any) => row.profitSaved },
    { name: "Settlement Date", selector: (row: any) => row.settlementDate },
    {
      name: "Status",
      cell: (row: any) => {
        const color = row.status?.toLowerCase() === "settled" ? "rgba(63,195,128,0.9)" : "#6c757d";
        return (
          <div style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "11px", backgroundColor: color, color: "white", display: "inline-block", fontWeight: "600" }}>
            {row.status}
          </div>
        );
      },
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
          <h3 className="mb-0 fw-bold text-dark">Early Settlement Report</h3>
          <button className="invoice-btn bg-dark text-white" onClick={() => exportToCSV(mappedData, "EarlySettlements")}>
            Export CSV
          </button>
        </div>

        <div className="bg-white p-4 rounded border mb-4 shadow-sm">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="mb-1 fw-bold text-muted small text-uppercase">From Date</label>
              <DatePicker 
                className="w-100" 
                onChange={(date) => setFromDate(date ? date.format("YYYY-MM-DD") : "")} 
              />
            </div>
            <div className="col-md-3">
              <label className="mb-1 fw-bold text-muted small text-uppercase">To Date</label>
              <DatePicker 
                className="w-100" 
                onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : "")} 
              />
            </div>
            <div className="col-md-2">
              <Button className="theme-btn-next w-100" onClick={handleSubmit} loading={loading} style={{ height: "38px" }}>
                Filter
              </Button>
            </div>
          </div>
        </div>

        {summary && (
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="p-4 shadow-sm border bg-white rounded">
                <small className="text-uppercase opacity-75 fw-bold text-muted">Total Settlement Value</small>
                <h4 className="mb-0 fw-bold text-primary">{formatCurrency(summary.totalSettlementAmount)} SAR</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 shadow-sm border bg-white rounded">
                <small className="text-uppercase opacity-75 fw-bold text-muted">Total Rebates Given</small>
                <h4 className="mb-0 fw-bold text-success">{formatCurrency(summary.totalRebateAmount)} SAR</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 shadow-sm border bg-white rounded">
                <small className="text-uppercase opacity-75 fw-bold text-muted">Settled Loans Count</small>
                <h4 className="mb-0 fw-bold">{summary.settledCount}</h4>
              </div>
            </div>
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

export default EarlySettlement;
