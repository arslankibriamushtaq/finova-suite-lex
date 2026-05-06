import { useEffect, useMemo, useState } from "react";
import TableView from "../TableView/TableView";
import { Input, Button } from "antd";
import toast from "react-hot-toast";
import { getLoanBalanceReport } from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const LoanBalanceReport = () => {
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

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
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      // Call without filters — the backend defaults asOfDate to today.
      const res = await getLoanBalanceReport();

      // Response shape: { data: { asOfDate, totalCount, totalPrincipalOutstanding,
      //                            totalProfitOutstanding, totalPenaltiesOutstanding, items: [...] } }
      const root = res?.data;
      const inner = root?.data;
      const list: any[] = Array.isArray(inner?.items)
        ? inner.items
        : Array.isArray(inner?.content)
          ? inner.content
          : Array.isArray(inner)
            ? inner
            : Array.isArray(root)
              ? root
              : [];

      // eslint-disable-next-line no-console
      console.log("[LoanBalance] response =", root, "→ rows:", list.length);

      setItems(list);
      setSummary(
        inner && typeof inner === "object" && !Array.isArray(inner) ? inner : null
      );
    } catch (error: any) {
      console.error("Error fetching loan balance report:", error);
      toast.error(error?.message || "Failed to fetch loan balance report");
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

  const filtered = useMemo(() => {
    if (!debouncedSearch) return items;
    const term = debouncedSearch.toLowerCase();
    return items.filter((item: any) =>
      String(item.loanAccountNumber || "").toLowerCase().includes(term) ||
      String(item.customerId || "").toLowerCase().includes(term) ||
      String(item.customerName || "").toLowerCase().includes(term) ||
      String(item.productName || "").toLowerCase().includes(term) ||
      String(item.loanStatus || "").toLowerCase().includes(term)
    );
  }, [items, debouncedSearch]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    const total = filtered.length;
    setTotalRows(total);
    setTotalPage(Math.max(1, Math.ceil(total / pageSize)));
    setFrom(total > 0 ? (page - 1) * pageSize + 1 : 0);
    setTo(Math.min(page * pageSize, total));
  }, [filtered, page, pageSize]);

  const columns = [
    {
      name: "Loan Account No",
      selector: (row: any) => row.loanAccountNumber || "-",
      sortable: true,
      width: "170px",
    },
    {
      name: "Customer",
      selector: (row: any) => row.customerName || row.customerId || "-",
      sortable: true,
      grow: 2,
    },
    {
      name: "Product",
      selector: (row: any) => row.productName || "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "Disbursed Amount",
      cell: (row: any) => (
        <span style={{ fontFamily: "monospace" }}>{formatNumber(row.disbursedAmount)}</span>
      ),
      sortable: true,
      width: "150px",
    },
    {
      name: "Total Paid",
      cell: (row: any) => (
        <span style={{ fontFamily: "monospace" }}>{formatNumber(row.totalPaid)}</span>
      ),
      sortable: true,
      width: "130px",
    },
    {
      name: "Principal O/S",
      cell: (row: any) => (
        <span style={{ fontFamily: "monospace" }}>{formatNumber(row.principalOutstanding)}</span>
      ),
      sortable: true,
      width: "140px",
    },
    {
      name: "Profit O/S",
      cell: (row: any) => (
        <span style={{ fontFamily: "monospace" }}>{formatNumber(row.profitOutstanding)}</span>
      ),
      sortable: true,
      width: "130px",
    },
    {
      name: "Penalties O/S",
      cell: (row: any) => (
        <span style={{ fontFamily: "monospace" }}>{formatNumber(row.penaltiesOutstanding)}</span>
      ),
      sortable: true,
      width: "140px",
    },
    {
      name: "Next Due Date",
      selector: (row: any) => formatDate(row.nextDueDate),
      sortable: true,
      width: "130px",
    },
    {
      name: "Status",
      cell: (row: any) => {
        const status = row.loanStatus || "-";
        const color = (() => {
          switch (String(status).toLowerCase()) {
            case "active":
            case "paid":
              return "rgba(63,195,128,0.9)";
            case "overdue":
            case "default":
              return "#F84D4D";
            case "pending":
              return "#FFC107";
            default:
              return "#6c757d";
          }
        })();
        return (
          <div
            style={{
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              backgroundColor: color,
              color: "white",
              whiteSpace: "nowrap",
            }}
          >
            {status}
          </div>
        );
      },
      width: "110px",
    },
  ];

  const exportToCSV = () => {
    if (!filtered.length) {
      toast.error("No data to export");
      return;
    }
    const csvHeaders = [
      "Loan Account No", "Customer ID", "Customer Name", "Product",
      "Disbursed Amount", "Total Paid", "Principal Outstanding",
      "Profit Outstanding", "Penalties Outstanding", "Next Due Date", "Status",
    ];
    const csvRows = [csvHeaders.join(",")];
    filtered.forEach((item: any) => {
      const values = [
        item.loanAccountNumber, item.customerId, item.customerName, item.productName,
        item.disbursedAmount, item.totalPaid, item.principalOutstanding,
        item.profitOutstanding, item.penaltiesOutstanding, item.nextDueDate, item.loanStatus,
      ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`);
      csvRows.push(values.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `LoanBalanceReport_${dayjs().format("YYYYMMDD")}.csv`);
  };

  return (
    <div className="col-12">
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
        <h3 className="mb-0 fw-bold text-dark">Loan Balance & Outstanding Report</h3>
        <div className="d-flex gap-2 flex-wrap">
          <Input
            placeholder="Search by loan, customer, product, status…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{ width: 360 }}
          />
          <Button
            className="invoice-btn bg-dark text-white"
            onClick={exportToCSV}
            disabled={!filtered.length}
            style={{ height: "42px" }}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {summary && (
        <div className="d-flex gap-3 mb-3 flex-wrap">
          {summary.asOfDate && (
            <div className="px-3 py-2 bg-light rounded border" style={{ minWidth: 160 }}>
              <div className="text-muted small">As Of Date</div>
              <div className="fw-bold">{summary.asOfDate}</div>
            </div>
          )}
          {summary.totalCount !== undefined && (
            <div className="px-3 py-2 bg-light rounded border" style={{ minWidth: 140 }}>
              <div className="text-muted small">Total Loans</div>
              <div className="fw-bold">{summary.totalCount}</div>
            </div>
          )}
          {summary.totalPrincipalOutstanding !== undefined && (
            <div className="px-3 py-2 bg-light rounded border" style={{ minWidth: 200 }}>
              <div className="text-muted small">Principal Outstanding</div>
              <div className="fw-bold" style={{ fontFamily: "monospace" }}>
                {formatNumber(summary.totalPrincipalOutstanding)} SAR
              </div>
            </div>
          )}
          {summary.totalProfitOutstanding !== undefined && (
            <div className="px-3 py-2 bg-light rounded border" style={{ minWidth: 200 }}>
              <div className="text-muted small">Profit Outstanding</div>
              <div className="fw-bold" style={{ fontFamily: "monospace" }}>
                {formatNumber(summary.totalProfitOutstanding)} SAR
              </div>
            </div>
          )}
          {summary.totalPenaltiesOutstanding !== undefined && (
            <div className="px-3 py-2 bg-light rounded border" style={{ minWidth: 200 }}>
              <div className="text-muted small">Penalties Outstanding</div>
              <div className="fw-bold" style={{ fontFamily: "monospace" }}>
                {formatNumber(summary.totalPenaltiesOutstanding)} SAR
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

export default LoanBalanceReport;
