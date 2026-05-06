import { useEffect, useState } from "react";
import { DatePicker, Button } from "antd";
import { getCollectionsReport } from "../../redux/apis/apisCrudLms";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const CollectionReport = () => {
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState<any>(null);

  useEffect(() => {
    fetchCollectionData();
  }, [fromDate, toDate]);

  const fetchCollectionData = async () => {
    try {
      setLoading(true);
      const start = fromDate ? fromDate.format("YYYY-MM-DD") : "2000-01-01";
      const end = toDate ? toDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
      const response = await getCollectionsReport(start, end);
      const data = response?.data?.data;
      if (data && !Array.isArray(data)) {
        setTotals(data);
      } else {
        setTotals(null);
      }
    } catch (error: any) {
      console.error("Error fetching collection report:", error);
      toast.error(error?.message || "Failed to fetch collection report");
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

    const rows = [
      { metric: "Total Collected", value: `${totals.totalCollected ?? 0} SAR` },
      { metric: "On-Time Rate", value: `${totals.onTimeRate ?? 0}%` },
      { metric: "Collection Count", value: `${totals.collectionCount ?? 0}` },
    ];

    const csvContent = [
      ["Metric", "Value"].join(","),
      ...rows.map((r) => [`"${r.metric}"`, `"${r.value}"`].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Collection_Report_${dayjs().format("YYYYMMDD")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="col-12">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-2">
        <h3 className="mb-0 fw-bold text-dark">Collection Report</h3>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white rounded border">
            <label className="mb-0 fw-bold text-muted small uppercase">From:</label>
            <DatePicker
              onChange={(d) => setFromDate(d)}
              format="YYYY-MM-DD"
              bordered={false}
              className="p-0"
            />
          </div>
          <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white rounded border">
            <label className="mb-0 fw-bold text-muted small uppercase">To:</label>
            <DatePicker
              onChange={(d) => setToDate(d)}
              format="YYYY-MM-DD"
              bordered={false}
              className="p-0"
            />
          </div>
          <Button
            className="theme-btn-next"
            onClick={fetchCollectionData}
            loading={loading}
            style={{ height: "42px" }}
          >
            Fetch Report
          </Button>
          <Button
            className="invoice-btn bg-dark text-white"
            onClick={exportToCSV}
            disabled={!totals}
            style={{ height: "42px" }}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {totals ? (
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
              <small className="text-uppercase opacity-75 fw-bold text-muted">Total Collected</small>
              <h4 className="mb-0 fw-bold">{Number(totals.totalCollected ?? 0).toLocaleString()} SAR</h4>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
              <small className="text-uppercase opacity-75 fw-bold text-muted">On-Time Rate</small>
              <h4 className="mb-0 fw-bold">{totals.onTimeRate ?? 0}%</h4>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
              <small className="text-uppercase opacity-75 fw-bold text-muted">Collection Count</small>
              <h4 className="mb-0 fw-bold">{totals.collectionCount ?? 0}</h4>
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="text-center py-5 text-muted">
            No collection data available for the selected range.
          </div>
        )
      )}
    </div>
  );
};

export default CollectionReport;
