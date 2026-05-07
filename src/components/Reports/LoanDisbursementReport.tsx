import { useEffect, useMemo, useState } from "react";
import { Col, DatePicker, Input, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TableView from "../TableView/TableView";
import { getLoanDisbursementReport } from "../../redux/apis/apisCrudLms";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const LoanDisbursementReport = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [reportData, setReportData] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Only send dates when the user picks them; otherwise hit the bare endpoint.
      const params: any = {};
      if (fromDate) params.fromDate = fromDate.format("YYYY-MM-DD");
      if (toDate) params.toDate = toDate.format("YYYY-MM-DD");

      const response = await getLoanDisbursementReport(
        Object.keys(params).length ? params : undefined
      );
      if (response && response.data) {
        const data = response.data.data ?? response.data;
        if (data && !Array.isArray(data) && data.items) {
          setTotals(data);
          setReportData(data.items || []);
        } else {
          const list = Array.isArray(data) ? data : data?.items || [];
          setReportData(list);
          setTotals(data && !Array.isArray(data) ? data : null);
        }
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

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  const formatNumber = (n: any) => {
    if (n === null || n === undefined || n === "") return "-";
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Filter the rows by search term
  const filteredData = useMemo(() => {
    if (!debouncedSearch) return reportData;
    const term = debouncedSearch.toLowerCase();
    return reportData.filter((row: any) =>
      String(row.applicationNumber || "").toLowerCase().includes(term) ||
      String(row.customerName || row.name || "").toLowerCase().includes(term) ||
      String(row.productName || row.productCode || "").toLowerCase().includes(term) ||
      String(row.branchName || row.branch || "").toLowerCase().includes(term) ||
      String(row.status || "").toLowerCase().includes(term)
    );
  }, [reportData, debouncedSearch]);

  // Visible totals derived from the filtered set so cards match the table
  const visibleTotals = useMemo(() => {
    const totalAmount = filteredData.reduce(
      (acc: number, r: any) => acc + Number(r.amount ?? r.disbursedAmount ?? 0),
      0
    );
    return { totalAmount, totalCount: filteredData.length };
  }, [filteredData]);

  // Client-side pagination on the filtered set
  const totalRows = filteredData.length;
  const totalPage = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const fromRow = totalRows > 0 ? startIndex + 1 : 0;
  const toRow = Math.min(endIndex, totalRows);

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
      cell: (row: any) =>
        row.disbursementDate || row.date
          ? dayjs(row.disbursementDate || row.date).format("YYYY-MM-DD")
          : "-",
    },
    {
      name: "Amount",
      cell: (row: any) => (
        <b>{formatNumber(row.amount ?? row.disbursedAmount ?? 0)} SAR</b>
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

  const exportToCSV = () => {
    if (!filteredData.length) {
      toast.error("No data available to export");
      return;
    }
    const headers = ["Application No", "Customer Name", "Date", "Amount", "Product", "Branch", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map((item: any) =>
        [
          item.applicationNumber || "",
          item.customerName || item.name || "",
          item.disbursementDate || item.date || "",
          item.amount ?? item.disbursedAmount ?? 0,
          item.productName || item.productCode || "",
          item.branchName || item.branch || "",
          item.status || "",
        ]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
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
    <div className="col-12">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Loan Disbursement Report</h3>
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <Input
          allowClear
          placeholder="Search by application, customer, product, branch, status"
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
        />
        <DatePicker
          placeholder="From"
          value={fromDate}
          onChange={(d) => setFromDate(d)}
          format="YYYY-MM-DD"
          allowClear
          style={{ flex: "1 1 200px", minWidth: 180, height: 40, borderRadius: 8 }}
        />
        <DatePicker
          placeholder="To"
          value={toDate}
          onChange={(d) => setToDate(d)}
          format="YYYY-MM-DD"
          allowClear
          style={{ flex: "1 1 200px", minWidth: 180, height: 40, borderRadius: 8 }}
        />
        <button
          type="button"
          className="theme-btn-next"
          onClick={exportToCSV}
          disabled={!filteredData.length}
          style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          Export CSV
        </button>
      </div>

      {(reportData.length > 0 || totals) && (
        <Row gutter={[16, 16]} className="mb-3">
          <Col xs={24} sm={12} lg={12}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Total Disbursed Amount</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {formatNumber(visibleTotals.totalAmount)} SAR
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={12}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Total Loan Count</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {visibleTotals.totalCount}
              </div>
            </div>
          </Col>
        </Row>
      )}

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
          paginationShow={true}
        />
      </div>
    </div>
  );
};

export default LoanDisbursementReport;
