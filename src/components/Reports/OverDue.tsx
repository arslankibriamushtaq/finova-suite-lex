import { useEffect, useMemo, useState } from "react";
import TableView from "../TableView/TableView";
import { Input } from "antd";
import toast from "react-hot-toast";
import { getOverdueLoansReport } from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const OverDue = () => {
  const [rows, setRows] = useState<any[]>([]);
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
      // Call without query params per API contract.
      const res = await getOverdueLoansReport();

      // Tolerate every common envelope:
      //   { data: [...] }
      //   { data: { items: [...], totals... } }
      //   { data: { loans: [...] } }
      //   { data: { overdueLoans: [...] } }
      //   { data: { data: [...] } }
      //   plain array
      const root = res?.data;
      const inner = root?.data;
      const list: any[] = Array.isArray(root)
        ? root
        : Array.isArray(inner)
          ? inner
          : Array.isArray(inner?.items)
            ? inner.items
            : Array.isArray(inner?.loans)
              ? inner.loans
              : Array.isArray(inner?.overdueLoans)
                ? inner.overdueLoans
                : Array.isArray(inner?.data)
                  ? inner.data
                  : [];

      // eslint-disable-next-line no-console
      console.log("[OverDue] response =", root, "→ rows:", list.length);

      setRows(list);
      setSummary(
        inner && typeof inner === "object" && !Array.isArray(inner) ? inner : null
      );
    } catch (error: any) {
      console.error("Error fetching overdue loans:", error);
      toast.error(error?.message || "Failed to fetch overdue loans");
      setRows([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
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

  const formatNumber = (n: any) => {
    if (n === null || n === undefined || n === "") return "-";
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const mappedAndFiltered = useMemo(() => {
    const all = (rows || []).map((item: any) => ({
      loanId: item.loanId || item.applicationId || "-",
      customerId: item.customerId || item.customerName || "-",
      facilityType: item.facilityType || item.productCode || item.productName || "-",
      overdueAmount: item.overdueAmount ?? item.amountOverdue ?? item.amount ?? null,
      daysPastDue: item.daysPastDue ?? item.dpd ?? null,
      paymentStatus: item.paymentStatus || item.status || "-",
      dueDate: item.dueDate || item.nextDueDate,
      currency: item.currency || "SAR",
    }));

    if (!debouncedSearch) return all;
    const term = debouncedSearch.toLowerCase();
    return all.filter((row: any) =>
      String(row.loanId || "").toLowerCase().includes(term) ||
      String(row.customerId || "").toLowerCase().includes(term) ||
      String(row.facilityType || "").toLowerCase().includes(term) ||
      String(row.paymentStatus || "").toLowerCase().includes(term)
    );
  }, [rows, debouncedSearch]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return mappedAndFiltered.slice(start, start + pageSize);
  }, [mappedAndFiltered, page, pageSize]);

  useEffect(() => {
    const total = mappedAndFiltered.length;
    setTotalRows(total);
    setTotalPage(Math.max(1, Math.ceil(total / pageSize)));
    setFrom(total > 0 ? (page - 1) * pageSize + 1 : 0);
    setTo(Math.min(page * pageSize, total));
  }, [mappedAndFiltered, page, pageSize]);

  const headers = [
    { name: "Loan ID", selector: (row: any) => row.loanId, sortable: true, width: "260px" },
    { name: "Customer", selector: (row: any) => row.customerId, sortable: true },
    { name: "Facility Type", selector: (row: any) => row.facilityType, sortable: true, width: "150px" },
    {
      name: "Overdue Amount",
      cell: (row: any) => (
        <span style={{ fontFamily: "monospace" }}>
          {row.overdueAmount != null ? `${formatNumber(row.overdueAmount)} ${row.currency || ""}`.trim() : "-"}
        </span>
      ),
      sortable: true,
      width: "180px",
    },
    {
      name: "Days Past Due",
      selector: (row: any) => row.daysPastDue ?? "-",
      sortable: true,
      width: "120px",
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "12px",
            backgroundColor: /OVERDUE|DEFAULT|NPL/i.test(String(row.paymentStatus))
              ? "#F85F54"
              : /CURRENT|ON_TIME|PAID/i.test(String(row.paymentStatus))
                ? "#92BC83"
                : "#959595",
            color: "white",
            whiteSpace: "nowrap",
          }}
        >
          {row.paymentStatus || "-"}
        </span>
      ),
      width: "150px",
    },
    {
      name: "Due Date",
      selector: (row: any) => formatDate(row.dueDate),
      sortable: true,
      width: "130px",
    },
  ];

  const exportToCSV = () => {
    if (!mappedAndFiltered.length) {
      toast.error("No data to export");
      return;
    }
    const csvHeaders = ["Loan ID", "Customer", "Facility Type", "Overdue Amount", "Currency", "Days Past Due", "Status", "Due Date"];
    const csvRows = [csvHeaders.join(",")];
    mappedAndFiltered.forEach((row: any) => {
      const values = [
        row.loanId,
        row.customerId,
        row.facilityType,
        row.overdueAmount ?? "",
        row.currency || "",
        row.daysPastDue ?? "",
        row.paymentStatus,
        formatDate(row.dueDate),
      ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`);
      csvRows.push(values.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `OverdueLoans_${dayjs().format("YYYYMMDD")}.csv`);
  };

  return (
    <div className="col-12">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 className="mb-0">Overdue Loans</h5>
        <div className="d-flex gap-2 flex-wrap">
          <Input
            placeholder="Search by loan ID, customer, facility, status"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{ width: 320 }}
          />
          <button
            className="invoice-btn bg-dark text-white"
            onClick={exportToCSV}
            disabled={!mappedAndFiltered.length}
          >
            Export CSV
          </button>
        </div>
      </div>

      {summary && (summary.totalOverdueAmount !== undefined || summary.totalLoans !== undefined || summary.asOfDate) && (
        <div className="d-flex gap-3 mb-3 flex-wrap">
          {summary.asOfDate && (
            <div className="px-3 py-2 bg-light rounded border" style={{ minWidth: 160 }}>
              <div className="text-muted small">As Of Date</div>
              <div className="fw-bold">{summary.asOfDate}</div>
            </div>
          )}
          {summary.totalLoans !== undefined && (
            <div className="px-3 py-2 bg-light rounded border" style={{ minWidth: 160 }}>
              <div className="text-muted small">Total Loans</div>
              <div className="fw-bold">{summary.totalLoans}</div>
            </div>
          )}
          {summary.totalOverdueAmount !== undefined && (
            <div className="px-3 py-2 bg-light rounded border" style={{ minWidth: 180 }}>
              <div className="text-muted small">Total Overdue</div>
              <div className="fw-bold" style={{ fontFamily: "monospace" }}>
                {formatNumber(summary.totalOverdueAmount)}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="cs-table p-2">
        <TableView
          header={headers}
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

export default OverDue;
