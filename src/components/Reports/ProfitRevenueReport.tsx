import { useEffect, useState } from "react";
import { DatePicker, Button } from "antd";
import TableView from "../TableView/TableView";
import { getProfitRevenueReport } from "../../redux/apis/apisCrudLms";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const ProfitRevenueReport = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [reportData, setReportData] = useState<any>([]);
  const [period, setPeriod] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [totals, setTotals] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, [page, pageSize, period]);

  const columns = [
    {
      name: "Metric",
      selector: (row: any) => row.metric || "-",
    },
    {
      name: "Value",
      selector: (row: any) => row.value || 0,
      cell: (row: any) => <b>{row.value != null ? Number(row.value).toLocaleString() : "-"} SAR</b>
    },
  ];

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const currentPeriod = period ? period.format("YYYY-MM") : dayjs().format("YYYY-MM");
      const response = await getProfitRevenueReport(currentPeriod);
      if (response && response.data) {
        const data = response.data.data;
        
        if (data && !Array.isArray(data)) {
          // It's a summary object
          setTotals(data);
          const summaryRows = [
            { metric: "Profit Earned", value: data.profitEarned },
            { metric: "Profit Collected", value: data.profitCollected },
            { metric: "Accrued Profit", value: data.accruedProfit },
          ];
          setReportData(summaryRows);
          const totalItems = summaryRows.length;
          setTotalRows(totalItems);

          const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
          const calculatedTo = Math.min(page * pageSize, totalItems);
          setFrom(calculatedFrom);
          setTo(calculatedTo);
        } else {
          // It's a list or empty
          const reportItems = Array.isArray(data) ? data : [];
          setReportData(reportItems);
          setTotals(null);
          const totalItems = reportItems.length;
          setTotalRows(totalItems);

          const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
          const calculatedTo = Math.min(page * pageSize, totalItems);
          setFrom(calculatedFrom);
          setTo(calculatedTo);
        }
      }
    } catch (error: any) {
      console.error("Error fetching profit revenue report:", error);
      toast.error(error?.message || "Failed to fetch report");
      setReportData([]);
      setTotals(null);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData || reportData.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const headers = ["Metric", "Value"];
    const csvContent = [
      headers.join(","),
      ...reportData.map((item: any) => [
        `"${item.metric || ""}"`,
        item.value || 0,
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Profit_Revenue_Report_${period.format("YYYY_MM")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
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

        {totals && (
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <small className="text-uppercase opacity-75 fw-bold text-muted">Profit Earned</small>
                <h4 className="mb-0 fw-bold text-primary">{totals.profitEarned?.toLocaleString()} SAR</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <small className="text-uppercase opacity-75 fw-bold text-muted">Profit Collected</small>
                <h4 className="mb-0 fw-bold text-success">{totals.profitCollected?.toLocaleString()} SAR</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <small className="text-uppercase opacity-75 fw-bold text-muted">Accrued Profit</small>
                <h4 className="mb-0 fw-bold text-warning">{totals.accruedProfit?.toLocaleString()} SAR</h4>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="cs-table p-2">
        <TableView
          header={columns}
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          from={from}
          to={to}
          data={reportData}
          isLoading={loading}
        />
      </div>
    </>
  );
};

export default ProfitRevenueReport;
