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
    <>
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">Cash Flow Report</h3>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white rounded border">
              <label className="mb-0 fw-bold text-muted small uppercase">Date:</label>
              <DatePicker 
                onChange={(d) => setDate(d)} 
                format="YYYY-MM-DD"
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
            <div className="col-md-3">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <small className="text-uppercase opacity-75">Total Inflows</small>
                <h4 className="mb-0">{totals.totalInflows?.toLocaleString()} SAR</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <small className="text-uppercase opacity-75">Total Outflows</small>
                <h4 className="mb-0">{totals.totalOutflows?.toLocaleString()} SAR</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <small className="text-uppercase opacity-75">Net Position</small>
                <h4 className="mb-0">{totals.netPosition?.toLocaleString()} SAR</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <small className="text-uppercase opacity-75">Bank Balance</small>
                <h4 className="mb-0">{totals.bankBalance?.toLocaleString()} SAR</h4>
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

export default CashFlowReport;
