import { useEffect, useState } from "react";
import { DatePicker, Button } from "antd";
import TableView from "../TableView/TableView";
import { getCollectionsReport } from "../../redux/apis/apisCrudLms";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const CollectionReport = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [collectionData, setCollectionData] = useState<any>([]);
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [totals, setTotals] = useState<any>(null);

  useEffect(() => {
    fetchCollectionData();
  }, [page, pageSize, fromDate, toDate]);

  const columns = [
    {
      name: "Metric",
      selector: (row: any) => row.metric || "-",
    },
    {
      name: "Value",
      selector: (row: any) => row.value || 0,
      cell: (row: any) => <b>{row.value != null ? (typeof row.value === 'number' ? row.value.toLocaleString() : row.value) : "-"} {row.unit || ""}</b>
    },
  ];

  const fetchCollectionData = async () => {
    try {
      setLoading(true);
      const start = fromDate ? fromDate.format("YYYY-MM-DD") : "2000-01-01";
      const end = toDate ? toDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
      const response = await getCollectionsReport(start, end);
      if (response && response.data) {
        const data = response.data.data;

        if (data && !Array.isArray(data)) {
          // It's a summary object
          setTotals(data);
          const summaryRows = [
            { metric: "Total Collected", value: data.totalCollected, unit: "SAR" },
            { metric: "On-Time Rate", value: data.onTimeRate, unit: "%" },
            { metric: "Collection Count", value: data.collectionCount, unit: "" },
          ];
          setCollectionData(summaryRows);
          const totalItems = summaryRows.length;
          setTotalRows(totalItems);

          const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
          const calculatedTo = Math.min(page * pageSize, totalItems);
          setFrom(calculatedFrom);
          setTo(calculatedTo);
        } else {
          // It's a list or empty
          const reportItems = Array.isArray(data) ? data : [];
          setCollectionData(reportItems);
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
      console.error("Error fetching collection report:", error);
      toast.error(error?.message || "Failed to fetch collection report");
      setCollectionData([]);
      setTotals(null);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!collectionData || collectionData.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const headers = ["Metric", "Value"];
    const csvContent = [
      headers.join(","),
      ...collectionData.map((item: any) => [
        `"${item.metric || ""}"`,
        `"${item.value || 0}${item.unit || ""}"`,
      ].join(",")),
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
    <>
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">Collection Report</h3>
          <div className="d-flex align-items-center gap-3">
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
                <small className="text-uppercase opacity-75 fw-bold text-muted">Total Collected</small>
                <h4 className="mb-0 fw-bold">{totals.totalCollected?.toLocaleString()} SAR</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <small className="text-uppercase opacity-75 fw-bold text-muted">On-Time Rate</small>
                <h4 className="mb-0 fw-bold">{totals.onTimeRate}%</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="h-100 p-4 shadow-sm border bg-white" style={{ borderRadius: "6px" }}>
                <small className="text-uppercase opacity-75 fw-bold text-muted">Collection Count</small>
                <h4 className="mb-0 fw-bold">{totals.collectionCount}</h4>
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
          data={collectionData}
          isLoading={loading}
        />
      </div>
    </>
  );
};

export default CollectionReport;
