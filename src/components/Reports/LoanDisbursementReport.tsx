import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "antd";
import TableView from "../TableView/TableView";
import { getLoanDisbursementReport } from "../../redux/apis/apisCrudLms";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const LoanDisbursementReport = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Wide default range from code — no UI pickers, no over-filtering by
      // product / branch / status (those were forcing empty results).
      const response = await getLoanDisbursementReport({
        fromDate: "2000-01-01",
        toDate: dayjs().format("YYYY-MM-DD"),
      });

      // Response shape: { data: { fromDate, toDate, totalCount, totalDisbursedAmount, items: [...] } }
      const root = response?.data;
      const inner = root?.data;
      const list: any[] = Array.isArray(inner?.items)
        ? inner.items
        : Array.isArray(inner)
          ? inner
          : Array.isArray(root)
            ? root
            : [];

      // eslint-disable-next-line no-console
      console.log("[Disbursement] response =", root, "→ rows:", list.length);

      setItems(list);
      setSummary(
        inner && typeof inner === "object" && !Array.isArray(inner) ? inner : null
      );
    } catch (error: any) {
      console.error("Error fetching disbursement report:", error);
      toast.error(error?.message || "Failed to fetch report");
      setItems([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (n: any) => {
    if (n === null || n === undefined || n === "") return "-";
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (iso: any) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Search filter
  const filteredItems = useMemo(() => {
    if (!debouncedSearch) return items;
    const term = debouncedSearch.toLowerCase();
    return items.filter((item: any) =>
      String(item.applicationNumber || "").toLowerCase().includes(term) ||
      String(item.loanAccountNumber || "").toLowerCase().includes(term) ||
      String(item.customerName || "").toLowerCase().includes(term) ||
      String(item.nationalId || "").toLowerCase().includes(term) ||
      String(item.productCode || "").toLowerCase().includes(term) ||
      String(item.productName || "").toLowerCase().includes(term) ||
      String(item.status || "").toLowerCase().includes(term) ||
      String(item.branchOrChannel || "").toLowerCase().includes(term)
    );
  }, [items, debouncedSearch]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  // Sync totals / from / to with the filtered set
  useEffect(() => {
    const total = filteredItems.length;
    setTotalRows(total);
    setTotalPage(Math.max(1, Math.ceil(total / pageSize)));
    setFrom(total > 0 ? (page - 1) * pageSize + 1 : 0);
    setTo(Math.min(page * pageSize, total));
  }, [filteredItems, page, pageSize]);

  const columns = [
    {
      name: "Application No",
      selector: (row: any) => row.applicationNumber || "-",
      sortable: true,
      width: "160px",
    },
    {
      name: "Loan Account No",
      selector: (row: any) => row.loanAccountNumber || "-",
      sortable: true,
      width: "160px",
    },
    {
      name: "National ID",
      selector: (row: any) => row.nationalId || "-",
      sortable: true,
      width: "130px",
    },
    {
      name: "Product",
      selector: (row: any) => row.productName || row.productCode || "-",
      sortable: true,
    },
    {
      name: "Disbursement Date",
      selector: (row: any) => formatDate(row.disbursementDate),
      sortable: true,
      width: "150px",
    },
    {
      name: "Amount",
      cell: (row: any) => (
        <span style={{ fontFamily: "monospace" }}>{formatNumber(row.disbursedAmount)} SAR</span>
      ),
      sortable: true,
      width: "150px",
    },
    {
      name: "Tenure",
      selector: (row: any) => row.tenureMonths != null ? `${row.tenureMonths} mo` : "-",
      sortable: true,
      width: "100px",
    },
    {
      name: "Branch / Channel",
      selector: (row: any) => row.branchOrChannel || "-",
      sortable: true,
      width: "180px",
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          className={`badge ${row.status === "ACTIVE" || row.status === "DISBURSED" ? "bg-success" : "bg-secondary"}`}
        >
          {row.status || "-"}
        </span>
      ),
      width: "110px",
    },
  ];

  const exportToCSV = () => {
    if (!filteredItems.length) {
      toast.error("No data available to export");
      return;
    }

    const csvHeaders = [
      "Application No", "Loan Account No", "Customer Name", "National ID",
      "Product Code", "Product Name", "Disbursement Date", "Disbursed Amount",
      "Tenure (Months)", "Branch/Channel", "Status",
    ];
    const csvRows = [csvHeaders.join(",")];
    filteredItems.forEach((item: any) => {
      const values = [
        item.applicationNumber, item.loanAccountNumber, item.customerName, item.nationalId,
        item.productCode, item.productName, item.disbursementDate, item.disbursedAmount,
        item.tenureMonths, item.branchOrChannel, item.status,
      ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`);
      csvRows.push(values.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
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
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
        <h3 className="mb-0 fw-bold text-dark">Loan Disbursement Report</h3>
        <div className="d-flex gap-2 flex-wrap">
          <Input
            placeholder="Search by application, loan, NID, product, branch…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{ width: 360 }}
          />
          <Button
            className="invoice-btn bg-dark text-white"
            onClick={exportToCSV}
            disabled={!filteredItems.length}
            style={{ height: "42px" }}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {summary && (summary.totalCount !== undefined || summary.totalDisbursedAmount !== undefined) && (
        <div className="d-flex gap-3 mb-3 flex-wrap">
          {summary.totalCount !== undefined && (
            <div className="px-3 py-2 bg-light rounded border" style={{ minWidth: 160 }}>
              <div className="text-muted small">Total Loans</div>
              <div className="fw-bold">{summary.totalCount}</div>
            </div>
          )}
          {summary.totalDisbursedAmount !== undefined && (
            <div className="px-3 py-2 bg-light rounded border" style={{ minWidth: 200 }}>
              <div className="text-muted small">Total Disbursed</div>
              <div className="fw-bold" style={{ fontFamily: "monospace" }}>
                {formatNumber(summary.totalDisbursedAmount)} SAR
              </div>
            </div>
          )}
          {(summary.fromDate || summary.toDate) && (
            <div className="px-3 py-2 bg-light rounded border" style={{ minWidth: 200 }}>
              <div className="text-muted small">Date Range</div>
              <div className="fw-bold" style={{ fontSize: 13 }}>
                {summary.fromDate} → {summary.toDate}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="cs-table p-2">
        <TableView
          header={columns}
          data={paginated}
          totalRows={totalRows}
          totalPage={totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          from={from}
          to={to}
          isLoading={loading}
          paginationShow={true}
        />
      </div>
    </div>
  );
};

export default LoanDisbursementReport;
