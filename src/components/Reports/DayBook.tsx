import { useEffect, useMemo, useState } from "react";
import { Input } from "antd";
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
  }, []);

  const getDayBookReportData = async () => {
    try {
      setLoading(true);
      // Call without query params per API contract.
      const res = await getDaybookReport();

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
        <span style={{ fontFamily: "monospace" }}>{formatNumber(row.debitAmount)}</span>
      ),
      sortable: true,
      width: "130px",
    },
    {
      name: "Credit",
      cell: (row: any) => (
        <span style={{ fontFamily: "monospace" }}>{formatNumber(row.creditAmount)}</span>
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
            borderRadius: "12px",
            fontSize: "12px",
            backgroundColor: row.status === "POSTED" ? "#92BC83" : "#959595",
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
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-2">
          <div>
            <h3 className="mb-0 fw-bold text-dark">Day Book</h3>
            {summary?.reportDate && (
              <small className="text-muted">Report date: {summary.reportDate}</small>
            )}
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Input
              placeholder="Search by voucher, account, reference, status…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              style={{ width: 320 }}
            />
            <button
              className="theme-btn-next px-4"
              onClick={getDayBookReportData}
              disabled={loading}
              style={{ height: "42px" }}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {summary && (summary.totalTransactions !== undefined || summary.totalDebits !== undefined) && (
        <div className="d-flex gap-3 mb-3 flex-wrap">
          {summary.totalTransactions !== undefined && (
            <div className="px-3 py-2 bg-light rounded border" style={{ minWidth: 160 }}>
              <div className="text-muted small">Total Transactions</div>
              <div className="fw-bold">{summary.totalTransactions}</div>
            </div>
          )}
          {summary.totalDebits !== undefined && (
            <div className="px-3 py-2 bg-light rounded border" style={{ minWidth: 160 }}>
              <div className="text-muted small">Total Debits</div>
              <div className="fw-bold" style={{ fontFamily: "monospace" }}>{formatNumber(summary.totalDebits)}</div>
            </div>
          )}
          {summary.totalCredits !== undefined && (
            <div className="px-3 py-2 bg-light rounded border" style={{ minWidth: 160 }}>
              <div className="text-muted small">Total Credits</div>
              <div className="fw-bold" style={{ fontFamily: "monospace" }}>{formatNumber(summary.totalCredits)}</div>
            </div>
          )}
          {summary.difference !== undefined && (
            <div className="px-3 py-2 bg-light rounded border" style={{ minWidth: 160 }}>
              <div className="text-muted small">Difference</div>
              <div
                className="fw-bold"
                style={{
                  fontFamily: "monospace",
                  color: Number(summary.difference) === 0 ? "#198754" : "#dc3545",
                }}
              >
                {formatNumber(summary.difference)}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="cs-table p-2">
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
    </>
  );
};

export default DayBook;
