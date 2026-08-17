import { useEffect, useState } from "react";
import { DatePicker } from "antd";
import { Scale } from "lucide-react";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import TableView from "../TableView/TableView";
import { getReconciliationDetailReport } from "../../redux/apis/apisCrudLms";
import { ledgerErrorMessage } from "../../utils/ledgerErrors";
import ReportHeader from "./ReportHeader";

const formatNumber = (n: any) => {
  if (n === null || n === undefined || n === "") return "-";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/** Line-by-line reconciliation for one day. */
const ReconciliationDetailReport = () => {
  const { t } = useTranslation("reports");
  const [date, setDate] = useState<any>(dayjs());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getReconciliationDetailReport(date ? date.format("YYYY-MM-DD") : undefined);
      setData(res?.data?.data ?? null);
    } catch (error: any) {
      toast.error(ledgerErrorMessage(error, t("reconciliationDetail.toast.fetchError")));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const rows: any[] = Array.isArray(data)
    ? data
    : (data?.items ?? data?.details ?? data?.entries ?? []);

  const columns = [
    {
      name: t("reconciliationDetail.col.account"),
      cell: (row: any) => (
        <div className="d-flex flex-column">
          <span className="font-monospace small">{row.accountCode || "-"}</span>
          <span>{row.accountName || ""}</span>
        </div>
      ),
    },
    {
      name: t("reconciliationDetail.col.currency"),
      selector: (row: any) => row.currency || "-",
    },
    {
      name: t("reconciliationDetail.col.ledgerBalance"),
      cell: (row: any) => (
        <span>
          {formatNumber(row.ledgerBalance ?? row.glBalance)} {row.currency || ""}
        </span>
      ),
    },
    {
      name: t("reconciliationDetail.col.externalBalance"),
      cell: (row: any) => (
        <span>
          {formatNumber(row.externalBalance ?? row.bankBalance)} {row.currency || ""}
        </span>
      ),
    },
    {
      name: t("reconciliationDetail.col.difference"),
      cell: (row: any) => {
        const diff = Number(row.difference ?? 0);
        return (
          <b
            style={{
              color: diff === 0 ? "var(--color-status-green)" : "var(--color-status-red)",
            }}
          >
            {formatNumber(diff)} {row.currency || ""}
          </b>
        );
      },
    },
  ];

  const exportToCSV = () => {
    if (!rows.length) {
      toast.error(t("toast.noExportData"));
      return;
    }
    const csv = [
      ["Account Code", "Account Name", "Currency", "Ledger", "External", "Difference"].join(","),
      ...rows.map((r: any) =>
        [
          r.accountCode,
          r.accountName,
          r.currency,
          r.ledgerBalance ?? r.glBalance,
          r.externalBalance ?? r.bankBalance,
          r.difference,
        ]
          .map((v) => `"${String(v ?? "")}"`)
          .join(",")
      ),
    ].join("\n");
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `Reconciliation_Detail_${date ? date.format("YYYYMMDD") : dayjs().format("YYYYMMDD")}.csv`
    );
  };

  return (
    <div className="service col-12">
      <ReportHeader icon={<Scale className="h-4 w-4" />} title={t("reconciliationDetail.title")} />

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <DatePicker
            value={date}
            onChange={(d) => setDate(d)}
            format="YYYY-MM-DD"
            placeholder={t("common:date")}
            style={{ flex: "1 1 200px", minWidth: 180, height: 40, borderRadius: 2 }}
          />
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

export default ReconciliationDetailReport;
