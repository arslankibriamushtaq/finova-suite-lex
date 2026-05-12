import { useEffect, useState } from "react";
import { DatePicker, Button } from "antd";
import TableView from "../TableView/TableView";
import { getCashFlowReport } from "../../redux/apis/apisCrudLms";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const CashFlowReport = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [reportData, setReportData] = useState<any>([]);
  const [date, setDate] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [totals, setTotals] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, [page, pageSize, date]);

  const columns = [
    {
      name: "Metric",
      selector: (row: any) => row.metric || "-",
    },
    {
      name: "Value",
      selector: (row: any) => row.value || 0,
      cell: (row: any) => <b>{row.value != null ? `${Number(row.value).toLocaleString()} SAR` : "-"}</b>
    },
  ];

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const finalDate = date ? date.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
      const response = await getCashFlowReport(finalDate);
      if (response && response.data) {
        const data = response.data.data;

        if (data && !Array.isArray(data)) {
          // It's a summary object
          setTotals(data);
          const summaryRows = [
            { metric: "Total Inflows", value: data.totalInflows },
            { metric: "Total Outflows", value: data.totalOutflows },
            { metric: "Net Position", value: data.netPosition },
            { metric: "Bank Balance", value: data.bankBalance },
          ];
          setReportData(summaryRows);
          setTotalRows(summaryRows.length);
        } else {
          // It's a list or empty
          setReportData(Array.isArray(data) ? data : []);
          setTotals(null);
          setTotalRows(Array.isArray(data) ? data.length : 0);
        }

        const calculatedFrom = totalRows > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalRows);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
      }
    } catch (error: any) {
      console.error("Error fetching cash flow report:", error);
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
    link.setAttribute("download", `Cash_Flow_Report_${date.format("YYYY_MM_DD")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="service cash-flow-report-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Cash Flow Report</h3>
      </div>

      {/* Filters card */}
      <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <DatePicker
            onChange={(d) => setDate(d)}
            format="YYYY-MM-DD"
            placeholder="Date"
            style={{ flex: "1 1 200px", minWidth: 180, height: 40, borderRadius: 8, background: "#fff" }}
          />
          <Button
            className="theme-btn-next"
            onClick={fetchReportData}
            loading={loading}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            Fetch Report
          </Button>
          <Button
            className="theme-btn-next"
            onClick={exportToCSV}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {totals && (
        <div className="row mb-3 g-3">
          <div className="col-md-3 col-sm-6">
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Total Inflows</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {totals.totalInflows?.toLocaleString()} <span style={{ fontSize: 14 }}>SAR</span>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Total Outflows</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {totals.totalOutflows?.toLocaleString()} <span style={{ fontSize: 14 }}>SAR</span>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Net Position</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {totals.netPosition?.toLocaleString()} <span style={{ fontSize: 14 }}>SAR</span>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Bank Balance</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {totals.bankBalance?.toLocaleString()} <span style={{ fontSize: 14 }}>SAR</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default CashFlowReport;
