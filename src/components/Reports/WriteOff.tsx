import { useEffect, useMemo, useState } from "react";
import TableView from "../TableView/TableView";
import { DatePicker, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getWriteOffLoansReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const WriteOff = () => {
  const [period, setPeriod] = useState<any>(null);
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const id = useParams();

  // Debounce search
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Only send `period` when the user picks one; otherwise hit the bare endpoint.
      const finalPeriod = period ? period.format("YYYY-MM") : undefined;
      const res = await getWriteOffLoansReport(finalPeriod);
      if (res) {
        const root = res.data?.data ?? res.data;
        const data = root?.items ?? root?.loans ?? root ?? [];
        setAllCallActivity(Array.isArray(data) ? data : []);
      }
    } catch (error: any) {
      console.error("Error fetching write off loans:", error);
      toast.error(error?.message || "Failed to fetch write off loans");
      setAllCallActivity([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, period]);

  const formatDate = (isoString: any) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return String(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatNumber = (n: any) => {
    if (n === null || n === undefined || n === "") return "-";
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const mappedData = useMemo(() => {
    const all = (Array.isArray(allCallActivity) ? allCallActivity : []).map((item: any) => ({
      loanId: item.loanId || "-",
      customerId: item.customerId || "-",
      writeOffDate: item.writeOffDate || null,
      principalWrittenOff: item.principalWrittenOff ?? 0,
      provisionReleased: item.provisionReleased ?? 0,
    }));

    if (!debouncedSearch) return all;
    const term = debouncedSearch.toLowerCase();
    return all.filter((row: any) =>
      String(row.loanId).toLowerCase().includes(term) ||
      String(row.customerId).toLowerCase().includes(term) ||
      String(formatDate(row.writeOffDate)).toLowerCase().includes(term)
    );
  }, [allCallActivity, debouncedSearch]);

  // Client-side pagination
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return mappedData.slice(start, start + pageSize);
  }, [mappedData, page, pageSize]);

  // Keep totalRows / totalPage / from / to in sync with the filtered set
  useEffect(() => {
    const total = mappedData.length;
    setTotalRows(total);
    setTotalPage(Math.max(1, Math.ceil(total / pageSize)));
    setFrom(total > 0 ? (page - 1) * pageSize + 1 : 0);
    setTo(Math.min(page * pageSize, total));
  }, [mappedData, page, pageSize]);

  const Call_Activity_Header = [
    {
      name: "Loan ID",
      selector: (row: any) => row.loanId,
      width: "200px",
    },
    {
      name: "Customer ID",
      selector: (row: any) => row.customerId,
      width: "200px",
    },
    {
      name: "Write Off Date",
      selector: (row: any) => formatDate(row.writeOffDate),
    },
    {
      name: "Principal Written Off",
      cell: (row: any) => <span>{formatNumber(row.principalWrittenOff)} SAR</span>,
    },
    {
      name: "Provision Released",
      cell: (row: any) => <span>{formatNumber(row.provisionReleased)} SAR</span>,
    },
  ];

  const exportToCSV = () => {
    if (!mappedData.length) {
      toast.error("No data to export");
      return;
    }
    const csvHeaders = [
      "Loan ID", "Customer ID", "Write Off Date",
      "Principal Written Off", "Provision Released",
    ];
    const csvRows = [csvHeaders.join(",")];
    mappedData.forEach((r: any) => {
      const values = [
        r.loanId,
        r.customerId,
        formatDate(r.writeOffDate),
        r.principalWrittenOff ?? 0,
        r.provisionReleased ?? 0,
      ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`);
      csvRows.push(values.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `WriteOffLoans_${dayjs().format("YYYYMMDD")}.csv`);
  };

  return (
    <div className="col-12">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Write Off Loan</h3>
      </div>

      <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
        <Input
          allowClear
          placeholder="Search by loan ID, customer ID, date"
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
        />
        <DatePicker
          picker="month"
          placeholder="Period"
          value={period}
          onChange={(date) => setPeriod(date)}
          format="YYYY-MM"
          allowClear
          style={{ flex: "1 1 200px", minWidth: 180, height: 40, borderRadius: 8 }}
        />
        <button
          type="button"
          className="theme-btn-next"
          onClick={exportToCSV}
          disabled={!mappedData.length}
          style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          Export CSV
        </button>
        </div>
      </div>

      <div
        className="bg-white"
        style={{
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          totalPage={totalPage}
          from={from}
          to={to}
          header={Call_Activity_Header}
          data={paginatedData}
          isLoading={loading}
          paginationShow={true}
        />
      </div>
    </div>
  );
};

export default WriteOff;
