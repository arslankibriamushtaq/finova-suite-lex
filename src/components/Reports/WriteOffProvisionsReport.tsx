import { useEffect, useState } from "react";
import { DatePicker } from "antd";
import { ShieldOff } from "lucide-react";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import TableView from "../TableView/TableView";
import CurrencySelect from "./CurrencySelect";
import { getWriteOffProvisionsReport } from "../../redux/apis/apisCrudLms";
import { ledgerErrorMessage } from "../../utils/ledgerErrors";

const formatNumber = (n: any) => {
  if (n === null || n === undefined || n === "") return "-";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Write-off provisions, per currency and per month.
 *
 * Distinct from the Write-Off Loans report: this is the provision the ledger
 * carries, that one is the loans actually written off.
 */
const WriteOffProvisionsReport = () => {
  const { t } = useTranslation("reports");
  const [currency, setCurrency] = useState("SAR");
  const [period, setPeriod] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getWriteOffProvisionsReport(
        currency,
        period ? period.format("YYYY-MM") : undefined
      );
      setData(res?.data?.data ?? null);
    } catch (error: any) {
      toast.error(ledgerErrorMessage(error, t("writeOffProvisions.toast.fetchError")));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, period]);

  const reportCurrency = data?.currency || currency;

  // The endpoint may answer with a list of provisions or a single summary
  // object; render whichever came back rather than guessing one shape.
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.provisions)
      ? data.provisions
      : Array.isArray(data?.items)
        ? data.items
        : null;

  const summaryRows = data && !list
    ? Object.entries(data)
        .filter(([key, value]) => key !== "currency" && typeof value === "number")
        .map(([key, value]) => ({ metric: key, value }))
    : [];

  const rows = list ?? summaryRows;

  const columns = list
    ? [
        {
          name: t("writeOffProvisions.col.account"),
          selector: (row: any) => row.accountCode || row.accountName || "-",
        },
        {
          name: t("writeOffProvisions.col.description"),
          selector: (row: any) => row.description || row.accountName || "-",
        },
        {
          name: t("writeOffProvisions.col.amount"),
          cell: (row: any) => (
            <b>
              {formatNumber(row.amount ?? row.provisionAmount)} {reportCurrency}
            </b>
          ),
        },
      ]
    : [
        {
          name: t("writeOffProvisions.col.metric"),
          selector: (row: any) =>
            String(row.metric)
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (c: string) => c.toUpperCase()),
        },
        {
          name: t("writeOffProvisions.col.amount"),
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
      Object.keys(rows[0]).join(",") + ",Currency",
      ...rows.map((r: any) =>
        [...Object.values(r).map((v) => `"${String(v ?? "")}"`), reportCurrency].join(",")
      ),
    ].join("\n");
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `Write_Off_Provisions_${dayjs().format("YYYYMMDD")}_${reportCurrency}.csv`
    );
  };

  return (
    <div className="service col-12">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <ShieldOff className="h-4 w-4" />
          </span>
          {t("writeOffProvisions.title")}
          <span className="fs-6 fw-normal text-muted">· {reportCurrency}</span>
        </h3>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <DatePicker
            value={period}
            onChange={(d) => setPeriod(d)}
            picker="month"
            format="YYYY-MM"
            placeholder={t("filter.period")}
            style={{ flex: "1 1 200px", minWidth: 180, height: 40, borderRadius: 2 }}
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

export default WriteOffProvisionsReport;
