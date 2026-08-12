import { useEffect, useState } from "react";
import { DatePicker, Button } from "antd";
import { TrendingUp } from "lucide-react";
import TableView from "../TableView/TableView";
import { getCashFlowReport } from "../../redux/apis/apisCrudLms";
import { ledgerErrorMessage } from "../../utils/ledgerErrors";
import CurrencySelect from "./CurrencySelect";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const CashFlowReport = () => {
  const { t } = useTranslation("reports");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [reportData, setReportData] = useState<any>([]);
  const [date, setDate] = useState<any>(null);
  // One report is one currency — the server refuses to sum across them.
  const [currency, setCurrency] = useState("SAR");
  const [loading, setLoading] = useState(false);

  const [totals, setTotals] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, [page, pageSize, date, currency]);

  // The response echoes the currency it was computed in — trust that over the
  // selector, which may have moved on since the fetch.
  const reportCurrency = totals?.currency || currency;

  const columns = [
    {
      name: t('cashFlow.col.metric'),
      selector: (row: any) => row.metric || "-",
    },
    {
      name: t('cashFlow.col.value'),
      selector: (row: any) => row.value || 0,
      cell: (row: any) => (
        <b>{row.value != null ? `${Number(row.value).toLocaleString()} ${reportCurrency}` : "-"}</b>
      )
    },
  ];

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const finalDate = date ? date.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
      const response = await getCashFlowReport(finalDate, currency);
      if (response && response.data) {
        const data = response.data.data;

        if (data && !Array.isArray(data)) {
          // It's a summary object
          setTotals(data);
          const summaryRows = [
            { metric: t('cashFlow.summary.totalInflows'), value: data.totalInflows },
            { metric: t('cashFlow.summary.totalOutflows'), value: data.totalOutflows },
            { metric: t('cashFlow.summary.netPosition'), value: data.netPosition },
            { metric: t('cashFlow.summary.bankBalance'), value: data.bankBalance },
          ];
          setReportData(summaryRows);
          setTotalRows(summaryRows.length);
        } else {
          // It's a list or empty
          setReportData(Array.isArray(data) ? data : []);
          setTotals(null);
          setTotalRows(Array.isArray(data) ? data.length : 0);
        }

        const calculatedFrom = totalRows > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalRows);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
      }
    } catch (error: any) {
      console.error("Error fetching cash flow report:", error);
      toast.error(ledgerErrorMessage(error, t('cashFlow.toast.fetchError')));
      setReportData([]);
      setTotals(null);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData || reportData.length === 0) {
      toast.error(t('toast.noExportData'));
      return;
    }

    const headers = ["Metric", "Value", "Currency"];
    const csvContent = [
      headers.join(","),
      ...reportData.map((item: any) => [
        `"${item.metric || ""}"`,
        item.value || 0,
        reportCurrency,
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Cash_Flow_Report_${(date || dayjs()).format("YYYY_MM_DD")}_${reportCurrency}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="service cash-flow-report-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <TrendingUp className="h-4 w-4" />
          </span>
          {t('cashFlow.title')}
          <span className="fs-6 fw-normal text-muted">· {reportCurrency}</span>
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <DatePicker
            onChange={(d) => setDate(d)}
            format="YYYY-MM-DD"
            placeholder={t('common:date')}
            style={{ flex: "1 1 200px", minWidth: 180, height: 40, borderRadius: 2, background: "#fff" }}
          />
          <CurrencySelect value={currency} onChange={setCurrency} />
          <Button
            className="theme-btn-next"
            onClick={fetchReportData}
            loading={loading}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {t('cashFlow.fetchReport')}
          </Button>
          <Button
            className="theme-btn-next"
            onClick={exportToCSV}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {t('action.exportCsv')}
          </Button>
        </div>
      </div>

      {totals && (
        <div className="row mb-3 g-3">
          <div className="col-md-3 col-sm-6">
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t('cashFlow.summary.totalInflows')}</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {totals.totalInflows?.toLocaleString()} <span style={{ fontSize: 14 }}>{reportCurrency}</span>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t('cashFlow.summary.totalOutflows')}</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {totals.totalOutflows?.toLocaleString()} <span style={{ fontSize: 14 }}>{reportCurrency}</span>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t('cashFlow.summary.netPosition')}</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {totals.netPosition?.toLocaleString()} <span style={{ fontSize: 14 }}>{reportCurrency}</span>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t('cashFlow.summary.bankBalance')}</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {totals.bankBalance?.toLocaleString()} <span style={{ fontSize: 14 }}>{reportCurrency}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="pro-card"
      >
        <TableView
          header={columns}
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          from={from}
          to={to}
          data={reportData}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default CashFlowReport;
