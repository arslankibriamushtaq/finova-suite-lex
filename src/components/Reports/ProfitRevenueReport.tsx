import { useEffect, useState } from "react";
import { DatePicker, Button } from "antd";
import { getProfitRevenueReport } from "../../redux/apis/apisCrudLms";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const ProfitRevenueReport = () => {
  const [period, setPeriod] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const currentPeriod = period ? period.format("YYYY-MM") : dayjs().format("YYYY-MM");
      const response = await getProfitRevenueReport(currentPeriod);
      if (response && response.data) {
        const data = response.data.data;
        setTotals(data || null);
      }
    } catch (error: any) {
      console.error("Error fetching profit revenue report:", error);
      toast.error(error?.message || "Failed to fetch report");
      setTotals(null);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!totals) {
      toast.error("No data available to export");
      return;
    }

    const headers = ["Metric", "Value"];
    const rows = [
      ["Profit Earned", totals.profitEarned ?? 0],
      ["Profit Collected", totals.profitCollected ?? 0],
      ["Accrued Profit", totals.accruedProfit ?? 0],
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => `"${r[0]}",${r[1]}`),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Profit_Revenue_Report_${(period || dayjs()).format("YYYY_MM")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="col-12">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Profit & Revenue Report</h3>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white rounded border">
            <label className="mb-0 fw-bold text-muted small uppercase">Period:</label>
            <DatePicker
              value={period}
              onChange={(d) => setPeriod(d)}
              picker="month"
              format="YYYY-MM"
              bordered={false}
              className="p-0"
            />
          </div>
          <Button
            className="theme-btn-next"
            onClick={fetchReportData}
            loading={loading}
            style={{ height: "42px" }}
          >
            Fetch Report
          </Button>
          <Button
            className="invoice-btn bg-dark text-white"
            onClick={exportToCSV}
            style={{ height: "42px" }}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {totals ? (
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
              <small className="text-uppercase opacity-75 fw-bold text-muted">Profit Earned</small>
              <h4 className="mb-0 fw-bold text-primary">
                {(totals.profitEarned ?? 0).toLocaleString()} SAR
              </h4>
            </div>
          </div>
          <div className="col-md-4">
            <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
              <small className="text-uppercase opacity-75 fw-bold text-muted">Profit Collected</small>
              <h4 className="mb-0 fw-bold text-success">
                {(totals.profitCollected ?? 0).toLocaleString()} SAR
              </h4>
            </div>
          </div>
          <div className="col-md-4">
            <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
              <small className="text-uppercase opacity-75 fw-bold text-muted">Accrued Profit</small>
              <h4 className="mb-0 fw-bold text-warning">
                {(totals.accruedProfit ?? 0).toLocaleString()} SAR
              </h4>
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="text-center text-muted py-5">
            No data available for the selected period.
          </div>
        )
      )}
    </div>
  );
};

export default ProfitRevenueReport;