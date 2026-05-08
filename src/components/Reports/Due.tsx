import { useEffect, useState, useMemo } from "react";
import TableView from "../TableView/TableView";
import { DatePicker, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getDueLoansReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";

const Due = () => {
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const id = useParams();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Only send dates when the user picks them; otherwise hit the bare endpoint.
      const start = fromDate ? fromDate.format("YYYY-MM-DD") : undefined;
      const end = toDate ? toDate.format("YYYY-MM-DD") : undefined;
      const res = await getDueLoansReport(start, end);
      if (res) {
        const root = res.data?.data ?? res.data;
        const data = root?.items ?? root?.loans ?? root ?? [];
        const list = Array.isArray(data) ? data : [];
        setAllCallActivity(list);
        setTotalRows(list.length);
      }
    } catch (error: any) {
      console.error("Error fetching due loans:", error);
      toast.error(error?.message || "Failed to fetch due loans");
      setAllCallActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const mappedData = useMemo(() => {
    const all = (Array.isArray(allCallActivity) ? allCallActivity : []).map((item: any) => {
      return {
        loanAccountNumber: item.loanAccountNumber || "-",
        customerName: item.customerName || "-",
        productName: item.productName || "-",
        installmentNumber: item.installmentNumber != null ? item.installmentNumber : "-",
        dueDate: item.dueDate ? formatDate(item.dueDate) : "-",
        principalDue: item.principalDue != null ? `${Number(item.principalDue).toFixed(2)} SAR` : "-",
        profitDue: item.profitDue != null ? `${Number(item.profitDue).toFixed(2)} SAR` : "-",
        installmentAmount: item.installmentAmount != null ? `${Number(item.installmentAmount).toFixed(2)} SAR` : "-",
        daysUntilDue: item.daysUntilDue != null ? item.daysUntilDue : "-",
        status: item.status || "-",
      };
    });

    if (!debouncedSearch) return all;
    const term = debouncedSearch.toLowerCase();
    return all.filter((row: any) =>
      String(row.loanAccountNumber).toLowerCase().includes(term) ||
      String(row.customerName).toLowerCase().includes(term) ||
      String(row.productName).toLowerCase().includes(term) ||
      String(row.status).toLowerCase().includes(term) ||
      String(row.dueDate).toLowerCase().includes(term)
    );
  }, [allCallActivity, debouncedSearch]);

  // Client-side pagination on the filtered set
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

  // Debounce search so we don't refilter on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, fromDate, toDate]);

  const Call_Activity_Header = [
    {
      name: "Loan Account No.",
      selector: (row: any) => row.loanAccountNumber,
      width: "180px",
    },
    {
      name: "Customer Name",
      selector: (row: any) => row.customerName,
      width: "160px",
    },
    {
      name: "Product",
      selector: (row: any) => row.productName,
      width: "140px",
    },
    {
      name: "Installment #",
      selector: (row: any) => row.installmentNumber,
      width: "120px",
    },
    {
      name: "Due Date",
      selector: (row: any) => row.dueDate,
      width: "130px",
    },
    {
      name: "Principal Due",
      selector: (row: any) => row.principalDue,
      width: "150px",
    },
    {
      name: "Profit Due",
      selector: (row: any) => row.profitDue,
      width: "140px",
    },
    {
      name: "Installment Amount",
      selector: (row: any) => row.installmentAmount,
      width: "170px",
    },
    {
      name: "Days Until Due",
      selector: (row: any) => row.daysUntilDue,
      width: "140px",
    },
    {
      name: "Status",
      selector: (row: any) => row.status,
      width: "120px",
    },
  ];

  const exportToCSV = (data: any[], fileName: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }
    const csvRows: string[] = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));
    data.forEach((row) => {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
  };

  return (
    <>
      <div className="col-12">
        <div className="mb-3 pb-2 border-bottom">
          <h3 className="mb-0 fw-bold text-dark">Due Loans</h3>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
          <Input
            allowClear
            placeholder="Search by loan, customer, product, or status"
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
            onClick={handleSubmit}
            disabled={loading}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button
            type="button"
            className="theme-btn-next"
            onClick={() => exportToCSV(mappedData, "DueLoans")}
            disabled={!mappedData.length}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            Export CSV
          </button>
        </div>
        <div className="cs-table p-2 mt-3">
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
    </>
  );
};

export default Due;
