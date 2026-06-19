import { useEffect, useMemo, useState } from "react";
import { Col, DatePicker, Input, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TableView from "../TableView/TableView";
import { getDaybookReport } from "../../redux/apis/apisCrudLms";
import Loader from "../Loader/Loader";
import toast from "react-hot-toast";

const DayBook = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [entries, setEntries] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);

  // Debounce search so we don't refilter on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    getDayBookReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  const getDayBookReportData = async () => {
    try {
      setLoading(true);
      // Send from/to only when the user has picked them; otherwise hit the
      // bare endpoint (matches the curl shape the backend expects).
      const res = await getDaybookReport({
        from: fromDate ? fromDate.format("YYYY-MM-DD") : undefined,
        to: toDate ? toDate.format("YYYY-MM-DD") : undefined,
      });

      // Response shape from /ledger-service/api/v1/reports/day-book:
      //   { data: { entries: [...], reportDate, totalTransactions, totalDebits, totalCredits, difference }, message, timestamp }
      // axios puts the parsed JSON on res.data, so the inner block is res.data.data.
      const inner = res?.data?.data;
      const payload = inner && typeof inner === "object" ? inner : (res?.data ?? {});

      const list: any[] = Array.isArray(payload?.entries)
        ? payload.entries
        : Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : [];

      // Temporary debug aid — open the browser console to confirm what arrived.
      // Remove once the table renders correctly.
      // eslint-disable-next-line no-console
      console.log("[DayBook] response =", res?.data, "→ entries:", list.length);

      setEntries(list);
      setSummary({
        reportDate: payload?.reportDate,
        totalTransactions: payload?.totalTransactions,
        totalDebits: payload?.totalDebits,
        totalCredits: payload?.totalCredits,
        difference: payload?.difference,
      });
    } catch (error: any) {
      console.error("Error fetching daybook:", error);
      toast.error(error?.message || "Failed to fetch daybook report");
      setEntries([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hh}:${mm}`;
  };

  const formatNumber = (n: any) => {
    if (n === null || n === undefined || n === "") return "-";
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const headers = [
    {
      name: "Posted At",
      selector: (row: any) => formatDate(row.postedAt),
      sortable: true,
      width: "160px",
    },
    {
      name: "Voucher No",
      selector: (row: any) => row.voucherNumber || "-",
      sortable: true,
      width: "180px",
    },
    {
      name: "Reference Type",
      selector: (row: any) => row.referenceType || "-",
      sortable: true,
      width: "140px",
    },
    {
      name: "Account",
      selector: (row: any) => row.accountCode ? `${row.accountCode} — ${row.accountName || ""}` : (row.accountName || "-"),
      sortable: true,
    },
    {
      name: "Description",
      selector: (row: any) => row.lineDescription || row.description || "-",
      grow: 2,
    },
    {
      name: "Debit",
      cell: (row: any) => (
        <span>{formatNumber(row.debitAmount)}</span>
      ),
      sortable: true,
      width: "130px",
    },
    {
      name: "Credit",
      cell: (row: any) => (
        <span>{formatNumber(row.creditAmount)}</span>
      ),
      sortable: true,
      width: "130px",
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            backgroundColor: row.status === "POSTED" ? "var(--color-success)" : "#959595",
            color: "white",
            whiteSpace: "nowrap",
          }}
        >
          {row.status || "-"}
        </span>
      ),
      width: "110px",
    },
  ];

  // Search across the most useful fields
  const filteredEntries = useMemo(() => {
    if (!debouncedSearch) return entries;
    const term = debouncedSearch.toLowerCase();
    return entries.filter((row: any) =>
      String(row.voucherNumber || "").toLowerCase().includes(term) ||
      String(row.referenceType || "").toLowerCase().includes(term) ||
      String(row.accountCode || "").toLowerCase().includes(term) ||
      String(row.accountName || "").toLowerCase().includes(term) ||
      String(row.lineDescription || "").toLowerCase().includes(term) ||
      String(row.description || "").toLowerCase().includes(term) ||
      String(row.status || "").toLowerCase().includes(term) ||
      String(row.transactionType || "").toLowerCase().includes(term)
    );
  }, [entries, debouncedSearch]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEntries.slice(start, start + pageSize);
  }, [filteredEntries, page, pageSize]);

  // Totals derived from the currently-visible (filtered) rows so the summary
  // cards always match what's in the table.
  const visibleTotals = useMemo(() => {
    const totalDebits = filteredEntries.reduce(
      (acc: number, r: any) => acc + Number(r.debitAmount ?? 0),
      0
    );
    const totalCredits = filteredEntries.reduce(
      (acc: number, r: any) => acc + Number(r.creditAmount ?? 0),
      0
    );
    return {
      totalTransactions: filteredEntries.length,
      totalDebits,
      totalCredits,
      difference: totalDebits - totalCredits,
    };
  }, [filteredEntries]);

  // Keep totals + from/to in sync with the filtered set
  useEffect(() => {
    const total = filteredEntries.length;
    setTotalRows(total);
    setTotalPage(Math.max(1, Math.ceil(total / pageSize)));
    setFrom(total > 0 ? (page - 1) * pageSize + 1 : 0);
    setTo(Math.min(page * pageSize, total));
  }, [filteredEntries, page, pageSize]);

  return (
    <>
      {loading && <Loader />}
      <div className="service day-book-page">
        <div className="mb-3 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">Day Book</h3>
        </div>

        {/* Filters card */}
        <div
          className="bg-white p-3 mb-3"
          style={{
            borderRadius: 6,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="d-flex flex-wrap align-items-center gap-2 w-100">
            <Input
              allowClear
              placeholder="Search by voucher, account, reference, status…"
              prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 6, height: 40 }}
            />
            <DatePicker
              placeholder="From"
              value={fromDate}
              onChange={(d) => setFromDate(d)}
              format="YYYY-MM-DD"
              allowClear
              style={{ flex: "1 1 180px", minWidth: 160, height: 40, borderRadius: 6, background: "#fff" }}
            />
            <DatePicker
              placeholder="To"
              value={toDate}
              onChange={(d) => setToDate(d)}
              format="YYYY-MM-DD"
              allowClear
              style={{ flex: "1 1 180px", minWidth: 160, height: 40, borderRadius: 6, background: "#fff" }}
            />
            <button
              type="button"
              className="theme-btn-next"
              onClick={getDayBookReportData}
              disabled={loading}
              style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

      {(entries.length > 0 || summary) && (
        <Row gutter={[16, 16]} className="mb-3">
          <Col xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Total Transactions</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {visibleTotals.totalTransactions}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Total Debits</div>
              <div
                className="mt-2"
                style={{ fontSize: 22, fontWeight: 700 }}
              >
                {formatNumber(visibleTotals.totalDebits)}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Total Credits</div>
              <div
                className="mt-2"
                style={{ fontSize: 22, fontWeight: 700 }}
              >
                {formatNumber(visibleTotals.totalCredits)}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Difference</div>
              <div
                className="mt-2"
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: Number(visibleTotals.difference) === 0 ? "#198754" : "#dc3545",
                }}
              >
                {formatNumber(visibleTotals.difference)}
              </div>
            </div>
          </Col>
        </Row>
      )}

        <div
          className="bg-white"
          style={{
            borderRadius: 6,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <TableView
            header={headers}
            setPage={setPage}
            setPageSize={setPageSize}
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            totalPage={totalPage}
            from={from}
            to={to}
            data={paginatedData}
            isLoading={loading}
            paginationShow={true}
          />
        </div>
      </div>
    </>
  );
};

export default DayBook;
