import { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import { DatePicker, Input } from "antd";
import { Search } from "lucide-react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getCollectionsDueReport } from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { extractReportRows, extractReportTotal } from "../../utils/ledgerErrors";
import ReportHeader from "./ReportHeader";
const CollectionsDueReport = () => {
  const { t } = useTranslation("reports");
  const [fromDate, setFromDate] = useState<any>("");
  const [toDate, setToDate] = useState<any>("");
  const [allCallActivity, setAllCallActivity] = useState<any>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const id = useParams();

  // The endpoint takes `search`, so filtering happens server-side — debounced so
  // we don't fire a request per keystroke.
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
      // Both dates are required by the ledger; default to the current month
      // rather than firing a call that is guaranteed to 422.
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const res = await getCollectionsDueReport(
        fromDate || monthStart,
        toDate || now.toISOString().slice(0, 10),
        { search: debouncedSearch || undefined, page: page - 1, size: pageSize }
      );
      if (res) {
        // collections-due answers with an envelope, not a bare array.
        const rows = extractReportRows(res?.data?.data);
        setAllCallActivity(rows);
        setTotalRows(extractReportTotal(res?.data, rows));
      }
    } catch (error: any) {
      setAllCallActivity([]);
      setTotalRows(0);
      toast.error(error?.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const formatCurrency = (amount: any) => {
    if (amount === null || amount === undefined) return "-";
    return typeof amount === "number" ? amount.toFixed(2) : amount;
  };
  const mappedData = (Array.isArray(allCallActivity) ? allCallActivity : []).map((item: any) => {
    return {
      customerName: item.customerName ? item.customerName : "-",
      installmentAmount:
        item.installmentAmount || item.installmentAmount == 0
          ? formatCurrency(item.installmentAmount)
          : "-",
      principalDue:
        item.principalDue || item.principalDue == 0 ? formatCurrency(item.principalDue) : "-",
      dueDate: formatDate(item.dueDate ? item.dueDate : "_"),
      profitDue: item.profitDue || item.profitDue == 0 ? formatCurrency(item.profitDue) : "-",
      penaltyDue: item.penaltyDue || item.penaltyDue == 0 ? formatCurrency(item.penaltyDue) : "-",
      totalAmountDue:
        item.totalAmountDue || item.totalAmountDue == 0 ? formatCurrency(item.totalAmountDue) : "-",
      daysPastDue: item.daysPastDue ? item.daysPastDue : "-",
    };
  });

  // One fetch effect covering every input. There used to be a second one keyed
  // on both dates, which meant picking only a To date never refetched.
  useEffect(() => {
    handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, page, pageSize, fromDate, toDate, debouncedSearch]);

  const Call_Activity_Header = [
    {
      name: t("collectionsDue.col.customer"),
      cell: (row: any) => row.customerName,
    },
    {
      name: t("collectionsDue.col.installmentAmount"),
      selector: (row: { installmentAmount: any }) => row.installmentAmount,
    },
    {
      name: t("collectionsDue.col.principalDue"),
      selector: (row: { principalDue: any }) => row.principalDue,
    },
    {
      name: t("collectionsDue.col.profitDue"),
      selector: (row: { profitDue: any }) => row.profitDue,
    },
    {
      name: t("collectionsDue.col.penaltyDue"),
      selector: (row: { penaltyDue: any }) => row.penaltyDue,
    },
    {
      name: t("collectionsDue.col.totalAmountDue"),
      selector: (row: { totalAmountDue: any }) => row.totalAmountDue,
    },
    {
      name: t("collectionsDue.col.daysPastDue"),
      selector: (row: { daysPastDue: any }) => row.daysPastDue,
    },
    {
      name: t("collectionsDue.col.dueDate"),
      selector: (row: { dueDate: any }) => row.dueDate,
    },
  ];

  const exportToCSV = (data: any[], fileName: string) => {
    if (!Array.isArray(data) || data.length === 0) {
      toast.error(t("toast.noExportData"));
      return;
    }
    const csvRows = [];
    const headers = Object.keys(data[0]); // Assuming all objects have the same keys
    csvRows.push(headers.join(",")); // Join header row with commas

    // Loop through the data and generate CSV rows
    data.forEach((row) => {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(","));
    });

    // Create CSV string
    const csvString = csvRows.join("\n");

    // Create a Blob from the CSV string and trigger a download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}.csv`);
  };
  // antd hands back a dayjs object, or null when the field is cleared.
  const handleFromDateChange = (date: any) => {
    setFromDate(date ? date.format("YYYY-MM-DDTHH:mm:ss") : "");
    setPage(1);
  };

  const handleToDateChange = (date: any) => {
    setToDate(date ? date.format("YYYY-MM-DDTHH:mm:ss") : "");
    setPage(1);
  };

  return (
    <div className="service col-12">
      <ReportHeader title={t("collectionsDue.title")} />

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            allowClear
            placeholder={t("collectionsDue.searchPlaceholder")}
            prefix={<Search size={14} style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          <DatePicker
            placeholder={t("common:from")}
            value={fromDate ? dayjs(fromDate) : null}
            onChange={handleFromDateChange}
            format="YYYY-MM-DD"
            allowClear
            style={{ flex: "1 1 200px", minWidth: 180, height: 40, borderRadius: 2 }}
          />
          <DatePicker
            placeholder={t("common:to")}
            value={toDate ? dayjs(toDate) : null}
            onChange={handleToDateChange}
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
            onClick={() => exportToCSV(mappedData, "CollectionsDue")}
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
          totalPage={Math.max(1, Math.ceil(totalRows / pageSize))}
          from={totalRows > 0 ? (page - 1) * pageSize + 1 : 0}
          to={Math.min(page * pageSize, totalRows)}
          header={Call_Activity_Header}
          data={mappedData}
          isLoading={loading}
          paginationShow={true}
        />
      </div>
    </div>
  );
};

export default CollectionsDueReport;
