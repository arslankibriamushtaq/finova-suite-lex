import { useEffect, useMemo, useState } from "react";
import TableView from "../TableView/TableView";
import { AlertTriangle } from "lucide-react";
import { Col, DatePicker, Input, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { getNplReport } from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const PerformingLoans = () => {
  const { t } = useTranslation("reports");
  const [asOfDate, setAsOfDate] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Send asOfDate only when the user has picked one; otherwise hit the bare
      // endpoint (matches the curl shape).
      const finalDate = asOfDate ? asOfDate.format("YYYY-MM-DD") : undefined;
      const res = await getNplReport(finalDate);
      if (res && res.data) {
        setReportData(res.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching NPL report:", error);
      toast.error(error?.message || t("performingLoans.toast.fetchError"));
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asOfDate]);

  const formatNumber = (n: any) => {
    if (n === null || n === undefined || n === "") return "-";
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const buckets = useMemo(() => {
    const all = reportData?.buckets || [];
    if (!debouncedSearch) return all;
    const term = debouncedSearch.toLowerCase();
    return all.filter((row: any) =>
      String(row.bucket || "").toLowerCase().includes(term)
    );
  }, [reportData, debouncedSearch]);

  // Totals derived from the currently-visible (filtered) buckets so the summary
  // matches what's in the table.
  const visibleTotals = useMemo(() => {
    const filteredOutstanding = buckets.reduce(
      (acc: number, r: any) => acc + Number(r.outstanding ?? 0),
      0
    );
    return { bucketCount: buckets.length, filteredOutstanding };
  }, [buckets]);

  const columns = [
    {
      name: t("performingLoans.col.agingBucket"),
      selector: (row: any) => row.bucket,
      sortable: true,
    },
    {
      name: t("performingLoans.col.outstandingAmount"),
      cell: (row: any) => (
        <span>
          {formatNumber(row.outstanding)} SAR
        </span>
      ),
      sortable: true,
    },
  ];

  const exportToCSV = () => {
    if (!buckets.length) {
      toast.error(t("toast.noExportData"));
      return;
    }
    const headers = ["Aging Bucket", "Outstanding (SAR)"];
    const rows = buckets.map((r: any) =>
      [r.bucket, r.outstanding ?? 0]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `NPL_Report_${dayjs().format("YYYYMMDD")}.csv`);
  };

  return (
    <div className="service col-12">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <AlertTriangle className="h-4 w-4" />
          </span>
          {t("performingLoans.title")}
        </h3>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
        <Input
          allowClear
          placeholder={t("performingLoans.searchPlaceholder")}
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
        />
        <DatePicker
          placeholder={t("filter.asOfDate")}
          value={asOfDate}
          onChange={(d) => setAsOfDate(d)}
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
          onClick={exportToCSV}
          disabled={!buckets.length}
          style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {t("action.exportCsv")}
        </button>
        </div>
      </div>

      {reportData && (
        <Row gutter={[16, 16]} className="mb-3">
          <Col xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t("performingLoans.summary.totalOutstanding")}</div>
              <div
                className="mt-2"
                style={{ fontSize: 22, fontWeight: 700 }}
              >
                {formatNumber(reportData.totalOutstanding)} SAR
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t("performingLoans.summary.nplOutstanding")}</div>
              <div
                className="mt-2"
                style={{ fontSize: 22, fontWeight: 700 }}
              >
                {formatNumber(reportData.nplOutstanding)} SAR
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t("performingLoans.summary.nplRatio")}</div>
              <div
                className="mt-2"
                style={{ fontSize: 22, fontWeight: 700 }}
              >
                {reportData.nplRatio ?? 0}%
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t("performingLoans.summary.filteredBuckets")}</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {visibleTotals.bucketCount}
              </div>
            </div>
          </Col>
        </Row>
      )}

      <div className="cs-table p-0 bg-white rounded shadow-sm overflow-hidden">
        <TableView
          header={columns}
          data={buckets}
          isLoading={loading}
          totalRows={buckets.length}
          pageSize={buckets.length || 10}
          page={1}
          setPage={() => { }}
          setPageSize={() => { }}
          from={buckets.length > 0 ? 1 : 0}
          to={buckets.length}
        />
      </div>
    </div>
  );
};

export default PerformingLoans;
