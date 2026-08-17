import { useEffect, useState } from "react";
import { Col, DatePicker, Row } from "antd";
import { HandCoins } from "lucide-react";
import { getCollectionsReport } from "../../redux/apis/apisCrudLms";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ReportHeader from "./ReportHeader";

const CollectionReport = () => {
  const { t } = useTranslation("reports");
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState<any>(null);

  useEffect(() => {
    fetchCollectionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  const fetchCollectionData = async () => {
    try {
      setLoading(true);
      // Send from/to only when the user picks them; otherwise hit the bare
      // endpoint (matches the curl shape).
      const start = fromDate ? fromDate.format("YYYY-MM-DD") : undefined;
      const end = toDate ? toDate.format("YYYY-MM-DD") : undefined;
      const response = await getCollectionsReport(start, end);
      const data = response?.data?.data;
      if (data && !Array.isArray(data)) {
        setTotals(data);
      } else {
        setTotals(null);
      }
    } catch (error: any) {
      console.error("Error fetching collection report:", error);
      toast.error(error?.message || t("collection.toast.fetchError"));
      setTotals(null);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (n: any) => {
    if (n === null || n === undefined || n === "") return "-";
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const exportToCSV = () => {
    if (!totals) {
      toast.error(t("toast.noExportData"));
      return;
    }

    const rows = [
      { metric: "Total Collected", value: `${totals.totalCollected ?? 0} SAR` },
      { metric: "On-Time Rate", value: `${totals.onTimeRate ?? 0}%` },
      { metric: "Collection Count", value: `${totals.collectionCount ?? 0}` },
    ];

    const csvContent = [
      ["Metric", "Value"].join(","),
      ...rows.map((r) => [`"${r.metric}"`, `"${r.value}"`].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Collection_Report_${dayjs().format("YYYYMMDD")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="service col-12">
      <ReportHeader icon={<HandCoins className="h-4 w-4" />} title={t("collection.title")} />

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <DatePicker
            placeholder={t("common:from")}
            value={fromDate}
            onChange={(d) => setFromDate(d)}
            format="YYYY-MM-DD"
            allowClear
            style={{
              flex: "1 1 240px",
              minWidth: 200,
              height: 40,
              borderRadius: 2,
              background: "#fff",
            }}
          />
          <DatePicker
            placeholder={t("common:to")}
            value={toDate}
            onChange={(d) => setToDate(d)}
            format="YYYY-MM-DD"
            allowClear
            style={{
              flex: "1 1 240px",
              minWidth: 200,
              height: 40,
              borderRadius: 2,
              background: "#fff",
            }}
          />
          <button
            type="button"
            className="theme-btn-next"
            onClick={fetchCollectionData}
            disabled={loading}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {loading ? t("common:loading") : t("common:refresh")}
          </button>
          <button
            type="button"
            className="theme-btn-next"
            onClick={exportToCSV}
            disabled={!totals}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {t("action.exportCsv")}
          </button>
        </div>
      </div>

      {totals ? (
        <Row gutter={[16, 16]} className="mb-3">
          <Col xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {t("collection.summary.totalCollected")}
              </div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {formatNumber(totals.totalCollected ?? 0)} SAR
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {t("collection.summary.onTimeRate")}
              </div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {totals.onTimeRate ?? 0}%
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {t("collection.summary.collectionCount")}
              </div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {totals.collectionCount ?? 0}
              </div>
            </div>
          </Col>
        </Row>
      ) : (
        !loading && <div className="text-center py-5 text-muted">{t("collection.noDataRange")}</div>
      )}
    </div>
  );
};

export default CollectionReport;
