import { useEffect, useState } from "react";
import { DatePicker } from "antd";
import { CalendarClock } from "lucide-react";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import TableView from "../TableView/TableView";
import { getDpdBucketsReport } from "../../redux/apis/apisCrudLms";
import { ledgerErrorMessage } from "../../utils/ledgerErrors";
import ReportHeader from "./ReportHeader";

const formatNumber = (n: any) => {
  if (n === null || n === undefined || n === "") return "-";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Days-past-due ageing buckets.
 *
 * Not currency-aware yet: on a multi-currency portfolio the outstanding column
 * is a sum across currencies, so treat it as provisional. The note on screen
 * says so rather than letting a reader assume otherwise.
 */
const DpdBucketsReport = () => {
  const { t } = useTranslation("reports");
  const [date, setDate] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getDpdBucketsReport(date ? date.format("YYYY-MM-DD") : undefined);
      setData(res?.data?.data ?? null);
    } catch (error: any) {
      toast.error(ledgerErrorMessage(error, t("dpdBuckets.toast.fetchError")));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const buckets: any[] = Array.isArray(data) ? data : (data?.buckets ?? []);

  const columns = [
    {
      name: t("dpdBuckets.col.bucket"),
      selector: (row: any) => row.bucket ?? row.name ?? "-",
      sortable: true,
    },
    {
      name: t("dpdBuckets.col.loanCount"),
      selector: (row: any) => row.loanCount ?? row.count ?? "-",
      sortable: true,
    },
    {
      name: t("dpdBuckets.col.outstanding"),
      cell: (row: any) => <span>{formatNumber(row.outstanding ?? row.amount)}</span>,
      sortable: true,
    },
  ];

  const exportToCSV = () => {
    if (!buckets.length) {
      toast.error(t("toast.noExportData"));
      return;
    }
    const csv = [
      ["Bucket", "Loan Count", "Outstanding"].join(","),
      ...buckets.map((r: any) =>
        [r.bucket ?? r.name, r.loanCount ?? r.count, r.outstanding ?? r.amount]
          .map((v) => `"${String(v ?? "")}"`)
          .join(",")
      ),
    ].join("\n");
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `DPD_Buckets_${dayjs().format("YYYYMMDD")}.csv`
    );
  };

  return (
    <div className="service col-12">
      <ReportHeader icon={<CalendarClock className="h-4 w-4" />} title={t("dpdBuckets.title")} />

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
            disabled={!buckets.length}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {t("action.exportCsv")}
          </button>
        </div>
        <p className="mb-0 mt-2 text-xs text-muted-foreground">{t("notCurrencyAware")}</p>
      </div>

      <div className="pro-card">
        <TableView
          header={columns}
          data={buckets}
          isLoading={loading}
          totalRows={buckets.length}
          pageSize={buckets.length || 10}
          page={1}
          setPage={() => {}}
          setPageSize={() => {}}
          from={buckets.length ? 1 : 0}
          to={buckets.length}
        />
      </div>
    </div>
  );
};

export default DpdBucketsReport;
