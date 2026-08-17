import { useEffect, useState } from "react";
import TableView from "../TableView/TableView";
import { DatePicker, Input } from "antd";
import { Search } from "lucide-react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getProductWiseProfitLossReport } from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { extractReportRows, extractReportTotal } from "../../utils/ledgerErrors";
import ReportHeader from "./ReportHeader";
const ProductWiseProfitLoss = () => {
  const { t } = useTranslation("reports");
  const [fromDate, setFromDate] = useState<any>("");
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
      // The ledger takes a month, not a range — fall back to the current month
      // so the screen is never empty.
      const period = (fromDate || new Date().toISOString()).slice(0, 7);
      const res = await getProductWiseProfitLossReport(period, {
        search: debouncedSearch || undefined,
        page: page - 1,
        size: pageSize,
      });
      if (res) {
        // The report may answer with a bare array or an envelope around one.
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

  const formatCurrency = (amount: any) => {
    if (amount === null || amount === undefined) return "-";
    return typeof amount === "number" ? amount.toFixed(2) : amount;
  };
  const mappedData = (Array.isArray(allCallActivity) ? allCallActivity : []).map((item: any) => {
    return {
      productName: item.productName ? item.productName : "-",
      activeLoans: item.activeLoans || item.activeLoans == 0 ? item.activeLoans : "-",
      closedLoans: item.closedLoans || item.closedLoans == 0 ? item.closedLoans : "-",
      dispursedAmount:
        item.dispursedAmount || item.dispursedAmount == 0
          ? formatCurrency(item.dispursedAmount)
          : "-",
      principalOutstandingAmount:
        item.principalOutstandingAmount || item.principalOutstandingAmount == 0
          ? formatCurrency(item.principalOutstandingAmount)
          : "-",
      profitAccured:
        item.profitAccured || item.profitAccured == 0 ? formatCurrency(item.profitAccured) : "-",
      profitCollected:
        item.profitCollected || item.profitCollected == 0
          ? formatCurrency(item.profitCollected)
          : "-",
      totalFeeCollected:
        item.totalFeeCollected || item.totalFeeCollected == 0
          ? formatCurrency(item.totalFeeCollected)
          : "-",
      writeOffAmount:
        item.writeOffAmount || item.writeOffAmount == 0 ? formatCurrency(item.writeOffAmount) : "-",
    };
  });

  useEffect(() => {
    handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, page, pageSize, fromDate, debouncedSearch]);

  const Call_Activity_Header = [
    {
      name: t("productWiseProfitLoss.col.productName"),
      cell: (row: { productName: any }) => row.productName,
    },
    {
      name: t("productWiseProfitLoss.col.activeLoans"),
      selector: (row: { activeLoans: any }) => row.activeLoans,
    },
    {
      name: t("productWiseProfitLoss.col.closedLoans"),
      selector: (row: { closedLoans: any }) => row.closedLoans,
    },
    {
      name: t("productWiseProfitLoss.col.disbursedAmount"),
      selector: (row: { dispursedAmount: any }) => row.dispursedAmount,
    },
    {
      name: t("productWiseProfitLoss.col.principalOutstandingAmount"),
      selector: (row: { principalOutstandingAmount: any }) => row.principalOutstandingAmount,
    },
    {
      name: t("productWiseProfitLoss.col.profitAccured"),
      selector: (row: { profitAccured: any }) => row.profitAccured,
    },
    {
      name: t("productWiseProfitLoss.col.profitCollected"),
      selector: (row: { profitCollected: any }) => row.profitCollected,
    },
    {
      name: t("productWiseProfitLoss.col.totalFeeCollected"),
      selector: (row: { totalFeeCollected: any }) => row.totalFeeCollected,
    },
    {
      name: t("productWiseProfitLoss.col.writeOffAmount"),
      selector: (row: { writeOffAmount: any }) => row.writeOffAmount,
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
  // A month, not a range: the endpoint takes `period` (YYYY-MM). The old bar
  // offered From *and* To dates, but only the From date reached the API and the
  // To date silently did nothing — so this is one month picker.
  const handlePeriodChange = (date: any) => {
    setFromDate(date ? date.format("YYYY-MM-DDTHH:mm:ss") : "");
    setPage(1);
  };

  return (
    <div className="service col-12">
      <ReportHeader title={t("productWiseProfitLoss.title")} />

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            allowClear
            placeholder={t("productWiseProfitLoss.searchPlaceholder")}
            prefix={<Search size={14} style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          <DatePicker
            picker="month"
            placeholder={t("filter.period")}
            value={fromDate ? dayjs(fromDate) : null}
            onChange={handlePeriodChange}
            format="YYYY-MM"
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
            onClick={() => exportToCSV(mappedData, "ProductWiseProfitLoss")}
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

export default ProductWiseProfitLoss;
