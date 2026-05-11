import { useEffect, useMemo, useState } from "react";
import TableView from "../TableView/TableView";
import { Col, DatePicker, Input, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import {
  getDailyTransactionReport,
} from "../../redux/apis/apisCrudLms";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const DailyTransactionSummary = () => {
  const [targetDate, setTargetDate] = useState<any>(null);
  const [allCallActivity, setAllCallActivity] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
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
      // Only send `date` when the user picks one; otherwise hit the bare endpoint.
      const params = targetDate ? { date: targetDate.format("YYYY-MM-DD") } : undefined;
      const res = await getDailyTransactionReport(params);

      if (res && res.data) {
        const responseData = res.data?.data ?? res.data;
        const items =
          responseData?.channels ||
          responseData?.items ||
          (Array.isArray(responseData) ? responseData : []);
        setAllCallActivity(Array.isArray(items) ? items : []);
        setSummaryData(responseData && !Array.isArray(responseData) ? responseData : null);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch daily transaction summary");
      setAllCallActivity([]);
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  const formatNumber = (n: any) => {
    if (n === null || n === undefined || n === "") return "-";
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const mappedData = useMemo(() => {
    const all = (allCallActivity || []).map((item: any) => ({
      channel: item.channel?.replace(/_/g, " ") || "-",
      amount: item.amount ?? 0,
      count: item.count ?? 0,
    }));

    if (!debouncedSearch) return all;
    const term = debouncedSearch.toLowerCase();
    return all.filter((row: any) =>
      String(row.channel).toLowerCase().includes(term)
    );
  }, [allCallActivity, debouncedSearch]);

  // Visible totals derived from the filtered rows
  const visibleTotals = useMemo(() => {
    return mappedData.reduce(
      (acc: any, r: any) => ({
        totalAmount: acc.totalAmount + Number(r.amount ?? 0),
        totalCount: acc.totalCount + Number(r.count ?? 0),
        channelCount: acc.channelCount + 1,
      }),
      { totalAmount: 0, totalCount: 0, channelCount: 0 }
    );
  }, [mappedData]);

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
    {
      name: "Channel Name",
      cell: (row: any) => <span className="fw-bold">{row.channel}</span>,
    },
    { name: "Transaction Count", selector: (row: any) => row.count },
    {
      name: "Total Amount",
      cell: (row: any) => (
        <span className="text-primary fw-bold">{formatNumber(row.amount)} SAR</span>
      ),
    },
  ];

  const exportToCSV = () => {
    if (!mappedData.length) {
      toast.error("No data to export");
      return;
    }
    const csvHeaders = ["Channel Name", "Transaction Count", "Total Amount"];
    const csvRows = [csvHeaders.join(",")];
    mappedData.forEach((r: any) => {
      const values = [r.channel, r.count, r.amount ?? 0]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",");
      csvRows.push(values);
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `DailyTransactions_${dayjs().format("YYYYMMDD")}.csv`);
  };

  return (
    <div className="col-12">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Daily Transaction Summary</h3>
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
          placeholder="Search by channel"
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
        />
        <DatePicker
          placeholder="Transaction date"
          value={targetDate}
          onChange={(d) => setTargetDate(d)}
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

      {(allCallActivity.length > 0 || summaryData) && (
        <Row gutter={[16, 16]} className="mb-3">
          {summaryData?.totalCredits != null && (
            <Col xs={24} sm={12} lg={6}>
              <div className="card-product p-4 text-dark h-100">
                <div style={{ fontSize: 14, fontWeight: 600 }}>Total Credits</div>
                <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                  {formatNumber(summaryData.totalCredits)} SAR
                </div>
              </div>
            </Col>
          )}
          {summaryData?.totalDebits != null && (
            <Col xs={24} sm={12} lg={6}>
              <div className="card-product p-4 text-dark h-100">
                <div style={{ fontSize: 14, fontWeight: 600 }}>Total Debits</div>
                <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                  {formatNumber(summaryData.totalDebits)} SAR
                </div>
              </div>
            </Col>
          )}
          <Col xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Transaction Count</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {visibleTotals.totalCount}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="card-product p-4 text-dark h-100">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Channels</div>
              <div className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>
                {visibleTotals.channelCount}
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

export default DailyTransactionSummary;
