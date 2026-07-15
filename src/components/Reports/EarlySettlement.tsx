import { useEffect, useState, useMemo } from "react";
import TableView from "../TableView/TableView";
import { BadgeCheck } from "lucide-react";
import { Col, DatePicker, Input, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import {
  getEarlySettlementReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const EarlySettlement = () => {
  const { t } = useTranslation("reports");
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
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

  // Debounce search
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
      // Only send dates when the user picks them; otherwise hit the bare endpoint.
      const params: any = {};
      if (fromDate) params.fromDate = fromDate.format("YYYY-MM-DD");
      if (toDate) params.toDate = toDate.format("YYYY-MM-DD");

      const res = await getEarlySettlementReport(
        Object.keys(params).length ? params : undefined
      );

      if (res && res.data) {
        const responseData = res.data.data ?? res.data;
        const items =
          responseData?.items ||
          responseData?.settlements ||
          (Array.isArray(responseData) ? responseData : []);
        setAllCallActivity(Array.isArray(items) ? items : []);
      }
    } catch (error: any) {
      toast.error(error?.message || t("earlySettlement.toast.fetchError"));
      setAllCallActivity([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  const formatDate = (isoString: any) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return String(isoString);
    return date.toISOString().split("T")[0];
  };

  const formatNumber = (n: any) => {
    if (n === null || n === undefined || n === "") return "-";
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const mappedData = useMemo(() => {
    const all = (allCallActivity || []).map((item: any) => ({
      loanId: item.loanId || "-",
      customerName: item.customerName || "-",
      facilityType: item.facilityType || "-",
      originalAmount: item.originalAmount ?? 0,
      settlementAmount: item.settlementAmount ?? 0,
      rebateAmount: item.rebateAmount ?? 0,
      profitSaved: item.profitSaved ?? 0,
      settlementDate: item.settlementDate || null,
      status: item.status || "-",
    }));

    if (!debouncedSearch) return all;
    const term = debouncedSearch.toLowerCase();
    return all.filter((row: any) =>
      String(row.loanId).toLowerCase().includes(term) ||
      String(row.customerName).toLowerCase().includes(term) ||
      String(row.facilityType).toLowerCase().includes(term) ||
      String(row.status).toLowerCase().includes(term)
    );
  }, [allCallActivity, debouncedSearch]);

  // Derive totals from the visible (filtered) rows
  const visibleTotals = useMemo(() => {
    return mappedData.reduce(
      (acc: any, r: any) => ({
        settledCount: acc.settledCount + 1,
        totalSettlementAmount: acc.totalSettlementAmount + Number(r.settlementAmount ?? 0),
        totalRebateAmount: acc.totalRebateAmount + Number(r.rebateAmount ?? 0),
      }),
      { settledCount: 0, totalSettlementAmount: 0, totalRebateAmount: 0 }
    );
  }, [mappedData]);

  // Client-side pagination
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return mappedData.slice(start, start + pageSize);
  }, [mappedData, page, pageSize]);

  // Sync totalRows / totalPage / from / to with the filtered set
  useEffect(() => {
    const total = mappedData.length;
    setTotalRows(total);
    setTotalPage(Math.max(1, Math.ceil(total / pageSize)));
    setFrom(total > 0 ? (page - 1) * pageSize + 1 : 0);
    setTo(Math.min(page * pageSize, total));
  }, [mappedData, page, pageSize]);

  const Call_Activity_Header = [
    { name: t("earlySettlement.col.customerName"), selector: (row: any) => row.customerName },
    {
      name: t("earlySettlement.col.originalAmount"),
      cell: (row: any) => <span>{formatNumber(row.originalAmount)}</span>,
    },
    {
      name: t("earlySettlement.col.settlementAmount"),
      cell: (row: any) => <span>{formatNumber(row.settlementAmount)}</span>,
    },
    {
      name: t("earlySettlement.col.rebateDiscount"),
      cell: (row: any) => (
        <span className="text-success">{formatNumber(row.rebateAmount)}</span>
      ),
    },
    {
      name: t("earlySettlement.col.profitSaved"),
      cell: (row: any) => <span>{formatNumber(row.profitSaved)}</span>,
    },
    {
      name: t("earlySettlement.col.settlementDate"),
      selector: (row: any) => formatDate(row.settlementDate),
    },
    {
      name: t("common:status"),
      cell: (row: any) => {
        const color = String(row.status || "").toLowerCase() === "settled"
          ? "rgba(63,195,128,0.9)"
          : "#6c757d";
        return (
          <div
            style={{
              padding: "6px 12px",
              borderRadius: "2px",
              fontSize: "11px",
              backgroundColor: color,
              color: "white",
              display: "inline-block",
              fontWeight: 600,
            }}
          >
            {row.status}
          </div>
        );
      },
    },
  ];

  const exportToCSV = () => {
    if (!mappedData.length) {
      toast.error(t("toast.noExportData"));
      return;
    }
    const csvHeaders = [
      "Customer Name", "Original Amount", "Settlement Amount",
      "Rebate / Discount", "Profit Saved", "Settlement Date", "Status",
    ];
    const csvRows = [csvHeaders.join(",")];
    mappedData.forEach((r: any) => {
      const values = [
        r.customerName,
        r.originalAmount ?? 0,
        r.settlementAmount ?? 0,
        r.rebateAmount ?? 0,
        r.profitSaved ?? 0,
        formatDate(r.settlementDate),
        r.status,
      ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`);
      csvRows.push(values.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `EarlySettlements_${dayjs().format("YYYYMMDD")}.csv`);
  };

  return (
    <div className="service col-12">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <BadgeCheck className="h-4 w-4" />
          </span>
          {t("earlySettlement.title")}
        </h3>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
        <Input
          allowClear
          placeholder={t("earlySettlement.searchPlaceholder")}
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
          onClick={exportToCSV}
          disabled={!mappedData.length}
          style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {t("action.exportCsv")}
        </button>
        </div>
      </div>

      {(allCallActivity?.length > 0) && (
        <Row gutter={[16, 16]} className="mb-3">
          <Col xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t("earlySettlement.summary.totalSettlementValue")}</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {formatNumber(visibleTotals.totalSettlementAmount)} SAR
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t("earlySettlement.summary.totalRebatesGiven")}</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {formatNumber(visibleTotals.totalRebateAmount)} SAR
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t("earlySettlement.summary.settledLoansCount")}</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {visibleTotals.settledCount}
              </div>
            </div>
          </Col>
        </Row>
      )}

      <div
        className="pro-card"
      >
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
  );
};

export default EarlySettlement;
