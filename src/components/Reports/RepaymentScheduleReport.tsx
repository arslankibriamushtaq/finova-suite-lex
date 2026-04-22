import { useEffect, useState, useMemo } from "react";
import TableView from "../TableView/TableView";
import { DatePicker, Input, Button } from "antd";
import toast from "react-hot-toast";
import {
  getRepaymentScheduleReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const RepaymentScheduleReport = () => {
  const [loanId, setLoanId] = useState<string>("");
  const [fromDate, setFromDate] = useState<any>("");
  const [toDate, setToDate] = useState<any>("");
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      let res;
      if (loanId && loanId.trim().length > 20) {
        // Fetch specific loan schedule
        res = await getRepaymentScheduleReport(loanId);
      } else {
        // Fetch all data with filters
        const params: any = {};
        params.fromDate = fromDate || "2000-01-01";
        params.toDate = toDate || dayjs().format("YYYY-MM-DD");
        res = await getRepaymentScheduleReport(params);
      }

      if (res && res.data) {
        const responseData = res.data.data;

        if (Array.isArray(responseData)) {
          setAllCallActivity(responseData);
          setTotalRows(responseData.length);
          setSummary(null);
        } else if (responseData) {
          const items = responseData.schedule || responseData.installments || responseData.items || [];
          setAllCallActivity(Array.isArray(items) ? items : []);
          setTotalRows(Array.isArray(items) ? items.length : 0);
          setSummary(responseData);
        }
        setPage(1);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch repayment schedule report");
      setAllCallActivity([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSubmit();
  }, [fromDate, toDate, loanId]);

  const formatDate = (isoString: any) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatCurrency = (amount: any) => {
    if (amount === null || amount === undefined) return "-";
    return typeof amount === "number"
      ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : amount;
  };

  const mappedData = (allCallActivity || []).map((item: any) => ({
    installmentNo: item.installmentNo ?? item.installmentNumber ?? "-",
    dueDate: item.dueDate ? formatDate(item.dueDate) : "-",
    principalDue: item.principalDue != null ? formatCurrency(item.principalDue) : "-",
    profitOrInterestDue:
      item.profitOrInterestDue != null || item.interestDue != null
        ? formatCurrency(item.profitOrInterestDue ?? item.interestDue)
        : "-",
    installmentAmount:
      item.installmentAmount != null || item.totalDue != null
        ? formatCurrency(item.installmentAmount ?? item.totalDue)
        : "-",
    remainingPrincipal:
      item.remainingPrincipal != null || item.outstandingBalance != null
        ? formatCurrency(item.remainingPrincipal ?? item.outstandingBalance)
        : "-",
    status: item.status || "-",
    paymentDate: item.paymentDate ? formatDate(item.paymentDate) : "-",
    penalty: item.penalty != null ? formatCurrency(item.penalty) : "-",
  }));

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return mappedData.slice(startIndex, endIndex);
  }, [mappedData, page, pageSize]);

  useEffect(() => {
    handleSubmit();
  }, []);

  const Call_Activity_Header = [
    { name: "Installment No.", selector: (row: any) => row.installmentNo },
    { name: "Principal Due", selector: (row: any) => row.principalDue },
    { name: "Profit/Interest Due", selector: (row: any) => row.profitOrInterestDue },
    { name: "Installment Amount", selector: (row: any) => row.installmentAmount },
    { name: "Remaining Principal", selector: (row: any) => row.remainingPrincipal },
    { name: "Penalty", selector: (row: any) => row.penalty },
    { name: "Due Date", selector: (row: any) => row.dueDate },
    {
      name: "Status",
      cell: (row: any) => {
        const color = (() => {
          switch (row.status?.toLowerCase()) {
            case "paid": case "approved": return "rgba(63,195,128,0.9)";
            case "unpaid": case "rejected": case "reject": return "#F84D4D";
            case "pending": return "#FFC107";
            default: return "#6c757d";
          }
        })();
        return (
          <div style={{ padding: "8px 10px", borderRadius: "32px", fontSize: "12px", backgroundColor: color, color: "white", display: "inline-block", textTransform: "capitalize", fontWeight: "500" }}>
            {row.status || "-"}
          </div>
        );
      },
    },
    { name: "Payment Date", selector: (row: any) => row.paymentDate },
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
          <h3 className="mb-0 fw-bold text-dark">Repayment Schedule Report</h3>
          <button className="invoice-btn bg-dark text-white" onClick={() => exportToCSV(mappedData, "RepaymentScheduleReport")}>
            Export CSV
          </button>
        </div>

        <div className="bg-white p-3 rounded border mb-4 shadow-sm">
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
            <div className="col-md-3">
              <label className="mb-1 fw-bold text-muted small text-uppercase">Loan ID (Optional)</label>
              <Input
                value={loanId}
                onChange={(e) => setLoanId(e.target.value)}
                placeholder="Specific Loan ID"
                className="w-100"
              />
            </div>
            <div className="col-md-3 d-flex gap-2">
              <Button className="theme-btn-next w-100" onClick={handleSubmit} loading={loading} style={{ height: "38px" }}>
                Filter
              </Button>
              <button className="invoice-btn bg-dark text-white w-100" onClick={() => { setLoanId(""); setFromDate(""); setToDate(""); handleSubmit(); }}>
                Clear
              </button>
            </div>
          </div>
        </div>

        {summary && (
          <div className="row mb-4">
            {summary.totalPrincipal != null && (
              <div className="col-md-3">
                <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                  <small className="text-uppercase opacity-75 fw-bold text-muted">Total Principal</small>
                  <h4 className="mb-0 fw-bold">{formatCurrency(summary.totalPrincipal)} SAR</h4>
                </div>
              </div>
            )}
            {summary.totalProfit != null && (
              <div className="col-md-3">
                <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                  <small className="text-uppercase opacity-75 fw-bold text-muted">Total Profit</small>
                  <h4 className="mb-0 fw-bold text-success">{formatCurrency(summary.totalProfit)} SAR</h4>
                </div>
              </div>
            )}
            {(summary.totalAmount != null || summary.totalRepayment != null) && (
              <div className="col-md-3">
                <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                  <small className="text-uppercase opacity-75 fw-bold text-muted">Total Repayment</small>
                  <h4 className="mb-0 fw-bold text-primary">{formatCurrency(summary.totalAmount ?? summary.totalRepayment)} SAR</h4>
                </div>
              </div>
            )}
            {(summary.numberOfInstallments != null || summary.totalInstallments != null) && (
              <div className="col-md-3">
                <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                  <small className="text-uppercase opacity-75 fw-bold text-muted">Total Installments</small>
                  <h4 className="mb-0 fw-bold text-dark">{summary.numberOfInstallments ?? summary.totalInstallments}</h4>
                </div>
              </div>
            )}
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

export default RepaymentScheduleReport;
