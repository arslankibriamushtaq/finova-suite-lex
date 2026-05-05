import { useEffect, useState } from "react";
import { DatePicker, Button } from "antd";
import TableView from "../TableView/TableView";
import { getLoanDisbursementReport } from "../../redux/apis/apisCrudLms";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const LoanDisbursementReport = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [reportData, setReportData] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState<any>(dayjs().startOf("year"));
  const [toDate, setToDate] = useState<any>(dayjs());
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const columns = [
    {
      name: "Application No",
      selector: (row: any) => row.applicationNumber || "-",
    },
    {
      name: "Customer Name",
      selector: (row: any) => row.customerName || row.name || "-",
    },
    {
      name: "Disbursement Date",
      selector: (row: any) => row.disbursementDate || row.date || "-",
      cell: (row: any) => row.disbursementDate || row.date ? dayjs(row.disbursementDate || row.date).format("YYYY-MM-DD") : "-"
    },
    {
      name: "Amount",
      selector: (row: any) => row.amount || row.disbursedAmount || 0,
      cell: (row: any) => (
        <b>
          {Number(row.amount || row.disbursedAmount || 0).toLocaleString()} SAR
        </b>
      ),
    },
    {
      name: "Product",
      selector: (row: any) => row.productName || row.productCode || "-",
    },
    {
      name: "Branch",
      selector: (row: any) => row.branchName || row.branch || "-",
    },
    {
      name: "Status",
      selector: (row: any) => row.status || "-",
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "32px",
            fontSize: "12px",
            fontWeight: 500,
            backgroundColor:
              row.status === "DISBURSED"
                ? "var(--color-status-green)"
                : "var(--color-status-blue)",
            color: "var(--primary-foreground)",
          }}
        >
          {row.status || "-"}
        </span>
      ),
    },
  ];

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params: any = {
        fromDate: fromDate.format("YYYY-MM-DD"),
        toDate: toDate.format("YYYY-MM-DD"),
      };

      const response = await getLoanDisbursementReport(params);
      if (response && response.data) {
        const data = response.data.data;
        if (data && !Array.isArray(data) && data.items) {
          setTotals(data);
          setReportData(data.items || []);
        } else {
          const list = Array.isArray(data) ? data : data?.items || [];
          setReportData(list);
          setTotals(data && !Array.isArray(data) ? data : null);
        }
        setPage(1);
      }
    } catch (error: any) {
      console.error("Error fetching disbursement report:", error);
      toast.error(error?.message || "Failed to fetch report");
      setReportData([]);
      setTotals(null);
    } finally {
      setLoading(false);
    }
  };

  // Client-side pagination
  const totalRows = reportData.length;
  const totalPage = Math.ceil(totalRows / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = reportData.slice(startIndex, endIndex);
  const fromRow = totalRows > 0 ? startIndex + 1 : 0;
  const toRow = Math.min(endIndex, totalRows);

  const exportToCSV = () => {
    if (!reportData || reportData.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const headers = ["Application ID", "Customer Name", "Date", "Amount", "Product", "Branch", "Status"];
    const csvContent = [
      headers.join(","),
      ...reportData.map((item: any) => [
        `"${item.applicationNumber  || ""}"`,
        `"${item.customerName || item.name || ""}"`,
        item.disbursementDate || item.date || "",
        item.amount || item.disbursedAmount || 0,
        `"${item.productName || item.productCode || ""}"`,
        `"${item.branchName || item.branch || ""}"`,
        `"${item.status || ""}"`,
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Loan_Disbursement_Report_${dayjs().format("YYYYMMDD")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="col-12">
        <div
          className="d-flex justify-content-between align-items-center mb-4 pb-2"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h5 className="mb-0" style={{ fontWeight: 600, color: "var(--foreground)" }}>
            Loan Disbursement Report
          </h5>
          <Button
            className="gradient-btn"
            type="primary"
            onClick={exportToCSV}
            style={{
              borderColor: "white",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
          >
            Export CSV
          </Button>
        </div>

        <div
          className="p-3 mb-4"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        >
          <div className="row g-3">
            <div className="col-md-4">
              <label
                className="mb-1 small"
                style={{
                  color: "var(--muted-foreground)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                From Date
              </label>
              <DatePicker
                value={fromDate}
                onChange={(d) => setFromDate(d)}
                format="YYYY-MM-DD"
                allowClear={false}
                className="w-100"
              />
            </div>
            <div className="col-md-4">
              <label
                className="mb-1 small"
                style={{
                  color: "var(--muted-foreground)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                To Date
              </label>
              <DatePicker
                value={toDate}
                onChange={(d) => setToDate(d)}
                format="YYYY-MM-DD"
                allowClear={false}
                className="w-100"
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <Button
                className="gradient-btn w-100"
                type="primary"
                onClick={fetchReportData}
                loading={loading}
                style={{
                  borderColor: "white",
                  borderRadius: "8px",
                  height: "38px",
                }}
              >
                Fetch Data
              </Button>
            </div>
          </div>
        </div>

        {totals && (
          <div className="row mb-4">
            <div className="col-md-4">
              <div
                className="h-100 p-4"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              >
                <small
                  style={{
                    color: "var(--muted-foreground)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Total Disbursed Amount
                </small>
                <h4
                  className="mb-0"
                  style={{ fontWeight: 700, color: "var(--primary)" }}
                >
                  {(
                    totals.totalAmount ||
                    totals.totalDisbursedAmount ||
                    0
                  ).toLocaleString()}{" "}
                  SAR
                </h4>
              </div>
            </div>
            <div className="col-md-4">
              <div
                className="h-100 p-4"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              >
                <small
                  style={{
                    color: "var(--muted-foreground)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Total Loan Count
                </small>
                <h4
                  className="mb-0"
                  style={{
                    fontWeight: 700,
                    color: "var(--color-status-green)",
                  }}
                >
                  {(
                    totals.totalCount ||
                    totals.loanCount ||
                    reportData.length
                  ).toLocaleString()}
                </h4>
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
          totalPage={totalPage}
          from={fromRow}
          to={toRow}
          data={paginatedData}
          isLoading={loading}
        />
      </div>
    </>
  );
};

export default LoanDisbursementReport;