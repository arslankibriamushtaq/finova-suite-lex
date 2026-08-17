import { useEffect, useState } from "react";
import { DatePicker } from "antd";
import { Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import TableView from "../TableView/TableView";
import CurrencySelect from "./CurrencySelect";
import { getPortfolioSummaryReport } from "../../redux/apis/apisCrudLms";
import { ledgerErrorMessage } from "../../utils/ledgerErrors";
import ReportHeader from "./ReportHeader";

const { RangePicker } = DatePicker;

const formatNumber = (n: any) => {
  if (n === null || n === undefined || n === "") return "-";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Portfolio summary — one currency at a time.
 *
 * A portfolio spanning currencies has no single size, so the server requires a
 * currency and the figures below belong to that currency alone. To compare two,
 * open the report twice; never add the totals.
 */
const PortfolioSummaryReport = () => {
  const { t } = useTranslation("reports");
  const [currency, setCurrency] = useState("SAR");
  const [range, setRange] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getPortfolioSummaryReport(
        currency,
        range?.[0] ? range[0].format("YYYY-MM-DD") : undefined,
        range?.[1] ? range[1].format("YYYY-MM-DD") : undefined
      );
      setData(res?.data?.data ?? null);
    } catch (error: any) {
      toast.error(ledgerErrorMessage(error, t("portfolioSummary.toast.fetchError")));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, range]);

  // The response echoes the currency it was computed in.
  const reportCurrency = data?.currency || currency;

  // Every numeric field the summary returns, rendered as rows so a new field
  // from the backend shows up without a code change.
  const rows = data
    ? Object.entries(data)
        .filter(([key, value]) => key !== "currency" && typeof value === "number")
        .map(([key, value]) => ({ metric: key, value }))
    : [];

  const columns = [
    {
      name: t("portfolioSummary.col.metric"),
      selector: (row: any) =>
        // Backend keys are camelCase; turn them into words for display.
        String(row.metric)
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (c: string) => c.toUpperCase()),
    },
    {
      name: t("portfolioSummary.col.value"),
      cell: (row: any) => (
        <b>
          {formatNumber(row.value)} {reportCurrency}
        </b>
      ),
    },
  ];

  const exportToCSV = () => {
    if (!rows.length) {
      toast.error(t("toast.noExportData"));
      return;
    }
    const csv = [
      ["Metric", "Value", "Currency"].join(","),
      ...rows.map((r: any) => [`"${r.metric}"`, r.value, reportCurrency].join(",")),
    ].join("\n");
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `Portfolio_Summary_${dayjs().format("YYYYMMDD")}_${reportCurrency}.csv`
    );
  };

  return (
    <div className="service col-12">
      <ReportHeader
        icon={<Briefcase className="h-4 w-4" />}
        title={t("portfolioSummary.title")}
        suffix={reportCurrency}
      />

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <RangePicker
            value={range}
            onChange={(v) => setRange(v)}
            format="YYYY-MM-DD"
            style={{ flex: "1 1 280px", minWidth: 240, height: 40, borderRadius: 2 }}
          />
          <CurrencySelect value={currency} onChange={setCurrency} />
          <button
            type="button"
            className="theme-btn-next"
            onClick={fetchData}
            disabled={loading}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {loading ? t("common:loading") : t("common:refresh")}
          </button>
          <button
            type="button"
            className="theme-btn-next"
            onClick={exportToCSV}
            disabled={!rows.length}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {t("action.exportCsv")}
          </button>
        </div>
      </div>

      <div className="pro-card">
        <TableView
          header={columns}
          data={rows}
          isLoading={loading}
          totalRows={rows.length}
          pageSize={rows.length || 10}
          page={1}
          setPage={() => {}}
          setPageSize={() => {}}
          from={rows.length ? 1 : 0}
          to={rows.length}
        />
      </div>
    </div>
  );
};

export default PortfolioSummaryReport;
