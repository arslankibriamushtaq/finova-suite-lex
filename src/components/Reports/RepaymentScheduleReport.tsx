import { useEffect, useMemo, useState } from "react";
import TableView from "../TableView/TableView";
import { Col, Input, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import {
  getRepaymentScheduleReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const RepaymentScheduleReport = () => {
  // Default to the sample loan ID from the API contract so the page loads
  // something on first paint. Replace it with any valid loan ID via the input.
  const [loanId, setLoanId] = useState<string>(
    "550e8400-e29b-41d4-a716-446655440000"
  );
  const [allCallActivity, setAllCallActivity] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
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
    const trimmed = loanId.trim();
    if (!trimmed) {
      setAllCallActivity([]);
      setSummary(null);
      return;
    }
    try {
      setLoading(true);
      // Path-based endpoint: /reports/repayment-schedule/{loanId}
      const res = await getRepaymentScheduleReport(trimmed);

      if (res && res.data) {
        const responseData = res.data.data;
        if (Array.isArray(responseData)) {
          setAllCallActivity(responseData);
          setSummary(null);
        } else if (responseData) {
          const items =
            responseData.installments ||
            responseData.schedule ||
            responseData.items ||
            [];
          setAllCallActivity(Array.isArray(items) ? items : []);
          setSummary(responseData);
        }
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch repayment schedule report");
      setAllCallActivity([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanId]);

  const formatDate = (isoString: any) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return String(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatNumber = (n: any) => {
    if (n === null || n === undefined || n === "") return "-";
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const mappedData = useMemo(() => {
    const all = (allCallActivity || []).map((item: any) => ({
      installmentNo: item.installmentNo ?? item.installmentNumber ?? "-",
      dueDate: item.dueDate || null,
      principalDue: item.principalDue ?? null,
      profitOrInterestDue: item.profitOrInterestDue ?? item.interestDue ?? null,
      installmentAmount: item.installmentAmount ?? item.totalDue ?? null,
      remainingPrincipal: item.remainingPrincipal ?? item.outstandingBalance ?? null,
      penalty: item.penalty ?? null,
      status: item.status || "-",
      paymentDate: item.paymentDate || null,
    }));

    if (!debouncedSearch) return all;
    const term = debouncedSearch.toLowerCase();
    return all.filter((row: any) =>
      String(row.installmentNo).toLowerCase().includes(term) ||
      String(row.status).toLowerCase().includes(term) ||
      String(formatDate(row.dueDate)).toLowerCase().includes(term) ||
      String(formatDate(row.paymentDate)).toLowerCase().includes(term)
    );
  }, [allCallActivity, debouncedSearch]);

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
    { name: "Installment No.", selector: (row: any) => row.installmentNo },
    {
      name: "Principal Due",
      cell: (row: any) => <span>{formatNumber(row.principalDue)}</span>,
    },
    {
      name: "Profit/Interest Due",
      cell: (row: any) => <span>{formatNumber(row.profitOrInterestDue)}</span>,
    },
    {
      name: "Installment Amount",
      cell: (row: any) => <span>{formatNumber(row.installmentAmount)}</span>,
    },
    {
      name: "Remaining Principal",
      cell: (row: any) => <span>{formatNumber(row.remainingPrincipal)}</span>,
    },
    {
      name: "Penalty",
      cell: (row: any) => <span>{formatNumber(row.penalty)}</span>,
    },
    {
      name: "Due Date",
      selector: (row: any) => formatDate(row.dueDate),
    },
    {
      name: "Status",
      cell: (row: any) => {
        const color = (() => {
          switch (String(row.status || "").toLowerCase()) {
            case "paid":
            case "approved":
              return "rgba(63,195,128,0.9)";
            case "unpaid":
            case "rejected":
            case "reject":
              return "#F84D4D";
            case "pending":
              return "#FFC107";
            default:
              return "#6c757d";
          }
        })();
        return (
          <div
            style={{
              padding: "8px 10px",
              borderRadius: "32px",
              fontSize: "12px",
              backgroundColor: color,
              color: "white",
              display: "inline-block",
              textTransform: "capitalize",
              fontWeight: 500,
            }}
          >
            {row.status || "-"}
          </div>
        );
      },
    },
    {
      name: "Payment Date",
      selector: (row: any) => formatDate(row.paymentDate),
    },
  ];

  const exportToCSV = () => {
    if (!mappedData.length) {
      toast.error("No data to export");
      return;
    }
    const csvHeaders = [
      "Installment No.", "Due Date", "Principal Due", "Profit/Interest Due",
      "Installment Amount", "Remaining Principal", "Penalty", "Status", "Payment Date",
    ];
    const csvRows = [csvHeaders.join(",")];
    mappedData.forEach((r: any) => {
      const values = [
        r.installmentNo,
        formatDate(r.dueDate),
        r.principalDue ?? 0,
        r.profitOrInterestDue ?? 0,
        r.installmentAmount ?? 0,
        r.remainingPrincipal ?? 0,
        r.penalty ?? 0,
        r.status,
        formatDate(r.paymentDate),
      ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`);
      csvRows.push(values.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `RepaymentScheduleReport_${dayjs().format("YYYYMMDD")}.csv`);
  };

  return (
    <div className="col-12">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Repayment Schedule Report</h3>
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <Input
          allowClear
          placeholder="Search by installment, status, date"
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
        />
        <Input
          allowClear
          placeholder="Loan ID"
          value={loanId}
          onChange={(e) => setLoanId(e.target.value)}
          style={{ flex: "1 1 280px", minWidth: 240, borderRadius: 8, height: 40 }}
        />
        <button
          type="button"
          className="theme-btn-next"
          onClick={exportToCSV}
          disabled={!mappedData.length}
          style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          Export CSV
        </button>
      </div>

      {summary && (
        <Row gutter={[16, 16]} className="mb-3">
          {summary.disbursedPrincipal != null && (
            <Col xs={24} sm={12} lg={6}>
              <div className="card-product p-4 text-dark h-100">
                <div style={{ fontSize: 14, fontWeight: 600 }}>Disbursed Principal</div>
                <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                  {formatNumber(summary.disbursedPrincipal)} SAR
                </div>
              </div>
            </Col>
          )}
          {summary.totalProfit != null && (
            <Col xs={24} sm={12} lg={6}>
              <div className="card-product p-4 text-dark h-100">
                <div style={{ fontSize: 14, fontWeight: 600 }}>Total Profit</div>
                <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                  {formatNumber(summary.totalProfit)} SAR
                </div>
              </div>
            </Col>
          )}
          {summary.totalPayable != null && (
            <Col xs={24} sm={12} lg={6}>
              <div className="card-product p-4 text-dark h-100">
                <div style={{ fontSize: 14, fontWeight: 600 }}>Total Payable</div>
                <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                  {formatNumber(summary.totalPayable)} SAR
                </div>
              </div>
            </Col>
          )}
          {(summary.tenureMonths != null ||
            summary.numberOfInstallments != null ||
            summary.totalInstallments != null) && (
            <Col xs={24} sm={12} lg={6}>
              <div className="card-product p-4 text-dark h-100">
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {summary.tenureMonths != null ? "Tenure (Months)" : "Total Installments"}
                </div>
                <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                  {summary.tenureMonths ?? summary.numberOfInstallments ?? summary.totalInstallments}
                </div>
              </div>
            </Col>
          )}
        </Row>
      )}

      <div className="cs-table p-2">
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

export default RepaymentScheduleReport;
