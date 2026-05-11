import { useEffect, useState, useMemo } from "react";
import TableView from "../TableView/TableView";
import { Col, DatePicker, Input, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import {
  getEarlySettlementReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const EarlySettlement = () => {
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
      toast.error(error?.message || "Failed to fetch early settlement report");
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
    { name: "Customer Name", selector: (row: any) => row.customerName },
    {
      name: "Original Amount",
      cell: (row: any) => <span>{formatNumber(row.originalAmount)}</span>,
    },
    {
      name: "Settlement Amount",
      cell: (row: any) => <span>{formatNumber(row.settlementAmount)}</span>,
    },
    {
      name: "Rebate/Discount",
      cell: (row: any) => (
        <span className="text-success">{formatNumber(row.rebateAmount)}</span>
      ),
    },
    {
      name: "Profit Saved",
      cell: (row: any) => <span>{formatNumber(row.profitSaved)}</span>,
    },
    {
      name: "Settlement Date",
      selector: (row: any) => formatDate(row.settlementDate),
    },
    {
      name: "Status",
      cell: (row: any) => {
        const color = String(row.status || "").toLowerCase() === "settled"
          ? "rgba(63,195,128,0.9)"
          : "#6c757d";
        return (
          <div
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
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
      toast.error("No data to export");
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
    <div className="col-12">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Early Settlement Report</h3>
      </div>

      <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
        <Input
          allowClear
          placeholder="Search by customer, loan, facility, status"
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
        />
        <DatePicker
          placeholder="From"
          value={fromDate}
          onChange={(d) => setFromDate(d)}
          format="YYYY-MM-DD"
          allowClear
          style={{ flex: "1 1 200px", minWidth: 180, height: 40, borderRadius: 8 }}
        />
        <DatePicker
          placeholder="To"
          value={toDate}
          onChange={(d) => setToDate(d)}
          format="YYYY-MM-DD"
          allowClear
          style={{ flex: "1 1 200px", minWidth: 180, height: 40, borderRadius: 8 }}
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
      </div>

      {(allCallActivity?.length > 0) && (
        <Row gutter={[16, 16]} className="mb-3">
          <Col xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Total Settlement Value</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {formatNumber(visibleTotals.totalSettlementAmount)} SAR
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Total Rebates Given</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {formatNumber(visibleTotals.totalRebateAmount)} SAR
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Settled Loans Count</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {visibleTotals.settledCount}
              </div>
            </div>
          </Col>
        </Row>
      )}

      <div
        className="bg-white"
        style={{
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
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
