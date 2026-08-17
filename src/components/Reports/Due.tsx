import { useEffect, useState, useMemo } from "react";
import TableView from "../TableView/TableView";
import { Clock } from "lucide-react";
import { DatePicker, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getDueLoansReport } from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";
import ReportHeader from "./ReportHeader";

const Due = () => {
  const { t } = useTranslation("reports");
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
      toast.error(error?.message || t("due.toast.fetchError"));
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
        principalDue:
          item.principalDue != null ? `${Number(item.principalDue).toFixed(2)} SAR` : "-",
        profitDue: item.profitDue != null ? `${Number(item.profitDue).toFixed(2)} SAR` : "-",
        installmentAmount:
          item.installmentAmount != null ? `${Number(item.installmentAmount).toFixed(2)} SAR` : "-",
        daysUntilDue: item.daysUntilDue != null ? item.daysUntilDue : "-",
        status: item.status || "-",
      };
    });

    if (!debouncedSearch) return all;
    const term = debouncedSearch.toLowerCase();
    return all.filter(
      (row: any) =>
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
      name: t("due.col.loanAccountNo"),
      selector: (row: any) => row.loanAccountNumber,
      width: "180px",
    },
    {
      name: t("due.col.customerName"),
      selector: (row: any) => row.customerName,
      width: "160px",
    },
    {
      name: t("due.col.product"),
      selector: (row: any) => row.productName,
      width: "140px",
    },
    {
      name: t("due.col.installmentNumber"),
      selector: (row: any) => row.installmentNumber,
      width: "120px",
    },
    {
      name: t("due.col.dueDate"),
      selector: (row: any) => row.dueDate,
      width: "130px",
    },
    {
      name: t("due.col.principalDue"),
      selector: (row: any) => row.principalDue,
      width: "150px",
    },
    {
      name: t("due.col.profitDue"),
      selector: (row: any) => row.profitDue,
      width: "140px",
    },
    {
      name: t("due.col.installmentAmount"),
      selector: (row: any) => row.installmentAmount,
      width: "170px",
    },
    {
      name: t("due.col.daysUntilDue"),
      selector: (row: any) => row.daysUntilDue,
      width: "140px",
    },
    {
      name: t("common:status"),
      selector: (row: any) => row.status,
      width: "120px",
    },
  ];

  const exportToCSV = (data: any[], fileName: string) => {
    if (!data || data.length === 0) {
      toast.error(t("toast.noExportData"));
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
      <div className="service col-12">
        <ReportHeader icon={<Clock className="h-4 w-4" />} title={t("due.title")} />
        <div className="pro-card p-3 mb-3">
          <div className="d-flex flex-wrap align-items-center gap-2 w-100">
            <Input
              allowClear
              placeholder={t("due.searchPlaceholder")}
              prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
            />
            <DatePicker
              placeholder={t("common:from")}
              value={fromDate}
              onChange={(d) => setFromDate(d)}
              format="YYYY-MM-DD"
              allowClear
              style={{ flex: "1 1 200px", minWidth: 180, height: 40, borderRadius: 2 }}
            />
            <DatePicker
              placeholder={t("common:to")}
              value={toDate}
              onChange={(d) => setToDate(d)}
              format="YYYY-MM-DD"
              allowClear
              style={{ flex: "1 1 200px", minWidth: 180, height: 40, borderRadius: 2 }}
            />
            <button
              type="button"
              className="theme-btn-next"
              onClick={handleSubmit}
              disabled={loading}
              style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {loading ? t("common:loading") : t("common:refresh")}
            </button>
            <button
              type="button"
              className="theme-btn-next"
              onClick={() => exportToCSV(mappedData, "DueLoans")}
              disabled={!mappedData.length}
              style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {t("action.exportCsv")}
            </button>
          </div>
        </div>
        <div className="pro-card">
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
