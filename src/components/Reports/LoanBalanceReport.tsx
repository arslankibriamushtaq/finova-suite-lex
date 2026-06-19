import { useEffect, useMemo, useState } from "react";
import TableView from "../TableView/TableView";
import { Col, Input, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
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
      // Call without filters â€” the backend defaults asOfDate to today.
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
      console.log("[LoanBalance] response =", root, "â†’ rows:", list.length);

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

  // Totals derived from the currently-visible (filtered) rows so the summary
  // cards always match what's in the table.
  const visibleTotals = useMemo(() => {
    return filtered.reduce(
      (acc: any, r: any) => ({
        totalCount: acc.totalCount + 1,
        totalPrincipalOutstanding:
          acc.totalPrincipalOutstanding + Number(r.principalOutstanding ?? 0),
        totalProfitOutstanding:
          acc.totalProfitOutstanding + Number(r.profitOutstanding ?? 0),
        totalPenaltiesOutstanding:
          acc.totalPenaltiesOutstanding + Number(r.penaltiesOutstanding ?? 0),
      }),
      {
        totalCount: 0,
        totalPrincipalOutstanding: 0,
        totalProfitOutstanding: 0,
        totalPenaltiesOutstanding: 0,
      }
    );
  }, [filtered]);

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
        <span>{formatNumber(row.disbursedAmount)}</span>
      ),
      sortable: true,
      width: "150px",
    },
    {
      name: "Total Paid",
      cell: (row: any) => (
        <span>{formatNumber(row.totalPaid)}</span>
      ),
      sortable: true,
      width: "130px",
    },
    {
      name: "Principal O/S",
      cell: (row: any) => (
        <span>{formatNumber(row.principalOutstanding)}</span>
      ),
      sortable: true,
      width: "140px",
    },
    {
      name: "Profit O/S",
      cell: (row: any) => (
        <span>{formatNumber(row.profitOutstanding)}</span>
      ),
      sortable: true,
      width: "130px",
    },
    {
      name: "Penalties O/S",
      cell: (row: any) => (
        <span>{formatNumber(row.penaltiesOutstanding)}</span>
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
              borderRadius: "2px",
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
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Loan Balance & Outstanding Report</h3>
      </div>

      <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
        <Input
          allowClear
          placeholder="Search by loan, customer, product, statusâ€¦"
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
        />
        <button
          type="button"
          className="theme-btn-next"
          onClick={exportToCSV}
          disabled={!filtered.length}
          style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          Export CSV
        </button>
        </div>
      </div>

      {(items.length > 0 || summary) && (
        <Row gutter={[16, 16]} className="mb-3">
          <Col xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Total Loans</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {visibleTotals.totalCount}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Principal Outstanding</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {formatNumber(visibleTotals.totalPrincipalOutstanding)} SAR
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Profit Outstanding</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {formatNumber(visibleTotals.totalProfitOutstanding)} SAR
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Penalties Outstanding</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {formatNumber(visibleTotals.totalPenaltiesOutstanding)} SAR
              </div>
            </div>
          </Col>
        </Row>
      )}

      <div
        className="bg-white"
        style={{
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
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
