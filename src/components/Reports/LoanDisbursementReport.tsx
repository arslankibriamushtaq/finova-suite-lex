import { useEffect, useMemo, useState } from "react";
import { Col, DatePicker, Input, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TableView from "../TableView/TableView";
import { Banknote } from "lucide-react";
import { getLoanDisbursementReport } from "../../redux/apis/apisCrudLms";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ReportHeader from "./ReportHeader";

const LoanDisbursementReport = () => {
  const { t } = useTranslation("reports");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [reportData, setReportData] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState<any>(null);
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

  const extractItems = (root: any): { items: any[]; inner: any } => {
    const inner = root?.data ?? root;
    const items: any[] = Array.isArray(inner?.items)
      ? inner.items
      : Array.isArray(inner)
        ? inner
        : [];
    return { items, inner };
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Only send dates when the user picks them; otherwise hit the bare endpoint.
      const baseParams: any = {};
      if (fromDate) baseParams.fromDate = fromDate.format("YYYY-MM-DD");
      if (toDate) baseParams.toDate = toDate.format("YYYY-MM-DD");

      // Backend caps each response at ~20 rows even when we ask for more, so
      // walk every page returned in `pagination.totalPages` and concatenate.
      const firstParams = { ...baseParams, page: 0, size: 100 };
      const firstRes = await getLoanDisbursementReport(firstParams);
      const firstRoot = firstRes?.data;
      const firstParsed = extractItems(firstRoot);
      let combined: any[] = [...firstParsed.items];

      const pagination = firstRoot?.pagination;
      const totalPagesFromApi = Number(pagination?.totalPages) || 1;

      if (totalPagesFromApi > 1) {
        const remaining = await Promise.all(
          Array.from({ length: totalPagesFromApi - 1 }, (_, i) =>
            getLoanDisbursementReport({ ...baseParams, page: i + 1, size: 100 })
              .then((r) => extractItems(r?.data).items)
              .catch(() => [])
          )
        );
        combined = combined.concat(...remaining);
      }

      const inner = firstParsed.inner;
      setReportData(combined);
      setTotals(
        inner && typeof inner === "object" && !Array.isArray(inner)
          ? { ...inner, items: combined }
          : null
      );
    } catch (error: any) {
      console.error("Error fetching disbursement report:", error);
      toast.error(error?.message || t("loanDisbursement.toast.fetchError"));
      setReportData([]);
      setTotals(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  const formatNumber = (n: any) => {
    if (n === null || n === undefined || n === "") return "-";
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Filter the rows by search term
  const filteredData = useMemo(() => {
    if (!debouncedSearch) return reportData;
    const term = debouncedSearch.toLowerCase();
    return reportData.filter(
      (row: any) =>
        String(row.applicationNumber || "")
          .toLowerCase()
          .includes(term) ||
        String(row.customerName || row.name || "")
          .toLowerCase()
          .includes(term) ||
        String(row.productName || row.productCode || "")
          .toLowerCase()
          .includes(term) ||
        String(row.branchName || row.branch || "")
          .toLowerCase()
          .includes(term) ||
        String(row.status || "")
          .toLowerCase()
          .includes(term)
    );
  }, [reportData, debouncedSearch]);

  // Visible totals derived from the filtered set so cards match the table
  const visibleTotals = useMemo(() => {
    const totalAmount = filteredData.reduce(
      (acc: number, r: any) => acc + Number(r.amount ?? r.disbursedAmount ?? 0),
      0
    );
    return { totalAmount, totalCount: filteredData.length };
  }, [filteredData]);

  // Client-side pagination on the filtered set
  const totalRows = filteredData.length;
  const totalPage = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const fromRow = totalRows > 0 ? startIndex + 1 : 0;
  const toRow = Math.min(endIndex, totalRows);

  const columns = [
    {
      name: t("loanDisbursement.col.applicationNo"),
      selector: (row: any) => row.applicationNumber || "-",
    },
    {
      name: t("loanDisbursement.col.customerName"),
      selector: (row: any) => row.customerName || row.name || "-",
    },
    {
      name: t("loanDisbursement.col.disbursementDate"),
      cell: (row: any) =>
        row.disbursementDate || row.date
          ? dayjs(row.disbursementDate || row.date).format("YYYY-MM-DD")
          : "-",
    },
    {
      name: t("common:amount"),
      cell: (row: any) => <b>{formatNumber(row.amount ?? row.disbursedAmount ?? 0)} SAR</b>,
    },
    {
      name: t("loanDisbursement.col.product"),
      selector: (row: any) => row.productName || row.productCode || "-",
    },
    {
      name: t("loanDisbursement.col.branch"),
      selector: (row: any) => row.branchName || row.branch || "-",
    },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "32px",
            fontSize: "12px",
            fontWeight: 500,
            backgroundColor:
              row.status === "DISBURSED" ? "var(--color-status-green)" : "var(--color-status-blue)",
            color: "var(--primary-foreground)",
          }}
        >
          {row.status || "-"}
        </span>
      ),
    },
  ];

  const exportToCSV = () => {
    if (!filteredData.length) {
      toast.error(t("toast.noExportData"));
      return;
    }
    const headers = [
      "Application No",
      "Customer Name",
      "Date",
      "Amount",
      "Product",
      "Branch",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredData.map((item: any) =>
        [
          item.applicationNumber || "",
          item.customerName || item.name || "",
          item.disbursementDate || item.date || "",
          item.amount ?? item.disbursedAmount ?? 0,
          item.productName || item.productCode || "",
          item.branchName || item.branch || "",
          item.status || "",
        ]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Loan_Disbursement_Report_${dayjs().format("YYYYMMDD")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="service col-12">
      <ReportHeader icon={<Banknote className="h-4 w-4" />} title={t("loanDisbursement.title")} />

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <Input
            allowClear
            placeholder={t("loanDisbursement.searchPlaceholder")}
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
            disabled={!filteredData.length}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {t("action.exportCsv")}
          </button>
        </div>
      </div>

      {(reportData.length > 0 || totals) && (
        <Row gutter={[16, 16]} className="mb-3">
          <Col xs={24} sm={12} lg={12}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {t("loanDisbursement.summary.totalDisbursedAmount")}
              </div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {formatNumber(visibleTotals.totalAmount)} SAR
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={12}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {t("loanDisbursement.summary.totalLoanCount")}
              </div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {visibleTotals.totalCount}
              </div>
            </div>
          </Col>
        </Row>
      )}

      <div className="pro-card">
        <TableView
          header={columns}
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          totalPage={totalPage}
          from={fromRow}
          to={toRow}
          data={paginatedData}
          isLoading={loading}
          paginationShow={true}
        />
      </div>
    </div>
  );
};

export default LoanDisbursementReport;
