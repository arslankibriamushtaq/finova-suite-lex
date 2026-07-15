import { useEffect, useMemo, useState } from "react";
import TableView from "../TableView/TableView";
import { CalendarX } from "lucide-react";
import { Col, Input, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { getOverdueLoansReport } from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const OverDue = () => {
  const { t } = useTranslation("reports");
  const [rows, setRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

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

  useEffect(() => {
    fetchReport();
  }, []);

  const extractItems = (root: any): { items: any[]; inner: any } => {
    const inner = root?.data;
    const items: any[] = Array.isArray(root)
      ? root
      : Array.isArray(inner)
        ? inner
        : Array.isArray(inner?.items)
          ? inner.items
          : Array.isArray(inner?.loans)
            ? inner.loans
            : Array.isArray(inner?.overdueLoans)
              ? inner.overdueLoans
              : Array.isArray(inner?.data)
                ? inner.data
                : [];
    return { items, inner };
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      // Backend may cap each page, so walk every page and concatenate so we
      // surface every overdue loan that the API returns.
      const firstRes = await getOverdueLoansReport(undefined, undefined, undefined, 0, 100);
      const firstRoot = firstRes?.data;
      const firstParsed = extractItems(firstRoot);
      let combined: any[] = [...firstParsed.items];

      const pagination = firstRoot?.pagination;
      const totalPagesFromApi = Number(pagination?.totalPages) || 1;

      if (totalPagesFromApi > 1) {
        const remaining = await Promise.all(
          Array.from({ length: totalPagesFromApi - 1 }, (_, i) =>
            getOverdueLoansReport(undefined, undefined, undefined, i + 1, 100)
              .then((r) => extractItems(r?.data).items)
              .catch(() => [])
          )
        );
        combined = combined.concat(...remaining);
      }

      setRows(combined);
      const inner = firstParsed.inner;
      setSummary(
        inner && typeof inner === "object" && !Array.isArray(inner) ? inner : null
      );
    } catch (error: any) {
      console.error("Error fetching overdue loans:", error);
      toast.error(error?.message || t("overDue.toast.fetchError"));
      setRows([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: any) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const formatNumber = (n: any) => {
    if (n === null || n === undefined || n === "") return "-";
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const mappedAndFiltered = useMemo(() => {
    const all = (rows || []).map((item: any) => ({
      loanAccountNumber: item.loanAccountNumber || item.loanId || item.applicationId || "-",
      customerId: item.customerId || "-",
      customerName: item.customerName || null,
      nationalId: item.nationalId || null,
      productName: item.productName || item.productCode || item.facilityType || "-",
      principalOverdue: item.principalOverdue ?? null,
      profitOverdue: item.profitOverdue ?? null,
      penaltyAmount: item.penaltyAmount ?? null,
      totalOverdue: item.totalOverdue ?? item.overdueAmount ?? item.amountOverdue ?? item.amount ?? null,
      daysPastDue: item.daysPastDue ?? item.dpd ?? null,
      dpdBucket: item.dpdBucket || null,
      oldestUnpaidDate: item.oldestUnpaidDate || item.dueDate || item.nextDueDate || null,
      status: item.status || item.paymentStatus || "-",
      currency: item.currency || "SAR",
    }));

    if (!debouncedSearch) return all;
    const term = debouncedSearch.toLowerCase();
    return all.filter((row: any) =>
      String(row.loanAccountNumber || "").toLowerCase().includes(term) ||
      String(row.customerId || "").toLowerCase().includes(term) ||
      String(row.customerName || "").toLowerCase().includes(term) ||
      String(row.nationalId || "").toLowerCase().includes(term) ||
      String(row.productName || "").toLowerCase().includes(term) ||
      String(row.dpdBucket || "").toLowerCase().includes(term) ||
      String(row.status || "").toLowerCase().includes(term)
    );
  }, [rows, debouncedSearch]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return mappedAndFiltered.slice(start, start + pageSize);
  }, [mappedAndFiltered, page, pageSize]);

  // Totals derived from the currently-visible (filtered) rows so the summary
  // cards always match what's in the table.
  const visibleTotals = useMemo(() => {
    const totalOverdueAmount = mappedAndFiltered.reduce(
      (acc: number, r: any) => acc + Number(r.totalOverdue ?? 0),
      0
    );
    return {
      totalLoans: mappedAndFiltered.length,
      totalOverdueAmount,
    };
  }, [mappedAndFiltered]);

  useEffect(() => {
    const total = mappedAndFiltered.length;
    setTotalRows(total);
    setTotalPage(Math.max(1, Math.ceil(total / pageSize)));
    setFrom(total > 0 ? (page - 1) * pageSize + 1 : 0);
    setTo(Math.min(page * pageSize, total));
  }, [mappedAndFiltered, page, pageSize]);

  const dpdBucketColor = (bucket: string | null) => {
    switch (String(bucket || "")) {
      case "1-30": return "#FAB65E";
      case "31-60": return "#F87E3D";
      case "61-90": return "#F85F54";
      case "90+":   return "#B71C1C";
      default:      return "#959595";
    }
  };

  const headers = [
    {
      name: t("overDue.col.loanAccountNo"),
      selector: (row: any) => row.loanAccountNumber,
      sortable: true,
      width: "180px",
    },
    {
      name: t("overDue.col.customer"),
      selector: (row: any) => row.customerName || row.customerId || "-",
      sortable: true,
    },
    {
      name: t("overDue.col.nationalId"),
      selector: (row: any) => row.nationalId || "-",
      sortable: true,
      width: "130px",
    },
    {
      name: t("overDue.col.product"),
      selector: (row: any) => row.productName,
      sortable: true,
      width: "140px",
    },
    {
      name: t("overDue.col.principalOverdue"),
      cell: (row: any) => (
        <span>{formatNumber(row.principalOverdue)}</span>
      ),
      sortable: true,
      width: "150px",
    },
    {
      name: t("overDue.col.profitOverdue"),
      cell: (row: any) => (
        <span>{formatNumber(row.profitOverdue)}</span>
      ),
      sortable: true,
      width: "140px",
    },
    {
      name: t("overDue.col.penalty"),
      cell: (row: any) => (
        <span>{formatNumber(row.penaltyAmount)}</span>
      ),
      sortable: true,
      width: "120px",
    },
    {
      name: t("overDue.col.totalOverdue"),
      cell: (row: any) => (
        <span style={{ fontWeight: 600 }}>
          {row.totalOverdue != null ? `${formatNumber(row.totalOverdue)} ${row.currency || ""}`.trim() : "-"}
        </span>
      ),
      sortable: true,
      width: "180px",
    },
    {
      name: t("overDue.col.dpd"),
      cell: (row: any) => (
        <div className="d-flex align-items-center gap-2" style={{ whiteSpace: "nowrap" }}>
          <span>{row.daysPastDue ?? "-"}</span>
          {row.dpdBucket && (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 2,
                fontSize: 11,
                backgroundColor: dpdBucketColor(row.dpdBucket),
                color: "white",
              }}
            >
              {row.dpdBucket}
            </span>
          )}
        </div>
      ),
      sortable: true,
      width: "150px",
    },
    {
      name: t("overDue.col.oldestUnpaid"),
      selector: (row: any) => formatDate(row.oldestUnpaidDate),
      sortable: true,
      width: "140px",
    },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "2px",
            fontSize: "12px",
            backgroundColor: /OVERDUE|DEFAULT|NPL/i.test(String(row.status))
              ? "#F85F54"
              : /ACTIVE|CURRENT|ON_TIME|PAID/i.test(String(row.status))
                ? "#92BC83"
                : "#959595",
            color: "white",
            whiteSpace: "nowrap",
          }}
        >
          {row.status || "-"}
        </span>
      ),
      width: "120px",
    },
  ];

  const exportToCSV = () => {
    if (!mappedAndFiltered.length) {
      toast.error(t("toast.noExportData"));
      return;
    }
    const csvHeaders = [
      "Loan Account No", "Customer ID", "Customer Name", "National ID",
      "Product", "Principal Overdue", "Profit Overdue", "Penalty",
      "Total Overdue", "Currency", "Days Past Due", "DPD Bucket",
      "Oldest Unpaid Date", "Status",
    ];
    const csvRows = [csvHeaders.join(",")];
    mappedAndFiltered.forEach((row: any) => {
      const values = [
        row.loanAccountNumber,
        row.customerId,
        row.customerName ?? "",
        row.nationalId ?? "",
        row.productName,
        row.principalOverdue ?? "",
        row.profitOverdue ?? "",
        row.penaltyAmount ?? "",
        row.totalOverdue ?? "",
        row.currency || "",
        row.daysPastDue ?? "",
        row.dpdBucket ?? "",
        formatDate(row.oldestUnpaidDate),
        row.status,
      ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`);
      csvRows.push(values.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `OverdueLoans_${dayjs().format("YYYYMMDD")}.csv`);
  };

  return (
    <div className="service col-12">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <CalendarX className="h-4 w-4" />
          </span>
          {t("overDue.title")}
        </h3>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
        <Input
          allowClear
          placeholder={t("overDue.searchPlaceholder")}
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
        />
        <button
          type="button"
          className="theme-btn-next"
          onClick={exportToCSV}
          disabled={!mappedAndFiltered.length}
          style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {t("action.exportCsv")}
        </button>
        </div>
      </div>

      {(mappedAndFiltered.length > 0 || summary) && (
        <Row gutter={[16, 16]} className="mb-3">
          {summary?.asOfDate && (
            <Col xs={24} sm={12} lg={8}>
              <div className="card-product p-4 text-dark h-100">
                <div style={{ fontSize: 14, fontWeight: 600 }}>{t("overDue.summary.asOfDate")}</div>
                <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                  {summary.asOfDate}
                </div>
              </div>
            </Col>
          )}
          <Col xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t("overDue.summary.totalLoans")}</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {visibleTotals.totalLoans}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t("overDue.summary.totalOverdue")}</div>
              <div
                className="mt-2"
                style={{ fontSize: 22, fontWeight: 700 }}
              >
                {formatNumber(visibleTotals.totalOverdueAmount)}
              </div>
            </div>
          </Col>
        </Row>
      )}

      <div
        className="pro-card"
      >
        <TableView
          header={headers}
          data={paginated}
          totalRows={totalRows}
          totalPage={totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          from={from}
          to={to}
          isLoading={loading}
          paginationShow={true}
        />
      </div>
    </div>
  );
};

export default OverDue;
